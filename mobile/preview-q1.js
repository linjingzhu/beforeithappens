import { COVER_COPY, PREVIEW_Q1_COPY, S2_KEEP_COPY } from "./s0-s2-s3-copy.js";

export const PREVIEW_Q1_STORAGE_KEY = "loveme.preview-q1.v1";
export const PREVIEW_Q1_ID = "home-01";

/** Snapshot of `home-01` so the HTML preview does not need `src/questions.js`. */
export const PREVIEW_Q1_QUESTION = Object.freeze({
  id: PREVIEW_Q1_ID,
  sectionId: "home",
  number: 1,
  title: "우리에게 집은 어떤 의미에 가장 가까울까요?",
  intent: "함께 살 공간에 서로 다른 기대가 있는지 알아보는 질문이에요.",
  choices: Object.freeze([
    Object.freeze({ id: "home-rest", label: "외부의 피로를 회복하는 조용한 안식처" }),
    Object.freeze({ id: "home-social", label: "가족과 친구가 자연스럽게 모이는 열린 공간" }),
    Object.freeze({ id: "home-independent", label: "각자의 생활과 취향을 존중하는 독립적인 공간" }),
    Object.freeze({ id: "home-growth", label: "함께 목표를 세우고 성장해 가는 생활의 기반" })
  ])
});

const memory = new Map();

export function emptyPreviewDraft() {
  return {
    questionId: PREVIEW_Q1_ID,
    choiceId: "",
    open: false,
    keepAnswer: false
  };
}

export function defaultPreviewStorage() {
  return {
    getItem(key) {
      if (memory.has(key)) return memory.get(key);
      try {
        return globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      memory.set(key, String(value));
      try {
        globalThis.localStorage?.setItem(key, String(value));
      } catch {
        /* native has no localStorage */
      }
    },
    removeItem(key) {
      memory.delete(key);
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  };
}

export function resetPreviewStorage(storage = defaultPreviewStorage()) {
  memory.clear();
  storage.removeItem(PREVIEW_Q1_STORAGE_KEY);
}

export function readPreviewDraft(storage = defaultPreviewStorage()) {
  const raw = storage.getItem(PREVIEW_Q1_STORAGE_KEY);
  if (!raw) return emptyPreviewDraft();
  try {
    const parsed = JSON.parse(raw);
    return {
      questionId: parsed.questionId === PREVIEW_Q1_ID ? PREVIEW_Q1_ID : PREVIEW_Q1_ID,
      choiceId: typeof parsed.choiceId === "string" ? parsed.choiceId : "",
      open: Boolean(parsed.open),
      keepAnswer: Boolean(parsed.keepAnswer)
    };
  } catch {
    return emptyPreviewDraft();
  }
}

export function writePreviewDraft(draft, storage = defaultPreviewStorage()) {
  const next = {
    questionId: PREVIEW_Q1_ID,
    choiceId: String(draft?.choiceId || ""),
    open: Boolean(draft?.open),
    keepAnswer: Boolean(draft?.keepAnswer)
  };
  storage.setItem(PREVIEW_Q1_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function previewQ1Question() {
  return PREVIEW_Q1_QUESTION;
}

export function isPreviewQ1Choice(choiceId) {
  return Boolean(previewQ1Question()?.choices?.some((choice) => choice.id === choiceId));
}

export function previewAllowsOnlyFirstQuestion(questionId) {
  return questionId === PREVIEW_Q1_ID;
}

export function coverHasInvite(copy = COVER_COPY) {
  return /초대|invite/i.test(`${copy.title}${copy.line1}${copy.line2}${copy.cta}`);
}

export function coverHasSignup(copy = COVER_COPY) {
  return /로그인 링크 보내기|이메일/.test(`${copy.title}${copy.line1}${copy.line2}${copy.cta}`);
}

export function assertLockedCoverCopy() {
  if (COVER_COPY.title !== "두 사람의 결혼 준비, 한곳에") throw new Error("cover title drifted");
  if (COVER_COPY.line1 !== "질문은 나만 먼저 답해요.") throw new Error("cover line1 drifted");
  if (COVER_COPY.line2 !== "비교는 둘이 낸 뒤에만 열려요.") throw new Error("cover line2 drifted");
  if (COVER_COPY.cta !== "미리 질문 하나 보기") throw new Error("cover CTA drifted");
  if (S2_KEEP_COPY.title !== "이 답을 남기려면 로그인해 주세요") throw new Error("login-gate title drifted");
  if (S2_KEEP_COPY.body !== "비밀번호 없이 이메일로 로그인 링크를 보내드려요.") throw new Error("login-gate subtitle drifted");
  if (PREVIEW_Q1_COPY.keepCta !== "이 답 남기기") throw new Error("keep CTA drifted");
  if (coverHasInvite()) throw new Error("cover must not invite");
  if (coverHasSignup()) throw new Error("cover must not sign up");
  return true;
}
