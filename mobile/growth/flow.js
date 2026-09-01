import { shareInviteChannel } from "../../src/auth.js";
import { isGiftSendable, toNextReward } from "../../src/growth.js";
import { APP_GIFT_COPY, APP_RECOMMEND_COPY, APP_SHARE_COPY, assertLockedGrowthAppCopy, giftCtaLabel, giftErrorCopy, giftStatusLabel } from "./copy.js";

export const APP_RECOMMEND_SCREEN = "recommend";
export const APP_GIFT_SCREEN = "gift";

assertLockedGrowthAppCopy();

/**
 * View models for the two app screens.
 *
 * They are plain functions over plain data for the same reason the S4 model is: React Native
 * cannot be imported in this repository's test runner, so everything worth asserting lives here
 * and the components stay a thin arrangement of what these return.
 *
 * The share row is one shape used three times — invite, recommend, gift — so a person who has
 * sent one of these links has already learned the other two.
 */
export function shareRowModel({ url = "", copied = false, failed = false } = {}) {
  const has = Boolean(url);
  return {
    visible: has,
    url: has ? url : "",
    buttons: has ? [APP_SHARE_COPY.copyLink, APP_SHARE_COPY.instagram, APP_SHARE_COPY.kakao] : [],
    copied: has && copied ? APP_SHARE_COPY.copied : "",
    // The link stays on screen when copying fails, which is the whole point of the failure line.
    copyFailed: has && failed ? APP_SHARE_COPY.copyFailed : ""
  };
}

export function recommendViewModel({
  code = "",
  url = "",
  joined = 0,
  credited = 0,
  rewardEvery = 3,
  copied = false,
  failed = false,
  error = ""
} = {}) {
  return {
    screen: APP_RECOMMEND_SCREEN,
    title: APP_RECOMMEND_COPY.title,
    body: APP_RECOMMEND_COPY.body,
    codeLabel: code ? APP_RECOMMEND_COPY.codeLabel : "",
    code,
    countsLabel: APP_RECOMMEND_COPY.countsLabel,
    joined: Number(joined) || 0,
    rewardRule: APP_RECOMMEND_COPY.rewardRule,
    toNextReward: toNextReward({ credited, rewardEvery }),
    share: shareRowModel({ url, copied, failed }),
    error
  };
}

/**
 * One row per present. A spent one keeps its place in the list — the giver should be able to see
 * that it landed — but offers neither a link nor a way to take it back.
 */
export function giftRowModel(gift = {}, { copied = false, failed = false, activeUrl = "" } = {}) {
  const sendable = isGiftSendable(gift);
  const mine = activeUrl && activeUrl === gift.url;
  return {
    id: gift.id || "",
    status: gift.status || "ok",
    statusLabel: giftStatusLabel(gift.status),
    origin: gift.origin || "purchase",
    share: sendable ? shareRowModel({ url: gift.url, copied: copied && mine, failed: failed && mine }) : shareRowModel({}),
    revoke: gift.status === "used" ? "" : APP_GIFT_COPY.revoke
  };
}

export function giftViewModel({
  gifts = [],
  credits = 0,
  busy = false,
  error = "",
  copied = false,
  failed = false,
  activeUrl = ""
} = {}) {
  const spare = Number(credits) || 0;
  return {
    screen: APP_GIFT_SCREEN,
    title: APP_GIFT_COPY.title,
    body: APP_GIFT_COPY.body,
    // A returned slot has to say so on the button, or a free present reads as a second payment.
    cta: giftCtaLabel(spare),
    creditLabel: spare > 0 ? APP_GIFT_COPY.creditLabel : "",
    credits: spare,
    creditNote: spare > 0 ? APP_GIFT_COPY.creditRestored : "",
    sentTitle: gifts.length ? APP_GIFT_COPY.sentTitle : "",
    rows: gifts.map((gift) => giftRowModel(gift, { copied, failed, activeUrl })),
    busy: Boolean(busy),
    error
  };
}

/** What the receiver sees inside the app when a present link handed them off to it. */
export function giftRedeemViewModel({ preview = null, signedIn = false, accepted = false, busy = false, error = "" } = {}) {
  const failure = error || (preview && preview.ok === false ? giftErrorCopy(preview.error) : "");
  return {
    title: APP_GIFT_COPY.arrivedTitle,
    body: APP_GIFT_COPY.arrivedBody,
    error: failure,
    accepted: Boolean(accepted),
    // No accept button while there is nothing to accept, or nowhere to accept it into.
    accept: !failure && !accepted && signedIn ? APP_GIFT_COPY.accept : "",
    loginRequired: !failure && !accepted && !signedIn ? APP_GIFT_COPY.loginRequired : "",
    busy: Boolean(busy)
  };
}

export async function shareGrowthLink(url, channel, io = {}, text = "") {
  return shareInviteChannel(url, channel, io, text || APP_GIFT_COPY.body);
}
