import { PENDING_INVITE_KEY, emailsMatch, inviteAcceptUrl } from "./auth.js";

export const INSTALL_COPY = {
  banner: "앱에서 보면 초대와 알림이 더 쉬워요.",
  bannerCta: "앱 설치하기",
  bannerSkip: "웹에서 계속",
  landingTitle: "앱을 설치하면 시작할 수 있어요.",
  appStore: "App Store",
  googlePlay: "Google Play",
  webContinue: "지금은 웹에서 시작할래요.",
  instagramStart: "시작하기",
  inAppHint: "바로 설치가 안 될 수 있어요. Safari 또는 Chrome에서 열어 주세요.",
  openBrowser: "브라우저에서 열기"
};

export const INSTALL_PATH = "/install";
export const INVITE_ACCEPT_PATH = "/invite/accept";
export const START_PATH = "/start";
export const INSTALL_SKIP_KEY = "ab-skip-web-install";

// Placeholder store homepages. No published AB listing exists; do not invent an app id.
export const STORE_URLS = {
  appStore: "https://apps.apple.com/",
  googlePlay: "https://play.google.com/store"
};

export function isInstallPath(pathname = "") {
  return pathname === INSTALL_PATH;
}

export function isStartPath(pathname = "") {
  return pathname === START_PATH;
}

export function resolveInstallView(pathname = "") {
  if (isInstallPath(pathname)) return "install";
  if (isStartPath(pathname)) return "start";
  return "";
}

export function instagramStartHref() {
  return INSTALL_PATH;
}

export function isInAppBrowser(userAgent = "") {
  return /Instagram|FBAN|FBAV|KAKAOTALK/i.test(String(userAgent || ""));
}

export function readInstallSkip(storage = globalThis.sessionStorage) {
  try {
    return storage?.getItem(INSTALL_SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeInstallSkip(storage = globalThis.sessionStorage) {
  try {
    storage?.setItem(INSTALL_SKIP_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function shouldShowInstallBanner({ signedIn = false, skipped = false } = {}) {
  return Boolean(signedIn) && !skipped;
}

export function webPathRequiresInstall() {
  return false;
}

export function isPlaceholderStoreUrl(url = "") {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    if (host === "apps.apple.com") return path === "/";
    if (host === "play.google.com") return path === "/store";
    return false;
  } catch {
    return false;
  }
}

export function systemBrowserHref(pageUrl, userAgent = "") {
  let parsed;
  try {
    parsed = new URL(pageUrl);
  } catch {
    return String(pageUrl || "");
  }
  if (/android/i.test(String(userAgent || ""))) {
    return `intent://${parsed.host}${parsed.pathname}${parsed.search}${parsed.hash}#Intent;scheme=${parsed.protocol.replace(":", "")};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(parsed.href)};end`;
  }
  return parsed.href;
}

/**
 * Which URL to hand to Safari/Chrome.
 *
 * The other browser cannot read this one's storage, so on the invite accept screen the token
 * has to travel in the URL itself or the friend lands in the system browser signed out and
 * with no invite — the exact dead end the escape hatch exists to avoid. It is rebuilt from the
 * live token rather than copied from the address bar, so it survives the magic-link consume
 * that replaces the path with "/".
 */
export function handoffPageUrl({ origin = "", view = "", inviteToken = "", onInviteAccept = false } = {}) {
  if (onInviteAccept && inviteToken) return inviteAcceptUrl(origin, inviteToken);
  const path = view === "start" ? START_PATH : INSTALL_PATH;
  try {
    return new URL(path, origin).href;
  } catch {
    return path;
  }
}

export async function openInSystemBrowser(pageUrl, io = {}) {
  const href = systemBrowserHref(pageUrl, io.userAgent || "");
  if (io.clipboard?.writeText) {
    try { await io.clipboard.writeText(String(pageUrl || href)); } catch { /* ignore */ }
  }
  if (typeof io.assign === "function") io.assign(href);
  return href;
}

/**
 * Pending invite handoff.
 *
 * The friend arrives on `/invite/accept?token=…` without an account, so the token has to
 * survive a login round trip. That round trip does not always come back to the same tab:
 * a magic-link mail opens a fresh one, and an in-app browser can hand the page to Safari or
 * Chrome. `sessionStorage` alone is per-tab, so the token was silently dropped and the friend
 * landed on the buyer's own "invite your partner" home instead of the accept screen.
 *
 * Persisting the token is not a login shortcut: accepting still requires a session whose
 * email equals the invited email, and the server still enforces single-use and the 7-day
 * expiry. The stored copy is capped at that same 7 days so a dead token cannot outlive it.
 */
export const PENDING_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function pendingInviteStores(io = {}) {
  const list = [];
  const local = "local" in io ? io.local : globalThis.localStorage;
  const session = "session" in io ? io.session : globalThis.sessionStorage;
  if (local) list.push(local);
  if (session) list.push(session);
  return list;
}

function parsePendingInvite(raw, now) {
  const value = String(raw || "");
  if (!value) return "";
  let entry;
  try {
    entry = JSON.parse(value);
  } catch {
    return value;
  }
  if (!entry || typeof entry !== "object") return value;
  const token = String(entry.token || "");
  if (!token) return "";
  const savedAt = Number(entry.savedAt);
  if (!Number.isFinite(savedAt)) return token;
  return now - savedAt > PENDING_INVITE_TTL_MS || savedAt > now ? "" : token;
}

export function readPendingInvite(io = {}, now = Date.now()) {
  for (const store of pendingInviteStores(io)) {
    let raw = null;
    try {
      raw = store.getItem(PENDING_INVITE_KEY);
    } catch {
      continue;
    }
    const token = parsePendingInvite(raw, now);
    if (token) return token;
  }
  return "";
}

export function writePendingInvite(token, io = {}, now = Date.now()) {
  const value = String(token || "");
  if (!value) return false;
  const payload = JSON.stringify({ token: value, savedAt: now });
  let wrote = false;
  for (const store of pendingInviteStores(io)) {
    try {
      store.setItem(PENDING_INVITE_KEY, payload);
      wrote = true;
    } catch { /* ignore */ }
  }
  return wrote;
}

export function clearPendingInvite(io = {}) {
  for (const store of pendingInviteStores(io)) {
    try {
      store.removeItem(PENDING_INVITE_KEY);
    } catch { /* ignore */ }
  }
}

/**
 * Verdicts that mean the invite is over. `invalid` is deliberately not one of them: the
 * preview call reports a thrown fetch as `invalid` too, and a friend on a bad train
 * connection must not lose a good token to one failed request.
 */
export const SPENT_INVITE_ERRORS = Object.freeze(["used", "expired"]);

/**
 * A stored token is only worth keeping while it can still be accepted on this device.
 * A spent invite renders an accept screen with no accept button, and the buyer who issued
 * the invite can never accept their own — keeping either one would turn a per-tab dead end
 * into a permanent one now that the token outlives the tab.
 */
export function keepPendingInvite({ preview = null, session = null } = {}) {
  if (!preview) return true;
  if (!preview.ok) return !SPENT_INVITE_ERRORS.includes(String(preview.error || ""));
  const invite = session?.workspace?.role === "buyer" ? session.workspace.invite : null;
  return !(invite?.email && preview.email && emailsMatch(invite.email, preview.email));
}
