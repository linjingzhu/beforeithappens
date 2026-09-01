// Durable store engine.
//
// The state the server works with is still one plain object of arrays, and callers
// still only see `snapshot()` / `mutate(writer)`. What changed is underneath: every
// mutation is a single SQLite transaction on a WAL database instead of a whole-file
// rewrite, so a crash mid-write cannot truncate the state, two processes writing at
// the same moment cannot lose each other's rows, and the uniqueness `docs/DATA_MODEL.md`
// promises is enforced by the database rather than by hopeful application checks.
//
// Zero runtime dependencies: `node:sqlite` ships with Node 22.

import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

const SCHEMA_VERSION = 1;

// One entry per collection in `emptyState()`.
// `key`     — fields that identify a row across mutations (defaults to ["id"]).
// `unique`  — indexes enforced by SQLite itself.
//             `nonBlank` skips NULL/"" (an OAuth user may legitimately have no email yet).
//             `coalesce` folds a missing field to "" so a NULL cannot slip past the index
//             (SQLite treats NULLs as distinct); `AnswerRound` has no `userId`, so the
//             documented (workspaceId, questionId, roundNumber, userId) tuple degrades
//             to the three-field round slot there, which is exactly what the code means.
export const COLLECTIONS = {
  users: { unique: [{ name: "users_email", fields: ["email"], nonBlank: true }] },
  identities: {},
  magicLinks: {},
  sessions: {},
  workspaces: {},
  members: {},
  invitations: { unique: [{ name: "invitations_token", fields: ["tokenHash"], nonBlank: true }] },
  answerRounds: {
    unique: [{
      name: "answer_rounds_slot",
      fields: ["workspaceId", "questionId", "roundNumber", "userId"],
      coalesce: true
    }]
  },
  answers: {
    unique: [{
      name: "answers_slot",
      fields: ["workspaceId", "questionId", "roundNumber", "userId"],
      coalesce: true
    }]
  },
  privateNotes: {},
  agreements: {},
  publicLocks: {},
  progress: { key: ["workspaceId", "userId"] },
  purchases: { unique: [{ name: "purchases_order", fields: ["orderId"], nonBlank: true }] },
  entitlements: {},
  webhookEvents: { unique: [{ name: "webhook_events_event", fields: ["eventId"], nonBlank: true }] },
  auditEvents: {},
  // The id is a content hash: regenerating an identical report reuses the row, it never
  // duplicates it, and the index says so at the database level rather than in a caller.
  reportSnapshots: { unique: [{ name: "report_snapshots_id", fields: ["id"], nonBlank: true }] }
};

export const collectionNames = Object.keys(COLLECTIONS);

const SAFE_NAME = /^[A-Za-z][A-Za-z0-9_]*$/;

function assertSafeName(value) {
  if (!SAFE_NAME.test(value)) throw new Error(`unsafe sqlite identifier: ${value}`);
  return value;
}

function jsonColumnSql(field, coalesce) {
  const path = `'$.${assertSafeName(field)}'`;
  return coalesce ? `coalesce(json_extract(data, ${path}), '')` : `json_extract(data, ${path})`;
}

function tableSql(name) {
  const spec = COLLECTIONS[name];
  const generated = new Map();
  for (const index of spec.unique || []) {
    for (const field of index.fields) {
      generated.set(field, jsonColumnSql(field, Boolean(index.coalesce)));
    }
  }
  const columns = [
    "seq INTEGER PRIMARY KEY AUTOINCREMENT",
    "row_key TEXT NOT NULL UNIQUE",
    "pos INTEGER NOT NULL",
    "data TEXT NOT NULL"
  ];
  for (const [field, expression] of generated) {
    columns.push(`"${field}" TEXT GENERATED ALWAYS AS (${expression}) VIRTUAL`);
  }
  return `CREATE TABLE IF NOT EXISTS "${assertSafeName(name)}" (\n  ${columns.join(",\n  ")}\n)`;
}

function indexSql(name) {
  const statements = [];
  for (const index of COLLECTIONS[name].unique || []) {
    const columns = index.fields.map((field) => `"${assertSafeName(field)}"`).join(", ");
    const where = index.nonBlank
      ? ` WHERE ${index.fields.map((field) => `"${field}" IS NOT NULL AND "${field}" <> ''`).join(" AND ")}`
      : "";
    statements.push(
      `CREATE UNIQUE INDEX IF NOT EXISTS "${assertSafeName(index.name)}" ON "${name}" (${columns})${where}`
    );
  }
  statements.push(`CREATE INDEX IF NOT EXISTS "${name}_pos" ON "${name}" (pos)`);
  return statements;
}

function keyFieldsFor(name) {
  return COLLECTIONS[name].key || ["id"];
}

function rowKeyOf(row, fields) {
  if (!row || typeof row !== "object") return null;
  const parts = [];
  for (const field of fields) {
    const value = row[field];
    if (typeof value !== "string" && typeof value !== "number") return null;
    parts.push(String(value));
  }
  return JSON.stringify(parts);
}

function normalizeRows(name, value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  throw new Error(`store: "${name}" must be an array, received ${typeof value}`);
}

function emptyCollections() {
  const state = {};
  for (const name of collectionNames) state[name] = [];
  return state;
}

function isConstraintError(error) {
  return typeof error?.message === "string" && error.message.includes("constraint failed");
}

/**
 * Open (or create) a durable store at `dbPath`.
 *
 * options.importJsonFrom — path to a legacy JSON store file. Imported once, inside a
 * single transaction, the first time this database is opened; the JSON file itself is
 * left untouched so a deployment keeps its old file as a cold backup.
 */
export function createSqliteStore(dbPath, { importJsonFrom = null } = {}) {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  // busy_timeout first: switching journal mode needs a brief exclusive lock, and a second
  // process opening the same database at the same moment must wait rather than fail.
  db.exec("PRAGMA busy_timeout = 10000");
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA synchronous = FULL");

  db.exec(`CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`);
  db.exec(`CREATE TABLE IF NOT EXISTS import_conflicts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection TEXT NOT NULL,
    reason TEXT NOT NULL,
    data TEXT NOT NULL,
    at TEXT NOT NULL
  )`);
  for (const name of collectionNames) {
    db.exec(tableSql(name));
    for (const statement of indexSql(name)) db.exec(statement);
  }

  const readMeta = db.prepare("SELECT value FROM meta WHERE key = ?");
  const writeMeta = db.prepare("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  const storedVersion = readMeta.get("schema_version")?.value;
  if (storedVersion && Number(storedVersion) > SCHEMA_VERSION) {
    db.close();
    throw new Error(`store: database at ${dbPath} was written by a newer schema (${storedVersion})`);
  }
  writeMeta.run("schema_version", String(SCHEMA_VERSION));

  const statements = new Map();
  for (const name of collectionNames) {
    statements.set(name, {
      selectAll: db.prepare(`SELECT row_key, pos, data FROM "${name}" ORDER BY pos, seq`),
      insert: db.prepare(`INSERT INTO "${name}" (row_key, pos, data) VALUES (?, ?, ?)`),
      update: db.prepare(`UPDATE "${name}" SET pos = ?, data = ? WHERE row_key = ?`),
      remove: db.prepare(`DELETE FROM "${name}" WHERE row_key = ?`),
      clear: db.prepare(`DELETE FROM "${name}"`)
    });
  }
  const dataVersionStatement = db.prepare("PRAGMA data_version");
  const recordConflict = db.prepare(
    "INSERT INTO import_conflicts (collection, reason, data, at) VALUES (?, ?, ?, ?)"
  );

  let inTransaction = false;
  let state = emptyCollections();
  // collection -> Map(row_key -> { pos, json }) mirroring what is on disk right now.
  let persisted = new Map();
  let lastDataVersion = 0;

  const dataVersion = () => Number(dataVersionStatement.get().data_version);

  function beginRead() {
    if (inTransaction) return false;
    db.exec("BEGIN DEFERRED");
    inTransaction = true;
    return true;
  }

  function endRead(opened) {
    if (!opened) return;
    db.exec("COMMIT");
    inTransaction = false;
  }

  function reload() {
    const opened = beginRead();
    try {
      const next = emptyCollections();
      const nextPersisted = new Map();
      for (const name of collectionNames) {
        const mirror = new Map();
        for (const row of statements.get(name).selectAll.all()) {
          next[name].push(JSON.parse(row.data));
          mirror.set(row.row_key, { pos: Number(row.pos), json: row.data });
        }
        nextPersisted.set(name, mirror);
      }
      state = next;
      persisted = nextPersisted;
      lastDataVersion = dataVersion();
    } finally {
      endRead(opened);
    }
  }

  function refreshIfStale() {
    if (dataVersion() !== lastDataVersion) reload();
  }

  function persistCollection(name) {
    const rows = normalizeRows(name, state[name]);
    const mirror = persisted.get(name);
    const fields = keyFieldsFor(name);
    let keys = rows.map((row) => rowKeyOf(row, fields));
    const positional = keys.some((key) => key === null) || new Set(keys).size !== keys.length;
    if (positional) keys = rows.map((_, index) => `#${index}`);
    const serialized = rows.map((row) => JSON.stringify(row));
    const sql = statements.get(name);

    if (positional) {
      // No stable identity for these rows (or duplicate ids): rewrite the collection.
      const unchanged = mirror.size === rows.length
        && keys.every((key, index) => mirror.get(key)?.json === serialized[index]);
      if (unchanged) return;
      sql.clear.run();
      mirror.clear();
      for (let index = 0; index < rows.length; index += 1) {
        sql.insert.run(keys[index], index, serialized[index]);
        mirror.set(keys[index], { pos: index, json: serialized[index] });
      }
      return;
    }

    const live = new Set(keys);
    for (const key of [...mirror.keys()]) {
      if (live.has(key)) continue;
      sql.remove.run(key);
      mirror.delete(key);
    }
    for (let index = 0; index < rows.length; index += 1) {
      const key = keys[index];
      const json = serialized[index];
      const current = mirror.get(key);
      if (!current) {
        sql.insert.run(key, index, json);
        mirror.set(key, { pos: index, json });
        continue;
      }
      if (current.json === json && current.pos === index) continue;
      sql.update.run(index, json, key);
      current.json = json;
      current.pos = index;
    }
  }

  function persist() {
    for (const key of Object.keys(state)) {
      if (COLLECTIONS[key]) continue;
      const rows = state[key];
      if (Array.isArray(rows) && rows.length > 0) {
        throw new Error(`store: unknown collection "${key}" has ${rows.length} rows and cannot be persisted`);
      }
    }
    for (const name of collectionNames) persistCollection(name);
  }

  function importJson(path) {
    if (!path || !existsSync(path)) return null;
    if (readMeta.get("json_import")) return null;
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
      throw new Error(`store: cannot import ${path}: ${error.message}`);
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`store: ${path} does not contain a state object`);
    }
    const at = new Date().toISOString();
    const summary = { path, at, imported: 0, conflicts: 0, skippedKeys: [] };
    db.exec("BEGIN IMMEDIATE");
    inTransaction = true;
    try {
      for (const key of Object.keys(parsed)) {
        if (!COLLECTIONS[key]) {
          summary.skippedKeys.push(key);
          recordConflict.run(key, "unknown-collection", JSON.stringify(parsed[key]), at);
          summary.conflicts += 1;
          continue;
        }
        const rows = Array.isArray(parsed[key]) ? parsed[key] : [];
        const fields = keyFieldsFor(key);
        const sql = statements.get(key);
        let position = 0;
        for (const row of rows) {
          const json = JSON.stringify(row);
          const key_ = rowKeyOf(row, fields) ?? `#${position}`;
          try {
            sql.insert.run(key_, position, json);
            position += 1;
            summary.imported += 1;
          } catch (error) {
            if (!isConstraintError(error)) throw error;
            // The JSON store enforced nothing, so a live file may already hold rows the
            // documented uniqueness forbids. Keep the first one, park the rest where they
            // can still be read, and let the deployment boot.
            recordConflict.run(key, error.message, json, at);
            summary.conflicts += 1;
          }
        }
      }
      writeMeta.run("json_import", JSON.stringify(summary));
      db.exec("COMMIT");
      inTransaction = false;
    } catch (error) {
      db.exec("ROLLBACK");
      inTransaction = false;
      throw error;
    }
    return summary;
  }

  const importSummary = importJsonFrom ? importJson(importJsonFrom) : null;
  reload();

  return {
    snapshot() {
      refreshIfStale();
      return { ...emptyCollections(), ...structuredClone(state) };
    },

    mutate(writer) {
      if (inTransaction) {
        // Nothing in the server nests these today; if something starts to, say so plainly
        // instead of failing with "cannot start a transaction within a transaction".
        throw new Error("store: mutate() cannot be called from inside another mutate()");
      }
      db.exec("BEGIN IMMEDIATE");
      inTransaction = true;
      let committed = false;
      try {
        // Another process may have committed since our last read; the writer must see it.
        if (dataVersion() !== lastDataVersion) reload();
        writer(state);
        persist();
        db.exec("COMMIT");
        inTransaction = false;
        committed = true;
        lastDataVersion = dataVersion();
      } finally {
        if (!committed) {
          try {
            db.exec("ROLLBACK");
          } catch {
            // the transaction was already gone
          }
          inTransaction = false;
          // A rejected write must not survive in memory either.
          reload();
        }
      }
    },

    // Additive, for operators and tests. Callers of the store never need these.
    dbPath,
    importSummary,
    conflicts() {
      return db.prepare("SELECT collection, reason, data, at FROM import_conflicts ORDER BY id").all();
    },
    close() {
      db.close();
    }
  };
}

/** `x.json` becomes `x.sqlite` next to it; any other path is used as given. */
export function resolveStorePaths(filePath) {
  if (/\.json$/i.test(filePath)) {
    return { dbPath: filePath.replace(/\.json$/i, ".sqlite"), jsonPath: filePath };
  }
  return { dbPath: filePath, jsonPath: null };
}
