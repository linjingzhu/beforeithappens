import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createAnswers } from "../server/answers.mjs";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createEntitlement } from "../server/entitlement.mjs";
import { createGift } from "../server/gift.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createReferral } from "../server/referral.mjs";
import { createCouple } from "../server/workspace.mjs";
import { marriagePack, questions } from "../src/questions.js";

/**
 * The module tests prove the rules. This proves the wiring: that the routes exist, that the links
 * handed to a sharer are absolute and openable, and that someone with no session gets a page
 * rather than a 404 — which is the whole point of a link you send to a stranger.
 */
async function startServer({ rewardEvery = 1 } = {}) {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const pack = { id: marriagePack.id, version: marriagePack.version };
  let referral;
  const entitlement = createEntitlement({
    store,
    pack,
    onEntitled: ({ workspaceId, at }) => referral?.creditPurchase({ workspaceId, at })
  });
  const gift = createGift({ store, entitlement, pack });
  referral = createReferral({ store, gift, rewardEvery });
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
  const outbox = [];
  const server = createServer(createListener({
    auth, couple, answers, entitlement, gift, referral,
    root: process.cwd(),
    allowDevOutbox: true,
    mailEnv: {},
    outbox
  }));
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port, outbox }));
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
  const text = await response.text();
  let payload = {};
  try { payload = JSON.parse(text); } catch { payload = {}; }
  return {
    status: response.status,
    payload,
    text,
    contentType: response.headers.get("content-type") || "",
    cookie: setCookie.map((v) => String(v).split(";")[0]).join("; ")
  };
}

async function login(port, outbox, email) {
  await call(port, "/api/auth/magic-link", { method: "POST", body: { email } });
  const mail = outbox.find((item) => item.email === email && item.type === "magic-link");
  const token = (String(mail.url).match(/token=([^&]+)/) || [])[1];
  return (await call(port, "/api/auth/consume", { method: "POST", body: { token } })).cookie;
}

async function pair(port, outbox, buyerEmail, partnerEmail) {
  const buyer = await login(port, outbox, buyerEmail);
  const invite = await call(port, "/api/invite", { method: "POST", body: { email: partnerEmail }, cookie: buyer });
  const token = (String(invite.payload.url).match(/token=([^&]+)/) || [])[1];
  const partner = await login(port, outbox, partnerEmail);
  await call(port, "/api/invite/accept", { method: "POST", body: { token }, cookie: partner });
  return { buyer, partner };
}

test("a gift link is absolute, opens for a stranger, and unlocks the pack once redeemed", async () => {
  const { server, port, outbox } = await startServer();
  try {
    const giver = await login(port, outbox, "giver@example.com");
    const bought = await call(port, "/api/gift", { method: "POST", cookie: giver });
    assert.equal(bought.status, 200);
    assert.match(bought.payload.url, /^http:\/\/127\.0\.0\.1:\d+\/gift\/redeem\?token=/, "a sendable link, not a bare path");

    const path = new URL(bought.payload.url).pathname + new URL(bought.payload.url).search;
    const stranger = await call(port, path);
    assert.equal(stranger.status, 200, "someone with no account gets a page, not a 404");
    assert.match(stranger.contentType, /text\/html/);

    const preview = await call(port, `/api/gift/preview?token=${encodeURIComponent(bought.payload.token)}`);
    assert.equal(preview.payload.ok, true, "the receiver can be told what this is before signing in");

    const { buyer: receiver } = await pair(port, outbox, "receiver@example.com", "receiver.p@example.com");
    const redeemed = await call(port, "/api/gift/redeem", { method: "POST", body: { token: bought.payload.token }, cookie: receiver });
    assert.equal(redeemed.status, 200);
    // The session view carries identity and pairing, never entitlement — that lives in pack state,
    // so this checks the caller is who redeemed and then asks the pack itself.
    assert.equal(redeemed.payload.session.user.email, "receiver@example.com");
    assert.equal(redeemed.payload.session.workspace.acceptedPartner, true);

    const packState = await call(port, "/api/pack/state", { cookie: receiver });
    assert.equal(packState.payload.state.entitlement.entitled, true, "the remaining questions really are open");
    assert.equal(packState.payload.state.remainingLocked, false);
  } finally {
    server.close();
  }
});

test("redeeming needs a session, and a spent link stays spent over HTTP", async () => {
  const { server, port, outbox } = await startServer();
  try {
    const giver = await login(port, outbox, "giver@example.com");
    const bought = await call(port, "/api/gift", { method: "POST", cookie: giver });

    const anonymous = await call(port, "/api/gift/redeem", { method: "POST", body: { token: bought.payload.token } });
    assert.equal(anonymous.status, 401, "a present lands on an account, so it needs one");

    const { buyer: receiver } = await pair(port, outbox, "receiver@example.com", "receiver.p@example.com");
    assert.equal((await call(port, "/api/gift/redeem", { method: "POST", body: { token: bought.payload.token }, cookie: receiver })).status, 200);

    const { buyer: latecomer } = await pair(port, outbox, "late@example.com", "late.p@example.com");
    const again = await call(port, "/api/gift/redeem", { method: "POST", body: { token: bought.payload.token }, cookie: latecomer });
    assert.equal(again.status, 400);
    assert.equal(again.payload.error, "used");
  } finally {
    server.close();
  }
});

test("the giver can list what they sent and withdraw a link that is still live", async () => {
  const { server, port, outbox } = await startServer();
  try {
    const giver = await login(port, outbox, "giver@example.com");
    const bought = await call(port, "/api/gift", { method: "POST", cookie: giver });

    const sent = await call(port, "/api/gift/sent", { cookie: giver });
    assert.equal(sent.payload.gifts.length, 1);
    assert.equal(sent.payload.gifts[0].url, bought.payload.url, "the same link is offered again, not a new one");

    const revoked = await call(port, "/api/gift/revoke", { method: "POST", body: { giftId: sent.payload.gifts[0].id }, cookie: giver });
    assert.equal(revoked.status, 200);
    assert.equal((await call(port, "/api/gift/sent", { cookie: giver })).payload.gifts[0].url, "", "a withdrawn link is not handed out");

    const { buyer: receiver } = await pair(port, outbox, "receiver@example.com", "receiver.p@example.com");
    const dead = await call(port, "/api/gift/redeem", { method: "POST", body: { token: bought.payload.token }, cookie: receiver });
    assert.equal(dead.payload.error, "revoked");
  } finally {
    server.close();
  }
});

test("a recommendation link opens for a stranger and credits only after the friend pays", async () => {
  const { server, port, outbox } = await startServer({ rewardEvery: 1 });
  try {
    const sharer = await login(port, outbox, "sharer@example.com");
    const view = await call(port, "/api/referral", { cookie: sharer });
    assert.equal(view.status, 200);
    assert.match(view.payload.url, /^http:\/\/127\.0\.0\.1:\d+\/r\/[0-9A-Z]{8}$/, "short enough to send");

    const landing = await call(port, new URL(view.payload.url).pathname);
    assert.equal(landing.status, 200, "a recommendation must open for someone with no account");
    assert.match(landing.contentType, /text\/html/);

    const { buyer: friend } = await pair(port, outbox, "friend@example.com", "friend.p@example.com");
    assert.equal((await call(port, "/api/referral/claim", { method: "POST", body: { code: view.payload.code }, cookie: friend })).status, 200);
    assert.equal((await call(port, "/api/referral", { cookie: sharer })).payload.joined, 1);
    assert.equal((await call(port, "/api/referral", { cookie: sharer })).payload.credited, 0, "signing up is not paying");

    await call(port, "/api/purchase", { method: "POST", cookie: friend });
    const after = await call(port, "/api/referral", { cookie: sharer });
    assert.equal(after.payload.credited, 1);
    assert.equal(after.payload.rewarded, 1, "the reward arrives as a real present");

    const reward = await call(port, "/api/gift/sent", { cookie: sharer });
    assert.equal(reward.payload.gifts[0].origin, "referral");
    assert.match(reward.payload.gifts[0].url, /\/gift\/redeem\?token=/);
  } finally {
    server.close();
  }
});

test("recommending yourself is refused over HTTP, and so is an unknown code", async () => {
  const { server, port, outbox } = await startServer();
  try {
    const sharer = await login(port, outbox, "sharer@example.com");
    const code = (await call(port, "/api/referral", { cookie: sharer })).payload.code;

    const self = await call(port, "/api/referral/claim", { method: "POST", body: { code }, cookie: sharer });
    assert.equal(self.status, 400);
    assert.equal(self.payload.error, "self");

    const friend = await login(port, outbox, "friend@example.com");
    assert.equal((await call(port, "/api/referral/claim", { method: "POST", body: { code: "ZZZZZZZZ" }, cookie: friend })).payload.error, "invalid-code");

    const anonymous = await call(port, "/api/referral", {});
    assert.equal(anonymous.status, 401, "a code belongs to an account");
  } finally {
    server.close();
  }
});
