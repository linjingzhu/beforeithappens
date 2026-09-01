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

test("a site pack carries a guidance field on every question or on none", () => {
  const base = {
    id: "site-pack",
    surface: PACK_SURFACE.site,
    version: "1",
    locale: "ko-KR",
    title: "t",
    sections: [{ id: "s", title: "S" }],
    questions: [1, 2].map((n) => ({
      id: `q${n}`,
      sectionId: "s",
      title: `질문 ${n}`,
      choices: ["a", "b", "c", "d"].map((k) => ({ id: `q${n}-${k}`, label: `${n}${k}` }))
    }))
  };
  assert.ok(definePack(base), "the minimum a site pack needs is a question and four choices");

  const refused = [
    ["a catalogId", { catalogId: "marriage" }],
    ["a paywall", { freeQuestionCount: 0 }]
  ];
  for (const [what, extra] of refused) {
    assert.throws(() => definePack({ ...base, ...extra }), undefined, `a site pack must not carry ${what}`);
  }

  // researchKeywords stays app-only: the site has nowhere to put a keyword list.
  assert.throws(
    () => definePack({ ...base, questions: base.questions.map((q) => ({ ...q, researchKeywords: ["x"] })) }),
    undefined,
    "researchKeywords is app-only"
  );

  // Half a set is the failure this catches: 임신 100제 has a scene on all hundred, 결혼 100제 on
  // none, and both are fine. Ninety-nine of a hundred is somebody having lost one.
  for (const field of ["intent", "example", "whyItMatters", "mood"]) {
    const onAll = definePack({ ...base, questions: base.questions.map((q) => ({ ...q, [field]: "값" })) });
    assert.equal(onAll.questions[0][field], "값", `${field} on every question is allowed`);
    assert.throws(
      () => definePack({
        ...base,
        questions: base.questions.map((q, i) => (i === 0 ? { ...q, [field]: "값" } : q))
      }),
      undefined,
      `${field} on one of two questions is refused`
    );
  }

  // The same rule for the name a choice's value carries.
  const tagged = (q) => ({ ...q, choices: q.choices.map((c) => ({ ...c, valueLabel: "가치" })) });
  assert.ok(definePack({ ...base, questions: base.questions.map(tagged) }));
  assert.throws(
    () => definePack({ ...base, questions: base.questions.map((q, i) => (i === 0 ? tagged(q) : q)) }),
    undefined,
    "value labels on one question's choices and not the other's is refused"
  );

  // A section may introduce itself, and the line has to be real if it is there.
  assert.ok(definePack({ ...base, sections: [{ id: "s", title: "S", blurb: "이 파트는" }] }));
  assert.throws(() => definePack({ ...base, sections: [{ id: "s", title: "S", blurb: "  " }] }));
});
