import { createAuthApi } from "../s0-s2-s3-api.js";
import {
  acknowledgeLoginNotice,
  consumeOpenedLink,
  createNativeFlow,
  finishSplash,
  restoreSessionAfterSplash,
  startSocialLogin,
  submitEmailBind,
  submitMagicLink
} from "../s0-s2-s3-flow.js";

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
  return loggedIn ? "session" : "signup";
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
