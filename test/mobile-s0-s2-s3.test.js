import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createServer } from "node:http";
import { AUTH_COPY, AUTH_ERRORS, canOpenPack } from "../src/auth.js";
import { MAGIC_LINK_TTL_MS } from "../server/auth.mjs";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import {
  FORBIDDEN_APP_COPY,
  MAGIC_LINK_TTL_MS as APP_TTL,
  S0_COPY,
  S2_COPY,
  S2_ERRORS,
  S3_COPY
} from "../mobile/s0-s2-s3-copy.js";
import { AUTH_API, createAuthApi, extractMagicLinkToken } from "../mobile/s0-s2-s3-api.js";
import {
  acknowledgeLoginNotice,
  backToSignup,
  canOpenPack as nativeCanOpenPack,
  consumeOpenedLink,
  consumeSucceeded,
  createNativeFlow,
  finishSplash,
  invitePartner,
  noticeAcknowledged,
  requestLinkFailed,
  requestLinkStarted,
  resolveNativeScreen,
  restoreSessionAfterSplash,
  s0ShowsInstallLanding,
  s2HasKakaoLogin,
  s3AllowsPackCta,
  s3HasPayment,
  setEmail,
  submitMagicLink
} from "../mobile/s0-s2-s3-flow.js";
import {
  renderNativeScreen,
  renderS0SplashScreen,
  renderS2LoginNoticeScreen,
  renderS2SentScreen,
  renderS2SignupScreen,
  renderS3WorkspaceCreatedScreen,
  screenForbidsPackAndInstall
} from "../mobile/s0-s2-s3-screens.js";

const nativeFiles = [
  "mobile/S0SplashScreen.swift",
  "mobile/S0SplashScreen.kt",
  "mobile/S2SignupScreen.swift",
  "mobile/S2SignupScreen.kt",
  "mobile/S3WorkspaceCreatedScreen.swift",
  "mobile/S3WorkspaceCreatedScreen.kt",
  "mobile/LoveMeAuthApi.swift",
  "mobile/LoveMeAuthApi.kt",
  "mobile/LoveMeS0S2S3Host.swift",
  "mobile/LoveMeS0S2S3Host.kt"
];

function wiredAuth(store) {
  const couple = createCouple({ store });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  return { auth, couple };
}

function startServer() {
  const store = createMemoryStore();
  const outbox = [];
  const { auth, couple } = wiredAuth(store);
  const server = createServer(createListener({
    auth,
    couple,
    root: process.cwd(),
    allowDevOutbox: true,
    outbox
  }));
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port, store, outbox });
    });
  });
}

test("S2 copy matches the native pack lock and 10-minute TTL", () => {
  assert.equal(S2_COPY.body, "암호 없이 이메일로 로그인 링크를 보내드려요.");
  assert.equal(S2_COPY.cta, "로그인 링크 보내기");
  assert.equal(S2_COPY.sent, "메일을 확인해 주세요. 링크는 10분 동안만 유효해요.");
  assert.equal(S2_COPY.afterLogin, "이 기기 임시 답은 이어지지 않아요.");
  assert.equal(S2_COPY.title, "두 사람의 결혼 준비, 한곳에");
  assert.equal(S2_COPY.title, AUTH_COPY.title);
  assert.equal(S2_COPY.cta, AUTH_COPY.cta);
  assert.equal(S2_COPY.sent, AUTH_COPY.sent);
  assert.equal(S2_COPY.afterLogin, AUTH_COPY.afterLogin);
  assert.equal(S2_COPY.title.includes("한곳에"), true);
  assert.equal(S2_COPY.sent.includes("유효해요"), true);
  assert.equal(S2_COPY.sent.includes("유횤"), false);
  assert.equal(S2_COPY.body.includes("암호 없이"), true);
  assert.equal(S2_COPY.body.includes("비밀번호 없이"), false);
  assert.equal(S2_ERRORS.expired, AUTH_ERRORS.expired);
  assert.equal(APP_TTL, MAGIC_LINK_TTL_MS);
  assert.equal(APP_TTL, 10 * 60 * 1000);
});

test("S0 splash is brand-only and S3 is workspace-created with invite CTA", () => {
  assert.equal(S0_COPY.title, "두 사람의 결혼 준비, 한곳에");
  assert.equal(S3_COPY.created, "워크스페이스가 만들어졌어요.");
  assert.equal(S3_COPY.inviteCta, "파트너 초대하기");
  const splash = renderS0SplashScreen();
  const workspace = renderS3WorkspaceCreatedScreen({ email: "buyer@example.com" });
  assert.match(splash, /두 사람의 결혼 준비, 한곳에/);
  assert.match(splash, /다가올 삶을, 함께 준비하다/);
  assert.equal(splash.includes("앱 설치하기"), false);
  assert.equal(splash.includes("/install"), false);
  assert.match(workspace, /워크스페이스가 만들어졌어요/);
  assert.match(workspace, /파트너 초대하기/);
  assert.equal(workspace.includes(FORBIDDEN_APP_COPY.packCta), false);
  assert.equal(workspace.includes("data-action=\"open-pack\""), false);
});

test("native flow is splash → signup → sent → notice → workspace, never pack", () => {
  let state = createNativeFlow();
  assert.equal(resolveNativeScreen(state), "splash");
  assert.equal(s0ShowsInstallLanding(), false);
  state = finishSplash(state);
  assert.equal(state.screen, "signup");
  const signup = renderS2SignupScreen({ email: "" });
  assert.match(signup, /암호 없이 이메일로 로그인 링크를 보내드려요/);
  assert.match(signup, /로그인 링크 보내기/);
  assert.equal(signup.includes("type=\"password\""), false);
  assert.equal(s2HasKakaoLogin(), false);

  state = setEmail(state, "nope");
  state = requestLinkStarted(state);
  assert.match(state.error, /이메일/);
  state = setEmail(state, "buyer@example.com");
  state = requestLinkStarted(state);
  state = { ...state, sentEmail: state.email, busy: false, screen: "sent" };
  assert.equal(resolveNativeScreen(state), "sent");
  assert.match(renderS2SentScreen({ email: state.sentEmail }), /10분 동안만 유효해요/);

    state = consumeSucceeded(state, {
      user: { id: "usr_1", email: "buyer@example.com" },
      notice: "no-local-draft",
      workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
    });
    assert.equal(state.screen, "notice");
    assert.notEqual(state.screen, "workspace");
  assert.match(renderS2LoginNoticeScreen({ email: "buyer@example.com" }), /이 기기 임시 답은 이어지지 않아요/);

  state = noticeAcknowledged(state, { ...state.session, notice: null });
  assert.equal(state.screen, "workspace");
  assert.equal(nativeCanOpenPack(state.session), false);
  assert.equal(canOpenPack(state.session), false);
  assert.equal(s3AllowsPackCta(state), false);
  assert.equal(s3HasPayment(), false);
  state = invitePartner(state);
  assert.equal(state.action, "invite-partner");
  assert.equal(renderNativeScreen(state).includes(FORBIDDEN_APP_COPY.packCta), false);
});

test("mobile API client reuses web magic-link and workspace session", async () => {
  const { server, port } = await startServer();
  let cookie = "";
  const api = createAuthApi({
    origin: `http://127.0.0.1:${port}`,
    getCookie: () => cookie,
    setCookie: (value) => { cookie = value; }
  });
  try {
    assert.equal(AUTH_API.magicLink, "/api/auth/magic-link");
    assert.equal(extractMagicLinkToken("https://ab.example/auth/consume?token=abc"), "abc");
    assert.equal(extractMagicLinkToken("https://ab.example/install?token=abc"), "");
    const invalid = await api.requestMagicLink("nope");
    assert.equal(invalid.ok, false);

    const rawSend = await fetch(`http://127.0.0.1:${port}/api/auth/magic-link`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "buyer@example.com" })
    });
    const sentBody = await rawSend.json();
    assert.equal(sentBody.ok, true);
    assert.equal(sentBody.token, undefined);
    assert.equal(Object.hasOwn(sentBody, "token"), false);
    assert.deepEqual(Object.keys(sentBody), ["ok"]);

    let state = finishSplash(createNativeFlow());
    state = setEmail(state, " Buyer@Example.com ");
    state = await submitMagicLink(state, api);
    assert.equal(state.screen, "sent");

    const outbox = await fetch(`http://127.0.0.1:${port}/api/dev/outbox`).then((res) => res.json());
    const url = outbox.items[0].url;
    assert.match(url, /\/auth\/consume\?token=/);
    state = await consumeOpenedLink(state, api, url);
    assert.equal(state.screen, "notice");
    assert.equal(state.session.user.email, "buyer@example.com");
    assert.equal(state.session.notice, "no-local-draft");
    assert.equal(state.session.workspace.acceptedPartner, false);
    assert.ok(state.session.workspace.id);
    assert.equal(state.session.workspace.role, "buyer");
    assert.match(cookie, /ab_session=/);

    state = await acknowledgeLoginNotice(state, api);
    assert.equal(state.screen, "workspace");
    assert.equal(state.session.notice, null);
    assert.equal(nativeCanOpenPack(state.session), false);

    const restored = await restoreSessionAfterSplash(createNativeFlow(), api);
    assert.equal(restored.screen, "workspace");
    assert.equal(restored.session.user.email, "buyer@example.com");
    assert.equal(nativeCanOpenPack(restored.session), false);

    const noticeHtml = renderS2LoginNoticeScreen({ email: "buyer@example.com", error: S2_ERRORS.failed });
    assert.match(noticeHtml, /로그인 링크를 보내지 못했어요/);

    const failed = requestLinkFailed(finishSplash(createNativeFlow()), "expired");
    assert.match(failed.error, /만료/);
    const back = backToSignup({ ...finishSplash(createNativeFlow()), sentEmail: "buyer@example.com" });
    assert.equal(back.screen, "signup");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("S0 S2 S3 files stay out of web and omit Kakao, payment, install, and pack CTA", async () => {
  const names = await readdir("mobile");
  assert.ok(names.includes("S0SplashScreen.swift"));
  assert.ok(names.includes("S2SignupScreen.kt"));
  assert.ok(names.includes("S3WorkspaceCreatedScreen.swift"));
  const texts = await Promise.all([
    ...nativeFiles.map((file) => readFile(file, "utf8")),
    readFile("mobile/s0-s2-s3-flow.js", "utf8"),
    readFile("mobile/s0-s2-s3-api.js", "utf8"),
    readFile("mobile/s0-s2-s3-preview.html", "utf8")
  ]);
  for (const text of texts) {
    assert.equal(text.includes("Kakao.Auth"), false);
    assert.equal(text.includes("kauth.kakao.com"), false);
    assert.equal(text.includes("accounts.kakao.com"), false);
    assert.equal(text.includes("카카오 로그인"), false);
    assert.equal(text.includes("29,000"), false);
    assert.equal(text.includes("apps.apple.com"), false);
    assert.equal(text.includes("play.google.com"), false);
    assert.equal(text.includes("결혼 팩 시작하기"), false);
    assert.equal(text.includes("앱을 설치하면 시작할 수 있어요"), false);
    assert.equal(text.includes("\r\n"), false);
    assert.ok(text.trim());
  }
  const s2 = texts[2] + texts[3];
  assert.match(s2, /암호 없이 이메일로 로그인 링크를 보내드려요/);
  assert.match(s2, /로그인 링크 보내기/);
  assert.match(s2, /메일을 확인해 주세요\. 링크는 10분 동안만 유효해요/);
  assert.match(s2, /이 기기 임시 답은 이어지지 않아요/);
  const s3 = texts[4] + texts[5];
  assert.match(s3, /워크스페이스가 만들어졌어요/);
  assert.match(s3, /파트너 초대하기/);
  const api = texts[6] + texts[7];
  assert.match(api, /\/api\/auth\/magic-link/);
  assert.match(api, /\/api\/auth\/consume/);
  assert.match(api, /\/api\/auth\/session/);
  assert.match(api, /\/api\/auth\/ack-notice/);
  const hosts = texts[8] + texts[9];
  assert.match(hosts, /currentSession/);
  assert.match(hosts, /acknowledgeNotice/);
  assert.equal(s0ShowsInstallLanding(), false);
  for (const html of [
    renderS0SplashScreen(),
    renderS2SignupScreen(),
    renderS2SentScreen(),
    renderS2LoginNoticeScreen(),
    renderS3WorkspaceCreatedScreen()
  ]) {
    assert.equal(screenForbidsPackAndInstall(html), true);
  }
});
