import test from "node:test";
import assert from "node:assert/strict";
import { loadMarriagePack } from "../contract/pack-catalog.js";
import { marriagePack, questions } from "../../../src/questions.js";

test("bundled marriage pack catalog matches the web QuestionPack", () => {
  const pack = loadMarriagePack();
  assert.equal(pack.id, marriagePack.id);
  assert.equal(pack.version, marriagePack.version);
  assert.equal(pack.questions.length, questions.length);
  assert.deepEqual(pack.questionIds, questions.map((question) => question.id));
  for (const question of questions) {
    const bundled = pack.questions.find((item) => item.id === question.id);
    assert.equal(bundled.title, question.title);
    assert.deepEqual(bundled.choices.map((choice) => choice.id), question.choices.map((choice) => choice.id));
  }
});
