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

export async function openInSystemBrowser(pageUrl, io = {}) {
  const href = systemBrowserHref(pageUrl, io.userAgent || "");
  if (io.clipboard?.writeText) {
    try { await io.clipboard.writeText(String(pageUrl || href)); } catch { /* ignore */ }
  }
  if (typeof io.assign === "function") io.assign(href);
  return href;
}
