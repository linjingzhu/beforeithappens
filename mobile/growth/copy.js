import { INVITE_COPY } from "../../src/auth.js";
import { GIFT_COPY, RECOMMEND_COPY, giftCtaLabel, giftErrorCopy, giftStatusLabel } from "../../src/growth.js";

/**
 * The app's recommend and gift copy is the web's copy, re-exported rather than re-typed.
 *
 * S4 learned this the expensive way: a second hand-written table of the same Korean words drifts,
 * and nobody notices until two surfaces disagree in front of a user. So these are references, and
 * `assertLockedGrowthAppCopy()` fails the build if anyone turns one back into a literal.
 */
export const APP_RECOMMEND_COPY = Object.freeze({ ...RECOMMEND_COPY });
export const APP_GIFT_COPY = Object.freeze({ ...GIFT_COPY });

/** The share row is the invite's row on every surface, app included. */
export const APP_SHARE_COPY = Object.freeze({
  copyLink: INVITE_COPY.copyLink,
  instagram: INVITE_COPY.instagram,
  kakao: INVITE_COPY.kakao,
  copied: INVITE_COPY.copied,
  copyFailed: INVITE_COPY.copyFailed
});

export { giftCtaLabel, giftErrorCopy, giftStatusLabel };

export function assertLockedGrowthAppCopy() {
  if (APP_RECOMMEND_COPY.title !== RECOMMEND_COPY.title) throw new Error("app recommend title drifted");
  if (APP_RECOMMEND_COPY.rewardRule !== RECOMMEND_COPY.rewardRule) throw new Error("app reward rule drifted");
  if (APP_GIFT_COPY.title !== GIFT_COPY.title) throw new Error("app gift title drifted");
  if (APP_GIFT_COPY.accept !== GIFT_COPY.accept) throw new Error("app gift accept drifted");
  if (APP_GIFT_COPY.creditRestored !== GIFT_COPY.creditRestored) throw new Error("app credit line drifted");
  if (APP_SHARE_COPY.copyLink !== INVITE_COPY.copyLink) throw new Error("app share label drifted");
  if (APP_SHARE_COPY.kakao !== INVITE_COPY.kakao) throw new Error("app KakaoTalk label drifted");
  if (APP_SHARE_COPY.copyFailed !== INVITE_COPY.copyFailed) throw new Error("app copy-failure line drifted");
  return true;
}
