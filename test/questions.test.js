import test from "node:test";
import assert from "node:assert/strict";
import { marriagePack, questions } from "../src/questions.js";

test("question IDs are unique", () => {
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
});

test("every question follows the shared four-choice format", () => {
  for (const question of questions) {
    assert.equal(question.choices.length, 4);
    assert.ok(question.title && question.intent && question.example);
    assert.ok(question.whyItMatters && question.researchKeywords.length > 0);
    assert.ok(question.choices.every((choice) => choice.id && choice.label.trim().length > 0));
    assert.equal(new Set(question.choices.map((choice) => choice.id)).size, 4);
  }
});

test("published pack metadata and content IDs are stable and unique", () => {
  assert.equal(marriagePack.id, "marriage-preparation");
  assert.match(marriagePack.version, /^2026\.08-preview\.1$/);
  assert.equal(new Set(marriagePack.sections.map((section) => section.id)).size, marriagePack.sections.length);
  assert.deepEqual(questions.map((question) => question.id), ["home-01", "money-01", "conflict-01"]);
});

test("legacy numeric choices migrate to the matching stable choice ID", () => {
  const question = questions[0];
  assert.equal(question.choices[1].id, "home-social");
});
