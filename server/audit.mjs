import { createHash, randomBytes } from "node:crypto";

/**
 * Audit events (`AuditEvent` in docs/DATA_MODEL.md).
 *
 * Append-only history of the actions support and security actually need to reconstruct:
 * login, forced logout, invite issued/accepted, entitlement granted, account deleted.
 *
 * Two rules are structural here, not left to the caller's memory:
 *
 * 1. NO CONTENT, NO CREDENTIALS. An event carries an action, a time, pseudonymous refs and a
 *    context built from a per-action allowlist of typed fields. Anything else a caller passes is
 *    dropped before the row is written, and the finished context is re-checked for email-shaped,
 *    token-shaped or free-text values. Private notes, drafts, submitted answers, magic-link and
 *    invite tokens therefore cannot reach an audit row even by accident.
 *
 * 2. THE ROW OUTLIVES THE PERSON WITHOUT NAMING THEM. Events never store a `userId`. They store
 *    `sub_<hash>` refs derived one-way from the id (`refFor`). While the account exists, support
 *    computes the ref from the live id and finds the history; once the account is deleted the ref
 *    is a dead pseudonym that joins to nothing — no user row, no membership, not even to the
 *    opaque `userId` kept inside a `PublicLock`. Account deletion (server/account.mjs) rewrites no
 *    audit row and removes none, so the security history of a deletion survives the deletion.
 *
 * Ids are 128-bit random values, so the unkeyed digest has no enumerable preimage and needs no
 * stored salt — which matters, because a stored salt would be one more secret to erase on delete.
 *
 * Storage: `state.auditEvents`. The collection is created on first write and tolerated absent, so
 * an older store file (or a store built before the collection was declared) still works.
 */

const AUDIT_COLLECTION = "auditEvents";

const REF_PREFIX = { user: "sub", workspace: "wsr", order: "ord" };

/** Written by the modules that own each action; the Manager wires the call sites. */
export const AUDIT_ACTIONS = Object.freeze([
  "login",
  "forced-logout",
  "invite-issued",
  "invite-accepted",
  "entitlement-granted",
  "gift-issued",
  "gift-redeemed",
  "referral-claimed",
  "referral-credited",
  "account-deleted"
]);

const boolean = (value) => (typeof value === "boolean" ? value : undefined);

const count = (value) => (Number.isInteger(value) && value >= 0 && value <= 1e6 ? value : undefined);

const oneOf = (...allowed) => (value) => (allowed.includes(value) ? value : undefined);

const oneOfOrNull = (...allowed) => (value) => (value === null || value === undefined ? null : allowed.includes(value) ? value : undefined);

/**
 * Per-action context allowlist. A field that is not listed here never reaches the store, and a
 * listed field is written only when its value passes the validator beside it. Adding a field is a
 * deliberate edit in this table, which is where the privacy review can see it.
 */
const CONTEXT_FIELDS = Object.freeze({
  "login": {
    method: oneOf("magic-link", "oauth"),
    provider: oneOfOrNull("kakao", "naver", "google"),
    replacedSession: boolean
  },
  "forced-logout": {
    reason: oneOf("new-login", "user-request", "support", "account-deleted"),
    sessionsEnded: count
  },
  "invite-issued": {
    reissue: boolean
  },
  "invite-accepted": {
    viaPairCode: boolean
  },
  "entitlement-granted": {
    source: oneOf("purchase", "webhook", "gift"),
    amount: count,
    currency: oneOf("KRW")
  },
  "gift-issued": {
    origin: oneOf("purchase", "referral")
  },
  "gift-redeemed": {
    origin: oneOf("purchase", "referral")
  },
  "referral-claimed": {},
  "referral-credited": {
    rewarded: boolean
  },
  "account-deleted": {
    partnerRemains: boolean,
    removedWorkspaces: count,
    archivedWorkspaces: count
  }
});

const EMAIL_SHAPED = /@/;
const TOKEN_SHAPED = /[A-Za-z0-9_-]{24,}/;
const MAX_CONTEXT_STRING = 32;

function createId(prefix, bytes = 16) {
  return `${prefix}_${randomBytes(bytes).toString("hex")}`;
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function digest(value) {
  return createHash("sha256").update(String(value), "utf8").digest("hex").slice(0, 32);
}

/**
 * One-way, stable pseudonym for an internal id. Same id in, same ref out, for the life of the
 * store; no way back from the ref to the id.
 */
export function refFor(kind, value) {
  const prefix = REF_PREFIX[kind];
  if (!prefix) throw new Error(`unknown ref kind: ${kind}`);
  if (typeof value !== "string" || !value.trim()) return null;
  return `${prefix}_${digest(`${kind}:${value.trim()}`)}`;
}

/** Last line of defence: nothing email-shaped, token-shaped or long enough to be prose. */
function isSafeContextValue(value) {
  if (typeof value === "boolean" || Number.isInteger(value) || value === null) return true;
  if (typeof value !== "string") return false;
  if (value.length > MAX_CONTEXT_STRING) return false;
  if (EMAIL_SHAPED.test(value)) return false;
  if (TOKEN_SHAPED.test(value)) return false;
  return true;
}

function buildContext(action, raw) {
  const fields = CONTEXT_FIELDS[action];
  const context = {};
  if (!fields || !raw || typeof raw !== "object") return context;
  for (const [key, validate] of Object.entries(fields)) {
    const value = validate(raw[key]);
    if (value === undefined) continue;
    if (!isSafeContextValue(value)) continue;
    context[key] = value;
  }
  return context;
}

function rows(state) {
  return Array.isArray(state[AUDIT_COLLECTION]) ? state[AUDIT_COLLECTION] : [];
}

/** Read-only projection of one stored row. */
function view(row) {
  return {
    id: row.id,
    at: row.at,
    action: row.action,
    actorRef: row.actorRef ?? null,
    subjectRef: row.subjectRef ?? null,
    workspaceRef: row.workspaceRef ?? null,
    orderRef: row.orderRef ?? null,
    context: { ...row.context }
  };
}

export function createAudit({ store, now = Date.now } = {}) {
  if (!store) throw new Error("store is required");

  /**
   * Appends one event. Never updates and never deletes: the only write this module performs is a
   * push, which is what makes the history append-only.
   */
  function record({ action, actorUserId = null, subjectUserId = null, workspaceId = null, orderId = null, context = {}, at = now() } = {}) {
    if (!AUDIT_ACTIONS.includes(action)) return { ok: false, error: "invalid-action" };
    const row = {
      id: createId("aud"),
      at: iso(at),
      action,
      actorRef: refFor("user", actorUserId),
      subjectRef: refFor("user", subjectUserId ?? actorUserId),
      workspaceRef: refFor("workspace", workspaceId),
      orderRef: refFor("order", orderId),
      context: buildContext(action, context)
    };
    store.mutate((state) => {
      if (!Array.isArray(state[AUDIT_COLLECTION])) state[AUDIT_COLLECTION] = [];
      state[AUDIT_COLLECTION].push(structuredClone(row));
    });
    return { ok: true, event: view(row) };
  }

  return {
    record,

    /** Support lookup: pass the live id, get the ref the history is written under. */
    refForUser(userId) {
      return refFor("user", userId);
    },

    refForWorkspace(workspaceId) {
      return refFor("workspace", workspaceId);
    },

    recordLogin({ userId, method = "magic-link", provider = null, replacedSession = false, at } = {}) {
      return record({
        action: "login",
        actorUserId: userId,
        context: { method, provider, replacedSession },
        at
      });
    },

    recordForcedLogout({ userId, reason = "new-login", sessionsEnded = 0, at } = {}) {
      return record({
        action: "forced-logout",
        actorUserId: userId,
        context: { reason, sessionsEnded },
        at
      });
    },

    recordInviteIssued({ userId, workspaceId, reissue = false, at } = {}) {
      return record({
        action: "invite-issued",
        actorUserId: userId,
        workspaceId,
        context: { reissue },
        at
      });
    },

    recordInviteAccepted({ userId, workspaceId, viaPairCode = false, at } = {}) {
      return record({
        action: "invite-accepted",
        actorUserId: userId,
        workspaceId,
        context: { viaPairCode },
        at
      });
    },

    recordEntitlementGranted({ workspaceId, orderId = null, source = "purchase", amount, currency = "KRW", userId = null, at } = {}) {
      return record({
        action: "entitlement-granted",
        actorUserId: userId,
        workspaceId,
        orderId,
        context: { source, amount, currency },
        at
      });
    },

    recordGiftIssued({ userId, origin = "purchase", at } = {}) {
      return record({
        action: "gift-issued",
        actorUserId: userId,
        context: { origin },
        at
      });
    },

    recordGiftRedeemed({ userId, workspaceId, origin = "purchase", at } = {}) {
      return record({
        action: "gift-redeemed",
        actorUserId: userId,
        workspaceId,
        context: { origin },
        at
      });
    },

    recordReferralClaimed({ userId, at } = {}) {
      return record({
        action: "referral-claimed",
        actorUserId: userId,
        context: {},
        at
      });
    },

    recordReferralCredited({ userId, rewarded = false, at } = {}) {
      return record({
        action: "referral-credited",
        actorUserId: userId,
        context: { rewarded },
        at
      });
    },

    recordAccountDeleted({ userId, partnerRemains = false, removedWorkspaces = 0, archivedWorkspaces = 0, at } = {}) {
      return record({
        action: "account-deleted",
        actorUserId: userId,
        context: { partnerRemains, removedWorkspaces, archivedWorkspaces },
        at
      });
    },

    /** Newest first. Filters take refs, never raw ids, so a caller cannot fish with an email. */
    list({ action = null, actorRef = null, subjectRef = null, workspaceRef = null, limit = 100 } = {}) {
      const max = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 1000) : 100;
      return rows(store.snapshot())
        .filter((row) => (!action || row.action === action)
          && (!actorRef || row.actorRef === actorRef)
          && (!subjectRef || row.subjectRef === subjectRef)
          && (!workspaceRef || row.workspaceRef === workspaceRef))
        .slice()
        .reverse()
        .slice(0, max)
        .map(view);
    },

    /** History for one live user, looked up by id and answered in refs. */
    listForUser(userId, { limit = 100 } = {}) {
      const subjectRef = refFor("user", userId);
      if (!subjectRef) return [];
      return this.list({ subjectRef, limit });
    },

    count() {
      return rows(store.snapshot()).length;
    }
  };
}
