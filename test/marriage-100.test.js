import test from "node:test";
import assert from "node:assert/strict";
import { readSourceQuestions, toPack } from "../scripts/build-marriage-100.mjs";
import { marriage100Pack } from "../src/questions-marriage-100.js";
import { PACK_SURFACE, definePack } from "../src/pack-schema.js";

/**
 * `src/questions-marriage-100.js` is generated from `question-packs/marriage.html`. Generated files
 * rot quietly: someone fixes a typo in one of them, the other keeps the old wording, and the site
 * ships text nobody approved. Re-running the extraction here means an edit to either that is not an
 * edit to both fails in CI rather than in front of a reader.
 */
test("the generated pack still matches the editorial source it came from", async () => {
  const fromSource = toPack(await readSourceQuestions());

  assert.equal(fromSource.questions.length, 100, "the source is a hundred questions");
  assert.equal(fromSource.sections.length, 10);
  assert.deepEqual(
    marriage100Pack.sections.map((section) => ({ id: section.id, title: section.title })),
    fromSource.sections
  );
  assert.deepEqual(
    marriage100Pack.questions.map((question) => ({
      id: question.id,
      sectionId: question.sectionId,
      title: question.title,
      choices: question.choices.map((choice) => ({ id: choice.id, label: choice.label }))
    })),
    fromSource.questions,
    "regenerate with `node scripts/build-marriage-100.mjs`"
  );
});

test("every question id and every choice id is unique across the whole pack", () => {
  // definePack enforces this at import, so reaching this line already proves it. Stated because a
  // collision here is silent corruption rather than a crash: two questions sharing a choice id
  // means one person's answer is read back as the other's.
  const questionIds = new Set(marriage100Pack.questions.map((question) => question.id));
  const choiceIds = new Set(marriage100Pack.questions.flatMap((q) => q.choices.map((c) => c.id)));
  assert.equal(questionIds.size, 100);
  assert.equal(choiceIds.size, 400, "a hundred questions, four choices each, no id used twice");
});

test("the sections are ten of ten, in the source's order, and renumbering runs 1..100", () => {
  for (const section of marriage100Pack.sections) {
    const inSection = marriage100Pack.questions.filter((q) => q.sectionId === section.id);
    assert.equal(inSection.length, 10, `${section.title} holds ten`);
  }
  assert.deepEqual(
    marriage100Pack.orderedQuestions.map((question) => question.number),
    Array.from({ length: 100 }, (_, i) => i + 1)
  );
  // Ordering is by section, so a reader moves through one theme at a time rather than at random.
  assert.deepEqual(
    [...new Set(marriage100Pack.orderedQuestions.map((question) => question.chapter))],
    marriage100Pack.sections.map((section) => section.title)
  );
});

test("a site pack is refused the app's fields rather than quietly ignoring them", () => {
  const base = {
    id: "site-pack",
    surface: PACK_SURFACE.site,
    version: "1",
    locale: "ko-KR",
    title: "t",
    sections: [{ id: "s", title: "S" }],
    questions: [{
      id: "q1",
      sectionId: "s",
      title: "질문",
      choices: ["a", "b", "c", "d"].map((k) => ({ id: `q1-${k}`, label: k }))
    }]
  };
  assert.ok(definePack(base), "the minimum a site pack needs is a question and four choices");

  const refused = [
    ["a catalogId", { catalogId: "marriage" }],
    ["a paywall", { freeQuestionCount: 0 }]
  ];
  for (const [what, extra] of refused) {
    assert.throws(() => definePack({ ...base, ...extra }), undefined, `a site pack must not carry ${what}`);
  }

  for (const field of ["intent", "example", "whyItMatters", "researchKeywords"]) {
    assert.throws(
      () => definePack({ ...base, questions: [{ ...base.questions[0], [field]: "x" }] }),
      undefined,
      `half-filled guidance (${field}) is a mistake, not a bonus`
    );
  }
});
