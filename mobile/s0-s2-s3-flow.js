import { S2_ERRORS } from "./s0-s2-s3-copy.js";
import { SESSION_FETCH_MS, withTimeout } from "./s0-s2-s3-api.js";
import {
  emptyPreviewDraft,
  isPreviewQ1Choice,
  PREVIEW_Q1_ID,
  writePreviewDraft
} from "./preview-q1.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emptyNativeSession() {
  return { user: null, notice: null, workspace: { id: null, role: null, acceptedPartner: false } };
}

export function createNativeFlow(session = emptyNativeSession(), { draft = emptyPreviewDraft() } = {}) {
  return {
    screen: "splash",
    splashDone: false,
    email: "",
    sentEmail: "",
    error: "",
    busy: false,
    noticeDismissed: false,
    session,
    action: "",
    previewQ1: {
      questionId: PREVIEW_Q1_ID,
      choiceId: draft.choiceId || "",
      open: Boolean(draft.open),
      keepAnswer: Boolean(draft.keepAnswer)
    }
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
  const draft = state.previewQ1 || emptyPreviewDraft();
  if (state.session?.user) {
    if (userNeedsEmail(state.session.user)) return state.sentEmail ? "sent" : "bind";
    if (draft.choiceId && draft.open && isPreviewQ1Choice(draft.choiceId)) return "preview-q1";
    if (state.session.notice && !state.noticeDismissed && !draft.choiceId) return "notice";
    return "workspace";
  }
  if (state.sentEmail) return "sent";
  if (draft.keepAnswer) return "signup";
  if (draft.open || draft.choiceId) return "preview-q1";
  return "cover";
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

export function consumeSucceeded(state, session, storage) {
  const draft = state.previewQ1 || emptyPreviewDraft();
  const hasPreview = Boolean(draft.choiceId && isPreviewQ1Choice(draft.choiceId));
  return persistDraft(applyScreen({
    ...state,
    busy: false,
    error: "",
    sentEmail: "",
    noticeDismissed: hasPreview,
    session: session || emptyNativeSession(),
    previewQ1: {
      questionId: PREVIEW_Q1_ID,
      choiceId: draft.choiceId || "",
      open: hasPreview,
      keepAnswer: false
    }
  }), storage);
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

function persistDraft(state, storage) {
  const draft = writePreviewDraft(state.previewQ1 || emptyPreviewDraft(), storage);
  return { ...state, previewQ1: draft };
}

export function openCover(state, storage) {
  return persistDraft(applyScreen({
    ...state,
    splashDone: true,
    previewQ1: { ...(state.previewQ1 || emptyPreviewDraft()), open: false, keepAnswer: false }
  }), storage);
}

export function openPreviewQ1(state, storage) {
  return persistDraft(applyScreen({
    ...state,
    splashDone: true,
    previewQ1: { ...(state.previewQ1 || emptyPreviewDraft()), open: true }
  }), storage);
}

export function selectPreviewChoice(state, choiceId, storage) {
  if (!isPreviewQ1Choice(choiceId)) {
    return applyScreen({ ...state, error: S2_ERRORS.invalid });
  }
  return persistDraft(applyScreen({
    ...state,
    splashDone: true,
    error: "",
    previewQ1: {
      questionId: PREVIEW_Q1_ID,
      choiceId,
      open: true,
      keepAnswer: Boolean(state.previewQ1?.keepAnswer)
    }
  }), storage);
}

export function keepPreviewAnswer(state, storage) {
  const choiceId = state.previewQ1?.choiceId || "";
  if (!isPreviewQ1Choice(choiceId)) {
    return applyScreen({ ...state, splashDone: true, error: S2_ERRORS.invalid });
  }
  if (state.session?.user) {
    return persistDraft(applyScreen({
      ...state,
      splashDone: true,
      error: "",
      previewQ1: { questionId: PREVIEW_Q1_ID, choiceId, open: true, keepAnswer: true }
    }), storage);
  }
  return persistDraft(applyScreen({
    ...state,
    splashDone: true,
    error: "",
    previewQ1: { questionId: PREVIEW_Q1_ID, choiceId, open: true, keepAnswer: true }
  }), storage);
}

export function continueFromPreviewQ1(state, storage) {
  if (!state.session?.user) return keepPreviewAnswer(state, storage);
  return persistDraft(applyScreen({
    ...state,
    splashDone: true,
    previewQ1: { ...(state.previewQ1 || emptyPreviewDraft()), open: false, keepAnswer: false }
  }), storage);
}

export function s3AllowsPackCta(_state) {
  return false;
}

export function s2HasKakaoLogin() {
  return false;
}

export function s2SocialStartLabels() {
  return [];
}

export function socialStartPending(state) {
  return { ...state, splashDone: true, busy: true, error: "" };
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

export async function restoreSessionAfterSplash(state, api, { timeoutMs = SESSION_FETCH_MS } = {}) {
  const next = finishSplash(state);
  try {
    const session = await withTimeout(Promise.resolve().then(() => api.session()), timeoutMs);
    if (!session?.user) return next;
    const draft = next.previewQ1 || emptyPreviewDraft();
    const hasPreview = Boolean(draft.choiceId && isPreviewQ1Choice(draft.choiceId));
    return applyScreen({
      ...next,
      session,
      noticeDismissed: hasPreview || !session.notice,
      previewQ1: hasPreview ? { ...draft, open: true } : draft,
      error: ""
    });
  } catch {
    return next;
  }
}

export async function startSocialLogin(state, api, provider) {
  const pending = socialStartPending(state);
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
