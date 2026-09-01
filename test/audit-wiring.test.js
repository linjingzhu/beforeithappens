import test from "node:test";
import assert from "node:assert/strict";
import { createAccount } from "../server/account.mjs";
import { createAudit } from "../server/audit.mjs";
import { createAuth } from "../server/auth.mjs";
import { createEntitlement } from "../server/entitlement.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { marriagePack } from "../src/questions.js";

const pack = { id: marriagePack.id, version: marriagePack.version };

function system() {
  const store = createMemoryStore();
  const audit = createAudit({ store });
  const couple = createCouple({ store, audit });
  const entitlement = createEntitlement({ store, pack, audit });
  const account = createAccount({ store, audit });
  const auth = createAuth({
    store,
    audit,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const login = (email) => auth.consumeMagicLink(auth.requestMagicLink(email).token);
  return { store, audit, couple, entitlement, account, auth, login };
}

/** list() is newest first, so these read in reverse chronological order. */
const actions = (audit) => audit.list({ limit: 100 }).map((row) => row.action);

test("signing in is recorded, and a second sign-in records the session it ended", () => {
  const { audit, login } = system();

  const first = login("buyer@example.com");
  assert.deepEqual(actions(audit), ["login"]);
  assert.equal(audit.list({ action: "login" })[0].context.method, "magic-link");
  assert.equal(audit.list({ action: "login" })[0].context.replacedSession, false);

  login("buyer@example.com");
  assert.deepEqual(actions(audit), ["login", "forced-logout", "login"], "newest first: the new login, the session it ended, the original");
  const forced = audit.list({ action: "forced-logout" })[0];
  assert.equal(forced.context.reason, "new-login");
  assert.equal(forced.context.sessionsEnded, 1);
  assert.equal(audit.list({ action: "login" })[0].context.replacedSession, true);
  assert.ok(first.ok);
});

test("a social sign-in records its provider, not its subject", () => {
  const { audit, auth } = system();
  const result = auth.completeOAuth({ provider: "kakao", providerUserId: "kakao-subject-1", email: "" });
  assert.equal(result.ok, true);

  const [row] = audit.list({ action: "login" });
  assert.equal(row.context.method, "oauth");
  assert.equal(row.context.provider, "kakao");
  assert.equal(JSON.stringify(row).includes("kakao-subject-1"), false, "the provider's id is not an audit fact");
});

test("logging out on request is recorded as such, not as a takeover", () => {
  const { audit, auth, login } = system();
  const session = login("solo@example.com");
  auth.logout(session.sessionId);
  assert.deepEqual(actions(audit), ["forced-logout", "login"], "newest first");
  assert.equal(audit.list({ action: "forced-logout" })[0].context.reason, "user-request");
});

test("the invite lifecycle is recorded, including that a reissue was one", () => {
  const { audit, couple, login } = system();
  const buyer = login("buyer@example.com");

  const first = couple.issueInvite(buyer.sessionId, "partner@example.com");
  assert.equal(first.ok, true);
  assert.equal(audit.list({ action: "invite-issued" })[0].context.reissue, false);

  const again = couple.issueInvite(buyer.sessionId, "partner@example.com");
  assert.equal(again.ok, true);
  assert.equal(audit.list({ action: "invite-issued" })[0].context.reissue, true, "the newest event is the reissue");
  assert.equal(audit.list({ action: "invite-issued" }).length, 2);

  const partner = login("partner@example.com");
  assert.equal(couple.acceptInvite(partner.sessionId, again.token).ok, true);
  const accepted = audit.list({ action: "invite-accepted" })[0];
  assert.equal(accepted.context.viaPairCode, false);
});

test("pairing by code is recorded as an acceptance that came the other way", () => {
  const { audit, couple, login } = system();
  const buyer = login("buyer@example.com");
  const code = couple.ensurePairCode(buyer.sessionId);
  assert.equal(code.ok, true);
  assert.ok(code.code, "ensurePairCode returns the code under `code`");

  const partner = login("partner@example.com");
  assert.equal(couple.connectByPairCode(partner.sessionId, code.code).ok, true);
  const [row] = audit.list({ action: "invite-accepted" });
  assert.equal(row.context.viaPairCode, true);
});

test("an entitlement grant is recorded once, and a replayed webhook adds nothing", () => {
  const { audit, couple, entitlement, login } = system();
  const buyer = login("buyer@example.com");
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
  const partner = login("partner@example.com");
  couple.acceptInvite(partner.sessionId, invite.token);

  const purchase = entitlement.createPurchase(buyer.sessionId);
  assert.equal(purchase.ok, true);

  const granted = audit.list({ action: "entitlement-granted" });
  assert.equal(granted.length, 1, "the grant is recorded");
  assert.equal(granted[0].context.amount, 29000);
  assert.equal(granted[0].context.currency, "KRW");

  entitlement.applyWebhook({ eventId: `purchase:${purchase.purchase.orderId}`, orderId: purchase.purchase.orderId });
  assert.equal(audit.list({ action: "entitlement-granted" }).length, 1, "a replay grants nothing and records nothing");
});

test("a deletion is recorded, survives the account, and names nobody", () => {
  const { audit, account, store, login } = system();
  const leaver = login("leaver@example.com");

  assert.equal(account.deleteAccount(leaver.sessionId, { confirm: true }).ok, true);

  const [row] = audit.list({ action: "account-deleted" });
  assert.ok(row, "the deletion is recorded");
  assert.equal(row.context.partnerRemains, false);
  assert.equal(row.context.removedWorkspaces, 1);

  const state = store.snapshot();
  assert.equal(state.users.length, 0, "the account really is gone");
  assert.ok(state.auditEvents.length >= 2, "its history is not gone with it");

  const history = JSON.stringify(state.auditEvents);
  assert.equal(history.includes("leaver@example.com"), false, "no email survives in the log");
  assert.equal(history.includes(leaver.user.id), false, "no user id survives in the log");
});

test("no audit row anywhere carries an email, a token or an id that resolves", () => {
  const { audit, couple, entitlement, store, login } = system();
  const buyer = login("buyer@example.com");
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
  const partner = login("partner@example.com");
  couple.acceptInvite(partner.sessionId, invite.token);
  entitlement.createPurchase(buyer.sessionId);

  const state = store.snapshot();
  const history = JSON.stringify(state.auditEvents);
  assert.ok(state.auditEvents.length >= 5);

  for (const secret of ["buyer@example.com", "partner@example.com", invite.token, buyer.sessionId, partner.sessionId]) {
    assert.equal(history.includes(secret), false, `audit must not carry ${secret.slice(0, 12)}…`);
  }
  for (const user of state.users) assert.equal(history.includes(user.id), false, "no user id is stored");
  for (const workspace of state.workspaces) assert.equal(history.includes(workspace.id), false, "no workspace id is stored");
  assert.equal(audit.count() >= 5, true);
});
