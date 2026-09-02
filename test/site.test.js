import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { PUBLISHED, SITE, publishedBySlug, siteWith } from "../site/config.js";
import { allPages, descriptionLines, indexModel, pageModel, pagePath, partsOf } from "../site/content.js";
import { SITE_COPY, renderIndex, renderQuestionPage, renderResultPage, renderStandingPage } from "../site/render.js";
import { RESULT_COPY } from "../site/result-copy.js";
import { headTags, pageDescription, pageTitle, robotsTxt, sitemapXml, structuredData } from "../site/seo.js";
import { findPack, questionsFor } from "../src/packs.js";

const site = siteWith({ origin: "https://ab.example", appOrigin: "https://app.example" });
/** The pack the site actually publishes, read through the same list the build reads. */
const published = questionsFor(PUBLISHED[0].packId);
const PARTS = partsOf(PUBLISHED[0].packId);
const LAST_PAGE = PARTS.length;
/** Two real questions from the published pack, so the ids are never hand-copied. */
const [Q1, Q2] = published;
const has = (html, text) => html.includes(text);
/** Every JSON-LD document in a rendered block or page, parsed. */
const blocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
  .map((match) => JSON.parse(match[1].replace(/\\u003c/g, "<")));

test("a page is a Part, so the pack's own structure decides where the pages cut", () => {
  assert.equal(PARTS.length, 10, "ten Parts, ten pages");
  assert.deepEqual(PARTS.map((part) => part.questions.length), Array(10).fill(10));
  assert.deepEqual(
    PARTS.map((part) => part.number),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "numbered from one, in the pack's section order"
  );
  // The cut is the section boundary, not an arithmetic one: every question on a page belongs to
  // that page's Part. This is what a tab can honestly be named after.
  for (const part of PARTS) {
    for (const question of part.questions) {
      assert.equal(question.sectionId, part.id, `${question.id} belongs to ${part.title}`);
    }
  }
  assert.deepEqual(partsOf("no-such-pack"), [], "an unknown pack has no parts, rather than throwing");
});

test("a reader sees the question's own number, so Part two starts at eleven", () => {
  assert.deepEqual(PARTS[0].questions.map((q) => q.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(PARTS[1].questions.map((q) => q.number), [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  assert.equal(PARTS.at(-1).questions.at(-1).number, published.length);
});

test("paths are clean and page one has no number in it", () => {
  assert.equal(pagePath("marriage", 1), "/marriage/");
  assert.equal(pagePath("marriage", 2), "/marriage/2/");
  assert.equal(pagePath("marriage", 0), "/marriage/");
});

test("an unpublished pack, or a page past the end, is a definite no", () => {
  assert.equal(pageModel("marriage", 1, { site }) !== null, true);
  assert.equal(pageModel("dating", 1, { site }), null, "only what config publishes is reachable");
  assert.equal(pageModel("marriage", 99, { site }), null, "past the end is null, not an empty page");
  assert.equal(pageModel("", 1, { site }), null);
  assert.equal(publishedBySlug("nope"), null);
});

test("the site publishes only what it names, never whatever the registry happens to hold", () => {
  // The registry holds the app's content too. A site that published everything it found would put
  // a pack in front of the public the first time someone registered one.
  assert.deepEqual(PUBLISHED.map((entry) => entry.packId), ["marriage-100"]);
  // Registered and built, and deliberately not published — the registry is content, this is a
  // decision, and the two are not the same thing.
  assert.equal(questionsFor("pregnancy-100").length, 100, "the pack exists");
  assert.equal(pageModel("pregnancy", 1, { site }), null, "and the site emits no page for it");
  assert.equal(pageModel("marriage-preparation", 1, { site }), null, "the app's pack is not on the site");
  assert.equal(pageModel("dating", 1, { site }), null);
  assert.deepEqual(indexModel({ site }).packs.map((p) => p.slug), ["marriage"]);
});

test("the model knows where it is in the series", () => {
  const first = pageModel("marriage", 1, { site });
  assert.equal(first.first, true);
  assert.equal(first.last, false);
  assert.equal(first.previousPath, "", "page one has no previous");
  assert.equal(first.nextPath, "/marriage/2/");
  assert.ok(first.lead, "the lead is on the first page only");

  const last = pageModel("marriage", LAST_PAGE, { site });
  assert.equal(last.last, true);
  assert.equal(last.nextPath, "", "the last page offers no next");
  assert.equal(last.previousPath, `/marriage/${LAST_PAGE - 1}/`);
  assert.equal(last.lead, "");
});

test("every page is emitted, in order, once", () => {
  const pages = allPages({ site });
  assert.equal(LAST_PAGE, 10, "a hundred questions, ten to a Part");
  assert.equal(pages.length, PUBLISHED.length * LAST_PAGE, "every pack's every Part");
  const marriagePages = pages.filter((p) => p.slug === "marriage");
  assert.deepEqual(
    marriagePages.map((p) => p.path),
    ["/marriage/", ...Array.from({ length: LAST_PAGE - 1 }, (_, i) => `/marriage/${i + 2}/`)]
  );
  // Packs are emitted in the order they are published, not interleaved.
  assert.deepEqual([...new Set(pages.map((p) => p.slug))], PUBLISHED.map((entry) => entry.slug));
  assert.equal(new Set(pages.map((p) => p.path)).size, pages.length);
});

test("the page is readable with no JavaScript at all", () => {
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  // A crawler that runs nothing must still see the questions; the app's innerHTML approach would
  // hand it an empty shell. One script ships, and only as enhancement — what it adds is memory, so
  // scripting off costs the ability to record an answer, never the ability to read one.
  const scripts = html.match(/<script[^>]*>/g) || [];
  // A `<script type="application/json">` block is data the browser does not run — structured data
  // for a crawler, and the pack index the 이어서 key reads. The claim worth holding is about code:
  // exactly one thing executes, and it is the enhancement module. Listing the tags verbatim made
  // this fail the moment a data block was added, which is not the thing it is guarding.
  const runs = scripts.filter((tag) => !/type="application\/(ld\+)?json"/.test(tag));
  assert.deepEqual(runs, ['<script type="module" src="/enhance.js">'],
    "exactly one behavioural script, and it is the enhancement module");
  assert.ok(scripts.some((tag) => tag.includes('type="application/ld+json"')), "structured data is still there");
  assert.ok(scripts.some((tag) => tag.includes("data-pack-index")), "and the pack index the resume key reads");
  // Data, not code: it must carry no executable attribute.
  assert.equal(/<script[^>]*data-pack-index[^>]*\ssrc=/.test(html), false);
  for (const question of published.slice(0, 10)) {
    assert.ok(has(html, question.title), question.id);
    for (const choice of question.choices) assert.ok(has(html, choice.label), choice.id);
  }
});

test("each page in the series says which page it is", () => {
  const one = pageModel("marriage", 1, { site });
  const two = pageModel("marriage", LAST_PAGE, { site });
  // Pointing every page's canonical at page one would hide nine tenths of the content.
  assert.ok(has(headTags(one, site), 'rel="canonical" href="https://ab.example/marriage/"'));
  assert.ok(has(headTags(two, site), `rel="canonical" href="https://ab.example/marriage/${LAST_PAGE}/"`));
  assert.ok(has(headTags(one, site), 'rel="next"'));
  assert.equal(has(headTags(one, site), 'rel="prev"'), false);
  assert.ok(has(headTags(two, site), 'rel="prev"'));
  assert.equal(has(headTags(two, site), 'rel="next"'), false);

  assert.notEqual(pageTitle(one, site), pageTitle(two, site), "two pages, two titles");
  assert.notEqual(pageDescription(one), pageDescription(two));
});

test("every Part is named in its own title and described by its own blurb", async () => {
  // Ten pages whose titles differed only by `(5/10)` gave a search engine nothing to tell them
  // apart and a reader no reason to open one. The pack already names its Parts; this uses it.
  const models = [];
  for (let page = 1; page <= LAST_PAGE; page += 1) models.push(pageModel("marriage", page, { site }));

  const titles = models.map((model) => pageTitle(model, site));
  assert.equal(new Set(titles).size, titles.length, "ten Parts, ten titles");
  for (const model of models) {
    const title = pageTitle(model, site);
    assert.ok(title.includes(model.part.title), `${model.page}: names its Part — ${title}`);
    assert.ok(title.startsWith(model.title), "with the pack's own name still in front");
    assert.ok(title.endsWith(site.name));
  }

  // Page one is the pack's front door, so it keeps the author's pitch. The rest describe the Part.
  assert.equal(pageDescription(models[0]), models[0].descriptionText || models[0].description);
  for (const model of models.slice(1)) {
    assert.ok(pageDescription(model).startsWith(model.part.blurb), `${model.page}: leads with its blurb`);
  }
  const descriptions = models.map((model) => pageDescription(model));
  assert.equal(new Set(descriptions).size, descriptions.length, "and no two are the same");
});

test("every public page carries the same head, so none can be built with half of one", async () => {
  // The home page had no description and no Open Graph tags at all, because it wrote its own head
  // by hand while the question pages called `headTags`. Three copies of a block is how that
  // happens. The list is derived from a question page rather than typed out here — a hand-written
  // list of expected tags has been wrong before, and it would pass while the real set shrank.
  const { renderIndex, renderStandingPage } = await import("../site/render.js");
  const { indexModel } = await import("../site/content.js");
  const { standingPages } = await import("../site/pages.js");

  const question = renderQuestionPage(pageModel("marriage", 2, { site }), site);
  const names = [...question.matchAll(/<meta (?:property|name)="((?:og:|twitter:)[\w:]+)"/g)].map((m) => m[1]);
  assert.ok(names.includes("og:title") && names.includes("og:description") && names.includes("og:url"));

  const pages = [renderIndex(indexModel({ site }), site)]
    .concat(standingPages({ site }).map((page) => renderStandingPage(page, site)));
  for (const html of pages) {
    for (const name of names) {
      assert.ok(html.includes(`"${name}"`), `${name} is on every public page`);
    }
    assert.match(html, /<meta name="description" content="[^"]+">/, "and so is a description");
    assert.match(html, /<link rel="canonical" href="https:\/\/ab\.example[^"]*">/);
  }
  // The home page is a site; the prose pages are documents on it.
  assert.match(pages[0], /<meta property="og:type" content="website">/);
});

test("the home page's description is the owner's own words, not a new sentence", async () => {
  const { SITE_COPY } = await import("../site/render.js");
  const { homeDescription, homeTagline, homeBlurb } = SITE_COPY;
  assert.ok(homeDescription.startsWith(homeTagline), "it opens with the headline as written");
  const rest = homeDescription.slice(homeTagline.length).trim();
  assert.ok(rest.length > 0 && homeBlurb.startsWith(rest), "and continues with the paragraph's own first sentence");
});

test("a link into a chat carries a card, not a grey rectangle", async () => {
  // The site had no og:image at all, which for a service whose whole distribution is one person
  // sending another a link is the most expensive thing missing from it.
  const { SHARE_CARDS } = await import("../site/config.js");
  const { renderIndex, renderStandingPage } = await import("../site/render.js");
  const { indexModel } = await import("../site/content.js");
  const { standingPages } = await import("../site/pages.js");

  const pages = [
    renderIndex(indexModel({ site }), site),
    renderQuestionPage(pageModel("marriage", 4, { site }), site),
    ...standingPages({ site }).map((page) => renderStandingPage(page, site))
  ];
  for (const html of pages) {
    // Absolute, because the app fetching the page has no base to resolve a path against.
    assert.match(html, /<meta property="og:image" content="https:\/\/ab\.example\/brand\/share-[a-z]+\.jpg">/);
    assert.ok(has(html, '<meta property="og:image:width" content="1200">'));
    assert.ok(has(html, '<meta property="og:image:height" content="630">'));
    assert.ok(has(html, '<meta name="twitter:card" content="summary_large_image">'));
    assert.match(html, /<meta property="og:image:alt" content="[^"]+">/);
  }
  // A pack shares its own card; everything else shares the site's.
  assert.ok(has(pages[1], SHARE_CARDS.marriage.src));
  assert.ok(has(pages[0], SHARE_CARDS.home.src));

  // The numbers on the tag are the file's own, so a re-cut card cannot leave the page claiming the
  // old shape — the same check the scenes get, for the same reason.
  for (const [name, card] of Object.entries(SHARE_CARDS)) {
    const file = `site${card.src}`;
    assert.ok(existsSync(file), `${name}: ${file} is generated and committed`);
    assert.deepEqual(jpegSize(file), { width: card.width, height: card.height },
      `${name}: re-run \`python3 scripts/build-brand-assets.py\``);
    // Big enough to be a card, small enough that a chat app will actually fetch it.
    const bytes = statSync(file).size;
    assert.ok(bytes > 8000 && bytes < 300_000, `${name} is ${bytes} bytes`);
  }

  // With no origin there is no absolute address, so the tag is left off rather than pointing at a
  // path nothing can resolve — and the card falls back to the small layout it can actually fill.
  const bare = siteWith({ origin: "" });
  const html = renderIndex(indexModel({ site: bare }), bare);
  assert.equal(has(html, "og:image"), false);
  assert.ok(has(html, '<meta name="twitter:card" content="summary">'));
});

test("the site says who publishes it, and every page says where it sits", async () => {
  const { renderIndex, renderStandingPage } = await import("../site/render.js");
  const { indexModel } = await import("../site/content.js");
  const { standingPages } = await import("../site/pages.js");

  const [organization, website] = blocks(renderIndex(indexModel({ site }), site))
    .flatMap((block) => block["@graph"] || [block]);
  assert.equal(organization["@type"], "Organization");
  assert.equal(website["@type"], "WebSite");
  assert.equal(website.publisher["@id"], organization["@id"], "the site names its publisher");
  assert.equal(website.inLanguage, site.locale);
  // Everything in it is a fact the owner gave; nothing here is invented.
  assert.equal(organization.legalName, SITE.operator.business);
  assert.equal(organization.email, SITE.contactEmail);
  assert.ok(organization.address.streetAddress.includes(SITE.operator.address));
  // There is no site search, so claiming one would be a lie that costs nothing to tell.
  assert.equal(has(JSON.stringify(website), "SearchAction"), false);
  // A field the owner has not given is left out rather than guessed at.
  const anonymous = siteWith({ operator: { business: "", owner: "", address: "" }, contactEmail: "" });
  const bare = blocks(renderIndex(indexModel({ site: anonymous }), anonymous))[0]["@graph"][0];
  assert.equal("address" in bare, false);
  assert.equal("email" in bare, false);

  // The trail a search result prints instead of the URL. Its crumbs are real pages.
  const trails = [
    [renderQuestionPage(pageModel("marriage", 1, { site }), site), [site.name, "결혼 100제"]],
    [renderQuestionPage(pageModel("marriage", 6, { site }), site), [site.name, "결혼 100제", "6부 다투고 다시 손잡는 법"]],
    [renderStandingPage(standingPages({ site })[0], site), [site.name, "소개"]]
  ];
  const built = new Set(["/", ...allPages({ site }).map((page) => page.path), ...standingPages({ site }).map((page) => page.path)]);
  for (const [html, names] of trails) {
    const trail = blocks(html).find((block) => block["@type"] === "BreadcrumbList");
    assert.ok(trail, "there is a trail");
    assert.deepEqual(trail.itemListElement.map((crumb) => crumb.name), names);
    trail.itemListElement.forEach((crumb, index) => {
      assert.equal(crumb.position, index + 1);
      assert.ok(built.has(crumb.item.replace(site.origin, "")), `${crumb.item} is a page the build emits`);
    });
  }
});

test("the sitemap dates each page by its content, not by the build clock", async () => {
  // A date that moves on every deploy is not a signal. The stamp is committed and this is what
  // keeps it honest: change a question, and the build fails until the stamp is regenerated.
  const { contentHashes } = await import("../site/stamp.js");
  const stamp = JSON.parse(readFileSync("site/content-stamp.json", "utf8"));
  const hashes = contentHashes({ site: SITE });
  assert.deepEqual(
    Object.keys(stamp).sort(),
    Object.keys(hashes).sort(),
    "every public page is stamped; run `node scripts/stamp-content.mjs`"
  );
  for (const [path, hash] of Object.entries(hashes)) {
    assert.equal(stamp[path].hash, hash, `${path} changed; run \`node scripts/stamp-content.mjs\``);
    assert.match(stamp[path].date, /^\d{4}-\d{2}-\d{2}$/);
  }

  // And the dates reach the sitemap, on the root as well as the pages.
  const xml = sitemapXml(allPages({ site }), site);
  assert.match(xml, /<loc>https:\/\/ab\.example\/<\/loc><lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/);
  assert.equal((xml.match(/<lastmod>/g) || []).length, (xml.match(/<url>/g) || []).length, "every URL is dated");

  // The hash is of what a reader reads. Two runs of the same content agree, and a changed question
  // moves exactly one page — if the shell were in the digest, every page would move together.
  assert.deepEqual(contentHashes({ site: SITE }), hashes, "the same content hashes the same twice");
});

test("a wrong address lands on the site's own page, not the host's", async () => {
  const { renderNotFoundPage } = await import("../site/render.js");
  const { NOT_FOUND_COPY, footerLinks } = await import("../site/pages.js");
  const html = renderNotFoundPage(site);

  assert.ok(has(html, NOT_FOUND_COPY.title));
  // A missing page is not a page to send anyone to: no canonical, and it stays out of the index.
  assert.ok(has(html, '<meta name="robots" content="noindex">'));
  assert.equal(has(html, "rel=\"canonical\""), false);
  assert.equal(has(sitemapXml(allPages({ site }), site), "404"), false, "and out of the sitemap");
  assert.equal(footerLinks({ site }).some((link) => link.path.includes("404")), false);

  // The ways out, built from what the site actually publishes rather than typed in.
  assert.ok(has(html, 'href="/"'));
  for (const pack of indexModel({ site }).packs) {
    assert.ok(has(html, `href="${pack.path}"`), `${pack.slug} is offered`);
  }
  // Its assets are absolute, so it renders the same served from any depth.
  assert.equal(/(?:src|href)="(?!\/|https:|mailto:|#)/.test(html), false, "no relative asset paths");
});

test("structured data suggests answers and never accepts one", () => {
  const model = pageModel("marriage", 1, { site });
  const block = structuredData(model, site);
  // The block is more than one script now — the questions and the breadcrumb trail — so each is
  // parsed on its own rather than the whole string being treated as one document.
  const json = blocks(block).find((each) => each["@type"] === "ItemList");
  assert.ok(json, "the questions are still there");
  assert.equal(json.numberOfItems, 10);
  const first = json.itemListElement[0].item;
  assert.equal(first["@type"], "Question");
  assert.equal(first.suggestedAnswer.length, 4);
  // None of these has a right answer; marking one accepted would be a lie in the snippet.
  assert.equal(block.includes("acceptedAnswer"), false);

  // The wrapper's own closing tag is expected; one arriving from the data is not. A question title
  // carrying `</script>` must not end the block early.
  const hostile = {
    ...model,
    questions: [{ ...model.questions[0], title: "</script><script>alert(1)</script>" }]
  };
  const escaped = structuredData(hostile, site);
  assert.equal(escaped.match(/<\/script>/g).length, blocks(escaped).length, "only the wrappers close");
  assert.ok(escaped.includes("\\u003c/script>"), "the data's angle bracket is escaped instead");
});

test("the ad slot is present, positioned, and empty", () => {
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  assert.ok(has(html, 'data-ad-slot="after-questions"'));
  // Ads are step 7. A placeholder that already loads a network gets the site reviewed before it is
  // ready, so the slot holds space and nothing else.
  for (const network of ["adsbygoogle", "googlesyndication", "pagead"]) {
    assert.equal(has(html, network), false, `${network} must not be wired yet`);
  }
  const slotAt = html.indexOf('data-ad-slot');
  assert.ok(slotAt > html.indexOf('class="questions"'), "the slot sits after the questions");
  assert.ok(slotAt < html.indexOf('class="pager"'), "and before the control that leaves the page");
});

test("every page offers the invitation, and it goes to these questions rather than to an app", async () => {
  // There is no app. What a reader hands the other person is a link to the same questions, so the
  // control points at the pack — and with no script that address is the whole invitation anyway.
  //
  // On a question page that control is the dock's, not the block at the foot: the dock floats it
  // over every Part with the same binding, so the block was the same invitation twice. It is still
  // the block on the pages that have no dock.
  const { DOCK_COPY } = await import("../site/dock-copy.js");
  for (const page of [1, LAST_PAGE]) {
    const html = renderQuestionPage(pageModel("marriage", page, { site }), site);
    assert.ok(has(html, `data-invite>${DOCK_COPY.together}<`), "the dock carries it");
    assert.ok(has(html, 'class="dock-together" href="/marriage/"'), "and it points at the pack");
    // `data-invite>` and not `data-invite`: the latter also matches `data-invite-state`, the line
    // that reports the copy, which is not a second control.
    assert.equal((html.match(/data-invite>/g) || []).length, 1, "exactly one invitation on the page");
    assert.equal(has(html, "app.example"), false, "and never at an app origin");
  }

  for (const html of [renderIndex(indexModel({ site }), site), renderResultPage("marriage", published, site)]) {
    assert.ok(has(html, 'class="cta-action" href="/'), "the pages with no dock keep the block");
  }
});

test("turning a page is a real navigation, not a script", () => {
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  assert.ok(has(html, `<a class="pager-next" href="/marriage/2/" rel="next">`));
  const last = renderQuestionPage(pageModel("marriage", LAST_PAGE, { site }), site);
  assert.ok(has(last, 'class="pager-next is-result" href="/marriage/result/"'), "the end leads to the sheet");
  assert.equal(has(last, 'rel="next"'), false, "but it is not another page in the series");
  assert.ok(has(last, `class="pager-prev" href="/marriage/${LAST_PAGE - 1}/"`));
});

test("the index lists what is published and links to page one", () => {
  const html = renderIndex(indexModel({ site }), site);
  assert.ok(has(html, 'href="/marriage/"'));
  assert.ok(has(html, `${published.length}개의 질문 · ${LAST_PAGE}개 파트`));
  assert.ok(has(html, "100개의 질문 · 10개 파트"), "a hundred questions across ten Parts");
});

test("the sitemap lists every page, because nothing links to page seven from outside", () => {
  const xml = sitemapXml(allPages({ site }), site);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(has(xml, "http://www.sitemaps.org/schemas/sitemap/0.9"));
  assert.ok(has(xml, "<loc>https://ab.example/marriage/</loc>"));
  assert.ok(has(xml, "<loc>https://ab.example/marriage/2/</loc>"));

  // The home page. It was missing for a while: the build passed in the question pages and the
  // standing pages, and the root is in neither list, so the one page every other page links to was
  // the one the sitemap left out. It is emitted here, from nothing, so no caller can forget it.
  assert.ok(has(xml, "<loc>https://ab.example/</loc>"), "the root is listed");
  assert.ok(has(sitemapXml([], site), "<loc>https://ab.example/</loc>"), "even with no pages at all");
  assert.match(xml, /<urlset[^>]*>\n  <url><loc>https:\/\/ab\.example\/<\/loc>/, "and it is first");
  assert.ok(has(robotsTxt(site), "Sitemap: https://ab.example/sitemap.xml"));
  // The default SITE now carries the real origin, so the no-origin branch needs one made bare.
  const bare = siteWith({ origin: "" });
  assert.equal(has(robotsTxt(bare), "Sitemap:"), false, "no origin, no sitemap line pointing nowhere");
});

test("nothing rendered from content escapes into markup", () => {
  const hostile = {
    ...pageModel("marriage", 1, { site }),
    title: '"><script>x</script>',
    lead: '"><img onerror=1>'
  };
  const html = renderQuestionPage(hostile, site);
  assert.equal(has(html, "<script>x</script>"), false);
  assert.equal(has(html, "<img onerror"), false);
});

// ── Answering and the result sheet ────────────────────────────────────────────────────────────

test("answers are stored in a shape that refuses to be half-understood", async () => {
  const { ANSWERS_VERSION, emptyAnswers, parseAnswers, serializeAnswers, withAnswer } =
    await import("../site/answers.js");

  const built = withAnswer(emptyAnswers("marriage"), "home-01", "home-rest");
  assert.deepEqual(parseAnswers(serializeAnswers(built), "marriage"), built, "round trips");

  // Anything unparseable, wrong-version, or for another pack is absent rather than repaired.
  for (const bad of ["", "not json", "null", "[]", JSON.stringify({ version: 99, slug: "marriage", items: {} })]) {
    assert.deepEqual(parseAnswers(bad, "marriage"), emptyAnswers("marriage"), JSON.stringify(bad).slice(0, 24));
  }
  assert.deepEqual(
    parseAnswers(serializeAnswers(built), "dating"),
    emptyAnswers("dating"),
    "one pack's answers never leak into another's sheet"
  );

  // A stored item without a choice is dropped, not rendered as a blank answer.
  const partial = JSON.stringify({ version: ANSWERS_VERSION, slug: "marriage", items: { "home-01": {} } });
  assert.deepEqual(parseAnswers(partial, "marriage").items, {});

  // Answers written before `notDiscussed` was removed still load. The version was deliberately not
  // bumped for that deletion: a bump discards, and discarding a reader's ninety answers to drop a
  // field nothing reads is a worse trade than carrying an ignored key. The field does not survive
  // the read, but everything the reader actually chose and wrote does.
  const older = JSON.stringify({
    version: ANSWERS_VERSION,
    slug: "marriage",
    items: { "home-01": { choiceId: "home-rest", notDiscussed: true, reason: "우리 집은 조용한 편이에요" } }
  });
  const loaded = parseAnswers(older, "marriage").items["home-01"];
  assert.equal(loaded.choiceId, "home-rest", "the choice survives");
  assert.equal(loaded.reason, "우리 집은 조용한 편이에요", "and so does the note beside it");
  assert.equal("notDiscussed" in loaded, false, "the removed field is not carried forward");
});

test("a browser that cannot store anything still reads every question", async () => {
  const { createAnswerStore, emptyAnswers } = await import("../site/answers.js");
  const throwing = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); }
  };
  const store = createAnswerStore("marriage", throwing);
  assert.deepEqual(store.read(), emptyAnswers("marriage"), "a private window reads as no answers, not a crash");
  assert.equal(store.write(emptyAnswers("marriage")), false, "and a failed write says so");
  assert.equal(store.clear(), false);
});

test("the sheet reflects what was said and never scores it", async () => {
  const { emptyAnswers, withAnswer } = await import("../site/answers.js");
  const { RESULT_COPY, RESULT_FORBIDDEN, resultModel } = await import("../site/result.js");

  let answers = emptyAnswers("marriage");
  answers = withAnswer(answers, Q1.id, Q1.choices[0].id);
  answers = withAnswer(answers, Q2.id, Q2.choices[0].id);

  const model = resultModel("marriage", answers);
  assert.equal(model.total, published.length);
  assert.equal(model.answered, 2);
  assert.equal(model.complete, false);
  assert.equal(model.empty, false);

  // Grouped under the chapter, in pack order, with the person's own words given back.
  assert.deepEqual(model.chapters.map((c) => c.chapter), [Q1.chapter]);
  assert.equal(model.chapters[0].answers[0].choice, Q1.choices[0].label);

  // The pull toward a score is constant; this is what stops the computed sheet becoming a verdict.
  // The check is on the model, not the copy: the lead promises "점수도, 판정도 없습니다", and a naive
  // scan reads that disclaimer as the thing it disclaims.
  const serialized = JSON.stringify(model);
  for (const word of RESULT_FORBIDDEN) {
    assert.equal(serialized.includes(word), false, `the sheet must not compute ${word}`);
  }
  assert.ok(RESULT_COPY.lead.includes("점수"), "the copy says out loud that there is no score");
  assert.ok(RESULT_COPY.lead.includes("판정"));
  for (const key of ["score", "rating", "grade", "verdict", "percent"]) {
    assert.equal(Object.keys(model).includes(key), false, `no ${key} field`);
  }
});

test("an empty or unknown sheet is a definite state, not a broken page", async () => {
  const { emptyAnswers } = await import("../site/answers.js");
  const { resultModel } = await import("../site/result.js");
  const empty = resultModel("marriage", emptyAnswers("marriage"));
  assert.equal(empty.empty, true);
  assert.equal(empty.answered, 0);
  assert.deepEqual(empty.chapters, []);
  assert.equal(resultModel("dating", emptyAnswers("dating")), null, "an unpublished pack has no sheet");
});

test("a stored answer for a choice that no longer exists is dropped, not rendered blank", async () => {
  const { emptyAnswers, withAnswer } = await import("../site/answers.js");
  const { resultModel } = await import("../site/result.js");
  const stale = withAnswer(emptyAnswers("marriage"), Q1.id, "a-choice-that-was-removed");
  const model = resultModel("marriage", stale);
  assert.equal(model.answered, 0);
  assert.equal(model.empty, true);
});

test("the build and the browser share one reflection rather than two that drift", async () => {
  const { reflect, toQuestionIndex } = await import("../site/reflect.js");
  const { emptyAnswers, withAnswer } = await import("../site/answers.js");
  const { resultModel } = await import("../site/result.js");
  const answers = withAnswer(emptyAnswers("marriage"), Q1.id, Q1.choices[0].id);

  // `site/result.js` adapts registry questions into the index the page embeds, then calls the same
  // function the browser calls. A second implementation is exactly what this prevents.
  const direct = reflect(toQuestionIndex(published), answers);
  const viaModel = resultModel("marriage", answers);
  assert.equal(direct.answered, viaModel.answered);
  assert.deepEqual(direct.chapters.map((c) => c.chapter), viaModel.chapters.map((c) => c.chapter));

  assert.deepEqual(reflect([], answers).chapters, []);
  assert.equal(reflect([], answers).complete, false, "no questions is not a completed set");
});

test("the questions are answerable, and readable without answering", async () => {
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  assert.ok(has(html, `type="radio" name="q-${Q1.id}"`), "the choices are a real form control");
  // Enhancement, not requirement: every word is in the HTML whether or not the script runs.
  assert.ok(has(html, '<script type="module" src="/enhance.js"></script>'));
  for (const question of published.slice(0, 10)) {
    assert.ok(has(html, question.title), `${question.id} is in the markup`);
    for (const choice of question.choices) assert.ok(has(html, choice.label), choice.id);
  }
});

test("a site pack has no guidance copy, so the page omits those elements rather than emptying them", () => {
  // An empty <p class="q-intent"> is a gap the reader cannot account for, and an empty
  // "왜 중요한가요?" is worse: it promises an explanation and opens onto nothing.
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  for (const question of published.slice(0, 10)) {
    assert.equal(question.intent, undefined, `${question.id} carries no intent`);
    assert.equal(question.whyItMatters, undefined, `${question.id} carries no explanation`);
  }
  for (const marker of ['class="q-intent"', 'class="q-example"', 'class="q-why"', SITE_COPY.whyLabel]) {
    assert.equal(has(html, marker), false, `${marker} is absent, not empty`);
  }
  assert.ok(has(html, 'class="q-choices"'), "what the reader came for is still there");
});

test("the last page's forward control offers the sheet instead of a page that is not there", () => {
  const last = renderQuestionPage(pageModel("marriage", LAST_PAGE, { site }), site);
  assert.ok(has(last, 'class="pager-next is-result" href="/marriage/result/"'));

  // This used to assert that Part 1 did not link to the sheet at all — "only at the end" — which
  // was true and was the bug: the sheet had one door, and it was behind the other ninety questions.
  // Every Part now offers it, from the middle slot, and never twice on one page.
  const first = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  assert.ok(has(first, 'class="pager-mid" href="/marriage/result/"'), "and so does every other Part");
  assert.equal(has(first, "is-result"), false, "but it is not the forward control until the end");
});

test("the sheet is a shell, is not indexed, and offers the way out", async () => {
  const { renderResultPage } = await import("../site/render.js");
  const { RESULT_COPY } = await import("../site/result.js");
  const html = renderResultPage("marriage", questionsFor("marriage"), site);

  assert.ok(has(html, '<meta name="robots" content="noindex">'), "a personal sheet is not for search");
  assert.ok(has(html, RESULT_COPY.emptyTitle), "with no script it says there is nothing, and why");
  assert.ok(has(html, RESULT_COPY.clearNote), "and that the answers are only in this browser");
  assert.ok(has(html, "data-result-clear"), "the visible way to leave without a trace");

  // The index the browser reflects over, embedded rather than fetched: no request, no server.
  assert.ok(has(html, 'type="application/json" data-question-index'));
  assert.equal(has(html, "fetch("), false, "the sheet asks nobody for anything");
});

test("nothing on the sheet can break out of the embedded JSON", async () => {
  const { renderResultPage } = await import("../site/render.js");
  const hostile = questionsFor("marriage").map((question, index) =>
    index === 0 ? { ...question, title: "</script><script>alert(1)</script>" } : question);
  const html = renderResultPage("marriage", hostile, site);
  const closers = html.match(/<\/script>/g) || [];
  assert.equal(closers.length, 2, "one for the JSON block, one for the module tag — none from data");
});

test("the build carries the custom domain and keeps Jekyll out of it", async () => {
  const { pagesFiles } = await import("../site/seo.js");
  // Asserted from the function, not from `site/dist/`: CI runs the tests before the build and the
  // output is gitignored, so reading the directory tests the last build rather than the code.
  const files = pagesFiles(SITE);
  assert.equal(files.CNAME.trim(), SITE.customDomain, "Pages drops the domain without this file");
  assert.equal(SITE.customDomain, "lovemedialogue.com");
  assert.equal(Object.hasOwn(files, ".nojekyll"), true, "or Pages runs Jekyll over the output");

  // No custom domain, no CNAME — an empty one would blank the domain rather than leave it alone.
  const bare = siteWith({ customDomain: "" });
  assert.equal(Object.hasOwn(pagesFiles(bare), "CNAME"), false);
});

test("the site's own origin is https, so the canonical is not split across two schemes", () => {
  assert.match(SITE.origin, /^https:\/\//);
  assert.equal(SITE.origin, `https://${SITE.customDomain}`, "the origin and the CNAME name one site");

  // An http canonical would also hand every page to search engines as an insecure URL.
  const html = renderQuestionPage(pageModel("marriage", 1, { site: SITE }), SITE);
  assert.ok(has(html, 'rel="canonical" href="https://lovemedialogue.com/marriage/"'));
  assert.equal(has(html, 'href="http://lovemedialogue.com'), false);
});

test("only the site is deployed to Pages, never the app", async () => {
  const { readFile } = await import("node:fs/promises");
  const workflow = await readFile(".github/workflows/deploy-site.yml", "utf8");
  assert.ok(workflow.includes("path: site/dist"), "the artifact is the site");
  // The app needs a Node process for its API and holds private notes; it is not a static bundle.
  assert.equal(/path:\s*dist\b/.test(workflow), false, "the app's dist must not be published");
  assert.ok(workflow.includes("npm test"), "a broken generator fails before it publishes");
});

test("the rail carries the mark on every kind of page, and no nav while there is one pack", () => {
  // Checked on all three page kinds because the shell is where that usually rots.
  const pages = [
    renderQuestionPage(pageModel("marriage", 1, { site }), site),
    renderIndex(indexModel({ site }), site),
    renderResultPage("marriage", published, site)
  ];
  for (const html of pages) {
    assert.ok(has(html, 'class="rail"'), "the rail is on the page");
    assert.ok(has(html, site.name), "and carries the wordmark, which is the site's name");
    assert.ok(has(html, 'src="/brand/logo.png"'), "and the mark");
  }

  // With one pack published the nav would name the page the reader is already on, under a heading
  // for a category with one member. So the rail carries the mark alone; the nav returns at two.
  assert.equal(indexModel({ site }).packs.length, 1, "one pack today");
  for (const html of pages) {
    assert.equal(has(html, "rail-nav"), false, "no nav for a list of one");
    assert.equal(has(html, "rail-item"), false);
    // On the markup, not the word: "질문집" is also the label on the first page's back link.
    assert.equal(has(html, "rail-label"), false, "and no heading for it either");
  }
});

test("the Part tabs are links to real pages, one per Part, with exactly one marked current", () => {
  for (const part of PARTS) {
    const html = renderQuestionPage(pageModel("marriage", part.number, { site }), site);
    const tabs = html.match(/<a class="part-tab[^"]*" href="[^"]+"/g) || [];
    assert.equal(tabs.length, PARTS.length, `Part ${part.number} shows every tab`);
    assert.equal((html.match(/aria-current="page"/g) || []).length, 1, "one current tab");
    assert.ok(has(html, `class="part-tab is-current" href="${pagePath("marriage", part.number)}"`));
    // A tab is a link to a document, which is what lets it be opened in a new tab, shared, or read
    // with scripting off. A tab that only showed and hid things would fail all three.
    for (const other of PARTS) {
      assert.ok(has(html, `href="${pagePath("marriage", other.number)}"`), `${other.title} is linked`);
    }
    assert.ok(has(html, part.title), "the page names the Part it is");
    for (const question of part.questions) assert.ok(has(html, question.title), question.id);
    // and nothing from a Part it is not
    const elsewhere = PARTS.find((each) => each.number !== part.number);
    assert.equal(has(html, elsewhere.questions[0].title), false, "questions from other Parts stay there");
  }
});

test("the forward control names where it goes, and the last Part offers the sheet instead", () => {
  const middle = renderQuestionPage(pageModel("marriage", 2, { site }), site);
  assert.ok(has(middle, `class="pager-next" href="${pagePath("marriage", 3)}" rel="next"`));
  assert.ok(has(middle, PARTS[2].title), "the next Part is named, not just counted");

  const last = renderQuestionPage(pageModel("marriage", LAST_PAGE, { site }), site);
  assert.ok(has(last, SITE_COPY.resultAction));
  assert.equal(has(last, 'rel="next"'), false);
});

test("the header is the shell's, and a pack renderer emits only the pack's content", () => {
  // The pack's name and its tab strip are the same on all ten Parts; only the current marker moves.
  // Keeping them in the shell is what lets `renderQuestionPage` be about one Part's questions.
  const html = renderQuestionPage(pageModel("marriage", 4, { site }), site);
  const stage = html.slice(html.indexOf('<div class="stage">'), html.indexOf("<main"));
  assert.ok(stage.includes('<header class="stage-head">'), "the header is above the reading column");
  assert.ok(stage.includes('class="parts"'), "and so is the tab strip");

  // Nothing of the chrome leaks back into the body.
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  assert.equal(main.includes("stage-head"), false);
  assert.equal(main.includes('class="parts"'), false);
  assert.equal(main.includes("<h1"), false, "the pack is named once, by the shell");

  // Every page kind uses the same header — that is what makes it a widget rather than a section of
  // the pack template — and only a paginated one gets a tab strip under it.
  const index = renderIndex(indexModel({ site }), site);
  assert.ok(index.includes("stage-head"), "the index uses the header too");
  assert.equal(index.includes('class="parts"'), false, "and gets no strip, having no Parts");
  assert.equal(index.includes('class="tabbar"'), false);
});

test("every page kind names itself in the one header, and nowhere else", async () => {
  const { standingPages } = await import("../site/pages.js");
  const { RESULT_COPY } = await import("../site/result-copy.js");
  const about = standingPages({ site })[0];

  const pages = [
    [renderQuestionPage(pageModel("marriage", 1, { site }), site), PUBLISHED[0].title],
    [renderIndex(indexModel({ site }), site), site.name],
    [renderStandingPage(about, site), about.title],
    [renderResultPage("marriage", published, site), RESULT_COPY.title]
  ];
  for (const [html, title] of pages) {
    const head = html.slice(html.indexOf('<header class="stage-head">'), html.indexOf("</header>"));
    assert.ok(head.includes(`<h1>${title}</h1>`), `${title} is named by the header`);
    // Exactly one h1, and it is the header's. A page that also titled itself inside <main> would
    // be two titles agreeing by hand.
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${title} has one h1`);
    const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
    assert.equal(main.includes("<h1"), false);
  }
});

test("every tab label is the pack's own section title, never a string from the renderer", () => {
  // The strip is generated from the pack: `partsOf` carries `section.title` through untouched, so
  // renaming a section in the pack renames its tab by rebuilding, with nothing here to update.
  const pack = findPack(PUBLISHED[0].packId);
  const titles = pack.sections.map((section) => section.title);
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);

  for (const title of titles) {
    assert.ok(has(html, `<span class="part-tab-title">${title}</span>`), `${title} is a tab`);
  }
  const rendered = [...html.matchAll(/<span class="part-tab-title">([^<]*)<\/span>/g)].map(([, x]) => x);
  assert.deepEqual(rendered, titles, "in the pack's order, and nothing else");

  // The only thing the renderer contributes is the position, and even that is the pack's order.
  const ordinals = [...html.matchAll(/<span class="part-tab-n">([^<]*)<\/span>/g)].map(([, x]) => x);
  assert.deepEqual(ordinals, titles.map((_, i) => String(i + 1)));
});

test("the bar is a sibling of the header, which is what lets it stay", () => {
  // A sticky element can only stay while its own parent is on screen. Nested in the header it
  // would leave with the title after one screenful, so the bar sits directly in the stage.
  const html = renderQuestionPage(pageModel("marriage", 4, { site }), site);
  const headerEnd = html.indexOf("</header>");
  const barStart = html.indexOf('<div class="tabbar">');
  assert.ok(headerEnd > 0 && barStart > headerEnd, "the bar comes after the header, not inside it");
  const header = html.slice(html.indexOf('<header class="stage-head">'), headerEnd);
  assert.equal(header.includes('class="parts"'), false);

  // Tabs and progress are one unit, so the bar cannot catch up with itself as the page moves.
  const bar = html.slice(barStart, html.indexOf("</div>", html.indexOf('class="progress"')));
  assert.ok(bar.includes('<nav class="parts"'));
  assert.ok(bar.includes('class="progress"'));

  const css = readFileSync("site/site.css", "utf8");
  const sticky = css.slice(css.indexOf(".tabbar {"), css.indexOf("}", css.indexOf(".tabbar {")));
  assert.match(sticky, /position: sticky/);
  assert.match(sticky, /top: 0/);
  // Opaque and layered, because it now passes over cards rather than sitting above them.
  assert.match(sticky, /background: var\(--ab-paper\)/);
  assert.match(sticky, /z-index/);
  // And an in-page link must not land a question underneath it.
  assert.match(css, /scroll-padding-top/);
});

test("the sheet is reachable from every Part, by exactly one control", () => {
  // The gap this bar closes: the sheet used to be linked from Part 10's forward control and nowhere
  // else, so a reader who had answered thirty questions and wanted to see them had to walk to the
  // end of the pack to find the only door.
  for (const part of PARTS) {
    const html = renderQuestionPage(pageModel("marriage", part.number, { site }), site);
    const nav = html.slice(html.indexOf('<nav class="pager"'), html.indexOf("</nav>", html.indexOf('<nav class="pager"')));
    const routes = nav.split('href="/marriage/result/"').length - 1;
    assert.equal(routes, 1, `Part ${part.number} offers the sheet once, not ${routes} times`);
  }
});

test("the middle slot offers the sheet only where the forward control does not", () => {
  // One rule, not two special cases: on the last Part the forward control *is* the sheet, so the
  // middle goes back to saying where the reader is rather than repeating the destination beside it.
  const middle = renderQuestionPage(pageModel("marriage", 2, { site }), site);
  assert.ok(has(middle, 'class="pager-mid" href="/marriage/result/"'));
  assert.equal(has(middle, "pager-progress"), false, "the tab strip already says which Part this is");

  const last = renderQuestionPage(pageModel("marriage", LAST_PAGE, { site }), site);
  assert.equal(has(last, "pager-mid"), false, "the forward control is the sheet here");
  assert.ok(has(last, `<span class="pager-progress">${SITE_COPY.progress(LAST_PAGE, LAST_PAGE)}</span>`));
});

test("the sheet has a way back to the questions", () => {
  // Its invitation points at the pack, but `enhance.js` turns that control into a share sheet — so
  // with scripting on the sheet was a room with no door back.
  const html = renderResultPage("marriage", published, site);
  const nav = html.slice(html.indexOf('<nav class="pager is-sheet"'), html.indexOf("</nav>", html.indexOf('<nav class="pager is-sheet"')));
  assert.ok(nav.includes('href="/marriage/"'), "back to the questions");
  assert.ok(nav.includes('href="/"'), "and out to the index");
  assert.ok(nav.includes('aria-current="page"'), "the slot for this page names it rather than linking to it");
  assert.equal(nav.includes('href="/marriage/result/"'), false, "a bar does not link to the page it is on");
});

test("the bottom bar is pinned on a phone, in the page on a desktop, and reserves its own room", () => {
  const css = readFileSync("site/site.css", "utf8");
  const flow = css.slice(css.indexOf(".pager {"), css.indexOf("}", css.indexOf(".pager {")));
  assert.equal(/position:/.test(flow), false, "the wide layout leaves it where it is written");

  const narrow = css.slice(css.indexOf("@media (max-width: 899px)", css.indexOf(".pager-mid")));
  const block = narrow.slice(0, narrow.indexOf("\n}\n"));
  assert.match(block, /position: fixed/);
  assert.match(block, /bottom: 0/);
  assert.match(block, /z-index/);
  assert.match(block, /env\(safe-area-inset-bottom/, "it clears the home indicator rather than hiding behind it");
  // `100vw` includes the scrollbar and would take the document sideways with it — measured 0 at
  // 360, 390 and 430px with left/right instead.
  assert.equal(/\.pager \{[^}]*100vw/s.test(block), false, "width comes from left/right, not 100vw");

  // A fixed bar covers the end of the page, so the page ends above it — but only where there is a
  // bar, or the index and the standing pages would end in 80px of nothing.
  // The pager's height is written once as `--bar-h` and read by both reservations and by the dock's
  // offset. It was a literal in all three, and making the keys chunkier moved it from 67 to 73 —
  // the dock, still offset by 67, sat on top of the bar.
  assert.match(block, /--bar-h: \d+px/, "the height is named once");
  assert.match(block, /\.shell\.has-bar \{ padding-bottom: calc\(var\(--bar-h\)/);
  assert.match(block, /\.shell\.has-dock \{ padding-bottom: calc\(var\(--bar-h\)/);
  assert.match(block, /bottom: calc\(var\(--bar-h\)/, "and the dock sits on top of it");

  // The name of the next Part must be able to shrink, or it leaves the bar entirely: measured, a
  // 260px name sat in a 106px slot and painted outside it. Both halves of the fix are load-bearing.
  assert.match(block, /\.pager \.pager-next \{[^}]*align-items: stretch/s, "a column's cross axis is its width");
  assert.match(block, /\.pager \.pager-next-part \{[^}]*text-overflow: ellipsis/s);
  // Written with two classes on purpose: `.pager a` is a class plus a type and outranks a bare one.
  assert.equal(/^\s*\.pager-next \{/m.test(block), false, "a bare class loses to .pager a");
});

test("each page reserves room for the furniture it actually carries, and no more", () => {
  // Two classes rather than one flag: a question page floats the dock above the pinned pager and
  // needs room for both, the sheet has only the pager, and the rest have neither. One shared class
  // would have made the sheet end in a band of nothing the height of a widget it does not have.
  const question = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  assert.ok(has(question, '<div class="shell has-dock">'));

  const sheet = renderResultPage("marriage", published, site);
  assert.ok(has(sheet, '<div class="shell has-bar">'));
  assert.equal(has(sheet, "has-dock"), false, "the sheet has no questions left to answer");
  assert.equal(has(sheet, 'class="dock"'), false);

  for (const html of [renderIndex(indexModel({ site }), site)]) {
    assert.ok(has(html, '<div class="shell">'), "and the rest say plain shell");
    assert.equal(has(html, "has-bar"), false);
    assert.equal(has(html, "has-dock"), false);
  }

  // The two must not both apply: they carry different numbers at the same specificity, so a page
  // holding both would get whichever the stylesheet happens to write last.
  assert.equal(has(question, "has-bar"), false, "a page is one or the other, never both");
});

test("the dock carries the count, the invitation and the save, and is the only progress on the page", async () => {
  const { DOCK_COPY } = await import("../site/dock-copy.js");
  const model = pageModel("marriage", 3, { site });
  const html = renderQuestionPage(model, site);
  const dock = html.slice(html.indexOf('<aside class="dock"'), html.indexOf("</aside>", html.indexOf('<aside class="dock"')));

  // The number the owner asked for. It counts the whole pack, not the Part: the same figure on all
  // ten pages, which is why it is measured against `total` rather than the ten questions in view.
  assert.ok(dock.includes(`<b data-progress-count>0</b> / ${model.total}`), "0 until the script reads storage");
  assert.ok(dock.includes(`aria-valuemax="${model.total}"`));
  assert.equal(model.total, published.length);

  assert.ok(dock.includes(`data-invite>${DOCK_COPY.together}<`), "함께 풀기 is the invitation");
  // Save first, invite second, at the owner's word. It also puts the filled key on the right in
  // both rows — 함께 풀기 over 다음 — so the two read as one column rather than two arrangements.
  assert.ok(dock.indexOf("data-save") < dock.indexOf("data-invite"), "임시 저장 comes before 함께 풀기");
  assert.ok(dock.includes(`href="/marriage/"`), "which points at the pack and carries no answers");
  assert.ok(dock.includes(`data-save`) && dock.includes(DOCK_COPY.save));
  // A control that claims to save should say what already saves.
  assert.ok(dock.includes(DOCK_COPY.saveAuto), "the button says answers are saved as they are made");

  // Exactly one progress indicator. It used to live in the tab strip with no number; with the
  // number now spelled out below, two would be two different-looking answers to one question.
  assert.equal(html.split('class="progress"').length - 1, 1, "one progress bar, not two");
  const bar = html.slice(html.indexOf('<div class="tabbar">'), html.indexOf("</div>", html.indexOf('<div class="tabbar">')));
  assert.equal(bar.includes("progress"), false, "and it is not the strip's any more");
});

test("the dock's words load without the pack registry behind them", async () => {
  // Third module of its kind, for the reason the other two exist: `enhance.js` runs in a browser and
  // must not import `render.js`, which pulls the whole registry in behind it.
  const source = readFileSync("site/dock-copy.js", "utf8");
  assert.equal(/^\s*import /m.test(source), false, "dock-copy.js imports nothing");
  const enhance = readFileSync("site/enhance.js", "utf8");
  assert.match(enhance, /from "\.\/dock-copy\.js"/);
  assert.equal(enhance.includes('from "./render.js"'), false);

  // And the build has to ship it, or the page loads a module that is not there.
  const build = readFileSync("scripts/build-site.mjs", "utf8");
  assert.match(build, /"dock-copy\.js"/);
});

test("이어서 points at the last question answered, and says nothing when there is none", async () => {
  const { SITE_COPY: copy } = await import("../site/render.js");
  const model = pageModel("marriage", 4, { site });
  const html = renderQuestionPage(model, site);

  // Rendered on every Part, in the row, with the pack's own address as the fallback a reader
  // without scripting gets — "carry on" where nothing is recorded is "start".
  assert.ok(has(html, `class="pager-resume" href="/marriage/" data-resume>${copy.navResume}<`));

  // It needs the pack's shape, because a Part page knows its own ten questions and nothing about
  // the other ninety, and answers are a map with no order and no page in them.
  const index = JSON.parse(html.match(/data-pack-index>(.*?)<\/script>/s)[1]);
  assert.equal(index.slug, "marriage");
  assert.equal(index.ids.length, published.length);
  assert.equal(index.parts.length, index.ids.length);
  assert.deepEqual(index.ids.slice(0, 3), published.slice(0, 3).map((q) => q.id), "in reading order");
  assert.equal(index.parts[0], 1);
  assert.equal(index.parts[index.parts.length - 1], LAST_PAGE, "and the last question is on the last Part");
  // Ids and Part numbers only: the sheet embeds titles because it prints them back, this does not.
  assert.equal(Object.keys(index).sort().join(","), "ids,parts,slug");
  assert.equal(html.match(/data-pack-index>(.*?)<\/script>/s)[1].includes(published[0].title), false);

  // The script resolves it against the draft, so an answer made a moment ago counts, and "last"
  // means last in reading order rather than most recently touched.
  const enhance = readFileSync("site/enhance.js", "utf8");
  const resume = enhance.slice(enhance.indexOf("function bindResume"), enhance.indexOf("function bindSaveOnNavigation"));
  assert.match(resume, /for \(let i = index\.ids\.length - 1; i >= 0; i -= 1\)/, "walks back from the end");
  assert.match(resume, /draft\.read\(\)/, "reads the draft, not the store");
  assert.match(resume, /aria-disabled/, "and goes quiet with nothing to carry on from");
  assert.match(resume, /#q-\$\{index\.ids\[at\]\}/, "linking to the question's own anchor");

  // A disabled key must not be treated as a navigation by the save-on-leave handler.
  assert.match(enhance, /aria-disabled"\) === "true"\) return/);
});

test("함께 풀기 opens the site's own panel, and every way out of it is an address", async () => {
  const { INVITE_COPY } = await import("../site/invite-copy.js");
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  const panel = html.slice(html.indexOf("<dialog class=\"invite\""), html.indexOf("</dialog>"));

  // A dialog, so `showModal` brings the focus trap, Escape and the backdrop rather than this file.
  assert.ok(html.includes("<dialog class=\"invite\" data-invite-panel"));
  assert.ok(panel.includes(INVITE_COPY.title) && panel.includes(INVITE_COPY.lead));
  for (const way of ["device", "copy", "sms", "mail"]) {
    assert.ok(panel.includes(`data-invite-way="${way}"`), `the panel offers ${way}`);
  }
  // The address is on the screen whatever the clipboard does, and the panel says what is in it.
  assert.ok(panel.includes("data-invite-url"));
  assert.ok(panel.includes(INVITE_COPY.note) && INVITE_COPY.note.includes("답이 담기지"));

  // Pinterest's panel lists friends and searches people. There are no accounts here, so there is
  // nobody to list — and no SDK, so no channel that needs one appears.
  for (const forbidden of ["kakao", "sdk", "친구", "검색"]) {
    assert.equal(panel.toLowerCase().includes(forbidden.toLowerCase()), false, `${forbidden} has no place here`);
  }
  assert.equal(/<script/.test(panel), false, "and the panel loads nothing");

  // It ships where the script does, and not where it would be dead markup.
  assert.equal(renderIndex(indexModel({ site }), site).includes("data-invite-panel"), false);
  assert.ok(renderResultPage("marriage", published, site).includes("data-invite-panel"));

  const enhance = readFileSync("site/enhance.js", "utf8");
  const bind = enhance.slice(enhance.indexOf("function bindInvite"), enhance.indexOf("\n}", enhance.indexOf("function bindInvite")));
  // The device's sheet is offered only where it exists: on a phone it is where KakaoTalk lives, and
  // on a desktop it would be a button that does nothing.
  assert.match(bind, /toggleAttribute\("hidden", !navigator\.share\)/);
  assert.match(bind, /panel\.showModal\(\)/);
  assert.match(bind, /sms:\?&body=/);
  assert.match(bind, /mailto:\?subject=/);
  // A refused clipboard is reported, not reported as a success.
  assert.match(bind, /INVITE_COPY\.copyFailed/);
  // Closing: the button, and a click that lands on the dialog itself rather than on its contents.
  assert.match(bind, /event\.target === panel\) panel\.close\(\)/);
});

test("nothing overrides the pager's shared key style from behind it", () => {
  // Third time this file has been bitten by the same rule, and the last one shipped a blank key:
  // `.pager a` is a class plus a type selector, so a bare `.pager-next` loses every property they
  // share. It lost `background`, and a dark key with light text became light-on-light — invisible.
  const css = readFileSync("site/site.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  // Derived from the rule itself rather than listed by hand: a hand-written list was wrong twice
  // over — it named `color`, which `.pager a` does not set, and would have missed anything added to
  // that rule later, which is exactly how this bug arrives.
  const base = css.match(/\.pager a \{([^}]*)\}/);
  assert.ok(base, ".pager a is the shared key style");
  const shared = new Set([...base[1].matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]));

  for (const match of css.matchAll(/(^|\n)([^\n{}]+)\{([^}]*)\}/g)) {
    const selector = match[2].trim();
    // Only the classes that land on an `<a>` inside `.pager` can collide with `.pager a`.
    // `.pager-progress` is a span and `.pager-next-part` sits inside the anchor; neither is
    // reached by that selector, so neither is at risk.
    // `(?![\w-])` rather than `\b`: a word boundary matches at the hyphen, so `\b` caught
    // `.pager-next-part` — a span inside the anchor, which `.pager a` never reaches.
    if (!/(^|,|\s)\.pager-(prev|mid|next)(?![\w-])/.test(selector)) continue;
    // A selector that names the parent, or pairs two classes, already outranks `.pager a`.
    const scoped = selector.split(",").every((one) => /\.pager[\s.]/.test(one.trim()));
    if (scoped) continue;
    const properties = [...match[3].matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
    const clashes = properties.filter((name) => shared.has(name));
    assert.deepEqual(clashes, [], `"${selector}" sets ${clashes.join(", ")} and will lose to .pager a`);
  }

  // And the key that carries the loss most visibly is written the safe way.
  assert.match(css, /\.pager \.pager-next \{[^}]*background: var\(--ab-ink\)/s);
});

test("the home page shows what can be read now, and what is coming as a picture only", async () => {
  const { COMING, SCENES } = await import("../site/config.js");
  const html = renderIndex(indexModel({ site }), site);

  // The published pack keeps everything it had, with its scene above it. The picture is alt="" on
  // purpose: the heading beside it already names the pack, and a screen reader should not say the
  // same thing twice.
  const published = html.slice(html.indexOf('<li class="card">'), html.indexOf('<li class="card is-coming">'));
  assert.ok(published.includes(SCENES.marriage.src));
  assert.ok(published.includes('alt=""'));
  assert.ok(published.includes('href="/marriage/"') && published.includes("100개의 질문"));

  // A coming pack is a picture and nothing else: no heading, no count, and — the whole point —
  // nothing to press. A card with a link would be a promise with a date on it, and there is no date.
  // Not a fixed count — holders come and go as artwork arrives. What has to hold is that each one
  // is a picture and a label and nothing else, and that they name a scene the build actually ships.
  assert.ok(COMING.length > 0);
  for (const entry of COMING) {
    assert.ok(Object.values(SCENES).includes(entry.scene), `${entry.id} uses a declared scene`);
    const start = html.indexOf(`<li class="card is-coming">`, html.indexOf(entry.scene.src) - 200);
    const card = html.slice(start, html.indexOf("</li>", start));
    assert.ok(card.includes(entry.scene.src), `${entry.id} shows its scene`);
    assert.ok(card.includes(`alt="${entry.alt}"`), "and describes it for a reader who cannot see it");
    for (const interactive of ["<a ", "<button", "href=", "data-"]) {
      assert.equal(card.includes(interactive), false, `${entry.id} must not be a control: ${interactive}`);
    }
    assert.equal(/<h[1-6]/.test(card), false, "no heading");
    // The card was the picture and nothing else; the owner added one line to it. That line is all
    // it says — no name, no count, no date — so strip the tags and exactly the label is left.
    assert.equal(card.replace(/<[^>]*>/g, "").trim(), SITE_COPY.comingLabel, "one line, and only that");
  }

  // The names of the packs that are coming must not leak into the page anywhere else either —
  // the design withholds them on purpose.
  assert.equal(html.includes("임신 100제") || html.includes("육아 100제"), false);
});

test("the whole published card is the control, without swallowing the link's name", () => {
  const html = renderIndex(indexModel({ site }), site);
  const card = html.slice(html.indexOf('<li class="card">'), html.indexOf("</li>"));

  // The anchor stays on the heading. Wrapping one around the card would look identical and read
  // very differently: an anchor takes its accessible name from everything inside it, so a screen
  // reader would announce the title, the whole description and the question count as one link.
  assert.match(card, /<h2><a href="\/marriage\/">결혼 100제<\/a><\/h2>/);
  assert.equal(/<li class="card">\s*<a /.test(card), false, "the card is not wrapped in a link");
  assert.equal((card.match(/<a /g) || []).length, 1, "one link on the card, not one per element");

  // The hit area is a stretched pseudo-element on that link, over a positioned card.
  const css = readFileSync("site/site.css", "utf8");
  assert.match(css, /\.card \{[^}]*position: relative/s);
  assert.match(css, /\.card h2 a::after \{[^}]*position: absolute[^}]*inset: 0/s);
  assert.match(css, /\.card:has\(h2 a\) \{ cursor: pointer/);
  assert.match(css, /\.card:has\(h2 a\):active \{[^}]*var\(--press\)/s, "and it presses like the other controls");
  // The ring belongs to the card, since the card is what activates.
  assert.match(css, /\.card:has\(h2 a:focus-visible\) \{[^}]*outline:/s);
});

test("a coming card stays inert even now the published one is a button", () => {
  const html = renderIndex(indexModel({ site }), site);
  for (const start of [...html.matchAll(/<li class="card is-coming">/g)].map((m) => m.index)) {
    const card = html.slice(start, html.indexOf("</li>", start));
    // No link means the stretched-hit-area rules never reach it — they are all scoped to `h2 a`.
    assert.equal(/<a |<button/.test(card), false, "nothing to press");
  }
  const css = readFileSync("site/site.css", "utf8");
  const coming = css.slice(css.indexOf(".card.is-coming {"), css.indexOf("}", css.indexOf(".card.is-coming {")));
  assert.match(coming, /cursor: default/, "and it does not pretend otherwise");
  assert.match(coming, /box-shadow: none/, "nor sit raised like something pressable");
});

/** A JPEG's own idea of its size, from the frame header. Twelve lines against a dependency. */
function jpegSize(file) {
  const buf = readFileSync(file);
  let at = 2; // past SOI
  while (at < buf.length) {
    if (buf[at] !== 0xff) throw new Error(`${file}: not a JPEG segment at ${at}`);
    const marker = buf[at + 1];
    const length = buf.readUInt16BE(at + 2);
    // SOF0..SOF15, minus the four that are not frame headers (DHT, JPG, DAC, RST).
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(at + 5), width: buf.readUInt16BE(at + 7) };
    }
    at += 2 + length;
  }
  throw new Error(`${file}: no frame header`);
}

test("every scene the site names is a file the build ships, at the size the card declares", async () => {
  const { SCENES } = await import("../site/config.js");
  for (const [name, art] of Object.entries(SCENES)) {
    const file = `site${art.src}`;
    assert.ok(existsSync(file), `${name}: ${file} is generated and committed`);
    // Big enough to be a picture, small enough not to be the uncropped sheet.
    const bytes = statSync(file).size;
    assert.ok(bytes > 4000 && bytes < 120_000, `${name} is ${bytes} bytes`);
    // The numbers on the `<img>` are what the browser reserves room with, so a re-crop that
    // changed the picture's shape and left them behind would shift the row as the page loads.
    assert.deepEqual(jpegSize(file), { width: art.width, height: art.height },
      `${name}: re-run \`python3 scripts/build-brand-assets.py\` and update SCENES`);
  }
  // Every scene is cut to one height, which is what makes crops of different widths read as a set.
  assert.equal(new Set(Object.values(SCENES).map((art) => art.height)).size, 1);

  // And the generator that made them keeps the sources it cut them from.
  const build = readFileSync("scripts/build-brand-assets.py", "utf8");
  for (const sheet of build.matchAll(/^ {4}"(pack-scenes[\w-]*\.jpg)": \{$/gm)) {
    assert.ok(existsSync(`brand/${sheet[1]}`), `${sheet[1]} stays in the repo`);
  }
  assert.ok(existsSync("brand/pack-scenes.jpg"), "the first scene sheet stays in the repo");
  for (const name of Object.keys(SCENES)) {
    assert.match(build, new RegExp(`"${name}": \\(`), `${name} has measured crop bounds`);
  }
});

test("nothing is written to storage until the reader asks for it", async () => {
  // The behaviour is in the DOM layer, so this holds the shape of it at the source rather than
  // leaving a rule this consequential to a browser check nobody re-runs. Answering used to save as
  // it happened; the owner's rule is that saving is an act the reader takes.
  const enhance = readFileSync("site/enhance.js", "utf8");
  const handlers = enhance.slice(enhance.indexOf("function bindQuestionPage"), enhance.indexOf("function bindSaveOnNavigation"));
  assert.ok(handlers.includes('addEventListener("input"'), "the draft still follows every keystroke");
  assert.ok(handlers.includes('addEventListener("change"'));
  assert.equal(/store\.write|\.commit\(\)/.test(handlers), false, "but neither handler touches storage");
  assert.ok(handlers.includes("draft.set("), "they update the draft instead");

  // Typing does not commit; pressing something does. The button, and any control that leaves this
  // page for another page of the site — ten Parts are ten documents, so turning one used to lose
  // whatever was unsaved. That is not the automatic saving that was removed: it runs because a
  // person pressed something, and the thing they pressed says on its face what it does.
  assert.match(enhance, /function bindSave[\s\S]*?draft\.commit\(\)/);
  const onNav = enhance.slice(enhance.indexOf("function bindSaveOnNavigation"), enhance.indexOf("function bindLeaveWarning"));
  assert.match(onNav, /addEventListener\("click"/);
  assert.match(onNav, /draft\.commit\(\)/);
  // Not the share control, not another site, not a jump inside this page: none of those lose work.
  assert.match(onNav, /data-invite/);
  assert.match(onNav, /url\.origin !== location\.origin/);
  assert.match(onNav, /url\.pathname === location\.pathname/);
  assert.match(enhance, /bindSaveOnNavigation\(draft\)/);

  assert.match(enhance, /addEventListener\("beforeunload"[\s\S]*?preventDefault\(\)/);
  assert.match(enhance, /bindLeaveWarning\(draft\)/);

  // The draft is seeded from what was saved, so a reload brings back exactly that and nothing else.
  assert.match(enhance, /function createDraft[\s\S]*?store\.read\(\)/);

  // And the button must not claim the old behaviour.
  const { DOCK_COPY } = await import("../site/dock-copy.js");
  assert.equal(DOCK_COPY.saveAuto.includes("자동"), false, "it no longer says answers save automatically");
  assert.ok(DOCK_COPY.unsaved.includes("사라"), "and something says unsaved answers can be lost");
  // A page turn saves now, so the warning must not still claim it loses answers.
  assert.equal(DOCK_COPY.unsaved.includes("페이지를 옮기면"), false, "moving pages no longer loses work");

  // The forward key carries the promise where it is acted on.
  const { SITE_COPY: copy } = await import("../site/render.js");
  assert.ok(copy.next.startsWith("저장하고"), "다음 says it saves first");
  assert.ok(copy.resultAction.startsWith("저장하고"), "and so does the last Part's key");
});

test("the privacy policy waits for someone to be responsible for it", async () => {
  const { standingPages, privacyCopy } = await import("../site/pages.js");
  const bare = siteWith({ operator: { business: "afterscent", owner: "", address: "" } });
  assert.equal(standingPages({ site: bare }).some((page) => page.slug === "privacy"), false,
    "제30조 requires a named 개인정보 보호책임자; a policy naming nobody is not one");

  const named = siteWith({ operator: { business: "afterscent", owner: "홍길동", address: "서울특별시 ..." } });
  const page = standingPages({ site: named }).find((each) => each.slug === "privacy");
  assert.ok(page, "two values turn it on");
  assert.equal(page.path, "/privacy/");
  // Derived, not declared: the footer and the sitemap are built from the same list.
  const { footerLinks } = await import("../site/pages.js");
  assert.ok(footerLinks({ site: named }).some((link) => link.path === "/privacy/"), "so the footer links it");

  const copy = privacyCopy({ site: named });
  const headings = copy.sections.map((section) => section.heading).join(" | ");
  for (const required of ["권리", "보호책임자", "권익침해", "제3자 제공", "쿠키", "바뀔 때"]) {
    assert.ok(headings.includes(required), `제30조: ${required} — ${headings}`);
  }
  const body = JSON.stringify(copy);
  assert.ok(body.includes("홍길동") && body.includes("서울특별시"), "it names who is responsible");
});

test("the policy describes the storage the site actually has, and the ads it actually serves", async () => {
  const { privacyCopy } = await import("../site/pages.js");
  const base = { business: "afterscent", owner: "홍길동", address: "서울특별시 ..." };

  const off = JSON.stringify(privacyCopy({ site: siteWith({ operator: base }) }));
  assert.ok(off.includes("쿠키를 사용하지 않"), "with no publisher id there are no cookies to declare");
  assert.equal(off.includes("adssettings"), false);

  const on = JSON.stringify(privacyCopy({ site: siteWith({ operator: base, adsenseClient: "ca-pub-1" }) }));
  assert.ok(on.includes("AdSense") && on.includes("adssettings"), "and with one, the cookies and the way out");
  assert.ok(on.includes("Google LLC"), "named as a processor");

  // The claim the whole page rests on, and the one the save model just changed.
  assert.ok(off.includes("임시 저장"), "it says storage happens when the reader presses the button");
  assert.ok(off.includes("localStorage"));
  assert.ok(off.includes("사라집니다"), "and that unsaved answers are lost");

  // Scoped to what the policy claims about today, not to the words it uses. A naive scan for
  // "서버에 저장" matched the section that promises to announce it *before* that ever happens —
  // the same shape of mistake as scanning the result copy for 점수 and hitting its own disclaimer.
  const now = privacyCopy({ site: siteWith({ operator: base }) }).sections
    .filter((section) => !section.heading.includes("바뀔 때"))
    .map((section) => section.paragraphs.join(" "))
    .join(" ");
  assert.ok(now.includes("서버로 전송되지 않습니다"), "it says answers are not sent");
  assert.ok(now.includes("답을 받는 서버가 없습니다"), "and that there is no server to receive them");
  for (const claim of ["서버에 저장합니다", "서버에 보관", "수집합니다"]) {
    assert.equal(now.includes(claim), false, `it must not claim to ${claim}`);
  }
});

test("the progress bar carries its value in aria and nothing on the screen", () => {
  const model = pageModel("marriage", 3, { site });
  const html = renderQuestionPage(model, site);
  const bar = html.slice(html.indexOf('<div class="progress"'), html.indexOf("</div>", html.indexOf('class="progress"')));

  assert.ok(bar.includes('role="progressbar"'));
  assert.ok(bar.includes(`aria-valuemax="${model.total}"`), "measured against the whole pack, not the Part");
  assert.ok(bar.includes('aria-valuenow="0"'), "empty until answers are recorded in the browser");
  assert.ok(bar.includes(`data-progress-total="${model.total}"`), "and the script is told the same total");

  // No text: the bar is the message, and "3 / 100" so early reads as a rebuke. Strip the tags and
  // there is nothing left but whitespace.
  assert.equal(bar.replace(/<[^>]*>/g, "").trim(), "", "the bar says nothing in words");
  for (const digits of [String(model.total), "%"]) {
    assert.equal(bar.replace(/aria-value(max|now)="[^"]*"|data-progress-total="[^"]*"/g, "").includes(digits), false);
  }
});

test("the strip pins the current tab left on a phone, and never scrolls sideways on a desktop", () => {
  const css = readFileSync("site/site.css", "utf8");
  const narrow = css.slice(css.indexOf("@media (max-width: 899px)"));
  const block = narrow.slice(0, narrow.indexOf("\n}\n"));
  assert.match(block, /flex-wrap: nowrap/, "one row that scrolls");
  assert.match(block, /justify-content: flex-start/, "centring a scrolling row hides its left end");
  // Nothing follows the last tab: the strip stops with Part 10 against the right edge rather than
  // scrolling on into empty room. Both ways of adding that room are checked, since one of them —
  // padding — also made the *page* scroll sideways under `border-box`, a 406px strip on a 390px
  // screen taking the document with it.
  const code = css.replace(/\/\*[\s\S]*?\*\//g, "");
  assert.equal(/\.parts::after \{[^}]*flex/s.test(code), false, "no trailing spacer");
  assert.equal(/\.parts \{[^}]*padding-right: (100%|[0-9]{3,})/s.test(code), false, "and no padding");

  const strip = css.slice(css.indexOf(".parts {"), css.indexOf("}", css.indexOf(".parts {")));
  assert.match(strip, /flex-wrap: wrap/, "wide screens wrap rather than scroll");
  assert.match(strip, /justify-content: center/);

  const enhance = readFileSync("site/enhance.js", "utf8");
  assert.match(enhance, /function pinCurrentTab/);
  // Re-run once the webfonts land: every tab changes width when they do, and a single early pass
  // leaves the tab further off with each Part — the drift this exists to remove.
  assert.match(enhance, /document\.fonts\?\.ready/);
});

test("the opening introduces the pack, so it is the same above every Part", () => {
  const entry = PUBLISHED[0];
  const lines = descriptionLines(entry.description);
  assert.ok(lines.length > 1, "this one is authored as more than a single line");

  for (const page of [1, 2, 5, LAST_PAGE]) {
    const html = renderQuestionPage(pageModel("marriage", page, { site }), site);
    assert.ok(has(html, `<h1>${entry.title}</h1>`), `Part ${page} names the pack`);
    assert.ok(has(html, entry.tagline), `Part ${page} carries the question the hundred are for`);
    for (const line of lines) assert.ok(has(html, line), `Part ${page} carries "${line.slice(0, 12)}…"`);
  }

  // The author's break is kept rather than left to the measure.
  const first = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  const blurb = first.slice(first.indexOf('class="stage-blurb"'), first.indexOf("</p>", first.indexOf('class="stage-blurb"')));
  assert.equal((blurb.match(/<br>/g) || []).length, lines.length - 1, "one break between each pair");

  // A meta tag has no use for a line break, so it gets the sentences joined.
  const model = pageModel("marriage", 1, { site });
  assert.equal(model.descriptionText, lines.join(" "));
  assert.ok(headTags(model, site).includes(model.descriptionText));
});

test("a Part opens at the top, so the opening is on the screen every time", () => {
  // A `restorePinned` used to scroll a newly opened Part to where the tab bar pins. That cannot
  // coexist with the opening being visible on every Part: the name, the question and the
  // description sit above the bar, so scrolling far enough to pin it pushes them off the top —
  // measured at -81px after a tab click. Nothing in the enhancement moves the page now.
  // On the code, not the prose: the note explaining the removal names both APIs.
  const enhance = readFileSync("site/enhance.js", "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert.equal(/window\.scrollTo/.test(enhance), false, "the enhancement never scrolls the page");
  assert.equal(/scrollIntoView/.test(enhance), false);
  // The strip's own sideways scroll is a different axis and stays.
  assert.match(enhance, /strip\.scrollLeft/);
});

test("the marriage source is sliced by index, not scanned by a lazy regex", async () => {
  // A lazy quantifier crossing a large file backtracks once per character, and past some
  // engine-dependent threshold stops matching rather than slowing down: this passed here and
  // returned null on a CI runner one Node patch ahead. Two indexOf calls cannot do that.
  const generator = readFileSync("scripts/build-marriage-100.mjs", "utf8");
  // On the code, not the prose: the comment above the fix quotes the pattern it replaced.
  assert.equal(/html\.match\(/.test(generator), false, "the document is never scanned by regex");
  assert.match(generator, /html\.indexOf\(opening\)/);
  assert.match(generator, /html\.indexOf\("\\n {2}\];", start\)/);

  // And it still reads the same hundred questions, with the four choices and the scene each one
  // was written with.
  const { readSource } = await import("../scripts/build-marriage-100.mjs");
  const raw = await readSource();
  assert.equal(raw.questions.length, 100);
  assert.equal(raw.order.length, 100);
  assert.equal(raw.questions.every((q) => q.o?.length === 4 && q.s && q.q), true);
  assert.equal(raw.values.every((set) => set.length === 4), true);
});

test("every question carries the notes block, and nothing in it is prefilled", () => {
  const model = pageModel(PUBLISHED[0].slug, 1, { site });
  const html = renderQuestionPage(model, site);

  for (const question of model.questions) {
    // Scoped to the question's own article, so a count across the page cannot hide a card missing
    // one of these while another has two.
    const start = html.indexOf(`data-question="${question.id}"`);
    const article = html.slice(start, html.indexOf("</article>", start));
    for (const field of ["importance", "reason", "guess"]) {
      assert.equal(
        (article.match(new RegExp(`data-note="${field}"`, "g")) || []).length,
        1,
        `${question.id} has one ${field} field`
      );
    }
    // The conversation block that used to sit here — three steps and a working rule — is gone at
    // the owner's word, along with the `rule` field it wrote into.
    assert.equal(article.includes("q-talk"), false);
    assert.equal(article.includes('data-note="rule"'), false);
    // Nothing is answered for the reader — no option preselected, no textarea with content in it.
    assert.equal(/<option value="[^"]+" selected/.test(article), false);
    assert.equal(/<textarea[^>]*>[^<]/.test(article), false, "textareas ship empty");
  }
});

test("the review block is behind one flag, and the page it leaves is intact", () => {
  const model = pageModel(PUBLISHED[0].slug, 1, { site });

  const withDebug = renderQuestionPage(model, siteWith({ ...site, debugFeedback: true }));
  assert.equal((withDebug.match(/data-feedback="/g) || []).length, model.questions.length);
  assert.equal((withDebug.match(/data-feedback-export/g) || []).length, 1, "one export for the page");
  assert.match(withDebug, /DEBUG/);

  // What the owner will do later: one flag, and every trace of it is gone from the page.
  const without = renderQuestionPage(model, siteWith({ ...site, debugFeedback: false }));
  for (const marker of ["data-feedback", "q-stars", "DEBUG", "★"]) {
    assert.equal(without.includes(marker), false, `${marker} goes with the flag`);
  }
  // And the question itself is untouched: the notes and the answer remain.
  for (const marker of ['data-note="reason"', 'data-note="guess"', "q-choices"]) {
    assert.ok(without.includes(marker), `${marker} is not part of the debug block`);
  }
});

test("the question card names no mood and no heading over its choices", () => {
  // Both were on the card and both were removed at the owner's word: the mood read as an
  // instruction about how to feel, and the heading named what four radio buttons already are.
  const html = renderQuestionPage(pageModel(PUBLISHED[0].slug, 1, { site }), site);
  assert.equal(html.includes("q-mood"), false);
  assert.equal(html.includes('class="q-label"'), false);
  assert.equal(html.includes("네 가지 답"), false);
  assert.equal(SITE_COPY.choicesLabel, undefined, "and the copy went with it");
});

test("a question keeps what was written beside it, before and after it is answered", async () => {
  const { answeredCount, emptyAnswers, parseAnswers, serializeAnswers, withAnswer, withNote } =
    await import("../site/answers.js");
  let answers = emptyAnswers("marriage");

  // Notes can come first: someone may write their way to a decision.
  answers = withNote(answers, "q1", "reason", "약속 없는 날이 제일 좋아서");
  assert.equal(answers.items.q1.reason, "약속 없는 날이 제일 좋아서");
  assert.equal(answers.items.q1.choiceId, "");
  assert.equal(answeredCount(answers), 0, "written on is not answered");

  // And answering does not overwrite them.
  answers = withAnswer(answers, "q1", "q1-a");
  assert.equal(answers.items.q1.reason, "약속 없는 날이 제일 좋아서");
  assert.equal(answeredCount(answers), 1);

  // Only the three named fields, and importance only from its own list.
  answers = withNote(answers, "q1", "importance", "need");
  assert.equal(answers.items.q1.importance, "need");
  assert.equal(withNote(answers, "q1", "importance", "매우").items.q1.importance, undefined);
  assert.equal(withNote(answers, "q1", "secret", "x").items.q1.secret, undefined);

  // A note cleared back to empty leaves nothing behind, and an item holding nothing is dropped.
  let onlyNotes = withNote(emptyAnswers("marriage"), "q2", "guess", "상대는 B를 고를 것 같아요");
  onlyNotes = withNote(onlyNotes, "q2", "guess", "");
  assert.equal(onlyNotes.items.q2, undefined);

  // A runaway paste cannot fill the quota and take the other answers down with it.
  const long = withNote(emptyAnswers("marriage"), "q3", "reason", "가".repeat(5000));
  assert.equal(long.items.q3.reason.length, 2000);

  // The block that wrote a working rule is gone, and so is the field: a note nothing can write is
  // a note nobody can read back.
  assert.equal(withNote(answers, "q1", "rule", "기본은 오후 외출").items.q1.rule, undefined);

  // And it all survives a round trip through storage.
  assert.deepEqual(parseAnswers(serializeAnswers(answers), "marriage").items.q1, answers.items.q1);
});

test("question feedback is a separate store, so removing it cannot take answers with it", async () => {
  const { emptyFeedback, feedbackCount, feedbackKey, parseFeedback, serializeFeedback, withFeedback } =
    await import("../site/feedback.js");
  const { storageKey } = await import("../site/answers.js");
  assert.notEqual(feedbackKey("marriage"), storageKey("marriage"));

  let feedback = withFeedback(emptyFeedback("marriage"), "q1", { rating: 4 });
  feedback = withFeedback(feedback, "q1", { comment: "B와 D가 겹쳐 보여요" });
  assert.deepEqual(feedback.items.q1, { rating: 4, comment: "B와 D가 겹쳐 보여요" });
  assert.equal(feedbackCount(feedback), 1);

  // Out-of-range ratings are dropped rather than stored, and an entry holding neither goes.
  assert.equal(withFeedback(emptyFeedback("marriage"), "q2", { rating: 9 }).items.q2, undefined);
  const cleared = withFeedback(withFeedback(feedback, "q1", { rating: 0 }), "q1", { comment: "" });
  assert.equal(cleared.items.q1, undefined);

  assert.deepEqual(parseFeedback(serializeFeedback(feedback), "marriage"), feedback);
  // Another pack's file is not this pack's feedback.
  assert.deepEqual(parseFeedback(serializeFeedback(feedback), "pregnancy"), emptyFeedback("pregnancy"));
});

test("a link carries the choices to the other person, and nothing else", async () => {
  const { encodeShare, decodeShare, SHARE_VERSION } = await import("../site/share.js");
  const { toQuestionIndex } = await import("../site/reflect.js");
  const { emptyAnswers, withAnswer, withNote } = await import("../site/answers.js");

  const questions = toQuestionIndex(findPack(PUBLISHED[0].packId).orderedQuestions);
  let mine = withAnswer(emptyAnswers("marriage"), questions[0].id, questions[0].o[2].id);
  mine = withAnswer(mine, questions[5].id, questions[5].o[0].id);
  // The notes beside a question are private thoughts about the person about to read the link.
  mine = withNote(mine, questions[0].id, "reason", "늦잠이 회복이라서");
  mine = withNote(mine, questions[0].id, "guess", "상대는 B를 고를 것 같아요");

  const payload = encodeShare("marriage", questions, mine);
  assert.equal(payload, `${SHARE_VERSION}.marriage.${"c----a".padEnd(questions.length, "-")}`);
  assert.equal(payload.includes("늦잠"), false, "no note travels");
  assert.equal(payload.includes("m100-"), false, "and no ids, so a link cannot name its build");
  // A hundred questions is a hundred characters, which fits any browser's address bar.
  assert.ok(payload.length < 200, `${payload.length} characters`);

  const decoded = decodeShare(payload, "marriage", questions);
  assert.deepEqual(decoded.items, {
    [questions[0].id]: questions[0].o[2].id,
    [questions[5].id]: questions[5].o[0].id
  });

  // Nothing answered is nothing to send.
  assert.equal(encodeShare("marriage", questions, emptyAnswers("marriage")), "");

  // Everything that does not match exactly is refused rather than repaired: a comparison lined up
  // against the wrong questions is worse than one that says it cannot be read.
  const body = "a".repeat(questions.length);
  for (const [what, text] of [
    ["another version", `v2.marriage.${body}`],
    ["another pack", `${SHARE_VERSION}.pregnancy.${body}`],
    ["another length", `${SHARE_VERSION}.marriage.${body.slice(0, 40)}`],
    ["a choice that does not exist", `${SHARE_VERSION}.marriage.${"z".repeat(questions.length)}`],
    ["nonsense", "hello"]
  ]) {
    assert.equal(decodeShare(text, "marriage", questions), null, `refuses ${what}`);
  }
});

test("the other person's answer opens only where the reader has answered too", async () => {
  const { compareAnswers } = await import("../site/share.js");
  const { toQuestionIndex } = await import("../site/reflect.js");
  const { emptyAnswers, withAnswer } = await import("../site/answers.js");

  const questions = toQuestionIndex(findPack(PUBLISHED[0].packId).orderedQuestions).slice(0, 3);
  const [q1, q2, q3] = questions;
  let mine = withAnswer(emptyAnswers("marriage"), q1.id, q1.o[0].id);
  mine = withAnswer(mine, q2.id, q2.o[3].id);
  const theirs = {
    items: { [q1.id]: q1.o[0].id, [q2.id]: q2.o[1].id, [q3.id]: q3.o[2].id }
  };

  const model = compareAnswers(questions, mine, theirs);
  assert.equal(model.shared.length, 1, "the one they answered the same");
  assert.equal(model.differing.length, 1);
  assert.equal(model.compared, 2);

  // The third is theirs alone, and the row carries no answer of theirs at all — not hidden by CSS,
  // not in the page. Seeing it first is how an honest answer becomes an agreeable one.
  assert.deepEqual(model.waiting.map((row) => row.number), [q3.n]);
  assert.equal(JSON.stringify(model.waiting).includes(q3.o[2].l), false);

  // A reader who has answered nothing sees nothing of theirs.
  const gated = compareAnswers(questions, emptyAnswers("marriage"), theirs);
  assert.equal(gated.empty, true);
  assert.equal(JSON.stringify(gated.differing) + JSON.stringify(gated.shared), "[][]");

  // And nothing the comparison says is a verdict about the two of them. Scoped to the comparison's
  // own words: the sheet's lead says "점수도, 판정도 없습니다", which is the promise, not a breach
  // of it, and a scan over every string would read that disavowal as the thing it disavows.
  const { RESULT_FORBIDDEN, RESULT_COPY } = await import("../site/result-copy.js");
  const words = Object.entries(RESULT_COPY)
    .filter(([name, value]) => name.startsWith("compare") && typeof value === "string")
    .map(([, value]) => value)
    .join(" ");
  for (const forbidden of RESULT_FORBIDDEN) {
    assert.equal(words.includes(forbidden), false, `the comparison never says ${forbidden}`);
  }
  // The count it does show is a fact about what the two of them did, like the sheet's own.
  assert.match(RESULT_COPY.compareCount(2, 100), /2 \/ 100/);
});

test("the result page offers the link, and the build ships the module that makes it", () => {
  const html = renderResultPage(PUBLISHED[0].slug, published, site);
  assert.match(html, /data-share-action/);
  assert.match(html, /data-compare/);
  assert.ok(html.includes(RESULT_COPY.shareNote), "it says what is in the link");
  assert.match(readFileSync("scripts/build-site.mjs", "utf8"), /"share\.js"/);
  // The payload rides in the fragment, which is the whole reason this can exist on a static site:
  // everything after `#` stays in the browser and reaches no server.
  assert.match(readFileSync("site/enhance.js", "utf8"), /#c=\$\{payload\}/);
});

test("a result can be mailed from the sheet, and the site still sends nothing", async () => {
  const { composeResultMail, mailtoHref, MAIL_BODY_LIMIT } = await import("../site/mail.js");
  const { RESULT_COPY } = await import("../site/result-copy.js");

  const rows = Array.from({ length: 40 }, (_, i) => ({
    number: i + 1,
    title: `질문 ${i + 1} — 이 문장은 한 줄을 채울 만큼 깁니다.`,
    mine: "내가 고른 답",
    theirs: "상대가 고른 답"
  }));

  const letter = composeResultMail({ title: "결혼 100제", rows, link: "https://ab.example/x#c=v1", compared: true });
  assert.equal(letter.subject, RESULT_COPY.mailSubjectCompared("결혼 100제"));
  assert.ok(letter.body.startsWith(RESULT_COPY.mailBothWarning), "it says whose answers are in it");
  // A mailto is a URL and a URL has a limit, so the letter carries what fits and links to the rest
  // rather than being silently cut by whichever program opens it.
  assert.ok(letter.body.length <= MAIL_BODY_LIMIT, `${letter.body.length} within ${MAIL_BODY_LIMIT}`);
  assert.ok(letter.written > 0 && letter.left === rows.length - letter.written);
  assert.ok(letter.body.includes(RESULT_COPY.mailMore(letter.left)));
  assert.ok(letter.body.includes("https://ab.example/x#c=v1"));

  // One person's own answers: no warning, and no link, because everything fits and a link that
  // carries answers has no business in a mail that did not need one.
  const alone = composeResultMail({
    title: "결혼 100제",
    rows: [{ number: 1, title: "질문", choice: "고른 답" }],
    link: "https://ab.example/x",
    compared: false
  });
  assert.equal(alone.subject, RESULT_COPY.mailSubject("결혼 100제"));
  assert.equal(alone.body.includes("https://"), false);
  assert.equal(alone.left, 0);

  // The recipient is left for the reader to choose, so no address is ever the site's.
  const href = mailtoHref(alone);
  assert.ok(href.startsWith("mailto:?"), href.slice(0, 20));
  assert.equal(decodeURIComponent(href).includes(alone.body), true);

  // And the sheet offers it.
  const html = renderResultPage(PUBLISHED[0].slug, published, site);
  assert.match(html, /data-mail-open/);
  assert.match(html, /data-mail-copy/);
  assert.ok(html.includes(RESULT_COPY.mailNote));
  // The pack's own name travels with the index, so the subject is not the sheet's title.
  assert.match(html, new RegExp(`"title":"${PUBLISHED[0].title}"`));
});

test("AdSense is two ids away, and absent until they are set", () => {
  const withAds = siteWith({ ...site, adsenseClient: "ca-pub-1234567890123456", adsenseSlot: "9876543210" });
  const on = renderQuestionPage(pageModel(PUBLISHED[0].slug, 1, { site: withAds }), withAds);
  assert.match(on, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=ca-pub-1234567890123456/);
  assert.equal((on.match(/class="adsbygoogle"/g) || []).length, 1, "one unit a page");
  // An ad is not hidden from a screen reader once it is really there.
  assert.equal(on.includes('data-ad-slot="after-questions" aria-hidden'), false);
  // The site's own rule about where: after the questions, before the control that leaves the page.
  assert.ok(on.indexOf('class="adsbygoogle"') > on.indexOf('class="questions"'));
  assert.ok(on.indexOf('class="adsbygoogle"') < on.indexOf('class="pager"'));

  // Nothing at all until a publisher is named — no script, no unit, and the empty box stays hidden.
  const off = renderQuestionPage(pageModel(PUBLISHED[0].slug, 1, { site }), site);
  assert.equal(off.includes("adsbygoogle"), false);
  assert.equal(off.includes("googlesyndication"), false);
  assert.match(off, /<div class="ad-slot" data-ad-slot="after-questions" aria-hidden="true">/);

  // ads.txt names the publisher, so it is written only when there is one.
  const build = readFileSync("scripts/build-site.mjs", "utf8");
  assert.match(build, /if \(site\.adsenseClient\)/);
  assert.match(build, /google\.com, \$\{publisher\}, DIRECT, f08c47fec0942fa0/);
});

test("둘이 함께 해보기 sends the invite link, and the link carries no answers", async () => {
  const { INVITE_COPY } = await import("../site/invite-copy.js");
  const html = renderQuestionPage(pageModel(PUBLISHED[0].slug, 1, { site }), site);

  // The owner names this control, and what it does is send the other person a link to the same
  // questions — the share sheet on a phone, the clipboard on a desktop.
  // On a question page the control is the dock's; the block it used to sit in is gone from here and
  // still on the pages with no dock, where 둘이 함께 해보기 is its wording.
  const sheet = renderResultPage("marriage", published, site);
  assert.ok(sheet.includes(SITE_COPY.ctaAction));
  assert.equal(SITE_COPY.ctaAction, "둘이 함께 해보기");
  assert.match(sheet, /<a class="cta-action" href="\/marriage\/" data-invite>/);
  assert.match(html, /data-invite/, "and the question page still offers it, from the dock");
  assert.match(html, /data-invite-state/, "a desktop is told the link was copied");

  const enhance = readFileSync("site/enhance.js", "utf8");
  assert.match(enhance, /navigator\.share\(\{ title: document\.title, text: INVITE_COPY\.shareText, url \}\)/);
  assert.match(enhance, /navigator\.clipboard\.writeText\(url\)/);
  assert.ok(INVITE_COPY.shareText && INVITE_COPY.copied);

  // This is the invite link, not the answer link: it holds the pack's address and nothing else, so
  // it is the one of the three that is safe to put anywhere.
  assert.equal(html.includes('data-invite>') && html.includes("#c="), false);
  assert.match(readFileSync("scripts/build-site.mjs", "utf8"), /"invite-copy\.js"/);
});
