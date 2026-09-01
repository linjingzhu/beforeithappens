import test from "node:test";
import assert from "node:assert/strict";
import {
  OAUTH_PROFILE_ENDPOINTS,
  OAUTH_STATE_TTL_MS,
  OAUTH_TOKEN_ENDPOINTS,
  createOAuthState,
  exchangeOAuthCode,
  isOAuthConfigured,
  oauthEnvFlags,
  oauthRedirectUri,
  verifyOAuthState
} from "../server/oauth.mjs";
import { createAuth } from "../server/auth.mjs";
import { createMemoryStore } from "../server/store.mjs";

const REDIRECT = "https://ab.example/api/auth/oauth/kakao/callback";

function wiredEnv(extra = {}) {
  return {
    AB_OAUTH_KAKAO_CLIENT_ID: "kakao-id",
    AB_OAUTH_KAKAO_CLIENT_SECRET: "kakao-secret",
    AB_OAUTH_NAVER_CLIENT_ID: "naver-id",
    AB_OAUTH_NAVER_CLIENT_SECRET: "naver-secret",
    AB_OAUTH_GOOGLE_CLIENT_ID: "google-id",
    AB_OAUTH_GOOGLE_CLIENT_SECRET: "google-secret",
    AB_OAUTH_STATE_SECRET: "state-secret",
    ...extra
  };
}

function jsonResponse(body, status = 200) {
  return { status, json: async () => body };
}

function stubFetch(handlers) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options });
    const handler = handlers[url];
    if (!handler) throw new Error(`unexpected fetch: ${url}`);
    return typeof handler === "function" ? handler(url, options) : handler;
  };
  fetchImpl.calls = calls;
  return fetchImpl;
}

function providerStub(provider, { token = { access_token: "at-1" }, tokenStatus = 200, profile, profileStatus = 200 } = {}) {
  return stubFetch({
    [OAUTH_TOKEN_ENDPOINTS[provider]]: jsonResponse(token, tokenStatus),
    [OAUTH_PROFILE_ENDPOINTS[provider]]: jsonResponse(profile, profileStatus)
  });
}

function formBody(call) {
  return new URLSearchParams(call.options.body);
}

test("configuration needs both a client id and a client secret", () => {
  assert.equal(isOAuthConfigured("kakao", { AB_OAUTH_KAKAO_CLIENT_ID: "id" }), false);
  assert.equal(isOAuthConfigured("kakao", { AB_OAUTH_KAKAO_CLIENT_SECRET: "secret" }), false);
  assert.equal(isOAuthConfigured("kakao", wiredEnv()), true);
  assert.deepEqual(oauthEnvFlags(wiredEnv()), { kakao: true, naver: true, google: true });
  assert.deepEqual(oauthEnvFlags({ AB_OAUTH_NAVER_CLIENT_ID: "id" }), { kakao: false, naver: false, google: false });
  assert.equal(
    oauthRedirectUri("kakao", "https://ab.example/"),
    "https://ab.example/api/auth/oauth/kakao/callback"
  );
});

test("kakao exchange posts the authorization_code grant and returns the account email", async () => {
  const env = wiredEnv();
  const fetchImpl = providerStub("kakao", {
    profile: { id: 4823, kakao_account: { is_email_valid: true, is_email_verified: true, email: " Partner@Kakao.com " } }
  });
  const result = await exchangeOAuthCode({
    provider: "kakao",
    code: "auth-code",
    redirectUri: REDIRECT,
    env,
    fetchImpl
  });
  assert.deepEqual(result, { ok: true, provider: "kakao", providerUserId: "4823", email: "partner@kakao.com" });

  const [tokenCall, profileCall] = fetchImpl.calls;
  assert.equal(tokenCall.url, OAUTH_TOKEN_ENDPOINTS.kakao);
  assert.equal(tokenCall.options.method, "POST");
  const body = formBody(tokenCall);
  assert.equal(body.get("grant_type"), "authorization_code");
  assert.equal(body.get("client_id"), "kakao-id");
  assert.equal(body.get("client_secret"), "kakao-secret");
  assert.equal(body.get("redirect_uri"), REDIRECT);
  assert.equal(body.get("code"), "auth-code");
  assert.equal(profileCall.url, OAUTH_PROFILE_ENDPOINTS.kakao);
  assert.equal(profileCall.options.headers.Authorization, "Bearer at-1");
});

test("naver exchange reads response.id and forwards state to the token endpoint", async () => {
  const fetchImpl = providerStub("naver", {
    profile: { resultcode: "00", message: "success", response: { id: "n-77", email: "partner@naver.com" } }
  });
  const result = await exchangeOAuthCode({
    provider: "naver",
    code: "naver-code",
    redirectUri: "https://ab.example/api/auth/oauth/naver/callback",
    state: "state-value",
    env: wiredEnv(),
    fetchImpl
  });
  assert.deepEqual(result, { ok: true, provider: "naver", providerUserId: "n-77", email: "partner@naver.com" });
  assert.equal(formBody(fetchImpl.calls[0]).get("state"), "state-value");
});

test("google exchange trusts a verified email and drops an unverified one", async () => {
  const verified = await exchangeOAuthCode({
    provider: "google",
    code: "g-code",
    redirectUri: "https://ab.example/api/auth/oauth/google/callback",
    env: wiredEnv(),
    fetchImpl: providerStub("google", { profile: { sub: "g-1", email: "Partner@Gmail.com", email_verified: true } })
  });
  assert.deepEqual(verified, { ok: true, provider: "google", providerUserId: "g-1", email: "partner@gmail.com" });

  const unverified = await exchangeOAuthCode({
    provider: "google",
    code: "g-code",
    redirectUri: "https://ab.example/api/auth/oauth/google/callback",
    env: wiredEnv(),
    fetchImpl: providerStub("google", { profile: { sub: "g-2", email: "spoof@gmail.com", email_verified: false } })
  });
  assert.deepEqual(unverified, { ok: true, provider: "google", providerUserId: "g-2", email: "" });
});

test("a provider that returns no email still completes so the email-bind gate can run", async () => {
  const store = createMemoryStore();
  const auth = createAuth({ store });
  const result = await exchangeOAuthCode({
    provider: "kakao",
    code: "auth-code",
    redirectUri: REDIRECT,
    env: wiredEnv(),
    fetchImpl: providerStub("kakao", { profile: { id: "k-noemail", kakao_account: {} } })
  });
  assert.equal(result.ok, true);
  assert.equal(result.email, "");
  const completed = auth.completeOAuth({
    provider: result.provider,
    providerUserId: result.providerUserId,
    email: result.email
  });
  assert.equal(completed.ok, true);
  assert.equal(auth.sessionFor(completed.sessionId).user.needsEmail, true);
});

test("a kakao email flagged unverified is dropped", async () => {
  const result = await exchangeOAuthCode({
    provider: "kakao",
    code: "auth-code",
    redirectUri: REDIRECT,
    env: wiredEnv(),
    fetchImpl: providerStub("kakao", {
      profile: { id: "k-2", kakao_account: { is_email_verified: false, email: "partner@kakao.com" } }
    })
  });
  assert.deepEqual(result, { ok: true, provider: "kakao", providerUserId: "k-2", email: "" });
});

test("provider errors and bad input never reach completeOAuth", async () => {
  const env = wiredEnv();
  const tokenError = await exchangeOAuthCode({
    provider: "kakao",
    code: "auth-code",
    redirectUri: REDIRECT,
    env,
    fetchImpl: providerStub("kakao", { token: { error: "invalid_grant" }, tokenStatus: 400, profile: {} })
  });
  assert.deepEqual(tokenError, { ok: false, error: "token-exchange-failed" });

  const noToken = await exchangeOAuthCode({
    provider: "google",
    code: "auth-code",
    redirectUri: REDIRECT,
    env,
    fetchImpl: providerStub("google", { token: { token_type: "Bearer" }, profile: { sub: "g-1" } })
  });
  assert.deepEqual(noToken, { ok: false, error: "token-exchange-failed" });

  const profileError = await exchangeOAuthCode({
    provider: "naver",
    code: "auth-code",
    redirectUri: REDIRECT,
    env,
    fetchImpl: providerStub("naver", { profile: { resultcode: "024", message: "Authentication failed" } })
  });
  assert.deepEqual(profileError, { ok: false, error: "profile-failed" });

  const profileStatus = await exchangeOAuthCode({
    provider: "kakao",
    code: "auth-code",
    redirectUri: REDIRECT,
    env,
    fetchImpl: providerStub("kakao", { profile: { id: "k-1" }, profileStatus: 401 })
  });
  assert.deepEqual(profileStatus, { ok: false, error: "profile-failed" });

  const thrown = await exchangeOAuthCode({
    provider: "kakao",
    code: "auth-code",
    redirectUri: REDIRECT,
    env,
    fetchImpl: async () => { throw new Error("network down"); }
  });
  assert.deepEqual(thrown, { ok: false, error: "token-exchange-failed" });

  assert.deepEqual(
    await exchangeOAuthCode({ provider: "facebook", code: "c", redirectUri: REDIRECT, env, fetchImpl: providerStub("kakao") }),
    { ok: false, error: "invalid-provider" }
  );
  assert.deepEqual(
    await exchangeOAuthCode({ provider: "kakao", code: "", redirectUri: REDIRECT, env, fetchImpl: providerStub("kakao") }),
    { ok: false, error: "invalid-code" }
  );
  assert.deepEqual(
    await exchangeOAuthCode({ provider: "kakao", code: "c", redirectUri: "", env, fetchImpl: providerStub("kakao") }),
    { ok: false, error: "invalid-redirect" }
  );
});

test("an unconfigured provider fails before any network call", async () => {
  const fetchImpl = stubFetch({});
  const result = await exchangeOAuthCode({
    provider: "kakao",
    code: "auth-code",
    redirectUri: REDIRECT,
    env: { AB_OAUTH_KAKAO_CLIENT_ID: "kakao-id" },
    fetchImpl
  });
  assert.deepEqual(result, { ok: false, error: "oauth-unconfigured" });
  assert.equal(fetchImpl.calls.length, 0);
});

test("state round-trips, is provider bound, and expires", () => {
  const env = wiredEnv();
  const now = 1_700_000_000_000;
  const state = createOAuthState({ provider: "kakao", env, now });
  assert.deepEqual(verifyOAuthState(state, { provider: "kakao", env, now: now + 1000 }), { ok: true, provider: "kakao" });

  assert.equal(verifyOAuthState(state, { provider: "naver", env, now: now + 1000 }).error, "state-mismatch");
  assert.equal(verifyOAuthState(state, { provider: "kakao", env, now: now + OAUTH_STATE_TTL_MS + 1 }).error, "expired-state");
  assert.equal(verifyOAuthState("", { provider: "kakao", env, now }).error, "invalid-state");
  assert.equal(verifyOAuthState("not-a-state", { provider: "kakao", env, now }).error, "invalid-state");
  assert.equal(
    verifyOAuthState(state, { provider: "kakao", env: { ...env, AB_OAUTH_STATE_SECRET: "other-secret" }, now }).error,
    "invalid-state"
  );

  const parts = state.split(".");
  const tampered = [parts[0], parts[1], String(Number(parts[2]) + 60_000), parts[3], parts[4]].join(".");
  assert.equal(verifyOAuthState(tampered, { provider: "kakao", env, now }).error, "invalid-state");
  assert.notEqual(createOAuthState({ provider: "kakao", env, now }), state);
});

test("no secret, code, or token ever appears in a returned value", async () => {
  const env = wiredEnv();
  const results = [
    await exchangeOAuthCode({
      provider: "kakao",
      code: "auth-code",
      redirectUri: REDIRECT,
      env,
      fetchImpl: providerStub("kakao", {
        token: { access_token: "at-secret", refresh_token: "rt-secret", id_token: "id-secret" },
        profile: { id: "k-9", kakao_account: { email: "partner@kakao.com", is_email_verified: true } }
      })
    }),
    await exchangeOAuthCode({
      provider: "kakao",
      code: "auth-code",
      redirectUri: REDIRECT,
      env,
      fetchImpl: providerStub("kakao", { token: { error: "invalid_grant" }, tokenStatus: 400, profile: {} })
    }),
    createOAuthState({ provider: "kakao", env })
  ];
  const serialized = JSON.stringify(results);
  for (const leak of ["kakao-secret", "google-secret", "naver-secret", "state-secret", "at-secret", "rt-secret", "id-secret", "auth-code"]) {
    assert.equal(serialized.includes(leak), false, `leaked ${leak}`);
  }
  assert.deepEqual(Object.keys(results[0]).sort(), ["email", "ok", "provider", "providerUserId"]);
});
