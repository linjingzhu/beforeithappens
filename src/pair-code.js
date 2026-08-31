export const APP_SCHEME = "loveme";
export const PAIR_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const PAIR_CODE_LENGTH = 8;

export const PAIR_COPY = Object.freeze({
  headline: "링크 보내기",
  sub: "초대를 보내면 상대도 같은 팩을 받아요.",
  copyLink: "링크 복사",
  instagram: "인스타그램",
  kakao: "카카오톡",
  appCode: "앱에서 코드로 연결",
  myCode: "내 코드",
  copyCode: "복사",
  partnerCard: "상대 코드를 알고 있다면",
  partnerPlaceholder: "상대 코드 입력",
  connect: "연결하기"
});

export const PACK_DETAIL_SAMPLES = Object.freeze([
  "예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요?",
  "명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요?",
  "우리에게 집은 어떤 의미에 가장 가까울까요?"
]);

export const PACK_DETAIL_COPY = Object.freeze({
  title: "결혼",
  subtitle: "두 사람의 결혼 준비, 한곳에.",
  samplesTitle: "예시 질문",
  samples: PACK_DETAIL_SAMPLES,
  caption: "여기서 답하지 않아요. 파트너가 연결된 다음 질문이 열려요.",
  captionLines: Object.freeze([
    "여기서 답하지 않아요.",
    "파트너가 연결된 다음 질문이 열려요."
  ]),
  cta: "링크 보내기"
});

export const ACCOUNT_COPY = Object.freeze({
  title: "계정",
  email: "이메일",
  logout: "로그아웃"
});

export const PACK_LIST_COPY = Object.freeze({
  title: "질문집",
  subtitle: "결혼만 지금 열려 있어요.",
  soon: "곧 열려요"
});

export const PACK_LIST_ROWS = Object.freeze([
  Object.freeze({ id: "marriage", label: "결혼", open: true }),
  Object.freeze({ id: "home-mgmt", label: "가정 경영", open: false }),
  Object.freeze({ id: "pregnancy", label: "임신", open: false }),
  Object.freeze({ id: "birth", label: "출산", open: false }),
  Object.freeze({ id: "parenting", label: "육아", open: false })
]);

export const PAIR_ERRORS = Object.freeze({
  "invalid-code": "코드를 다시 확인해 주세요.",
  "not-found": "코드를 다시 확인해 주세요.",
  self: "자신의 코드로는 연결할 수 없어요.",
  "already-paired": "이미 두 사람이 연결되어 있어요.",
  full: "이 워크스페이스는 두 명까지예요.",
  failed: "연결하지 못했어요. 잠시 후 다시 시도해 주세요.",
  unauthenticated: "로그인이 필요해요."
});

export function normalizePairCode(raw) {
  return String(raw || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
}

export function formatPairCode(raw) {
  const code = normalizePairCode(raw);
  if (code.length <= 4) return code;
  return `${code.slice(0, 4)} ${code.slice(4)}`;
}

export function generatePairCode(randomBytes) {
  const bytes = typeof randomBytes === "function" ? randomBytes(PAIR_CODE_LENGTH) : randomBytes;
  let out = "";
  for (let i = 0; i < PAIR_CODE_LENGTH; i++) {
    out += PAIR_CODE_ALPHABET[Number(bytes[i] || 0) % PAIR_CODE_ALPHABET.length];
  }
  return out;
}

export function consumeAppUrl(token) {
  return `${APP_SCHEME}:///auth/consume?token=${encodeURIComponent(String(token || ""))}`;
}

export function inviteAppUrl() {
  return `${APP_SCHEME}://invite`;
}

export function inviteShareUrl(origin) {
  const base = String(origin || "").replace(/\/$/, "");
  return `${base}/invite/open`;
}

export function shareContainsPairCode(url, code) {
  const haystack = String(url || "").toUpperCase();
  const needle = normalizePairCode(code);
  return Boolean(needle) && haystack.includes(needle);
}

export function assertLockedMeasurementCopy() {
  if (PAIR_COPY.headline !== "링크 보내기") throw new Error("invite headline drifted");
  if (PAIR_COPY.sub !== "초대를 보내면 상대도 같은 팩을 받아요.") throw new Error("invite sub drifted");
  if (PAIR_COPY.copyLink !== "링크 복사") throw new Error("invite copy-link drifted");
  if (PAIR_COPY.instagram !== "인스타그램") throw new Error("invite Instagram drifted");
  if (PAIR_COPY.kakao !== "카카오톡") throw new Error("invite KakaoTalk drifted");
  if (PAIR_COPY.appCode !== "앱에서 코드로 연결") throw new Error("invite app-code drifted");
  if (PAIR_COPY.myCode !== "내 코드") throw new Error("invite my-code drifted");
  if (PAIR_COPY.copyCode !== "복사") throw new Error("invite copy-code drifted");
  if (PAIR_COPY.partnerCard !== "상대 코드를 알고 있다면") throw new Error("invite partner card drifted");
  if (PAIR_COPY.partnerPlaceholder !== "상대 코드 입력") throw new Error("invite placeholder drifted");
  if (PAIR_COPY.connect !== "연결하기") throw new Error("invite connect CTA drifted");
  if (PACK_LIST_COPY.title !== "질문집") throw new Error("pack-list title drifted");
  if (PACK_LIST_COPY.subtitle !== "결혼만 지금 열려 있어요.") throw new Error("pack-list subtitle drifted");
  if (PACK_LIST_COPY.soon !== "곧 열려요") throw new Error("pack-list soon pill drifted");
  if (PACK_LIST_ROWS[0].label !== "결혼" || !PACK_LIST_ROWS[0].open) throw new Error("marriage row drifted");
  if (PACK_LIST_ROWS.slice(1).some((row) => row.open || row.label === "결혼")) throw new Error("closed pack rows drifted");
  if (PACK_DETAIL_COPY.title !== "결혼") throw new Error("pack-detail title drifted");
  if (PACK_DETAIL_COPY.subtitle !== "두 사람의 결혼 준비, 한곳에.") throw new Error("pack-detail subtitle drifted");
  if (PACK_DETAIL_COPY.samplesTitle !== "예시 질문") throw new Error("pack-detail samples title drifted");
  if (PACK_DETAIL_COPY.caption !== "여기서 답하지 않아요. 파트너가 연결된 다음 질문이 열려요.") {
    throw new Error("pack-detail caption drifted");
  }
  if (PACK_DETAIL_COPY.samples.length !== 3) throw new Error("pack-detail must show three sample cards");
  if (PACK_DETAIL_COPY.samples[0] !== "예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요?") {
    throw new Error("pack-detail sample 1 drifted");
  }
  if (PACK_DETAIL_COPY.samples[1] !== "명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요?") {
    throw new Error("pack-detail sample 2 drifted");
  }
  if (PACK_DETAIL_COPY.samples[2] !== "우리에게 집은 어떤 의미에 가장 가까울까요?") {
    throw new Error("pack-detail sample 3 drifted");
  }
  if (PACK_DETAIL_COPY.samples.some((sample) => /결혼식 규모|결혼 비용|양가 명절은/.test(sample))) {
    throw new Error("discarded pack-detail samples returned");
  }
  if (PACK_DETAIL_COPY.cta !== "링크 보내기") throw new Error("pack-detail CTA drifted");
  if (ACCOUNT_COPY.title !== "계정") throw new Error("account title drifted");
  if (ACCOUNT_COPY.email !== "이메일") throw new Error("account email drifted");
  if (ACCOUNT_COPY.logout !== "로그아웃") throw new Error("account logout drifted");
  return true;
}
