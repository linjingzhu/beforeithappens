import test from "node:test";
import assert from "node:assert/strict";
import { createAuth } from "../server/auth.mjs";
import { createEntitlement, PACK_PRICE_KRW } from "../server/entitlement.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";

const pack = { id: "marriage-preparation", version: "2026.08-preview.2" };

function system() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const entitlement = createEntitlement({ store, pack });
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
  return { store, couple, entitlement, auth, login, pair };
}

test("purchase stays locked until an accepted partner exists", () => {
  const { entitlement, login } = system();
  assert.equal(entitlement.viewFor(null).error, "unauthenticated");
  const buyer = login("buyer@example.com");
  assert.equal(entitlement.viewFor(buyer.sessionId).error, "locked");
  assert.equal(entitlement.createPurchase(buyer.sessionId).error, "locked");
});

test("buyer one 29000 KRW purchase entitles the workspace; partner cannot pay", () => {
  const { entitlement, pair, store } = system();
  const { buyer, partner } = pair();
  const before = entitlement.viewFor(buyer.sessionId);
  assert.equal(before.entitled, false);
  assert.equal(before.canPurchase, true);
  assert.equal(before.amount, PACK_PRICE_KRW);

  const partnerView = entitlement.viewFor(partner.sessionId);
  assert.equal(partnerView.canPurchase, false);
  assert.equal(entitlement.createPurchase(partner.sessionId).error, "forbidden");

  const paid = entitlement.createPurchase(buyer.sessionId);
  assert.equal(paid.ok, true);
  assert.equal(paid.entitled, true);
  assert.equal(paid.purchase.amount, 29000);
  assert.equal(paid.purchase.currency, "KRW");
  assert.equal(entitlement.viewFor(partner.sessionId).entitled, true);
  assert.equal(store.snapshot().entitlements.length, 1);
  assert.equal(store.snapshot().purchases[0].amount, 29000);

  const again = entitlement.createPurchase(buyer.sessionId);
  assert.equal(again.ok, true);
  assert.equal(again.alreadyEntitled, true);
  assert.equal(store.snapshot().purchases.length, 1);
  assert.equal(store.snapshot().entitlements.length, 1);
});

test("webhook grant is idempotent on event id", () => {
  const { entitlement, pair, store } = system();
  const { buyer } = pair();
  entitlement.createPurchase(buyer.sessionId);
  const orderId = store.snapshot().purchases[0].orderId;
  const first = entitlement.applyWebhook({ eventId: "evt-1", orderId });
  const replay = entitlement.applyWebhook({ eventId: "evt-1", orderId });
  assert.equal(first.ok, true);
  assert.equal(replay.ok, true);
  assert.equal(replay.duplicate, true);
  assert.equal(store.snapshot().entitlements.length, 1);
  assert.equal(store.snapshot().webhookEvents.filter((row) => row.eventId === "evt-1").length, 1);
});
