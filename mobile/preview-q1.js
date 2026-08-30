import { PACK_DETAIL_COPY } from "./s0-s2-s3-copy.js";

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
    keepAnswer: false,
    saved: false
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
      keepAnswer: Boolean(parsed.keepAnswer),
      saved: Boolean(parsed.saved)
    };
  } catch {
    return emptyPreviewDraft();
  }
}

export async function hydratePreviewStorage(storage = defaultPreviewStorage()) {
  if (typeof storage.hydrate === "function") {
    await storage.hydrate();
  }
  return readPreviewDraft(storage);
}

export function createPersistingPreviewStorage(backend) {
  const memory = new Map();
  return {
    async hydrate() {
      if (typeof backend?.getItem !== "function") return;
      const raw = await backend.getItem(PREVIEW_Q1_STORAGE_KEY);
      if (raw) memory.set(PREVIEW_Q1_STORAGE_KEY, String(raw));
    },
    getItem(key) {
      if (memory.has(key)) return memory.get(key);
      try {
        return backend?.getItemSync?.(key) ?? globalThis.localStorage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      memory.set(key, String(value));
      try {
        backend?.setItem?.(key, String(value));
      } catch {
        /* ignore */
      }
      try {
        globalThis.localStorage?.setItem(key, String(value));
      } catch {
        /* ignore */
      }
    },
    removeItem(key) {
      memory.delete(key);
      try {
        backend?.removeItem?.(key);
      } catch {
        /* ignore */
      }
      try {
        globalThis.localStorage?.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  };
}

export function writePreviewDraft(draft, storage = defaultPreviewStorage()) {
  const next = {
    questionId: PREVIEW_Q1_ID,
    choiceId: String(draft?.choiceId || ""),
    open: Boolean(draft?.open),
    keepAnswer: Boolean(draft?.keepAnswer),
    saved: Boolean(draft?.saved)
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

export function coverHasInvite(copy = PACK_DETAIL_COPY) {
  return /초대|invite/i.test(`${copy.title}${copy.line1}${copy.line2}${copy.line3}`);
}

export function coverHasSignup(copy = PACK_DETAIL_COPY) {
  return /로그인 링크 보내기|이메일/.test(`${copy.title}${copy.subtitle}${copy.line1}${copy.line2}${copy.line3}`);
}

export function assertLockedCoverCopy() {
  if (PACK_DETAIL_COPY.title !== "결혼") throw new Error("pack-detail title drifted");
  if (PACK_DETAIL_COPY.cta !== "링크 보내기") throw new Error("pack-detail CTA drifted");
  if (coverHasSignup()) throw new Error("pack-detail must not sign up");
  return true;
}
