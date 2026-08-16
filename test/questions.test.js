import test from "node:test";
import assert from "node:assert/strict";
import { questions } from "../src/questions.js";

test("question IDs are unique", () => {
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
});

test("every question follows the shared four-choice format", () => {
  for (const question of questions) {
    assert.equal(question.choices.length, 4);
    assert.ok(question.title && question.intent && question.example);
    assert.ok(question.choices.every((choice) => choice.trim().length > 0));
  }
});
