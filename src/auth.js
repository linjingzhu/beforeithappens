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

export function emptySession() {
  return { user: null, notice: null, workspace: { acceptedPartner: false } };
}

export function canOpenPack(session) {
  return Boolean(session?.user && session.workspace?.acceptedPartner === true);
}

export function consumeAuthLocation(pathname = "/", search = "") {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return {
    token: params.get("token") || "",
    authError: params.get("authError") || "",
    isConsumePath: pathname === "/auth/consume"
  };
}

export function resolveSignedOutView(screen) {
  return screen === "sent" ? "sent" : "onboarding";
}

export function resolveSignedInView(session, noticeDismissed = false) {
  if (session?.notice && !noticeDismissed) return "notice";
  return "home";
}
