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
import { AUTH_API, AUTH_FETCH_MS, OAUTH_FETCH_MS, SESSION_FETCH_MS, createAuthApi, extractMagicLinkToken } from "../mobile/s0-s2-s3-api.js";
import { finishHostOpen } from "../mobile/s4-invite/host-mount.js";
import { SPLASH_MS } from "../mobile/src/copy.js";
import { finishHostSplash, splashOpenResult } from "../mobile/src/session.js";
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
  s2SocialStartLabels,
  s3AllowsPackCta,
  s3HasPayment,
  setEmail,
  socialStartPending,
  startSocialLogin,
  submitMagicLink
} from "../mobile/s0-s2-s3-flow.js";
import {
  renderNativeScreen,
  renderPackDetailScreen,
  renderS0SplashScreen,
  renderS2LoginNoticeScreen,
  renderS2SentScreen,
  renderS2EmailBindScreen,
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
    mailEnv: {},
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
  assert.equal(S2_COPY.body, "비밀번호 없이 이메일로 로그인 링크를 보내드려요.");
  assert.equal(S2_COPY.cta, "로그인 링크 보내기");
  assert.equal(S2_COPY.sent, "메일을 확인해 주세요. 링크는 10분 동안만 유효해요.");
  assert.equal(S2_COPY.afterLogin, "이 기기 임시 답은 이어지지 않아요.");
  assert.equal(S2_COPY.title, "두 사람의 결혼 준비, 한곳에");
  assert.equal(S2_COPY.title, AUTH_COPY.title);
  assert.equal(S2_COPY.body, AUTH_COPY.body);
  assert.equal(S2_COPY.cta, AUTH_COPY.cta);
  assert.equal(S2_COPY.sent, AUTH_COPY.sent);
  assert.equal(S2_COPY.afterLogin, AUTH_COPY.afterLogin);
  assert.equal(S2_COPY.title.includes("한곳에"), true);
  assert.equal(S2_COPY.sent.includes("유효해요"), true);
  assert.equal(S2_COPY.sent.includes("유횤"), false);
  assert.equal(S2_COPY.body.includes("비밀번호 없이"), true);
  assert.equal(S2_COPY.body.includes("암호 없이"), false);
  assert.equal(S2_ERRORS.expired, AUTH_ERRORS.expired);
  assert.equal(APP_TTL, MAGIC_LINK_TTL_MS);
  assert.equal(APP_TTL, 10 * 60 * 1000);
});

test("S0 splash is brand-only and S3 is workspace-created with invite CTA", () => {
  assert.equal(S0_COPY.brand, "LoveMe");
  assert.equal(S0_COPY.title, "두 사람의 결혼 준비, 한곳에");
  assert.equal(S0_COPY.holdMs, 1200);
  assert.equal(S3_COPY.created, "워크스페이스가 만들어졌어요.");
  assert.equal(S3_COPY.inviteCta, "파트너 초대하기");
  const splash = renderS0SplashScreen();
  const workspace = renderS3WorkspaceCreatedScreen({ email: "buyer@example.com" });
  assert.match(splash, /LoveMe/);
  assert.match(splash, /두 사람의 결혼 준비, 한곳에/);
  assert.equal(splash.includes("앱 설치하기"), false);
  assert.equal(splash.includes("/install"), false);
  assert.match(workspace, /워크스페이스가 만들어졌어요/);
  assert.match(workspace, /파트너 초대하기/);
  assert.equal(workspace.includes(FORBIDDEN_APP_COPY.packCta), false);
  assert.equal(workspace.includes("data-action=\"open-pack\""), false);
});

test("native flow is splash → login, never unauthenticated cover or pack", () => {
  let state = createNativeFlow();
  assert.equal(resolveNativeScreen(state), "splash");
  assert.equal(s0ShowsInstallLanding(), false);
  state = finishSplash(state);
  assert.equal(state.screen, "signup");
  const signup = renderS2SignupScreen({ email: "" });
  assert.match(signup, /두 사람의 결혼 준비, 한곳에/);
  assert.match(signup, /비밀번호 없이 이메일로 로그인 링크를 보내드려요/);
  assert.match(signup, /로그인 링크 보내기/);
  assert.equal(signup.includes("이 답을 남기려면 로그인해 주세요"), false);
  assert.equal(signup.includes("카카오로 시작"), false);
  assert.equal(signup.includes("네이버로 시작"), false);
  assert.equal(signup.includes("Google로 시작"), false);
  assert.equal(signup.includes("type=\"password\""), false);
  assert.equal(s2HasKakaoLogin(), false);
  assert.deepEqual(s2SocialStartLabels(), []);
  assert.equal(signup.includes("카카오톡"), false);
  const bind = renderS2EmailBindScreen();
  assert.match(bind, /이메일을 연결해 주세요/);
  assert.match(bind, /이메일 연결하기/);

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
  assert.equal(state.screen, "pack-list");
  assert.equal(nativeCanOpenPack(state.session), false);
  assert.equal(canOpenPack(state.session), false);
  assert.equal(s3AllowsPackCta(state), false);
  assert.equal(s3HasPayment(), false);
  assert.equal(state.action, "");
  assert.equal(renderNativeScreen(state).includes(FORBIDDEN_APP_COPY.packCta), false);
  assert.match(renderNativeScreen(state), /질문집/);
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
    assert.equal(extractMagicLinkToken("loveme:///auth/consume?token=abc"), "abc");
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
    assert.match(url, /loveme:\/\/\/auth\/consume\?token=/);
    assert.equal(url.includes("https://"), false);
    state = await consumeOpenedLink(state, api, url);
    assert.equal(state.screen, "notice");
    assert.equal(state.session.user.email, "buyer@example.com");
    assert.equal(state.session.notice, "no-local-draft");
    assert.equal(state.session.workspace.acceptedPartner, false);
    assert.ok(state.session.workspace.id);
    assert.equal(state.session.workspace.role, "buyer");
    assert.match(cookie, /ab_session=/);

    state = await acknowledgeLoginNotice(state, api);
    assert.equal(state.screen, "pack-list");
    assert.equal(state.session.notice, null);
    assert.equal(nativeCanOpenPack(state.session), false);

    const restored = await restoreSessionAfterSplash(createNativeFlow(), api);
    assert.equal(restored.screen, "pack-list");
    assert.equal(restored.session.user.email, "buyer@example.com");
    assert.equal(nativeCanOpenPack(restored.session), false);
    assert.ok(SESSION_FETCH_MS <= 2000);

    const noticeHtml = renderS2LoginNoticeScreen({ email: "buyer@example.com", error: S2_ERRORS.failed });
    assert.match(noticeHtml, /로그인 링크를 보내지 못했어요/);

    const failed = requestLinkFailed(finishSplash(createNativeFlow()), "expired");
    assert.match(failed.error, /만료/);
  const back = backToSignup({
    ...finishSplash(createNativeFlow()),
    sentEmail: "buyer@example.com"
  });
    assert.equal(back.screen, "signup");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("empty origin or rejected fetch still leaves splash after 1.2s", async () => {
  assert.equal(SPLASH_MS, 1200);
  assert.equal(S0_COPY.holdMs, 1200);
  assert.ok(SESSION_FETCH_MS > 0 && SESSION_FETCH_MS <= 2000);

  const mustNotFetch = async () => {
    throw new Error("session fetch must not run when origin is empty");
  };
  const emptyOrigin = createAuthApi({ origin: "", fetchImpl: mustNotFetch });
  const fromEmpty = await restoreSessionAfterSplash(createNativeFlow(), emptyOrigin);
  assert.equal(fromEmpty.splashDone, true);
  assert.equal(fromEmpty.screen, "signup");
  assert.equal(fromEmpty.session?.user ?? null, null);

  const hostEmpty = await finishHostSplash(createNativeFlow(), emptyOrigin);
  assert.equal(hostEmpty.splashDone, true);
  assert.equal(hostEmpty.screen, "signup");

  const openedEmpty = await finishHostOpen(
    createNativeFlow(),
    emptyOrigin,
    { preview: async () => ({ payload: {} }) },
    { pathname: "/", search: "" }
  );
  assert.equal(openedEmpty.splashDone, true);
  assert.equal(openedEmpty.screen, "signup");

  const rejected = createAuthApi({
    origin: "https://example.test",
    fetchImpl: async () => {
      throw new Error("rejected");
    }
  });
  const fromReject = await restoreSessionAfterSplash(createNativeFlow(), rejected);
  assert.equal(fromReject.splashDone, true);
  assert.equal(fromReject.screen, "signup");

  const hanging = createAuthApi({
    origin: "https://example.test",
    fetchImpl: () => new Promise(() => {}),
    sessionTimeoutMs: 20
  });
  const fromHang = await restoreSessionAfterSplash(createNativeFlow(), hanging, { timeoutMs: 20 });
  assert.equal(fromHang.splashDone, true);
  assert.equal(fromHang.screen, "signup");

  const opened = createNativeFlow();
  assert.equal(splashOpenResult(opened, { screen: "splash" }).screen, "signup");
  assert.equal(splashOpenResult(opened, { splashDone: true, screen: "signup" }).screen, "signup");
  assert.equal(splashOpenResult(opened, { splashDone: true, screen: "workspace" }).screen, "workspace");

  const app = await readFile("mobile/App.js", "utf8");
  assert.match(app, /SPLASH_MS/);
  assert.match(app, /finishHostOpen/);
  assert.match(app, /finishHostSplash/);
  assert.match(app, /finishSplash\(opened\)/);
  assert.equal(app.includes("tap-to-continue"), false);
  assert.equal(app.includes("계속하려면 탭"), false);
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
  assert.match(s2, /비밀번호 없이 이메일로 로그인 링크를 보내드려요/);
  assert.match(s2, /로그인 링크 보내기/);
  assert.match(s2, /메일을 확인해 주세요\. 링크는 10분 동안만 유효해요/);
  assert.match(s2, /이 기기 임시 답은 이어지지 않아요/);
  assert.match(s2, /질문은 나만 먼저 답해요\./);
  assert.match(s2, /파트너가 연결된 다음 질문이 열려요/);
  assert.equal(s2.includes("이 답을 남기려면 로그인해 주세요"), false);
  assert.equal(s2.includes("카카오로 시작"), false);
  assert.equal(s2.includes("네이버로 시작"), false);
  assert.equal(s2.includes("Google로 시작"), false);
  const s3 = texts[4] + texts[5];
  assert.match(s3, /워크스페이스가 만들어졌어요/);
  assert.match(s3, /파트너 초대하기/);
  const api = texts[6] + texts[7];
  assert.match(api, /\/api\/auth\/magic-link/);
  assert.match(api, /\/api\/auth\/consume/);
  assert.match(api, /\/api\/auth\/session/);
  assert.match(api, /\/api\/auth\/ack-notice/);
  assert.match(api, /\/api\/auth\/oauth\/start/);
  assert.match(api, /\/api\/auth\/email-bind/);
  const hosts = texts[8] + texts[9];
  assert.match(hosts, /currentSession/);
  assert.match(hosts, /acknowledgeNotice/);
  assert.equal(s0ShowsInstallLanding(), false);
  for (const html of [
    renderS0SplashScreen(),
    renderPackDetailScreen(),
    renderS2SignupScreen(),
    renderS2SentScreen(),
    renderS2EmailBindScreen(),
    renderS2LoginNoticeScreen(),
    renderS3WorkspaceCreatedScreen()
  ]) {
    assert.equal(screenForbidsPackAndInstall(html), true);
  }
});

function jsonResponse({ ok = true, status = 200, payload = {} } = {}) {
  return {
    ok,
    status,
    headers: { getSetCookie: () => [], get: () => null },
    json: async () => payload
  };
}

test("signup taps persist with the keyboard open and errors sit under the CTA", async () => {
  const screens = await readFile("mobile/src/screens.js", "utf8");
  const app = await readFile("mobile/App.js", "utf8");
  assert.match(screens, /keyboardShouldPersistTaps="handled"/);
  assert.match(screens, /KeyboardAvoidingView/);
  assert.match(screens, /ScrollView/);
  assert.match(screens, /\(\{ pressed \}\)/);
  assert.match(screens, /styles\.pressed/);

  const signup = screens.slice(screens.indexOf("export function SignupScreen"), screens.indexOf("export function EmailBindScreen"));
  const bind = screens.slice(screens.indexOf("export function EmailBindScreen"), screens.indexOf("export function SentScreen"));
  assert.match(screens, /function AuthKeyboardShell/);
  assert.match(signup, /pressableStyle\(styles\.primary/);
  assert.equal(signup.includes("pressableStyle(styles.secondary"), false);
  assert.match(signup, /testID="signup"/);
  assert.match(signup, /S2_COPY.title/);
  assert.match(signup, /S2_COPY.body/);
  assert.match(bind, /<AuthKeyboardShell testID="bind">/);
  const ctaAt = signup.indexOf("AUTH_COPY.cta");
  const errorAt = signup.indexOf("{error ?");
  assert.ok(ctaAt >= 0 && errorAt > ctaAt);
  assert.equal(signup.includes("testID=\"signup-kakao\""), false);
  assert.equal(signup.includes("onStartKakao"), false);
  assert.equal(signup.includes("카카오로 시작"), false);

  const html = renderS2SignupScreen({ error: S2_ERRORS["invalid-email"] });
  const htmlErrorAt = html.indexOf(S2_ERRORS["invalid-email"]);
  assert.ok(html.indexOf(S2_COPY.cta) < htmlErrorAt);
  assert.equal(html.includes("oauth-kakao"), false);
  assert.equal(html.includes("카카오로 시작"), false);
  const unconfigured = renderS2SignupScreen({ error: S2_ERRORS["oauth-unconfigured"] });
  assert.equal(unconfigured.includes("oauth-kakao"), false);
  assert.equal(unconfigured.includes("카카오로 시작"), false);
  assert.match(unconfigured, /이 로그인은 아직 준비 중이에요/);

  const submit = app.slice(app.indexOf("onSubmitEmail"), app.indexOf("state.screen === \"bind\""));
  assert.match(submit, /requestLinkStarted/);
  assert.ok(submit.indexOf("setState(started)") < submit.indexOf("await sendHostMagicLink"));
  assert.equal(app.includes("startHostSocial"), false);
  assert.equal(app.includes("onStartKakao"), false);
});

test("502 magic-link failed copy sits under the CTA", async () => {
  const from502 = createAuthApi({
    origin: "https://example.test",
    fetchImpl: async () => jsonResponse({
      ok: false,
      status: 502,
      payload: { ok: false, error: "failed" }
    })
  });
  const result = await from502.requestMagicLink("buyer@example.com");
  assert.equal(result.ok, false);
  assert.equal(result.error, "failed");

  const empty502 = createAuthApi({
    origin: "https://example.test",
    fetchImpl: async () => jsonResponse({ ok: false, status: 502, payload: {} })
  });
  assert.equal((await empty502.requestMagicLink("buyer@example.com")).error, "failed");

  const state = await submitMagicLink(
    requestLinkStarted(setEmail(finishSplash(createNativeFlow()), "buyer@example.com")),
    from502
  );
  assert.equal(state.busy, false);
  assert.equal(state.error, S2_ERRORS.failed);
  assert.equal(state.error, "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요.");

  const html = renderS2SignupScreen({ error: state.error });
  const failedAt = html.indexOf(S2_ERRORS.failed);
  assert.ok(html.indexOf(S2_COPY.cta) < failedAt);
  assert.equal(html.includes("oauth-kakao"), false);
  assert.equal(html.includes("카카오로 시작"), false);
});

test("magic-link waits out a cold start; oauth stays fail-fast", async () => {
  assert.ok(AUTH_FETCH_MS >= 20000 && AUTH_FETCH_MS <= 30000);
  assert.ok(OAUTH_FETCH_MS >= 2000 && OAUTH_FETCH_MS <= 8000);
  assert.ok(OAUTH_FETCH_MS < AUTH_FETCH_MS);

  const delayedOk = createAuthApi({
    origin: "https://example.test",
    fetchImpl: () => new Promise((resolve) => {
      setTimeout(() => resolve(jsonResponse({ ok: true, status: 200, payload: { ok: true } })), 40);
    }),
    authTimeoutMs: 80,
    oauthTimeoutMs: 10
  });
  const slowSend = await delayedOk.requestMagicLink("buyer@example.com");
  assert.equal(slowSend.ok, true);
  const oauthTooSlow = await delayedOk.startOAuth("kakao");
  assert.equal(oauthTooSlow.ok, false);
  assert.equal(oauthTooSlow.error, "oauth-unconfigured");
  const slowState = await submitMagicLink(
    requestLinkStarted(setEmail(finishSplash(createNativeFlow()), "buyer@example.com")),
    delayedOk
  );
  assert.equal(slowState.screen, "sent");
  assert.equal(slowState.error, "");

  const hanging = createAuthApi({
    origin: "https://example.test",
    fetchImpl: () => new Promise(() => {}),
    authTimeoutMs: 20,
    oauthTimeoutMs: 20
  });
  const hungLink = await hanging.requestMagicLink("buyer@example.com");
  assert.equal(hungLink.ok, false);
  assert.equal(hungLink.error, "failed");
  const hungState = await submitMagicLink(
    requestLinkStarted(setEmail(finishSplash(createNativeFlow()), "buyer@example.com")),
    hanging
  );
  assert.equal(hungState.busy, false);
  assert.equal(hungState.error, S2_ERRORS.failed);
  assert.equal(hungState.error, "로그인 링크를 보내지 못했어요. 잠시 후 다시 시도해 주세요.");

  const from501 = createAuthApi({
    origin: "https://example.test",
    fetchImpl: async () => jsonResponse({
      ok: false,
      status: 501,
      payload: { error: "oauth-unconfigured" }
    })
  });
  const started = await from501.startOAuth("kakao");
  assert.equal(started.ok, false);
  assert.equal(started.error, "oauth-unconfigured");

  const empty501 = createAuthApi({
    origin: "https://example.test",
    fetchImpl: async () => jsonResponse({ ok: false, status: 501, payload: {} })
  });
  assert.equal((await empty501.startOAuth("naver")).error, "oauth-unconfigured");

  const pending = socialStartPending(finishSplash(createNativeFlow()));
  assert.equal(pending.busy, true);
  const failed = await startSocialLogin(pending, from501, "kakao");
  assert.equal(failed.busy, false);
  assert.equal(failed.error, S2_ERRORS["oauth-unconfigured"]);
  assert.equal(failed.error, "이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요.");

  const hungOauth = await startSocialLogin(finishSplash(createNativeFlow()), hanging, "google");
  assert.equal(hungOauth.error, S2_ERRORS["oauth-unconfigured"]);
});
