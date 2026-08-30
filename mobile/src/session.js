import { createAuthApi } from "../s0-s2-s3-api.js";
import {
  acknowledgeLoginNotice,
  consumeOpenedLink,
  createNativeFlow,
  restoreSessionAfterSplash,
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

export async function finishHostSplash(state, api = createHostApi()) {
  return restoreSessionAfterSplash(state, api);
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
