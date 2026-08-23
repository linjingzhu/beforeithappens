import test from "node:test";
import assert from "node:assert/strict";
import { INVITE_COPY } from "../src/auth.js";
import { renderInstallBanner, renderInstallLanding, renderInstagramStart, renderInviteAccept, renderInviteWaitingHome, renderPackReady } from "../src/auth-ui.js";
import {
  INSTALL_COPY,
  INSTALL_PATH,
  STORE_URLS,
  instagramStartHref,
  isInAppBrowser,
  isPlaceholderStoreUrl,
  openInSystemBrowser,
  readInstallSkip,
  shouldShowInstallBanner,
  systemBrowserHref,
  webPathRequiresInstall,
  writeInstallSkip
} from "../src/install.js";

test("install copies are exact and locked invite strings stay unchanged", () => {
  assert.equal(INSTALL_COPY.banner, "앱에서 보면 초대와 알림이 더 쉬워요.");
  assert.equal(INSTALL_COPY.bannerCta, "앱 설치하기");
  assert.equal(INSTALL_COPY.bannerSkip, "웹에서 계속");
  assert.equal(INSTALL_COPY.landingTitle, "앱을 설치하면 시작할 수 있어요.");
  assert.equal(INSTALL_COPY.appStore, "App Store");
  assert.equal(INSTALL_COPY.googlePlay, "Google Play");
  assert.equal(INSTALL_COPY.webContinue, "지금은 웹에서 시작할래요.");
  assert.equal(INSTALL_COPY.instagramStart, "시작하기");
  assert.equal(INSTALL_COPY.inAppHint, "바로 설치가 안 될 수 있어요. Safari 또는 Chrome에서 열어 주세요.");
  assert.equal(INSTALL_COPY.openBrowser, "브라우저에서 열기");
  assert.equal(INVITE_COPY.expired, "초대가 만료됐어요. 구매자에게 새 링크를 부탁해 주세요.");
  assert.equal(INVITE_COPY.mismatch, "이 초대는 다른 이메일로 보내졌어요. 초대받은 메일로 로그인해야 해요.");
  assert.equal(INVITE_COPY.otherSession, "이 기기에 다른 계정으로 로그인되어 있어요.");
  assert.equal(INVITE_COPY.emailCheck, "초대 메일이 맞는지 다시 확인해 주세요.");
  const screens = [
    renderInviteWaitingHome({ invite: { status: "waiting", remainingMs: 60000, lastSentAt: "2026-08-23T00:00:00.000Z", url: "/invite/accept?token=a" } }),
    renderInviteAccept({ error: "expired" }),
    renderInviteAccept({ error: "mismatch" }),
    renderPackReady()
  ].join("\n");
  assert.match(screens, new RegExp(INVITE_COPY.expired));
  assert.match(screens, new RegExp(INVITE_COPY.mismatch));
  assert.equal(screens.includes("partner-not-installed"), false);
  assert.equal(screens.includes("앱에서 가입"), false);
});

test("banner and landing skip never block the web path", () => {
  assert.equal(webPathRequiresInstall(), false);
  assert.equal(shouldShowInstallBanner({ signedIn: true, skipped: false }), true);
  assert.equal(shouldShowInstallBanner({ signedIn: true, skipped: true }), false);
  assert.equal(shouldShowInstallBanner({ signedIn: false, skipped: false }), false);
  const storage = new Map();
  const sessionLike = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value)
  };
  assert.equal(readInstallSkip(sessionLike), false);
  writeInstallSkip(sessionLike);
  assert.equal(readInstallSkip(sessionLike), true);
  const hidden = renderInstallBanner({ visible: false });
  assert.equal(hidden.includes(INSTALL_COPY.banner), false);
  const banner = renderInstallBanner({ visible: true });
  assert.match(banner, new RegExp(INSTALL_COPY.banner));
  assert.match(banner, new RegExp(INSTALL_COPY.bannerCta));
  assert.match(banner, new RegExp(INSTALL_COPY.bannerSkip));
  assert.match(banner, new RegExp(`href="${INSTALL_PATH}"`));
  assert.equal(banner.includes(STORE_URLS.appStore), false);
  assert.equal(banner.includes(STORE_URLS.googlePlay), false);
  const landing = renderInstallLanding();
  assert.match(landing, new RegExp(INSTALL_COPY.landingTitle));
  assert.match(landing, new RegExp(INSTALL_COPY.appStore));
  assert.match(landing, new RegExp(INSTALL_COPY.googlePlay));
  assert.match(landing, new RegExp(INSTALL_COPY.webContinue));
  assert.match(landing, new RegExp(STORE_URLS.appStore));
  assert.match(landing, new RegExp(STORE_URLS.googlePlay));
  assert.equal(isPlaceholderStoreUrl(STORE_URLS.appStore), true);
  assert.equal(isPlaceholderStoreUrl(STORE_URLS.googlePlay), true);
  assert.equal(isPlaceholderStoreUrl("https://apps.apple.com/app/id000000"), false);
  assert.equal(landing.includes("/app/id"), false);
  assert.equal(landing.includes("data-action=\"continue-web\""), true);
});

test("Instagram start goes to the install landing and never the store", () => {
  assert.equal(instagramStartHref(), INSTALL_PATH);
  const start = renderInstagramStart();
  assert.match(start, new RegExp(INSTALL_COPY.instagramStart));
  assert.match(start, new RegExp(`href="${INSTALL_PATH}"`));
  assert.equal(start.includes(STORE_URLS.appStore), false);
  assert.equal(start.includes(STORE_URLS.googlePlay), false);
  assert.equal(start.includes("apps.apple.com"), false);
  assert.equal(start.includes("play.google.com"), false);
  assert.equal(start.includes("itms-apps://"), false);
  assert.equal(start.includes("market://"), false);
});

test("in-app Instagram and Kakao browsers show the open-in-browser hint", () => {
  assert.equal(isInAppBrowser("Mozilla/5.0 Instagram 192.168.1.2"), true);
  assert.equal(isInAppBrowser("Mozilla/5.0 KAKAOTALK 10.0"), true);
  assert.equal(isInAppBrowser("Mozilla/5.0 (iPhone) Safari"), false);
  const hidden = renderInstallLanding({ inAppBrowser: false });
  assert.equal(hidden.includes(INSTALL_COPY.inAppHint), false);
  const landing = renderInstallLanding({ inAppBrowser: true });
  assert.match(landing, new RegExp(INSTALL_COPY.inAppHint));
  assert.match(landing, new RegExp(INSTALL_COPY.openBrowser));
  const start = renderInstagramStart({ inAppBrowser: true });
  assert.match(start, new RegExp(INSTALL_COPY.inAppHint));
  assert.match(start, new RegExp(INSTALL_COPY.openBrowser));
  assert.equal(systemBrowserHref("https://ab.example/install", "Mozilla/5.0 Android"), "intent://ab.example/install#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Fab.example%2Finstall;end");
  assert.equal(systemBrowserHref("https://ab.example/install", "Mozilla/5.0 iPhone"), "https://ab.example/install");
});

test("open-in-browser copies the page URL and does not invent an app scheme", async () => {
  const assigned = [];
  const copied = [];
  const href = await openInSystemBrowser("https://ab.example/start", {
    userAgent: "Mozilla/5.0 Instagram iPhone",
    clipboard: { writeText: async (value) => copied.push(value) },
    assign: (value) => assigned.push(value)
  });
  assert.equal(href, "https://ab.example/start");
  assert.deepEqual(copied, ["https://ab.example/start"]);
  assert.deepEqual(assigned, ["https://ab.example/start"]);
  assert.equal(href.startsWith("ab://"), false);
});
