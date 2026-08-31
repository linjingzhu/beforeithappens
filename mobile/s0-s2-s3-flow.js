import { isComingSoonPackId, PAIR_ERRORS, S2_ERRORS } from "./s0-s2-s3-copy.js";
import { SESSION_FETCH_MS, withTimeout } from "./s0-s2-s3-api.js";
import { shareInviteChannel } from "../src/auth.js";
import { shareContainsPairCode } from "../src/pair-code.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emptyNativeSession() {
  return { user: null, notice: null, workspace: { id: null, role: null, acceptedPartner: false } };
}

export function createNativeFlow(session = emptyNativeSession(), {
  inviteOpen = false,
  packDetailOpen = false,
  accountOpen = false,
  comingSoonId = "",
  tasteResultOpen = false
} = {}) {
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
    packDetailOpen: Boolean(packDetailOpen),
    accountOpen: Boolean(accountOpen),
    inviteOpen: Boolean(inviteOpen),
    comingSoonId: isComingSoonPackId(comingSoonId) ? comingSoonId : "",
    tasteResultOpen: Boolean(tasteResultOpen) && isComingSoonPackId(comingSoonId),
    pairCode: "",
    pairCodeDisplay: "",
    inviteUrl: "",
    partnerCode: "",
    copied: false,
    codeCopied: false
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
  if (state.session?.user) {
    if (userNeedsEmail(state.session.user)) return state.sentEmail ? "sent" : "bind";
    if (state.sentEmail) return "sent";
    if (state.inviteOpen) return "invite";
    if (state.accountOpen) return "account";
    if (state.session.notice && !state.noticeDismissed) return "notice";
    if (state.tasteResultOpen && isComingSoonPackId(state.comingSoonId)) return "taste-result";
    if (isComingSoonPackId(state.comingSoonId)) return "coming-soon";
    if (state.packDetailOpen) return "pack-detail";
    return "pack-list";
  }
  if (state.sentEmail) return "sent";
  return "signup";
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
  const nextSession = session || emptyNativeSession();
  return applyScreen({
    ...state,
    busy: false,
    error: "",
    sentEmail: "",
    packDetailOpen: false,
    accountOpen: false,
    inviteOpen: false,
    comingSoonId: "",
    tasteResultOpen: false,
    noticeDismissed: false,
    session: nextSession
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
  if (state.screen !== "workspace" && state.screen !== "pack-list") return { ...state, action: "" };
  return { ...state, action: "invite-partner" };
}

export function openMarriageFromList(state) {
  if (!state.session?.user) return applyScreen(state);
  return applyScreen({
    ...state,
    splashDone: true,
    packDetailOpen: true,
    accountOpen: false,
    inviteOpen: false,
    comingSoonId: "",
    tasteResultOpen: false
  });
}

export function openComingSoonFromList(state, packId) {
  if (!state.session?.user || !isComingSoonPackId(packId)) return applyScreen(state);
  return applyScreen({
    ...state,
    splashDone: true,
    packDetailOpen: false,
    accountOpen: false,
    inviteOpen: false,
    comingSoonId: packId,
    tasteResultOpen: false
  });
}

export function openTasteResult(state) {
  if (!state.session?.user || !isComingSoonPackId(state.comingSoonId)) return applyScreen(state);
  return applyScreen({
    ...state,
    splashDone: true,
    packDetailOpen: false,
    accountOpen: false,
    inviteOpen: false,
    tasteResultOpen: true
  });
}

export function backFromComingSoon(state) {
  return applyScreen({ ...state, comingSoonId: "", tasteResultOpen: false });
}

export function backFromTasteResult(state) {
  return applyScreen({ ...state, tasteResultOpen: false });
}

export function backToPackList(state) {
  return applyScreen({
    ...state,
    packDetailOpen: false,
    accountOpen: false,
    inviteOpen: false,
    comingSoonId: "",
    tasteResultOpen: false
  });
}

export function openSendLink(state) {
  if (!state.session?.user) return applyScreen(state);
  return applyScreen({
    ...state,
    splashDone: true,
    packDetailOpen: false,
    accountOpen: false,
    inviteOpen: true,
    comingSoonId: "",
    tasteResultOpen: false
  });
}

export function openAccount(state) {
  if (!state.session?.user) return applyScreen(state);
  return applyScreen({
    ...state,
    splashDone: true,
    accountOpen: true,
    packDetailOpen: false,
    inviteOpen: false,
    comingSoonId: "",
    tasteResultOpen: false
  });
}

export function backFromAccount(state) {
  return applyScreen({ ...state, accountOpen: false });
}

export function backFromPackDetail(state) {
  return applyScreen({ ...state, packDetailOpen: false, inviteOpen: false });
}

export function backFromInvite(state) {
  return applyScreen({
    ...state,
    inviteOpen: false,
    packDetailOpen: Boolean(state.session?.user),
    accountOpen: false
  });
}

export function loggedOutHome(state = createNativeFlow()) {
  return applyScreen({
    ...createNativeFlow(),
    splashDone: true,
    error: state.error || ""
  });
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
    return applyScreen({
      ...next,
      session,
      inviteOpen: false,
      packDetailOpen: false,
      accountOpen: false,
      comingSoonId: "",
      tasteResultOpen: false,
      noticeDismissed: !session.notice,
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

export async function logoutAccount(state, api) {
  try {
    await api.logout?.();
  } catch {
    /* fail-open to login */
  }
  return loggedOutHome(state);
}

export async function loadInvitePairCode(state, api) {
  try {
    const result = await api.myPairCode();
    if (!result.ok) {
      return applyScreen({ ...state, inviteOpen: true, error: PAIR_ERRORS.failed });
    }
    return applyScreen({
      ...state,
      inviteOpen: true,
      pairCode: result.code || "",
      pairCodeDisplay: result.display || "",
      inviteUrl: result.url || "",
      error: ""
    });
  } catch {
    return applyScreen({ ...state, inviteOpen: true, error: PAIR_ERRORS.failed });
  }
}

export function setPartnerCode(state, code) {
  return { ...state, partnerCode: String(code || ""), error: "" };
}

export async function connectPartnerCode(state, api) {
  const pending = { ...state, inviteOpen: true, busy: true, error: "" };
  try {
    const result = await api.connectPairCode(state.partnerCode);
    if (!result.ok) {
      return applyScreen({
        ...pending,
        busy: false,
        error: PAIR_ERRORS[result.error] || PAIR_ERRORS.failed
      });
    }
    return applyScreen({
      ...pending,
      busy: false,
      error: "",
      inviteOpen: false,
      packDetailOpen: false,
      accountOpen: false,
      comingSoonId: "",
      tasteResultOpen: false,
      session: result.session || state.session
    });
  } catch {
    return applyScreen({ ...pending, busy: false, error: PAIR_ERRORS.failed });
  }
}

export async function shareMeasurementInvite(state, channel, io = {}) {
  const url = String(state.inviteUrl || "");
  if (!url || shareContainsPairCode(url, state.pairCode)) {
    return { ...state, inviteOpen: true, copied: false };
  }
  const result = await shareInviteChannel(url, channel, io);
  return { ...state, inviteOpen: true, copied: result === "copied", codeCopied: false };
}

export async function copyMyPairCode(state, io = {}) {
  const code = String(state.pairCodeDisplay || state.pairCode || "");
  if (!code) return { ...state, inviteOpen: true, codeCopied: false };
  const copied = await (io.clipboard?.writeText
    ? io.clipboard.writeText(code).then(() => true).catch(() => false)
    : Promise.resolve(false));
  return { ...state, inviteOpen: true, codeCopied: Boolean(copied), copied: false };
}
