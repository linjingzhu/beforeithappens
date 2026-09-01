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

test("dev outbox is closed unless explicitly enabled", async () => {
  const store = createMemoryStore();
  const outbox = [];
  const { auth, couple } = wiredAuth(store);
  const server = createServer(createListener({
    auth,
    couple,
    root: process.cwd(),
    allowDevOutbox: false,
    mailEnv: {},
    outbox
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    const { port } = server.address();
    const sent = await request(port, "/api/auth/magic-link", { method: "POST", body: { email: "buyer@example.com" } });
    assert.equal(sent.status, 502);
    assert.equal(sent.json.ok, false);
    assert.equal(sent.json.error, "failed");
    const hidden = await request(port, "/api/dev/outbox");
    assert.equal(hidden.status, 404);
    assert.equal(outbox.length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("HTTP magic-link request, consume, notice, and forced logout", async () => {
  const { server, port } = await startServer();
  try {
    const invalid = await request(port, "/api/auth/magic-link", { method: "POST", body: { email: "nope" } });
    assert.equal(invalid.status, 400);

    const sent = await request(port, "/api/auth/magic-link", { method: "POST", body: { email: " Buyer@Example.com " } });
    assert.equal(sent.status, 200);
    assert.equal(sent.json.ok, true);
    assert.equal(sent.json.token, undefined);

    const outbox = await request(port, "/api/dev/outbox");
    const url = new URL(outbox.json.items[0].url);
    assert.equal(url.protocol, "loveme:");
    assert.equal(url.pathname, "/auth/consume");
    const token = url.searchParams.get("token");

    const prefetch = await request(port, `/auth/consume?token=${token}`);
    assert.equal(prefetch.status, 200);
    assert.match(prefetch.text, /loveme:\/\/\/auth\/consume/);
    assert.equal(prefetch.text.includes("<div id=\"app\">"), false);
    assert.equal(prefetch.text.includes("파트너 초대"), false);
    const before = await request(port, "/api/auth/session");
    assert.equal(before.json.user, null);

    const consume = await request(port, "/api/auth/consume", { method: "POST", body: { token } });
    assert.equal(consume.status, 200);
    assert.equal(consume.json.session.user.email, "buyer@example.com");
    assert.equal(consume.json.session.notice, "no-local-draft");
    assert.equal(consume.json.session.workspace.acceptedPartner, false);
    assert.ok(consume.json.session.workspace.id);
    assert.equal(consume.json.session.workspace.role, "buyer");
    const cookie = sessionCookie(consume.setCookie);
    assert.match(cookie, /ab_session=/);

    const session = await request(port, "/api/auth/session", { cookie });
    assert.equal(session.json.user.email, "buyer@example.com");

    const ack = await request(port, "/api/auth/ack-notice", { method: "POST", cookie });
    assert.equal(ack.json.notice, null);

    const logout = await request(port, "/api/auth/force-logout", { method: "POST", cookie });
    assert.equal(logout.status, 200);
    const after = await request(port, "/api/auth/session", { cookie });
    assert.equal(after.json.user, null);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("device handoff is logout then a new login; the old buyer cookie cannot stay signed in", async () => {
  const { server, port } = await startServer();
  try {
    const buyerCookie = await login(port, "buyer@example.com");
    const before = await request(port, "/api/auth/session", { cookie: buyerCookie });
    assert.equal(before.json.user.email, "buyer@example.com");

    const logout = await request(port, "/api/auth/force-logout", { method: "POST", cookie: buyerCookie });
    assert.equal(logout.status, 200);
    const cleared = await request(port, "/api/auth/session", { cookie: buyerCookie });
    assert.equal(cleared.json.user, null);

    const partnerCookie = await login(port, "partner@example.com");
    const partner = await request(port, "/api/auth/session", { cookie: partnerCookie });
    assert.equal(partner.json.user.email, "partner@example.com");
    const staleBuyer = await request(port, "/api/auth/session", { cookie: buyerCookie });
    assert.equal(staleBuyer.json.user, null);

    const regular = await request(port, "/api/auth/logout", { method: "POST", cookie: partnerCookie });
    assert.equal(regular.status, 200);
    const afterPartner = await request(port, "/api/auth/session", { cookie: partnerCookie });
    assert.equal(afterPartner.json.user, null);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function login(port, email) {
  await request(port, "/api/auth/magic-link", { method: "POST", body: { email } });
  const outbox = await request(port, "/api/dev/outbox");
  const item = outbox.json.items.find((entry) => entry.type === "magic-link" && entry.email === email);
  const token = new URL(item.url).searchParams.get("token");
  const consume = await request(port, "/api/auth/consume", { method: "POST", body: { token } });
  return sessionCookie(consume.setCookie);
}

test("HTTP invite send, email-bound accept, and pack gate", async () => {
  const { server, port } = await startServer();
  try {
    const buyerCookie = await login(port, "buyer@example.com");
    const sent = await request(port, "/api/invite", { method: "POST", cookie: buyerCookie, body: { email: "partner@example.com" } });
    assert.equal(sent.status, 200);
    assert.equal(sent.json.workspace.acceptedPartner, false);
    assert.equal(sent.json.workspace.invite.status, "waiting");
    assert.match(sent.json.url, /\/invite\/accept\?token=/);
    assert.equal(sent.json.workspace.invite.url.startsWith("/invite/accept?token="), true);
    assert.equal(new URL(sent.json.url).pathname, "/invite/accept");

    const outbox = await request(port, "/api/dev/outbox");
    const invite = outbox.json.items.find((entry) => entry.type === "invite");
    const token = new URL(invite.url).searchParams.get("token");

    const prefetch = await request(port, `/invite/accept?token=${token}`);
    assert.equal(prefetch.status, 200);
    const linkOnly = await request(port, "/api/invite/accept", { method: "POST", body: { token } });
    assert.equal(linkOnly.status, 401);

    const sameSession = await request(port, "/api/invite/accept", { method: "POST", cookie: buyerCookie, body: { token } });
    assert.equal(sameSession.json.ok, false);
    assert.equal(sameSession.json.error, "mismatch");

    const strangerCookie = await login(port, "other@example.com");
    const mismatch = await request(port, "/api/invite/accept", { method: "POST", cookie: strangerCookie, body: { token } });
    assert.equal(mismatch.json.error, "mismatch");

    const partnerCookie = await login(port, "partner@example.com");
    const accept = await request(port, "/api/invite/accept", { method: "POST", cookie: partnerCookie, body: { token } });
    assert.equal(accept.status, 200);
    assert.equal(accept.json.session.workspace.acceptedPartner, true);
    assert.equal(accept.json.session.workspace.role, "partner");

    const buyer = await request(port, "/api/auth/session", { cookie: buyerCookie });
    assert.equal(buyer.json.workspace.acceptedPartner, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("same-session accept stays blocked until force logout and invited-email magic link", async () => {
  const { server, port } = await startServer();
  try {
    const buyerCookie = await login(port, "buyer@example.com");
    const sent = await request(port, "/api/invite", { method: "POST", cookie: buyerCookie, body: { email: "partner@example.com" } });
    const token = new URL(sent.json.url).searchParams.get("token");

    const blocked = await request(port, "/api/invite/accept", { method: "POST", cookie: buyerCookie, body: { token } });
    assert.equal(blocked.json.error, "mismatch");
    assert.equal(blocked.json.ok, false);

    const logout = await request(port, "/api/auth/force-logout", { method: "POST", cookie: buyerCookie });
    assert.equal(logout.status, 200);
    const afterLogout = await request(port, "/api/auth/session", { cookie: buyerCookie });
    assert.equal(afterLogout.json.user, null);

    const stillWaiting = await request(port, `/api/invite/preview?token=${token}`);
    assert.equal(stillWaiting.json.ok, true);
    assert.equal(stillWaiting.json.email, "partner@example.com");

    const partnerCookie = await login(port, "partner@example.com");
    const accept = await request(port, "/api/invite/accept", { method: "POST", cookie: partnerCookie, body: { token } });
    assert.equal(accept.status, 200);
    assert.equal(accept.json.session.workspace.role, "partner");
    assert.equal(accept.json.session.workspace.acceptedPartner, true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("install and start routes serve the web app without requiring install", async () => {
  const { server, port } = await startServer();
  try {
    const install = await request(port, "/install");
    const start = await request(port, "/start");
    assert.equal(install.status, 200);
    assert.equal(start.status, 200);
    assert.match(install.text, /<div id="app">/);
    assert.match(start.text, /<div id="app">/);
    const session = await request(port, "/api/auth/session");
    assert.equal(session.status, 200);
    assert.equal(session.json.user, null);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("a file that is not there is a 404, not a 500", async () => {
  // `stat` throws for a missing path, and letting that reach the listener's catch made every
  // absent asset — favicon, manifest, service worker — read as the server being broken, in the
  // browser console and in the host's logs alike.
  const { server, port } = await startServer();
  try {
    for (const path of ["/favicon.ico", "/manifest.json", "/sw.js", "/nope/at/all.png"]) {
      assert.equal((await request(port, path)).status, 404, `${path} is a 404`);
    }
    assert.equal((await request(port, "/src/app.js")).status, 200, "and a file that is there serves");
  } finally {
    server.close();
  }
});
