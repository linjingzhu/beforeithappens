import { INVITE_COPY } from "./auth.js";

/**
 * Recommending a friend, and giving the pack away.
 *
 * Both are links you send to someone who is not your partner, which is what separates them from
 * an invitation: an invitation is bound to one email and joins one workspace, and nothing here
 * may ever become a way into somebody's private pack.
 *
 * Hearts are deliberately absent. `src/hearts.js` is arithmetic over a number the client holds and
 * `server/` has never stored a balance, so a gifted heart would be a gift of nothing. What opens
 * the remaining questions is the workspace entitlement, so that is what a present moves.
 */
export const RECOMMEND_COPY = Object.freeze({
  title: "친구에게 추천하기",
  body: "링크를 보내면 친구도 여기서 시작할 수 있어요.",
  codeLabel: "내 추천 코드",
  countsLabel: "함께 시작한 친구",
  rewardRule: "추천한 친구가 결혼 팩을 열면 선물을 드려요."
});

export const GIFT_COPY = Object.freeze({
  title: "결혼 팩 선물하기",
  body: "링크를 받은 사람이 열면, 그 사람의 팩이 열려요. 내 팩은 그대로예요.",
  cta: "선물 링크 만들기",
  sentTitle: "보낸 선물",
  statusWaiting: "아직 받지 않았어요",
  statusUsed: "받았어요",
  statusExpired: "기한이 지났어요",
  statusRevoked: "취소했어요",
  revoke: "링크 취소하기",
  creditLabel: "보낼 수 있는 선물",
  creditRestored: "취소한 선물은 다시 보낼 수 있어요. 결제는 한 번만 해요.",
  freeCta: "선물 링크 다시 만들기",
  arrivedTitle: "선물이 도착했어요.",
  arrivedBody: "결혼 팩을 열 수 있는 선물이에요.",
  accept: "선물 받기",
  loginRequired: "선물을 받으려면 먼저 로그인해 주세요."
});

export const GIFT_ERRORS = Object.freeze({
  used: "이미 사용된 선물이에요.",
  expired: "선물의 기한이 지났어요. 보낸 사람에게 새 링크를 부탁해 주세요.",
  revoked: "취소된 선물이에요.",
  invalid: "이미 사용된 선물이에요.",
  self: "내가 보낸 선물은 내가 받을 수 없어요.",
  "already-entitled": "이미 팩이 열려 있어요. 이 선물은 다른 사람에게 보낼 수 있어요."
});

/** The share row is shared with the invite screen on purpose: one gesture, learned once. */
export const SHARE_LABELS = Object.freeze({
  copyLink: INVITE_COPY.copyLink,
  instagram: INVITE_COPY.instagram,
  kakao: INVITE_COPY.kakao,
  copied: INVITE_COPY.copied,
  copyFailed: INVITE_COPY.copyFailed
});

export function giftStatusLabel(status) {
  if (status === "used") return GIFT_COPY.statusUsed;
  if (status === "expired") return GIFT_COPY.statusExpired;
  if (status === "revoked") return GIFT_COPY.statusRevoked;
  return GIFT_COPY.statusWaiting;
}

export function giftErrorCopy(error) {
  return GIFT_ERRORS[String(error || "")] || GIFT_ERRORS.invalid;
}

/** Only an unredeemed, unrevoked present is still worth offering a link for. */
export function isGiftSendable(gift) {
  return Boolean(gift) && gift.status === "ok" && Boolean(gift.url || gift.token);
}

export function canRevokeGift(gift) {
  return Boolean(gift) && gift.status !== "used";
}

/**
 * Making a present is free while a cancelled or expired one has released its slot, so the button
 * has to say which it is. Offering `선물 링크 만들기` to someone who will not be charged reads as a
 * second payment, and that is the moment a person stops trusting the screen.
 */
export function giftCtaLabel(credits) {
  return Number(credits) > 0 ? GIFT_COPY.freeCta : GIFT_COPY.cta;
}

/**
 * How many more paying friends until the next present. Mirrors the server's counting rule rather
 * than restating it: `credited` is how many have paid, `rewardEvery` is the threshold.
 */
export function toNextReward({ credited = 0, rewardEvery = 3 } = {}) {
  const every = Number(rewardEvery) > 0 ? Number(rewardEvery) : 1;
  const done = Number(credited) || 0;
  const remainder = done % every;
  return remainder === 0 && done > 0 ? every : every - remainder;
}

export function assertLockedGrowthCopy() {
  if (RECOMMEND_COPY.title !== "친구에게 추천하기") throw new Error("recommend title drifted");
  if (GIFT_COPY.title !== "결혼 팩 선물하기") throw new Error("gift title drifted");
  if (GIFT_COPY.accept !== "선물 받기") throw new Error("gift accept drifted");
  if (GIFT_COPY.creditRestored !== "취소한 선물은 다시 보낼 수 있어요. 결제는 한 번만 해요.") {
    throw new Error("gift credit line drifted");
  }
  if (SHARE_LABELS.kakao !== INVITE_COPY.kakao) throw new Error("share labels drifted from the invite row");
  if (SHARE_LABELS.copyFailed !== INVITE_COPY.copyFailed) throw new Error("copy-failure line drifted");
  return true;
}
