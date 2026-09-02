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
  /** Emitted as a CNAME file so Pages keeps serving the custom domain on every deploy. */
  customDomain: "lovemedialogue.com",
  /**
   * Where a reader writes to. `site/pages.js` emits the 문의 page from this, with its footer link
   * and its sitemap entry, and emits none of it when the address is empty — a contact page
   * carrying an address nobody reads is worse than no contact page.
   */
  contactEmail: "loveme@afterscent.kr",
  locale: "ko-KR",
  /**
   * AdSense, and the two facts it needs.
   *
   * `adsenseClient` is the publisher id (`ca-pub-…`), `adsenseSlot` the unit's id. Empty means no
   * script, no unit and no `ads.txt` — the pages build and read exactly as they do now, and there
   * is nothing to remember to switch off in a preview. Filling both in is what turns the site into
   * the MVP; until then the slot on each page stays the empty box it has always been.
   *
   * Google will not approve a site without a privacy policy that says what is collected. This one
   * keeps answers in the reader's own browser, but AdSense itself sets cookies, so that page has
   * to exist and has to say so — `docs/OWNER_ACTIONS.md` N5.
   */
  adsenseClient: "",
  adsenseSlot: "",
  /**
   * Who operates the site, for the privacy policy — and the reason that page does or does not exist.
   *
   * `개인정보 보호법` 제30조 requires a policy to name a 개인정보 보호책임자 with a contact, and a
   * policy that names nobody is not a policy. `상호` and the contact address are known; the rest is
   * the owner's to give (`docs/OWNER_ACTIONS.md` N5). So the page is emitted only once `owner` and
   * `address` are set, exactly as 문의 waits on `contactEmail` — an unfinished legal document is
   * worse than an absent one, and there is nothing to remember to switch on.
   *
   * `registration` (사업자등록번호) and `mailOrder` (통신판매업 신고번호) are optional: an operator
   * who is not a registered business has neither, and a policy is not improved by an empty field.
   * They are printed when present and omitted when not.
   */
  operator: Object.freeze({
    /** 상호. Given by the owner. */
    business: "afterscent",
    /** 대표자 성명. Also stands as 개인정보 보호책임자 unless `officer` says otherwise. */
    owner: "",
    /** 주소 — 사업장 소재지. Given by the owner 2026-09-02. */
    address: "서울시 구로구 개봉로 20길 6",
    registration: "",
    mailOrder: "",
    /** 개인정보 보호책임자, when it is not the 대표자. */
    officer: ""
  }),
  /**
   * The question-review block under every question, and the switch that takes it away.
   *
   * It is scaffolding: the owner asked for it while the pack is being read through, and said it
   * comes out afterwards. `false` removes it from every page on the next build — no other file
   * needs editing — and `site/feedback.js` is then the only thing left to delete.
   */
  debugFeedback: true,
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
/**
 * The scenes on the home page, one per pack, cropped from `brand/pack-scenes.jpg` by
 * `scripts/build-brand-assets.py`. Named here so a card and its picture cannot drift apart.
 */
export const SCENES = Object.freeze({
  dating: "/brand/scene-dating.jpg",
  marriage: "/brand/scene-marriage.jpg",
  pregnancy: "/brand/scene-pregnancy.jpg",
  birth: "/brand/scene-birth.jpg",
  later: "/brand/scene-later.jpg"
});

/**
 * Packs that are coming, shown as a picture and nothing else.
 *
 * The owner's call, and the point of them is that they do nothing: a card with a title, a count and
 * a link would be a promise with a date attached, and there is no date. A picture of two people
 * holding a pregnancy test says what is coming without claiming when, and there is nothing to click
 * that could disappoint.
 *
 * `alt` is what the picture shows, not what the pack will be called. A reader who cannot see it
 * gets the same thing a reader who can gets — the situation — rather than a name the design is
 * deliberately withholding.
 *
 * In the order the stages arrive, after the one pack that can actually be read.
 *
 * The bench scene is 노후, at the owner's word and on the evidence. It was first taken for 육아
 * because at full resolution the book in her hands is labelled Childcare — but the card draws that
 * scene 108x180, where the book is 34x31 and its lettering about 6px. What anyone actually sees is
 * two people sitting close together at rest, which is the stage the owner named.
 *
 * The holders name nothing, so each promises whatever its picture shows. 육아 and 교육 are the two
 * left without one — `docs/OWNER_ACTIONS.md` N8.
 */
export const COMING = Object.freeze([
  Object.freeze({ id: "dating", scene: SCENES.dating, alt: "반지를 사이에 둔 두 사람" }),
  Object.freeze({ id: "pregnancy", scene: SCENES.pregnancy, alt: "임신을 앞둔 두 사람" }),
  Object.freeze({ id: "birth", scene: SCENES.birth, alt: "갓 태어난 아이를 안은 두 사람" }),
  Object.freeze({ id: "later", scene: SCENES.later, alt: "벤치에 나란히 앉은 두 사람" })
]);

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
