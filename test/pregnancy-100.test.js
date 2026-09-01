import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readSourceSections, toPack } from "../scripts/build-pregnancy-100.mjs";
import { pregnancy100Pack } from "../src/questions-pregnancy-100.js";
import { pageModel } from "../site/content.js";
import { renderQuestionPage } from "../site/render.js";

/**
 * The pack is registered and built but not in `site/config.js` `PUBLISHED` — being in the registry
 * is having content, being published is a decision, and today the site publishes 결혼 100제 alone.
 * These tests render it through an explicit list so the pack stays covered while it waits, and so
 * publishing it again is one entry rather than one entry plus a repair to this file.
 */
const AS_PUBLISHED = [{ packId: "pregnancy-100", slug: "pregnancy", title: "임신 100제", description: "", lead: "" }];
const pregnancyPage = (n) => pageModel("pregnancy", n, { published: AS_PUBLISHED });

/**
 * `src/questions-pregnancy-100.js` is generated from `question-packs/pregnancy.html`, and unlike the
 * marriage pack that source is a rendered document rather than a data array — the questions are read
 * out of markup. That makes this check do double duty: it catches the two files drifting apart, and
 * it catches the reader silently matching less than it should after an edit to the HTML.
 */
test("the generated pack still matches the editorial source it came from", async () => {
  const fromSource = toPack(await readSourceSections());

  assert.equal(fromSource.questions.length, 100);
  assert.equal(fromSource.sections.length, 10);
  assert.deepEqual(
    pregnancy100Pack.sections.map((s) => ({ id: s.id, title: s.title, blurb: s.blurb })),
    fromSource.sections
  );
  assert.deepEqual(
    pregnancy100Pack.questions.map((q) => ({
      id: q.id,
      sectionId: q.sectionId,
      title: q.title,
      example: q.example,
      mood: q.mood,
      choices: q.choices.map((c) => ({ id: c.id, label: c.label, valueLabel: c.valueLabel }))
    })),
    fromSource.questions,
    "regenerate with `node scripts/build-pregnancy-100.mjs`"
  );
});

test("every question carries a scene, a mood and four named values", () => {
  // All-or-nothing is enforced by definePack; this states what the pack actually has, so a reader
  // knows the fields are the source's and not a default.
  assert.equal(pregnancy100Pack.questions.length, 100);
  const scenes = new Set();
  for (const question of pregnancy100Pack.questions) {
    assert.ok(question.example.length > 10, `${question.id} has a real scene`);
    assert.ok(question.mood, `${question.id} has a mood`);
    scenes.add(question.example);
    assert.equal(question.choices.length, 4);
    const values = new Set(question.choices.map((choice) => choice.valueLabel));
    assert.equal(values.size, 4, `${question.id} names four different values`);
  }
  assert.equal(scenes.size, 100, "every scene is this question's own, not a rotating line");
  assert.equal(new Set(pregnancy100Pack.questions.flatMap((q) => q.choices.map((c) => c.id))).size, 400);
});

/**
 * The appendix is the reason this file has a second half. It is ten quiz items about obstetric
 * emergencies — bleeding, pre-eclampsia, when to call 119 — and they have right answers.
 */
test("the emergency appendix is not published, and cannot be by accident", async () => {
  const html = readFileSync("question-packs/pregnancy.html", "utf8");
  assert.ok(html.includes('data-correct="true"'), "the source really does mark correct answers");
  assert.ok(html.includes("119"), "and really is about emergencies");

  const emergencyTitles = [...html.matchAll(/<article class="emergency-card"[\s\S]*?<h3>([\s\S]*?)<\/h3>/g)]
    .map(([, title]) => title.replace(/<[^>]+>/g, "").trim());
  assert.ok(emergencyTitles.length >= 10, `found ${emergencyTitles.length} emergency items`);

  // None of them reached the pack, and none of them reaches a page.
  const published = new Set(pregnancy100Pack.questions.map((question) => question.title));
  for (const title of emergencyTitles) {
    assert.equal(published.has(title), false, `"${title.slice(0, 24)}…" is not in the pack`);
  }
  const page = renderQuestionPage(pregnancyPage(1), undefined);
  for (const title of emergencyTitles) assert.equal(page.includes(title), false);

  // A quiz cannot live in a sheet that forbids scoring, which is the structural half of the reason.
  const { RESULT_FORBIDDEN } = await import("../site/result-copy.js");
  assert.ok(RESULT_FORBIDDEN.length > 0, "the sheet still forbids a verdict vocabulary");
});

test("the pack is built and ready, and the site does not publish it today", async () => {
  const { PUBLISHED } = await import("../site/config.js");
  assert.equal(PUBLISHED.some((entry) => entry.packId === "pregnancy-100"), false);
  assert.equal(pageModel("pregnancy", 1, {}), null, "no page is emitted for it");
  // Registered all the same, so publishing is adding one entry.
  const { findPack } = await import("../src/packs.js");
  assert.equal(findPack("pregnancy-100")?.questions.length, 100);
});

test("the page shows the Part's line, the scene and the value names, and no mood", () => {
  const model = pregnancyPage(1);
  const html = renderQuestionPage(model, undefined);
  assert.ok(html.includes(model.part.blurb), "the Part introduces itself, once");
  assert.equal((html.match(/class="part-blurb"/g) || []).length, 1);
  for (const question of model.questions) {
    // The mood is pack data the page deliberately does not print: beside the question it read as
    // an instruction about how to feel, which is the one thing a question must not carry.
    assert.equal(html.includes(`<span class="q-mood">${question.mood}</span>`), false);
    if (question.scene) {
      assert.ok(html.includes(`<p class="q-scene">${question.scene}</p>`), `${question.id} scene`);
    }
    for (const choice of question.choices) {
      assert.ok(html.includes(choice.label), choice.id);
      assert.ok(html.includes(`>${choice.valueLabel}</em>`), `${choice.id} value name`);
    }
  }
  // And a pack that wrote none of it renders without empty shells: the elements are omitted, not
  // emitted blank, so a reader never meets a gap they cannot account for. Both site packs now carry
  // the full set, so the bare case is built here rather than borrowed from one of them.
  const bare = {
    ...model,
    part: { ...model.part, blurb: "" },
    questions: model.questions.map((question) => ({
      ...question,
      mood: undefined,
      scene: undefined,
      choices: question.choices.map((choice) => ({ ...choice, valueLabel: undefined }))
    }))
  };
  const plain = renderQuestionPage(bare, undefined);
  for (const marker of ["q-mood", "q-choice-value", "q-scene", "part-blurb"]) {
    assert.equal(plain.includes(marker), false, `${marker} is absent where there is nothing to say`);
  }
});
