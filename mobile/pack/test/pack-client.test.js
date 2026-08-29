import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { connect } from "node:net";
import { createAnswers } from "../../../server/answers.mjs";
import { createAuth } from "../../../server/auth.mjs";
import { createListener } from "../../../server/app.mjs";
import { createMemoryStore } from "../../../server/store.mjs";
import { createCouple } from "../../../server/workspace.mjs";
import { createPackClient, neverMigrateLocalSim } from "../contract/pack-client.js";
import { createPackController } from "../contract/pack-controller.js";
import { loadMarriagePack } from "../contract/pack-catalog.js";
import { canStartPack } from "../contract/pack-gate.js";

const pack = loadMarriagePack();
const questionIds = pack.questionIds.slice(0, 2);
const choiceIdsByQuestion = Object.fromEntries(
  questionIds.map((id) => [id, pack.choiceIdsByQuestion[id]])
);

function system() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const answers = createAnswers({
    store,
    questionIds,
    choiceIdsByQuestion,
    pack: { id: pack.id, version: pack.version }
  });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  return { store, couple, answers, auth };
}

function cookieHeader(setCookie) {
  return setCookie.find((value) => value.startsWith("ab_session="))?.split(";")[0] || "";
}

function sessionIdFromCookie(cookie) {
  return decodeURIComponent(String(cookie || "").replace(/^ab_session=/, ""));
}

test("pack client stays locked until partner accept, then persists draft/submit/lock", async () => {
  const { couple, answers, auth } = system();
  const outbox = [];
  const server = createServer(createListener({
    auth,
    couple,
    answers,
    root: process.cwd(),
    allowDevOutbox: true,
    outbox
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;

    async function login(email) {
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

    const buyerCookie = await login("buyer@example.com");
    const buyerClient = createPackClient({ baseUrl, sessionId: sessionIdFromCookie(buyerCookie) });
    const locked = await buyerClient.getState();
    assert.equal(locked.ok, false);
    assert.equal(locked.error, "locked");
    assert.equal(locked.status, 403);

    await fetch(`${baseUrl}/api/invite`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: buyerCookie },
      body: JSON.stringify({ email: "partner@example.com" })
    });
    const box = await fetch(`${baseUrl}/api/dev/outbox`).then((response) => response.json());
    const inviteToken = new URL(box.items.find((entry) => entry.type === "invite").url).searchParams.get("token");
    const partnerCookie = await login("partner@example.com");
    const accepted = await fetch(`${baseUrl}/api/invite/accept`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: partnerCookie },
      body: JSON.stringify({ token: inviteToken })
    });
    assert.equal(accepted.status, 200);
    const partnerSession = await accepted.json();
    assert.equal(canStartPack(partnerSession.session), true);

    const partnerClient = createPackClient({
      baseUrl,
      sessionId: sessionIdFromCookie(partnerCookie)
    });

    const started = await buyerClient.getState();
    assert.equal(started.ok, true);

    const draft = await buyerClient.saveDraft({
      questionId: "home-01",
      draftChoice: "home-rest",
      privateNote: "나만 볼 메모",
      index: 0
    });
    assert.equal(draft.ok, true);
    assert.equal(draft.state.questions["home-01"].roles.a.privateNote, "나만 볼 메모");
    assert.equal(draft.state.questions["home-01"].roles.b.privateNote, "");

    const partnerView = await partnerClient.getState();
    assert.equal(partnerView.state.questions["home-01"].roles.a.privateNote, "");
    assert.equal(partnerView.state.questions["home-01"].roles.a.draftChoice, null);

    await buyerClient.submit({ questionId: "home-01", index: 0 });
    await partnerClient.saveDraft({ questionId: "home-01", draftChoice: "home-social", privateNote: "상대 메모", index: 0 });
    const lockedRound = await partnerClient.submit({ questionId: "home-01", index: 0 });
    assert.equal(lockedRound.state.questions["home-01"].lock.roundNumber, 1);
    assert.equal(lockedRound.state.questions["home-01"].lock.submittedChoices.a, "home-rest");
    assert.equal(lockedRound.state.questions["home-01"].lock.submittedChoices.b, "home-social");
    assert.equal(JSON.stringify(lockedRound.state.questions["home-01"].lock).includes("나만 볼 메모"), false);

    const agreed = await buyerClient.saveAgreement({
      questionId: "home-01",
      action: "propose",
      proposal: "주말은 집에서 쉬어요",
      index: 0
    });
    assert.equal(agreed.state.questions["home-01"].shared.status, "pending");
    const held = await partnerClient.saveAgreement({
      questionId: "home-01",
      action: "deferred",
      index: 0
    });
    assert.equal(held.state.questions["home-01"].shared.status, "deferred");

    const firstLock = structuredClone(lockedRound.state.questions["home-01"].lock);
    const reanswer = await buyerClient.saveDraft({
      questionId: "home-01",
      draftChoice: "home-growth",
      privateNote: "새 라운드",
      index: 0
    });
    assert.equal(reanswer.ok, true);
    assert.equal(reanswer.state.questions["home-01"].roles.a.draftChoice, "home-growth");
    assert.equal(reanswer.state.questions["home-01"].lock.roundNumber, 1);
    assert.deepEqual(reanswer.state.questions["home-01"].lock.submittedChoices, firstLock.submittedChoices);
    const after = await partnerClient.getState();
    assert.equal(after.state.questions["home-01"].lock.roundNumber, 1);
    assert.deepEqual(after.state.questions["home-01"].lock.submittedChoices, firstLock.submittedChoices);
    assert.equal(after.state.questions["home-01"].roles.a.draftChoice, null);
    assert.equal(after.state.questions["home-01"].roles.a.privateNote, "");

    await buyerClient.submit({ questionId: "home-01", index: 0 });
    await partnerClient.saveDraft({ questionId: "home-01", draftChoice: "home-independent", index: 0 });
    const second = await partnerClient.submit({ questionId: "home-01", index: 0 });
    assert.equal(second.state.questions["home-01"].lock.roundNumber, 2);
    assert.equal(second.state.questions["home-01"].lock.submittedChoices.a, "home-growth");
    assert.equal(second.state.questions["home-01"].lock.submittedChoices.b, "home-independent");
    assert.deepEqual(firstLock.submittedChoices, { a: "home-rest", b: "home-social" });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("startPack maps GET /api/pack/state locked 403 to the locked screen", async () => {
  const session = { user: { id: "u1" }, workspace: { acceptedPartner: true, role: "buyer" } };
  const controller = createPackController({
    pack,
    session,
    client: {
      async getState() {
        return { ok: false, error: "locked", status: 403 };
      }
    }
  });
  const view = await controller.startPack();
  assert.equal(view.screen, "locked");
  assert.equal(view.error, "");
  assert.equal(view.cta, "");
  assert.equal(view.body, "파트너가 초대를 수락한 뒤에만 결혼 팩을 시작할 수 있어요.");
});

test("controller starts only after accept, never migrates local-sim drafts", async () => {
  const storage = {
    "ab-local-simulator": JSON.stringify({ home: "rest" }),
    "other": "ok",
    keys() { return Object.keys(this).filter((key) => key !== "keys"); }
  };
  assert.deepEqual(neverMigrateLocalSim(storage), ["ab-local-simulator"]);

  const session = { user: { id: "u1" }, workspace: { acceptedPartner: false, role: "buyer" } };
  const calls = [];
  const client = {
    async getState() {
      calls.push("state");
      return { ok: false, error: "locked" };
    }
  };
  const controller = createPackController({ pack, client, session, storage });
  assert.deepEqual(controller.migratedLocalSimKeys(), ["ab-local-simulator"]);
  const view = await controller.startPack();
  assert.equal(view.screen, "locked");
  assert.equal(view.cta, "");
  assert.equal(calls.length, 0);
});

test("controller 합의 and 다음에 미룸 go through public-lock agreement actions", async () => {
  const { answers, auth, couple } = system();
  const buyer = auth.consumeMagicLink(auth.requestMagicLink("buyer@example.com").token);
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
  const partner = auth.consumeMagicLink(auth.requestMagicLink("partner@example.com").token);
  assert.equal(couple.acceptInvite(partner.sessionId, invite.token).ok, true);

  const session = { user: { id: "buyer" }, workspace: { acceptedPartner: true, role: "buyer" } };
  const client = {
    async getState() { return answers.stateFor(buyer.sessionId); },
    async saveDraft(body) { return answers.saveDraft(buyer.sessionId, body); },
    async submit(body) { return answers.submit(buyer.sessionId, body); },
    async saveAgreement(body) { return answers.saveAgreement(buyer.sessionId, body); }
  };
  const controller = createPackController({ pack, client, session });
  await controller.startPack();
  await controller.saveDraft({ draftChoice: "home-rest", privateNote: "초안" });
  let view = await controller.submit();
  assert.equal(view.question.mine.submittedChoice, "home-rest");
  assert.equal(view.question.privacyBadge === "제출 잠금" || view.question.partnerWaiting, true);

  answers.saveDraft(partner.sessionId, { questionId: "home-01", draftChoice: "home-social" });
  answers.submit(partner.sessionId, { questionId: "home-01" });
  view = await controller.startPack();
  assert.equal(view.question.lock.roundNumber, 1);
  assert.equal(view.question.screen, "reveal");
  assert.equal(view.question.agreeLabel, "합의");
  assert.equal(view.question.holdLabel, "다음에 미룸");

  view = await controller.agree("집을 쉬는 곳으로");
  assert.equal(view.state.questions["home-01"].shared.status, "pending");
  view = await controller.hold();
  assert.equal(view.state.questions["home-01"].shared.status, "deferred");

  const firstLock = structuredClone(view.state.questions["home-01"].lock);
  view = await controller.saveDraft({ draftChoice: "home-growth" });
  assert.equal(view.question.screen, "reveal");
  assert.equal(view.question.reanswering, false);
  assert.equal(view.state.questions["home-01"].roles.a.draftChoice, "home-rest");
  view = controller.beginReanswer();
  assert.equal(view.question.privacyBadge, "나만 보임");
  view = await controller.saveDraft({ draftChoice: "home-growth" });
  assert.equal(view.question.privacyBadge, "나만 보임");
  assert.equal(view.state.questions["home-01"].roles.a.draftChoice, "home-growth");
  assert.equal(view.state.questions["home-01"].lock.roundNumber, 1);
  assert.deepEqual(view.state.questions["home-01"].lock.submittedChoices, firstLock.submittedChoices);
});

test("refresh after submit stays on the lock snapshot when draft differs", async () => {
  const { answers, auth, couple } = system();
  const buyer = auth.consumeMagicLink(auth.requestMagicLink("buyer@example.com").token);
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
  const partner = auth.consumeMagicLink(auth.requestMagicLink("partner@example.com").token);
  assert.equal(couple.acceptInvite(partner.sessionId, invite.token).ok, true);

  let divergeDraft = false;
  const session = { user: { id: "buyer" }, workspace: { acceptedPartner: true, role: "buyer" } };
  const client = {
    async getState() {
      const result = answers.stateFor(buyer.sessionId);
      if (divergeDraft && result.state?.questions?.["home-01"]) {
        result.state.questions["home-01"].roles.a.draftChoice = "home-growth";
      }
      return result;
    },
    async saveDraft(body) { return answers.saveDraft(buyer.sessionId, body); },
    async submit(body) { return answers.submit(buyer.sessionId, body); },
    async saveAgreement(body) { return answers.saveAgreement(buyer.sessionId, body); }
  };
  const controller = createPackController({ pack, client, session });
  await controller.startPack();
  await controller.saveDraft({ draftChoice: "home-rest" });
  await controller.submit();
  answers.saveDraft(partner.sessionId, { questionId: "home-01", draftChoice: "home-social" });
  answers.submit(partner.sessionId, { questionId: "home-01" });

  divergeDraft = true;
  const view = await controller.startPack();
  assert.equal(view.question.lock.roundNumber, 1);
  assert.equal(view.question.lock.submittedChoices.a, "home-rest");
  assert.equal(view.question.mine.draftChoice, "home-growth");
  assert.equal(view.question.reanswering, false);
  assert.equal(view.question.screen, "reveal");
  assert.equal(view.question.canReanswer, true);
});

function parseAndroidPackHttp(raw) {
  const bytes = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
  const split = bytes.indexOf(Buffer.from("\r\n\r\n"));
  const headerBlock = (split >= 0 ? bytes.subarray(0, split) : bytes).toString("latin1");
  let body = split >= 0 ? bytes.subarray(split + 4) : Buffer.alloc(0);
  const status = Number(headerBlock.split("\r\n")[0]?.split(" ")[1] || 0);
  const headers = Object.fromEntries(
    headerBlock.split("\r\n").slice(1).map((line) => {
      const index = line.indexOf(":");
      return index < 0 ? ["", ""] : [line.slice(0, index).trim().toLowerCase(), line.slice(index + 1).trim()];
    })
  );
  if (String(headers["transfer-encoding"] || "").includes("chunked")) {
    const chunks = [];
    let index = 0;
    while (index < body.length) {
      const lineEnd = body.indexOf("\r\n", index);
      if (lineEnd < 0) break;
      const size = Number.parseInt(body.subarray(index, lineEnd).toString("ascii").trim().split(";")[0], 16);
      if (!size) break;
      const start = lineEnd + 2;
      chunks.push(body.subarray(start, start + size));
      index = start + size + 2;
    }
    body = Buffer.concat(chunks);
  }
  const text = body.toString("utf8").trim();
  const json = text ? JSON.parse(text) : {};
  if (status) json.status = json.status ?? status;
  if (json.ok == null) json.ok = status >= 200 && status < 300;
  return json;
}

function androidPackHttp({ host, port, method, path, cookie, body }) {
  const payload = body ? Buffer.from(JSON.stringify(body)) : Buffer.alloc(0);
  const request = Buffer.concat([
    Buffer.from(
      `${method} ${path} HTTP/1.1\r\n` +
      `Host: ${host}:${port}\r\n` +
      `Accept: application/json\r\n` +
      (cookie ? `Cookie: ${cookie}\r\n` : "") +
      (payload.length ? `Content-Type: application/json\r\nContent-Length: ${payload.length}\r\n` : "") +
      "Connection: close\r\n\r\n"
    ),
    payload
  ]);
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port }, () => socket.write(request));
    const chunks = [];
    socket.on("data", (chunk) => chunks.push(chunk));
    socket.on("end", () => {
      try {
        resolve(parseAndroidPackHttp(Buffer.concat(chunks)));
      } catch (error) {
        reject(error);
      }
    });
    socket.on("error", reject);
  });
}

test("Android PackHttp wire format saves a real PATCH draft", async () => {
  const { couple, answers, auth } = system();
  const outbox = [];
  const methods = [];
  const inner = createListener({
    auth,
    couple,
    answers,
    root: process.cwd(),
    allowDevOutbox: true,
    outbox
  });
  const server = createServer((request, response) => {
    methods.push(request.method);
    inner(request, response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { port } = server.address();
    async function login(email) {
      await fetch(`http://127.0.0.1:${port}/api/auth/magic-link`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email })
      });
      const box = await fetch(`http://127.0.0.1:${port}/api/dev/outbox`).then((response) => response.json());
      const item = box.items.find((entry) => entry.type === "magic-link" && entry.email === email);
      const token = new URL(item.url).searchParams.get("token");
      const consume = await fetch(`http://127.0.0.1:${port}/api/auth/consume`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token })
      });
      return cookieHeader(consume.headers.getSetCookie?.() || []);
    }

    const buyerCookie = await login("buyer@example.com");
    const locked = await androidPackHttp({
      host: "127.0.0.1",
      port,
      method: "GET",
      path: "/api/pack/state",
      cookie: buyerCookie
    });
    assert.equal(locked.status, 403);
    assert.equal(locked.error, "locked");
    assert.equal(locked.ok, false);

    await fetch(`http://127.0.0.1:${port}/api/invite`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: buyerCookie },
      body: JSON.stringify({ email: "partner@example.com" })
    });
    const box = await fetch(`http://127.0.0.1:${port}/api/dev/outbox`).then((response) => response.json());
    const inviteToken = new URL(box.items.find((entry) => entry.type === "invite").url).searchParams.get("token");
    const partnerCookie = await login("partner@example.com");
    const accepted = await fetch(`http://127.0.0.1:${port}/api/invite/accept`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: partnerCookie },
      body: JSON.stringify({ token: inviteToken })
    });
    assert.equal(accepted.status, 200);

    const draft = await androidPackHttp({
      host: "127.0.0.1",
      port,
      method: "PATCH",
      path: "/api/pack/draft",
      cookie: buyerCookie,
      body: {
        questionId: "home-01",
        draftChoice: "home-rest",
        privateNote: "안드로이드 초안",
        index: 0
      }
    });
    assert.equal(methods.includes("PATCH"), true);
    assert.equal(draft.ok, true);
    assert.equal(draft.state.questions["home-01"].roles.a.draftChoice, "home-rest");
    assert.equal(draft.state.questions["home-01"].roles.a.privateNote, "안드로이드 초안");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
