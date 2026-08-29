import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { S9_COPY, S9_FORBIDDEN_SCREENS, S9_ONBOARDING_BODY } from "./copy.js";

const root = fileURLToPath(new URL(".", import.meta.url));
const nativeRoots = [join(root, "ios"), join(root, "android")];

const SCREEN_MARKERS = [
  "NavigationLink",
  "NavigationStack",
  "fullScreenCover",
  "NavHost",
  "composable(",
  "navController",
  "ModalBottomSheet",
  "AlertDialog",
  "UIViewController",
  "Activity(",
  "setContentView"
];

const ROLE_SWITCH_MARKERS = ["role switch", "역할 전환", "activeRole", "data-role="];
const PAYMENT_MARKERS = ["결제", "payment", "billing", "purchase", "29,000"];

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(path));
    else files.push(path);
  }
  return files;
}

async function readNativeSources() {
  const files = (await Promise.all(nativeRoots.map(listFiles))).flat();
  const texts = await Promise.all(files.map(async (path) => ({
    path,
    text: await readFile(path, "utf8")
  })));
  return texts;
}

test("iOS and Android chrome files exist and stay caption-only", async () => {
  const sources = await readNativeSources();
  const names = sources.map((item) => item.path.slice(root.length));
  assert.deepEqual(names.sort(), [
    "android/LogoutHandoffCaption.kt",
    "android/LogoutHandoffChrome.kt",
    "android/LogoutSessionApi.kt",
    "ios/LogoutHandoffCaption.swift",
    "ios/LogoutHandoffChrome.swift",
    "ios/LogoutSessionApi.swift"
  ]);
});

test("native chrome carries the handoff caption and web logout APIs", async () => {
  const sources = await readNativeSources();
  const byName = Object.fromEntries(sources.map((item) => [item.path.slice(root.length), item.text]));
  assert.match(byName["ios/LogoutHandoffCaption.swift"], new RegExp(S9_COPY.logoutHandoff));
  assert.match(byName["android/LogoutHandoffCaption.kt"], new RegExp(S9_COPY.logoutHandoff));
  assert.match(byName["ios/LogoutHandoffChrome.swift"], /LogoutHandoffCaption/);
  assert.match(byName["android/LogoutHandoffChrome.kt"], /LogoutHandoffCaption/);
  for (const name of ["ios/LogoutSessionApi.swift", "android/LogoutSessionApi.kt"]) {
    assert.match(byName[name], /\/api\/auth\/session/);
    assert.match(byName[name], /\/api\/auth\/logout/);
    assert.match(byName[name], /\/api\/auth\/force-logout/);
  }
});

test("S9 native files add no screen, same-session UI, role switch, or payment", async () => {
  const sources = await readNativeSources();
  for (const { path, text } of sources) {
    assert.equal(text.includes(S9_FORBIDDEN_SCREENS.otherSession), false, path);
    assert.equal(text.includes(S9_FORBIDDEN_SCREENS.logoutContinue), false, path);
    assert.equal(text.includes(S9_ONBOARDING_BODY), false, path);
    for (const marker of SCREEN_MARKERS) {
      assert.equal(text.includes(marker), false, `${path} ${marker}`);
    }
    for (const marker of ROLE_SWITCH_MARKERS) {
      assert.equal(text.toLowerCase().includes(marker.toLowerCase()), false, `${path} ${marker}`);
    }
    for (const marker of PAYMENT_MARKERS) {
      assert.equal(text.toLowerCase().includes(marker.toLowerCase()), false, `${path} ${marker}`);
    }
  }
});
