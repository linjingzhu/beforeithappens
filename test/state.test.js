import test from "node:test";
import assert from "node:assert/strict";
import { canApproveAgreement, comparisonFor, createInitialState, isRevealed, normalizeState, submittedCount } from "../src/state.js";

const ids = ["q1", "q2"];
const choiceIds = { q1: ["q1-a", "q1-b", "q1-c", "q1-d"], q2: ["q2-a", "q2-b", "q2-c", "q2-d"] };
const pack = { id: "marriage", version: "1" };

test("drafts never reveal and both submitted snapshots are required", () => {
  const state = createInitialState(ids);
  state.questions.q1.roles.a.draftChoice = "q1-b";
  assert.equal(isRevealed(state.questions.q1), false);
  state.questions.q1.roles.a.submittedChoice = "q1-b";
  state.questions.q1.roles.a.submittedAt = "2026-08-16T00:00:00.000Z";
  assert.equal(isRevealed(state.questions.q1), false);
  state.questions.q1.roles.b.submittedChoice = "q1-c";
  state.questions.q1.roles.b.submittedAt = "2026-08-16T00:01:00.000Z";
  assert.equal(isRevealed(state.questions.q1), true);
  assert.equal(comparisonFor(state.questions.q1).key, "discuss");
});

test("matching submissions use neutral aligned language", () => {
  const state = createInitialState(ids);
  state.questions.q1.roles.a.submittedChoice = "q1-d";
  state.questions.q1.roles.b.submittedChoice = "q1-d";
  assert.equal(comparisonFor(state.questions.q1).key, "aligned");
});

test("normalization rejects malformed values and self approval", () => {
  const state = normalizeState({ index: 99, activeRole: "admin", questions: { q1: { roles: { a: { draftChoice: "missing", privateNote: 5, submittedChoice: "missing" }, b: { draftChoice: 1, privateNote: "ok", submittedChoice: 1, submittedAt: "now" } }, shared: { proposal: "rule", proposedBy: "a", approvedBy: "a", status: "agreed" } } } }, ids, choiceIds, pack);
  assert.equal(state.index, 0);
  assert.equal(state.activeRole, "a");
  assert.equal(state.questions.q1.roles.a.submittedChoice, null);
  assert.equal(state.questions.q1.roles.b.submittedChoice, "q1-b");
  assert.equal(state.questions.q1.shared.status, "none");
  assert.equal(state.questions.q1.shared.approvedBy, null);
  assert.equal(submittedCount(state, "b", ids), 1);
});

test("private notes are role-scoped and excluded from comparison result", () => {
  const state = createInitialState(ids);
  state.questions.q1.roles.a.privateNote = "a secret";
  state.questions.q1.roles.b.privateNote = "b secret";
  state.questions.q1.roles.a.submittedChoice = "q1-a";
  state.questions.q1.roles.b.submittedChoice = "q1-b";
  const result = comparisonFor(state.questions.q1);
  assert.equal(JSON.stringify(result).includes("secret"), false);
});

test("an unsubmitted agreement draft does not become pending after reload", () => {
  const state = createInitialState(ids);
  state.questions.q1.shared.proposal = "draft only";
  const restored = normalizeState(state, ids, choiceIds);
  assert.equal(restored.questions.q1.shared.status, "none");
  assert.equal(restored.questions.q1.shared.proposedBy, null);
});

test("only the non-proposer can approve a valid pending proposal", () => {
  const shared = { proposal: "매달 함께 예산을 확인한다", proposedBy: "a", approvedBy: null, status: "pending" };
  assert.equal(canApproveAgreement(shared, "a"), false);
  assert.equal(canApproveAgreement(shared, "b"), true);
  shared.proposedBy = null;
  assert.equal(canApproveAgreement(shared, "b"), false);
});

test("answers from another pack version are not silently applied", () => {
  const old = createInitialState(ids, { id: "marriage", version: "old" });
  old.questions.q1.roles.a.submittedChoice = "q1-a";
  const restored = normalizeState(old, ids, choiceIds, pack);
  assert.equal(restored.packVersion, "1");
  assert.equal(restored.questions.q1.roles.a.submittedChoice, null);
});
