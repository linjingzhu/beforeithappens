import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createAnswers } from "../server/answers.mjs";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { marriagePack } from "../src/questions.js";

const pack = { id: marriagePack.id, version: marriagePack.version };
const questionIds = ["home-01", "money-01"];
const choiceIdsByQuestion = {
  "home-01": ["home-rest", "home-social", "home-independent", "home-growth"],
  "money-01": ["money-save", "money-experience", "money-growth", "money-split"]
};

function system() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const answers = createAnswers({ store, questionIds, choiceIdsByQuestion, pack });
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
  return { store, couple, answers, auth, login, pair };
}

test("pack persist stays locked until an accepted partner exists", () => {
  const { answers, login } = system();
  assert.equal(answers.stateFor(null).error, "unauthenticated");
  const buyer = login("buyer@example.com");
  assert.equal(answers.stateFor(buyer.sessionId).error, "locked");
  assert.equal(answers.saveDraft(buyer.sessionId, { questionId: "home-01", draftChoice: "home-rest" }).error, "locked");
});

test("drafts and private notes autosave for the author only", () => {
  const { answers, pair } = system();
  const { buyer, partner } = pair();
  const saved = answers.saveDraft(buyer.sessionId, {
    questionId: "home-01",
    draftChoice: "home-rest",
    privateNote: "나만 볼 메모",
    index: 0
  });
  assert.equal(saved.ok, true);
  const buyerState = saved.state.questions["home-01"];
  assert.equal(buyerState.roles.a.draftChoice, "home-rest");
  assert.equal(buyerState.roles.a.privateNote, "나만 볼 메모");
  assert.equal(buyerState.roles.a.submittedChoice, null);
  assert.equal(buyerState.roles.b.draftChoice, null);
  assert.equal(buyerState.roles.b.privateNote, "");
  assert.equal(buyerState.roles.b.submittedChoice, null);
  assert.equal(buyerState.roles.b.completed, false);

  const partnerView = answers.stateFor(partner.sessionId);
  assert.equal(partnerView.ok, true);
  const partnerState = partnerView.state.questions["home-01"];
  assert.equal(partnerState.roles.b.draftChoice, null);
  assert.equal(partnerState.roles.b.privateNote, "");
  assert.equal(partnerState.roles.a.draftChoice, null);
  assert.equal(partnerState.roles.a.privateNote, "");
  assert.equal(partnerState.roles.a.completed, false);
});

test("submitted answers persist and reveal only after both members submit", () => {
  const { answers, pair } = system();
  const { buyer, partner } = pair();
  answers.saveDraft(buyer.sessionId, { questionId: "home-01", draftChoice: "home-rest", privateNote: "buyer note" });
  const buyerSubmit = answers.submit(buyer.sessionId, { questionId: "home-01" });
  assert.equal(buyerSubmit.ok, true);
  assert.equal(buyerSubmit.state.questions["home-01"].roles.a.submittedChoice, "home-rest");
  assert.equal(buyerSubmit.state.questions["home-01"].roles.b.submittedChoice, null);
  assert.equal(buyerSubmit.state.questions["home-01"].roles.b.completed, false);

  const partnerAfterBuyer = answers.stateFor(partner.sessionId).state.questions["home-01"];
  assert.equal(partnerAfterBuyer.roles.a.submittedChoice, null);
  assert.equal(partnerAfterBuyer.roles.a.draftChoice, null);
  assert.equal(partnerAfterBuyer.roles.a.privateNote, "");
  assert.equal(partnerAfterBuyer.roles.a.completed, true);

  answers.saveDraft(partner.sessionId, { questionId: "home-01", draftChoice: "home-social", privateNote: "partner note" });
  const partnerSubmit = answers.submit(partner.sessionId, { questionId: "home-01" });
  assert.equal(partnerSubmit.ok, true);
  assert.equal(partnerSubmit.state.questions["home-01"].roles.b.submittedChoice, "home-social");
  assert.equal(partnerSubmit.state.questions["home-01"].roles.a.submittedChoice, "home-rest");
  assert.equal(partnerSubmit.state.questions["home-01"].roles.a.privateNote, "");
  assert.equal(partnerSubmit.state.questions["home-01"].roles.b.privateNote, "partner note");

  const buyerAfter = answers.stateFor(buyer.sessionId).state.questions["home-01"];
  assert.equal(buyerAfter.roles.a.submittedChoice, "home-rest");
  assert.equal(buyerAfter.roles.b.submittedChoice, "home-social");
  assert.equal(buyerAfter.roles.a.privateNote, "buyer note");
  assert.equal(buyerAfter.roles.b.privateNote, "");
  assert.equal(buyerAfter.lock.roundNumber, 1);
  assert.equal(buyerAfter.lock.submittedChoices.a, "home-rest");
  assert.equal(buyerAfter.lock.submittedChoices.b, "home-social");
  assert.equal(buyerAfter.lock.privateNote, undefined);
});

test("agree and hold persist for the paired workspace", () => {
  const { answers, pair } = system();
  const { buyer, partner } = pair();
  answers.saveDraft(buyer.sessionId, { questionId: "home-01", draftChoice: "home-rest" });
  answers.submit(buyer.sessionId, { questionId: "home-01" });
  answers.saveDraft(partner.sessionId, { questionId: "home-01", draftChoice: "home-social" });
  answers.submit(partner.sessionId, { questionId: "home-01" });

  const proposed = answers.saveAgreement(buyer.sessionId, { questionId: "home-01", action: "propose", proposal: "주말엔 집을 쉬우는 곳으로" });
  assert.equal(proposed.ok, true);
  assert.equal(proposed.state.questions["home-01"].shared.status, "pending");
  assert.equal(proposed.state.questions["home-01"].shared.proposedBy, "a");
  assert.equal(proposed.state.questions["home-01"].shared.proposal, "주말엔 집을 쉬우는 곳으로");

  const partnerSees = answers.stateFor(partner.sessionId).state.questions["home-01"].shared;
  assert.equal(partnerSees.status, "pending");
  assert.equal(partnerSees.proposedBy, "a");

  const approved = answers.saveAgreement(partner.sessionId, { questionId: "home-01", action: "approve" });
  assert.equal(approved.state.questions["home-01"].shared.status, "agreed");
  assert.equal(approved.state.questions["home-01"].shared.approvedBy, "b");

  answers.saveDraft(buyer.sessionId, { questionId: "money-01", draftChoice: "money-save" });
  answers.submit(buyer.sessionId, { questionId: "money-01" });
  answers.saveDraft(partner.sessionId, { questionId: "money-01", draftChoice: "money-split" });
  answers.submit(partner.sessionId, { questionId: "money-01" });
  const held = answers.saveAgreement(buyer.sessionId, { questionId: "money-01", action: "deferred" });
  assert.equal(held.state.questions["money-01"].shared.status, "deferred");
  assert.equal(answers.stateFor(partner.sessionId).state.questions["money-01"].shared.status, "deferred");
});

function request(port, path, { method = "GET", body, cookie } = {}) {
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  }).then(async (response) => {
    const setCookie = response.headers.getSetCookie?.() || [];
    const json = await response.json().catch(() => ({}));
    return { status: response.status, json, setCookie };
  });
}

function sessionCookie(setCookie) {
  return setCookie.find((value) => value.startsWith("ab_session="))?.split(";")[0] || "";
}

test("HTTP pack routes persist drafts, submissions, and agree/hold for a logged-in pair", async () => {
  const store = createMemoryStore();
  const outbox = [];
  const couple = createCouple({ store });
  const answers = createAnswers({ store, questionIds, choiceIdsByQuestion, pack });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const server = createServer(createListener({ auth, couple, answers, root: process.cwd(), allowDevOutbox: true, outbox }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { port } = server.address();
    async function login(email) {
      await request(port, "/api/auth/magic-link", { method: "POST", body: { email } });
      const box = await request(port, "/api/dev/outbox");
      const item = box.json.items.find((entry) => entry.type === "magic-link" && entry.email === email);
      const token = new URL(item.url).searchParams.get("token");
      const consume = await request(port, "/api/auth/consume", { method: "POST", body: { token } });
      return sessionCookie(consume.setCookie);
    }

    const buyerCookie = await login("buyer@example.com");
    const locked = await request(port, "/api/pack/state", { cookie: buyerCookie });
    assert.equal(locked.status, 403);

    await request(port, "/api/invite", { method: "POST", cookie: buyerCookie, body: { email: "partner@example.com" } });
    const box = await request(port, "/api/dev/outbox");
    const inviteToken = new URL(box.json.items.find((entry) => entry.type === "invite").url).searchParams.get("token");
    const partnerCookie = await login("partner@example.com");
    const accepted = await request(port, "/api/invite/accept", { method: "POST", cookie: partnerCookie, body: { token: inviteToken } });
    assert.equal(accepted.status, 200);

    const draft = await request(port, "/api/pack/draft", {
      method: "PATCH",
      cookie: buyerCookie,
      body: { questionId: "home-01", draftChoice: "home-rest", privateNote: "secret" }
    });
    assert.equal(draft.status, 200);
    assert.equal(draft.json.state.questions["home-01"].roles.a.privateNote, "secret");

    const partnerState = await request(port, "/api/pack/state", { cookie: partnerCookie });
    assert.equal(partnerState.json.state.questions["home-01"].roles.a.privateNote, "");
    assert.equal(partnerState.json.state.questions["home-01"].roles.a.draftChoice, null);

    await request(port, "/api/pack/submit", { method: "POST", cookie: buyerCookie, body: { questionId: "home-01" } });
    await request(port, "/api/pack/draft", {
      method: "PATCH",
      cookie: partnerCookie,
      body: { questionId: "home-01", draftChoice: "home-growth" }
    });
    const both = await request(port, "/api/pack/submit", { method: "POST", cookie: partnerCookie, body: { questionId: "home-01" } });
    assert.equal(both.json.state.questions["home-01"].roles.a.submittedChoice, "home-rest");
    assert.equal(both.json.state.questions["home-01"].roles.b.submittedChoice, "home-growth");

    const agreed = await request(port, "/api/pack/agreement", {
      method: "POST",
      cookie: buyerCookie,
      body: { questionId: "home-01", action: "propose", proposal: "함께 쉬는 집을 기본으로" }
    });
    assert.equal(agreed.json.state.questions["home-01"].shared.status, "pending");
    const hold = await request(port, "/api/pack/agreement", {
      method: "POST",
      cookie: partnerCookie,
      body: { questionId: "home-01", action: "deferred" }
    });
    assert.equal(hold.status, 200);
    assert.equal(hold.json.state.questions["home-01"].shared.status, "deferred");
    assert.equal(hold.json.state.questions["home-01"].lock.submittedChoices.a, "home-rest");
    assert.equal(hold.json.state.questions["home-01"].lock.submittedChoices.b, "home-growth");
    assert.equal(JSON.stringify(hold.json.state.questions["home-01"].lock).includes("secret"), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("second submit writes an immutable public lock and a later change opens a new round", () => {
  const { answers, pair, store } = system();
  const { buyer, partner } = pair();
  answers.saveDraft(buyer.sessionId, { questionId: "home-01", draftChoice: "home-rest", privateNote: "buyer-secret" });
  answers.submit(buyer.sessionId, { questionId: "home-01" });
  answers.saveDraft(partner.sessionId, { questionId: "home-01", draftChoice: "home-social", privateNote: "partner-secret" });
  answers.submit(partner.sessionId, { questionId: "home-01" });

  const locks = store.snapshot().publicLocks;
  assert.equal(locks.length, 1);
  const firstLock = structuredClone(locks[0]);
  assert.equal(firstLock.roundNumber, 1);
  assert.equal(firstLock.submissions.a.choice, "home-rest");
  assert.equal(firstLock.submissions.b.choice, "home-social");
  assert.equal(JSON.stringify(firstLock).includes("buyer-secret"), false);
  assert.equal(JSON.stringify(firstLock).includes("partner-secret"), false);
  assert.equal(JSON.stringify(firstLock).includes("privateNote"), false);

  store.mutate((state) => {
    for (const answer of state.answers) {
      if (answer.questionId === "home-01" && answer.roundNumber === 1) answer.submittedChoice = "home-independent";
    }
  });
  const fromLock = answers.stateFor(partner.sessionId).state.questions["home-01"];
  assert.equal(fromLock.lock.submittedChoices.a, "home-rest");
  assert.equal(fromLock.lock.submittedChoices.b, "home-social");
  assert.equal(fromLock.roles.a.submittedChoice, "home-rest");
  assert.equal(fromLock.roles.b.submittedChoice, "home-social");

  const changed = answers.saveDraft(buyer.sessionId, { questionId: "home-01", draftChoice: "home-growth", privateNote: "new-private" });
  assert.equal(changed.ok, true);
  const rounds = store.snapshot().answerRounds.filter((row) => row.questionId === "home-01");
  assert.equal(rounds.some((row) => row.roundNumber === 2), true);
  const lockAfterChange = store.snapshot().publicLocks.find((row) => row.roundNumber === 1);
  assert.deepEqual(lockAfterChange.submissions, firstLock.submissions);
  assert.equal(lockAfterChange.lockedAt, firstLock.lockedAt);
  assert.equal(lockAfterChange.id, firstLock.id);
  const partnerSees = answers.stateFor(partner.sessionId).state.questions["home-01"];
  assert.equal(partnerSees.lock.submittedChoices.a, "home-rest");
  assert.equal(partnerSees.lock.submittedChoices.b, "home-social");
  assert.equal(partnerSees.roles.a.draftChoice, null);
  assert.equal(partnerSees.roles.a.privateNote, "");

  answers.submit(buyer.sessionId, { questionId: "home-01" });
  answers.saveDraft(partner.sessionId, { questionId: "home-01", draftChoice: "home-independent" });
  answers.submit(partner.sessionId, { questionId: "home-01" });
  const allLocks = store.snapshot().publicLocks;
  assert.equal(allLocks.length, 2);
  const stillFirst = allLocks.find((row) => row.id === firstLock.id);
  assert.deepEqual(stillFirst.submissions, firstLock.submissions);
  const second = allLocks.find((row) => row.roundNumber === 2);
  assert.equal(second.submissions.a.choice, "home-growth");
  assert.equal(second.submissions.b.choice, "home-independent");
  const latest = answers.stateFor(buyer.sessionId).state.questions["home-01"];
  assert.equal(latest.lock.roundNumber, 2);
  assert.equal(latest.lock.submittedChoices.a, "home-growth");
  assert.equal(latest.roles.a.privateNote, "new-private");
  assert.equal(latest.roles.b.privateNote, "");
});
