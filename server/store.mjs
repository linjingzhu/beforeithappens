import { createSqliteStore, resolveStorePaths } from "./store-sqlite.mjs";

export function emptyState() {
  return {
    users: [],
    identities: [],
    magicLinks: [],
    sessions: [],
    workspaces: [],
    members: [],
    invitations: [],
    answerRounds: [],
    answers: [],
    privateNotes: [],
    agreements: [],
    publicLocks: [],
    progress: [],
    purchases: [],
    entitlements: [],
    webhookEvents: [],
    auditEvents: [],
    reportSnapshots: []
  };
}

export function createMemoryStore(initial = emptyState()) {
  let state = structuredClone(initial);
  return {
    snapshot() {
      return structuredClone(state);
    },
    mutate(writer) {
      writer(state);
    }
  };
}

/**
 * The durable store. Same two methods as the memory store, but every mutation is one
 * SQLite transaction: a crash cannot leave a half-written state, two processes writing
 * at the same moment cannot lose each other's rows, and the uniqueness documented in
 * docs/DATA_MODEL.md is enforced by the database.
 *
 * A `.json` path keeps working: the database lives beside it as `.sqlite` and the old
 * JSON file is imported once, then left untouched as a cold backup.
 */
export async function createFileStore(filePath) {
  const { dbPath, jsonPath } = resolveStorePaths(filePath);
  return createSqliteStore(dbPath, { importJsonFrom: jsonPath });
}

export { createSqliteStore, resolveStorePaths };
