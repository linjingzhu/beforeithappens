import test from "node:test";
import assert from "node:assert/strict";
import { createAudit } from "../server/audit.mjs";
import { createAuth } from "../server/auth.mjs";
import { createEntitlement } from "../server/entitlement.mjs";
import { createGift } from "../server/gift.mjs";
import { createReferral, REFERRAL_REWARD_PURCHASES } from "../server/referral.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { marriagePack } from "../src/questions.js";

const pack = { id: marriagePack.id, version: marriagePack.version };

function system({ rewardEvery = REFERRAL_REWARD_PURCHASES } = {}) {
  const store = createMemoryStore();
  const audit = createAudit({ store });
  const couple = createCouple({ store, audit });
  let referral;
  const entitlement = createEntitlement({
    store,
    pack,
    audit,
    onEntitled: ({ workspaceId, at }) => referral?.creditPurchase({ workspaceId, at })
  });
  const gift = createGift({ store, entitlement, pack, audit });
  referral = createReferral({ store, gift, rewardEvery, audit });
  const auth = createAuth({
    store,
    audit,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const login = (email) => auth.consumeMagicLink(auth.requestMagicLink(email).token);
  /** A workspace only unlocks with an accepted partner, so pairing is part of the setup. */
  const pairedBuyer = (buyerEmail, partnerEmail) => {
    const buyer = login(buyerEmail);
    const invite = couple.issueInvite(buyer.sessionId, partnerEmail);
    const partner = login(partnerEmail);
    couple.acceptInvite(partner.sessionId, invite.token);
    return { buyer, partner };
  };
  return { store, audit, couple, entitlement, gift, referral, auth, login, pairedBuyer };
}

test("a bought gift is a second purchase, and it never unlocks the giver's own pack", () => {
  const { gift, entitlement, couple, login } = system();
  const giver = login("giver@example.com");
  couple.issueInvite(giver.sessionId, "partner@example.com");

  const bought = gift.createGiftPurchase(giver.sessionId);
  assert.equal(bought.ok, true);
  assert.equal(bought.amount, 29000);
  assert.ok(bought.token, "the giver gets a link to send");

  const workspace = couple.viewForUser(giver.user.id);
  assert.equal(entitlement.isEntitled(workspace.workspaceId ?? workspace.id ?? ""), false,
    "buying a present must not open the giver's own remaining questions");
});

test("a gift opens the pack for whoever redeems it, exactly once", () => {
  const { gift, entitlement, couple, login, pairedBuyer } = system();
  const giver = login("giver@example.com");
  const bought = gift.createGiftPurchase(giver.sessionId);

  const { buyer: receiver } = pairedBuyer("receiver@example.com", "receiver.partner@example.com");
  const redeemed = gift.redeem(receiver.sessionId, bought.token);
  assert.equal(redeemed.ok, true);
  assert.equal(entitlement.isEntitled(redeemed.workspaceId), true, "the receiver's pack is open");
  assert.equal(couple.viewForUser(giver.user.id).entitled ?? false, false);

  const again = gift.redeem(receiver.sessionId, bought.token);
  assert.equal(again.ok, false);
  assert.equal(again.error, "used", "the spent link is spent, whoever taps it");

  // A second, still-valid present is refused for a different reason: there is nothing left to open.
  const spare = gift.createGiftPurchase(giver.sessionId);
  const spent = gift.redeem(receiver.sessionId, spare.token);
  assert.equal(spent.ok, false);
  assert.equal(spent.error, "already-entitled", "a live gift is not burned on someone who cannot use it");
  assert.equal(gift.previewGift(spare.token).ok, true, "so it stays sendable to someone else");
});

test("two people racing the same gift link produce one entitlement, not two", () => {
  const { gift, entitlement, login, pairedBuyer } = system();
  const giver = login("giver@example.com");
  const bought = gift.createGiftPurchase(giver.sessionId);

  const first = pairedBuyer("first@example.com", "first.partner@example.com").buyer;
  const second = pairedBuyer("second@example.com", "second.partner@example.com").buyer;

  const a = gift.redeem(first.sessionId, bought.token);
  const b = gift.redeem(second.sessionId, bought.token);
  assert.equal(a.ok, true);
  assert.equal(b.ok, false, "a forwarded link is spent by whoever got there first");
  assert.equal(b.error, "used");
  assert.equal(entitlement.isEntitled(a.workspaceId), true);
});

test("a gift cannot be laundered into the giver's own unlock", () => {
  const { gift, login, couple } = system();
  const { buyer: giver } = (() => {
    const buyer = login("solo@example.com");
    const invite = couple.issueInvite(buyer.sessionId, "solo.partner@example.com");
    const partner = login("solo.partner@example.com");
    couple.acceptInvite(partner.sessionId, invite.token);
    return { buyer };
  })();

  const bought = gift.createGiftPurchase(giver.sessionId);
  const self = gift.redeem(giver.sessionId, bought.token);
  assert.equal(self.ok, false);
  assert.equal(self.error, "self", "redeeming your own present would make the two purchase paths identical");
});

test("an unredeemed gift can be revoked, and revoking it withdraws the link", () => {
  const { gift, login, pairedBuyer } = system();
  const giver = login("giver@example.com");
  const bought = gift.createGiftPurchase(giver.sessionId);

  const listed = gift.listSent(giver.sessionId);
  assert.equal(listed.gifts.length, 1);
  assert.equal(listed.gifts[0].token, bought.token, "an unsent present is still shareable");

  assert.equal(gift.revoke(giver.sessionId, listed.gifts[0].id).ok, true);
  assert.equal(gift.previewGift(bought.token).error, "revoked");

  const receiver = pairedBuyer("receiver@example.com", "receiver.partner@example.com").buyer;
  assert.equal(gift.redeem(receiver.sessionId, bought.token).error, "revoked");
  assert.equal(gift.listSent(giver.sessionId).gifts[0].token, "", "a dead link is not offered again");
});

test("a redeemed gift can no longer be revoked, and its token stops being handed out", () => {
  const { gift, login, pairedBuyer } = system();
  const giver = login("giver@example.com");
  const bought = gift.createGiftPurchase(giver.sessionId);
  const receiver = pairedBuyer("receiver@example.com", "receiver.partner@example.com").buyer;
  gift.redeem(receiver.sessionId, bought.token);

  const listed = gift.listSent(giver.sessionId);
  assert.equal(listed.gifts[0].status, "used");
  assert.equal(listed.gifts[0].token, "");
  assert.equal(gift.revoke(giver.sessionId, listed.gifts[0].id).error, "used");
});

test("a gift expires, and an expired one explains itself instead of failing blank", () => {
  const store = createMemoryStore();
  let clock = Date.parse("2026-01-01T00:00:00.000Z");
  const entitlement = createEntitlement({ store, pack, now: () => clock });
  const gift = createGift({ store, entitlement, pack, now: () => clock });
  const auth = createAuth({ store, now: () => clock });
  const giver = auth.consumeMagicLink(auth.requestMagicLink("giver@example.com").token);

  const bought = gift.createGiftPurchase(giver.sessionId);
  assert.equal(gift.previewGift(bought.token).ok, true);

  clock += 31 * 24 * 60 * 60 * 1000;
  const preview = gift.previewGift(bought.token);
  assert.equal(preview.ok, false);
  assert.equal(preview.error, "expired");
});

test("a referral code is stable, and recommending yourself is refused", () => {
  const { referral, login } = system();
  const me = login("me@example.com");

  const view = referral.viewFor(me.sessionId);
  assert.equal(view.ok, true);
  assert.match(view.code, /^[0-9A-Z]{8}$/);
  assert.equal(referral.viewFor(me.sessionId).code, view.code, "the code does not change under the sharer");
  assert.equal(view.joined, 0);

  const self = referral.claim(me.sessionId, view.code);
  assert.equal(self.ok, false);
  assert.equal(self.error, "self");
});

test("an account is attributed once, and never after it has already bought", () => {
  const { referral, entitlement, login, pairedBuyer } = system();
  const sharer = login("sharer@example.com");
  const code = referral.viewFor(sharer.sessionId).code;

  const friend = login("friend@example.com");
  assert.equal(referral.claim(friend.sessionId, code).ok, true);
  assert.equal(referral.claim(friend.sessionId, code).error, "already-claimed");
  assert.equal(referral.viewFor(sharer.sessionId).joined, 1);

  const late = pairedBuyer("late@example.com", "late.partner@example.com").buyer;
  entitlement.createPurchase(late.sessionId);
  const tooLate = referral.claim(late.sessionId, code);
  assert.equal(tooLate.ok, false);
  assert.equal(tooLate.error, "too-late", "a code cannot be applied to a purchase that already happened");
});

test("an unknown code is refused rather than silently recorded", () => {
  const { referral, login } = system();
  const friend = login("friend@example.com");
  assert.equal(referral.claim(friend.sessionId, "ZZZZZZZZ").error, "invalid-code");
  assert.equal(referral.claim(friend.sessionId, "").error, "invalid-code");
});

test("the reward lands only when the referred person actually pays, and only once each", () => {
  const { referral, entitlement, login, pairedBuyer } = system({ rewardEvery: 2 });
  const sharer = login("sharer@example.com");
  const code = referral.viewFor(sharer.sessionId).code;

  const first = pairedBuyer("first@example.com", "first.partner@example.com").buyer;
  assert.equal(referral.claim(first.sessionId, code).ok, true);
  assert.equal(referral.viewFor(sharer.sessionId).credited, 0, "joining is not paying");

  entitlement.createPurchase(first.sessionId);
  assert.equal(referral.viewFor(sharer.sessionId).credited, 1);
  assert.equal(referral.viewFor(sharer.sessionId).rewarded, 0, "one of two");

  // A replayed webhook for the same order must not credit a second time.
  entitlement.applyWebhook({ eventId: "replay-1", orderId: "unknown" });
  entitlement.createPurchase(first.sessionId);
  assert.equal(referral.viewFor(sharer.sessionId).credited, 1, "the same person counts once, ever");

  const second = pairedBuyer("second@example.com", "second.partner@example.com").buyer;
  assert.equal(referral.claim(second.sessionId, code).ok, true);
  entitlement.createPurchase(second.sessionId);
  assert.equal(referral.viewFor(sharer.sessionId).credited, 2);
  assert.equal(referral.viewFor(sharer.sessionId).rewarded, 1, "the threshold pays out exactly once");
});

test("a rewarded gift is a real, redeemable present that names its origin", () => {
  const { referral, gift, entitlement, login, pairedBuyer } = system({ rewardEvery: 1 });
  const sharer = login("sharer@example.com");
  const code = referral.viewFor(sharer.sessionId).code;

  const friend = pairedBuyer("friend@example.com", "friend.partner@example.com").buyer;
  referral.claim(friend.sessionId, code);
  entitlement.createPurchase(friend.sessionId);

  const sent = gift.listSent(sharer.sessionId);
  assert.equal(sent.gifts.length, 1);
  assert.equal(sent.gifts[0].origin, "referral", "a reward is never mistaken for a bought present");
  assert.ok(sent.gifts[0].token);

  const other = pairedBuyer("other@example.com", "other.partner@example.com").buyer;
  const redeemed = gift.redeem(other.sessionId, sent.gifts[0].token);
  assert.equal(redeemed.ok, true);
  assert.equal(entitlement.isEntitled(redeemed.workspaceId), true);
});

test("the audit log records gifts and referrals without naming anyone", () => {
  const { referral, gift, entitlement, audit, store, login, pairedBuyer } = system({ rewardEvery: 1 });
  const sharer = login("sharer@example.com");
  const code = referral.viewFor(sharer.sessionId).code;
  const friend = pairedBuyer("friend@example.com", "friend.partner@example.com").buyer;
  referral.claim(friend.sessionId, code);
  entitlement.createPurchase(friend.sessionId);
  const bought = gift.createGiftPurchase(sharer.sessionId);
  const other = pairedBuyer("other@example.com", "other.partner@example.com").buyer;
  gift.redeem(other.sessionId, bought.token);

  const actions = audit.list({ limit: 100 }).map((row) => row.action);
  for (const expected of ["referral-claimed", "referral-credited", "gift-issued", "gift-redeemed"]) {
    assert.ok(actions.includes(expected), `${expected} is recorded`);
  }
  assert.equal(audit.list({ action: "referral-credited" })[0].context.rewarded, true);
  assert.equal(audit.list({ action: "entitlement-granted" })[0].context.source, "gift");

  const history = JSON.stringify(store.snapshot().auditEvents);
  for (const secret of ["sharer@example.com", "friend@example.com", code, bought.token]) {
    assert.equal(history.includes(secret), false, `the log must not carry ${String(secret).slice(0, 10)}…`);
  }
});

test("deleting an account takes its referral trail and its live gift links with it", async () => {
  const { createAccount } = await import("../server/account.mjs");
  const store = createMemoryStore();
  const audit = createAudit({ store });
  const couple = createCouple({ store, audit });
  let referral;
  const entitlement = createEntitlement({
    store, pack, audit,
    onEntitled: ({ workspaceId, at }) => referral?.creditPurchase({ workspaceId, at })
  });
  const gift = createGift({ store, entitlement, pack, audit });
  referral = createReferral({ store, gift, rewardEvery: 1, audit });
  const account = createAccount({ store, audit });
  const auth = createAuth({
    store, audit,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const login = (email) => auth.consumeMagicLink(auth.requestMagicLink(email).token);

  const leaver = login("leaver@example.com");
  const code = referral.viewFor(leaver.sessionId).code;
  const unsent = gift.createGiftPurchase(leaver.sessionId);

  const friend = login("friend@example.com");
  assert.equal(referral.claim(friend.sessionId, code).ok, true);

  assert.equal(account.deleteAccount(leaver.sessionId, { confirm: true }).ok, true);

  const state = store.snapshot();
  assert.equal(state.referralCodes.length, 0, "the code stops resolving");
  assert.equal(state.referrals.length, 0, "the trail names two people, so it goes with either");
  assert.equal(state.packGifts.length, 0, "an unredeemed present is not left openable by its holder");
  assert.equal(gift.previewGift(unsent.token).ok, false, "the link is dead, not orphaned");

  const history = JSON.stringify(state.auditEvents);
  assert.ok(state.auditEvents.length > 0, "the history survives the account");
  assert.equal(history.includes("leaver@example.com"), false);
  assert.equal(history.includes(code), false, "a referral code is an identifier, not an audit fact");
});

test("a reward already earned survives the departure of the person who triggered it", async () => {
  const { createAccount } = await import("../server/account.mjs");
  const store = createMemoryStore();
  const couple = createCouple({ store });
  let referral;
  const entitlement = createEntitlement({
    store, pack,
    onEntitled: ({ workspaceId, at }) => referral?.creditPurchase({ workspaceId, at })
  });
  const gift = createGift({ store, entitlement, pack });
  referral = createReferral({ store, gift, rewardEvery: 1 });
  const account = createAccount({ store });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const login = (email) => auth.consumeMagicLink(auth.requestMagicLink(email).token);

  const sharer = login("sharer@example.com");
  const code = referral.viewFor(sharer.sessionId).code;
  const friend = login("friend@example.com");
  const invite = couple.issueInvite(friend.sessionId, "friend.p@example.com");
  const friendPartner = login("friend.p@example.com");
  couple.acceptInvite(friendPartner.sessionId, invite.token);
  referral.claim(friend.sessionId, code);
  entitlement.createPurchase(friend.sessionId);

  const earned = gift.listSent(sharer.sessionId).gifts[0];
  assert.equal(earned.origin, "referral");

  assert.equal(account.deleteAccount(friend.sessionId, { confirm: true }).ok, true);

  const still = gift.listSent(sharer.sessionId);
  assert.equal(still.gifts.length, 1, "the present is the sharer's now; it is not a fact about the leaver");
  assert.ok(still.gifts[0].token, "and it is still sendable");
  assert.equal(referral.viewFor(sharer.sessionId).credited, 0, "but the trail itself is gone");
});
