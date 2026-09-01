import { invitePartner } from "../s0-s2-s3-flow.js";
import { extractMagicLinkToken } from "../s0-s2-s3-api.js";
import { apiOrigin, consumeHostMagicLink, finishHostSplash } from "../src/session.js";
import { INVITE_ERRORS, absoluteInviteUrl } from "../../src/auth.js";
import { createInviteApi } from "./api.js";
import { APP_S4_SCREEN, resolveNativeInviteScreen, shareS4Invite } from "./flow.js";

export function readHostOpenParams(loc = globalThis.location) {
  if (!loc) return { magicToken: "", inviteToken: "" };
  try {
    const href = String(loc.href || "");
    if (href.includes("://")) {
      const magicToken = extractMagicLinkToken(href);
      if (magicToken) return { magicToken, inviteToken: "" };
    }
    const params = new URLSearchParams(loc.search || "");
    const path = String(loc.pathname || "");
    if (path === "/invite/accept" || params.get("invite")) {
      return { magicToken: "", inviteToken: params.get("token") || params.get("invite") || "" };
    }
    return { magicToken: params.get("token") || "", inviteToken: "" };
  } catch {
    return { magicToken: "", inviteToken: "" };
  }
}

export function openS4FromWorkspace(state) {
  const next = invitePartner(state);
  return {
    ...next,
    screen: APP_S4_SCREEN,
    copied: false,
    invite: state.session?.workspace?.invite || null,
    partnerEmail: state.session?.workspace?.invite?.email || ""
  };
}

export function createHostInviteApi(cookieAccess = {}) {
  return createInviteApi(cookieAccess);
}

export async function finishHostOpen(opened, hostApi, inviteApi = createInviteApi(), loc = globalThis.location) {
  const { magicToken, inviteToken } = readHostOpenParams(loc);
  if (magicToken) return consumeHostMagicLink(opened, magicToken, hostApi);
  const after = await finishHostSplash(opened, hostApi);
  if (!inviteToken) return after;
  const preview = await inviteApi.preview(inviteToken);
  const openedWhileSignedIn = Boolean(after.session?.user);
  return {
    ...after,
    screen: resolveNativeInviteScreen({
      session: after.session,
      preview: preview.payload,
      openedWhileSignedIn
    }),
    inviteToken,
    invitePreview: preview.payload,
    copied: false
  };
}

export async function sendS4Invite(state, email, inviteApi) {
  const result = await inviteApi.sendOrResend(email);
  if (!result.ok) {
    return {
      ...state,
      screen: APP_S4_SCREEN,
      error: INVITE_ERRORS[result.payload?.error] || INVITE_ERRORS.failed
    };
  }
  return {
    ...state,
    screen: APP_S4_SCREEN,
    error: "",
    copied: false,
    partnerEmail: result.payload.email || email,
    invite: result.payload.workspace?.invite || {
      status: "waiting",
      remainingMs: result.payload.expiresAt ? Date.parse(result.payload.expiresAt) - Date.now() : 0,
      lastSentAt: result.payload.lastSentAt,
      email: result.payload.email,
      url: result.payload.url
    },
    session: result.payload.session || {
      ...state.session,
      workspace: result.payload.workspace || state.session?.workspace
    }
  };
}

/**
 * The session hands back a path (`/invite/accept?token=...`), not a URL. A phone has no
 * page origin to resolve it against, so anything shared from the native host must be made
 * absolute against the deployment origin first or the friend receives an unopenable string.
 */
export function s4ShareUrl(state, origin = "") {
  const url = String(state?.invite?.url || "");
  if (!url) return "";
  if (url.includes("://")) return url;
  const base = String(origin || apiOrigin() || globalThis.location?.origin || "").replace(/\/$/, "");
  if (!base) return "";
  return absoluteInviteUrl(base, url);
}

/**
 * React Native has no `navigator.share` / `navigator.clipboard`; the RN screen module
 * registers the `Share` bridge here so the share buttons are not silent no-ops when the
 * host mounts them without passing an io of its own.
 */
let hostShareIo = null;

export function setHostShareIo(io) {
  hostShareIo = io && (io.share || io.clipboard) ? io : null;
}

export function currentHostShareIo() {
  return hostShareIo;
}

export async function shareS4FromHost(state, channel, io = {}) {
  const url = s4ShareUrl(state, io.origin);
  if (!url) return { ...state, screen: APP_S4_SCREEN, copied: false, copyFailed: false };
  const effective = io.share || io.clipboard ? io : (hostShareIo || io);
  const result = await shareS4Invite(url, channel, effective);
  return {
    ...state,
    screen: APP_S4_SCREEN,
    copied: result === "copied",
    copyFailed: result === "failed"
  };
}

export async function logoutFromS4Home(state, inviteApi) {
  await inviteApi.logoutAndContinue();
  return {
    splashDone: true,
    screen: "pack-list",
    email: "",
    sentEmail: "",
    error: "",
    busy: false,
    noticeDismissed: false,
    session: { user: null, notice: null, workspace: { acceptedPartner: false } }
  };
}

export async function logoutAndContinueFromS4(state, inviteApi) {
  await inviteApi.logoutAndContinue();
  return {
    splashDone: true,
    screen: "signup",
    email: state.invitePreview?.email || "",
    sentEmail: "",
    error: "",
    busy: false,
    noticeDismissed: false,
    session: { user: null, notice: null, workspace: { acceptedPartner: false } }
  };
}
