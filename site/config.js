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
  /**
   * The site's own origin. `https`, not `http`: GitHub Pages issues a certificate for a custom
   * domain, a canonical pointing at `http` splits the site's identity across two schemes, and an
   * insecure page is marked as such in the browser. `AB_SITE_ORIGIN` overrides for previews.
   */
  origin: "https://lovemedialogue.com",
  /** Where a reader who wants the two-person version goes. Overridden by `AB_APP_ORIGIN`. */
  appOrigin: "",
  /** Emitted as a CNAME file so Pages keeps serving the custom domain on every deploy. */
  customDomain: "lovemedialogue.com",
  locale: "ko-KR",
  /** Ten to a page, per the strategy. A hundred questions is ten pages. */
  pageSize: 10
});

/**
 * Packs the site publishes, in order.
 *
 * `packId` takes either of a pack's two ids and is resolved through the registry. It is not
 * `catalogId`: that names a shelf in the app's pack list, and what the site publishes is not on
 * that shelf. `marriage-100` is the site's own pack — a hundred questions, free — and is a
 * different pack from the app's twelve-question `marriage`, which stays sold and stays private.
 */
export const PUBLISHED = Object.freeze([
  Object.freeze({
    packId: "marriage-100",
    slug: "marriage",
    title: "결혼 100제 — 우리 둘의 가치관",
    /** What the rail calls it. The full title is a headline and wraps to three lines in a column. */
    navTitle: "결혼 100제",
    description: "결혼을 앞둔 두 사람이 미리 맞춰 두면 좋은 100가지 질문. 정답은 없고, 서로의 기대를 먼저 알아보는 것이 목적입니다.",
    /** Shown above the questions, before the first one. */
    lead: "각 질문에는 네 개의 답이 있고, 어느 쪽도 더 옳지 않습니다. 지금 자신의 답을 골라 보고, 상대의 답이 궁금해지면 그때 같이 열어 보세요."
  }),
  Object.freeze({
    packId: "pregnancy-100",
    slug: "pregnancy",
    title: "임신 100제 — 함께 지나는 열 달",
    navTitle: "임신 100제",
    description: "임신을 함께 지나는 두 사람이 미리 맞춰 두면 좋은 100가지 질문. 몸의 경험은 한 사람에게 더 실리지만, 결정과 책임은 둘이 함께 만듭니다.",
    /**
     * The pack's own guide line, which the editorial build printed under every question. It is one
     * sentence and it was the same sentence a hundred times, so it belongs here, once.
     */
    lead: "각자 먼저 답하세요. 상대가 좋아할 답이 아니라, 실제 상황에서 내가 지킬 수 있는 선택을 골라요."
  })
]);

export function publishedBySlug(slug) {
  return PUBLISHED.find((entry) => entry.slug === String(slug || "")) || null;
}

export function siteWith(overrides = {}) {
  return Object.freeze({ ...SITE, ...overrides });
}
