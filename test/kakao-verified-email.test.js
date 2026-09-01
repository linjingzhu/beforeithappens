import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import {
  OAUTH_PROFILE_ENDPOINTS,
  OAUTH_TOKEN_ENDPOINTS,
  createOAuthState,
  exchangeOAuthCode
} from "../server/oauth.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";

const KAKAO_REDIRECT = "https://ab.example/api/auth/oauth/kakao/callback";

const WIRED_ENV = {
  AB_OAUTH_KAKAO_CLIENT_ID: "kakao-id",
  AB_OAUTH_KAKAO_CLIENT_SECRET: "kakao-secret",
  AB_OAUTH_STATE_SECRET: "state-secret-for-kakao-tests"
};

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

function kakaoFetch(account, { id = "kakao-sub-1" } = {}) {
  return async (url) => {
    if (String(url) === OAUTH_TOKEN_ENDPOINTS.kakao) {
      return { status: 200, json: async () => ({ access_token: "at-kakao" }) };
    }
    if (String(url) === OAUTH_PROFILE_ENDPOINTS.kakao) {
      return { status: 200, json: async () => ({ id, kakao_account: account }) };
    }
    throw new Error(`unexpected fetch: ${url}`);
  };
}

/** The real callback path: token exchange, then completeOAuth with what it read. */
async function kakaoLogin(auth, account, options = {}) {
  const exchanged = await exchangeOAuthCode({
    provider: "kakao",
    code: "auth-code",
    redirectUri: KAKAO_REDIRECT,
    env: WIRED_ENV,
    fetchImpl: kakaoFetch(account, options)
  });
  assert.equal(exchanged.ok, true);
  return {
    exchanged,
    login: auth.completeOAuth({
      provider: exchanged.provider,
      providerUserId: exchanged.providerUserId,
      email: exchanged.email
    })
  };
}

test("a verified Kakao email logs in without the email-bind gate", async () => {
  const { auth } = system();
  const { exchanged, login } = await kakaoLogin(auth, {
    is_email_valid: true,
    is_email_verified: true,
    email: " Friend@Kakao.com "
  });
  assert.equal(exchanged.email, "friend@kakao.com");
  assert.equal(login.ok, true);
  const session = auth.sessionFor(login.sessionId);
  assert.equal(session.user.email, "friend@kakao.com");
  assert.equal(session.user.needsEmail, false);
});

test("a verified Kakao email can accept an email-bound invite with no mail delivery", async () => {
  const { auth, couple } = system();
  const owner = auth.consumeMagicLink(auth.requestMagicLink("owner@example.com").token);
  const invite = couple.issueInvite(owner.sessionId, "friend@kakao.com");
  assert.equal(invite.ok, true);

  const { login } = await kakaoLogin(auth, {
    is_email_valid: true,
    is_email_verified: true,
    email: "friend@kakao.com"
  });
  const accepted = couple.acceptInvite(login.sessionId, invite.token);
  assert.equal(accepted.ok, true);
  assert.equal(auth.sessionFor(login.sessionId).workspace.acceptedPartner, true);
});

test("an unverified Kakao email is dropped and still needs the email-bind gate", async () => {
  const { auth } = system();
  const denied = await kakaoLogin(auth, {
    is_email_valid: true,
    is_email_verified: false,
    email: "friend@kakao.com"
  }, { id: "kakao-sub-denied" });
  assert.equal(denied.exchanged.email, "");
  assert.equal(auth.sessionFor(denied.login.sessionId).user.needsEmail, true);

  // Flags absent entirely: Kakao affirmed nothing, so nothing is trusted.
  const silent = await kakaoLogin(auth, { email: "friend@kakao.com" }, { id: "kakao-sub-silent" });
  const silentSession = auth.sessionFor(silent.login.sessionId);
  assert.equal(silentSession.user.email, "");
  assert.equal(silentSession.user.needsEmail, true);
});

test("an unverified Kakao email never merges into an existing account", async () => {
  const { auth } = system();
  const victim = auth.consumeMagicLink(auth.requestMagicLink("victim@example.com").token);
  const { login } = await kakaoLogin(auth, {
    is_email_verified: false,
    email: "victim@example.com"
  }, { id: "kakao-sub-unverified" });
  assert.equal(auth.sessionFor(login.sessionId).user.email, "");
  assert.equal(auth.sessionFor(victim.sessionId).user.email, "victim@example.com");
});

test("a forged completeOAuth call cannot claim a Kakao email", () => {
  const { auth } = system();
  const victim = auth.consumeMagicLink(auth.requestMagicLink("victim@example.com").token);
  const attack = auth.completeOAuth({
    provider: "kakao",
    providerUserId: "attacker-k",
    email: "victim@example.com"
  });
  assert.equal(attack.ok, true);
  assert.equal(auth.sessionFor(attack.sessionId).user.email, "");
  assert.equal(auth.sessionFor(attack.sessionId).user.needsEmail, true);
  assert.equal(auth.sessionFor(victim.sessionId).user.email, "victim@example.com");
});

test("a verified-email claim is bound to one identity and is single use", async () => {
  const { auth } = system();
  await exchangeOAuthCode({
    provider: "kakao",
    code: "auth-code",
    redirectUri: KAKAO_REDIRECT,
    env: WIRED_ENV,
    fetchImpl: kakaoFetch(
      { is_email_valid: true, is_email_verified: true, email: "friend@kakao.com" },
      { id: "kakao-sub-owner" }
    )
  });

  // Another Kakao subject cannot spend a claim minted for kakao-sub-owner.
  const thief = auth.completeOAuth({
    provider: "kakao",
    providerUserId: "kakao-sub-thief",
    email: "friend@kakao.com"
  });
  assert.equal(auth.sessionFor(thief.sessionId).user.email, "");

  // Neither can a different provider name.
  const crossProvider = auth.completeOAuth({
    provider: "naver",
    providerUserId: "kakao-sub-owner",
    email: "friend@kakao.com"
  });
  assert.equal(auth.sessionFor(crossProvider.sessionId).user.email, "");

  // The rightful identity spends it once.
  const first = auth.completeOAuth({
    provider: "kakao",
    providerUserId: "kakao-sub-owner",
    email: "friend@kakao.com"
  });
  assert.equal(auth.sessionFor(first.sessionId).user.email, "friend@kakao.com");

  // A replay of the same call with no fresh exchange is not trusted: the
  // second Kakao subject stays on the email-bind gate.
  const replay = auth.completeOAuth({
    provider: "kakao",
    providerUserId: "kakao-sub-replay",
    email: "friend@kakao.com"
  });
  assert.equal(auth.sessionFor(replay.sessionId).user.email, "");
  assert.equal(auth.sessionFor(replay.sessionId).user.needsEmail, true);
});

test("the dev OAuth routes cannot forge a verified Kakao email over HTTP", async () => {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const server = createServer(createListener({
    auth,
    couple,
    root: process.cwd(),
    allowDevOutbox: true,
    allowDevOAuth: true,
    oauthEnv: WIRED_ENV,
    mailEnv: {}
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    const victim = auth.consumeMagicLink(auth.requestMagicLink("victim@example.com").token);

    const posted = await fetch(`http://127.0.0.1:${port}/api/dev/oauth/complete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ provider: "kakao", providerUserId: "dev-k", email: "victim@example.com" })
    });
    const postedBody = await posted.json();
    assert.equal(posted.status, 200);
    assert.equal(postedBody.session.user.email, "");
    assert.equal(postedBody.session.user.needsEmail, true);

    const stub = await fetch(
      `http://127.0.0.1:${port}/api/auth/oauth/kakao/callback?dev=1&sub=dev-k2&email=victim%40example.com`,
      { headers: { accept: "application/json" }, redirect: "manual" }
    );
    const stubBody = await stub.json();
    assert.equal(stub.status, 200);
    assert.equal(stubBody.session.user.email, "");
    assert.equal(stubBody.session.user.needsEmail, true);

    assert.equal(auth.sessionFor(victim.sessionId).user.email, "victim@example.com");
  } finally {
    server.close();
  }
});

test("the live Kakao callback issues a session with the verified email", async () => {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const server = createServer(createListener({
    auth,
    couple,
    root: process.cwd(),
    allowDevOAuth: false,
    oauthEnv: WIRED_ENV,
    oauthFetch: kakaoFetch(
      { is_email_valid: true, is_email_verified: true, email: "friend@kakao.com" },
      { id: "kakao-live-1" }
    ),
    mailEnv: {}
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  try {
    const state = createOAuthState({ provider: "kakao", env: WIRED_ENV });
    const response = await fetch(
      `http://127.0.0.1:${port}/api/auth/oauth/kakao/callback?code=live-code&state=${encodeURIComponent(state)}`,
      { headers: { accept: "application/json" }, redirect: "manual" }
    );
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.session.user.email, "friend@kakao.com");
    assert.equal(payload.session.user.needsEmail, false);
  } finally {
    server.close();
  }
});

test("pair-code join works for a Kakao account that has no email at all", async () => {
  const { auth, couple } = system();
  const owner = auth.consumeMagicLink(auth.requestMagicLink("owner@example.com").token);
  const pair = couple.ensurePairCode(owner.sessionId);
  assert.equal(pair.ok, true);

  const friend = auth.completeOAuth({ provider: "kakao", providerUserId: "k-no-email" });
  assert.equal(auth.sessionFor(friend.sessionId).user.needsEmail, true);

  const joined = couple.connectByPairCode(friend.sessionId, pair.display);
  assert.equal(joined.ok, true);
  assert.equal(auth.sessionFor(friend.sessionId).workspace.acceptedPartner, true);
  assert.equal(auth.sessionFor(owner.sessionId).workspace.acceptedPartner, true);
});
