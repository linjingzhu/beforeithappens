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
  // hand it an empty shell. One script ships, and only as enhancement — what it adds is memory, so
  // scripting off costs the ability to record an answer, never the ability to read one.
  const scripts = html.match(/<script[^>]*>/g) || [];
  assert.deepEqual(
    scripts,
    ['<script type="application/ld+json">', '<script type="module" src="/enhance.js">'],
    "exactly one behavioural script, and it is the enhancement module"
  );
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
  assert.ok(has(last, 'class="pager-next" href="/marriage/result/"'), "the end leads to the sheet");
  assert.equal(has(last, 'rel="next"'), false, "but it is not another page in the series");
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
  const { ANSWERS_VERSION, emptyAnswers, parseAnswers, serializeAnswers, withAnswer, withDiscussionFlag } =
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
  const partial = JSON.stringify({ version: ANSWERS_VERSION, slug: "marriage", items: { "home-01": { notDiscussed: true } } });
  assert.deepEqual(parseAnswers(partial, "marriage").items, {});

  // Marking a question undiscussed before answering it is meaningless.
  assert.deepEqual(withDiscussionFlag(emptyAnswers("marriage"), "home-01", true).items, {});
  const flagged = withDiscussionFlag(built, "home-01", true);
  assert.equal(flagged.items["home-01"].notDiscussed, true);
  assert.equal(built.items["home-01"].notDiscussed, false, "the input is not mutated");
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
  const { emptyAnswers, withAnswer, withDiscussionFlag } = await import("../site/answers.js");
  const { RESULT_COPY, RESULT_FORBIDDEN, resultModel } = await import("../site/result.js");

  let answers = emptyAnswers("marriage");
  answers = withAnswer(answers, "home-01", "home-rest");
  answers = withAnswer(answers, "money-01", "money-save");
  answers = withDiscussionFlag(answers, "money-01", true);

  const model = resultModel("marriage", answers);
  assert.equal(model.total, 12);
  assert.equal(model.answered, 2);
  assert.equal(model.complete, false);
  assert.equal(model.empty, false);

  // Grouped under the chapter, in pack order, with the person's own words given back.
  assert.deepEqual(model.chapters.map((c) => c.chapter), ["함께 사는 집", "돈과 선택"]);
  assert.equal(model.chapters[0].answers[0].choice, "외부의 피로를 회복하는 조용한 안식처");
  assert.deepEqual(model.notDiscussed.map((r) => r.questionId), ["money-01"]);

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
  const stale = withAnswer(emptyAnswers("marriage"), "home-01", "a-choice-that-was-removed");
  const model = resultModel("marriage", stale);
  assert.equal(model.answered, 0);
  assert.equal(model.empty, true);
});

test("the build and the browser share one reflection rather than two that drift", async () => {
  const { reflect, toQuestionIndex } = await import("../site/reflect.js");
  const { emptyAnswers, withAnswer } = await import("../site/answers.js");
  const { resultModel } = await import("../site/result.js");
  const answers = withAnswer(emptyAnswers("marriage"), "home-01", "home-rest");

  // `site/result.js` adapts registry questions into the index the page embeds, then calls the same
  // function the browser calls. A second implementation is exactly what this prevents.
  const direct = reflect(toQuestionIndex(questionsFor("marriage")), answers);
  const viaModel = resultModel("marriage", answers);
  assert.equal(direct.answered, viaModel.answered);
  assert.deepEqual(direct.chapters.map((c) => c.chapter), viaModel.chapters.map((c) => c.chapter));
  assert.deepEqual(direct.notDiscussed, viaModel.notDiscussed.map((r) => ({ ...r })));

  assert.deepEqual(reflect([], answers).chapters, []);
  assert.equal(reflect([], answers).complete, false, "no questions is not a completed set");
});

test("the questions are answerable, and readable without answering", async () => {
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  assert.ok(has(html, 'type="radio" name="q-home-01"'), "the choices are a real form control");
  assert.ok(has(html, 'data-undiscussed="home-01"'));
  // Enhancement, not requirement: every word is in the HTML whether or not the script runs.
  assert.ok(has(html, '<script type="module" src="/enhance.js"></script>'));
  for (const question of questionsFor("marriage").slice(0, 10)) {
    assert.ok(has(html, question.whyItMatters), `${question.id} explanation is in the markup`);
  }
});

test("the last page offers the sheet instead of a page that is not there", () => {
  const last = renderQuestionPage(pageModel("marriage", 2, { site }), site);
  assert.ok(has(last, 'href="/marriage/result/"'));
  const first = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  assert.equal(has(first, 'href="/marriage/result/"'), false, "only at the end");
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
