import { INVITE_OTHER_SESSION, canOpenPack, inviteCopyFailed, inviteShareDisplayUrl, resolveInviteAcceptError, shareInviteChannel } from "../../src/auth.js";
import { PRODUCT_INVITE_COPY, S4_COPY, SAME_SESSION_COPY, assertLockedS4Copy } from "./copy.js";

export const APP_S4_SCREEN = "s4-invite-waiting";
export const APP_SAME_SESSION_SCREEN = "same-session-fail";

export const FORBIDDEN_APP_FEATURES = Object.freeze({
  packCta: false,
  joinConfirm: false,
  roleSwitch: false,
  payment: false
});

assertLockedS4Copy();

export function s4VisibleActions({ hasInvite = false } = {}) {
  return {
    share: Boolean(hasInvite),
    firstSend: !hasInvite,
    editResend: Boolean(hasInvite),
    packCta: false,
    payment: false,
    roleSwitch: false,
    storeRedirect: false,
    deferredDeepLink: false,
    joinConfirm: false
  };
}

export function resolveNativeInviteScreen({
  session = null,
  preview = null,
  openedWhileSignedIn = false,
  accepted = false
} = {}) {
  const error = resolveInviteAcceptError({ preview, session, openedWhileSignedIn, accepted });
  if (error === INVITE_OTHER_SESSION) return APP_SAME_SESSION_SCREEN;
  return APP_S4_SCREEN;
}

export function inviteBlockingCopy(error = "") {
  if (error === "expired" || error === "used") return PRODUCT_INVITE_COPY.expired;
  if (error === "mismatch") return PRODUCT_INVITE_COPY.mismatch;
  return "";
}

export function s4ShareButtons() {
  return [S4_COPY.copyLink, S4_COPY.instagram, S4_COPY.kakao];
}

export async function shareS4Invite(url, channel, io = {}) {
  return shareInviteChannel(url, channel, io);
}

export function buyerHomeOpensPack(session) {
  void canOpenPack(session);
  return false;
}

export function sameSessionViewModel() {
  return {
    screen: APP_SAME_SESSION_SCREEN,
    message: SAME_SESSION_COPY.message,
    cta: SAME_SESSION_COPY.cta,
    logoutHandoff: SAME_SESSION_COPY.logoutHandoff
  };
}

export function s4ViewModel({ invite = null, copied = false, copyFailed = null, shareUrl = "", origin = "", email = "", partnerEmail = "", error = "" } = {}) {
  const hasInvite = Boolean(invite);
  // `origin || undefined` so an unset origin falls through to the page origin default.
  const linkUrl = shareUrl || inviteShareDisplayUrl(invite?.url, origin || undefined);
  const failed = copyFailed === null ? inviteCopyFailed(linkUrl) : Boolean(copyFailed);
  return {
    screen: APP_S4_SCREEN,
    title: S4_COPY.title,
    share: hasInvite ? S4_COPY.share : "",
    buttons: hasInvite ? s4ShareButtons() : [],
    // UX_CONTRACT.md: the link is readable on screen, so a silent copy failure is recoverable.
    shareUrl: hasInvite ? linkUrl : "",
    copyFailed: failed ? S4_COPY.copyFailed : "",
    copied: copied ? S4_COPY.copied : "",
    deviceRule: S4_COPY.deviceRule,
    emailCheck: hasInvite ? S4_COPY.emailCheck : "",
    primaryCta: hasInvite ? S4_COPY.editResend : S4_COPY.send,
    logout: S4_COPY.logout,
    logoutHandoff: S4_COPY.logoutHandoff,
    invite,
    email,
    partnerEmail: partnerEmail || invite?.email || "",
    error,
    actions: s4VisibleActions({ hasInvite })
  };
}
