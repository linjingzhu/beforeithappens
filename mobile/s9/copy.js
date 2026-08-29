export const S9_COPY = {
  logoutHandoff: "로그아웃 후 이 기기를 넘겨주세요."
};

export const S9_ONBOARDING_BODY = "비밀번호 없이 이메일로 로그인 링크를 보내드려요.";

export const S9_FORBIDDEN_SCREENS = {
  otherSession: "이 기기에 다른 계정으로 로그인되어 있어요.",
  logoutContinue: "로그아웃하고 넘기기"
};

export const S9_PLACEMENT = {
  host: "logout-control",
  forbiddenHosts: ["onboarding-body", "same-session-fail"]
};

export function handoffAllowedAt(host) {
  return host === S9_PLACEMENT.host;
}

export function onboardingBodyContainsHandoff(body) {
  return String(body ?? "").includes(S9_COPY.logoutHandoff);
}
