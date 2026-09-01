import { createHash } from "node:crypto";

/**
 * Report snapshots (`ReportSnapshot` in docs/DATA_MODEL.md).
 *
 * A reproducible record of what one couple actually decided, fixed to one pack version:
 * submitted selections, the comparison outcome, and the agreement and its status.
 *
 * THE PRIVATE-NOTE BOUNDARY IS THE QUERY PATH, NOT THE VIEW.
 *
 * "Private notes have a separate authorization path and never join report queries." That holds
 * today only because every author remembered it. Here it is structural: report content is
 * assembled exclusively from `readSharedState(store)`, a reader that exposes the shared
 * collections and throws on every other one. `state.privateNotes` and `state.answers` are not
 * merely unused — they are unreachable, so a later edit that tries to join notes (or drafts) into
 * a report fails loudly the first time it runs instead of quietly leaking. See
 * test/report.test.js, which asserts exactly that.
 *
 * Note that `answers` is excluded too. Drafts and unsubmitted selections live there; the report
 * reads submitted selections from `publicLocks`, the immutable snapshot written at reveal, which
 * by construction contains only what both partners chose to submit.
 *
 * Identity resolution (session -> workspace) happens once, in the authorization path, before any
 * content is read. The content builder is handed a `workspaceId` and nothing else, so it has no
 * session, no user row and no way to widen its own access.
 *
 * Comparison vocabulary is fixed by docs/PRODUCT_SPEC.md: ALIGNED / CLOSE / DISCUSS / NEUTRAL /
 * UNRATED. No scores, no diagnosis, no probability. A round with no usable comparison rule is
 * UNRATED; it is never guessed into DISCUSS.
 *
 * Storage: `state.reportSnapshots`. Created on first write and tolerated absent.
 */

const SNAPSHOT_COLLECTION = "reportSnapshots";

/** The only collections a report query may read. Everything else throws. */
export const SHARED_COLLECTIONS = Object.freeze(["workspaces", "publicLocks", "agreements"]);

export const COMPARISON_OUTCOMES = Object.freeze(["ALIGNED", "CLOSE", "DISCUSS", "NEUTRAL", "UNRATED"]);

export const AGREEMENT_STATUSES = Object.freeze(["AGREED", "DEFERRED", "PENDING", "NONE"]);

/** Stored lock comparison keys -> the fixed report vocabulary. Anything else is UNRATED. */
const COMPARISON_BY_KEY = Object.freeze({
  aligned: "ALIGNED",
  close: "CLOSE",
  discuss: "DISCUSS",
  neutral: "NEUTRAL",
  unrated: "UNRATED"
});

/**
 * The report's window on the store. Reading any collection outside SHARED_COLLECTIONS throws,
 * which is what turns "never join private notes" from a convention into a property of the code.
 */
export function readSharedState(store) {
  const raw = store.snapshot();
  const shared = {};
  for (const key of SHARED_COLLECTIONS) shared[key] = Array.isArray(raw[key]) ? raw[key] : [];
  return new Proxy(shared, {
    get(target, property) {
      if (typeof property === "symbol") return target[property];
      if (!SHARED_COLLECTIONS.includes(property)) {
        throw new Error(`report queries may not read "${property}": shared content only`);
      }
      return target[property];
    },
    has(target, property) {
      return typeof property === "string" && SHARED_COLLECTIONS.includes(property) && property in target;
    },
    set() {
      throw new Error("report queries are read-only");
    },
    deleteProperty() {
      throw new Error("report queries are read-only");
    }
  });
}

function iso(ms) {
  return new Date(ms).toISOString();
}

/** Stable JSON so the same content always hashes to the same snapshot id. */
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}

function hashOf(value) {
  return createHash("sha256").update(canonical(value), "utf8").digest("hex").slice(0, 32);
}

function comparisonOutcome(lock) {
  const key = String(lock?.comparison?.key || "").toLowerCase();
  const mapped = COMPARISON_BY_KEY[key];
  if (mapped) return mapped;
  const a = lock?.submissions?.a?.choice ?? null;
  const b = lock?.submissions?.b?.choice ?? null;
  if (a && b && a === b) return "ALIGNED";
  return "UNRATED";
}

/**
 * Maps a stored agreement onto the shared vocabulary. Mirrors `buildSharedResults` in
 * src/state.js: an agreement counts as AGREED only when two different people proposed and
 * approved a non-empty text, and only an AGREED text is carried into the report.
 */
function agreementView(agreement, lock) {
  const empty = { status: "NONE", text: "", proposedBy: null, approvedBy: null };
  if (!agreement) return empty;
  const roleOf = (userId) => {
    if (!userId) return null;
    if (userId === lock?.submissions?.a?.userId) return "a";
    if (userId === lock?.submissions?.b?.userId) return "b";
    return null;
  };
  const text = typeof agreement.proposal === "string" ? agreement.proposal : "";
  const proposedBy = roleOf(agreement.proposedByUserId);
  const approvedBy = roleOf(agreement.approvedByUserId);
  const agreed = agreement.status === "agreed"
    && Boolean(text.trim())
    && proposedBy !== null
    && approvedBy !== null
    && proposedBy !== approvedBy;
  if (agreed) return { status: "AGREED", text, proposedBy, approvedBy };
  if (agreement.status === "deferred") return { status: "DEFERRED", text: "", proposedBy: null, approvedBy: null };
  if (agreement.status === "pending" && Boolean(text.trim()) && proposedBy !== null) {
    return { status: "PENDING", text: "", proposedBy, approvedBy: null };
  }
  return empty;
}

function tally(items, key, values) {
  return Object.fromEntries(values.map((value) => [value, items.filter((item) => item[key] === value).length]));
}

export function createReport({ store, now = Date.now, questionIds = [], pack = {} } = {}) {
  if (!store) throw new Error("store is required");

  function requirePaired(sessionId) {
    const state = store.snapshot();
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return { ok: false, error: "unauthenticated" };
    const user = state.users.find((item) => item.id === session.userId);
    if (!user) return { ok: false, error: "unauthenticated" };
    const membership = state.members.find((member) => {
      if (member.userId !== user.id || member.status !== "accepted") return false;
      return state.workspaces.find((item) => item.id === member.workspaceId)?.status === "active";
    });
    if (!membership) return { ok: false, error: "forbidden" };
    const partners = state.members.filter((member) =>
      member.workspaceId === membership.workspaceId && member.status === "accepted"
    );
    if (partners.length < 2) return { ok: false, error: "locked" };
    // Only the workspace id crosses into the content path.
    return { ok: true, workspaceId: membership.workspaceId };
  }

  /**
   * Builds the snapshot for one workspace and one pack version. Pure read, no write, and no
   * access to anything but the shared collections.
   */
  function buildForWorkspace(workspaceId, { packVersion = pack.version ?? null, at = now() } = {}) {
    if (!workspaceId) return { ok: false, error: "invalid-workspace" };
    const shared = readSharedState(store);
    const workspace = shared.workspaces.find((row) => row.id === workspaceId);
    if (!workspace) return { ok: false, error: "invalid-workspace" };
    const version = packVersion ?? null;

    const locksForVersion = shared.publicLocks.filter((row) =>
      row.workspaceId === workspaceId && (row.packVersion ?? null) === version
    );

    const latestByQuestion = new Map();
    const roundsByQuestion = new Map();
    for (const lock of locksForVersion) {
      roundsByQuestion.set(lock.questionId, (roundsByQuestion.get(lock.questionId) || 0) + 1);
      const best = latestByQuestion.get(lock.questionId);
      if (!best || lock.roundNumber > best.roundNumber) latestByQuestion.set(lock.questionId, lock);
    }

    const known = questionIds.filter((id) => latestByQuestion.has(id));
    const extra = [...latestByQuestion.keys()].filter((id) => !questionIds.includes(id)).sort();
    const ordered = [...known, ...extra];

    const items = ordered.map((questionId) => {
      const lock = latestByQuestion.get(questionId);
      const agreement = shared.agreements.find((row) =>
        row.workspaceId === workspaceId
        && row.questionId === questionId
        && row.roundNumber === lock.roundNumber
      ) || null;
      return {
        questionId,
        roundNumber: lock.roundNumber,
        lockedAt: lock.lockedAt,
        supersededRounds: Math.max(0, (roundsByQuestion.get(questionId) || 1) - 1),
        submittedChoices: {
          a: lock.submissions?.a?.choice ?? null,
          b: lock.submissions?.b?.choice ?? null
        },
        comparison: comparisonOutcome(lock),
        agreement: agreementView(agreement, lock)
      };
    });

    const totals = {
      questions: questionIds.length,
      recorded: items.length,
      comparison: tally(items, "comparison", COMPARISON_OUTCOMES),
      agreement: tally(items.map((item) => ({ status: item.agreement.status })), "status", AGREEMENT_STATUSES)
    };

    const content = { workspaceId, packId: pack.id ?? null, packVersion: version, items, totals };
    const contentHash = hashOf(content);
    return {
      ok: true,
      report: {
        id: `rep_${contentHash}`,
        contentHash,
        workspaceId,
        packId: pack.id ?? null,
        packVersion: version,
        generatedAt: iso(at),
        complete: questionIds.length > 0 && items.length === questionIds.length,
        totals,
        items
      }
    };
  }

  function storedRows() {
    const state = store.snapshot();
    return Array.isArray(state[SNAPSHOT_COLLECTION]) ? state[SNAPSHOT_COLLECTION] : [];
  }

  /** Append-only: an identical report is returned as the row already written, never duplicated. */
  function persist(report) {
    const existing = storedRows().find((row) => row.id === report.id);
    if (existing) return { ...structuredClone(existing), reused: true };
    store.mutate((state) => {
      if (!Array.isArray(state[SNAPSHOT_COLLECTION])) state[SNAPSHOT_COLLECTION] = [];
      if (state[SNAPSHOT_COLLECTION].some((row) => row.id === report.id)) return;
      state[SNAPSHOT_COLLECTION].push(structuredClone(report));
    });
    return { ...structuredClone(report), reused: false };
  }

  return {
    buildForWorkspace,

    /** Live view for a signed-in member. Reads only; nothing is stored. */
    viewFor(sessionId, { packVersion } = {}) {
      const access = requirePaired(sessionId);
      if (!access.ok) return access;
      return buildForWorkspace(access.workspaceId, packVersion === undefined ? {} : { packVersion });
    },

    /** Freezes the current report into `reportSnapshots`. Same content, same id, one row. */
    generate(sessionId, { packVersion } = {}) {
      const access = requirePaired(sessionId);
      if (!access.ok) return access;
      const built = buildForWorkspace(access.workspaceId, packVersion === undefined ? {} : { packVersion });
      if (!built.ok) return built;
      const saved = persist(built.report);
      return { ok: true, report: saved, reused: saved.reused === true };
    },

    /** Stored snapshots for the caller's workspace, newest first. */
    listFor(sessionId) {
      const access = requirePaired(sessionId);
      if (!access.ok) return access;
      const rows = storedRows()
        .filter((row) => row.workspaceId === access.workspaceId)
        .slice()
        .reverse()
        .map((row) => ({
          id: row.id,
          contentHash: row.contentHash,
          packId: row.packId,
          packVersion: row.packVersion,
          generatedAt: row.generatedAt,
          recorded: row.totals?.recorded ?? 0
        }));
      return { ok: true, reports: rows };
    }
  };
}
