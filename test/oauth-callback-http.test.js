import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { createOAuthState } from "../server/oauth.mjs";

const CONFIGURED = {
  AB_OAUTH_GOOGLE_CLIENT_ID: "google-id",
  AB_OAUTH_GOOGLE_CLIENT_SECRET: "google-secret",
  AB_OAUTH_STATE_SECRET: "state-secret-for-tests"
};

function providerFetch(calls, { email = "social@example.com", emailVerified = true } = {}) {
  return async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method || "GET", body: String(init.body || "") });
    if (String(url).includes("/token")) {
      return { ok: true, status: 200, json: async () => ({ access_token: "at-live", token_type: "Bearer" }) };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ sub: "google-sub-1", email, email_verified: emailVerified })
    };
  };
}

async function startServer({ oauthEnv = CONFIGURED, oauthFetch } = {}) {
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
    oauthEnv,
    oauthFetch,
    mailEnv: {}
  }));
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }));
  });
}

function get(port, path) {
  return fetch(`http://127.0.0.1:${port}${path}`, {
    headers: { accept: "application/json" },
    redirect: "manual"
  });
}

test("a configured callback exchanges the code and issues the session", async () => {
  const calls = [];
  const { server, port } = await startServer({ oauthFetch: providerFetch(calls) });
  try {
    const state = createOAuthState({ provider: "google", env: CONFIGURED });
    const response = await get(port, `/api/auth/oauth/google/callback?code=live-code&state=${encodeURIComponent(state)}`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(payload.session.user.email, "social@example.com");
    assert.match(response.headers.get("set-cookie") || "", /ab_session=/);

    assert.equal(calls.length, 2, "one token exchange and one profile read");
    assert.match(calls[0].url, /oauth2\.googleapis\.com\/token/);
    assert.equal(calls[0].method, "POST");
    assert.match(calls[0].body, /grant_type=authorization_code/);
    assert.match(calls[0].body, /code=live-code/);
    assert.equal(JSON.stringify(payload).includes("google-secret"), false, "no secret reaches the client");
    assert.equal(JSON.stringify(payload).includes("at-live"), false, "no token reaches the client");
  } finally {
    server.close();
  }
});

test("a callback without a valid state never reaches the provider", async () => {
  const calls = [];
  const { server, port } = await startServer({ oauthFetch: providerFetch(calls) });
  try {
    const forged = await get(port, "/api/auth/oauth/google/callback?code=live-code&state=forged.state.value.x.y");
    assert.equal(forged.status, 400);
    assert.equal((await forged.json()).error, "invalid");

    const missing = await get(port, "/api/auth/oauth/google/callback?code=live-code");
    assert.equal(missing.status, 400);

    const wrongProvider = createOAuthState({ provider: "kakao", env: CONFIGURED });
    const mismatched = await get(port, `/api/auth/oauth/google/callback?code=c&state=${encodeURIComponent(wrongProvider)}`);
    assert.equal(mismatched.status, 400, "a state issued for another provider is refused");

    assert.equal(calls.length, 0, "no code is ever exchanged without a verified state");
  } finally {
    server.close();
  }
});

test("a provider that returns no usable email still logs in and asks for one", async () => {
  const calls = [];
  const { server, port } = await startServer({
    oauthFetch: providerFetch(calls, { email: "unverified@example.com", emailVerified: false })
  });
  try {
    const state = createOAuthState({ provider: "google", env: CONFIGURED });
    const response = await get(port, `/api/auth/oauth/google/callback?code=c&state=${encodeURIComponent(state)}`);
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.session.user.needsEmail, true, "the email-bind gate takes over");
    assert.equal(payload.session.user.email, "");
  } finally {
    server.close();
  }
});

test("an unconfigured provider is refused before any network call", async () => {
  const calls = [];
  const { server, port } = await startServer({ oauthEnv: {}, oauthFetch: providerFetch(calls) });
  try {
    const response = await get(port, "/api/auth/oauth/google/callback?code=c&state=s");
    assert.equal(response.status, 501);
    assert.equal((await response.json()).error, "oauth-unconfigured");
    assert.equal(calls.length, 0);
  } finally {
    server.close();
  }
});

test("the start route hands out a state the callback will accept", async () => {
  const { server, port } = await startServer({ oauthFetch: providerFetch([]) });
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/oauth/start`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ provider: "google" })
    });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.ok(payload.state, "the authorize step must carry a CSRF state");
    assert.match(payload.url, /accounts\.google\.com/);
    assert.match(payload.url, new RegExp(`state=${encodeURIComponent(payload.state).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    assert.equal(JSON.stringify(payload).includes("google-secret"), false);
  } finally {
    server.close();
  }
});
