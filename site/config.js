/**
 * What the site publishes, and how it is packaged.
 *
 * `PUBLISHED` is deliberately an explicit list rather than "every registered pack". The registry
 * holds the app's content too, and a site that published whatever it found would put a pack in
 * front of the public the first time someone registered one. Appearing here is a decision.
 */
export const SITE = Object.freeze({
  /**
   * The name a reader sees, everywhere: the rail's wordmark, every page title, the footer, the
   * Open Graph card. It was `AB` while the site had no mark of its own, which meant the wordmark
   * said one thing and the browser tab another. One name, one place.
   */
  name: "Love Me",
  /**
   * The second line of the mark. The domain is lovemedialogue.com and the full name is Love Me
   * Dialogue; the mark says both, with the weight on the half people will say out loud. It is not
   * folded into `name` because that one is a page title and a card title, where a two-word brand
   * followed by a page name is already long enough.
   */
  nameSuffix: "Dialogue",
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
  /**
   * Where a reader writes to. Empty until there is a real inbox: `site/pages.js` emits no 문의 page
   * without one, because a contact page carrying an address nobody reads is worse than none.
   * Filling this in is `docs/OWNER_ACTIONS.md` N5, and the page appears by itself when it is.
   */
  contactEmail: "",
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
 *
 * `pregnancy-100` is registered and built and deliberately **not** here. Being in the registry is
 * having content; being in this list is being published, and the second is a decision. Putting it
 * back is one entry — which is the whole reason this list is written out rather than derived.
 */
export const PUBLISHED = Object.freeze([
  Object.freeze({
    packId: "marriage-100",
    slug: "marriage",
    title: "결혼 100제",
    navTitle: "결혼 100제",
    /**
     * The line under the title, and the only question on the page the reader is not asked to
     * answer. It is what the hundred are for, said once.
     */
    tagline: "우리는 사랑 다음의 장면까지 얼마나 알고 있을까요?",
    /**
     * Written as lines rather than one string: the break between the two sentences is the author's,
     * and letting the measure decide where it falls would lose it. Search engines get them joined.
     */
    description: Object.freeze([
      "우리는 함께 미래를 꿈꾸지만, 마음속에 그려온 풍경은 서로 달랐을지도 모릅니다.",
      "그 다름을 하나씩 알아가는 순간, 결혼은 조금 더 따뜻하고 선명한 약속이 되지 않을까요?"
    ]),
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
