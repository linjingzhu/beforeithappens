import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createAccount } from "../server/account.mjs";
import { createAnswers } from "../server/answers.mjs";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createEntitlement } from "../server/entitlement.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { marriagePack, questions } from "../src/questions.js";

async function startServer() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const pack = { id: marriagePack.id, version: marriagePack.version };
  const entitlement = createEntitlement({ store, pack });
  const answers = createAnswers({
    store,
    questionIds: questions.map((q) => q.id),
    choiceIdsByQuestion: Object.fromEntries(questions.map((q) => [q.id, q.choices.map((c) => c.id)])),
    pack,
    entitlement
  });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const account = createAccount({ store });
  const outbox = [];
  const server = createServer(createListener({
    auth, couple, answers, entitlement, account,
    root: process.cwd(),
    allowDevOutbox: true,
    mailEnv: {},
    outbox
  }));
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port, store, outbox }));
  });
}

async function call(port, path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: {
      accept: "application/json",
      ...(body ? { "content-type": "application/json" } : {}),
      ...(cookie ? { cookie } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const setCookie = response.headers.getSetCookie?.() || [];
  return {
    status: response.status,
    payload: await response.json().catch(() => ({})),
    cookie: setCookie.map((v) => String(v).split(";")[0]).join("; "),
    rawCookie: setCookie.join(" | ")
  };
}

async function login(port, outbox, email) {
  await call(port, "/api/auth/magic-link", { method: "POST", body: { email } });
  // recordOutbox puts the newest entry first, so the head is the link just issued.
  const mail = outbox.find((item) => item.email === email && item.type === "magic-link");
  const token = (String(mail.url).match(/token=([^&]+)/) || [])[1];
  const consumed = await call(port, "/api/auth/consume", { method: "POST", body: { token } });
  return consumed.cookie;
}

test("deleting an account needs confirmation and then ends the session", async () => {
  const { server, port, outbox } = await startServer();
  try {
    const cookie = await login(port, outbox, "leaver@example.com");

    const unconfirmed = await call(port, "/api/account/delete", { method: "POST", body: {}, cookie });
    assert.equal(unconfirmed.status, 400);
    assert.equal(unconfirmed.payload.error, "unconfirmed", "a stray tap must not delete an account");

    const stillHere = await call(port, "/api/auth/session", { cookie });
    assert.equal(stillHere.payload.user.email, "leaver@example.com", "the refusal changed nothing");

    const deleted = await call(port, "/api/account/delete", { method: "POST", body: { confirm: true }, cookie });
    assert.equal(deleted.status, 200);
    assert.equal(deleted.payload.ok, true);
    assert.match(deleted.rawCookie, /ab_session=/, "the session cookie is cleared on the way out");

    const after = await call(port, "/api/auth/session", { cookie });
    assert.notEqual(after.payload?.user?.email, "leaver@example.com", "the old cookie must not still resolve");

    const again = await call(port, "/api/account/delete", { method: "POST", body: { confirm: true }, cookie });
    assert.equal(again.status, 401, "deleting twice is refused, not repeated");
    assert.equal(again.payload.error, "unauthenticated");
  } finally {
    server.close();
  }
});

test("the account is gone from the store and the email can start over", async () => {
  const { server, port, outbox, store } = await startServer();
  try {
    const cookie = await login(port, outbox, "gone@example.com");
    await call(port, "/api/account/delete", { method: "POST", body: { confirm: true }, cookie });

    const state = store.snapshot();
    assert.equal(state.users.some((u) => u.email === "gone@example.com"), false, "the identity is erased");
    assert.equal(state.sessions.length, 0, "no session survives");

    const fresh = await login(port, outbox, "gone@example.com");
    const session = await call(port, "/api/auth/session", { cookie: fresh });
    assert.equal(session.payload.user.email, "gone@example.com", "the address is free to sign up again");
    assert.notEqual(session.payload.user.id, undefined);
  } finally {
    server.close();
  }
});

test("a partner who stays keeps their account and can pair again", async () => {
  const { server, port, outbox, store } = await startServer();
  try {
    const buyerCookie = await login(port, outbox, "buyer.stay@example.com");
    const invite = await call(port, "/api/invite", {
      method: "POST",
      body: { email: "partner.stay@example.com" },
      cookie: buyerCookie
    });
    const token = (String(invite.payload.url).match(/token=([^&]+)/) || [])[1];
    const partnerCookie = await login(port, outbox, "partner.stay@example.com");
    const accepted = await call(port, "/api/invite/accept", { method: "POST", body: { token }, cookie: partnerCookie });
    assert.equal(accepted.status, 200, "the pair is real before anyone leaves");

    await call(port, "/api/account/delete", { method: "POST", body: { confirm: true }, cookie: buyerCookie });

    const partner = await call(port, "/api/auth/session", { cookie: partnerCookie });
    assert.equal(partner.payload.user.email, "partner.stay@example.com", "the partner is untouched");
    assert.equal(partner.payload.workspace.acceptedPartner, false, "they are alone again");

    const state = store.snapshot();
    assert.equal(state.users.some((u) => u.email === "buyer.stay@example.com"), false);
    assert.equal(
      state.users.some((u) => u.email === "partner.stay@example.com"),
      true,
      "one person leaving never deletes the other"
    );

    const reinvite = await call(port, "/api/invite", {
      method: "POST",
      body: { email: "someone.new@example.com" },
      cookie: partnerCookie
    });
    assert.equal(reinvite.status, 200, "the survivor can invite again");
  } finally {
    server.close();
  }
});
