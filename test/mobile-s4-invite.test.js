import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { createServer } from "node:http";
import { AUTH_COPY, INVITE_COPY, classifyInviteConflict, resolveInviteAcceptError } from "../src/auth.js";
import { createAuth } from "../server/auth.mjs";
import { createListener } from "../server/app.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";
import { PRODUCT_INVITE_COPY, S4_COPY, SAME_SESSION_COPY, assertLockedS4Copy } from "../mobile/s4-invite/copy.js";
import { INVITE_API, createInviteApi } from "../mobile/s4-invite/api.js";
import {
  APP_S4_SCREEN,
  APP_SAME_SESSION_SCREEN,
  buyerHomeOpensPack,
  inviteBlockingCopy,
  resolveNativeInviteScreen,
  s4ShareButtons,
  s4ViewModel,
  s4VisibleActions,
  sameSessionViewModel,
  shareS4Invite
} from "../mobile/s4-invite/flow.js";
import { renderInviteBlock, renderS4BuyerHome, renderSameSessionFail } from "../mobile/s4-invite/render.js";

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(path));
    else files.push(path);
  }
  return files;
}

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

async function login(port, email) {
  await request(port, "/api/auth/magic-link", { method: "POST", body: { email } });
  const outbox = await request(port, "/api/dev/outbox");
  const item = outbox.json.items.find((entry) => entry.type === "magic-link" && entry.email === email);
  const token = new URL(item.url).searchParams.get("token");
  const consume = await request(port, "/api/auth/consume", { method: "POST", body: { token } });
  return sessionCookie(consume.setCookie);
}

test("S4 copy is exact and locked to the web invite strings", () => {
  assert.equal(assertLockedS4Copy(), true);
  assert.equal(S4_COPY.share, "링크를 보내 파트너를 초대하세요.");
  assert.deepEqual(s4ShareButtons(), ["링크 복사", "인스타그램", "카카오톡"]);
  assert.equal(S4_COPY.copied, "링크를 복사했어요.");
  assert.equal(S4_COPY.deviceRule, "같은 폰에서 두 계정을 동시에 쓸 수는 없어요.");
  assert.equal(S4_COPY.emailCheck, "초대 메일이 맞는지 다시 확인해 주세요.");
  assert.equal(S4_COPY.editResend, "이메일 수정하고 다시 보내기");
  assert.equal(S4_COPY.logoutHandoff, "로그아웃 후 이 기기를 넘겨주세요.");
  assert.equal(SAME_SESSION_COPY.message, "이 기기에 다른 계정으로 로그인되어 있어요.");
  assert.equal(SAME_SESSION_COPY.cta, "로그아웃하고 넘기기");
  assert.equal(PRODUCT_INVITE_COPY.expired, INVITE_COPY.expired);
  assert.equal(PRODUCT_INVITE_COPY.mismatch, INVITE_COPY.mismatch);
  assert.equal(S4_COPY.share, INVITE_COPY.share);
  assert.equal(S4_COPY.logoutHandoff, AUTH_COPY.logoutHandoff);
});

test("S4 buyer home is invite-waiting with no pack CTA, payment, or role switch", () => {
  const empty = s4VisibleActions({ hasInvite: false });
  const waiting = s4VisibleActions({ hasInvite: true });
  assert.equal(empty.packCta, false);
  assert.equal(waiting.packCta, false);
  assert.equal(waiting.share, true);
  assert.equal(waiting.editResend, true);
  assert.equal(waiting.firstSend, false);
  assert.equal(empty.firstSend, true);
  assert.equal(waiting.payment, false);
  assert.equal(waiting.roleSwitch, false);
  assert.equal(waiting.storeRedirect, false);
  assert.equal(waiting.deferredDeepLink, false);
  assert.equal(waiting.joinConfirm, false);
  assert.equal(buyerHomeOpensPack({ user: { id: "u" }, workspace: { acceptedPartner: true } }), false);
  const html = renderS4BuyerHome({
    email: "buyer@example.com",
    invite: { status: "waiting", remainingMs: 60000, lastSentAt: "2026-08-23T00:00:00.000Z", url: "/invite/accept?token=a", email: "partner@example.com" },
    copied: true
  });
  assert.match(html, /링크를 보내 파트너를 초대하세요\./);
  assert.match(html, /링크 복사/);
  assert.match(html, /인스타그램/);
  assert.match(html, /카카오톡/);
  assert.match(html, /링크를 복사했어요\./);
  assert.match(html, /같은 폰에서 두 계정을 동시에 쓸 수는 없어요\./);
  assert.match(html, /초대 메일이 맞는지 다시 확인해 주세요\./);
  assert.match(html, /이메일 수정하고 다시 보내기/);
  assert.match(html, /로그아웃 후 이 기기를 넘겨주세요\./);
  assert.equal(html.includes("결혼 팩 시작하기"), false);
  assert.equal(html.includes("이 워크스페이스에 합류할까요?"), false);
  assert.equal(html.includes("결제"), false);
  const model = s4ViewModel({ invite: { url: "/invite/accept?token=a" }, copied: true });
  assert.equal(model.actions.packCta, false);
  assert.equal(model.copied, S4_COPY.copied);
});

test("same-session failure is an independent screen and not a role switch", () => {
  const screen = resolveNativeInviteScreen({
    preview: { ok: true, email: "partner@example.com" },
    session: { user: { email: "buyer@example.com" } },
    openedWhileSignedIn: true
  });
  assert.equal(screen, APP_SAME_SESSION_SCREEN);
  assert.equal(resolveNativeInviteScreen({
    preview: { ok: true, email: "partner@example.com" },
    session: { user: { email: "partner@example.com" } },
    openedWhileSignedIn: true
  }), APP_S4_SCREEN);
  assert.equal(classifyInviteConflict({
    sessionEmail: "buyer@example.com",
    inviteEmail: "partner@example.com",
    openedWhileSignedIn: true
  }), "other-session");
  assert.equal(resolveInviteAcceptError({
    preview: { ok: true, email: "partner@example.com" },
    session: { user: { email: "buyer@example.com" } },
    openedWhileSignedIn: true
  }), "other-session");
  const view = sameSessionViewModel();
  assert.equal(view.message, SAME_SESSION_COPY.message);
  assert.equal(view.cta, SAME_SESSION_COPY.cta);
  const html = renderSameSessionFail();
  assert.match(html, /이 기기에 다른 계정으로 로그인되어 있어요\./);
  assert.match(html, /로그아웃하고 넘기기/);
  assert.match(html, /로그아웃 후 이 기기를 넘겨주세요\./);
  assert.equal(html.includes("역할 전환"), false);
  assert.equal(html.includes("이 워크스페이스에 합류할까요?"), false);
});

test("expired and mismatch copies stay the product strings", () => {
  assert.equal(inviteBlockingCopy("expired"), "초대가 만료됐어요. 구매자에게 새 링크를 부탁해 주세요.");
  assert.equal(inviteBlockingCopy("mismatch"), "이 초대는 다른 이메일로 보내졌어요. 초대받은 메일로 로그인해야 해요.");
  assert.match(renderInviteBlock("expired"), /초대가 만료됐어요/);
  assert.match(renderInviteBlock("mismatch"), /이 초대는 다른 이메일로 보내졌어요/);
});

test("S4 share reuses the web share helper for the existing invite link", async () => {
  const writes = [];
  assert.equal(await shareS4Invite("https://ab.example/invite/accept?token=a", "copy", {
    clipboard: { writeText: async (value) => writes.push(value) }
  }), "copied");
  assert.deepEqual(writes, ["https://ab.example/invite/accept?token=a"]);
  const shared = [];
  assert.equal(await shareS4Invite("https://ab.example/invite/accept?token=a", "kakao", {
    share: async (payload) => shared.push(payload)
  }), "shared");
  assert.equal(shared[0].url, "https://ab.example/invite/accept?token=a");
});

test("iOS and Android screens carry the exact copy and omit store/join/deferred work", async () => {
  const files = await walkFiles("mobile/s4-invite");
  const texts = {};
  for (const file of files) texts[file] = await readFile(file, "utf8");
  const joined = Object.values(texts).join("\n");
  for (const needle of [
    "링크를 보내 파트너를 초대하세요.",
    "링크 복사",
    "인스타그램",
    "카카오톡",
    "링크를 복사했어요.",
    "같은 폰에서 두 계정을 동시에 쓸 수는 없어요.",
    "초대 메일이 맞는지 다시 확인해 주세요.",
    "이메일 수정하고 다시 보내기",
    "이 기기에 다른 계정으로 로그인되어 있어요.",
    "로그아웃하고 넘기기",
    "로그아웃 후 이 기기를 넘겨주세요."
  ]) {
    assert.equal(joined.includes(needle), true, needle);
  }
  assert.match(texts["mobile/s4-invite/ios/InviteWaitingView.swift"], /InviteWaitingView/);
  assert.match(texts["mobile/s4-invite/ios/SameSessionFailView.swift"], /SameSessionFailView/);
  assert.match(texts["mobile/s4-invite/android/InviteWaitingScreen.kt"], /InviteWaitingScreen/);
  assert.match(texts["mobile/s4-invite/android/SameSessionFailScreen.kt"], /SameSessionFailScreen/);
  assert.equal(joined.includes("이 워크스페이스에 합류할까요?"), false);
  assert.equal(joined.includes("apps.apple.com"), false);
  assert.equal(joined.includes("play.google.com"), false);
  assert.equal(joined.includes("Install Referrer"), false);
  assert.equal(joined.includes("결혼 팩 시작하기"), false);
  assert.equal(/deferredDeepLink:\s*true/.test(joined), false);
  assert.equal(INVITE_API.send.path, "/api/invite");
  assert.equal(INVITE_API.forceLogout.path, "/api/auth/force-logout");
});

test("mobile invite API reuses web send/resend (expires previous token) and force-logout", async () => {
  const { server, port } = await startServer();
  try {
    const buyerCookie = await login(port, "buyer@example.com");
    const api = createInviteApi({
      fetch: (path, options = {}) => fetch(`http://127.0.0.1:${port}${path}`, {
        ...options,
        headers: { ...(options.headers || {}), cookie: buyerCookie }
      })
    });
    const first = await api.sendOrResend("typo@example.com");
    assert.equal(first.ok, true);
    const firstToken = new URL(first.payload.url).searchParams.get("token");
    const second = await api.sendOrResend("partner@example.com");
    assert.equal(second.ok, true);
    const secondToken = new URL(second.payload.url).searchParams.get("token");
    assert.notEqual(firstToken, secondToken);
    const stale = await api.preview(firstToken);
    assert.equal(stale.payload.error, "expired");
    const fresh = await api.preview(secondToken);
    assert.equal(fresh.payload.ok, true);
    assert.equal(fresh.payload.email, "partner@example.com");

    const blocked = await api.accept(secondToken);
    assert.equal(blocked.payload.error, "mismatch");
    const logout = await api.logoutAndContinue();
    assert.equal(logout.ok, true);
    const after = await api.session();
    assert.equal(after.payload.user, null);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
