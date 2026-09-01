import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import {
  DEFAULT_MAIL_FROM,
  LOGIN_MAIL,
  MAIL_ERRORS,
  MAIL_VIA,
  RESEND_EMAILS_URL,
  consumeUrl,
  deliverLoginLink,
  looksLikeProductionHost,
  mailErrorForStatus,
  sendLoginEmail,
  wasMailDelivered
} from "../server/mail.mjs";
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

function mockResend({ status = 200 } = {}) {
  const calls = [];
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, options, body: options.body ? JSON.parse(options.body) : null });
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => ({ id: "re_test" })
    };
  };
  return { fetchImpl, calls };
}

function startServer({ allowDevOutbox = false, mailEnv = {}, mailFetch } = {}) {
  const store = createMemoryStore();
  const outbox = [];
  const { auth, couple } = wiredAuth(store);
  const server = createServer(createListener({
    auth,
    couple,
    root: process.cwd(),
    allowDevOutbox,
    allowDevOAuth: true,
    mailEnv,
    mailFetch,
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

function assertLoginMailPayload(body, { to, url, from = DEFAULT_MAIL_FROM } = {}) {
  assert.equal(body.from, from);
  assert.deepEqual(body.to, [to]);
  assert.equal(body.subject, LOGIN_MAIL.subject);
  assert.equal(body.subject, "로그인 링크");
  assert.match(body.text, /비밀번호 없이 로그인하려면 이 링크를 열어 주세요\. 링크는 10분 동안만 유효해요\./);
  assert.match(body.text, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(body.html, /<a href="/);
  assert.match(body.html, new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(body.html.includes("29,000"), false);
  assert.equal(body.html.includes("선물"), false);
}

test("sendLoginEmail posts to Resend with to/from/subject/url", async () => {
  const { fetchImpl, calls } = mockResend();
  const url = consumeUrl("https://loveme.example", "tok_1");
  const result = await sendLoginEmail({
    to: "buyer@example.com",
    url,
    fetchImpl,
    env: { RESEND_API_KEY: "re_test_key" }
  });
  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, RESEND_EMAILS_URL);
  assert.equal(calls[0].options.method, "POST");
  assert.equal(calls[0].options.headers.Authorization, "Bearer re_test_key");
  assertLoginMailPayload(calls[0].body, { to: "buyer@example.com", url });
});

test("sendLoginEmail uses MAIL_FROM when set", async () => {
  const { fetchImpl, calls } = mockResend();
  const url = consumeUrl("https://loveme.example", "tok_2");
  const result = await sendLoginEmail({
    to: "buyer@example.com",
    url,
    fetchImpl,
    env: { RESEND_API_KEY: "re_test_key", MAIL_FROM: "LoveMe <login@loveme.example>" }
  });
  assert.equal(result.ok, true);
  assertLoginMailPayload(calls[0].body, {
    to: "buyer@example.com",
    url,
    from: "LoveMe <login@loveme.example>"
  });
});

test("Resend non-2xx is a send failure with a code that names the misconfiguration", async () => {
  const cases = [
    [401, MAIL_ERRORS.keyRejected],
    [403, MAIL_ERRORS.senderRestricted],
    [422, MAIL_ERRORS.senderRejected],
    [429, MAIL_ERRORS.rateLimited],
    [500, MAIL_ERRORS.providerUnavailable],
    [418, MAIL_ERRORS.providerError]
  ];
  for (const [status, error] of cases) {
    const { fetchImpl } = mockResend({ status });
    const result = await sendLoginEmail({
      to: "buyer@example.com",
      url: consumeUrl("http://localhost:4173", "tok_1"),
      fetchImpl,
      env: { RESEND_API_KEY: "re_test_key" }
    });
    assert.equal(result.ok, false);
    assert.equal(result.error, error);
    assert.equal(result.status, status);
    assert.equal(wasMailDelivered(result), false);
  }
  assert.equal(mailErrorForStatus(undefined), MAIL_ERRORS.providerError);
});

test("a Resend transport failure is unreachable, not a refusal", async () => {
  const result = await sendLoginEmail({
    to: "buyer@example.com",
    url: consumeUrl("http://localhost:4173", "tok_1"),
    fetchImpl: async () => { throw new Error("socket hang up"); },
    env: { RESEND_API_KEY: "re_test_key" }
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, MAIL_ERRORS.unreachable);
});

test("mail error codes never carry a key, token or recipient", async () => {
  const token = "tok_secret_1";
  const url = consumeUrl("http://localhost:4173", token);
  const results = [];
  for (const status of [401, 403, 422, 429, 500]) {
    const { fetchImpl } = mockResend({ status });
    results.push(await sendLoginEmail({
      to: "buyer@example.com",
      url,
      fetchImpl,
      env: { RESEND_API_KEY: "re_live_secret_key", MAIL_FROM: "LoveMe <login@loveme.example>" }
    }));
  }
  results.push(await deliverLoginLink({ to: "buyer@example.com", url, allowDevOutbox: false, env: {} }));
  results.push(await deliverLoginLink({
    to: "buyer@example.com",
    url,
    allowDevOutbox: true,
    env: { NODE_ENV: "production" }
  }));
  for (const result of results) {
    const serialized = JSON.stringify(result);
    assert.equal(serialized.includes("buyer@example.com"), false);
    assert.equal(serialized.includes("re_live_secret_key"), false);
    assert.equal(serialized.includes(token), false);
    assert.match(String(result.error), /^mail-[a-z-]+$/);
  }
});

test("looksLikeProductionHost trusts NODE_ENV, platform markers and a remote origin", () => {
  assert.equal(looksLikeProductionHost({}), false);
  assert.equal(looksLikeProductionHost({ NODE_ENV: "development" }), false);
  assert.equal(looksLikeProductionHost({ AB_PUBLIC_ORIGIN: "http://localhost:4173" }), false);
  assert.equal(looksLikeProductionHost({ AB_PUBLIC_ORIGIN: "http://127.0.0.1:4173" }), false);
  assert.equal(looksLikeProductionHost({ AB_PUBLIC_ORIGIN: "not a url" }), false);
  assert.equal(looksLikeProductionHost({ NODE_ENV: "production" }), true);
  assert.equal(looksLikeProductionHost({ RENDER: "true" }), true);
  assert.equal(looksLikeProductionHost({ RENDER_EXTERNAL_URL: "https://loveme.onrender.com" }), true);
  assert.equal(looksLikeProductionHost({ AB_PUBLIC_ORIGIN: "https://loveme.onrender.com" }), true);
});

test("missing key without outbox fails; outbox-only works without key", async () => {
  const { fetchImpl, calls } = mockResend();
  const url = consumeUrl("http://localhost:4173", "tok_1");
  const missing = await deliverLoginLink({
    to: "buyer@example.com",
    url,
    allowDevOutbox: false,
    fetchImpl,
    env: {}
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.error, MAIL_ERRORS.notConfigured);
  assert.equal(missing.delivered, false);
  assert.equal(calls.length, 0);

  const outboxOnly = await deliverLoginLink({
    to: "buyer@example.com",
    url,
    allowDevOutbox: true,
    fetchImpl,
    env: {}
  });
  assert.equal(outboxOnly.ok, true);
  assert.equal(outboxOnly.via, MAIL_VIA.outbox);
  assert.equal(calls.length, 0);
});

test("the outbox never reports a delivered mail; a real send does", async () => {
  const url = consumeUrl("http://localhost:4173", "tok_1");
  const outboxOnly = await deliverLoginLink({
    to: "buyer@example.com",
    url,
    allowDevOutbox: true,
    fetchImpl: async () => { throw new Error("must not call Resend"); },
    env: {}
  });
  assert.equal(outboxOnly.ok, true);
  assert.equal(outboxOnly.delivered, false);
  assert.equal(outboxOnly.via, MAIL_VIA.outbox);
  assert.equal(wasMailDelivered(outboxOnly), false);

  const { fetchImpl } = mockResend();
  const real = await deliverLoginLink({
    to: "buyer@example.com",
    url,
    allowDevOutbox: true,
    fetchImpl,
    env: { RESEND_API_KEY: "re_test_key" }
  });
  assert.equal(real.ok, true);
  assert.equal(real.delivered, true);
  assert.equal(real.via, MAIL_VIA.resend);
  assert.equal(wasMailDelivered(real), true);
});

test("a production-looking host refuses the outbox instead of faking a send", async () => {
  const url = consumeUrl("https://loveme.onrender.com", "tok_1");
  const envs = [
    { NODE_ENV: "production" },
    { RENDER: "true" },
    { AB_PUBLIC_ORIGIN: "https://loveme.onrender.com" }
  ];
  for (const env of envs) {
    const { fetchImpl, calls } = mockResend();
    const refused = await deliverLoginLink({
      to: "buyer@example.com",
      url,
      allowDevOutbox: true,
      fetchImpl,
      env
    });
    assert.equal(refused.ok, false);
    assert.equal(refused.delivered, false);
    assert.equal(refused.via, MAIL_VIA.none);
    assert.equal(refused.error, MAIL_ERRORS.outboxRefused);
    assert.equal(wasMailDelivered(refused), false);
    assert.equal(calls.length, 0);
  }
});

test("a key on a production host still sends, and its failure keeps the Resend code", async () => {
  const url = consumeUrl("https://loveme.onrender.com", "tok_1");
  const { fetchImpl, calls } = mockResend({ status: 403 });
  const result = await deliverLoginLink({
    to: "buyer@example.com",
    url,
    allowDevOutbox: true,
    fetchImpl,
    env: { NODE_ENV: "production", RESEND_API_KEY: "re_test_key" }
  });
  assert.equal(result.ok, false);
  assert.equal(result.error, MAIL_ERRORS.senderRestricted);
  assert.equal(calls.length, 1);
});

test("HTTP magic-link calls Resend with to/from/subject/url", async () => {
  const { fetchImpl, calls } = mockResend();
  const { server, port, outbox } = await startServer({
    mailEnv: { RESEND_API_KEY: "re_test_key" },
    mailFetch: fetchImpl
  });
  try {
    const sent = await request(port, "/api/auth/magic-link", {
      method: "POST",
      body: { email: " Buyer@Example.com " }
    });
    assert.equal(sent.status, 200);
    assert.equal(sent.json.ok, true);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, RESEND_EMAILS_URL);
    assert.equal(calls[0].options.headers.Authorization, "Bearer re_test_key");
    const url = calls[0].body.html.match(/https?:\/\/[^"<]+/)?.[0];
    assert.ok(url);
    const parsed = new URL(url);
    assert.match(parsed.protocol, /^https?:$/, "a link a browser can open");
    assert.equal(parsed.pathname, "/auth/consume");
    assert.ok(parsed.searchParams.get("token"));
    assertLoginMailPayload(calls[0].body, { to: "buyer@example.com", url });
    assert.equal(outbox.length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("HTTP email-bind calls Resend with the same login copy", async () => {
  const { fetchImpl, calls } = mockResend();
  const { server, port } = await startServer({
    mailEnv: { RESEND_API_KEY: "re_test_key" },
    mailFetch: fetchImpl
  });
  try {
    const kakao = await request(port, "/api/dev/oauth/complete", {
      method: "POST",
      body: { provider: "kakao", providerUserId: "k-mail-1" }
    });
    const cookie = sessionCookie(kakao.setCookie);
    const bind = await request(port, "/api/auth/email-bind", {
      method: "POST",
      cookie,
      body: { email: "partner@example.com" }
    });
    assert.equal(bind.status, 200);
    assert.equal(bind.json.ok, true);
    assert.equal(calls.length, 1);
    const url = calls[0].body.html.match(/https?:\/\/[^"<]+/)?.[0];
    assertLoginMailPayload(calls[0].body, { to: "partner@example.com", url });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("HTTP invite returns the share url and does not call Resend", async () => {
  const { fetchImpl, calls } = mockResend();
  const { server, port, outbox } = await startServer({
    allowDevOutbox: true,
    mailEnv: { RESEND_API_KEY: "re_test_key" },
    mailFetch: fetchImpl
  });
  try {
    await request(port, "/api/auth/magic-link", { method: "POST", body: { email: "buyer@example.com" } });
    assert.equal(calls.length, 1);
    const loginItem = outbox.find((item) => item.type === "magic-link");
    const token = new URL(loginItem.url).searchParams.get("token");
    const consume = await request(port, "/api/auth/consume", { method: "POST", body: { token } });
    const cookie = sessionCookie(consume.setCookie);
    const invite = await request(port, "/api/invite", {
      method: "POST",
      cookie,
      body: { email: "partner@example.com" }
    });
    assert.equal(invite.status, 200);
    assert.equal(invite.json.ok, true);
    assert.match(invite.json.url, /\/invite\/accept\?token=/);
    assert.equal(calls.length, 1);
    assert.equal(calls.every((call) => !String(call.body?.html || "").includes("/invite/accept")), true);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("HTTP missing key without outbox fails; outbox-only still works without key", async () => {
  const { fetchImpl, calls } = mockResend();
  const closed = await startServer({ allowDevOutbox: false, mailEnv: {}, mailFetch: fetchImpl });
  try {
    const failed = await request(closed.port, "/api/auth/magic-link", {
      method: "POST",
      body: { email: "buyer@example.com" }
    });
    assert.equal(failed.status, 502);
    assert.equal(failed.json.ok, false);
    assert.equal(failed.json.error, "failed");
    assert.equal(calls.length, 0);
    assert.equal(closed.outbox.length, 0);
  } finally {
    await new Promise((resolve) => closed.server.close(resolve));
  }

  const open = await startServer({ allowDevOutbox: true, mailEnv: {}, mailFetch: fetchImpl });
  try {
    const sent = await request(open.port, "/api/auth/magic-link", {
      method: "POST",
      body: { email: "buyer@example.com" }
    });
    assert.equal(sent.status, 200);
    assert.equal(sent.json.ok, true);
    assert.equal(calls.length, 0);
    assert.equal(open.outbox[0].type, "magic-link");
    assert.match(open.outbox[0].url, /\/auth\/consume\?token=/);
  } finally {
    await new Promise((resolve) => open.server.close(resolve));
  }
});

test("HTTP Resend failure does not return ok:true", async () => {
  const { fetchImpl, calls } = mockResend({ status: 500 });
  const { server, port, outbox } = await startServer({
    mailEnv: { RESEND_API_KEY: "re_test_key" },
    mailFetch: fetchImpl
  });
  try {
    const sent = await request(port, "/api/auth/magic-link", {
      method: "POST",
      body: { email: "buyer@example.com" }
    });
    assert.equal(sent.status, 502);
    assert.equal(sent.json.ok, false);
    assert.equal(sent.json.error, "failed");
    assert.equal(calls.length, 1);
    assert.equal(outbox.length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
