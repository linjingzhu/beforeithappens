/**
 * What the site publishes, and how it is packaged.
 *
 * `PUBLISHED` is deliberately an explicit list rather than "every registered pack". The registry
 * holds the app's content too, and a site that published whatever it found would put a pack in
 * front of the public the first time someone registered one. Appearing here is a decision.
 */
export const SITE = Object.freeze({
  name: "AB",
  tagline: "다가올 삶을, 함께 준비하다.",
  /** Set to the site's own origin at build time; used for canonical URLs and structured data. */
  origin: "",
  /** Where a reader who wants the two-person version goes. */
  appOrigin: "",
  locale: "ko-KR",
  /** Ten to a page, per the strategy. A hundred questions is ten pages. */
  pageSize: 10
});

/**
 * Packs the site publishes, in order.
 *
 * `혼자만의 연애` is not written yet (order of work step 3). Until it is, this list carries the
 * marriage pack so the machine is provably working end to end — publishing questions is safe
 * because the paid thing is the two-person loop, not the text. Whether it *should* be public is
 * the owner's call, and removing it is deleting one entry.
 */
export const PUBLISHED = Object.freeze([
  Object.freeze({
    catalogId: "marriage",
    slug: "marriage",
    title: "결혼 전에 나눠야 할 대화",
    description: "결혼을 앞둔 두 사람이 미리 맞춰 두면 좋은 질문들. 정답은 없고, 서로의 기대를 먼저 알아보는 것이 목적입니다.",
    /** Shown above the questions, before the first one. */
    lead: "각 질문에는 네 개의 답이 있고, 어느 쪽도 더 옳지 않습니다. 지금 자신의 답을 골라 보고, 상대의 답이 궁금해지면 그때 같이 열어 보세요."
  })
]);

export function publishedBySlug(slug) {
  return PUBLISHED.find((entry) => entry.slug === String(slug || "")) || null;
}

export function siteWith(overrides = {}) {
  return Object.freeze({ ...SITE, ...overrides });
}
