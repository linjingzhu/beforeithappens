import test from "node:test";
import assert from "node:assert/strict";
import { PACK_AUDIENCE, definePack } from "../src/pack-schema.js";
import {
  allPacks,
  catalogWithContent,
  findPack,
  hasContent,
  isCouplePack,
  packByCatalogId,
  packByContentId,
  packIdentity,
  packsFor,
  questionsFor
} from "../src/packs.js";
import { PACK_LIST_ROWS } from "../src/pair-code.js";
import { marriagePack, questions } from "../src/questions.js";

/** A minimal pack that satisfies every rule, so each test can break exactly one thing. */
function validPack(overrides = {}) {
  return {
    id: "test-pack",
    catalogId: "marriage",
    audience: PACK_AUDIENCE.couple,
    version: "1.0.0",
    locale: "ko-KR",
    title: "Test Pack",
    freeQuestionCount: 1,
    sections: [
      { id: "a", title: "첫 장" },
      { id: "b", title: "둘째 장" }
    ],
    questions: [
      question("q-2", "b"),
      question("q-1", "a")
    ],
    ...overrides
  };
}

function question(id, sectionId, choiceIds = null) {
  const ids = choiceIds || [`${id}-1`, `${id}-2`, `${id}-3`, `${id}-4`];
  return {
    id,
    sectionId,
    title: `${id} 제목`,
    intent: `${id} 의도`,
    example: `${id} 예시`,
    whyItMatters: `${id} 이유`,
    researchKeywords: ["키워드"],
    choices: ids.map((choiceId, index) => ({ id: choiceId, label: `${id} 선택 ${index + 1}` }))
  };
}

test("defining a pack orders it by section, renumbers it, and attaches the chapter", () => {
  const pack = definePack(validPack());
  assert.deepEqual(pack.orderedQuestions.map((q) => q.id), ["q-1", "q-2"], "section order wins over array order");
  assert.deepEqual(pack.orderedQuestions.map((q) => q.number), [1, 2]);
  assert.equal(pack.orderedQuestions[0].chapter, "첫 장");
  assert.equal(pack.orderedQuestions[1].chapter, "둘째 장");
  assert.deepEqual(pack.questions.map((q) => q.id), ["q-2", "q-1"], "the raw list is left as written");
});

test("a pack that breaks the shared format is refused at definition, not in a screen", () => {
  const cases = [
    ["no id", { id: "" }],
    ["no catalogId", { catalogId: "" }],
    ["no version", { version: "" }],
    ["no sections", { sections: [] }],
    ["no questions", { questions: [] }],
    ["unknown audience", { audience: "crowd" }],
    ["duplicate section id", { sections: [{ id: "a", title: "1" }, { id: "a", title: "2" }] }],
    ["duplicate question id", { questions: [question("q-1", "a"), question("q-1", "b")] }],
    ["question in an unknown section", { questions: [question("q-1", "nope"), question("q-2", "b")] }],
    ["three choices", { questions: [{ ...question("q-1", "a"), choices: question("q-1", "a").choices.slice(0, 3) }, question("q-2", "b")] }],
    ["free count at or past the end", { freeQuestionCount: 2 }],
    ["negative free count", { freeQuestionCount: -1 }]
  ];
  for (const [name, override] of cases) {
    assert.throws(() => definePack(validPack(override)), /pack /, name);
  }
});

test("a choice id repeated anywhere in the pack is refused, because answers store it", () => {
  const shared = ["dup-1", "dup-2", "dup-3", "dup-4"];
  assert.throws(
    () => definePack(validPack({ questions: [question("q-1", "a", shared), question("q-2", "b", shared)] })),
    /duplicate choice id/,
    "two questions sharing choice ids would make a stored reply ambiguous"
  );
});

test("a missing text field is refused rather than rendering as an empty line", () => {
  for (const field of ["title", "intent", "example", "whyItMatters"]) {
    const broken = { ...question("q-1", "a"), [field]: "" };
    assert.throws(() => definePack(validPack({ questions: [broken, question("q-2", "b")] })), new RegExp(field), field);
  }
  const noKeywords = { ...question("q-1", "a"), researchKeywords: [] };
  assert.throws(() => definePack(validPack({ questions: [noKeywords, question("q-2", "b")] })), /researchKeywords/);
});

test("a defined pack cannot be edited afterwards", () => {
  const pack = definePack(validPack());
  assert.throws(() => { pack.title = "changed"; }, TypeError);
  assert.throws(() => { pack.orderedQuestions[0].number = 99; }, TypeError);
});

test("the marriage pack still exports exactly what sixteen modules import", () => {
  assert.equal(marriagePack.id, "marriage-preparation");
  assert.equal(marriagePack.version, "2026.08-preview.2");
  assert.equal(questions.length, 12);
  assert.deepEqual(questions.map((q) => q.number), Array.from({ length: 12 }, (_, i) => i + 1));
  assert.equal(questions, marriagePack.orderedQuestions, "one derived list, not two that can diverge");
});

test("the registry finds a pack by either of its two ids", () => {
  assert.equal(packByCatalogId("marriage")?.id, "marriage-preparation");
  assert.equal(packByContentId("marriage-preparation")?.catalogId, "marriage");
  assert.equal(findPack("marriage")?.id, findPack("marriage-preparation")?.id);
  assert.equal(findPack("nope"), null);
  assert.equal(findPack(""), null);
  assert.equal(findPack(undefined), null);

  assert.equal(hasContent("marriage"), true);
  assert.equal(hasContent("dating"), false, "a coming-soon pack has no content yet");
  assert.deepEqual(packIdentity("marriage"), { id: "marriage-preparation", version: "2026.08-preview.2" });
  assert.equal(packIdentity("dating"), null);
});

test("audience is carried, because a solo pack must never enter the two-person machinery", () => {
  assert.equal(marriagePack.audience, PACK_AUDIENCE.couple);
  assert.equal(isCouplePack("marriage"), true);
  assert.equal(isCouplePack("dating"), false, "an unregistered pack is not a couple pack by default");
  assert.deepEqual(packsFor(PACK_AUDIENCE.couple).map((p) => p.id), ["marriage-preparation"]);
  assert.deepEqual(packsFor(PACK_AUDIENCE.solo), [], "no solo pack is registered yet");

  const solo = definePack(validPack({ id: "solo-pack", audience: PACK_AUDIENCE.solo }));
  assert.equal(solo.audience, PACK_AUDIENCE.solo);
});

test("questionsFor returns the ordered list, and nothing for a pack that does not exist", () => {
  assert.deepEqual(questionsFor("marriage").map((q) => q.id), questions.map((q) => q.id));
  assert.deepEqual(questionsFor("marriage-preparation"), questionsFor("marriage"), "either id, same answer");
  assert.deepEqual(questionsFor("dating"), []);
  assert.deepEqual(questionsFor(""), []);
});

test("every pack the app shows as open has questions behind it", () => {
  // The registry throws at import if this is violated; this states the invariant so a reader
  // knows it is deliberate, and catches a catalog row flipped to open without content.
  for (const row of PACK_LIST_ROWS) {
    if (row.open) assert.ok(hasContent(row.id), `${row.id} is open but empty`);
  }
  const joined = catalogWithContent();
  assert.equal(joined.length, PACK_LIST_ROWS.length);
  assert.deepEqual(joined.map((r) => r.id), PACK_LIST_ROWS.map((r) => r.id), "catalog order is preserved");
  assert.equal(joined.find((r) => r.id === "marriage").questionCount, 12);
  assert.equal(joined.find((r) => r.id === "dating").questionCount, 0);
  assert.equal(joined.find((r) => r.id === "dating").hasContent, false);
});

test("every registered pack points at a real catalog row", () => {
  const ids = new Set(PACK_LIST_ROWS.map((row) => row.id));
  for (const pack of allPacks()) {
    assert.ok(ids.has(pack.catalogId), `${pack.id} has an unknown catalogId ${pack.catalogId}`);
  }
});
