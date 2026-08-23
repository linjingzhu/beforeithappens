import test from "node:test";
import assert from "node:assert/strict";
import { AUTH_COPY, AUTH_ERRORS, INVITE_COPY, absoluteInviteUrl, canOpenPack, classifyInviteConflict, consumeAuthLocation, emptySession, formatRemaining, inviteAcceptUrl, resolveInviteAcceptError, resolveSignedInView, resolveSignedOutView, shareInviteChannel } from "../src/auth.js";
import { renderInviteAccept, renderInviteWaitingHome, renderLoginNotice, renderOnboarding, renderPackReady, renderSent } from "../src/auth-ui.js";
import { createAuth, hashToken, hasAcceptedPartner, isValidEmail, MAGIC_LINK_TTL_MS, normalizeEmail } from "../server/auth.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { createCouple } from "../server/workspace.mjs";

function authWithClock(start = Date.parse("2026-08-23T00:00:00.000Z")) {
  let now = start;
  let tokens = 0;
  const store = createMemoryStore();
  const couple = createCouple({
    store,
    now: () => now,
    randomToken: () => `invite-${++tokens}`
  });
  const auth = createAuth({
    store,
    now: () => now,
    randomToken: () => `token-${++tokens}`,
    onLogin: (userId) => couple.ensureWorkspace(userId),
    describeWorkspace: (userId) => couple.viewForUser(userId)
  });
  return {
    auth,
    couple,
    store,
    advance(ms) { now += ms; }
  };
}

test("email identity is unique after trim and lowercase", () => {
  assert.equal(normalizeEmail("  Buyer@Example.com "), "buyer@example.com");
  assert.equal(isValidEmail("buyer@example.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
});

test("magic link lasts 10 minutes, is single-use, and reissue expires the previous token", () => {
  const { auth, store, advance } = authWithClock();
  const first = auth.requestMagicLink("buyer@example.com");
  const second = auth.requestMagicLink("buyer@example.com");
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(store.snapshot().users.length, 1);
  assert.equal(auth.consumeMagicLink(first.token).error, "expired");
  const consumed = auth.consumeMagicLink(second.token);
  assert.equal(consumed.ok, true);
  assert.equal(auth.consumeMagicLink(second.token).error, "used");
  advance(MAGIC_LINK_TTL_MS + 1);
  const late = auth.requestMagicLink("buyer@example.com");
  advance(MAGIC_LINK_TTL_MS + 1);
  assert.equal(auth.consumeMagicLink(late.token).error, "expired");
});

test("tokens are stored hashed and consume creates one session with the post-login notice", () => {
  const { auth, store } = authWithClock();
  const issued = auth.requestMagicLink("buyer@example.com");
  assert.equal(store.snapshot().magicLinks[0].tokenHash, hashToken(issued.token));
  assert.equal(store.snapshot().magicLinks[0].token, undefined);
  const consumed = auth.consumeMagicLink(issued.token);
  const session = auth.sessionFor(consumed.sessionId);
  assert.equal(session.user.email, "buyer@example.com");
  assert.equal(session.notice, "no-local-draft");
  assert.equal(session.workspace.acceptedPartner, false);
  assert.ok(session.workspace.id);
  assert.equal(session.workspace.role, "buyer");
  assert.equal(canOpenPack(session), false);
  assert.equal(store.snapshot().workspaces.length, 1);
  assert.equal(store.snapshot().members.length, 1);
});

test("a new login force-logs out the previous session", () => {
  const { auth } = authWithClock();
  const first = auth.consumeMagicLink(auth.requestMagicLink("buyer@example.com").token);
  const second = auth.consumeMagicLink(auth.requestMagicLink("buyer@example.com").token);
  assert.equal(auth.sessionFor(first.sessionId).user, null);
  assert.equal(auth.sessionFor(second.sessionId).user.email, "buyer@example.com");
  assert.equal(auth.forceLogout(second.sessionId).ok, true);
  assert.equal(auth.sessionFor(second.sessionId).user, null);
});

test("logout and forceLogout both clear the user's only session", () => {
  const { auth, store } = authWithClock();
  const buyer = auth.consumeMagicLink(auth.requestMagicLink("buyer@example.com").token);
  assert.equal(auth.logout(buyer.sessionId).ok, true);
  assert.equal(auth.sessionFor(buyer.sessionId).user, null);
  assert.equal(store.snapshot().sessions.length, 0);

  const again = auth.consumeMagicLink(auth.requestMagicLink("buyer@example.com").token);
  assert.equal(auth.forceLogout(again.sessionId).ok, true);
  assert.equal(auth.sessionFor(again.sessionId).user, null);
  assert.equal(store.snapshot().sessions.length, 0);
});

test("ghost workspaces without an accepted partner do not unlock the pack", () => {
  const store = createMemoryStore();
  store.mutate((state) => {
    state.users.push({ id: "usr_1", email: "buyer@example.com" });
    state.workspaces.push({ id: "ws_1" });
    state.members.push({ workspaceId: "ws_1", userId: "usr_1", status: "accepted" });
  });
  assert.equal(hasAcceptedPartner(store.snapshot(), "usr_1"), false);
  store.mutate((state) => {
    state.users.push({ id: "usr_2", email: "partner@example.com" });
    state.members.push({ workspaceId: "ws_1", userId: "usr_2", status: "accepted" });
  });
  assert.equal(hasAcceptedPartner(store.snapshot(), "usr_1"), true);
  assert.equal(canOpenPack({ user: { id: "usr_1" }, workspace: { acceptedPartner: false } }), false);
  assert.equal(canOpenPack({ user: { id: "usr_1" }, workspace: { acceptedPartner: true } }), true);
  assert.equal(canOpenPack(emptySession()), false);
});

test("onboarding copy is exact and never includes device-handoff text", () => {
  assert.equal(AUTH_COPY.title, "두 사람의 결혼 준비, 한곳에");
  assert.equal(AUTH_COPY.body, "비밀번호 없이 이메일로 로그인 링크를 보내드려요.");
  assert.equal(AUTH_COPY.cta, "로그인 링크 보내기");
  assert.equal(AUTH_COPY.sent, "메일을 확인해 주세요. 링크는 10분 동안만 유효해요.");
  assert.equal(AUTH_COPY.afterLogin, "이 기기 임시 답은 이어지지 않아요.");
  assert.equal(AUTH_COPY.logoutHandoff, "로그아웃 후 이 기기를 넘겨주세요.");
  const onboarding = renderOnboarding({ email: "buyer@example.com" });
  assert.match(onboarding, new RegExp(AUTH_COPY.title));
  assert.match(onboarding, new RegExp(AUTH_COPY.body));
  assert.match(onboarding, new RegExp(AUTH_COPY.cta));
  assert.equal(onboarding.includes(AUTH_COPY.logoutHandoff), false);
  assert.equal(onboarding.includes("data-action=\"open-product\""), false);
  assert.match(renderSent(), new RegExp(AUTH_COPY.sent));
  assert.match(renderLoginNotice(), new RegExp(AUTH_COPY.afterLogin));
  const home = renderInviteWaitingHome({ email: "buyer@example.com" });
  assert.match(home, new RegExp(INVITE_COPY.title));
  assert.match(home, new RegExp(INVITE_COPY.rule));
  assert.match(home, new RegExp(AUTH_COPY.logoutHandoff));
  assert.equal(home.includes(INVITE_COPY.startPack), false);
  assert.equal(home.includes("data-action=\"open-product\""), false);
  assert.equal(home.includes("data-role="), false);
  assert.equal(formatRemaining(7 * 24 * 60 * 60 * 1000), "7일 0시간");
  assert.match(renderInviteAccept({ error: "expired" }), new RegExp(INVITE_COPY.expired));
  assert.match(renderInviteAccept({ error: "mismatch" }), new RegExp(INVITE_COPY.mismatch));
  assert.match(renderPackReady(), new RegExp(INVITE_COPY.startPack));
  const waiting = renderInviteWaitingHome({
    invite: {
      status: "waiting",
      remainingMs: 3 * 60 * 60 * 1000,
      lastSentAt: "2026-08-23T00:00:00.000Z",
      url: "/invite/accept?token=share-1"
    }
  });
  assert.match(waiting, new RegExp(INVITE_COPY.waiting));
  assert.match(waiting, new RegExp(INVITE_COPY.share));
  assert.match(waiting, new RegExp(INVITE_COPY.copyLink));
  assert.match(waiting, new RegExp(INVITE_COPY.instagram));
  assert.match(waiting, new RegExp(INVITE_COPY.kakao));
  assert.match(waiting, new RegExp(INVITE_COPY.deviceRule));
  assert.match(waiting, new RegExp(INVITE_COPY.emailCheck));
  assert.match(waiting, new RegExp(INVITE_COPY.editResend));
  assert.equal(waiting.includes(INVITE_COPY.startPack), false);
  assert.equal(waiting.includes("Kakao.Auth"), false);
  assert.equal(waiting.includes("kauth.kakao.com"), false);
  const copied = renderInviteWaitingHome({
    invite: { status: "waiting", remainingMs: 60000, lastSentAt: "2026-08-23T00:00:00.000Z", url: "/invite/accept?token=share-1" },
    copied: true
  });
  assert.match(copied, new RegExp(INVITE_COPY.copied));
  assert.match(renderInviteAccept({ error: "other-session" }), new RegExp(INVITE_COPY.otherSession));
  assert.match(renderInviteAccept({ error: "other-session" }), new RegExp(INVITE_COPY.logoutContinue));
  assert.equal(renderInviteAccept({ error: "other-session", preview: { ok: true }, email: "buyer@example.com" }).includes(INVITE_COPY.accept), false);
  assert.equal(resolveSignedOutView("sent"), "sent");
  assert.equal(resolveSignedInView({ notice: "no-local-draft" }, false), "notice");
  assert.equal(resolveSignedInView({ notice: "no-local-draft" }, false, true, true), "invite");
  assert.equal(resolveSignedInView({ notice: null }, false), "home");
  assert.equal(consumeAuthLocation("/auth/consume", "?token=abc").token, "abc");
  assert.equal(AUTH_ERRORS.expired.includes("만료"), true);
});

test("invite share helpers copy or system-share the existing link", async () => {
  assert.equal(inviteAcceptUrl("", "tok 1"), "/invite/accept?token=tok%201");
  assert.equal(inviteAcceptUrl("https://ab.example", "tok"), "https://ab.example/invite/accept?token=tok");
  assert.equal(absoluteInviteUrl("https://ab.example", "/invite/accept?token=tok"), "https://ab.example/invite/accept?token=tok");
  const writes = [];
  assert.equal(await shareInviteChannel("https://ab.example/invite/accept?token=a", "copy", {
    clipboard: { writeText: async (value) => writes.push(value) }
  }), "copied");
  assert.deepEqual(writes, ["https://ab.example/invite/accept?token=a"]);
  const shared = [];
  assert.equal(await shareInviteChannel("https://ab.example/invite/accept?token=a", "kakao", {
    share: async (payload) => shared.push(payload)
  }), "shared");
  assert.equal(shared[0].url, "https://ab.example/invite/accept?token=a");
  assert.equal(shared[0].text, INVITE_COPY.share);
  assert.equal(await shareInviteChannel("https://ab.example/invite/accept?token=a", "instagram", {
    share: async () => { throw Object.assign(new Error("no share"), { name: "AbortError" }); }
  }), "cancelled");
  assert.equal(classifyInviteConflict({
    sessionEmail: "buyer@example.com",
    inviteEmail: "partner@example.com",
    openedWhileSignedIn: true
  }), "other-session");
  assert.equal(classifyInviteConflict({
    sessionEmail: "other@example.com",
    inviteEmail: "partner@example.com",
    openedWhileSignedIn: false
  }), "mismatch");
  assert.equal(resolveInviteAcceptError({
    preview: { ok: true, email: "partner@example.com" },
    session: { user: { email: "buyer@example.com" } },
    openedWhileSignedIn: true
  }), "other-session");
  assert.equal(resolveInviteAcceptError({
    preview: { ok: true, email: "partner@example.com" },
    session: { user: { email: "partner@example.com" } },
    openedWhileSignedIn: true
  }), "");
});
