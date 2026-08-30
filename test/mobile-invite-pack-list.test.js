import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { marriagePack, questions } from "../src/questions.js";
import { assertLockedMeasurementCopy, formatPairCode, generatePairCode, inviteShareUrl, shareContainsPairCode } from "../src/pair-code.js";
import { consumeUrl, consumeHopHtml, inviteHopHtml } from "../server/mail.mjs";
import { createAuth } from "../server/auth.mjs";
import { createAnswers } from "../server/answers.mjs";
import { createListener } from "../server/app.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { extractMagicLinkToken } from "../mobile/s0-s2-s3-api.js";
import {
  consumeSucceeded,
  createNativeFlow,
  finishSplash,
  noticeAcknowledged,
  openAccount,
  openMarriageFromList,
  openSendLink,
  restoreSessionAfterSplash,
  shareMeasurementInvite
} from "../mobile/s0-s2-s3-flow.js";
import { renderInviteScreen, renderPackListScreen, renderS2SignupScreen } from "../mobile/s0-s2-s3-screens.js";
import { PACK_LIST_COPY, PAIR_COPY } from "../mobile/s0-s2-s3-copy.js";

function wired(store) {
  const couple = createCouple({ store });
  const answers = createAnswers({
    store,
    questionIds: questions.map((question) => question.id),
    choiceIdsByQuestion: Object.fromEntries(questions.map((question) => [question.id, question.choices.map((choice) => choice.id)])),
    pack: { id: marriagePack.id, version: marriagePack.version }
  });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  return { auth, couple, answers };
}

function startServer() {
  const store = createMemoryStore();
  const outbox = [];
  const { auth, couple, answers } = wired(store);
  const server = createServer(createListener({
    auth,
    couple,
    answers,
    root: process.cwd(),
    allowDevOutbox: true,
    mailEnv: {},
    outbox
  }));
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port, outbox, store });
    });
  });
}

async function request(port, path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {})
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual"
  });
  const setCookie = response.headers.getSetCookie?.() || [];
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = null; }
  return { status: response.status, json, text, setCookie };
}

function sessionCookie(setCookie) {
  return setCookie.find((value) => value.startsWith("ab_session="))?.split(";")[0] || "";
}

async function login(port, email) {
  await request(port, "/api/auth/magic-link", { method: "POST", body: { email } });
  const outbox = await request(port, "/api/dev/outbox");
  const item = outbox.json.items.find((entry) => entry.type === "magic-link" && entry.email === email);
  const token = new URL(item.url).searchParams.get("token");
  const consume = await request(port, "/api/auth/consume", { method: "POST", body: { token } });
  return sessionCookie(consume.setCookie);
}

test("measurement copy and consume scheme are locked", () => {
  assert.equal(assertLockedMeasurementCopy(), true);
  const url = consumeUrl("https://loveme-api.onrender.com", "tok_9");
  assert.equal(url.startsWith("loveme:///auth/consume?token="), true);
  assert.equal(url.includes("onrender.com"), false);
  assert.equal(extractMagicLinkToken(url), "tok_9");
  assert.equal(extractMagicLinkToken("loveme://auth/consume?token=abc"), "abc");
  assert.match(consumeHopHtml("tok_9"), /loveme:\/\/\/auth\/consume\?token=tok_9/);
  assert.equal(consumeHopHtml("tok_9").includes("로그인 링크 보내기"), false);
  assert.match(inviteHopHtml(), /loveme:\/\/invite/);
  assert.equal(inviteShareUrl("https://loveme-api.onrender.com"), "https://loveme-api.onrender.com/invite/open");
});

test("pack-list home copy matches the locked 질문집 list", () => {
  const html = renderPackListScreen();
  assert.match(html, /LoveMe/);
  assert.match(html, /질문집/);
  assert.match(html, /결혼만 지금 열려 있어요/);
  assert.match(html, /결혼/);
  assert.match(html, /가정 경영/);
  assert.match(html, /임신/);
  assert.match(html, /출산/);
  assert.match(html, /육아/);
  assert.match(html, /계정/);
  assert.equal((html.match(/곧 열려요/g) || []).length, 4);
  assert.equal(html.includes("29,000"), false);
  assert.equal(html.includes("100"), false);
  assert.equal(html.includes("프로필"), false);
  assert.equal(html.includes("선물"), false);
  assert.equal(PACK_LIST_COPY.title, "질문집");
});

test("invite screen copy matches the locked mock and omits pair codes from share helpers", () => {
  const html = renderInviteScreen({ pairCodeDisplay: "4K7M" });
  assert.match(html, /링크 보내기/);
  assert.match(html, /초대를 보내면 상대도 같은 팩을 받아요/);
  assert.match(html, /링크 복사/);
  assert.match(html, /인스타그램/);
  assert.match(html, /카카오톡/);
  assert.match(html, /앱에서 코드로 연결/);
  assert.match(html, /내 코드/);
  assert.match(html, /상대 코드를 알고 있다면/);
  assert.match(html, /상대 코드 입력/);
  assert.match(html, /연결하기/);
  assert.equal(html.includes("29,000"), false);
  assert.equal(html.includes("이 답이 비교되려면"), false);
  assert.equal(PAIR_COPY.connect, "연결하기");
  const code = generatePairCode(() => Buffer.from([4, 10, 7, 12, 2, 13, 8, 15]));
  assert.equal(code.length >= 6, true);
  assert.equal(shareContainsPairCode(inviteShareUrl("https://origin.example"), code), false);
  assert.equal(shareContainsPairCode(`https://origin.example/invite/open?code=${code}`, code), true);
  assert.match(formatPairCode(code), / /);
});

test("consume lands on notice or 질문집; marriage opens pack detail then 링크 보내기", async () => {
  const loggedIn = {
    user: { id: "usr_1", email: "buyer@example.com" },
    notice: "no-local-draft",
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  };
  const consumeNoDraft = consumeSucceeded(finishSplash(createNativeFlow()), loggedIn);
  assert.equal(consumeNoDraft.screen, "notice");
  const consumeBare = consumeSucceeded(finishSplash(createNativeFlow()), {
    user: { id: "usr_3", email: "buyer@example.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  });
  assert.equal(consumeBare.screen, "pack-list");
  const gate = renderS2SignupScreen();
  assert.equal(gate.includes("이 답을 남기려면 로그인해 주세요"), false);
  assert.match(gate, /로그인 링크 보내기/);

  const cold = await restoreSessionAfterSplash(
    createNativeFlow({ user: { id: "usr_2", email: "buyer@example.com" }, notice: null, workspace: { acceptedPartner: false } }),
    { session: async () => ({ user: { id: "usr_2", email: "buyer@example.com" }, notice: null, workspace: { acceptedPartner: false } }) }
  );
  assert.equal(cold.screen, "pack-list");
  assert.equal(renderPackListScreen().includes("프로필"), false);
  const opened = openMarriageFromList(cold);
  assert.equal(opened.screen, "pack-detail");
  const invite = openSendLink(opened);
  assert.equal(invite.screen, "invite");
  const account = openAccount(cold);
  assert.equal(account.screen, "account");

  const afterInviteSession = await restoreSessionAfterSplash(
    createNativeFlow(loggedIn, { inviteOpen: true }),
    { session: async () => ({ ...loggedIn, notice: null }) }
  );
  assert.equal(afterInviteSession.screen, "pack-list");
  assert.equal(noticeAcknowledged(consumeNoDraft, { ...loggedIn, notice: null }).screen, "pack-list");
});

test("HTTP pair-code generate, connect, share URL, and unused preview Q1 save stay wired", async () => {
  const { server, port } = await startServer();
  try {
    const buyerCookie = await login(port, "buyer@example.com");
    const partnerCookie = await login(port, "partner@example.com");
    const mine = await request(port, "/api/pair-code", { cookie: buyerCookie });
    assert.equal(mine.status, 200);
    assert.ok(mine.json.code.length >= 6);
    assert.equal(mine.json.url.endsWith("/invite/open"), true);
    assert.equal(String(mine.json.url).includes(mine.json.code), false);

    const hop = await request(port, "/invite/open");
    assert.equal(hop.status, 200);
    assert.match(hop.text, /loveme:\/\/invite/);
    assert.equal(hop.text.includes(mine.json.code), false);

    const saved = await request(port, "/api/preview-q1", {
      method: "POST",
      cookie: buyerCookie,
      body: { questionId: "home-01", choiceId: "home-rest" }
    });
    assert.equal(saved.status, 200);
    assert.equal(saved.json.choiceId, "home-rest");

    const connected = await request(port, "/api/pair-code/connect", {
      method: "POST",
      cookie: partnerCookie,
      body: { code: mine.json.code }
    });
    assert.equal(connected.status, 200);
    assert.equal(connected.json.session.workspace.acceptedPartner, true);

    const self = await request(port, "/api/pair-code/connect", {
      method: "POST",
      cookie: buyerCookie,
      body: { code: mine.json.code }
    });
    assert.equal(self.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("shareMeasurementInvite copies the invite link only", async () => {
  const shared = [];
  const state = await shareMeasurementInvite({
    inviteOpen: true,
    inviteUrl: "https://loveme-api.onrender.com/invite/open",
    pairCode: "4K7M2N8P",
    pairCodeDisplay: "4K7M 2N8P"
  }, "copy", {
    clipboard: { writeText: async (value) => { shared.push(value); } }
  });
  assert.equal(state.copied, true);
  assert.deepEqual(shared, ["https://loveme-api.onrender.com/invite/open"]);
  assert.equal(shared[0].includes("4K7M"), false);
});

test("Expo screens keep pack-list and invite and do not add profile or prices", async () => {
  const screens = await readFile("mobile/src/screens.js", "utf8");
  const app = await readFile("mobile/App.js", "utf8");
  const flow = await readFile("mobile/s0-s2-s3-flow.js", "utf8");
  assert.match(screens, /PACK_LIST_COPY\.title/);
  assert.match(screens, /PAIR_COPY\.headline/);
  assert.match(screens, /PAIR_COPY\.appCode/);
  assert.match(screens, /testID="pack-list"/);
  assert.match(screens, /testID="invite"/);
  assert.match(screens, /testID="account"/);
  assert.equal(screens.includes("프로필"), false);
  assert.equal(screens.includes("29,000"), false);
  assert.equal(screens.includes("선물"), false);
  assert.match(app, /Linking/);
  assert.match(app, /loveme|InviteScreen|PackListScreen/);
  assert.match(flow, /inviteOpen/);
  assert.match(flow, /pack-list/);
  const restored = await restoreSessionAfterSplash(
    createNativeFlow({ user: { id: "u", email: "a@b.com" }, notice: null, workspace: { acceptedPartner: false } }),
    { session: async () => ({ user: { id: "u", email: "a@b.com" }, notice: null, workspace: { acceptedPartner: false } }) }
  );
  assert.equal(restored.screen, "pack-list");
  const swiftHost = await readFile("mobile/LoveMeS0S2S3Host.swift", "utf8");
  const kotlinHost = await readFile("mobile/LoveMeS0S2S3Host.kt", "utf8");
  const packScreens = await readFile("mobile/LoveMeInvitePackScreens.swift", "utf8");
  const consumeSwift = swiftHost.slice(swiftHost.indexOf("func openMagicLink"), swiftHost.indexOf("private func requestBind"));
  const consumeKotlin = kotlinHost.slice(kotlinHost.indexOf("fun openMagicLink"));
  assert.match(packScreens, /질문집/);
  assert.match(packScreens, /링크 보내기/);
  assert.match(packScreens, /계정/);
  assert.equal(packScreens.includes("wantsLoginGate"), false);
  assert.equal(swiftHost.includes("wantsLoginGate"), false);
  assert.match(consumeSwift, /packList/);
  assert.match(consumeKotlin, /PackList/);
  assert.equal(`${packScreens}\n${screens}`.includes("프로필"), false);
  assert.equal(`${packScreens}\n${screens}`.includes("29,000"), false);
  assert.equal(`${packScreens}\n${screens}`.includes("선물"), false);
  assert.equal(`${packScreens}\n${screens}`.includes("이 폰을 상대에게 넘기려면 먼저 로그아웃하세요."), false);
});
