export {
  ACCOUNT_COPY,
  PACK_DETAIL_COPY,
  PACK_DETAIL_SAMPLES,
  PACK_LIST_COPY,
  PACK_LIST_ROWS,
  PAIR_COPY,
  PAIR_ERRORS
} from "../src/pair-code.js";

export const MAGIC_LINK_TTL_MS = 10 * 60 * 1000;

export const S0_COPY = {
  brand: "LoveMe",
  title: "두 사람의 결혼 준비, 한곳에",
  holdMs: 1200
};

export const S2_COPY = {
  title: "두 사람의 결혼 준비, 한곳에",
  body: "비밀번호 없이 이메일로 로그인 링크를 보내드려요.",
  cta: "로그인 링크 보내기",
  sent: "메일을 확인해 주세요. 링크는 10분 동안만 유효해요.",
  afterLogin: "이 기기 임시 답은 이어지지 않아요.",
  emailLabel: "이메일",
  ack: "확인",
  otherEmail: "다른 이메일로 요청"
};

export const S2_SOCIAL_COPY = Object.freeze({
  kakao: "카카오로 시작",
  naver: "네이버로 시작",
  google: "Google로 시작",
  divider: "또는",
  oauthUnconfigured: "이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요."
});

export const S2_EMAIL_BIND_COPY = Object.freeze({
  title: "이메일을 연결해 주세요.",
  cta: "이메일 연결하기",
  body: "초대를 수락하려면 이메일을 연결해야 해요.",
  emailLabel: "이메일"
});

/** Exact S2 social + bind copy. Do not paraphrase. Kakao login is not S4 카카오톡. */
export function assertLockedS2SocialCopy() {
  if (S2_SOCIAL_COPY.kakao !== "카카오로 시작") throw new Error("S2 Kakao start copy drifted");
  if (S2_SOCIAL_COPY.naver !== "네이버로 시작") throw new Error("S2 Naver start copy drifted");
  if (S2_SOCIAL_COPY.google !== "Google로 시작") throw new Error("S2 Google start copy drifted");
  if (S2_SOCIAL_COPY.oauthUnconfigured !== S2_ERRORS["oauth-unconfigured"]) {
    throw new Error("S2 unconfigured-provider copy drifted");
  }
  if (S2_EMAIL_BIND_COPY.title !== "이메일을 연결해 주세요.") throw new Error("S2 email-bind title drifted");
  if (S2_EMAIL_BIND_COPY.cta !== "이메일 연결하기") throw new Error("S2 email-bind CTA drifted");
  if (S2_COPY.body !== "비밀번호 없이 이메일로 로그인 링크를 보내드려요.") throw new Error("S2 magic-link body drifted");
  if (S2_COPY.cta !== "로그인 링크 보내기") throw new Error("S2 magic-link CTA drifted");
  if (S2_COPY.sent !== "메일을 확인해 주세요. 링크는 10분 동안만 유효해요.") throw new Error("S2 magic-link sent copy drifted");
  if (S2_SOCIAL_COPY.kakao === "카카오톡") throw new Error("S2 Kakao start collided with S4 KakaoTalk share");
  if (S2_COPY.title !== "두 사람의 결혼 준비, 한곳에") throw new Error("login title drifted");
  return true;
}

export const S3_COPY = {
  created: "워크스페이스가 만들어졌어요.",
  inviteCta: "파트너 초대하기"
};

export const S2_ERRORS = {
  expired: "로그인 링크가 만료되었어요. 다시 요청해 주세요.",
  used: "이미 사용한 로그인 링크예요. 새 링크를 요청해 주세요.",
  invalid: "로그인 링크가 유효하지 않아요.",
  "invalid-email": "이메일 주소를 다시 확인해 주세요.",
  failed: "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요.",
  "oauth-unconfigured": "이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요.",
  "invalid-provider": "지원하지 않는 로그인이에요."
};

export const FORBIDDEN_APP_COPY = {
  packCta: "결혼 팩 시작하기",
  installLanding: "앱을 설치하면 시작할 수 있어요.",
  installBanner: "앱에서 보면 초대와 알림이 더 쉬워요.",
  installCta: "앱 설치하기",
  kakaoLogin: "카카오 로그인"
};
