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
  login: "로그인",
  invite: "연인을 초대하세요",
  logout: "로그아웃"
});

/** Entitlement lock on the remaining questions. Payment itself stays out of this slice. */
export const PACK_LOCK_COPY = Object.freeze({
  status: "잠김",
  notice: "샘플 3개 다음 질문은 아직 열리지 않았어요."
});

export const PACK_LIST_COPY = Object.freeze({
  title: "질문집",
  subtitle: "",
  soon: "곧 열려요"
});

export const PACK_LIST_ROWS = Object.freeze([
  Object.freeze({ id: "dating", label: "연애", open: false, mark: "♡" }),
  Object.freeze({ id: "marriage", label: "결혼", open: true, mark: "○" }),
  Object.freeze({ id: "home-mgmt", label: "가정 경영", open: false, mark: "⌂" }),
  Object.freeze({ id: "pregnancy", label: "임신", open: false, mark: "+" }),
  Object.freeze({ id: "birth", label: "출산", open: false, mark: "✦" }),
  Object.freeze({ id: "parenting", label: "육아", open: false, mark: "✶" })
]);

/** Designer proposal for the coming-soon 임시 체험 card. Swap this constant; do not invent pack-specific questions. */
export const COMING_SOON_SAMPLE_QUESTION = "가사와 시간은 어떻게 나누고 싶나요?";

export const TASTE_LABELS = Object.freeze({
  aligned: "같음",
  close: "가까움",
  discuss: "이야기해요"
});

export const COMING_SOON_TASTE_COPY = Object.freeze({
  badge: "곧 열려요",
  eyebrow: "",
  experience: "",
  sampleQuestion: COMING_SOON_SAMPLE_QUESTION,
  sampleCaption: "예시입니다.",
  cta: "",
  backToList: "목록으로"
});

export const RESULT_TASTE_COPY = Object.freeze({
  title: "결과 맛보기",
  label: TASTE_LABELS.close,
  labels: TASTE_LABELS,
  question: COMING_SOON_SAMPLE_QUESTION,
  me: "나",
  partner: "상대",
  meAnswer: "평일은 반반, 주말은 그때 그때요.",
  partnerAnswer: "한 사람이 메인으로 하고 나머지는 나눠요.",
  caption: "진짜 비교는 열린 팩에서 둘이 낸 다음입니다.",
  example: "예시입니다.",
  cta: "목록으로"
});

export function isComingSoonPackId(id) {
  return PACK_LIST_ROWS.some((row) => row.id === id && !row.open);
}

export function comingSoonPackLabel(id) {
  return PACK_LIST_ROWS.find((row) => row.id === id && !row.open)?.label || "";
}

export function packListLabel(id) {
  return PACK_LIST_ROWS.find((row) => row.id === id)?.label || "";
}

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
  if (PACK_LIST_COPY.title !== "질문집") throw new Error("pack-list title drifted");
  if (PACK_LIST_COPY.soon !== "곧 열려요") throw new Error("pack-list soon pill drifted");
  if (PACK_LIST_ROWS[0].id !== "dating" || PACK_LIST_ROWS[0].label !== "연애" || PACK_LIST_ROWS[0].open) {
    throw new Error("dating row drifted");
  }
  if (PACK_LIST_ROWS[1].label !== "결혼" || !PACK_LIST_ROWS[1].open) throw new Error("marriage row drifted");
  if (PACK_LIST_ROWS.filter((row) => row.open).length !== 1) throw new Error("only marriage should be open");
  if (PACK_LIST_ROWS.map((row) => row.label).join(",") !== "연애,결혼,가정 경영,임신,출산,육아") {
    throw new Error("pack-list order drifted");
  }
  if (COMING_SOON_TASTE_COPY.badge !== "곧 열려요") throw new Error("coming-soon badge drifted");
  if (COMING_SOON_TASTE_COPY.sampleQuestion !== "가사와 시간은 어떻게 나누고 싶나요?") {
    throw new Error("coming-soon sample question drifted");
  }
  if (COMING_SOON_TASTE_COPY.backToList !== "목록으로") throw new Error("coming-soon list link drifted");
  if (RESULT_TASTE_COPY.labels.aligned !== "같음") throw new Error("taste aligned label drifted");
  if (RESULT_TASTE_COPY.labels.close !== "가까움") throw new Error("taste close label drifted");
  if (RESULT_TASTE_COPY.labels.discuss !== "이야기해요") throw new Error("taste discuss label drifted");
  if (RESULT_TASTE_COPY.example !== "예시입니다.") throw new Error("taste-result example line drifted");
  if (["ALIGNED", "CLOSE", "DISCUSS"].includes(RESULT_TASTE_COPY.label)) {
    throw new Error("taste-result must use Korean labels only");
  }
  if (ACCOUNT_COPY.title !== "계정") throw new Error("account title drifted");
  if (ACCOUNT_COPY.login !== "로그인") throw new Error("account login drifted");
  if (ACCOUNT_COPY.invite !== "연인을 초대하세요") throw new Error("account invite drifted");
  if (ACCOUNT_COPY.logout !== "로그아웃") throw new Error("account logout drifted");
  return true;
}
