import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createAnswers } from "../../../server/answers.mjs";
import { createAuth } from "../../../server/auth.mjs";
import { createListener } from "../../../server/app.mjs";
import { createEntitlement } from "../../../server/entitlement.mjs";
import { createMemoryStore } from "../../../server/store.mjs";
import { createCouple } from "../../../server/workspace.mjs";
import { createPackClient } from "../../pack/contract/pack-client.js";
import { createPackController } from "../../pack/contract/pack-controller.js";
import { loadMarriagePack } from "../../pack/contract/pack-catalog.js";
import { createPaywallClient } from "../contract/paywall-client.js";
import { PAYWALL_COPY } from "../contract/paywall-copy.js";

const pack = loadMarriagePack();
const questionIds = pack.questionIds.slice(0, 4);
const choiceIdsByQuestion = Object.fromEntries(
  questionIds.map((id) => [id, pack.choiceIdsByQuestion[id]])
);

function system() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const entitlement = createEntitlement({ store, pack: { id: pack.id, version: pack.version } });
  const answers = createAnswers({
    store,
    questionIds,
    choiceIdsByQuestion,
    pack: { id: pack.id, version: pack.version },
    entitlement
  });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  return { store, couple, answers, auth, entitlement };
}

function cookieHeader(setCookie) {
  return setCookie.find((value) => value.startsWith("ab_session="))?.split(";")[0] || "";
}

function sessionIdFromCookie(cookie) {
  return decodeURIComponent(String(cookie || "").replace(/^ab_session=/, ""));
}

async function listen(system) {
  const outbox = [];
  const server = createServer(createListener({
    auth: system.auth,
    couple: system.couple,
    answers: system.answers,
    entitlement: system.entitlement,
    root: process.cwd(),
    allowDevOutbox: true,
    outbox
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return { server, outbox, baseUrl: `http://127.0.0.1:${port}` };
}

async function login(baseUrl, email) {
  await fetch(`${baseUrl}/api/auth/magic-link`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email })
  });
  const box = await fetch(`${baseUrl}/api/dev/outbox`).then((response) => response.json());
  const item = box.items.find((entry) => entry.type === "magic-link" && entry.email === email);
  const token = new URL(item.url).searchParams.get("token");
  const consume = await fetch(`${baseUrl}/api/auth/consume`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token })
  });
  return cookieHeader(consume.headers.getSetCookie?.() || []);
}

async function pair(baseUrl) {
  const buyerCookie = await login(baseUrl, "buyer@example.com");
  await fetch(`${baseUrl}/api/invite`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: buyerCookie },
    body: JSON.stringify({ email: "partner@example.com" })
  });
  const box = await fetch(`${baseUrl}/api/dev/outbox`).then((response) => response.json());
  const inviteToken = new URL(box.items.find((entry) => entry.type === "invite").url).searchParams.get("token");
  const partnerCookie = await login(baseUrl, "partner@example.com");
  await fetch(`${baseUrl}/api/invite/accept`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: partnerCookie },
    body: JSON.stringify({ token: inviteToken })
  });
  return { buyerCookie, partnerCookie };
}

async function lockQuestion(buyerClient, partnerClient, questionId, index, buyerChoice, partnerChoice) {
  await buyerClient.saveDraft({ questionId, draftChoice: buyerChoice, index });
  await buyerClient.submit({ questionId, index });
  await partnerClient.saveDraft({ questionId, draftChoice: partnerChoice, index });
  return partnerClient.submit({ questionId, index });
}

test("sample 3 lock then buyer gate; partner cannot pay; later keeps the rest locked", async () => {
  const ctx = system();
  const { server, baseUrl } = await listen(ctx);
  try {
    const { buyerCookie, partnerCookie } = await pair(baseUrl);
    const buyerSession = sessionIdFromCookie(buyerCookie);
    const partnerSession = sessionIdFromCookie(partnerCookie);
    const buyerClient = createPackClient({ baseUrl, sessionId: buyerSession });
    const partnerClient = createPackClient({ baseUrl, sessionId: partnerSession });
    const buyerPay = createPaywallClient({ baseUrl, sessionId: buyerSession });
    const partnerPay = createPaywallClient({ baseUrl, sessionId: partnerSession });

    const ghostPay = createPaywallClient({
      baseUrl,
      sessionId: sessionIdFromCookie(await login(baseUrl, "ghost@example.com"))
    });
    assert.equal((await ghostPay.getEntitlement()).error, "locked");

    const first = questionIds[0];
    const second = questionIds[1];
    const third = questionIds[2];
    const fourth = questionIds[3];
    await lockQuestion(buyerClient, partnerClient, first, 0, choiceIdsByQuestion[first][0], choiceIdsByQuestion[first][1]);
    await lockQuestion(buyerClient, partnerClient, second, 1, choiceIdsByQuestion[second][0], choiceIdsByQuestion[second][1]);
    const afterTwo = await buyerClient.getState();
    assert.equal(afterTwo.state.paywallRequired, false);
    assert.equal(afterTwo.state.sampleLockCount, 2);

    const thirdLock = await lockQuestion(
      buyerClient,
      partnerClient,
      third,
      2,
      choiceIdsByQuestion[third][0],
      choiceIdsByQuestion[third][1]
    );
    assert.equal(thirdLock.state.sampleLockCount, 3);
    assert.equal(thirdLock.state.paywallRequired, true);
    assert.equal(thirdLock.state.questions[third].lock.roundNumber, 1);
    assert.equal(thirdLock.state.entitlement.entitled, false);

    const blocked = await buyerClient.saveDraft({
      questionId: fourth,
      draftChoice: choiceIdsByQuestion[fourth][0],
      index: 3
    });
    assert.equal(blocked.ok, false);
    assert.equal(blocked.error, "paywall");
    assert.equal(blocked.status, 403);

    const partnerDenied = await partnerPay.purchase();
    assert.equal(partnerDenied.ok, false);
    assert.equal(partnerDenied.error, "forbidden");
    assert.equal(partnerDenied.status, 403);

    const session = { user: { id: "buyer" }, workspace: { acceptedPartner: true, role: "buyer" } };
    const controller = createPackController({
      pack,
      session,
      client: buyerClient,
      paywallClient: buyerPay
    });
    const started = await controller.startPack();
    assert.equal(started.paywall.visible, true);
    assert.equal(started.paywall.variant, "buyer");
    assert.equal(started.paywall.cta, PAYWALL_COPY.buyerCta);
    assert.equal(started.question.lock.roundNumber, 1);
    assert.equal(started.canGoNext, false);

    const dismissed = controller.later();
    assert.equal(dismissed.paywall.visible, false);
    assert.equal(dismissed.paywall.remainingLocked, true);
    assert.equal(dismissed.question.lock.roundNumber, 1);

    const partnerSessionView = { user: { id: "partner" }, workspace: { acceptedPartner: true, role: "partner" } };
    const partnerController = createPackController({
      pack,
      session: partnerSessionView,
      client: partnerClient,
      paywallClient: partnerPay
    });
    const partnerView = await partnerController.startPack();
    assert.equal(partnerView.paywall.visible, true);
    assert.equal(partnerView.paywall.canPurchase, false);
    assert.equal(partnerView.paywall.cta, "");
    assert.equal(partnerView.paywall.title, PAYWALL_COPY.partnerTitle);

    const bought = await controller.purchase();
    assert.equal(bought.paywall.entitled, true);
    assert.equal(bought.paywall.visible, false);

    const opened = await buyerClient.saveDraft({
      questionId: fourth,
      draftChoice: choiceIdsByQuestion[fourth][0],
      index: 3
    });
    assert.equal(opened.ok, true);
    assert.equal(opened.state.entitlement.entitled, true);
    assert.equal(opened.state.questions[fourth].roles.a.draftChoice, choiceIdsByQuestion[fourth][0]);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
