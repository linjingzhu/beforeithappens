import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { AUTH_COPY, AUTH_ERRORS, EMAIL_BIND_COPY, INVITE_COPY, SOCIAL_COPY, resolveInviteAcceptError, userNeedsEmail } from "../src/auth.js";
import { renderInviteAccept, renderOnboarding } from "../src/auth-ui.js";
import { createAuth } from "../server/auth.mjs";
import { isOAuthConfigured, oauthAuthorizeUrl, oauthEnvFlags } from "../server/oauth.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { consumeSucceeded, createNativeFlow, finishSplash, oauthStartFailed, resolveNativeScreen } from "../mobile/s0-s2-s3-flow.js";
import { renderNativeScreen } from "../mobile/s0-s2-s3-screens.js";
import { assertLockedS2SocialCopy, S2_COPY, S2_EMAIL_BIND_COPY, S2_ERRORS, S2_SOCIAL_COPY } from "../mobile/s0-s2-s3-copy.js";
import { S4_COPY } from "../mobile/s4-invite/copy.js";

function system() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  return { auth, couple, store };
}

test("S2 social copy is locked and is not S4 KakaoTalk share", async () => {
  assert.equal(assertLockedS2SocialCopy(), true);
  assert.equal(SOCIAL_COPY.kakao, "카카오로 시작");
  assert.equal(SOCIAL_COPY.oauthUnconfigured, "이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요.");
  assert.equal(AUTH_ERRORS["oauth-unconfigured"], SOCIAL_COPY.oauthUnconfigured);
  assert.equal(S2_ERRORS["oauth-unconfigured"], S2_SOCIAL_COPY.oauthUnconfigured);
  assert.equal(EMAIL_BIND_COPY.title, "이메일을 연결해 주세요.");
  assert.equal(EMAIL_BIND_COPY.cta, "이메일 연결하기");
  assert.equal(S2_EMAIL_BIND_COPY.title, EMAIL_BIND_COPY.title);
  assert.equal(S2_EMAIL_BIND_COPY.cta, EMAIL_BIND_COPY.cta);
  assert.equal(S2_COPY.title, AUTH_COPY.title);
  assert.equal(S2_COPY.body, AUTH_COPY.body);
  assert.equal(S2_COPY.cta, AUTH_COPY.cta);
  assert.equal(S2_COPY.sent, AUTH_COPY.sent);
  assert.equal(S4_COPY.kakao, "카카오톡");
  assert.notEqual(SOCIAL_COPY.kakao, INVITE_COPY.kakao);
  const onboarding = renderOnboarding();
  assert.match(onboarding, /비밀번호 없이 이메일로 로그인 링크를 보내드려요/);
  assert.match(onboarding, /로그인 링크 보내기/);
  assert.match(onboarding, /카카오로 시작/);
  assert.equal(onboarding.includes("카카오톡"), false);
  assert.equal(onboarding.includes("카카오 로그인"), false);
  const stub = oauthStartFailed(finishSplash(createNativeFlow()));
  assert.equal(stub.error, S2_SOCIAL_COPY.oauthUnconfigured);
  const native = [
    await readFile("mobile/S2SignupScreen.swift", "utf8"),
    await readFile("mobile/S2SignupScreen.kt", "utf8"),
    await readFile("mobile/LoveMeS0S2S3Host.swift", "utf8"),
    await readFile("mobile/LoveMeS0S2S3Host.kt", "utf8")
  ].join("\n");
  assert.match(native, /이메일을 연결해 주세요\./);
  assert.match(native, /이메일 연결하기/);
  assert.match(native, /이 로그인은 아직 준비 중이에요\. 이메일 링크로 시작해 주세요\./);
  assert.equal(native.includes("카카오로 시작"), false);
  assert.equal(native.includes("네이버로 시작"), false);
  assert.equal(native.includes("Google로 시작"), false);
  assert.equal(native.includes("onStartKakao"), false);
  assert.equal(native.includes("카카오톡"), false);
});

test("OAuth without client ids stays stubbed behind env flags", () => {
  const env = {};
  assert.equal(isOAuthConfigured("kakao", env), false);
  assert.equal(isOAuthConfigured("naver", env), false);
  assert.equal(isOAuthConfigured("google", env), false);
  assert.deepEqual(oauthEnvFlags(env), { kakao: false, naver: false, google: false });
  assert.equal(oauthAuthorizeUrl("kakao", { origin: "https://ab.example", env }), "");
  const idOnly = { AB_OAUTH_GOOGLE_CLIENT_ID: "google-client" };
  assert.equal(isOAuthConfigured("google", idOnly), false);
  assert.equal(oauthAuthorizeUrl("google", { origin: "https://ab.example", env: idOnly }), "");
  const wired = { AB_OAUTH_GOOGLE_CLIENT_ID: "google-client", AB_OAUTH_GOOGLE_CLIENT_SECRET: "google-secret" };
  assert.equal(isOAuthConfigured("google", wired), true);
  assert.match(oauthAuthorizeUrl("google", { origin: "https://ab.example", env: wired }), /accounts\.google\.com/);
});

test("buyer without a connected email cannot issue an invite", () => {
  const { auth, couple } = system();
  const kakao = auth.completeOAuth({ provider: "kakao", providerUserId: "k-buyer" });
  assert.equal(couple.issueInvite(kakao.sessionId, "partner@example.com").error, "needs-email");
});

test("Kakao and Naver without email create a session that must bind email", () => {
  const { auth } = system();
  const kakao = auth.completeOAuth({ provider: "kakao", providerUserId: "k-1" });
  assert.equal(kakao.ok, true);
  const session = auth.sessionFor(kakao.sessionId);
  assert.equal(session.user.email, "");
  assert.equal(session.user.needsEmail, true);
  assert.equal(userNeedsEmail(session.user), true);

  const naver = auth.completeOAuth({ provider: "naver", providerUserId: "n-1" });
  assert.equal(auth.sessionFor(naver.sessionId).user.needsEmail, true);
});

test("Kakao-supplied email is not trusted for account merge", () => {
  const { auth } = system();
  const victim = auth.consumeMagicLink(auth.requestMagicLink("victim@example.com").token);
  const attack = auth.completeOAuth({
    provider: "kakao",
    providerUserId: "attacker-k",
    email: "victim@example.com"
  });
  assert.equal(auth.sessionFor(attack.sessionId).user.needsEmail, true);
  assert.equal(auth.sessionFor(attack.sessionId).user.email, "");
  assert.equal(auth.sessionFor(victim.sessionId).user.email, "victim@example.com");
});

test("Google with email proceeds immediately; Google without email needs bind", () => {
  const { auth } = system();
  const ready = auth.completeOAuth({
    provider: "google",
    providerUserId: "g-1",
    email: " Partner@Gmail.com "
  });
  const session = auth.sessionFor(ready.sessionId);
  assert.equal(session.user.email, "partner@gmail.com");
  assert.equal(session.user.needsEmail, false);

  const missing = auth.completeOAuth({ provider: "google", providerUserId: "g-2" });
  assert.equal(auth.sessionFor(missing.sessionId).user.needsEmail, true);
});

test("email-bind into an existing user invalidates the guest session", () => {
  const { auth } = system();
  const existing = auth.consumeMagicLink(auth.requestMagicLink("shared@example.com").token);
  const guest = auth.completeOAuth({ provider: "kakao", providerUserId: "k-guest" });
  const bind = auth.requestEmailBind(guest.sessionId, "shared@example.com");
  const merged = auth.consumeMagicLink(bind.token);
  assert.equal(auth.sessionFor(guest.sessionId).user, null);
  assert.equal(auth.sessionFor(existing.sessionId).user, null);
  assert.equal(auth.sessionFor(merged.sessionId).user.email, "shared@example.com");
  assert.equal(auth.sessionFor(merged.sessionId).user.needsEmail, false);
});

test("email bind then invite accept uses session email as source of truth", () => {
  const { auth, couple } = system();
  const buyer = auth.consumeMagicLink(auth.requestMagicLink("buyer@example.com").token);
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");

  const kakao = auth.completeOAuth({ provider: "kakao", providerUserId: "k-partner" });
  assert.equal(couple.acceptInvite(kakao.sessionId, invite.token).error, "needs-email");
  assert.equal(resolveInviteAcceptError({
    preview: { ok: true, email: "partner@example.com" },
    session: auth.sessionFor(kakao.sessionId)
  }), "needs-email");
  const blocked = renderInviteAccept({
    error: "needs-email",
    preview: { ok: true, email: "partner@example.com" }
  });
  assert.match(blocked, new RegExp(EMAIL_BIND_COPY.title));
  assert.match(blocked, new RegExp(EMAIL_BIND_COPY.cta));
  assert.equal(blocked.includes(INVITE_COPY.accept), false);

  const bind = auth.requestEmailBind(kakao.sessionId, "partner@example.com");
  assert.equal(bind.ok, true);
  const connected = auth.consumeMagicLink(bind.token);
  assert.equal(auth.sessionFor(connected.sessionId).user.email, "partner@example.com");
  assert.equal(auth.sessionFor(connected.sessionId).user.needsEmail, false);
  assert.equal(couple.acceptInvite(connected.sessionId, invite.token).ok, true);
});

test("bound email that does not match the invite still uses mismatch copy", () => {
  const { auth, couple } = system();
  const buyer = auth.consumeMagicLink(auth.requestMagicLink("buyer@example.com").token);
  const invite = couple.issueInvite(buyer.sessionId, "partner@example.com");
  const kakao = auth.completeOAuth({ provider: "kakao", providerUserId: "k-other" });
  const bind = auth.requestEmailBind(kakao.sessionId, "other@example.com");
  const connected = auth.consumeMagicLink(bind.token);
  assert.equal(couple.acceptInvite(connected.sessionId, invite.token).error, "mismatch");
  assert.equal(resolveInviteAcceptError({
    preview: { ok: true, email: "partner@example.com" },
    session: auth.sessionFor(connected.sessionId)
  }), "mismatch");
  assert.match(renderInviteAccept({ error: "mismatch" }), new RegExp(INVITE_COPY.mismatch));
  assert.equal(S2_EMAIL_BIND_COPY.title, EMAIL_BIND_COPY.title);
});

test("native S2 lands on the email-bind screen after OAuth without email", () => {
  let state = finishSplash(createNativeFlow());
  state = consumeSucceeded(state, {
    user: { id: "usr_k", email: "", needsEmail: true },
    notice: "no-local-draft",
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  });
  assert.equal(resolveNativeScreen(state), "bind");
  assert.match(renderNativeScreen(state), /이메일을 연결해 주세요/);
  assert.match(renderNativeScreen(state), /이메일 연결하기/);
});
