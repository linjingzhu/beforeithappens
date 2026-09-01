import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createAnswers } from "../server/answers.mjs";
import { createAuth } from "../server/auth.mjs";
import { createEntitlement } from "../server/entitlement.mjs";
import { createListener } from "../server/app.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { createHostPack } from "../mobile/pack/host-mount.js";
import { loadMarriagePack } from "../mobile/pack/contract/pack-catalog.js";
import { marriagePack, questions } from "../src/questions.js";

const pack = { id: marriagePack.id, version: marriagePack.version };
const questionIds = questions.map((question) => question.id);
const choiceIdsByQuestion = Object.fromEntries(
  questions.map((question) => [question.id, question.choices.map((choice) => choice.id)])
);

/**
 * One real server, two real host controllers on two real session cookies. Nothing here
 * simulates a partner: every answer is a separate HTTP call on its own login.
 */
async function pairedSystem() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const entitlement = createEntitlement({ store, pack });
  const answers = createAnswers({ store, questionIds, choiceIdsByQuestion, pack, entitlement });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const login = (email) => auth.consumeMagicLink(auth.requestMagicLink(email).token);

  const buyerLogin = login("buyer@example.com");
  const invite = couple.issueInvite(buyerLogin.sessionId, "partner@example.com");
  const partnerLogin = login("partner@example.com");
  assert.equal(couple.acceptInvite(partnerLogin.sessionId, invite.token).ok, true);

  const server = createServer(createListener({
    auth,
    couple,
    answers,
    entitlement,
    root: process.cwd(),
    mailEnv: {}
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const catalog = loadMarriagePack();

  const host = (sessionId) => createHostPack({
    session: auth.sessionFor(sessionId),
    cookieAccess: { origin, getCookie: () => `ab_session=${sessionId}` },
    pack: catalog
  });

  return {
    store,
    answers,
    entitlement,
    catalog,
    buyerSessionId: buyerLogin.sessionId,
    partnerSessionId: partnerLogin.sessionId,
    buyer: host(buyerLogin.sessionId),
    partner: host(partnerLogin.sessionId),
    close: () => new Promise((resolve) => server.close(resolve))
  };
}

function choiceAt(catalog, index, offset) {
  const question = catalog.questions[index];
  return question.choices[offset % question.choices.length].id;
}

test("the two of them finish all 12 questions, paywall included, without restarting the app", async (t) => {
  const system = await pairedSystem();
  t.after(system.close);
  const { buyer, partner, catalog } = system;

  assert.equal((await buyer.startPack()).screen, "question");
  assert.equal((await partner.startPack()).screen, "question");

  for (let index = 0; index < catalog.questions.length; index += 1) {
    const questionId = catalog.questions[index].id;

    await buyer.saveDraft({ draftChoice: choiceAt(catalog, index, 0), privateNote: `buyer note ${questionId}` });
    const afterBuyerSubmit = await buyer.submit();
    assert.equal(afterBuyerSubmit.question.question.id, questionId);
    assert.equal(afterBuyerSubmit.question.revealed, false, `${questionId} must not reveal on one submission`);

    // The partner refetches before answering: one submission must never leak the other answer.
    const waiting = await partner.refresh();
    assert.equal(waiting.question.question.id, questionId);
    assert.equal(waiting.question.revealed, false);
    assert.equal(waiting.question.theirs.submittedChoice ?? null, null, `${questionId} leaked the partner choice`);
    assert.equal(waiting.question.theirs.privateNote || "", "", `${questionId} leaked the private note`);
    assert.equal(waiting.question.theirChoiceLabel, "");

    await partner.saveDraft({ draftChoice: choiceAt(catalog, index, index), privateNote: `partner note ${questionId}` });
    const revealed = await partner.submit();
    assert.equal(revealed.question.revealed, true, `${questionId} did not reveal after both submitted`);
    assert.ok(["ALIGNED", "CLOSE", "DISCUSS"].includes(revealed.question.comparisonLabel));

    // The buyer submitted first and has pressed nothing since: the reveal has to reach them.
    const buyerSees = await buyer.refresh();
    assert.equal(buyerSees.question.revealed, true, `${questionId} never revealed on the first submitter's screen`);
    assert.ok(["ALIGNED", "CLOSE", "DISCUSS"].includes(buyerSees.question.comparisonLabel));

    if (index === catalog.questions.length - 1) break;

    if (index === 2) {
      // Third public lock: the gate stands in front of both of them.
      const gated = await buyer.go(1);
      assert.equal(gated.question.screen, "reveal");
      assert.equal(gated.question.index, 2, "the buyer cannot walk past the sample without paying");
      assert.equal(gated.paywall.visible, true, "the buyer must be offered the gate, not a dead end");
      assert.equal(gated.paywall.variant, "buyer");

      const partnerGate = await partner.refresh();
      assert.equal(partnerGate.paywall.visible, true);
      assert.equal(partnerGate.paywall.variant, "partner", "the partner may not be shown a purchase button");
      assert.equal(partnerGate.paywall.canPurchase, false);

      const bought = await buyer.purchase();
      assert.equal(bought.paywall.visible, false);
      assert.equal(bought.state.entitlement.entitled, true);

      // The partner is still on the same screen: it has to reopen without an app restart.
      const reopened = await partner.refresh();
      assert.equal(reopened.paywall.visible, false, "the partner screen never reopened after the purchase");
      assert.equal(reopened.state.entitlement.entitled, true);
      assert.equal(reopened.canGoNext, true);
    }

    assert.equal((await buyer.go(1)).question.index, index + 1, `buyer stuck at ${index}`);
    assert.equal((await partner.go(1)).question.index, index + 1, `partner stuck at ${index}`);
  }

  const finished = await buyer.refresh();
  const locked = Object.values(finished.state.questions).filter((question) => question.lock).length;
  assert.equal(locked, 12, "all twelve questions must end in a public lock");
  assert.equal(finished.question.index, 11);
  assert.equal(finished.canGoNext, false, "there is nothing after the last question");
  assert.equal(finished.completed, true, "the pack has to be able to say the two of them finished it");
});

test("a background refresh keeps the reader where they are and never leaks the other side", async (t) => {
  const system = await pairedSystem();
  t.after(system.close);
  const { buyer, partner } = system;
  await buyer.startPack();
  await partner.startPack();

  await buyer.saveDraft({ draftChoice: "home-rest", privateNote: "buyer only" });
  await buyer.submit();
  const before = partner.view();
  const after = await partner.refresh();
  assert.equal(after.question.index, before.question.index, "a poll must not move the reader");
  assert.equal(after.question.mine.privateNote || "", "", "the partner has written no note yet");
  assert.equal(JSON.stringify(after).includes("buyer only"), false, "the private note crossed to the partner");
  assert.equal(after.question.theirs.completed, true, "the partner may see that the other side submitted");
  assert.equal(after.question.theirs.submittedChoice ?? null, null);
});

test("both submissions arriving together lock the round exactly once", async (t) => {
  const system = await pairedSystem();
  t.after(system.close);
  const { answers, store, buyerSessionId, partnerSessionId } = system;

  answers.saveDraft(buyerSessionId, { questionId: "home-01", draftChoice: "home-rest" });
  answers.saveDraft(partnerSessionId, { questionId: "home-01", draftChoice: "home-social" });

  // Same tick, both directions, and each side pressing submit twice.
  const results = [
    answers.submit(buyerSessionId, { questionId: "home-01" }),
    answers.submit(partnerSessionId, { questionId: "home-01" }),
    answers.submit(buyerSessionId, { questionId: "home-01" }),
    answers.submit(partnerSessionId, { questionId: "home-01" })
  ];
  for (const result of results) assert.equal(result.ok, true);

  const state = store.snapshot();
  const locks = state.publicLocks.filter((row) => row.questionId === "home-01");
  assert.equal(locks.length, 1, "a double submit must not create a second public lock");
  assert.equal(locks[0].comparison.key, "discuss");
  const rounds = state.answerRounds.filter((row) => row.questionId === "home-01");
  assert.equal(rounds.length, 1, "no extra round may be opened by a repeated submit");
  assert.equal(rounds[0].revealedAt, locks[0].lockedAt);
});

test("the buyer's purchase opens the pack for the partner too, and the partner can never pay", async (t) => {
  const system = await pairedSystem();
  t.after(system.close);
  const { answers, entitlement, buyerSessionId, partnerSessionId } = system;

  for (const questionId of questionIds.slice(0, 3)) {
    for (const sessionId of [buyerSessionId, partnerSessionId]) {
      answers.saveDraft(sessionId, { questionId, draftChoice: choiceIdsByQuestion[questionId][0] });
      answers.submit(sessionId, { questionId });
    }
  }

  const gatedPartner = answers.stateFor(partnerSessionId).state;
  assert.equal(gatedPartner.paywallRequired, true);
  assert.equal(gatedPartner.entitlement.canPurchase, false);
  assert.equal(entitlement.createPurchase(partnerSessionId).error, "forbidden");
  assert.equal(answers.saveDraft(partnerSessionId, { questionId: questionIds[3], draftChoice: choiceIdsByQuestion[questionIds[3]][0] }).error, "paywall");

  assert.equal(entitlement.createPurchase(buyerSessionId).entitled, true);

  const openedPartner = answers.stateFor(partnerSessionId).state;
  assert.equal(openedPartner.paywallRequired, false);
  assert.equal(openedPartner.remainingLocked, false);
  assert.equal(openedPartner.entitlement.entitled, true);
  assert.equal(openedPartner.entitlement.canPurchase, false, "a partner still may not pay after the unlock");
  assert.equal(answers.saveDraft(partnerSessionId, { questionId: questionIds[3], draftChoice: choiceIdsByQuestion[questionIds[3]][0] }).ok, true);
});

test("the Expo pack screen shows the gate and reopens itself when the other side pays", async () => {
  const screens = await readFile("mobile/pack/screens.js", "utf8");
  assert.match(screens, /PaywallOverlay/, "the pack screen must render the paywall overlay like the native packs do");
  assert.match(screens, /controller\.purchase\(\)/, "the buyer needs a way to pay from the pack screen");
  assert.match(screens, /controller\.refresh\(\)/, "the gated screen must be able to refetch server state");
  assert.match(screens, /setInterval/, "the partner screen has no button, so it has to poll for the unlock");
  assert.match(screens, /partnerWaiting/, "whoever submits first must also see the reveal arrive");
});
