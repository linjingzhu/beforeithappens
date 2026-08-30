import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";

function wiredAuth(store) {
  const couple = createCouple({ store });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  return { auth, couple };
}

function startServer({ allowDevOAuth = true, oauthEnv = {} } = {}) {
  const store = createMemoryStore();
  const outbox = [];
  const { auth, couple } = wiredAuth(store);
  const server = createServer(createListener({
    auth,
    couple,
    root: process.cwd(),
    allowDevOutbox: true,
    allowDevOAuth,
    oauthEnv,
    outbox
  }));
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port, outbox });
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

test("OAuth start and callback are stubbed without client ids", async () => {
  const { server, port } = await startServer({ allowDevOAuth: false });
  try {
    const start = await request(port, "/api/auth/oauth/start", { method: "POST", body: { provider: "kakao" } });
    assert.equal(start.status, 501);
    assert.equal(start.json.error, "oauth-unconfigured");
    const callback = await request(port, "/api/auth/oauth/kakao/callback");
    assert.equal(callback.status, 302);
    const jsonCallback = await fetch(`http://127.0.0.1:${port}/api/auth/oauth/kakao/callback`, {
      headers: { accept: "application/json" },
      redirect: "manual"
    });
    assert.equal(jsonCallback.status, 501);
    assert.equal((await jsonCallback.json()).stubbed, true);
    const hidden = await request(port, "/api/dev/oauth/complete", {
      method: "POST",
      body: { provider: "kakao", providerUserId: "k-1" }
    });
    assert.equal(hidden.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("dev OAuth complete plus email bind blocks invite accept until connected", async () => {
  const { server, port, outbox } = await startServer();
  try {
    await request(port, "/api/auth/magic-link", { method: "POST", body: { email: "buyer@example.com" } });
    const buyerToken = new URL(outbox.find((item) => item.type === "magic-link").url).searchParams.get("token");
    const buyer = await request(port, "/api/auth/consume", { method: "POST", body: { token: buyerToken } });
    const buyerCookie = sessionCookie(buyer.setCookie);
    const invite = await request(port, "/api/invite", {
      method: "POST",
      cookie: buyerCookie,
      body: { email: "partner@example.com" }
    });
    const inviteToken = new URL(invite.json.url, "http://localhost").searchParams.get("token");

    const kakao = await request(port, "/api/dev/oauth/complete", {
      method: "POST",
      body: { provider: "kakao", providerUserId: "k-1" }
    });
    assert.equal(kakao.status, 200);
    assert.equal(kakao.json.session.user.needsEmail, true);
    const kakaoCookie = sessionCookie(kakao.setCookie);
    const blocked = await request(port, "/api/invite/accept", {
      method: "POST",
      cookie: kakaoCookie,
      body: { token: inviteToken }
    });
    assert.equal(blocked.status, 400);
    assert.equal(blocked.json.error, "needs-email");

    const bind = await request(port, "/api/auth/email-bind", {
      method: "POST",
      cookie: kakaoCookie,
      body: { email: "partner@example.com" }
    });
    assert.equal(bind.status, 200);
    const bindItem = outbox.find((item) => item.type === "email-bind");
    const bindToken = new URL(bindItem.url).searchParams.get("token");
    const connected = await request(port, "/api/auth/consume", { method: "POST", body: { token: bindToken } });
    assert.equal(connected.json.session.user.email, "partner@example.com");
    assert.equal(connected.json.session.user.needsEmail, false);
    const accepted = await request(port, "/api/invite/accept", {
      method: "POST",
      cookie: sessionCookie(connected.setCookie),
      body: { token: inviteToken }
    });
    assert.equal(accepted.status, 200);
    assert.equal(accepted.json.session.workspace.acceptedPartner, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("Google with email can accept an invite without the bind gate", async () => {
  const { server, port, outbox } = await startServer();
  try {
    await request(port, "/api/auth/magic-link", { method: "POST", body: { email: "buyer@example.com" } });
    const buyerToken = new URL(outbox.find((item) => item.type === "magic-link").url).searchParams.get("token");
    const buyer = await request(port, "/api/auth/consume", { method: "POST", body: { token: buyerToken } });
    const invite = await request(port, "/api/invite", {
      method: "POST",
      cookie: sessionCookie(buyer.setCookie),
      body: { email: "partner@gmail.com" }
    });
    const inviteToken = new URL(invite.json.url, "http://localhost").searchParams.get("token");
    const google = await request(port, "/api/dev/oauth/complete", {
      method: "POST",
      body: { provider: "google", providerUserId: "g-1", email: "partner@gmail.com" }
    });
    assert.equal(google.json.session.user.needsEmail, false);
    const accepted = await request(port, "/api/invite/accept", {
      method: "POST",
      cookie: sessionCookie(google.setCookie),
      body: { token: inviteToken }
    });
    assert.equal(accepted.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
