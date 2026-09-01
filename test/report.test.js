import test from "node:test";
import assert from "node:assert/strict";
import { createAnswers } from "../server/answers.mjs";
import { createAuth } from "../server/auth.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { COMPARISON_OUTCOMES, SHARED_COLLECTIONS, createReport, readSharedState } from "../server/report.mjs";

const pack = { id: "marriage-preparation", version: "2026.08-preview.2" };
const questionIds = ["q1", "q2", "q3"];
const choiceIdsByQuestion = {
  q1: ["q1-a", "q1-b"],
  q2: ["q2-a", "q2-b"],
  q3: ["q3-a", "q3-b"]
};

const BUYER_NOTE = "PRIVATE-NOTE-BUYER-나만-보는-메모";
const PARTNER_NOTE = "PRIVATE-NOTE-PARTNER-나만-보는-메모";

function system() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const answers = createAnswers({ store, questionIds, choiceIdsByQuestion, pack });
  const report = createReport({ store, questionIds, pack });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  function login(email) {
    return auth.consumeMagicLink(auth.requestMagicLink(email).token);
  }
  function pair() {
    const buyer = login("buyer@example.com");
    const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
    const partner = login("partner@example.com");
    assert.equal(couple.acceptInvite(partner.sessionId, invite.token).ok, true);
    return { buyer, partner };
  }
  function lockRound(buyer, partner, questionId, buyerChoice, partnerChoice) {
    assert.equal(answers.saveDraft(buyer.sessionId, { questionId, draftChoice: buyerChoice, privateNote: BUYER_NOTE }).ok, true);
    assert.equal(answers.submit(buyer.sessionId, { questionId }).ok, true);
    assert.equal(answers.saveDraft(partner.sessionId, { questionId, draftChoice: partnerChoice, privateNote: PARTNER_NOTE }).ok, true);
    assert.equal(answers.submit(partner.sessionId, { questionId }).ok, true);
  }
  return { store, couple, answers, report, auth, login, pair, lockRound };
}

function paired() {
  const parts = system();
  const { buyer, partner } = parts.pair();
  parts.lockRound(buyer, partner, "q1", "q1-a", "q1-a");
  parts.lockRound(buyer, partner, "q2", "q2-a", "q2-b");
  assert.equal(parts.answers.saveAgreement(buyer.sessionId, { questionId: "q2", action: "propose", proposal: "명절은 해마다 번갈아 가기로." }).ok, true);
  assert.equal(parts.answers.saveAgreement(partner.sessionId, { questionId: "q2", action: "approve" }).ok, true);
  return { ...parts, buyer, partner };
}

function collectStrings(value, found = []) {
  if (typeof value === "string") found.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, found));
  else if (value && typeof value === "object") Object.values(value).forEach((item) => collectStrings(item, found));
  return found;
}

function collectKeys(value, found = []) {
  if (Array.isArray(value)) value.forEach((item) => collectKeys(item, found));
  else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      found.push(key);
      collectKeys(item, found);
    }
  }
  return found;
}

test("a report query cannot reach a private note even when it asks for everything", () => {
  const { store } = paired();
  assert.deepEqual(store.snapshot().privateNotes.map((row) => row.text).filter(Boolean).sort(), [BUYER_NOTE, BUYER_NOTE, PARTNER_NOTE, PARTNER_NOTE].sort());

  const shared = readSharedState(store);
  assert.deepEqual(Object.keys(shared), [...SHARED_COLLECTIONS]);

  // This is the query a future author would write if they forgot the boundary. It must not
  // return a note; it must not return anything at all.
  assert.throws(
    () => shared.privateNotes.filter((row) => row.text),
    /report queries may not read "privateNotes"/
  );
  // Drafts and unsubmitted selections are equally out of reach.
  assert.throws(() => shared.answers, /report queries may not read "answers"/);
  // So is every identity collection.
  for (const collection of ["users", "sessions", "identities", "magicLinks", "members", "invitations", "progress"]) {
    assert.throws(() => shared[collection], new RegExp(`report queries may not read "${collection}"`));
  }
  // And the window is read-only, so nobody can widen it in place.
  assert.throws(() => { shared.privateNotes = []; }, /read-only/);
});

test("the report carries shared content only: no notes, no drafts, no identity", () => {
  const { report, buyer, store } = paired();
  const view = report.viewFor(buyer.sessionId);
  assert.equal(view.ok, true);

  const strings = collectStrings(view.report);
  assert.equal(strings.some((value) => value.includes("PRIVATE-NOTE")), false);
  for (const key of collectKeys(view.report)) {
    assert.equal(/note|draft/i.test(key), false, `report exposes a ${key} field`);
  }
  const serialized = JSON.stringify(view.report);
  for (const user of store.snapshot().users) {
    assert.equal(serialized.includes(user.id), false, "report exposes a user id");
    assert.equal(serialized.includes(user.email), false, "report exposes an email");
  }
});

test("submitted selections, comparison outcomes and agreements are recorded in the fixed vocabulary", () => {
  const { report, buyer } = paired();
  const { report: snapshot } = report.viewFor(buyer.sessionId);

  assert.equal(snapshot.packId, pack.id);
  assert.equal(snapshot.packVersion, pack.version);
  assert.equal(snapshot.complete, false);
  assert.equal(snapshot.items.length, 2);
  assert.deepEqual(snapshot.items.map((item) => item.questionId), ["q1", "q2"]);

  const [first, second] = snapshot.items;
  assert.deepEqual(first.submittedChoices, { a: "q1-a", b: "q1-a" });
  assert.equal(first.comparison, "ALIGNED");
  assert.equal(first.agreement.status, "NONE");
  assert.equal(first.agreement.text, "");

  assert.deepEqual(second.submittedChoices, { a: "q2-a", b: "q2-b" });
  assert.equal(second.comparison, "DISCUSS");
  assert.equal(second.agreement.status, "AGREED");
  assert.equal(second.agreement.text, "명절은 해마다 번갈아 가기로.");
  assert.equal(second.agreement.proposedBy, "a");
  assert.equal(second.agreement.approvedBy, "b");

  for (const item of snapshot.items) {
    assert.equal(COMPARISON_OUTCOMES.includes(item.comparison), true);
  }
  assert.deepEqual(snapshot.totals.comparison, { ALIGNED: 1, CLOSE: 0, DISCUSS: 1, NEUTRAL: 0, UNRATED: 0 });
  assert.deepEqual(snapshot.totals.agreement, { AGREED: 1, DEFERRED: 0, PENDING: 0, NONE: 1 });
  assert.equal(snapshot.totals.questions, 3);
  assert.equal(snapshot.totals.recorded, 2);
  // No score, no diagnosis, no probability anywhere in the record.
  for (const key of collectKeys(snapshot)) {
    assert.equal(/score|probability|diagnos|percent|rank/i.test(key), false, `report exposes a ${key} field`);
  }
});

test("a pending proposal is reported as pending without publishing its text", () => {
  const { report, answers, buyer, partner } = paired();
  assert.equal(answers.saveAgreement(buyer.sessionId, { questionId: "q1", action: "propose", proposal: "아직 합의 전 제안" }).ok, true);
  const pending = report.viewFor(partner.sessionId).report.items.find((item) => item.questionId === "q1");
  assert.equal(pending.agreement.status, "PENDING");
  assert.equal(pending.agreement.text, "");
  assert.equal(pending.agreement.proposedBy, "a");
  assert.equal(pending.agreement.approvedBy, null);

  assert.equal(answers.saveAgreement(partner.sessionId, { questionId: "q1", action: "deferred" }).ok, true);
  const deferred = report.viewFor(partner.sessionId).report.items.find((item) => item.questionId === "q1");
  assert.equal(deferred.agreement.status, "DEFERRED");
  assert.equal(deferred.agreement.text, "");
});

test("the report is reproducible: same content, same id; new agreement, new id", () => {
  const { report, answers, buyer, partner, store } = paired();
  const first = report.viewFor(buyer.sessionId).report;
  const again = report.viewFor(partner.sessionId).report;
  assert.equal(first.id, again.id);
  assert.equal(first.contentHash, again.contentHash);
  assert.equal(first.id, `rep_${first.contentHash}`);

  const stored = report.generate(buyer.sessionId);
  assert.equal(stored.ok, true);
  assert.equal(stored.reused, false);
  const replay = report.generate(buyer.sessionId);
  assert.equal(replay.reused, true);
  assert.equal(store.snapshot().reportSnapshots.length, 1);
  assert.equal(store.snapshot().reportSnapshots[0].id, first.id);

  assert.equal(answers.saveAgreement(buyer.sessionId, { questionId: "q1", action: "propose", proposal: "여유 자금은 절반씩." }).ok, true);
  assert.equal(answers.saveAgreement(partner.sessionId, { questionId: "q1", action: "approve" }).ok, true);
  const changed = report.viewFor(buyer.sessionId).report;
  assert.notEqual(changed.contentHash, first.contentHash);
  assert.equal(report.generate(buyer.sessionId).reused, false);
  assert.equal(store.snapshot().reportSnapshots.length, 2);
  assert.deepEqual(report.listFor(buyer.sessionId).reports.map((row) => row.id), [changed.id, first.id]);
});

test("a later round supersedes the locked one and the report says so", () => {
  const { report, answers, buyer, partner, lockRound } = paired();
  assert.equal(answers.saveDraft(buyer.sessionId, { questionId: "q1", draftChoice: "q1-b" }).ok, true);
  lockRound(buyer, partner, "q1", "q1-b", "q1-b");
  const item = report.viewFor(buyer.sessionId).report.items.find((row) => row.questionId === "q1");
  assert.equal(item.roundNumber, 2);
  assert.equal(item.supersededRounds, 1);
  assert.deepEqual(item.submittedChoices, { a: "q1-b", b: "q1-b" });
});

test("a report is fixed to one pack version", () => {
  const { report, buyer, store } = paired();
  const workspaceId = report.viewFor(buyer.sessionId).report.workspaceId;
  const other = report.buildForWorkspace(workspaceId, { packVersion: "2027.01-next" });
  assert.equal(other.ok, true);
  assert.equal(other.report.items.length, 0);
  assert.equal(other.report.packVersion, "2027.01-next");
  assert.equal(other.report.totals.recorded, 0);
  assert.equal(store.snapshot().publicLocks.every((row) => row.packVersion === pack.version), true);
});

test("a report needs a signed-in member of a paired workspace", () => {
  const { report, login } = system();
  assert.equal(report.viewFor(null).error, "unauthenticated");
  assert.equal(report.viewFor("ses_missing").error, "unauthenticated");
  assert.equal(report.generate("ses_missing").error, "unauthenticated");
  const alone = login("alone@example.com");
  assert.equal(report.viewFor(alone.sessionId).error, "locked");
  assert.equal(report.listFor(alone.sessionId).error, "locked");
  assert.equal(report.buildForWorkspace("ws_missing").error, "invalid-workspace");
});

test("an agreement whose author is deleted keeps the text and loses the pointer", () => {
  const { report, buyer, store } = paired();
  const workspaceId = report.viewFor(buyer.sessionId).report.workspaceId;
  store.mutate((state) => {
    for (const row of state.agreements) row.approvedByUserId = null;
  });
  const item = report.buildForWorkspace(workspaceId).report.items.find((row) => row.questionId === "q2");
  assert.equal(item.agreement.status, "NONE");
  assert.equal(item.agreement.text, "");
});
