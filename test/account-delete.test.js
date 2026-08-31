import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createAccount } from "../server/account.mjs";
import { createAnswers } from "../server/answers.mjs";
import { createAuth } from "../server/auth.mjs";
import { createEntitlement } from "../server/entitlement.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { marriagePack } from "../src/questions.js";
import { WITHDRAW_COPY } from "../src/pair-code.js";

const pack = { id: marriagePack.id, version: marriagePack.version };
const questionIds = ["home-01", "money-01"];
const choiceIdsByQuestion = {
  "home-01": ["home-rest", "home-social", "home-independent", "home-growth"],
  "money-01": ["money-save", "money-experience", "money-growth", "money-split"]
};

function system() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const entitlement = createEntitlement({ store, pack });
  const answers = createAnswers({ store, questionIds, choiceIdsByQuestion, pack, entitlement });
  const account = createAccount({ store });
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
    return { buyer, partner };
  }
  function lockRound(buyer, partner, questionId, choices) {
    answers.saveDraft(buyer.sessionId, { questionId, draftChoice: choices[0], privateNote: "구매자 메모", index: 0 });
    answers.saveDraft(partner.sessionId, { questionId, draftChoice: choices[1], privateNote: "파트너 메모", index: 0 });
    answers.submit(buyer.sessionId, { questionId, index: 0 });
    answers.submit(partner.sessionId, { questionId, index: 0 });
  }
  return { store, couple, entitlement, answers, account, auth, login, pair, lockRound };
}

function activeWorkspaceOf(store, userId) {
  const state = store.snapshot();
  return state.members
    .filter((member) => member.userId === userId && member.status === "accepted")
    .map((member) => state.workspaces.find((item) => item.id === member.workspaceId))
    .find((workspace) => workspace?.status === "active") || null;
}

test("deletion needs a real session and an explicit confirmation", () => {
  const { account, login, store } = system();
  assert.deepEqual(account.deleteAccount(null, { confirm: true }), { ok: false, error: "unauthenticated" });
  assert.deepEqual(account.deleteAccount("ses_nope", { confirm: true }), { ok: false, error: "unauthenticated" });
  const solo = login("solo@example.com");
  assert.deepEqual(account.deleteAccount(solo.sessionId), { ok: false, error: "unconfirmed" });
  assert.deepEqual(account.deleteAccount(solo.sessionId, { confirm: false }), { ok: false, error: "unconfirmed" });
  assert.equal(store.snapshot().users.length, 1);
});

test("a solo account and its ghost workspace are erased outright", () => {
  const { account, couple, login, store } = system();
  const solo = login("solo@example.com");
  couple.ensurePairCode(solo.sessionId);
  const result = account.deleteAccount(solo.sessionId, { confirm: true });
  assert.equal(result.ok, true);
  assert.equal(result.partnerRemains, false);
  assert.equal(result.removedWorkspaces, 1);
  const state = store.snapshot();
  assert.deepEqual(state.users, []);
  assert.deepEqual(state.workspaces, []);
  assert.deepEqual(state.members, []);
  assert.deepEqual(state.sessions, []);
  assert.equal(JSON.stringify(state).includes("solo@example.com"), false);
});

test("own private notes, drafts and unrevealed answers are gone, and the partner never sees them", () => {
  const { account, answers, store, pair } = system();
  const { buyer, partner } = pair();
  answers.saveDraft(buyer.sessionId, {
    questionId: "home-01",
    draftChoice: "home-rest",
    privateNote: "떠나는 사람의 비공개 메모",
    index: 0
  });
  answers.saveDraft(partner.sessionId, {
    questionId: "home-01",
    draftChoice: "home-social",
    privateNote: "남는 사람의 비공개 메모",
    index: 0
  });
  assert.equal(store.snapshot().privateNotes.length, 2);

  assert.equal(account.deleteAccount(buyer.sessionId, { confirm: true }).ok, true);

  const state = store.snapshot();
  const serialized = JSON.stringify(state);
  assert.equal(serialized.includes("떠나는 사람의 비공개 메모"), false);
  assert.equal(serialized.includes("buyer@example.com"), false);
  assert.equal(state.privateNotes.filter((row) => row.userId === buyer.user.id).length, 0);
  assert.equal(state.answers.filter((row) => row.userId === buyer.user.id).length, 0);
  assert.equal(state.progress.filter((row) => row.userId === buyer.user.id).length, 0);
  // the surviving member keeps their own author-only material
  assert.equal(state.privateNotes.filter((row) => row.userId === partner.user.id).length, 1);

  // nothing the partner can read exposes the departed user
  const view = answers.stateFor(partner.sessionId);
  assert.equal(view.ok, false);
  assert.equal(JSON.stringify(view).includes("떠나는 사람의 비공개 메모"), false);
});

test("the session is invalidated and cannot be reused, and deletion is idempotent", () => {
  const { account, answers, auth, store, pair } = system();
  const { buyer } = pair();
  assert.equal(account.deleteAccount(buyer.sessionId, { confirm: true }).ok, true);

  assert.equal(store.snapshot().sessions.some((row) => row.id === buyer.sessionId), false);
  assert.deepEqual(auth.sessionFor(buyer.sessionId), { user: null, notice: null, workspace: { acceptedPartner: false } });
  assert.equal(answers.stateFor(buyer.sessionId).error, "unauthenticated");

  const before = JSON.stringify(store.snapshot());
  assert.deepEqual(account.deleteAccount(buyer.sessionId, { confirm: true }), { ok: false, error: "unauthenticated" });
  assert.deepEqual(account.purgeUser(buyer.user.id), { ok: true });
  assert.equal(JSON.stringify(store.snapshot()), before);
});

test("magic links and OAuth identities of the departed user are erased", () => {
  const { account, auth, store } = system();
  const oauth = auth.completeOAuth({ provider: "google", providerUserId: "sub-1", email: "social@example.com" });
  auth.requestMagicLink("social@example.com");
  assert.equal(store.snapshot().identities.length, 1);
  assert.ok(store.snapshot().magicLinks.length >= 1);

  assert.equal(account.deleteAccount(oauth.sessionId, { confirm: true }).ok, true);
  const state = store.snapshot();
  assert.deepEqual(state.identities, []);
  assert.deepEqual(state.magicLinks, []);
  assert.equal(JSON.stringify(state).includes("social@example.com"), false);
  // signing in again with the same address is a brand new account, not a resurrection
  const fresh = auth.consumeMagicLink(auth.requestMagicLink("social@example.com").token);
  assert.equal(fresh.ok, true);
  assert.notEqual(fresh.user.id, oauth.user.id);
});

test("the partner left behind lands in a fresh, usable workspace and can re-invite", () => {
  const { account, couple, store, pair, lockRound } = system();
  const { buyer, partner } = pair();
  lockRound(buyer, partner, "home-01", ["home-rest", "home-social"]);
  const sharedWorkspaceId = store.snapshot().publicLocks[0].workspaceId;

  const result = account.deleteAccount(buyer.sessionId, { confirm: true });
  assert.equal(result.partnerRemains, true);
  assert.equal(result.archivedWorkspaces, 1);

  const archived = store.snapshot().workspaces.find((row) => row.id === sharedWorkspaceId);
  assert.equal(archived.status, "archived");
  assert.ok(archived.archivedAt);

  const fresh = activeWorkspaceOf(store, partner.user.id);
  assert.ok(fresh);
  assert.notEqual(fresh.id, sharedWorkspaceId);
  assert.equal(fresh.ownerUserId, partner.user.id);
  const membership = store.snapshot().members.find((row) => row.workspaceId === fresh.id && row.userId === partner.user.id);
  assert.equal(membership.role, "buyer");
  assert.equal(membership.status, "accepted");

  // the surviving member is signed in, sees an empty invite-waiting workspace, and can invite again
  const view = couple.viewForUser(partner.user.id);
  assert.equal(view.id, fresh.id);
  assert.equal(view.role, "buyer");
  assert.equal(view.acceptedPartner, false);
  const reinvite = couple.issueInvite(partner.sessionId, "new@example.com");
  assert.equal(reinvite.ok, true);
});

test("a new partner joins the fresh workspace and can never see the departed couple's locks", () => {
  const { account, couple, answers, auth, store, pair, lockRound } = system();
  const { buyer, partner } = pair();
  lockRound(buyer, partner, "home-01", ["home-rest", "home-social"]);
  assert.equal(account.deleteAccount(buyer.sessionId, { confirm: true }).ok, true);

  const invite = couple.issueInvite(partner.sessionId, "new@example.com");
  assert.equal(invite.ok, true);
  const newcomer = auth.consumeMagicLink(auth.requestMagicLink("new@example.com").token);
  assert.equal(couple.acceptInvite(newcomer.sessionId, invite.token).ok, true);

  const view = answers.stateFor(newcomer.sessionId);
  assert.equal(view.ok, true);
  assert.equal(view.state.questions["home-01"].lock, null);
  assert.equal(view.state.questions["home-01"].roles.a.submittedChoice, null);
  assert.equal(view.state.questions["home-01"].roles.b.submittedChoice, null);
  // the old lock still exists untouched, but in the archived space only
  const lock = store.snapshot().publicLocks[0];
  assert.notEqual(lock.workspaceId, activeWorkspaceOf(store, partner.user.id).id);
});

test("public locks are never mutated and no longer resolve to any identity", () => {
  const { account, store, pair, lockRound } = system();
  const { buyer, partner } = pair();
  lockRound(buyer, partner, "home-01", ["home-rest", "home-social"]);
  const before = JSON.stringify(store.snapshot().publicLocks);

  assert.equal(account.deleteAccount(buyer.sessionId, { confirm: true }).ok, true);

  const state = store.snapshot();
  assert.equal(JSON.stringify(state.publicLocks), before);
  assert.equal(state.publicLocks.length, 1);
  const lock = state.publicLocks[0];
  assert.equal(lock.submissions.a.choice, "home-rest");
  assert.equal(lock.submissions.b.choice, "home-social");
  // the id in the snapshot is opaque: no user row, email or identity is behind it any more
  assert.equal(state.users.some((row) => row.id === lock.submissions.a.userId), false);
  assert.equal(state.identities.some((row) => row.userId === lock.submissions.a.userId), false);
  assert.equal(state.members.some((row) => row.userId === lock.submissions.a.userId), false);
});

test("agreement text survives with the departed author pointer scrubbed", () => {
  const { account, answers, store, pair, lockRound } = system();
  const { buyer, partner } = pair();
  lockRound(buyer, partner, "home-01", ["home-rest", "home-social"]);
  assert.equal(answers.saveAgreement(buyer.sessionId, { questionId: "home-01", action: "propose", proposal: "우리 합의", index: 0 }).ok, true);
  assert.equal(answers.saveAgreement(partner.sessionId, { questionId: "home-01", action: "approve", index: 0 }).ok, true);

  assert.equal(account.deleteAccount(buyer.sessionId, { confirm: true }).ok, true);

  const agreement = store.snapshot().agreements.find((row) => row.questionId === "home-01");
  assert.equal(agreement.proposal, "우리 합의");
  assert.equal(agreement.status, "agreed");
  assert.equal(agreement.proposedByUserId, null);
  assert.equal(agreement.approvedByUserId, partner.user.id);
});

test("a paid entitlement follows the member who is still here", () => {
  const { account, entitlement, store, pair } = system();
  const { buyer, partner } = pair();
  assert.equal(entitlement.createPurchase(buyer.sessionId).entitled, true);

  assert.equal(account.deleteAccount(buyer.sessionId, { confirm: true }).ok, true);

  const state = store.snapshot();
  const fresh = activeWorkspaceOf(store, partner.user.id);
  assert.equal(state.entitlements.length, 1);
  assert.equal(state.entitlements[0].status, "active");
  assert.equal(state.entitlements[0].workspaceId, fresh.id);
  assert.equal(entitlement.isEntitled(fresh.id), true);
  // the order record stays for accounting, without pointing at the deleted account
  assert.equal(state.purchases.length, 1);
  assert.equal(state.purchases[0].buyerUserId, null);
  assert.equal(state.purchases[0].amount, 29000);
});

test("pending invitations of the closed workspace stop working", () => {
  const { account, couple, store, login } = system();
  const buyer = login("buyer@example.com");
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
  const partner = login("partner@example.com");
  assert.equal(couple.acceptInvite(partner.sessionId, invite.token).ok, true);
  const second = couple.issueInvite(buyer.sessionId, "someone@example.com");
  assert.equal(second.ok, false);

  assert.equal(account.deleteAccount(buyer.sessionId, { confirm: true }).ok, true);
  // invitations issued by the departed buyer are gone with the account
  assert.equal(store.snapshot().invitations.length, 0);
  assert.equal(couple.previewInvite(invite.token).ok, false);
});

test("the web UI puts 탈퇴 behind a confirmation step next to logout", async () => {
  const ui = await readFile("src/auth-ui.js", "utf8");
  const app = await readFile("src/app.js", "utf8");
  assert.match(ui, /data-action="withdraw"/);
  assert.match(ui, /export function renderWithdrawConfirm/);
  assert.match(ui, /data-action="withdraw-confirm"/);
  assert.match(ui, /data-action="withdraw-cancel"/);
  assert.match(ui, /WITHDRAW_COPY\.entry/);
  assert.match(ui, /WITHDRAW_COPY\.body/);
  // the logout cluster opens the confirm view; it must not delete on the spot
  const cluster = ui.slice(ui.indexOf("function logoutCluster"), ui.indexOf("export function renderWithdrawConfirm"));
  assert.equal(cluster.includes("withdraw-confirm"), false);
  assert.equal(cluster.includes("/api/account/delete"), false);
  // only the confirm action calls the API
  assert.match(app, /withdrawStep = "confirm"/);
  assert.match(app, /'\[data-action="withdraw-confirm"\]'\)\?\.addEventListener\("click", withdrawAccount\)/);
  const request = app.slice(app.indexOf("async function withdrawAccount"), app.indexOf("async function logout"));
  assert.match(request, /\/api\/account\/delete/);
  assert.match(request, /confirm: true/);
  assert.equal(app.indexOf("/api/account/delete"), request.indexOf("/api/account/delete") + app.indexOf("async function withdrawAccount"));
});

test("the native 계정 screen asks once before deleting", async () => {
  const screens = await readFile("mobile/src/screens.js", "utf8");
  const copy = await readFile("mobile/src/copy.js", "utf8");
  assert.match(copy, /WITHDRAW_COPY/);
  assert.match(screens, /WITHDRAW_COPY\.entry/);
  assert.match(screens, /confirmingWithdraw/);
  assert.match(screens, /testID="account-withdraw"/);
  assert.match(screens, /testID="account-withdraw-confirm"/);
  assert.match(screens, /testID="account-withdraw-cancel"/);
  const account = screens.slice(screens.indexOf("export function AccountScreen"), screens.indexOf("export function UnlockRestScreen"));
  // the entry row only opens the confirm block; deletion is reachable from the confirm block only
  const entryLine = account.split("\n").find((line) => line.includes('testID="account-withdraw"'));
  assert.match(entryLine, /setConfirmingWithdraw\(true\)/);
  assert.equal(entryLine.includes("onWithdraw"), false);
  const confirmBlock = account.slice(
    account.indexOf('testID="account-withdraw-confirm"'),
    account.indexOf('testID="account-withdraw"')
  );
  assert.match(confirmBlock, /testID="account-withdraw-yes"/);
  assert.match(confirmBlock, /testID="account-withdraw-cancel"/);
  assert.match(confirmBlock, /onWithdraw\?\.\(\)/);
  assert.equal(account.split("onWithdraw?.()").length - 1, 1);
});

test("withdrawal copy is plain Korean and states that it cannot be undone", () => {
  assert.equal(WITHDRAW_COPY.entry, "탈퇴하기");
  assert.equal(WITHDRAW_COPY.cancel, "돌아가기");
  assert.match(WITHDRAW_COPY.body, /되돌릴 수 없어요/);
  // the confirm screen must not promise the partner more than deletion actually leaves them
  assert.match(WITHDRAW_COPY.partnerLine, /상대의 계정은 그대로 남아요/);
  assert.match(WITHDRAW_COPY.partnerLine, /새로 시작할 수 있어요/);
  assert.equal(Object.isFrozen(WITHDRAW_COPY), true);
  for (const line of Object.values(WITHDRAW_COPY)) {
    assert.equal(/영구|삭제됩니다|경고|주의하세요/.test(line), false);
  }
});

test("deletion never leaves a member row or session pointing at the removed user", () => {
  const { account, store, pair, lockRound } = system();
  const { buyer, partner } = pair();
  lockRound(buyer, partner, "home-01", ["home-rest", "home-social"]);
  assert.equal(account.deleteAccount(buyer.sessionId, { confirm: true }).ok, true);
  const state = store.snapshot();
  for (const key of ["users", "identities", "magicLinks", "sessions", "members", "answers", "privateNotes", "progress"]) {
    assert.equal(state[key].some((row) => row.userId === buyer.user.id), false, `${key} still references the deleted user`);
  }
  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].userId, partner.user.id);
});
