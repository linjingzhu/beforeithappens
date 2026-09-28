import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SITE_PACK_SOURCES, readSourceSections, toPack } from "../scripts/lib/site-pack-source.mjs";
import { findPack } from "../src/packs.js";
import { PUBLISHED } from "../site/config.js";
import { pageModel } from "../site/content.js";
import { renderQuestionPage } from "../site/render.js";

/**
 * The four lifecycle packs the site generates from `question-packs/` — 임신, 출산, 육아, 노후.
 *
 * Unlike 결혼 100제, whose source is a data array, these are rendered documents: the questions are
 * read out of markup by `scripts/lib/site-pack-source.mjs`. So these checks do double duty. They
 * catch a generated module drifting from the document an author edits, and they catch the reader
 * silently matching less than it should after a change to the markup — a mis-read that loses a field
 * would otherwise ship as a pack quietly missing a line.
 *
 * Written as a loop over the build's own table rather than four copies. A fifth pack added to that
 * table is covered by this file the moment it exists, which is the opposite of how the second pack
 * went in: it arrived with a copy of the first pack's script and a copy of its test.
 */
const SPECS = SITE_PACK_SOURCES;

test("the build table names four packs, and each one is registered under its own ids", () => {
  assert.deepEqual(SPECS.map((spec) => spec.slug), ["pregnancy", "birth", "parenting", "later"]);
  // Ids are keyed by prefix per pack because a reader's saved answers are keyed by question id.
  // Two packs sharing a prefix would share ids, and one pack's answers would read as another's.
  assert.equal(new Set(SPECS.map((spec) => spec.idPrefix)).size, SPECS.length);
  assert.equal(new Set(SPECS.map((spec) => spec.id)).size, SPECS.length);
  assert.equal(new Set(SPECS.map((spec) => spec.out)).size, SPECS.length);
});

for (const spec of SPECS) {
  test(`${spec.title}: the generated module still matches the editorial source it came from`, async () => {
    const pack = findPack(spec.id);
    assert.ok(pack, `${spec.id} is registered in src/packs.js`);

    const fromSource = toPack(await readSourceSections(spec.source), spec.idPrefix);
    assert.equal(fromSource.questions.length, 100);
    assert.equal(fromSource.sections.length, 10);
    assert.deepEqual(
      pack.sections.map((section) => ({ id: section.id, title: section.title, blurb: section.blurb })),
      fromSource.sections
    );
    assert.deepEqual(
      pack.questions.map((question) => ({
        id: question.id,
        sectionId: question.sectionId,
        title: question.title,
        example: question.example,
        mood: question.mood,
        choices: question.choices.map((choice) => ({
          id: choice.id,
          label: choice.label,
          valueLabel: choice.valueLabel
        }))
      })),
      fromSource.questions,
      `regenerate with \`node scripts/build-site-packs.mjs ${spec.slug}\``
    );
  });

  test(`${spec.title}: every question carries a scene, a mood and four named values`, () => {
    // All-or-nothing is enforced by definePack; this states what the packs actually have, so a
    // reader knows the fields are the source's and not a default. The four packs were written from
    // one template and had to be rewritten question by question to get here: the choices arrived
    // generated, four answers to a question that said the same thing in four tones, and the scenes
    // repeated across the hundred. Both are what these two counts hold.
    const pack = findPack(spec.id);
    assert.equal(pack.questions.length, 100);
    const scenes = new Set();
    for (const question of pack.questions) {
      assert.ok(question.example.length > 10, `${question.id} has a real scene`);
      assert.ok(question.mood, `${question.id} has a mood`);
      scenes.add(question.example);
      assert.equal(question.choices.length, 4);
      const values = new Set(question.choices.map((choice) => choice.valueLabel));
      assert.equal(values.size, 4, `${question.id} names four different values`);
      const labels = new Set(question.choices.map((choice) => choice.label));
      assert.equal(labels.size, 4, `${question.id} offers four different answers`);
    }
    assert.equal(scenes.size, 100, "every scene is this question's own, not a rotating line");
    assert.equal(new Set(pack.questions.flatMap((q) => q.choices.map((c) => c.id))).size, 400);
  });

  test(`${spec.title}: the emergency appendix is not published, and cannot be by accident`, async () => {
    // Every one of these packs ends with one, and it is a different kind of thing: quiz items with
    // right answers about bleeding, 진통, 고열, 낙상 — including when to call 119.
    const html = readFileSync(spec.source, "utf8");
    assert.ok(html.includes('data-correct="true"'), "the source really does mark correct answers");
    assert.ok(html.includes("119"), "and really is about emergencies");

    const emergencyTitles = [...html.matchAll(/<article class="emergency-card"[\s\S]*?<h3>([\s\S]*?)<\/h3>/g)]
      .map(([, title]) => title.replace(/<[^>]+>/g, "").trim());
    assert.ok(emergencyTitles.length >= 10, `found ${emergencyTitles.length} emergency items`);

    // None of them reached the pack, and none of them reaches a page.
    const published = new Set(findPack(spec.id).questions.map((question) => question.title));
    for (const title of emergencyTitles) {
      assert.equal(published.has(title), false, `"${title.slice(0, 24)}…" is not in the pack`);
    }
    const page = renderQuestionPage(pageModel(spec.slug, 1, {}), undefined);
    for (const title of emergencyTitles) assert.equal(page.includes(title), false);

    // A quiz cannot live in a sheet that forbids scoring, which is the structural half of the reason.
    const { RESULT_FORBIDDEN } = await import("../site/result-copy.js");
    assert.ok(RESULT_FORBIDDEN.length > 0, "the sheet still forbids a verdict vocabulary");
  });

  test(`${spec.title}: the site publishes it, as ten Parts with words of its own`, () => {
    const entry = PUBLISHED.find((each) => each.packId === spec.id);
    assert.ok(entry, `${spec.id} is in site/config.js PUBLISHED`);
    assert.equal(entry.slug, spec.slug);
    assert.equal(entry.title, spec.title);
    // A card with no line under it and a page with no lead are the two ways a pack can be published
    // half-written, and both render as an empty element rather than as an error.
    assert.ok(entry.tagline, "the card carries the pack's own question");
    assert.ok(entry.description?.length, "and its own description");
    assert.ok(entry.lead, "and the page opens with the reader's instruction");

    const first = pageModel(spec.slug, 1, {});
    assert.ok(first, "page one is reachable");
    assert.equal(first.pages, 10, "a hundred questions, ten Parts");
    assert.equal(first.total, 100);
    assert.equal(first.questions.length, 10);
    assert.equal(pageModel(spec.slug, 11, {}), null, "past the end is null, not an empty page");
  });
}

test("a published page shows the Part's line, the scene and the value names, and no mood", () => {
  // One pack's page stands for all four: they are rendered by the same function from the same
  // shape, and what this holds is the renderer's contract rather than 임신's own.
  const model = pageModel("pregnancy", 1, {});
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
  // emitted blank, so a reader never meets a gap they cannot account for. Every site pack now
  // carries the full set, so the bare case is built here rather than borrowed from one of them.
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
