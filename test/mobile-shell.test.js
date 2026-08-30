import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { AUTH_COPY as WEB_AUTH_COPY } from "../src/auth.js";

const mobileFiles = [
  "mobile/App.js",
  "mobile/src/copy.js",
  "mobile/src/session.js",
  "mobile/src/screens.js",
  "mobile/src/theme.js",
  "mobile/src/host.js",
  "mobile/src/s9-mount.js"
];

async function readMobileSource() {
  return (await Promise.all(mobileFiles.map((file) => readFile(file, "utf8")))).join("\n");
}

test("native S0 copy is LoveMe, 한곳에, 1.2s and S2 strings stay locked", async () => {
  const copySource = await readFile("mobile/src/copy.js", "utf8");
  assert.match(copySource, /export const WORDMARK = "LoveMe"/);
  assert.match(copySource, /export const LINE = "두 사람의 결혼 준비, 한곳에"/);
  assert.match(copySource, /export const SPLASH_MS = 1200/);
  assert.match(copySource, new RegExp(`title: "${WEB_AUTH_COPY.title}"`));
  assert.match(copySource, new RegExp(`body: "${WEB_AUTH_COPY.body}"`));
  assert.match(copySource, new RegExp(`cta: "${WEB_AUTH_COPY.cta}"`));
  assert.match(copySource, new RegExp(`sent: "${WEB_AUTH_COPY.sent.replaceAll(".", "\\.")}"`));
  assert.match(copySource, /이 기기 임시 답은 이어지지 않아요/);
});

test("logged-out splash routes to S2 signup, then notice, then S3 workspace", async () => {
  const app = await readFile("mobile/App.js", "utf8");
  const session = await readFile("mobile/src/session.js", "utf8");
  const screens = await readFile("mobile/src/screens.js", "utf8");
  assert.match(session, /return loggedIn \? "session" : "signup"/);
  assert.match(app, /finishHostSplash/);
  assert.match(app, /SPLASH_MS/);
  assert.match(app, /SignupScreen/);
  assert.match(app, /NoticeScreen/);
  assert.match(app, /WorkspaceScreen/);
  assert.equal(app.includes("SignupPlaceholder"), false);
  assert.match(screens, /testID="splash"/);
  assert.match(screens, /testID="signup"/);
  assert.match(screens, /testID="workspace"/);
  assert.match(screens, /keyboardShouldPersistTaps="handled"/);
  assert.match(screens, /KeyboardAvoidingView/);
  assert.match(screens, /AUTH_COPY\.cta/);
  assert.match(screens, /S3_COPY\.inviteCta/);
  assert.equal(screens.includes("testID=\"install\""), false);
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
    "Kakao.Auth",
    "kauth.kakao.com",
    "카카오 로그인",
    "apple-app-site-association",
    "assetlinks.json",
    "universal link",
    "결제"
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
});

test("host leaves an S9 mount and does not duplicate logout chrome", async () => {
  const host = await readFile("mobile/src/host.js", "utf8");
  const mount = await readFile("mobile/src/s9-mount.js", "utf8");
  const screens = await readFile("mobile/src/screens.js", "utf8");
  const app = await readFile("mobile/App.js", "utf8");
  assert.match(host, /"s9"/);
  assert.match(host, /attachS9IfPresent/);
  assert.match(host, /mobile\/\$\{id\}\//);
  assert.match(mount, /s9\/logout-chrome\.js/);
  assert.match(mount, /composeLogoutChrome/);
  assert.equal(screens.includes("로그아웃 후 이 기기를 넘겨주세요"), false);
  assert.equal(app.includes("로그아웃 후 이 기기를 넘겨주세요"), false);
  assert.equal(host.includes("LogoutHandoffCaption"), false);
  try {
    await access("mobile/s9/logout-chrome.js");
    assert.match(mount, /composeLogoutChrome/);
  } catch {
    assert.match(mount, /s9\/logout-chrome\.js/);
  }
});

test("iOS and Android project targets exist for LoveMe", async () => {
  await access("mobile/ios/LoveMe.xcodeproj/project.pbxproj");
  await access("mobile/ios/LoveMe/Info.plist");
  await access("mobile/android/app/src/main/AndroidManifest.xml");
  await access("mobile/android/app/build.gradle");
  await access("mobile/android/gradlew");
  await access("mobile/android/app/src/main/java/com/beforeithappens/loveme/MainActivity.kt");
  await access("mobile/ios/LoveMe/AppDelegate.swift");
  await access("mobile/package.json");
  await access("mobile/App.js");
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

test("EAS preview profile is internal iOS device, not simulator, and docs stay honest", async () => {
  await access("mobile/eas.json");
  await access("docs/IOS_INSTALL.md");
  const eas = JSON.parse(await readFile("mobile/eas.json", "utf8"));
  const app = JSON.parse(await readFile("mobile/app.json", "utf8"));
  const docs = await readFile("docs/IOS_INSTALL.md", "utf8");
  const readme = await readFile("mobile/README.md", "utf8");
  assert.equal(app.expo.ios.bundleIdentifier, "com.beforeithappens.loveme");
  assert.equal(eas.build.preview.distribution, "internal");
  assert.equal(eas.build.preview.ios.simulator, false);
  assert.equal(eas.build.production.distribution, "store");
  assert.equal(eas.build.preview.developmentClient, undefined);
  const easText = JSON.stringify(eas);
  assert.equal(easText.includes("kakao"), false);
  assert.equal(easText.includes("gift"), false);
  assert.match(docs, /blocked on Apple Developer \+ Expo login/);
  assert.match(docs, /cannot.*custom-native iOS binary/i);
  assert.match(docs, /eas-cli@latest login/);
  assert.match(docs, /eas-cli@latest build --platform ios --profile preview/);
  assert.match(docs, /TestFlight/);
  assert.equal(docs.includes("testflight.apple.com/join/"), false);
  assert.equal(docs.includes("kauth.kakao.com"), false);
  assert.match(readme, /eas-cli@latest build --platform ios --profile preview/);
});
