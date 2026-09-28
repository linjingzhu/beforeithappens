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
  contactEmail: "studio@afterscent.kr",
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
  adsenseClient: "ca-pub-4555236770786194",
  adsenseSlot: "",
  /**
   * The tokens Google Search Console and Naver Search Advisor hand out to prove the site is the
   * owner's. Each becomes one `<meta>` on the home page and nowhere else — that is where both
   * services look — and an empty one emits nothing. DNS verification works too and needs no code;
   * this is for the owner who would rather paste a token than edit a zone. (M1, `docs/OWNER_ACTIONS.md`
   * X5e·X5f.)
   */
  verification: Object.freeze({ google: "", naver: "786e0c020098433c2ff2652ed05a5b539d326ce1" }),
  /**
   * Kakao's JavaScript key, for the KakaoTalk button on the invite panel.
   *
   * KakaoTalk can be handed a link only through Kakao's own script, and the script needs a key
   * from developers.kakao.com with this site's domain registered as its Web platform
   * (`docs/OWNER_ACTIONS.md` N11). With the key, the button opens KakaoTalk's picker with the
   * link in the message; empty, the button copies the link and opens the app, and no script of
   * Kakao's is ever fetched. The key is public by design — it is meant to sit in a page.
   */
  kakaoJsKey: "",
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
  /**
   * Who signs the page. The footer's first line, on every page, at the owner's word (2026-09-02):
   * the studio's name, not the site's — `name` and `tagline` already stand in the rail and the
   * browser tab, and a footer that repeated them said nothing new. Written as the owner writes it,
   * with two capitals; `operator.business` keeps the registered spelling for the privacy policy.
   */
  publisher: "AfterScent",
  operator: Object.freeze({
    /** 상호. Given by the owner. */
    business: "afterscent",
    /** 대표자 성명. Also stands as 개인정보 보호책임자 unless `officer` says otherwise. */
    owner: "Jeongsu Lim",
    /** 주소 — 사업장 소재지, 지번으로. Given by the owner 2026-09-02 as "481, Gaebong-dong, Guro-gu, Seoul". */
    address: "서울특별시 구로구 개봉동 481",
    registration: "",
    mailOrder: "",
    /** 개인정보 보호책임자, when it is not the 대표자. */
    officer: ""
  }),
  /**
   * The question-review block under every question, and the switch that takes it away.
   *
   * It was scaffolding: the owner asked for it while the pack was being read through, and turned it
   * off on 2026-09-02. Off, no page carries the block or loads `site/feedback.js`; measured on a
   * question page, that took 980 of 4,396 visible characters (22%) of text that was not about the
   * question — and the word DEBUG — off every one of the ten. `true` brings it back for another
   * read-through with no other file touched. `site/feedback.js` and `startFeedback` in
   * `site/enhance.js` are what is left to delete once it is certain not to come back.
   */
  debugFeedback: false,
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
 * Being in the registry is having content; being in this list is being published, and the second is
 * a decision. The owner took it on 2026-09-28 for the four lifecycle packs that were written and
 * waiting — 임신, 출산, 육아, 노후 — so the site now publishes the arc rather than one station on it.
 * Each is one entry, which is the whole reason this list is written out rather than derived.
 *
 * 우울 100제 is written (`question-packs/depression.html`) and is **not** here, and not because it
 * is unfinished. It is a pack one person answers alone, and every surface around a pack on this site
 * is built for two: the invite panel, the 상대는 무엇을 고를까요 prompt under every question, the
 * result page that waits for the other person's sheet. Publishing it here would ask a reader to send
 * their depression answers to a partner to be guessed at, and would drop the per-question reflection
 * and the help line the pack is written around. It needs a solo surface, not an entry.
 *
 * Order is the order of a life, which is also the order the rail lists them in.
 */
/**
 * The scenes on the home page, one per pack, cropped from the owner's sheets in `brand/` by
 * `scripts/build-brand-assets.py`. Named here so a card and its picture cannot drift apart.
 *
 * Each carries its own size because the card declares it on the `<img>`, and that declaration is
 * how the browser reserves the right space before the picture arrives. They were all written as
 * one number for a while, which was near enough while every crop was a narrow portrait — the real
 * widths ran 220 to 264 against a declared 234. The drawings that arrived for 노후 and 육아 are
 * 323 and 327 wide, and a card reserving two thirds of the room it needs shoves the row sideways
 * the moment the picture loads.
 *
 * The height is the same for every scene on purpose: `SCENE_HEIGHT` in the generator crops to it,
 * and a common height is what makes crops of different widths read as one set. `test/site.test.js`
 * measures the shipped files against these numbers, so a re-crop cannot quietly leave them behind.
 */
const scene = (name, width) => Object.freeze({ src: `/brand/scene-${name}.jpg`, width, height: 440 });

export const SCENES = Object.freeze({
  dating: scene("dating", 220),
  marriage: scene("marriage", 234),
  pregnancy: scene("pregnancy", 221),
  birth: scene("birth", 231),
  parenting: scene("parenting", 327),
  later: scene("later", 323),
  goodbye: scene("goodbye", 275)
});

/**
 * The 1200x630 cards a link carries into a chat or a search result, from
 * `scripts/build-brand-assets.py`. One per published pack, plus the site's own.
 *
 * The site had no `og:image` at all, which for a service whose whole distribution is one person
 * sending another a link meant the link arrived as a grey rectangle with a line of text. 1200x630
 * is the size Open Graph, Twitter and KakaoTalk all read a large card at, and the numbers are
 * declared here for the same reason the scenes' are: the markup states them, and a card that was
 * re-cut to another shape would otherwise leave the page claiming the old one.
 */
const shareCard = (name) => Object.freeze({ src: `/brand/share-${name}.jpg`, width: 1200, height: 630 });

export const SHARE_CARDS = Object.freeze({
  /** Every page that is not a pack — the home page and the prose pages — shares this one. */
  home: shareCard("home"),
  marriage: shareCard("marriage"),
  pregnancy: shareCard("pregnancy"),
  birth: shareCard("birth"),
  parenting: shareCard("parenting"),
  later: shareCard("later")
});

/**
 * Packs that are coming, shown as a picture and nothing else.
 *
 * The owner's call, and the point of them is that they do nothing: a card with a title, a count and
 * a link would be a promise with a date attached, and there is no date. A picture says what is
 * coming without claiming when, and there is nothing to click that could disappoint.
 *
 * `alt` is what the picture shows, not what the pack will be called. A reader who cannot see it
 * gets the same thing a reader who can gets — the situation — rather than a name the design is
 * deliberately withholding.
 *
 * Four of these were holders until the packs behind them were written; they are cards in
 * `PUBLISHED` now, and a scene may not be in both lists at once — the same picture standing in a
 * card with a name and in a card that withholds one says two different things about the same pack.
 * What is left is 연애, which has a drawing and no questions yet, and 이별.
 *
 * 이별 is not a stage and so has no place in the lifecycle's order. It is the branch, not the next
 * step, and the only two positions that are not arbitrary are the ends. Last, because the cards
 * name nothing: a row that ends on two people looking at the floor says one more thing can happen
 * to two people, where the same picture wedged between 연애 and 임신 would read as the arc being
 * interrupted.
 */
export const COMING = Object.freeze([
  Object.freeze({ id: "dating", scene: SCENES.dating, alt: "반지를 사이에 둔 두 사람" }),
  Object.freeze({ id: "goodbye", scene: SCENES.goodbye, alt: "고개를 숙인 채 마주 선 두 사람" })
]);

/**
 * The line above the first question, on every pack's first page.
 *
 * It is the same sentence for all of them because it is not about the subject: it says there is no
 * right answer and that the other person's sheet opens later, which is the site's contract and does
 * not change between 임신 and 노후. Written once so a pack cannot be published with a slightly
 * different promise on it.
 */
const READER_LEAD =
  "각 질문에는 네 개의 답이 있고, 어느 쪽도 더 옳지 않습니다. 지금 자신의 답을 골라 보고, 상대의 답이 궁금해지면 그때 같이 열어 보세요.";

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
    lead: READER_LEAD
  }),
  Object.freeze({
    packId: "pregnancy-100",
    slug: "pregnancy",
    title: "임신 100제",
    navTitle: "임신 100제",
    tagline: "몸이 달라지는 열 달을, 우리는 어떻게 함께 건널까요?",
    description: Object.freeze([
      "입덧과 병원, 돈과 일, 양가와 말하지 못한 두려움까지 — 임신은 한 사람의 몸에서 시작되지만 두 사람이 함께 운영하는 시간입니다.",
      "그냥 지나가면 서운함으로 남는 것들을, 아이가 오기 전에 하나씩 꺼내 봅니다."
    ]),
    lead: READER_LEAD
  }),
  Object.freeze({
    packId: "birth-100",
    slug: "birth",
    title: "출산 100제",
    navTitle: "출산 100제",
    tagline: "그날 분만실에서, 우리는 같은 장면을 그리고 있을까요?",
    description: Object.freeze([
      "진통과 무통, 면회와 수유, 회복과 산후 돌봄까지 — 출산은 하루가 아니라 몇 주에 걸친 두 사람의 일입니다.",
      "급한 순간에는 의논할 시간이 없습니다. 미리 골라 둔 답은, 그날의 결정을 조금 덜 외롭게 합니다."
    ]),
    lead: READER_LEAD
  }),
  Object.freeze({
    packId: "parenting-100",
    slug: "parenting",
    title: "육아 100제",
    navTitle: "육아 100제",
    tagline: "아이를 키우는 하루를, 우리는 얼마나 같게 보고 있을까요?",
    description: Object.freeze([
      "밤중 수유와 훈육, 화면과 배움, 돈과 시간의 저울까지 — 육아는 사랑만으로 굴러가지 않고 두 사람이 정한 규칙으로 굴러갑니다.",
      "누가 무엇을 하는지 말로 정해 두지 않으면, 한 사람의 하루가 조용히 무너집니다."
    ]),
    lead: READER_LEAD
  }),
  Object.freeze({
    packId: "later-100",
    slug: "later",
    title: "노후 100제",
    navTitle: "노후 100제",
    tagline: "함께 늙어 간다는 것을, 우리는 어디까지 이야기해 두었을까요?",
    description: Object.freeze([
      "은퇴와 남은 돈, 달라지는 몸과 우리가 살 집, 자식과의 거리, 돌봄과 마지막 날까지 — 미루면 언젠가 남은 한 사람이 혼자 결정하게 됩니다.",
      "가장 말하기 어려운 이야기를, 아직 둘 다 건강한 지금 꺼내 봅니다."
    ]),
    lead: READER_LEAD
  })
]);

export function publishedBySlug(slug) {
  return PUBLISHED.find((entry) => entry.slug === String(slug || "")) || null;
}

export function siteWith(overrides = {}) {
  return Object.freeze({ ...SITE, ...overrides });
}
