import test from "node:test";
import assert from "node:assert/strict";
import { AUDIT_ACTIONS, createAudit, refFor } from "../server/audit.mjs";
import { createAccount } from "../server/account.mjs";
import { createAuth } from "../server/auth.mjs";
import { createEntitlement } from "../server/entitlement.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";

const pack = { id: "marriage-preparation", version: "2026.08-preview.2" };

function system() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const account = createAccount({ store });
  const entitlement = createEntitlement({ store, pack });
  const audit = createAudit({ store });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  function login(email) {
    return auth.consumeMagicLink(auth.requestMagicLink(email).token);
  }
  function pair() {
    const buyer = login("buyer@example.com");
    const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
    const partner = login("partner@example.com");
    assert.equal(couple.acceptInvite(partner.sessionId, invite.token).ok, true);
    return { buyer, partner, invite };
  }
  return { store, couple, account, entitlement, audit, auth, login, pair };
}

function userIdOf(store, email) {
  return store.snapshot().users.find((row) => row.email === email)?.id || "";
}

test("the audit collection is tolerated absent and appended to on first write", () => {
  // emptyState now declares auditEvents, so absence is forced here: the module must still
  // cope with a store that predates the collection, such as a JSON file written before it.
  const { store, audit } = system();
  store.mutate((state) => { delete state.auditEvents; });
  assert.equal(Array.isArray(store.snapshot().auditEvents), false);
  assert.equal(audit.count(), 0);
  assert.deepEqual(audit.list(), []);

  const written = audit.recordLogin({ userId: "usr_abc", method: "magic-link" });
  assert.equal(written.ok, true);
  assert.equal(store.snapshot().auditEvents.length, 1);
  assert.equal(audit.count(), 1);
});

test("every documented action is recordable and anything else is refused", () => {
  const { audit } = system();
  assert.deepEqual([...AUDIT_ACTIONS], [
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
  for (const action of AUDIT_ACTIONS) {
    assert.equal(audit.record({ action, actorUserId: "usr_1" }).ok, true, action);
  }
  assert.equal(audit.count(), AUDIT_ACTIONS.length);
  assert.equal(audit.record({ action: "note-read" }).error, "invalid-action");
  assert.equal(audit.record({}).error, "invalid-action");
  assert.equal(audit.count(), AUDIT_ACTIONS.length);
});

test("an event never carries a note, an answer, an email or a token", () => {
  const { audit } = system();
  audit.record({
    action: "login",
    actorUserId: "usr_1",
    context: {
      method: "magic-link",
      provider: "kakao",
      replacedSession: true,
      // Everything below is what a careless caller might hand over.
      email: "buyer@example.com",
      token: "1f9c0d8b7a6e5f4c3b2a19087f6e5d4c",
      privateNote: "우리 부모님 이야기는 아직 못 했다",
      submittedChoice: "q1-a",
      note: "free text",
      sessionId: "ses_7f6e5d4c3b2a19087f6e5d4c3b2a1908"
    }
  });
  const [event] = audit.list();
  assert.deepEqual(event.context, { method: "magic-link", provider: "kakao", replacedSession: true });

  const serialized = JSON.stringify(audit.list());
  for (const leak of ["buyer@example.com", "1f9c0d8b", "부모님", "q1-a", "free text", "ses_7f6e"]) {
    assert.equal(serialized.includes(leak), false, `audit leaked ${leak}`);
  }
  assert.equal(serialized.includes("@"), false);
});

test("a context value outside its type or vocabulary is dropped, not stored", () => {
  const { audit } = system();
  audit.record({
    action: "entitlement-granted",
    workspaceId: "ws_1",
    orderId: "ord_1",
    context: { source: "refund", amount: "29000원", currency: "KRW", extra: true }
  });
  assert.deepEqual(audit.list()[0].context, { currency: "KRW" });

  audit.recordForcedLogout({ userId: "usr_1", reason: "because", sessionsEnded: -3 });
  assert.deepEqual(audit.list()[0].context, {});

  audit.recordEntitlementGranted({ workspaceId: "ws_1", orderId: "ord_1", source: "webhook", amount: 29000 });
  assert.deepEqual(audit.list()[0].context, { source: "webhook", amount: 29000, currency: "KRW" });
});

test("events name people by one-way ref, never by id", () => {
  const { audit } = system();
  const userId = "usr_2b1a09876f5e4d3c2b1a09876f5e4d3c";
  const workspaceId = "ws_09876f5e4d3c2b1a09876f5e4d3c2b1a";
  audit.recordInviteIssued({ userId, workspaceId, reissue: true });
  const [event] = audit.list();

  assert.equal(event.actorRef, refFor("user", userId));
  assert.equal(event.subjectRef, refFor("user", userId));
  assert.equal(event.workspaceRef, refFor("workspace", workspaceId));
  assert.match(event.actorRef, /^sub_[0-9a-f]{32}$/);
  assert.match(event.workspaceRef, /^wsr_[0-9a-f]{32}$/);

  const serialized = JSON.stringify(audit.list());
  assert.equal(serialized.includes(userId), false);
  assert.equal(serialized.includes(workspaceId), false);
  // A ref is stable for lookup and specific to one id.
  assert.equal(refFor("user", userId), audit.refForUser(userId));
  assert.notEqual(refFor("user", userId), refFor("user", "usr_other"));
  // The same string under two kinds does not collide.
  assert.notEqual(refFor("user", userId), refFor("workspace", userId));
  assert.equal(refFor("user", ""), null);
  assert.equal(refFor("user", null), null);
});

test("the history is append-only: earlier rows are never rewritten and reads are copies", () => {
  const { store, audit } = system();
  audit.recordLogin({ userId: "usr_1", method: "magic-link", at: 1000 });
  const before = structuredClone(store.snapshot().auditEvents[0]);
  audit.recordForcedLogout({ userId: "usr_1", reason: "new-login", sessionsEnded: 1, at: 2000 });
  audit.recordLogin({ userId: "usr_1", method: "oauth", provider: "google", at: 3000 });

  assert.deepEqual(store.snapshot().auditEvents[0], before);
  assert.equal(store.snapshot().auditEvents.length, 3);
  assert.deepEqual(audit.list().map((row) => row.at), [
    new Date(3000).toISOString(),
    new Date(2000).toISOString(),
    new Date(1000).toISOString()
  ]);

  const view = audit.list()[0];
  view.context.method = "tampered";
  view.action = "account-deleted";
  assert.equal(audit.list()[0].context.method, "oauth");
  assert.equal(audit.list()[0].action, "login");

  assert.equal(typeof audit.update, "undefined");
  assert.equal(typeof audit.delete, "undefined");
});

test("list filters by action and by ref, newest first", () => {
  const { audit } = system();
  audit.recordLogin({ userId: "usr_a", at: 1000 });
  audit.recordLogin({ userId: "usr_b", at: 2000 });
  audit.recordInviteIssued({ userId: "usr_a", workspaceId: "ws_1", at: 3000 });

  assert.equal(audit.list({ action: "login" }).length, 2);
  assert.equal(audit.list({ subjectRef: refFor("user", "usr_a") }).length, 2);
  assert.equal(audit.list({ workspaceRef: refFor("workspace", "ws_1") }).length, 1);
  assert.equal(audit.list({ limit: 1 })[0].action, "invite-issued");
  assert.deepEqual(audit.listForUser("usr_b").map((row) => row.action), ["login"]);
  assert.deepEqual(audit.listForUser(""), []);
});

test("an audit row survives the deletion of the user it refers to and re-identifies nobody", () => {
  const { store, audit, account, entitlement, pair } = system();
  const { buyer, partner } = pair();
  const buyerId = userIdOf(store, "buyer@example.com");
  const partnerId = userIdOf(store, "partner@example.com");
  const workspaceId = store.snapshot().members.find((row) => row.userId === buyerId).workspaceId;

  audit.recordLogin({ userId: buyerId, method: "magic-link" });
  audit.recordInviteIssued({ userId: buyerId, workspaceId });
  audit.recordInviteAccepted({ userId: partnerId, workspaceId });
  const paid = entitlement.createPurchase(buyer.sessionId);
  assert.equal(paid.ok, true);
  audit.recordEntitlementGranted({
    workspaceId,
    orderId: paid.purchase.orderId,
    source: "purchase",
    amount: paid.purchase.amount
  });

  const buyerRef = audit.refForUser(buyerId);
  const before = audit.count();
  // The grant is recorded against the workspace, not against a person.
  assert.equal(audit.listForUser(buyerId).length, 2);
  assert.equal(audit.list({ workspaceRef: audit.refForWorkspace(workspaceId), action: "entitlement-granted" }).length, 1);

  const deleted = account.deleteAccount(buyer.sessionId, { confirm: true });
  assert.equal(deleted.ok, true);
  audit.recordAccountDeleted({
    userId: buyerId,
    partnerRemains: deleted.partnerRemains,
    removedWorkspaces: deleted.removedWorkspaces,
    archivedWorkspaces: deleted.archivedWorkspaces
  });

  // Nothing was rewritten or dropped by the deletion; the security history survives it.
  const after = store.snapshot();
  assert.equal(after.auditEvents.length, before + 1);
  assert.equal(after.users.some((row) => row.id === buyerId), false);
  assert.equal(after.sessions.some((row) => row.userId === buyerId), false);

  // The rows still exist under the same ref, and the ref joins to nothing that names a person.
  const history = audit.list({ subjectRef: buyerRef });
  assert.deepEqual(history.map((row) => row.action), ["account-deleted", "invite-issued", "login"]);
  assert.deepEqual(history[0].context, { partnerRemains: true, removedWorkspaces: 0, archivedWorkspaces: 1 });
  const serialized = JSON.stringify(after.auditEvents);
  assert.equal(serialized.includes(buyerId), false);
  assert.equal(serialized.includes("buyer@example.com"), false);
  assert.equal(serialized.includes(workspaceId), false);
  assert.equal(serialized.includes(paid.purchase.orderId), false);
  // Even the opaque userId a PublicLock keeps cannot be joined to the audit history.
  for (const lock of after.publicLocks) {
    assert.equal(serialized.includes(lock.submissions.a.userId), false);
  }
  // The surviving partner's own history is untouched.
  assert.equal(audit.listForUser(partnerId).length, 1);
});
