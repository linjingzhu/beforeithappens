import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PUBLISHED, SITE, publishedBySlug, siteWith } from "../site/config.js";
import { allPages, descriptionLines, indexModel, pageModel, pagePath, partsOf } from "../site/content.js";
import { SITE_COPY, renderIndex, renderQuestionPage, renderResultPage, renderStandingPage } from "../site/render.js";
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
  assert.deepEqual(
    scripts,
    ['<script type="application/ld+json">', '<script type="module" src="/enhance.js">'],
    "exactly one behavioural script, and it is the enhancement module"
  );
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
  for (const page of [1, LAST_PAGE]) {
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
  answers = withAnswer(answers, Q1.id, Q1.choices[0].id);
  answers = withAnswer(answers, Q2.id, Q2.choices[0].id);
  answers = withDiscussionFlag(answers, Q2.id, true);

  const model = resultModel("marriage", answers);
  assert.equal(model.total, published.length);
  assert.equal(model.answered, 2);
  assert.equal(model.complete, false);
  assert.equal(model.empty, false);

  // Grouped under the chapter, in pack order, with the person's own words given back.
  assert.deepEqual(model.chapters.map((c) => c.chapter), [Q1.chapter]);
  assert.equal(model.chapters[0].answers[0].choice, Q1.choices[0].label);
  assert.deepEqual(model.notDiscussed.map((r) => r.questionId), [Q2.id]);

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
  assert.deepEqual(direct.notDiscussed, viaModel.notDiscussed.map((r) => ({ ...r })));

  assert.deepEqual(reflect([], answers).chapters, []);
  assert.equal(reflect([], answers).complete, false, "no questions is not a completed set");
});

test("the questions are answerable, and readable without answering", async () => {
  const html = renderQuestionPage(pageModel("marriage", 1, { site }), site);
  assert.ok(has(html, `type="radio" name="q-${Q1.id}"`), "the choices are a real form control");
  assert.ok(has(html, `data-undiscussed="${Q1.id}"`));
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

test("the last page offers the sheet instead of a page that is not there", () => {
  const last = renderQuestionPage(pageModel("marriage", LAST_PAGE, { site }), site);
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

test("every question carries the notes block and the conversation, and neither is prefilled", () => {
  const model = pageModel(PUBLISHED[0].slug, 1, { site });
  const html = renderQuestionPage(model, site);

  for (const question of model.questions) {
    // Scoped to the question's own article, so a count across the page cannot hide a card missing
    // one of these while another has two.
    const start = html.indexOf(`data-question="${question.id}"`);
    const article = html.slice(start, html.indexOf("</article>", start));
    for (const field of ["importance", "reason", "guess", "rule"]) {
      assert.equal(
        (article.match(new RegExp(`data-note="${field}"`, "g")) || []).length,
        1,
        `${question.id} has one ${field} field`
      );
    }
    assert.match(article, /<details class="q-talk">/, `${question.id} conversation`);
    assert.ok(article.includes(SITE_COPY.talkLabel));
    assert.ok(article.includes(SITE_COPY.ruleLabel));
    for (const step of SITE_COPY.talkSteps) assert.ok(article.includes(step.body), step.lead);
    // The conversation is shut on arrival: opened, it reads as a stated right way through the
    // question before the reader has answered it.
    assert.equal(/<details class="q-talk" open/.test(article), false);
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
  // And the question itself is untouched: the notes, the conversation and the answer all remain.
  for (const marker of ['data-note="reason"', 'class="q-talk"', "q-choices"]) {
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

  // Only the four named fields, and importance only from its own list.
  answers = withNote(answers, "q1", "importance", "need");
  assert.equal(answers.items.q1.importance, "need");
  assert.equal(withNote(answers, "q1", "importance", "매우").items.q1.importance, undefined);
  assert.equal(withNote(answers, "q1", "secret", "x").items.q1.secret, undefined);

  // A note cleared back to empty leaves nothing behind, and an item holding nothing is dropped.
  let onlyNotes = withNote(emptyAnswers("marriage"), "q2", "guess", "상대는 B를 고를 것 같아요");
  onlyNotes = withNote(onlyNotes, "q2", "guess", "");
  assert.equal(onlyNotes.items.q2, undefined);

  // A runaway paste cannot fill the quota and take the other answers down with it.
  const long = withNote(emptyAnswers("marriage"), "q3", "rule", "가".repeat(5000));
  assert.equal(long.items.q3.rule.length, 2000);

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
