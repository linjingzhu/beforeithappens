/**
 * Feedback about the *questions*, while they are being reviewed. Temporary by design.
 *
 * This is the debug surface: the block under each question asking whether the scene is realistic
 * and whether the four choices are distinct. It is here to be removed — the owner said so when
 * asking for it — so everything it needs lives in this file and behind `SITE.debugFeedback` in
 * `site/config.js`. Turning that flag off takes the block off every page; deleting this file, its
 * import in `enhance.js` and its block in `render.js` takes it out of the source.
 *
 * It is deliberately not part of `answers.js`. A rating here is about a question, not about a
 * relationship, and the two must not end up in one store where a later reader of the code could
 * mistake one for the other — the site shows a person no score about themselves, ever, and that
 * rule survives this file being deleted precisely because this file never touched the answers.
 *
 * Like an answer it lives in the reader's browser and is sent nowhere. The export below is how it
 * gets to the owner: the reviewer saves a file and hands it over, which keeps "the site makes no
 * request" true even while the site is being reviewed.
 */

/**
 * Its words, here rather than in `SITE_COPY`, so that the block is one file to delete. No imports,
 * so the browser can load this module without the pack registry coming along.
 */
export const FEEDBACK_COPY = Object.freeze({
  title: "질문 개선 피드백",
  badge: "DEBUG",
  lead: "상황이 현실적인지, 네 선택지가 한 축에서 넓고 겹치지 않는지, 대화가 자연스럽게 깊어지는지 평가해 주세요.",
  starsLabel: "5점 만점 평점",
  unrated: "별점을 선택해 주세요",
  rated: (n) => `${n}점을 선택했어요`,
  commentPlaceholder: "예: B와 D가 겹쳐 보여요 / 상황이 더 구체적이면 좋아요 / 실제로 대화가 깊어졌어요.",
  exportAction: "피드백 내보내기",
  exportEmpty: "아직 남긴 피드백이 없어요."
});

/** Bumped only if the stored shape changes incompatibly; an unknown version is discarded. */
export const FEEDBACK_VERSION = 1;
const COMMENT_MAX = 2000;
const RATINGS = Object.freeze([1, 2, 3, 4, 5]);

export function feedbackKey(slug) {
  return `ab.site.feedback.${String(slug || "")}`;
}

export function emptyFeedback(slug) {
  return { version: FEEDBACK_VERSION, slug: String(slug || ""), items: {} };
}

function validEntry(value) {
  if (!value || typeof value !== "object") return null;
  const rating = RATINGS.includes(value.rating) ? value.rating : 0;
  const comment = typeof value.comment === "string" ? value.comment.slice(0, COMMENT_MAX) : "";
  if (!rating && !comment) return null;
  return { rating, comment };
}

export function parseFeedback(raw, slug) {
  if (typeof raw !== "string" || !raw) return emptyFeedback(slug);
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    return emptyFeedback(slug);
  }
  if (!value || typeof value !== "object") return emptyFeedback(slug);
  if (value.version !== FEEDBACK_VERSION) return emptyFeedback(slug);
  if (String(value.slug || "") !== String(slug || "")) return emptyFeedback(slug);

  const items = {};
  for (const [questionId, entry] of Object.entries(value.items || {})) {
    const kept = validEntry(entry);
    if (kept) items[questionId] = kept;
  }
  return { version: FEEDBACK_VERSION, slug: String(slug || ""), items };
}

export function serializeFeedback(feedback) {
  return JSON.stringify({
    version: FEEDBACK_VERSION,
    slug: feedback?.slug || "",
    items: feedback?.items || {}
  });
}

/** Records a rating, a comment, or both; an entry left holding neither is dropped. */
export function withFeedback(feedback, questionId, patch = {}) {
  const id = String(questionId || "");
  if (!id) return feedback;
  const previous = feedback.items[id] || { rating: 0, comment: "" };
  const merged = {
    rating: patch.rating === undefined ? previous.rating : Number(patch.rating) || 0,
    comment: patch.comment === undefined ? previous.comment : String(patch.comment)
  };
  const kept = validEntry(merged);

  const items = { ...feedback.items };
  if (kept) items[id] = kept;
  else delete items[id];
  return { ...feedback, items };
}

export function feedbackCount(feedback) {
  return Object.keys(feedback?.items || {}).length;
}

export function createFeedbackStore(slug, storage = globalThis.localStorage) {
  const key = feedbackKey(slug);
  return {
    read() {
      try {
        return parseFeedback(storage?.getItem(key), slug);
      } catch {
        return emptyFeedback(slug);
      }
    },
    write(feedback) {
      try {
        storage?.setItem(key, serializeFeedback(feedback));
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      try {
        storage?.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };
}
