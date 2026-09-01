import test from "node:test";
import assert from "node:assert/strict";
import { PUBLISHED, SITE, publishedBySlug, siteWith } from "../site/config.js";
import { allPages, indexModel, pageCount, pageModel, pagePath, pageSlice } from "../site/content.js";
import { SITE_COPY, renderIndex, renderQuestionPage } from "../site/render.js";
import { headTags, pageDescription, pageTitle, robotsTxt, sitemapXml, structuredData } from "../site/seo.js";
import { questionsFor } from "../src/packs.js";

const site = siteWith({ origin: "https://ab.example", appOrigin: "https://app.example" });
const has = (html, text) => html.includes(text);

test("a hundred questions is ten pages, and pagination is derived rather than configured", () => {
  assert.equal(pageCount(100, 10), 10);
  assert.equal(pageCount(12, 10), 2, "twelve today becomes ten pages by writing, with nothing to update");
  assert.equal(pageCount(10, 10), 1);
  assert.equal(pageCount(1, 10), 1);
  assert.equal(pageCount(0, 10), 1, "an empty pack still has one page rather than zero");
  assert.equal(pageCount(100, 0), 100, "a nonsense page size does not divide by zero");
});

test("a page carries its own ten, and the reader sees the question's own number", () => {
  const questions = questionsFor("marriage");
  assert.deepEqual(pageSlice(questions, 1, 10).map((q) => q.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.deepEqual(pageSlice(questions, 2, 10).map((q) => q.number), [11, 12], "page two starts at 11, not 1");
  assert.deepEqual(pageSlice(questions, 3, 10), [], "past the end is empty, not wrapped");
  assert.deepEqual(pageSlice(questions, 0, 10).map((q) => q.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "page 0 reads as 1");
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
  assert.deepEqual(PUBLISHED.map((entry) => entry.catalogId), ["marriage"]);
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

  const last = pageModel("marriage", 2, { site });
  assert.equal(last.last, true);
  assert.equal(last.nextPath, "", "the last page offers no next");
  assert.equal(last.previousPath, "/marriage/");
  assert.equal(last.lead, "");
});

test("every page is emitted, in order, once", () => {
  const pages = allPages({ site });
  assert.equal(pages.length, 2);
  assert.deepEqual(pages.map((p) => p.path), ["/marriage/", "/marriage/2/"]);
  assert.equal(new Set(pages.map((p) => p.path)).size, pages.length);
});

test("the page is readable with no JavaScript at all", () => {
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  // A crawler that runs nothing must still see the questions; the app's innerHTML approach would
  // hand it an empty shell. The only script is the JSON-LD block, which is data, not behaviour.
  const scripts = html.match(/<script[^>]*>/g) || [];
  assert.deepEqual(scripts, ['<script type="application/ld+json">'], "no behavioural script is shipped");
  for (const question of questionsFor("marriage").slice(0, 10)) {
    assert.ok(has(html, question.title), question.id);
    for (const choice of question.choices) assert.ok(has(html, choice.label), choice.id);
  }
});

test("each page in the series says which page it is", () => {
  const one = pageModel("marriage", 1, { site });
  const two = pageModel("marriage", 2, { site });
  // Pointing every page's canonical at page one would hide nine tenths of the content.
  assert.ok(has(headTags(one, site), 'rel="canonical" href="https://ab.example/marriage/"'));
  assert.ok(has(headTags(two, site), 'rel="canonical" href="https://ab.example/marriage/2/"'));
  assert.ok(has(headTags(one, site), 'rel="next"'));
  assert.equal(has(headTags(one, site), 'rel="prev"'), false);
  assert.ok(has(headTags(two, site), 'rel="prev"'));
  assert.equal(has(headTags(two, site), 'rel="next"'), false);

  assert.notEqual(pageTitle(one, site), pageTitle(two, site), "two pages, two titles");
  assert.notEqual(pageDescription(one), pageDescription(two));
});

test("structured data suggests answers and never accepts one", () => {
  const model = pageModel("marriage", 1, { site });
  const block = structuredData(model, site);
  const json = JSON.parse(block.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "").replace(/\\u003c/g, "<"));
  assert.equal(json["@type"], "ItemList");
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
  assert.equal(escaped.match(/<\/script>/g).length, 1, "only the wrapper closes the block");
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

test("every page offers the way into the two-person version", () => {
  for (const page of [1, 2]) {
    const html = renderQuestionPage(pageModel("marriage", page, { site }), site);
    assert.ok(has(html, SITE_COPY.ctaAction));
    assert.ok(has(html, 'href="https://app.example"'), "the CTA points at the app when an origin is set");
  }
  const noOrigin = renderQuestionPage(pageModel("marriage", 1, {}), SITE);
  assert.ok(has(noOrigin, 'class="cta-action" href="/"'), "and degrades to / rather than to nothing");
});

test("turning a page is a real navigation, not a script", () => {
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  assert.ok(has(html, `<a class="pager-next" href="/marriage/2/" rel="next">`));
  const last = renderQuestionPage(pageModel("marriage", 2, { site }), site);
  assert.equal(has(last, 'class="pager-next"'), false);
  assert.ok(has(last, 'class="pager-prev" href="/marriage/"'));
});

test("the index lists what is published and links to page one", () => {
  const html = renderIndex(indexModel({ site }), site);
  assert.ok(has(html, 'href="/marriage/"'));
  assert.ok(has(html, "12개의 질문 · 2쪽"));
});

test("the sitemap lists every page, because nothing links to page seven from outside", () => {
  const xml = sitemapXml(allPages({ site }), site);
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(has(xml, "http://www.sitemaps.org/schemas/sitemap/0.9"));
  assert.ok(has(xml, "<loc>https://ab.example/marriage/</loc>"));
  assert.ok(has(xml, "<loc>https://ab.example/marriage/2/</loc>"));
  assert.ok(has(robotsTxt(site), "Sitemap: https://ab.example/sitemap.xml"));
  assert.equal(has(robotsTxt(SITE), "Sitemap:"), false, "no origin, no sitemap line pointing nowhere");
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
