import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

test("the preview profile produces an installable Android artifact, not a store bundle", async () => {
  const eas = await readJson("mobile/eas.json");
  const preview = eas.build.preview;
  assert.equal(preview.distribution, "internal");
  assert.equal(preview.android.buildType, "apk", "an .aab cannot be installed on a phone");
  assert.equal(eas.build.production.android.buildType, "app-bundle", "the store profile stays an upload artifact");
  assert.equal(preview.ios.simulator, false);
});

test("the app build knows which server to call on both platforms", async () => {
  const eas = await readJson("mobile/eas.json");
  const preview = eas.build.preview;
  const origin = preview.env.EXPO_PUBLIC_API_ORIGIN;
  assert.match(origin, /^https:\/\//, "an app built against http or nothing cannot reach the host");
  assert.equal(preview.android?.env?.EXPO_PUBLIC_API_ORIGIN, undefined);
  assert.equal(preview.ios?.env?.EXPO_PUBLIC_API_ORIGIN, undefined);
  assert.equal(
    origin,
    eas.build.preview.env.EXPO_PUBLIC_API_ORIGIN,
    "the origin stays at profile level so the Android build inherits it too"
  );
});

test("every profile that ships to a phone knows the server, store build included", async () => {
  const eas = await readJson("mobile/eas.json");
  for (const [name, profile] of Object.entries(eas.build)) {
    const origin = profile.env?.EXPO_PUBLIC_API_ORIGIN;
    assert.match(
      String(origin || ""),
      /^https:\/\//,
      `${name} builds an app with no server to call; apiOrigin() would resolve to an empty host`
    );
  }
});

test("the Android install doc explains the path without inventing an artifact", async () => {
  await access("docs/ANDROID_INSTALL.md");
  const docs = await readFile("docs/ANDROID_INSTALL.md", "utf8");
  assert.match(docs, /eas-cli@latest build --platform android --profile preview/);
  assert.match(docs, /com\.beforeithappens\.loveme/);
  assert.match(docs, /EXPO_PUBLIC_API_ORIGIN/);
  assert.equal(docs.includes("play.google.com"), false, "no invented store listing");
  assert.equal(/https:\/\/expo\.dev\/accounts\/[^\s)]+\/builds\//.test(docs), false, "no invented build URL");
  assert.equal(/\.apk\b.*https:\/\//.test(docs), false, "no invented APK download link");
});

test("the iOS doc keeps the Apple gate honest and says how the friend's iPhone is reached", async () => {
  const docs = await readFile("docs/IOS_INSTALL.md", "utf8");
  assert.match(docs, /blocked on Apple Developer \+ Expo login/);
  assert.match(docs, /eas-cli@latest device:create/, "an ad hoc build installs only on registered devices");
  assert.match(docs, /UDID/);
  assert.match(docs, /TestFlight/);
  assert.match(docs, /Individual/, "organization enrollment needs a D-U-N-S number and is slower");
  assert.match(docs, /Mac is not required/, "EAS builds iOS in the cloud");
  assert.equal(docs.includes("testflight.apple.com/join/"), false, "no invented TestFlight invite");
  assert.equal(/https:\/\/expo\.dev\/accounts\/[^\s)]+\/builds\//.test(docs), false, "no invented build URL");
});

test("the deploy runbook names every host variable this round needs, and no values", async () => {
  const docs = await readFile("docs/DEPLOY.md", "utf8");
  for (const name of [
    "RESEND_API_KEY",
    "MAIL_FROM",
    "AB_PUBLIC_ORIGIN",
    "AB_DEV_OUTBOX",
    "AB_DEV_OAUTH",
    "AB_STORE_PATH",
    "AB_OAUTH_KAKAO_CLIENT_ID",
    "AB_OAUTH_KAKAO_CLIENT_SECRET",
    "AB_OAUTH_STATE_SECRET"
  ]) {
    assert.match(docs, new RegExp(name), `${name} must be in the runbook`);
  }
  assert.match(docs, /\/api\/auth\/oauth\/kakao\/callback/, "the redirect URI must be registered with Kakao");
  assert.match(docs, /mail-sender-restricted/);
  assert.match(docs, /onboarding@resend\.dev/, "the testing-sender restriction must stay written down");
  assert.match(docs, /email-bind/, "a Kakao account with no affirmed email still needs mail");
  assert.match(docs, /docs\/IOS_INSTALL\.md/);
  assert.match(docs, /docs\/ANDROID_INSTALL\.md/);
  assert.match(docs, /healthz/);
});

test("no document leaks a credential", async () => {
  for (const path of ["docs/DEPLOY.md", "docs/IOS_INSTALL.md", "docs/ANDROID_INSTALL.md", "mobile/eas.json"]) {
    const text = await readFile(path, "utf8");
    assert.equal(/\bre_[A-Za-z0-9_-]{12,}/.test(text), false, `${path} looks like it contains a Resend key`);
    assert.equal(/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text), false, `${path} contains a private key`);
    assert.equal(/EXPO_TOKEN\s*[=:]\s*\S/.test(text), false, `${path} contains an Expo token`);
  }
});
