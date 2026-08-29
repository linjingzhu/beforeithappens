import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { AUTH_COPY as WEB_AUTH_COPY } from "../src/auth.js";

const mobileFiles = [
  "mobile/App.js",
  "mobile/src/copy.js",
  "mobile/src/session.js",
  "mobile/src/screens.js",
  "mobile/src/theme.js"
];

async function readMobileSource() {
  return (await Promise.all(mobileFiles.map((file) => readFile(file, "utf8")))).join("\n");
}

test("native S0 copy matches the web product and S2 locked strings", async () => {
  const copySource = await readFile("mobile/src/copy.js", "utf8");
  assert.match(copySource, /export const WORDMARK = "LoveMe"/);
  assert.match(copySource, /export const LINE = "두 사람의 결혼 준비, 한곳에"/);
  assert.match(copySource, /export const SPLASH_MS = 1200/);
  assert.match(copySource, new RegExp(`title: "${WEB_AUTH_COPY.title}"`));
  assert.match(copySource, new RegExp(`body: "${WEB_AUTH_COPY.body}"`));
  assert.match(copySource, new RegExp(`cta: "${WEB_AUTH_COPY.cta}"`));
  assert.match(copySource, new RegExp(`sent: "${WEB_AUTH_COPY.sent.replaceAll(".", "\\.")}"`));
});

test("logged-out splash routes to signup, not install or empty home", async () => {
  const app = await readFile("mobile/App.js", "utf8");
  const session = await readFile("mobile/src/session.js", "utf8");
  const screens = await readFile("mobile/src/screens.js", "utf8");
  assert.match(session, /return false/);
  assert.match(session, /return loggedIn \? "session" : "signup"/);
  assert.match(app, /afterSplashScreen\(\)/);
  assert.match(app, /SPLASH_MS/);
  assert.match(app, /SignupPlaceholder/);
  assert.match(screens, /testID="splash"/);
  assert.match(screens, /testID="signup"/);
  assert.equal(screens.includes("testID=\"home\""), false);
  assert.equal(screens.includes("testID=\"install\""), false);
  assert.match(screens, /AUTH_COPY\.body/);
  assert.equal(screens.includes("AUTH_COPY.cta"), false);
});

test("native app does not include the web-only S1 install landing", async () => {
  const source = await readMobileSource();
  for (const forbidden of [
    "앱을 설치하면 시작할 수 있어요",
    "App Store",
    "Google Play",
    "지금은 웹에서 시작할래요",
    "앱 설치하기",
    "apps.apple.com",
    "play.google.com",
    "결혼 팩",
    "Kakao",
    "kauth.kakao.com",
    "apple-app-site-association",
    "assetlinks.json",
    "universal link",
    "결제"
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
});

test("iOS and Android project targets exist for LoveMe", async () => {
  await access("mobile/ios/LoveMe.xcodeproj/project.pbxproj");
  await access("mobile/ios/LoveMe/Info.plist");
  await access("mobile/android/app/src/main/AndroidManifest.xml");
  await access("mobile/android/app/build.gradle");
  const plist = await readFile("mobile/ios/LoveMe/Info.plist", "utf8");
  const manifest = await readFile("mobile/android/app/src/main/AndroidManifest.xml", "utf8");
  const strings = await readFile("mobile/android/app/src/main/res/values/strings.xml", "utf8");
  assert.match(plist, /<string>LoveMe<\/string>/);
  assert.equal(plist.includes("associated-domains"), false);
  assert.equal(plist.includes("applinks:"), false);
  assert.match(strings, /LoveMe/);
  assert.match(manifest, /android.intent.action.MAIN/);
  assert.match(manifest, /android.intent.category.LAUNCHER/);
  assert.equal(manifest.includes("applinks"), false);
});
