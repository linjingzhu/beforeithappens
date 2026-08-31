import { isComingSoonPackId, PAIR_ERRORS, S2_ERRORS } from "./s0-s2-s3-copy.js";
import { SESSION_FETCH_MS, withTimeout } from "./s0-s2-s3-api.js";
import { shareInviteChannel } from "../src/auth.js";
import { shareContainsPairCode } from "../src/pair-code.js";
import { canUnlockRest, grantShopHearts, HEARTS, spendUnlockHearts, startingHearts } from "../src/hearts.js";
import { comingSoonExistingQuestion, pickPackSample, pickPartnerChoice, sampleAnswerComplete } from "../src/marriage-sample.js";
import { introSeen, markIntroSeen, packIntroLines } from "../src/pack-intro.js";
import { fakeSession, isVirtualDebug } from "./src/virtual.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LOGIN_GATES = Object.freeze(["invite", "connect", "paywall", "account", "home"]);

export function emptyNativeSession() {
  return { user: null, notice: null, workspace: { id: null, role: null, acceptedPartner: false, partnerEmail: "" } };
}

export function createNativeFlow(session = emptyNativeSession(), {
  inviteOpen = false,
  packDetailOpen = false,
  accountOpen = false,
  comingSoonId = "",
  tasteResultOpen = false,
  signupOpen = false,
  pendingGate = "",
  sampleOpen = false,
  sampleResultOpen = false,
  unlockOpen = false,
  shopOpen = false,
  certificateOpen = false,
  samplePackId = "",
  packIntroOpen = false,
  seenPackIntros = [],
  hearts = startingHearts(),
  entitled = false
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
    signupOpen: Boolean(signupOpen),
    pendingGate: isLoginGate(pendingGate) ? pendingGate : "",
    pairCode: "",
    pairCodeDisplay: "",
    inviteUrl: "",
    partnerCode: "",
    copied: false,
    codeCopied: false,
    sampleOpen: Boolean(sampleOpen),
    sampleResultOpen: Boolean(sampleResultOpen),
    unlockOpen: Boolean(unlockOpen),
    shopOpen: Boolean(shopOpen),
    certificateOpen: Boolean(certificateOpen),
    samplePackId: samplePackId || (comingSoonId === "marriage" ? "marriage" : comingSoonId) || "",
    sampleQuestions: [],
    sampleIndex: 0,
    sampleAnswers: [],
    sampleChoice: "",
    sampleReason: "",
    samplePartner: null,
    packIntroOpen: Boolean(packIntroOpen),
    seenPackIntros: Array.isArray(seenPackIntros) ? [...seenPackIntros] : [],
    hearts: Number.isFinite(hearts) ? hearts : startingHearts(),
    entitled: Boolean(entitled)
  };
}

export function isLoginGate(gate) {
  return LOGIN_GATES.includes(String(gate || ""));
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

export function isPartnerRole(session) {
  return session?.workspace?.role === "partner";
}

export function isFirstRunLogin(state) {
  return !state?.session?.user && (state?.pendingGate === "home" || !state?.pendingGate);
}

export function resolveNativeScreen(state) {
  if (!state?.splashDone) return "splash";
  if (state.session?.user) {
    if (userNeedsEmail(state.session.user)) return state.sentEmail ? "sent" : "bind";
    if (state.sentEmail) return "sent";
    if (state.inviteOpen) return "invite";
    if (state.accountOpen) return "account";
    if (state.session.notice && !state.noticeDismissed) return "notice";
    if (state.certificateOpen) return "certificate";
    if (state.unlockOpen && isPartnerRole(state.session)) return "partner-wait";
    if (state.unlockOpen) return "unlock";
    if (state.packIntroOpen) return "pack-intro";
    if (state.sampleResultOpen) return "sample-result";
    if (state.sampleOpen) return "sample-q";
    if (state.packDetailOpen) return "sample-q";
    return "pack-list";
  }
  if (state.sentEmail) return "sent";
  if (state.signupOpen) return "signup";
  if (state.packIntroOpen) return "pack-intro";
  if (state.certificateOpen) return "certificate";
  if (state.unlockOpen && isPartnerRole(state.session)) return "partner-wait";
  if (state.unlockOpen) return "unlock";
  if (state.sampleResultOpen) return "sample-result";
  if (state.sampleOpen) return "sample-q";
  return "signup";
}

export function applyScreen(state) {
  return { ...state, screen: resolveNativeScreen(state), action: "" };
}

export function finishSplash(state) {
  if (state?.session?.user) {
    return applyScreen({ ...state, splashDone: true, signupOpen: false });
  }
  return applyScreen({
    ...state,
    splashDone: true,
    signupOpen: true,
    pendingGate: isLoginGate(state?.pendingGate) ? state.pendingGate : "home"
  });
}

function clearJourney(state, extras = {}) {
  return {
    ...state,
    packDetailOpen: false,
    accountOpen: false,
    inviteOpen: false,
    comingSoonId: "",
    tasteResultOpen: false,
    signupOpen: false,
    sampleOpen: false,
    sampleResultOpen: false,
    unlockOpen: false,
    shopOpen: false,
    certificateOpen: false,
    packIntroOpen: false,
    ...extras
  };
}

export function resumePendingGate(state, gate = state.pendingGate) {
  const pending = isLoginGate(gate) ? gate : "";
  if (pending === "invite" || pending === "connect") {
    return applyScreen(clearJourney(state, { signupOpen: false, pendingGate: "", inviteOpen: true }));
  }
  if (pending === "account") {
    return applyScreen(clearJourney(state, { signupOpen: false, pendingGate: "", accountOpen: true }));
  }
  if (pending === "paywall") {
    return applyScreen(clearJourney(state, {
      signupOpen: false,
      pendingGate: "",
      unlockOpen: true,
      sampleResultOpen: false
    }));
  }
  return applyScreen(clearJourney(state, { signupOpen: false, pendingGate: "" }));
}

export function requireLogin(state, gate) {
  const pending = isLoginGate(gate) ? gate : "";
  if (state.session?.user) return resumePendingGate(state, pending);
  return applyScreen({
    ...state,
    splashDone: true,
    signupOpen: true,
    pendingGate: pending,
    sentEmail: "",
    error: "",
    busy: false,
    inviteOpen: false,
    accountOpen: false
  });
}

export function requireLoginForPay(state) {
  return requireLogin(state, "paywall");
}

export function cancelLogin(state) {
  if (state.pendingGate === "home" || !state.session?.user && !state.pendingGate) {
    return applyScreen({
      ...state,
      splashDone: true,
      signupOpen: true,
      pendingGate: "home",
      sentEmail: "",
      error: "",
      busy: false,
      inviteOpen: false,
      accountOpen: false
    });
  }
  return applyScreen({
    ...state,
    signupOpen: false,
    sentEmail: "",
    pendingGate: "",
    error: "",
    busy: false,
    inviteOpen: false,
    accountOpen: false
  });
}

export function setEmail(state, email) {
  return { ...state, email: String(email || ""), error: "" };
}

export function backToSignup(state) {
  return applyScreen({ ...state, sentEmail: "", error: "", busy: false, signupOpen: true });
}

export function requestLinkStarted(state) {
  const email = String(state.email || "").trim();
  if (!isValidEmail(email)) {
    return applyScreen({ ...state, signupOpen: true, busy: false, error: S2_ERRORS["invalid-email"] });
  }
  return { ...state, email, busy: true, error: "", signupOpen: true };
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
    signupOpen: true,
    busy: false,
    error: S2_ERRORS[error] || S2_ERRORS.failed
  });
}

export function consumeSucceeded(state, session) {
  const nextSession = session || emptyNativeSession();
  const pendingGate = isLoginGate(state.pendingGate) ? state.pendingGate : "";
  const next = {
    ...state,
    busy: false,
    error: "",
    sentEmail: "",
    signupOpen: false,
    pendingGate,
    noticeDismissed: false,
    session: nextSession
  };
  if (userNeedsEmail(nextSession.user)) return applyScreen(next);
  if (nextSession.notice) return applyScreen(next);
  return resumePendingGate(next, pendingGate);
}

export function consumeFailed(state, error = "invalid") {
  return applyScreen({
    ...state,
    busy: false,
    splashDone: true,
    sentEmail: "",
    signupOpen: true,
    session: emptyNativeSession(),
    error: S2_ERRORS[error] || S2_ERRORS.invalid
  });
}

export function noticeAcknowledged(state, session) {
  return resumePendingGate({
    ...state,
    noticeDismissed: true,
    session: session || { ...state.session, notice: null }
  }, state.pendingGate);
}

export function invitePartner(state) {
  if (state.screen !== "workspace" && state.screen !== "pack-list" && state.screen !== "account") {
    return { ...state, action: "" };
  }
  return { ...state, action: "invite-partner" };
}

/** First entry into a pack opens its narration; starting from there runs the sample. */
export function openPackSample(state, packId = "marriage", rng = Math.random) {
  if (packIntroLines(packId).length && !introSeen(state?.seenPackIntros, packId)) {
    return applyScreen(clearJourney(state, {
      splashDone: true,
      samplePackId: packId,
      packIntroOpen: true,
      error: ""
    }));
  }
  return runPackSample(state, packId, rng);
}

export function startPackFromIntro(state, rng = Math.random) {
  const packId = state?.samplePackId || "marriage";
  const seen = markIntroSeen(state?.seenPackIntros, packId);
  return runPackSample({ ...state, seenPackIntros: seen }, packId, rng);
}

function runPackSample(state, packId = "marriage", rng = Math.random) {
  const sampleQuestions = pickPackSample(packId, undefined, rng);
  if (!sampleQuestions.length) {
    return applyScreen(clearJourney(state, {
      splashDone: true,
      samplePackId: packId,
      sampleResultOpen: true,
      sampleQuestions: [],
      sampleIndex: 0,
      sampleAnswers: [],
      sampleChoice: "",
      sampleReason: "",
      samplePartner: null,
      error: ""
    }));
  }
  return applyScreen(clearJourney(state, {
    splashDone: true,
    samplePackId: packId,
    sampleOpen: true,
    sampleQuestions,
    sampleIndex: 0,
    sampleAnswers: [],
    sampleChoice: "",
    sampleReason: "",
    samplePartner: null,
    error: ""
  }));
}

export function openMarriageFromList(state, rng = Math.random) {
  return openPackSample(state, "marriage", rng);
}

export function currentSampleQuestion(state) {
  return state.sampleQuestions?.[state.sampleIndex] || null;
}

export function setSampleChoice(state, choiceId) {
  return { ...state, sampleChoice: String(choiceId || ""), error: "" };
}

export function setSampleReason(state, reason) {
  return { ...state, sampleReason: String(reason || ""), error: "" };
}

export function submitSampleAnswer(state, rng = Math.random) {
  const question = currentSampleQuestion(state);
  if (!question || !sampleAnswerComplete(state.sampleChoice, state.sampleReason)) {
    return applyScreen({ ...state, sampleOpen: true, error: "choice-and-reason-required" });
  }
  const partner = pickPartnerChoice(question, state.sampleChoice, rng);
  const answers = [...state.sampleAnswers, {
    questionId: question.id,
    choiceId: state.sampleChoice,
    reason: String(state.sampleReason).trim(),
    partnerChoiceId: partner?.id || ""
  }];
  if (answers.length < state.sampleQuestions.length) {
    return applyScreen({
      ...state,
      sampleOpen: true,
      sampleIndex: state.sampleIndex + 1,
      sampleAnswers: answers,
      sampleChoice: "",
      sampleReason: "",
      samplePartner: partner,
      error: ""
    });
  }
  return applyScreen({
    ...state,
    sampleOpen: false,
    sampleResultOpen: true,
    sampleAnswers: answers,
    samplePartner: partner,
    error: ""
  });
}

export function openTogetherFromSample(state) {
  const connected = {
    ...state.session,
    workspace: {
      ...(state.session?.workspace || {}),
      acceptedPartner: true,
      role: state.session?.workspace?.role || "buyer",
      partnerEmail: state.session?.workspace?.partnerEmail || "partner@email.com"
    }
  };
  return applyScreen(clearJourney(state, {
    splashDone: true,
    unlockOpen: true,
    samplePackId: state.samplePackId || "marriage",
    sampleQuestions: state.sampleQuestions || [],
    sampleAnswers: state.sampleAnswers || [],
    session: connected
  }));
}

export function tapUnlock(state) {
  if (isPartnerRole(state.session)) {
    return applyScreen({ ...state, unlockOpen: true, shopOpen: false });
  }
  if (!canUnlockRest(state.hearts)) {
    return applyScreen({ ...state, unlockOpen: true, shopOpen: true });
  }
  const spent = spendUnlockHearts(state.hearts);
  return applyScreen(clearJourney(state, {
    hearts: spent.balance,
    entitled: true,
    unlockOpen: false,
    shopOpen: false,
    certificateOpen: true,
    samplePackId: state.samplePackId || "marriage",
    sampleQuestions: state.sampleQuestions || [],
    sampleAnswers: state.sampleAnswers || []
  }));
}

export function purchaseShopHearts(state) {
  return applyScreen({
    ...state,
    unlockOpen: true,
    shopOpen: false,
    hearts: grantShopHearts(state.hearts)
  });
}

export function dismissShop(state) {
  return applyScreen({ ...state, unlockOpen: true, shopOpen: false });
}

export function openComingSoonFromList(state, packId) {
  if (!isComingSoonPackId(packId)) return applyScreen(state);
  return openPackSample(state, packId);
}

export function openTasteResult(state) {
  return backFromComingSoon(state);
}

export function backFromComingSoon(state) {
  return applyScreen(clearJourney(state));
}

export function backFromTasteResult(state) {
  return applyScreen({ ...state, tasteResultOpen: false });
}

export function backFromCertificate(state) {
  return applyScreen(clearJourney(state));
}

export function backToPackList(state) {
  return applyScreen(clearJourney(state));
}

export function openSendLink(state) {
  if (!state.session?.user) {
    return requireLogin({ ...state, unlockOpen: false }, "invite");
  }
  return applyScreen(clearJourney(state, { splashDone: true, inviteOpen: true }));
}

export function openAccount(state) {
  if (!state.session?.user) {
    return requireLogin(clearJourney(state), "account");
  }
  return applyScreen(clearJourney(state, { splashDone: true, accountOpen: true }));
}

export function backFromAccount(state) {
  return applyScreen({ ...state, accountOpen: false });
}

export function backFromPackDetail(state) {
  return applyScreen(clearJourney(state));
}

export function backFromInvite(state) {
  return applyScreen(clearJourney(state, { accountOpen: Boolean(state.session?.user) }));
}

export function loggedOutHome(state = createNativeFlow()) {
  return applyScreen({
    ...createNativeFlow(),
    splashDone: true,
    signupOpen: true,
    pendingGate: "home",
    error: state.error || "",
    hearts: startingHearts()
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

export function comingSoonQuestionFor(packId) {
  return comingSoonExistingQuestion(packId);
}

export const HEART_UNLOCK_COST = HEARTS.unlockCost;

export async function submitMagicLink(state, api, env = globalThis.process?.env || {}) {
  const started = requestLinkStarted(state);
  if (started.error) return started;
  if (isVirtualDebug(env)) {
    const pending = isLoginGate(started.pendingGate) ? started.pendingGate : "home";
    return consumeSucceeded({
      ...started,
      busy: false,
      pendingGate: pending
    }, fakeSession(started.email));
  }
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
    const succeeded = consumeSucceeded(next, result.session);
    if (succeeded.screen === "invite") return loadInvitePairCode(succeeded, api);
    return succeeded;
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
      signupOpen: false,
      pendingGate: "",
      inviteOpen: false,
      packDetailOpen: false,
      accountOpen: false,
      comingSoonId: "",
      tasteResultOpen: false,
      sampleOpen: false,
      sampleResultOpen: false,
      unlockOpen: false,
      shopOpen: false,
      certificateOpen: false,
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
    const next = { ...noticeAcknowledged(pending, result.session), busy: false, error: "" };
    if (next.screen === "invite") return loadInvitePairCode(next, api);
    return next;
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

export async function loadInvitePairCode(state, api, env = globalThis.process?.env || {}) {
  if (isVirtualDebug(env)) {
    return applyScreen({
      ...state,
      inviteOpen: true,
      pairCode: "VIRTUAL1",
      pairCodeDisplay: "VIRT UAL1",
      inviteUrl: "https://example.test/invite/open",
      error: ""
    });
  }
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

export async function connectPartnerCode(state, api, env = globalThis.process?.env || {}) {
  if (!state.session?.user) return requireLogin(state, "connect");
  if (isVirtualDebug(env)) {
    return applyScreen(clearJourney(state, {
      busy: false,
      session: {
        ...state.session,
        workspace: { ...state.session.workspace, acceptedPartner: true, partnerEmail: "partner@email.com" }
      }
    }));
  }
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
    return applyScreen(clearJourney(pending, {
      busy: false,
      error: "",
      session: result.session || state.session
    }));
  } catch {
    return applyScreen({ ...pending, busy: false, error: PAIR_ERRORS.failed });
  }
}

export async function shareMeasurementInvite(state, channel, io = {}, env = globalThis.process?.env || {}) {
  const url = String(state.inviteUrl || "");
  if (!url || shareContainsPairCode(url, state.pairCode)) {
    return { ...state, inviteOpen: true, copied: false };
  }
  const result = await shareInviteChannel(url, channel, io);
  return { ...state, inviteOpen: true, copied: result === "copied", codeCopied: false };
}

export async function copyMyPairCode(state, io = {}, env = globalThis.process?.env || {}) {
  if (isVirtualDebug(env)) {
    return { ...state, inviteOpen: true, codeCopied: true, copied: false };
  }
  const code = String(state.pairCodeDisplay || state.pairCode || "");
  if (!code) return { ...state, inviteOpen: true, codeCopied: false };
  const copied = await (io.clipboard?.writeText
    ? io.clipboard.writeText(code).then(() => true).catch(() => false)
    : Promise.resolve(false));
  return { ...state, inviteOpen: true, codeCopied: Boolean(copied), copied: false };
}
