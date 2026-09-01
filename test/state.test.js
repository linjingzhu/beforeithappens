import test from "node:test";
import assert from "node:assert/strict";
import { buildSharedResults, canApproveAgreement, comparisonFor, createInitialState, isChapterLocked, isRevealed, normalizeState, submittedCount } from "../src/state.js";
import { PACK_LOCK_COPY } from "../src/pair-code.js";
import { escapeHtml } from "../src/html.js";

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

test("shared results include submitted answers and agreements but never private notes", () => {
  const state = createInitialState(ids);
  state.questions.q1.roles.a.submittedChoice = "q1-a";
  state.questions.q1.roles.b.submittedChoice = "q1-b";
  state.questions.q1.roles.a.privateNote = "PRIVATE_A_MARKER";
  state.questions.q1.roles.b.privateNote = "PRIVATE_B_MARKER";
  state.questions.q1.roles.a.draftChoice = "DRAFT_SECRET_MARKER";
  state.questions.q1.shared = { proposal: "매주 일요일에 확인한다", proposedBy: "a", approvedBy: "b", status: "agreed" };
  const result = buildSharedResults(state, ids, choiceIds);
  assert.equal(result.complete, false);
  assert.equal(result.revealedCount, 1);
  assert.equal(result.discussCount, 1);
  assert.equal(result.agreedCount, 1);
  assert.equal(/PRIVATE_|DRAFT_SECRET/.test(JSON.stringify(result)), false);
});

test("completion requires every question to be revealed", () => {
  const state = createInitialState(ids);
  for (const id of ids) {
    state.questions[id].roles.a.submittedChoice = `${id}-a`;
    state.questions[id].roles.b.submittedChoice = `${id}-a`;
  }
  const result = buildSharedResults(state, ids, choiceIds);
  assert.equal(result.complete, true);
  assert.equal(result.alignedCount, 2);
  assert.equal(result.items.length, 2);
  assert.equal(result.alignedCount + result.discussCount, ids.length);
  assert.equal(result.agreedCount + result.deferredCount + result.pendingCount + result.noneCount, ids.length);
});

test("unknown choices and another pack version fail closed", () => {
  const state = createInitialState(ids, pack);
  for (const id of ids) {
    state.questions[id].roles.a.submittedChoice = `${id}-a`;
    state.questions[id].roles.b.submittedChoice = `${id}-a`;
  }
  state.questions.q2.roles.b.submittedChoice = "unknown-choice";
  assert.equal(buildSharedResults(state, ids, choiceIds, pack).complete, false);
  state.questions.q2.roles.b.submittedChoice = "q2-a";
  assert.equal(buildSharedResults(state, ids, choiceIds, { id: "marriage", version: "2" }).complete, false);
});

test("malformed or self-approved agreements are never presented as shared", () => {
  const state = createInitialState(["q1"]);
  state.questions.q1.roles.a.submittedChoice = "q1-a";
  state.questions.q1.roles.b.submittedChoice = "q1-b";
  state.questions.q1.shared = { proposal: "<img src=x onerror=alert(1)>", proposedBy: "a", approvedBy: "a", status: "agreed" };
  const result = buildSharedResults(state, ["q1"], { q1: choiceIds.q1 });
  assert.equal(result.agreedCount, 0);
  assert.equal(result.noneCount, 1);
  assert.equal(result.items[0].agreement.text, "");
});

test("the free-pack gate requires all 12 revealed questions and never accepts an empty pack", () => {
  const twelveIds = Array.from({ length: 12 }, (_, index) => `question-${index + 1}`);
  const allowed = Object.fromEntries(twelveIds.map((id) => [id, [`${id}-a`, `${id}-b`]]));
  const state = createInitialState(twelveIds);
  for (const id of twelveIds) {
    state.questions[id].roles.a.submittedChoice = `${id}-a`;
    state.questions[id].roles.b.submittedChoice = `${id}-b`;
  }
  assert.equal(buildSharedResults(state, twelveIds, allowed).complete, true);
  state.questions[twelveIds[11]].roles.b.submittedChoice = null;
  assert.equal(buildSharedResults(state, twelveIds, allowed).complete, false);
  assert.equal(buildSharedResults(createInitialState([]), [], {}).complete, false);
});

test("approved agreement HTML is escaped before insertion into results markup", () => {
  const malicious = `<img src=x onerror="globalThis.pwned=true">`;
  const state = createInitialState(["q1"]);
  state.questions.q1.roles.a.submittedChoice = "q1-a";
  state.questions.q1.roles.b.submittedChoice = "q1-b";
  state.questions.q1.shared = { proposal: malicious, proposedBy: "a", approvedBy: "b", status: "agreed" };
  const result = buildSharedResults(state, ["q1"], { q1: choiceIds.q1 });
  assert.equal(result.items[0].agreement.text, malicious);
  assert.equal(escapeHtml(result.items[0].agreement.text), "&lt;img src=x onerror=&quot;globalThis.pwned=true&quot;&gt;");
});

test("locked chapters are the ones past the free sample, and entitlement opens them", () => {
  for (const index of [0, 1, 2]) assert.equal(isChapterLocked(index, false), false);
  for (const index of [3, 7, 11]) assert.equal(isChapterLocked(index, false), true);
  for (const index of [3, 7, 11]) assert.equal(isChapterLocked(index, true), false);
  assert.equal(isChapterLocked(-1, false), false);
});

test("the web pack view shows a locked chapter instead of ignoring the click", async () => {
  const { readFile } = await import("node:fs/promises");
  const app = await readFile("src/app.js", "utf8");
  assert.match(app, /const locked = !remainingQuestionOpen\(index\)/);
  assert.match(app, /locked \? "locked" : ""/);
  assert.match(app, /locked \? PACK_LOCK_COPY\.status/);
  assert.match(app, /chapter-lock-note/);
  assert.equal(PACK_LOCK_COPY.status, "잠김");
  const css = await readFile("src/accessibility.css", "utf8");
  assert.match(css, /\.chapter\.locked/);
  assert.match(css, /\.chapter-lock-note/);
});
