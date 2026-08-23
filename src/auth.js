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
  failed: "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
};

export const INVITE_COPY = {
  title: "파트너 초대",
  waiting: "대기중",
  remainingLabel: "만료 남은 시간",
  lastSentLabel: "마지막 발송 시각",
  send: "초대 보내기",
  resend: "다시 보내기",
  rule: "같은 메일로만 수락할 수 있어요. 같은 폰에서 두 계정을 동시에 쓸 수는 없어요.",
  startPack: "결혼 팩 시작하기",
  expired: "초대가 만료됐어요. 구매자에게 새 링크를 부탁해 주세요.",
  mismatch: "이 초대는 다른 이메일로 보내졌어요. 초대받은 메일로 로그인해야 해요.",
  loginRequired: "초대를 받으려면 초대받은 메일로 먼저 로그인해야 해요.",
  accept: "초대 수락하기",
  draftBadge: "나만 보임"
};

export const INVITE_ERRORS = {
  self: "자신의 이메일로는 초대할 수 없어요.",
  "already-paired": "이미 두 사람이 연결되어 있어요.",
  full: "이 워크스페이스는 두 명까지예요.",
  forbidden: "초대를 보낼 수 있는 구매자가 아니에요.",
  failed: "초대를 보내지 못했어요. 잠시 후 다시 시도해 주세요."
};

export const PENDING_INVITE_KEY = "ab-pending-invite";

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
  const token = params.get("token") || "";
  const isInvitePath = pathname === "/invite/accept";
  return {
    token: isInvitePath ? "" : token,
    inviteToken: isInvitePath ? token : (params.get("invite") || ""),
    authError: params.get("authError") || "",
    isConsumePath: pathname === "/auth/consume",
    isInvitePath
  };
}

export function resolveSignedOutView(screen) {
  return screen === "sent" ? "sent" : "onboarding";
}

export function resolveSignedInView(session, noticeDismissed = false, inviteFlow = false) {
  if (session?.notice && !noticeDismissed) return "notice";
  if (inviteFlow) return "invite";
  if (session?.workspace?.acceptedPartner) return "ready";
  return "home";
}
