import { AUTH_COPY, INVITE_COPY } from "../../src/auth.js";

/** Exact S4 + same-session app copy. Do not paraphrase. */
export const S4_COPY = Object.freeze({
  title: INVITE_COPY.title,
  share: "링크를 보내 파트너를 초대하세요.",
  copyLink: "링크 복사",
  instagram: "인스타그램",
  kakao: "카카오톡",
  copied: "링크를 복사했어요.",
  deviceRule: "같은 폰에서 두 계정을 동시에 쓸 수는 없어요.",
  emailCheck: "상대 이메일이 맞는지 다시 확인해 주세요.",
  editResend: "이메일 고치고 링크 다시 만들기",
  send: INVITE_COPY.send,
  waiting: INVITE_COPY.waiting,
  remainingLabel: INVITE_COPY.remainingLabel,
  lastSentLabel: INVITE_COPY.lastSentLabel,
  logout: "로그아웃",
  logoutHandoff: AUTH_COPY.logoutHandoff
});

export const SAME_SESSION_COPY = Object.freeze({
  message: "이 기기에 다른 계정으로 로그인되어 있어요.",
  cta: "로그아웃하고 넘기기",
  logoutHandoff: AUTH_COPY.logoutHandoff
});

export const PRODUCT_INVITE_COPY = Object.freeze({
  expired: INVITE_COPY.expired,
  mismatch: INVITE_COPY.mismatch
});

export function assertLockedS4Copy() {
  if (S4_COPY.share !== INVITE_COPY.share) throw new Error("S4 share copy drifted");
  if (S4_COPY.copyLink !== INVITE_COPY.copyLink) throw new Error("S4 copy-link label drifted");
  if (S4_COPY.instagram !== INVITE_COPY.instagram) throw new Error("S4 Instagram label drifted");
  if (S4_COPY.kakao !== INVITE_COPY.kakao) throw new Error("S4 KakaoTalk label drifted");
  if (S4_COPY.copied !== INVITE_COPY.copied) throw new Error("S4 copied copy drifted");
  if (S4_COPY.deviceRule !== INVITE_COPY.deviceRule) throw new Error("S4 device rule drifted");
  if (S4_COPY.emailCheck !== INVITE_COPY.emailCheck) throw new Error("S4 typo copy drifted");
  if (S4_COPY.editResend !== INVITE_COPY.editResend) throw new Error("S4 typo CTA drifted");
  if (SAME_SESSION_COPY.message !== INVITE_COPY.otherSession) throw new Error("same-session copy drifted");
  if (SAME_SESSION_COPY.cta !== INVITE_COPY.logoutContinue) throw new Error("same-session CTA drifted");
  if (S4_COPY.logoutHandoff !== AUTH_COPY.logoutHandoff) throw new Error("handoff chrome drifted");
  return true;
}
