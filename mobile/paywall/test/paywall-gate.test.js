import test from "node:test";
import assert from "node:assert/strict";
import { SAMPLE_LOCK_COUNT } from "../../pack/contract/pack-gate.js";
import {
  canOpenQuestion,
  canStartPaywall,
  paywallScreen,
  remainingLocked,
  sampleLockCount,
  shouldShowPaywall
} from "../contract/paywall-gate.js";
import { PAYWALL_COPY } from "../contract/paywall-copy.js";

const pairedBuyer = { user: { id: "u1" }, workspace: { acceptedPartner: true, role: "buyer" } };
const pairedPartner = { user: { id: "u2" }, workspace: { acceptedPartner: true, role: "partner" } };
const ghost = { user: { id: "u1" }, workspace: { acceptedPartner: false, role: "buyer" } };

test("gate is off before invite accept and on questions 1–2", () => {
  assert.equal(canStartPaywall(ghost), false);
  assert.equal(shouldShowPaywall({ session: ghost, sampleLocks: 3, index: 2 }), false);
  assert.equal(shouldShowPaywall({ session: pairedBuyer, sampleLocks: 0, index: 0 }), false);
  assert.equal(shouldShowPaywall({ session: pairedBuyer, sampleLocks: 2, index: 1 }), false);
  assert.equal(shouldShowPaywall({ session: pairedBuyer, sampleLocks: 3, index: 0 }), false);
  assert.equal(shouldShowPaywall({ session: pairedBuyer, sampleLocks: 3, index: 1 }), false);
});

test("gate appears after the third sample lock and sits on the comparison", () => {
  assert.equal(SAMPLE_LOCK_COUNT, 3);
  assert.equal(shouldShowPaywall({ session: pairedBuyer, sampleLocks: 3, index: 2 }), true);
  const buyer = paywallScreen({ session: pairedBuyer, sampleLocks: 3, index: 2 });
  assert.equal(buyer.visible, true);
  assert.equal(buyer.variant, "buyer");
  assert.equal(buyer.canPurchase, true);
  assert.equal(buyer.title, PAYWALL_COPY.buyerTitle);
  assert.equal(buyer.body, PAYWALL_COPY.buyerBody);
  assert.equal(buyer.cta, PAYWALL_COPY.buyerCta);
  assert.equal(buyer.secondary, PAYWALL_COPY.later);

  const partner = paywallScreen({ session: pairedPartner, sampleLocks: 3, index: 2 });
  assert.equal(partner.visible, true);
  assert.equal(partner.variant, "partner");
  assert.equal(partner.canPurchase, false);
  assert.equal(partner.cta, "");
  assert.equal(partner.title, PAYWALL_COPY.partnerTitle);
  assert.deepEqual(partner.labels, ["ALIGNED", "CLOSE", "DISCUSS"]);
});

test("나중에 dismisses the gate without unlocking the rest", () => {
  const shown = shouldShowPaywall({ session: pairedBuyer, sampleLocks: 3, index: 2, dismissed: false });
  const hidden = shouldShowPaywall({ session: pairedBuyer, sampleLocks: 3, index: 2, dismissed: true });
  assert.equal(shown, true);
  assert.equal(hidden, false);
  assert.equal(remainingLocked({ entitled: false }), true);
  assert.equal(canOpenQuestion(3, { entitled: false }), false);
  assert.equal(canOpenQuestion(2, { entitled: false }), true);
  assert.equal(canOpenQuestion(3, { entitled: true }), true);
});

test("entitlement hides the gate and opens the remaining questions", () => {
  assert.equal(shouldShowPaywall({ session: pairedBuyer, sampleLocks: 3, entitled: true, index: 2 }), false);
  assert.equal(remainingLocked({ entitled: true }), false);
  assert.equal(sampleLockCount({
    questions: {
      "home-01": { lock: { id: "1" } },
      "home-02": { lock: { id: "2" } },
      "connection-01": { lock: { id: "3" } }
    }
  }, ["home-01", "home-02", "connection-01", "money-01"]), 3);
});
