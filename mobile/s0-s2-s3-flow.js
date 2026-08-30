import { S2_ERRORS, S2_SOCIAL_COPY } from "./s0-s2-s3-copy.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emptyNativeSession() {
  return { user: null, notice: null, workspace: { id: null, role: null, acceptedPartner: false } };
}

export function createNativeFlow(session = emptyNativeSession()) {
  return {
    screen: "splash",
    splashDone: false,
    email: "",
    sentEmail: "",
    error: "",
    busy: false,
    noticeDismissed: false,
    session,
    action: ""
  };
}

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || "").trim().toLowerCase());
}

export function canOpenPack(session) {
  return Boolean(session?.user && session.workspace?.acceptedPartner === true);
}

export function userNeedsEmail(user) {
  return Boolean(user) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(user.email || "").trim());
}

export function resolveNativeScreen(state) {
  if (!state?.splashDone) return "splash";
  if (!state.session?.user) return state.sentEmail ? "sent" : "signup";
  if (userNeedsEmail(state.session.user)) return state.sentEmail ? "sent" : "bind";
  if (state.session.notice && !state.noticeDismissed) return "notice";
  return "workspace";
}

export function applyScreen(state) {
  return { ...state, screen: resolveNativeScreen(state), action: "" };
}

export function finishSplash(state) {
  return applyScreen({ ...state, splashDone: true });
}

export function setEmail(state, email) {
  return { ...state, email: String(email || ""), error: "" };
}

export function backToSignup(state) {
  return applyScreen({ ...state, sentEmail: "", error: "", busy: false });
}

export function requestLinkStarted(state) {
  const email = String(state.email || "").trim();
  if (!isValidEmail(email)) {
    return applyScreen({ ...state, busy: false, error: S2_ERRORS["invalid-email"] });
  }
  return { ...state, email, busy: true, error: "" };
}

export function requestLinkSucceeded(state) {
  return applyScreen({
    ...state,
    busy: false,
    error: "",
    sentEmail: state.email,
    screen: "sent"
  });
}

export function requestLinkFailed(state, error = "failed") {
  return applyScreen({
    ...state,
    busy: false,
    error: S2_ERRORS[error] || S2_ERRORS.failed
  });
}

export function consumeSucceeded(state, session) {
  return applyScreen({
    ...state,
    busy: false,
    error: "",
    sentEmail: "",
    noticeDismissed: false,
    session: session || emptyNativeSession()
  });
}

export function consumeFailed(state, error = "invalid") {
  return applyScreen({
    ...state,
    busy: false,
    splashDone: true,
    sentEmail: "",
    session: emptyNativeSession(),
    error: S2_ERRORS[error] || S2_ERRORS.invalid
  });
}

export function noticeAcknowledged(state, session) {
  return applyScreen({
    ...state,
    noticeDismissed: true,
    session: session || { ...state.session, notice: null }
  });
}

export function invitePartner(state) {
  if (state.screen !== "workspace") return { ...state, action: "" };
  return { ...state, action: "invite-partner" };
}

export function s3AllowsPackCta(_state) {
  return false;
}

export function s2HasKakaoLogin() {
  return false;
}

export function s2SocialStartLabels() {
  return [S2_SOCIAL_COPY.kakao, S2_SOCIAL_COPY.naver, S2_SOCIAL_COPY.google];
}

export function oauthStartFailed(state, error = "oauth-unconfigured") {
  return applyScreen({
    ...state,
    busy: false,
    error: S2_ERRORS[error] || S2_ERRORS["oauth-unconfigured"]
  });
}

export function s3HasPayment() {
  return false;
}

export function s0ShowsInstallLanding() {
  return false;
}

export async function submitMagicLink(state, api) {
  const started = requestLinkStarted(state);
  if (started.error) return started;
  try {
    const result = await api.requestMagicLink(started.email);
    if (!result.ok) return requestLinkFailed(started, result.error);
    return requestLinkSucceeded(started);
  } catch {
    return requestLinkFailed(started, "failed");
  }
}

export async function consumeOpenedLink(state, api, tokenOrUrl) {
  const next = { ...state, splashDone: true, busy: true, error: "" };
  try {
    const result = await api.consumeMagicLink(tokenOrUrl);
    if (!result.ok) return consumeFailed(next, result.error);
    return consumeSucceeded(next, result.session);
  } catch {
    return consumeFailed(next, "invalid");
  }
}

export async function restoreSessionAfterSplash(state, api) {
  const next = finishSplash(state);
  try {
    const session = await api.session();
    if (!session?.user) return next;
    return applyScreen({
      ...next,
      session,
      noticeDismissed: !session.notice,
      error: ""
    });
  } catch {
    return next;
  }
}

export async function startSocialLogin(state, api, provider) {
  const pending = { ...state, splashDone: true, busy: true, error: "" };
  try {
    const result = await api.startOAuth(provider);
    if (!result.ok) return oauthStartFailed(pending, result.error);
    return { ...pending, busy: false, action: "oauth-redirect", oauthUrl: result.url };
  } catch {
    return oauthStartFailed(pending, "oauth-unconfigured");
  }
}

export async function submitEmailBind(state, api) {
  const email = String(state.email || "").trim();
  if (!isValidEmail(email)) {
    return applyScreen({ ...state, busy: false, error: S2_ERRORS["invalid-email"] });
  }
  const started = { ...state, email, busy: true, error: "" };
  try {
    const result = await api.requestEmailBind(started.email);
    if (!result.ok) return requestLinkFailed(started, result.error);
    return requestLinkSucceeded(started);
  } catch {
    return requestLinkFailed(started, "failed");
  }
}

export async function acknowledgeLoginNotice(state, api) {
  const pending = { ...state, busy: true, error: "" };
  try {
    const result = await api.acknowledgeNotice();
    if (!result.ok) return { ...pending, busy: false, error: S2_ERRORS.failed };
    return { ...noticeAcknowledged(pending, result.session), busy: false, error: "" };
  } catch {
    return { ...pending, busy: false, error: S2_ERRORS.failed };
  }
}
