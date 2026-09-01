import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { INVITE_COPY, PENDING_INVITE_KEY, inviteAcceptUrl } from "../src/auth.js";
import { renderInviteAccept } from "../src/auth-ui.js";
import {
  INSTALL_COPY,
  INSTALL_PATH,
  INVITE_ACCEPT_PATH,
  PENDING_INVITE_TTL_MS,
  SPENT_INVITE_ERRORS,
  clearPendingInvite,
  handoffPageUrl,
  isInAppBrowser,
  keepPendingInvite,
  openInSystemBrowser,
  readPendingInvite,
  systemBrowserHref,
  writePendingInvite
} from "../src/install.js";

function memoryStore(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    map,
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key)
  };
}

function throwingStore() {
  return {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); }
  };
}

test("the pending invite survives a login round trip that lands in another tab", () => {
  // The friend taps the https invite link, then logs in. The magic-link mail opens a fresh
  // tab, so a per-tab store loses the token and the friend lands on the buyer home instead.
  const local = memoryStore();
  const firstTab = memoryStore();
  assert.equal(writePendingInvite("tok-friend", { local, session: firstTab }), true);
  const newTab = memoryStore();
  assert.equal(readPendingInvite({ local, session: newTab }), "tok-friend");
  assert.equal(readPendingInvite({ local: null, session: newTab }), "");
});

test("a stored invite dies with the server-side invite lifetime", () => {
  const local = memoryStore();
  const now = Date.UTC(2026, 8, 1);
  writePendingInvite("tok-old", { local, session: null }, now);
  assert.equal(readPendingInvite({ local, session: null }, now + PENDING_INVITE_TTL_MS - 1000), "tok-old");
  assert.equal(readPendingInvite({ local, session: null }, now + PENDING_INVITE_TTL_MS + 1000), "");
  // A clock that moved backwards must not resurrect a token either.
  assert.equal(readPendingInvite({ local, session: null }, now - 60000), "");
});

test("pending invite storage never throws and stays on the documented key", () => {
  const local = memoryStore();
  assert.equal(writePendingInvite("tok-a", { local, session: throwingStore() }), true);
  assert.equal(local.map.has(PENDING_INVITE_KEY), true);
  assert.equal(readPendingInvite({ local: throwingStore(), session: local }), "tok-a");
  assert.equal(writePendingInvite("", { local, session: null }), false);
  assert.equal(writePendingInvite("tok-a", { local: throwingStore(), session: throwingStore() }), false);
  clearPendingInvite({ local, session: throwingStore() });
  assert.equal(readPendingInvite({ local, session: null }), "");
  clearPendingInvite({ local: null, session: null });
  // A token written by an older build was a bare string; it still has to be readable.
  const legacy = memoryStore({ [PENDING_INVITE_KEY]: "tok-legacy" });
  assert.equal(readPendingInvite({ local: null, session: legacy }), "tok-legacy");
});

test("a spent or self-issued invite is not kept, an open one is", () => {
  const friend = { user: { email: "friend@example.com" }, workspace: { role: "partner", acceptedPartner: false } };
  assert.equal(keepPendingInvite({ preview: null, session: friend }), true);
  assert.equal(keepPendingInvite({ preview: { ok: true, email: "friend@example.com" }, session: friend }), true);
  assert.equal(keepPendingInvite({ preview: { ok: false, error: "used" }, session: friend }), false);
  assert.equal(keepPendingInvite({ preview: { ok: false, error: "expired" }, session: friend }), false);
  // `invalid` is also what a thrown preview fetch reports, so a network blip keeps the token.
  assert.equal(keepPendingInvite({ preview: { ok: false, error: "invalid" }, session: null }), true);
  assert.deepEqual([...SPENT_INVITE_ERRORS], ["used", "expired"]);
  // The buyer who issued the link can never accept it; holding it would strand them on the
  // accept screen with no accept button on every later visit.
  const buyer = {
    user: { email: "owner@example.com" },
    workspace: { role: "buyer", acceptedPartner: false, invite: { email: "Friend@Example.com" } }
  };
  assert.equal(keepPendingInvite({ preview: { ok: true, email: "friend@example.com" }, session: buyer }), false);
  // A different, still-open invite on the same device is left alone.
  assert.equal(keepPendingInvite({ preview: { ok: true, email: "someone@example.com" }, session: buyer }), true);
});

test("the web invite flow stores the token durably and keeps the link re-openable", async () => {
  const app = await readFile("src/app.js", "utf8");
  // The per-tab store dropped the friend's invite; the durable helpers replace it.
  assert.equal(app.includes("sessionStorage.setItem(PENDING_INVITE_KEY"), false);
  assert.equal(app.includes("sessionStorage.getItem(PENDING_INVITE_KEY"), false);
  assert.equal(app.includes("sessionStorage.removeItem(PENDING_INVITE_KEY"), false);
  // The invite-conflict flag stays per-tab on purpose: it describes this tab's session.
  assert.match(app, /sessionStorage\.(get|set|remove)Item\(INVITE_CONFLICT_KEY/);
  assert.match(app, /writePendingInvite\(inviteToken\)/);
  assert.match(app, /inviteToken = readPendingInvite\(\)/);
  assert.match(app, /if \(inviteToken && !keepPendingInvite\(\{ preview: invitePreview, session \}\)\)/);
  // An in-app browser hands the visible URL to Safari/Chrome, which cannot read this
  // browser's storage, so an open invite must stay in the address bar.
  assert.equal(app.includes('locationInfo.isConsumePath || locationInfo.isInvitePath) history.replaceState'), false);
  assert.match(app, new RegExp(`window\\.location\\.pathname === INVITE_ACCEPT_PATH`));
  assert.equal(INVITE_ACCEPT_PATH, "/invite/accept");
});

const KAKAO_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) KAKAOTALK 10.4.0";
const SAFARI_UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Safari/605.1.15";

test("the invite accept screen offers the in-app browser escape, and only in one", () => {
  // The accept screen is the first screen the friend ever sees and it usually opens inside
  // the KakaoTalk webview, where a social provider can refuse to sign them in.
  assert.equal(isInAppBrowser(KAKAO_UA), true);
  assert.equal(isInAppBrowser(SAFARI_UA), false);
  assert.equal(INVITE_COPY.inAppHint, "카카오톡 안에서는 로그인이 막힐 수 있어요. Safari 또는 Chrome에서 열어 주세요.");

  // Every state of the accept screen the friend can land on, including the email-bind hop.
  for (const error of ["unauthenticated", "mismatch", "expired", "used", "invalid", "needs-email", ""]) {
    const preview = { ok: error === "" || error === "needs-email", email: "friend@example.com" };
    const inApp = renderInviteAccept({ error, preview, email: "friend@example.com", inAppBrowser: true });
    const normal = renderInviteAccept({ error, preview, email: "friend@example.com", inAppBrowser: false });
    assert.equal(inApp.includes(INVITE_COPY.inAppHint), true, `hint missing for ${error || "(none)"}`);
    assert.match(inApp, /data-action="open-system-browser"/);
    assert.equal(inApp.includes(INSTALL_COPY.openBrowser), true);
    assert.equal(normal.includes(INVITE_COPY.inAppHint), false, `hint leaked for ${error || "(none)"}`);
    assert.equal(normal.includes("open-system-browser"), false, `CTA leaked for ${error || "(none)"}`);
  }

  // Login, not install: the accept screen must not borrow the install landing's line.
  assert.notEqual(INVITE_COPY.inAppHint, INSTALL_COPY.inAppHint);
  assert.equal(renderInviteAccept({ error: "unauthenticated", inAppBrowser: true }).includes(INSTALL_COPY.inAppHint), false);
});

test("the escape hatch hands the other browser a URL that still carries the invite token", async () => {
  // Safari cannot read the KakaoTalk webview's storage, so the token has to be in the URL.
  const handed = handoffPageUrl({
    origin: "https://ab.example",
    view: "product",
    inviteToken: "tok-friend",
    onInviteAccept: true
  });
  assert.equal(handed, inviteAcceptUrl("https://ab.example", "tok-friend"));
  assert.equal(new URL(handed).searchParams.get("token"), "tok-friend");
  assert.equal(new URL(handed).pathname, INVITE_ACCEPT_PATH);

  // Rebuilt from the live token, so a magic-link consume that reset the path to "/" is fine.
  assert.equal(handoffPageUrl({ origin: "https://ab.example", view: "product", inviteToken: "tok-friend", onInviteAccept: true }), handed);

  // Off the accept screen it stays the install/start handoff it always was.
  assert.equal(handoffPageUrl({ origin: "https://ab.example", view: "start", inviteToken: "tok-friend" }), "https://ab.example/start");
  assert.equal(handoffPageUrl({ origin: "https://ab.example", view: "install" }), `https://ab.example${INSTALL_PATH}`);
  // No token means nothing to carry; never hand over a tokenless accept URL.
  assert.equal(handoffPageUrl({ origin: "https://ab.example", onInviteAccept: true }), `https://ab.example${INSTALL_PATH}`);

  // The token survives the Android intent:// wrapper too.
  const intent = systemBrowserHref(handed, "Mozilla/5.0 (Linux; Android 14) KAKAOTALK");
  assert.match(intent, /^intent:\/\//);
  assert.equal(intent.includes("token=tok-friend"), true);
  assert.equal(decodeURIComponent(intent.split("S.browser_fallback_url=")[1]).includes("token=tok-friend"), true);

  const assigned = [];
  const copies = [];
  await openInSystemBrowser(handed, {
    userAgent: SAFARI_UA,
    clipboard: { writeText: async (value) => copies.push(value) },
    assign: (href) => assigned.push(href)
  });
  assert.deepEqual(assigned, [handed]);
  assert.deepEqual(copies, [handed]);
});

test("the accept screen is wired to the escape hatch and hands over the live token", async () => {
  const app = await readFile("src/app.js", "utf8");
  // Both accept-screen branches: the friend signed out, and the friend signed in.
  assert.equal(app.split("renderInviteAccept({").length - 1, 2);
  assert.equal(app.split("inAppBrowser: inAppBrowserNow()").length - 1 >= 2, true);
  assert.match(app, /inviteAcceptVisible = true;/);
  // Reset every render so the handoff cannot keep pointing at an accept screen that is gone.
  assert.match(app, /function render\(\) \{\n  inviteAcceptVisible = false;/);
  assert.match(app, /handoffPageUrl\(\{[\s\S]*?onInviteAccept: inviteAcceptVisible[\s\S]*?\}\)/);
  // The old hardcoded install/start target must be gone from the handoff.
  assert.equal(app.includes("const pageUrl = currentView === \"start\""), false);
});
