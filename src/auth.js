export const AUTH_COPY = {
  title: "두 사람의 결혼 준비, 한곳에",
  body: "비밀번호 없이 이메일로 로그인 링크를 보내드려요.",
  cta: "로그인 링크 보내기",
  sent: "메일을 확인해 주세요. 링크는 10분 동안만 유효해요.",
  afterLogin: "이 기기 임시 답은 이어지지 않아요.",
  logoutHandoff: "로그아웃 후 이 기기를 넘겨주세요."
};

export const AUTH_ERRORS = {
  expired: "로그인 링크가 만료되었어요. 다시 요청해 주세요.",
  used: "이미 사용한 로그인 링크예요. 새 링크를 요청해 주세요.",
  invalid: "로그인 링크가 유효하지 않아요.",
  "invalid-email": "이메일 주소를 다시 확인해 주세요.",
  failed: "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요.",
  "oauth-unconfigured": "이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요.",
  "invalid-provider": "지원하지 않는 로그인이에요."
};

export const SOCIAL_COPY = Object.freeze({
  kakao: "카카오로 시작",
  naver: "네이버로 시작",
  google: "Google로 시작",
  divider: "또는",
  oauthUnconfigured: "이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요."
});

export const EMAIL_BIND_COPY = Object.freeze({
  title: "이메일을 연결해 주세요.",
  cta: "이메일 연결하기",
  body: "초대를 수락하려면 이메일을 연결해야 해요.",
  emailLabel: "이메일"
});

export const SOCIAL_PROVIDERS = ["kakao", "naver", "google"];

export const INVITE_COPY = {
  title: "파트너 초대",
  waiting: "대기중",
  remainingLabel: "만료 남은 시간",
  lastSentLabel: "링크 만든 시각",
  send: "초대 링크 만들기",
  resend: "링크 다시 만들기",
  share: "링크를 보내 파트너를 초대하세요.",
  copyLink: "링크 복사",
  instagram: "인스타그램",
  kakao: "카카오톡",
  copied: "링크를 복사했어요.",
  copyFailed: "복사하지 못했어요. 아래 링크를 길게 눌러 복사해 주세요.",
  deviceRule: "같은 폰에서 두 계정을 동시에 쓸 수는 없어요.",
  emailCheck: "상대 이메일이 맞는지 다시 확인해 주세요.",
  editResend: "이메일 고치고 링크 다시 만들기",
  otherSession: "이 기기에 다른 계정으로 로그인되어 있어요.",
  logoutContinue: "로그아웃하고 넘기기",
  rule: "같은 메일로만 수락할 수 있어요. 같은 폰에서 두 계정을 동시에 쓸 수는 없어요.",
  startPack: "결혼 팩 시작하기",
  expired: "초대가 만료됐어요. 구매자에게 새 링크를 부탁해 주세요.",
  mismatch: "이 초대는 다른 이메일로 만들어졌어요. 초대받은 메일로 로그인해야 해요.",
  loginRequired: "초대를 받으려면 초대받은 메일로 먼저 로그인해야 해요.",
  inAppHint: "카카오톡 안에서는 로그인이 막힐 수 있어요. Safari 또는 Chrome에서 열어 주세요.",
  accept: "초대 수락하기",
  draftBadge: "나만 보임"
};

export const INVITE_ERRORS = {
  self: "자신의 이메일로는 초대할 수 없어요.",
  "needs-email": EMAIL_BIND_COPY.title,
  "already-paired": "이미 두 사람이 연결되어 있어요.",
  full: "이 워크스페이스는 두 명까지예요.",
  forbidden: "초대를 보낼 수 있는 구매자가 아니에요.",
  failed: "초대를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
};

export const PENDING_INVITE_KEY = "ab-pending-invite";
export const INVITE_CONFLICT_KEY = "ab-invite-conflict";
export const INVITE_OTHER_SESSION = "other-session";

export function formatRemaining(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "만료됨";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}일 ${hours}시간`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${Math.max(1, minutes)}분`;
}

export function formatSentAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function emptySession() {
  return { user: null, notice: null, workspace: { acceptedPartner: false } };
}

export function canOpenPack(session) {
  return Boolean(session?.user && session.workspace?.acceptedPartner === true);
}

export function consumeAuthLocation(pathname = "/", search = "") {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const isInvitePath = pathname === "/invite/accept";
  const isInstallPath = pathname === "/install";
  const isStartPath = pathname === "/start";
  const token = isInvitePath || isInstallPath || isStartPath ? "" : (params.get("token") || "");
  return {
    token,
    inviteToken: isInvitePath ? (params.get("token") || "") : (params.get("invite") || ""),
    authError: params.get("authError") || "",
    isConsumePath: pathname === "/auth/consume",
    isInvitePath,
    isInstallPath,
    isStartPath
  };
}

export function resolveSignedOutView(screen) {
  return screen === "sent" ? "sent" : "onboarding";
}

export function userNeedsEmail(user) {
  return Boolean(user) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(user.email || "").trim());
}

export function resolveSignedInView(session, noticeDismissed = false, inviteFlow = false, invitePriority = false) {
  if (userNeedsEmail(session?.user)) return "bind";
  if (inviteFlow && invitePriority) return "invite";
  if (session?.notice && !noticeDismissed) return "notice";
  if (inviteFlow) return "invite";
  if (session?.workspace?.acceptedPartner) return "ready";
  return "home";
}

export function inviteAcceptUrl(origin, token) {
  const base = String(origin || "").replace(/\/$/, "");
  return `${base}/invite/accept?token=${encodeURIComponent(String(token || ""))}`;
}

export function absoluteInviteUrl(origin, url) {
  const value = String(url || "").trim();
  if (!value) return "";
  try {
    return new URL(value, String(origin || "http://localhost").replace(/\/$/, "") || "http://localhost").href;
  } catch {
    return value;
  }
}

export function emailsMatch(left, right) {
  return String(left || "").trim().toLowerCase() === String(right || "").trim().toLowerCase();
}

export function classifyInviteConflict({ sessionEmail = "", inviteEmail = "", openedWhileSignedIn = false } = {}) {
  if (!sessionEmail || !inviteEmail || emailsMatch(sessionEmail, inviteEmail)) return "";
  return openedWhileSignedIn ? INVITE_OTHER_SESSION : "mismatch";
}

export function resolveInviteAcceptError({ preview = null, session = null, openedWhileSignedIn = false, accepted = false } = {}) {
  if (accepted) return "";
  if (!preview) return session?.user ? "" : "unauthenticated";
  if (!preview.ok) return preview.error || "invalid";
  if (!session?.user) return "unauthenticated";
  if (userNeedsEmail(session.user)) return "needs-email";
  return classifyInviteConflict({
    sessionEmail: session.user.email,
    inviteEmail: preview.email,
    openedWhileSignedIn
  });
}

export function isInvitePriorityError(error) {
  return error === INVITE_OTHER_SESSION || error === "mismatch" || error === "needs-email" || error === "expired" || error === "used" || error === "invalid";
}

/**
 * The link the owner reads on screen. The session hands back a path; a page origin makes it
 * absolute, and without one the raw value is still shown rather than nothing — UX_CONTRACT.md
 * requires the made invite link to be visible as a string, never buttons alone.
 */
export function inviteShareDisplayUrl(url, origin = globalThis.location?.origin || "") {
  const value = String(url || "").trim();
  if (!value) return "";
  if (value.includes("://")) return value;
  return origin ? absoluteInviteUrl(origin, value) : value;
}

/**
 * Copy and share can fail with nothing thrown (no clipboard in an insecure context, a share
 * sheet the platform never opens). The outcome is recorded against the url it was attempted
 * on so the screen can say so instead of going quiet, and so a reissued link — a different
 * url — never inherits the previous link's failure.
 */
let lastShare = { outcome: "", url: "" };

export function recordInviteShare(outcome, url) {
  lastShare = { outcome: String(outcome || ""), url: String(url || "") };
  return lastShare.outcome;
}

export function lastInviteShare() {
  return { ...lastShare };
}

export function resetInviteShare() {
  lastShare = { outcome: "", url: "" };
}

export function inviteCopyFailed(url) {
  return Boolean(url) && lastShare.outcome === "failed" && lastShare.url === String(url);
}

export async function copyText(value, clipboard = globalThis.navigator?.clipboard) {
  if (!value) return false;
  if (clipboard?.writeText) {
    await clipboard.writeText(value);
    return true;
  }
  return false;
}

/**
 * `text` is the only thing that was ever invite-specific here, so a present and a recommendation
 * pass their own line and reuse the rest: share sheet first, clipboard second, and a failure
 * recorded against the exact url so a reissued link never inherits an old error.
 */
export async function shareInviteChannel(url, channel, io = {}, text = INVITE_COPY.share) {
  if (!url) return recordInviteShare("failed", url);
  const payload = { title: "AB", text, url };
  if (channel !== "copy") {
    const share = io.share || (typeof globalThis.navigator?.share === "function"
      ? globalThis.navigator.share.bind(globalThis.navigator)
      : null);
    if (typeof share === "function") {
      try {
        await share(payload);
        return recordInviteShare("shared", url);
      } catch (error) {
        if (error?.name === "AbortError") return recordInviteShare("cancelled", url);
      }
    }
  }
  let copied = false;
  try {
    copied = await copyText(url, io.clipboard);
  } catch {
    copied = false;
  }
  return recordInviteShare(copied ? "copied" : "failed", url);
}
