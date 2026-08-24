import test from "node:test";
import assert from "node:assert/strict";
import { canOpenPack } from "../src/auth.js";
import { createAuth } from "../server/auth.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple, INVITE_TTL_MS } from "../server/workspace.mjs";

function system(start = Date.parse("2026-08-23T00:00:00.000Z")) {
  let now = start;
  let n = 0;
  const store = createMemoryStore();
  const couple = createCouple({ store, now: () => now, randomToken: () => `invite-${++n}` });
  const auth = createAuth({
    store,
    now: () => now,
    randomToken: () => `login-${++n}`,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  function login(email) {
    return auth.consumeMagicLink(auth.requestMagicLink(email).token);
  }
  return {
    auth,
    couple,
    store,
    login,
    advance(ms) { now += ms; }
  };
}

test("buyer login attaches a ghost workspace that does not open the pack", () => {
  const { auth, login, store } = system();
  const buyer = login("buyer@example.com");
  const session = auth.sessionFor(buyer.sessionId);
  assert.equal(store.snapshot().workspaces.length, 1);
  assert.equal(store.snapshot().members[0].role, "buyer");
  assert.equal(session.workspace.acceptedPartner, false);
  assert.equal(canOpenPack(session), false);
});

test("invite is email-bound, single-use, 7 days, and reissue expires the previous token", () => {
  const { auth, couple, login, advance } = system();
  const buyer = login("buyer@example.com");
  const first = couple.issueInvite(buyer.sessionId, " Partner@Example.com ");
  const second = couple.issueInvite(buyer.sessionId, "partner@example.com");
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(couple.previewInvite(first.token).error, "expired");
  const partner = login("partner@example.com");
  assert.equal(couple.acceptInvite(partner.sessionId, first.token).error, "expired");
  const accepted = couple.acceptInvite(partner.sessionId, second.token);
  assert.equal(accepted.ok, true);
  assert.equal(couple.acceptInvite(partner.sessionId, second.token).error, "used");
  assert.equal(auth.sessionFor(buyer.sessionId).workspace.acceptedPartner, true);
  assert.equal(auth.sessionFor(partner.sessionId).workspace.acceptedPartner, true);
  assert.equal(canOpenPack(auth.sessionFor(buyer.sessionId)), true);

  const other = system();
  const lateBuyer = other.login("buyer2@example.com");
  const late = other.couple.issueInvite(lateBuyer.sessionId, "late@example.com");
  other.advance(INVITE_TTL_MS + 1);
  assert.equal(other.couple.previewInvite(late.token).error, "expired");
});

test("editing the invite email and resending immediately expires the previous token", () => {
  const { couple, login, store } = system();
  const buyer = login("buyer@example.com");
  const typo = couple.issueInvite(buyer.sessionId, "typo@example.com");
  const corrected = couple.issueInvite(buyer.sessionId, "partner@example.com");
  assert.equal(typo.ok, true);
  assert.equal(corrected.ok, true);
  assert.equal(couple.previewInvite(typo.token).error, "expired");
  assert.equal(couple.previewInvite(corrected.token).ok, true);
  assert.equal(couple.previewInvite(corrected.token).email, "partner@example.com");
  const view = couple.viewForUser(buyer.user.id);
  assert.equal(view.invite.email, "partner@example.com");
  assert.equal(view.invite.url, `/invite/accept?token=${corrected.token}`);
  assert.equal(view.invite.url.includes(typo.token), false);
  const preview = couple.previewInvite(corrected.token);
  assert.equal(preview.url, undefined);
  assert.equal(preview.shareToken, undefined);
  const expiredRow = store.snapshot().invitations.find((item) => item.email === "typo@example.com");
  assert.equal(expiredRow.shareToken, "");
});

test("same-session accept cannot succeed for another logged-in account", () => {
  const { couple, login } = system();
  const buyer = login("buyer@example.com");
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
  assert.equal(couple.acceptInvite(buyer.sessionId, invite.token).error, "mismatch");
  const stranger = login("other@example.com");
  assert.equal(couple.acceptInvite(stranger.sessionId, invite.token).error, "mismatch");
  assert.equal(couple.previewInvite(invite.token).ok, true);
  const partner = login("partner@example.com");
  assert.equal(couple.acceptInvite(partner.sessionId, invite.token).ok, true);
});

test("link-only and mismatched email cannot accept", () => {
  const { couple, login } = system();
  const buyer = login("buyer@example.com");
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
  assert.equal(couple.acceptInvite(null, invite.token).error, "unauthenticated");
  const stranger = login("other@example.com");
  assert.equal(couple.acceptInvite(stranger.sessionId, invite.token).error, "mismatch");
  assert.equal(canOpenPack({ user: stranger.user, workspace: { acceptedPartner: false } }), false);
  const partner = login("partner@example.com");
  const accepted = couple.acceptInvite(partner.sessionId, invite.token);
  assert.equal(accepted.ok, true);
  assert.equal(accepted.workspace.role, "partner");
});

test("one user cannot own two active workspaces and a third member cannot join", () => {
  const { auth, couple, login, store } = system();
  const first = login("buyer@example.com");
  const buyer = login("buyer@example.com");
  assert.equal(auth.sessionFor(first.sessionId).user, null);
  assert.equal(store.snapshot().workspaces.filter((item) => item.status === "active").length, 1);
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
  const partner = login("partner@example.com");
  assert.equal(couple.acceptInvite(partner.sessionId, invite.token).ok, true);
  const extra = couple.issueInvite(buyer.sessionId, "third@example.com");
  assert.equal(extra.error, "already-paired");
  assert.equal(auth.sessionFor(buyer.sessionId).workspace.acceptedPartner, true);
});
