import { createAuthApi } from "../s0-s2-s3-api.js";
import {
  acknowledgeLoginNotice,
  applyScreen,
  consumeOpenedLink,
  createNativeFlow,
  finishSplash,
  loggedOutHome,
  logoutAccount,
  restoreSessionAfterSplash,
  startSocialLogin,
  submitEmailBind,
  submitMagicLink
} from "../s0-s2-s3-flow.js";
import { WITHDRAW_ERRORS } from "./copy.js";

let cookie = "";

export function apiOrigin() {
  return String(globalThis.process?.env?.EXPO_PUBLIC_API_ORIGIN || "");
}

export function hostCookieAccess() {
  return {
    origin: apiOrigin(),
    getCookie: () => cookie,
    setCookie: (value) => { cookie = value; }
  };
}

export function createHostApi() {
  return createAuthApi(hostCookieAccess());
}

export function isLoggedIn(session) {
  return Boolean(session?.user);
}

export function afterSplashScreen(loggedIn = isLoggedIn()) {
  return loggedIn ? "pack-list" : "signup";
}

export function startHostFlow() {
  return createNativeFlow();
}

export function splashOpenResult(opened, next) {
  if (next?.splashDone && next.screen && next.screen !== "splash") return next;
  return finishSplash(opened);
}

export async function finishHostSplash(state, api = createHostApi()) {
  try {
    return splashOpenResult(state, await restoreSessionAfterSplash(state, api));
  } catch {
    return finishSplash(state);
  }
}

export async function sendHostMagicLink(state, api = createHostApi()) {
  return submitMagicLink(state, api);
}

export async function consumeHostMagicLink(state, tokenOrUrl, api = createHostApi()) {
  return consumeOpenedLink(state, api, tokenOrUrl);
}

export async function ackHostNotice(state, api = createHostApi()) {
  return acknowledgeLoginNotice(state, api);
}

export async function startHostSocial(state, provider, api = createHostApi()) {
  return startSocialLogin(state, api, provider);
}

export async function sendHostEmailBind(state, api = createHostApi()) {
  return submitEmailBind(state, api);
}

export async function logoutHost(state, api = createHostApi()) {
  return logoutAccount(state, api);
}

/**
 * 탈퇴. The account screen has already taken the second confirmation, so this deletes.
 * Success lands on the same logged-out home as a logout; a failure keeps the user signed in
 * on the account screen and says so, because a silent no-op would read as "탈퇴됐다".
 */
export async function withdrawHost(state, api = createHostApi()) {
  let result;
  try {
    result = await api.deleteAccount?.();
  } catch {
    result = { ok: false, error: "failed" };
  }
  if (!result?.ok) {
    return applyScreen({
      ...state,
      busy: false,
      error: WITHDRAW_ERRORS[result?.error] || WITHDRAW_ERRORS.failed
    });
  }
  return loggedOutHome({ ...state, error: "" });
}
