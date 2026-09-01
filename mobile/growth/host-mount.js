import { apiOrigin } from "../src/session.js";
import { giftRedeemUrl, referralCodeFromPath, referralUrl } from "../../src/pair-code.js";
import { createGrowthApi } from "./api.js";
import { APP_GIFT_SCREEN, APP_RECOMMEND_SCREEN, shareGrowthLink } from "./flow.js";
import { APP_GIFT_COPY, APP_RECOMMEND_COPY } from "./copy.js";

/**
 * Host wiring for the two screens.
 *
 * The links are built here rather than trusted from the server response, for the same reason S4
 * had to be fixed: the app is not a page, so a relative path is a string nobody can open. Every
 * link leaves this module absolute or it does not leave at all.
 */
let shareIo = null;

export function setGrowthShareIo(io) {
  shareIo = io;
}

export function createHostGrowthApi(cookieAccess = {}) {
  return createGrowthApi({ ...cookieAccess, origin: cookieAccess.origin || apiOrigin() });
}

function resolveOrigin(state) {
  return String(state?.io?.origin || apiOrigin() || "").replace(/\/$/, "");
}

/** An absolute link, or an empty string — never a bare path that silently shares nothing. */
export function growthRecommendUrl(state, code) {
  const origin = resolveOrigin(state);
  if (!origin || !code) return "";
  return referralUrl(origin, code);
}

export function growthGiftUrl(state, token) {
  const origin = resolveOrigin(state);
  if (!origin || !token) return "";
  return giftRedeemUrl(origin, token);
}

export function openRecommend(state) {
  return { ...state, screen: APP_RECOMMEND_SCREEN, recommendOpen: true, giftOpen: false, copied: false, error: "" };
}

export function openGift(state) {
  return { ...state, screen: APP_GIFT_SCREEN, giftOpen: true, recommendOpen: false, copied: false, error: "" };
}

export function closeGrowth(state) {
  return { ...state, recommendOpen: false, giftOpen: false, screen: "account", copied: false, error: "" };
}

export async function loadRecommend(state, api = createHostGrowthApi()) {
  const result = await api.referral();
  if (!result.ok) return { ...state, busy: false, error: result.payload?.error || "failed" };
  const payload = result.payload || {};
  return {
    ...state,
    busy: false,
    error: "",
    referral: {
      code: payload.code || "",
      url: growthRecommendUrl(state, payload.code) || payload.url || "",
      joined: payload.joined || 0,
      credited: payload.credited || 0,
      rewardEvery: payload.rewardEvery || 3
    }
  };
}

export async function loadGifts(state, api = createHostGrowthApi()) {
  const result = await api.sentGifts();
  if (!result.ok) return { ...state, busy: false, error: result.payload?.error || "failed" };
  const payload = result.payload || {};
  return {
    ...state,
    busy: false,
    error: "",
    giftCredits: payload.credits || 0,
    gifts: (payload.gifts || []).map((gift) => ({
      ...gift,
      url: gift.token ? growthGiftUrl(state, gift.token) : (gift.url || "")
    }))
  };
}

export async function createGiftFromHost(state, api = createHostGrowthApi()) {
  const result = await api.createGift();
  if (!result.ok) return { ...state, busy: false, error: result.payload?.error || "failed" };
  // Re-read rather than splice the new present in: the balance moved too, and one source is safer.
  return loadGifts({ ...state, busy: false, error: "" }, api);
}

export async function revokeGiftFromHost(state, giftId, api = createHostGrowthApi()) {
  const result = await api.revokeGift(giftId);
  if (!result.ok) return { ...state, busy: false, error: result.payload?.error || "failed" };
  return loadGifts({ ...state, busy: false, error: "" }, api);
}

export async function shareRecommendFromHost(state, channel, io = shareIo || {}) {
  const url = state?.referral?.url || growthRecommendUrl(state, state?.referral?.code);
  if (!url) return { ...state, copied: false, shareFailed: true };
  const result = await shareGrowthLink(url, channel, io, APP_RECOMMEND_COPY.body);
  return { ...state, copied: result === "copied", shareFailed: result === "failed", activeShareUrl: url };
}

export async function shareGiftFromHost(state, giftId, channel, io = shareIo || {}) {
  const gift = (state?.gifts || []).find((row) => row.id === giftId);
  const url = gift?.url || "";
  if (!url) return { ...state, copied: false, shareFailed: true };
  const result = await shareGrowthLink(url, channel, io, APP_GIFT_COPY.body);
  return { ...state, copied: result === "copied", shareFailed: result === "failed", activeShareUrl: url };
}

/**
 * A recommendation link opened the app. The code is claimed once there is an account to attach it
 * to; before that it is only remembered, because claiming needs a session and pushing the person
 * through login first would lose the code.
 */
export function readGrowthOpenParams(loc = globalThis.location) {
  if (!loc) return { referralCode: "", giftToken: "" };
  try {
    const path = String(loc.pathname || "");
    const params = new URLSearchParams(loc.search || "");
    const referralCode = referralCodeFromPath(path);
    if (referralCode) return { referralCode, giftToken: "" };
    if (path === "/gift/redeem" || params.get("gift")) {
      return { referralCode: "", giftToken: params.get("token") || params.get("gift") || "" };
    }
    return { referralCode: "", giftToken: "" };
  } catch {
    return { referralCode: "", giftToken: "" };
  }
}

export async function claimPendingReferral(state, api = createHostGrowthApi()) {
  const code = state?.pendingReferralCode || "";
  if (!code || !state?.session?.user) return state;
  const result = await api.claim(code);
  // A refusal is not worth interrupting anyone over: they still get the product either way.
  return { ...state, pendingReferralCode: "", referralClaimed: Boolean(result.ok) };
}
