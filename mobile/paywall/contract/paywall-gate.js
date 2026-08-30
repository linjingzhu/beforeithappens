import { SAMPLE_LOCK_COUNT } from "../../pack/contract/pack-gate.js";
import { PAYWALL_COPY } from "./paywall-copy.js";

export { SAMPLE_LOCK_COUNT };

export function sampleQuestionIds(questionIds = []) {
  return questionIds.slice(0, SAMPLE_LOCK_COUNT);
}

export function sampleLockCount(state, questionIds = []) {
  const samples = new Set(sampleQuestionIds(questionIds));
  let count = 0;
  for (const id of samples) {
    if (state?.questions?.[id]?.lock) count += 1;
  }
  return count;
}

export function isBuyerRole(session) {
  const role = session?.workspace?.role || session?.role;
  return role !== "partner" && role !== "b";
}

export function canStartPaywall(session) {
  return Boolean(session?.user && session.workspace?.acceptedPartner === true);
}

export function remainingLocked({ entitled = false } = {}) {
  return !entitled;
}

export function canOpenQuestion(index, { entitled = false } = {}) {
  if (!Number.isInteger(index) || index < 0) return false;
  if (index < SAMPLE_LOCK_COUNT) return true;
  return Boolean(entitled);
}

/** Gate sits on the sample comparison after the third sample lock. Not before invite accept. Not on questions 1–3. */
export function shouldShowPaywall({
  session,
  sampleLocks = 0,
  entitled = false,
  dismissed = false,
  index = 0
} = {}) {
  if (!canStartPaywall(session)) return false;
  if (entitled) return false;
  if (dismissed) return false;
  if (sampleLocks < SAMPLE_LOCK_COUNT) return false;
  if (Number.isInteger(index) && index < SAMPLE_LOCK_COUNT - 1) return false;
  return true;
}

export function paywallScreen({
  session,
  sampleLocks = 0,
  entitled = false,
  dismissed = false,
  index = 0
} = {}) {
  if (!shouldShowPaywall({ session, sampleLocks, entitled, dismissed, index })) {
    return { visible: false, variant: null, canPurchase: false, title: "", body: "", cta: "", secondary: "", labels: [] };
  }
  const buyer = isBuyerRole(session);
  if (buyer) {
    return {
      visible: true,
      variant: "buyer",
      canPurchase: true,
      title: PAYWALL_COPY.buyerTitle,
      body: PAYWALL_COPY.buyerBody,
      cta: PAYWALL_COPY.buyerCta,
      secondary: PAYWALL_COPY.later,
      labels: [PAYWALL_COPY.aligned, PAYWALL_COPY.close, PAYWALL_COPY.discuss]
    };
  }
  return {
    visible: true,
    variant: "partner",
    canPurchase: false,
    title: PAYWALL_COPY.partnerTitle,
    body: PAYWALL_COPY.partnerBody,
    cta: "",
    secondary: "",
    labels: [PAYWALL_COPY.aligned, PAYWALL_COPY.close, PAYWALL_COPY.discuss]
  };
}
