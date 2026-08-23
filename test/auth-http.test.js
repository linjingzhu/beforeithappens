import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createMemoryStore } from "../server/store.mjs";

function startServer() {
  const store = createMemoryStore();
  const outbox = [];
  const auth = createAuth({ store });
  const server = createServer(createListener({
    auth,
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
    assert.equal(url.pathname, "/auth/consume");
    const token = url.searchParams.get("token");

    const prefetch = await request(port, `/auth/consume?token=${token}`);
    assert.equal(prefetch.status, 200);
    assert.match(prefetch.text, /<div id="app">/);
    const before = await request(port, "/api/auth/session");
    assert.equal(before.json.user, null);

    const consume = await request(port, "/api/auth/consume", { method: "POST", body: { token } });
    assert.equal(consume.status, 200);
    assert.equal(consume.json.session.user.email, "buyer@example.com");
    assert.equal(consume.json.session.notice, "no-local-draft");
    assert.equal(consume.json.session.workspace.acceptedPartner, false);
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
