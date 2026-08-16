import test from "node:test";
import assert from "node:assert/strict";
import { marriagePack, questions } from "../src/questions.js";

test("question IDs are unique", () => {
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
});

test("every question follows the shared four-choice format", () => {
  const sectionIds = new Set(marriagePack.sections.map((section) => section.id));
  const allChoiceIds = [];
  for (const question of questions) {
    assert.equal(question.choices.length, 4);
    assert.ok(sectionIds.has(question.sectionId));
    assert.ok(question.title && question.intent && question.example);
    assert.ok(question.whyItMatters && question.researchKeywords.length > 0);
    assert.ok(question.choices.every((choice) => choice.id && choice.label.trim().length > 0));
    assert.equal(new Set(question.choices.map((choice) => choice.id)).size, 4);
    assert.equal(new Set(question.choices.map((choice) => choice.label.trim())).size, 4);
    allChoiceIds.push(...question.choices.map((choice) => choice.id));
  }
  assert.equal(new Set(allChoiceIds).size, allChoiceIds.length);
  assert.deepEqual(questions.map((question) => question.number), Array.from({ length: questions.length }, (_, index) => index + 1));
});

test("published pack metadata and content IDs are stable and unique", () => {
  assert.equal(marriagePack.id, "marriage-preparation");
  assert.match(marriagePack.version, /^2026\.08-preview\.2$/);
  assert.equal(marriagePack.locale, "ko-KR");
  assert.equal(marriagePack.freeQuestionCount, 12);
  assert.equal(marriagePack.questions.length, 12);
  assert.equal(new Set(marriagePack.sections.map((section) => section.id)).size, marriagePack.sections.length);
  for (const section of marriagePack.sections) assert.equal(questions.filter((question) => question.sectionId === section.id).length, 2);
  assert.deepEqual(questions.map((question) => question.id), ["home-01", "home-02", "connection-01", "connection-02", "money-01", "money-02", "family-01", "family-02", "conflict-01", "conflict-02", "future-01", "future-02"]);
});

test("legacy numeric choices migrate to the matching stable choice ID", () => {
  const question = questions[0];
  assert.equal(question.choices[1].id, "home-social");
});
