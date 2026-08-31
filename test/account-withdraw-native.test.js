/**
 * 탈퇴 on the native app.
 *
 * The account screen already takes the second confirmation (test/account-delete.test.js covers
 * that). What is proved here is the wire behind it: the confirm tap reaches
 * POST /api/account/delete exactly once with `confirm: true`, a success leaves the app logged
 * out, a failure says so instead of pretending, and 돌아가기 never touches the endpoint.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createAccount } from "../server/account.mjs";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { WITHDRAW_COPY, WITHDRAW_ERRORS } from "../src/pair-code.js";
import { AUTH_API, createAuthApi } from "../mobile/s0-s2-s3-api.js";
import { applyScreen, createNativeFlow, logoutAccount } from "../mobile/s0-s2-s3-flow.js";
import { withdrawHost } from "../mobile/src/session.js";

function signedInSession() {
  return {
    user: { id: "usr_1", email: "leaver@example.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false, partnerEmail: "" }
  };
}

function accountState() {
  return applyScreen({
    ...createNativeFlow(signedInSession(), { accountOpen: true }),
    splashDone: true
  });
}

function jsonResponse({ ok = true, status = 200, payload = {}, setCookie = [] } = {}) {
  return {
    ok,
    status,
    headers: { getSetCookie: () => setCookie, get: () => null },
    json: async () => payload
  };
}

/** A recording fetch plus the same cookie plumbing App.js hands the api. */
function stubApi(respond) {
  const calls = [];
  let cookie = "ab_session=live";
  const api = createAuthApi({
    origin: "https://api.test",
    getCookie: () => cookie,
    setCookie: (value) => { cookie = value; },
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return respond(url, init);
    }
  });
  return { api, calls, readCookie: () => cookie };
}

test("confirming 탈퇴 calls the delete endpoint once with confirm: true", async () => {
  const { api, calls } = stubApi(() => jsonResponse({ payload: { ok: true } }));
  const next = await withdrawHost(accountState(), api);

  assert.equal(calls.length, 1, "탈퇴 must hit the server exactly once");
  assert.equal(calls[0].url, `https://api.test${AUTH_API.accountDelete}`);
  assert.equal(calls[0].url, "https://api.test/api/account/delete");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].init.body), { confirm: true });
  assert.equal(calls[0].init.headers.cookie, "ab_session=live", "the session cookie identifies who is leaving");
  assert.equal(next.error, "");
});

test("a successful 탈퇴 clears the session and lands on the logged-out home", async () => {
  const { api, readCookie } = stubApi(() => jsonResponse({ payload: { ok: true } }));
  const before = accountState();
  const next = await withdrawHost(before, api);

  assert.equal(next.session.user, null, "the deleted account must not still look signed in");
  assert.equal(next.accountOpen, false);
  assert.equal(next.screen, "signup");
  assert.equal(readCookie(), "", "the local session cookie dies with the account");

  // Same landing as a logout: one logged-out home, not a second half-signed-in state.
  const loggedOut = await logoutAccount(before, { logout: async () => ({ ok: true }) });
  assert.deepEqual(next, loggedOut);
});

test("a failed 탈퇴 says so and keeps the account signed in", async () => {
  const { api, calls, readCookie } = stubApi(() => jsonResponse({
    ok: false,
    status: 500,
    payload: { ok: false, error: "failed" }
  }));
  const next = await withdrawHost(accountState(), api);

  assert.equal(calls.length, 1);
  assert.equal(next.error, WITHDRAW_COPY.failed);
  assert.equal(next.error, "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.");
  assert.equal(next.screen, "account", "a failure must not silently walk the user out");
  assert.equal(next.session.user.email, "leaver@example.com");
  assert.equal(next.busy, false);
  assert.equal(readCookie(), "ab_session=live", "nothing was deleted, so nothing is signed out");
});

test("a network failure during 탈퇴 is reported, never swallowed", async () => {
  const { api } = stubApi(() => { throw new Error("offline"); });
  const next = await withdrawHost(accountState(), api);

  assert.equal(next.error, WITHDRAW_COPY.failed);
  assert.equal(next.screen, "account");
  assert.equal(next.session.user.email, "leaver@example.com");
});

test("an expired session during 탈퇴 shows the login message, not a fake success", async () => {
  const { api } = stubApi(() => jsonResponse({
    ok: false,
    status: 401,
    payload: { ok: false, error: "unauthenticated" }
  }));
  const next = await withdrawHost(accountState(), api);

  assert.equal(next.error, WITHDRAW_ERRORS.unauthenticated);
  assert.notEqual(next.error, "");
  assert.equal(next.screen, "account");
});

test("an api without deleteAccount fails loudly rather than dead-tapping", async () => {
  const next = await withdrawHost(accountState(), {});
  assert.equal(next.error, WITHDRAW_COPY.failed);
  assert.equal(next.screen, "account");
});

test("돌아가기 never calls the delete endpoint, and only the confirm tap can", async () => {
  const screens = await readFile("mobile/src/screens.js", "utf8");
  const app = await readFile("mobile/App.js", "utf8");
  const api = await readFile("mobile/s0-s2-s3-api.js", "utf8");
  const session = await readFile("mobile/src/session.js", "utf8");

  const account = screens.slice(
    screens.indexOf("export function AccountScreen"),
    screens.indexOf("export function UnlockRestScreen")
  );
  const cancelLine = account.split("\n").find((line) => line.includes('testID="account-withdraw-cancel"'));
  assert.ok(cancelLine, "the confirm block still offers 돌아가기");
  assert.equal(cancelLine.includes("onWithdraw"), false, "cancel must not delete");
  assert.match(cancelLine, /setConfirmingWithdraw\(false\)/);
  const entryLine = account.split("\n").find((line) => line.includes('testID="account-withdraw"'));
  assert.equal(entryLine.includes("onWithdraw"), false, "the entry row only opens the confirm block");

  // App.js hands the screen a real handler, and it is the only route to the endpoint.
  assert.match(app, /onWithdraw=\{async \(\) => \{/);
  assert.match(app, /await withdrawHost\(state, api\)/);
  assert.equal(app.match(/withdrawHost\(/g).length, 1);
  assert.match(app, /Alert\.alert\(next\.error\)/, "a failed 탈퇴 has to be visible to the user");
  assert.match(app, /import \{ Alert, Linking, Share \} from "react-native";/);

  // Deletion lives in exactly one place in the client.
  assert.equal(session.match(/deleteAccount/g).length, 1);
  assert.equal(api.match(/AUTH_API\.accountDelete/g).length, 1);
  assert.equal(api.match(/confirm: true/g).length, 1);
  assert.equal(app.includes("/api/account/delete"), false);
  assert.equal(screens.includes("/api/account/delete"), false);
});

async function startServer() {
  const store = createMemoryStore();
  const couple = createCouple({ store });
  const auth = createAuth({
    store,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  const account = createAccount({ store });
  const outbox = [];
  const server = createServer(createListener({
    auth, couple, account,
    root: process.cwd(),
    allowDevOutbox: true,
    mailEnv: {},
    outbox
  }));
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port, store, outbox }));
  });
}

test("the native 탈퇴 really deletes the account on a live server", async () => {
  const { server, port, store, outbox } = await startServer();
  try {
    let cookie = "";
    const api = createAuthApi({
      origin: `http://127.0.0.1:${port}`,
      getCookie: () => cookie,
      setCookie: (value) => { cookie = value; }
    });
    await api.requestMagicLink("leaver@example.com");
    const mail = outbox.find((item) => item.email === "leaver@example.com" && item.type === "magic-link");
    const consumed = await api.consumeMagicLink(String(mail.url).match(/token=([^&]+)/)[1]);
    assert.equal(consumed.ok, true);
    assert.equal(store.snapshot().users.length, 1);

    const next = await withdrawHost(accountState(), api);

    assert.equal(next.error, "");
    assert.equal(next.session.user, null);
    assert.equal(store.snapshot().users.length, 0, "the row is gone, not just the screen");
    assert.equal(store.snapshot().sessions.length, 0);
    assert.equal(cookie, "");

    // Repeating it is unauthenticated, and still never reports a false success.
    const again = await withdrawHost(accountState(), api);
    assert.equal(again.error, WITHDRAW_ERRORS.unauthenticated);
  } finally {
    server.close();
  }
});
