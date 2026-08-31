/** LoveMe NEXT heart ledger. One virtual SKU only: 29,000 KRW → 12 hearts. Unlock rest costs 10. */

export const HEARTS = Object.freeze({
  start: 0,
  unlockCost: 10,
  skuPriceKrw: 29000,
  skuHearts: 12
});

export const HEART_COPY = Object.freeze({
  unlockTitle: "두 사람 답을 비교했어요.",
  unlockBody: "나머지 문항을 이어서 열 수 있어요.",
  unlockCta: "열기",
  needHearts: "♡ 하트 10이 필요해요.",
  shopTitle: "상점",
  shopCta: "29,000원에 하트 12",
  shopCtaPlain: "29,000원에 하트 12",
  later: "나중에",
  partnerWait: "상대가 열면 이어집니다.",
  refund: "구매 후 취소 및 환불이 불가합니다.",
  legal: "이용약관 | 개인정보 처리방침"
});

export const HEART_FORBIDDEN = Object.freeze([
  "1000원",
  "1 heart SKU",
  "1하트",
  "29,000원에 나머지 열기"
]);

export function startingHearts() {
  return HEARTS.start;
}

export function showsHeartBalance(session) {
  return session?.workspace?.role !== "partner";
}

export function canUnlockRest(balance) {
  return Number(balance) >= HEARTS.unlockCost;
}

export function grantShopHearts(balance) {
  return Number(balance || 0) + HEARTS.skuHearts;
}

export function spendUnlockHearts(balance) {
  const current = Number(balance || 0);
  if (current < HEARTS.unlockCost) return { ok: false, balance: current };
  return { ok: true, balance: current - HEARTS.unlockCost };
}
