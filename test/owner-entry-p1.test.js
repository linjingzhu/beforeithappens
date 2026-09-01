import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { AUTH_API, createAuthApi, extractMagicLinkToken } from "../mobile/s0-s2-s3-api.js";
import {
  backToPackList,
  consumeOpenedLink,
  createNativeFlow,
  finishSplash,
  loadInvitePairCode,
  openAccount,
  openMarriageFromList,
  openRealPack,
  openTogetherFromSample,
  createPackCompletionWatch,
  packLockCounts,
  packRunCompleted,
  setSampleChoice,
  setSampleReason,
  startPackFromIntro,
  submitSampleAnswer
} from "../mobile/s0-s2-s3-flow.js";
import { buildEnv, debugLine, isStoreBuild, isVirtualDebug } from "../mobile/src/virtual.js";
import { colors } from "../mobile/src/theme.js";
import { apiOrigin } from "../mobile/src/session.js";
import { readHostOpenParams } from "../mobile/s4-invite/host-mount.js";
import { APP_S4_SCREEN } from "../mobile/s4-invite/flow.js";
import { openS4FromWorkspace } from "../mobile/s4-invite/host-mount.js";

const ownerSession = Object.freeze({
  user: { id: "usr_owner", email: "owner@example.com" },
  notice: null,
  workspace: { id: "ws_1", role: "buyer", acceptedPartner: false, partnerEmail: "", invite: null }
});

function jsonResponse({ ok = true, status = 200, payload = {} } = {}) {
  return {
    ok,
    status,
    headers: { get: () => null, getSetCookie: () => [] },
    json: async () => payload
  };
}

function ownerAtHome() {
  return finishSplash(createNativeFlow({ ...ownerSession }));
}

test("the mailed loveme link reaches the app cold and warm, and yields its token", async () => {
  const app = await readFile("mobile/App.js", "utf8");
  // Cold start: the OS hands the URL over once, through getInitialURL.
  assert.match(app, /Linking\.getInitialURL\(\)/);
  // Already running: the only other delivery is the url event.
  assert.match(app, /Linking\.addEventListener\("url"/);

  const manifest = await readFile("mobile/android/app/src/main/AndroidManifest.xml", "utf8");
  assert.match(manifest, /android:scheme="loveme"/);
  assert.match(manifest, /android\.intent\.category\.BROWSABLE/);
  const plist = await readFile("mobile/ios/LoveMe/Info.plist", "utf8");
  assert.match(plist, /<string>loveme<\/string>/);

  const mailed = "loveme:///auth/consume?token=tok_abc";
  assert.equal(extractMagicLinkToken(mailed), "tok_abc");
  // The warm handler only has the href to go on — no search, no pathname.
  assert.deepEqual(readHostOpenParams({ href: mailed }), { magicToken: "tok_abc", inviteToken: "" });
});

test("a consume that never answers still leaves the splash instead of hanging on it", async () => {
  assert.equal(AUTH_API.consume, "/api/auth/consume");
  const hanging = createAuthApi({
    origin: "https://example.test",
    fetchImpl: () => new Promise(() => {}),
    authTimeoutMs: 20
  });
  const result = await hanging.consumeMagicLink("loveme:///auth/consume?token=tok_abc");
  assert.equal(result.ok, false);

  // App.js awaits this one promise before it can paint anything past the wordmark.
  const state = await consumeOpenedLink(createNativeFlow(), hanging, "loveme:///auth/consume?token=tok_abc");
  assert.equal(state.splashDone, true);
  assert.notEqual(state.screen, "splash");
  assert.equal(state.screen, "signup");
  assert.equal(state.error, "로그인 링크가 유효하지 않아요.");
  assert.equal(state.busy, false);
});

test("a consume that answers in time still logs the owner in", async () => {
  const api = createAuthApi({
    origin: "https://example.test",
    authTimeoutMs: 500,
    fetchImpl: async () => jsonResponse({
      payload: { ok: true, session: { ...ownerSession, notice: "no-local-draft" } }
    })
  });
  const state = await consumeOpenedLink(createNativeFlow(), api, "loveme:///auth/consume?token=tok_abc");
  assert.equal(state.screen, "notice");
  assert.equal(state.session.user.email, "owner@example.com");
});

test("EXPO_PUBLIC values are read in the only shape Expo replaces at build time", async () => {
  // Expo substitutes the literal `process.env.EXPO_PUBLIC_X` while bundling. Anything else —
  // an optional chain, a `globalThis.` prefix, a computed key — is not a substitution target,
  // so on a phone it reads undefined and the setting silently stops existing. Comments are
  // stripped first: this has to judge the code, and the files explain the trap in prose.
  const sources = [
    "mobile/src/session.js",
    "mobile/src/virtual.js",
    "mobile/s0-s2-s3-flow.js",
    "mobile/s0-s2-s3-api.js",
    "mobile/App.js"
  ];
  const stripped = new Map();
  for (const file of sources) {
    const raw = await readFile(file, "utf8");
    stripped.set(file, raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""));
  }
  for (const [file, code] of stripped) {
    // Every read of the build's own environment must be the bare `process.env.` member
    // expression. `globalThis.process.env.X` and `process?.env?.X` both survive Babel untouched.
    for (const hit of code.matchAll(/([\w$.?\s]{0,40})EXPO_PUBLIC_[A-Z0-9_]+/g)) {
      const before = hit[1];
      if (!/\benv\b/.test(before)) continue;
      assert.match(
        before,
        /(^|[^\w$.])(process\.env|env)\.\s*$/,
        `${file}: EXPO_PUBLIC read through "${before.trim()}" is not a shape Expo replaces`
      );
    }
    assert.equal(
      /globalThis\s*\.\s*process\s*\??\.\s*env\s*\??\.\s*EXPO_PUBLIC_/.test(code),
      false,
      `${file} reads EXPO_PUBLIC through globalThis, which Expo never replaces`
    );
  }

  // The API host is the one value the whole round hangs on.
  const session = stripped.get("mobile/src/session.js");
  assert.match(session, /process\.env\.EXPO_PUBLIC_API_ORIGIN/);
  assert.equal(apiOrigin(), "", "unset in Node, so no test can accidentally reach a deployment");
  const eas = JSON.parse(await readFile("mobile/eas.json", "utf8"));
  assert.match(eas.build.preview.env.EXPO_PUBLIC_API_ORIGIN, /^https:\/\//);

  const virtual = stripped.get("mobile/src/virtual.js");
  assert.match(virtual, /process\.env\.EXPO_PUBLIC_STORE_BUILD/);
  assert.match(virtual, /process\.env\.EXPO_PUBLIC_LOVEME_VIRTUAL/);
  assert.match(stripped.get("mobile/s0-s2-s3-flow.js"), /env = buildEnv\(\)/);

  // Behaviour is unchanged: opt-in only, an explicit env still wins, store builds are never virtual.
  assert.equal(typeof buildEnv(), "object");
  assert.equal(isVirtualDebug({}), false);
  assert.equal(isVirtualDebug(), false, "a plain build talks to the real server");
  assert.equal(isVirtualDebug({ EXPO_PUBLIC_LOVEME_VIRTUAL: "1" }), true);
  assert.equal(isStoreBuild({ EXPO_PUBLIC_STORE_BUILD: "1" }), true);
  assert.equal(debugLine({ EXPO_PUBLIC_STORE_BUILD: "1" }), "");
});

test("every colour the native screens ask for is a real value, not undefined", async () => {
  const files = [
    "mobile/App.js",
    "mobile/src/screens.js",
    "mobile/src/responsive.js",
    "mobile/src/gradient.js",
    "mobile/s4-invite/screens.js",
    "mobile/pack/screens.js"
  ];
  const asked = new Set();
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const match of source.matchAll(/\bcolors\.([A-Za-z0-9_]+)/g)) asked.add(match[1]);
  }
  assert.ok(asked.has("coral"), "the S4 primary CTA still paints itself with colors.coral");
  for (const name of asked) {
    assert.equal(typeof colors[name], "string", `colors.${name} is undefined`);
    assert.ok(colors[name].length > 0, `colors.${name} is empty`);
  }
});

test("the owner can reach the S4 invite screen from 질문집, and 함께 풀어보기 arrives with a code", async () => {
  const app = await readFile("mobile/App.js", "utf8");
  // 계정 → 연인을 초대하세요 is the reachable entry. `WorkspaceScreen` is not: `resolveNativeScreen`
  // never returns "workspace", so the S4 screen used to be dead code in the app.
  assert.match(app, /onInvite=\{\(\) => setState\(openS4FromWorkspace\(state\)\)\}/);

  const account = openAccount(ownerAtHome());
  assert.equal(account.screen, "account");
  const s4 = openS4FromWorkspace(account);
  assert.equal(s4.screen, APP_S4_SCREEN);
  assert.equal(s4.session.user.email, "owner@example.com");

  // 함께 풀어보기 still opens the pair-code sheet, which is blank until the code is fetched.
  let state = startPackFromIntro(openMarriageFromList(ownerAtHome(), () => 0), () => 0);
  while (state.screen === "sample-q") {
    state = setSampleChoice(state, state.sampleQuestions[state.sampleIndex].choices[0].id);
    state = setSampleReason(state, "이유는 이거예요");
    state = submitSampleAnswer(state, () => 0);
  }
  assert.equal(state.screen, "sample-result");
  const invite = openTogetherFromSample(state, {});
  assert.equal(invite.screen, "invite");
  assert.equal(invite.pairCode, "", "nothing has fetched the code yet");
  assert.match(app, /next\.screen === "invite" && !next\.pairCode \? await loadInvitePairCode/);

  const filled = await loadInvitePairCode(invite, {
    myPairCode: async () => ({ ok: true, code: "ABCD2345", display: "ABCD 2345", url: "https://example.test/invite/open" })
  }, {});
  assert.equal(filled.pairCodeDisplay, "ABCD 2345");
  assert.equal(filled.inviteUrl, "https://example.test/invite/open");
});

test("finishing all twelve questions lands on the certificate with the server's own counts", async () => {
  const { createPackController } = await import("../mobile/pack/contract/pack-controller.js");
  const { loadMarriagePack } = await import("../mobile/pack/contract/pack-catalog.js");
  const catalog = JSON.parse(await readFile("mobile/pack/contract/marriage-pack.json", "utf8"));
  const pack = loadMarriagePack(catalog);
  const paired = {
    user: { id: "usr_owner", email: "owner@example.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: true }
  };

  function packStateWith(lockedIds) {
    const questions = {};
    pack.questionIds.forEach((id, index) => {
      questions[id] = {
        roles: { a: { submittedChoice: null, privateNote: "" }, b: { submittedChoice: null } },
        shared: { proposal: "", status: "none" },
        lock: lockedIds.includes(id)
          ? { comparison: { key: index % 2 === 0 ? "aligned" : "discuss" }, submittedChoices: { a: "x", b: "y" } }
          : null
      };
    });
    return { index: 0, activeRole: "a", questions };
  }

  const half = pack.questionIds.slice(0, 6);
  const partway = createPackController({
    pack,
    session: paired,
    client: { getState: async () => ({ ok: true, state: packStateWith(half) }) }
  });
  await partway.startPack();
  assert.equal(partway.view().completed, false, "a half-finished pack is not 완주");

  const finished = createPackController({
    pack,
    session: paired,
    client: { getState: async () => ({ ok: true, state: packStateWith(pack.questionIds) }) }
  });
  await finished.startPack();
  const view = finished.view();
  assert.equal(view.completed, true, "P4's signal: every question ended in a public lock");
  assert.equal(pack.questionIds.length, 12);

  // App.js hands exactly that view's state to the routing move.
  const opened = openRealPack(finishSplash(createNativeFlow({ ...paired })), "marriage");
  assert.equal(opened.screen, "pack");
  const certificate = packRunCompleted(opened, view.state);
  assert.equal(certificate.screen, "certificate");
  assert.deepEqual(certificate.packCounts, { aligned: 6, close: 0, discuss: 6 });
  const total = certificate.packCounts.aligned + certificate.packCounts.close + certificate.packCounts.discuss;
  assert.equal(total, 12, "every counted question is one the server actually locked");
  assert.equal(backToPackList(certificate).screen, "pack-list");
  assert.equal(backToPackList(certificate).packCounts, null);

  // Nothing is counted that the server never classified.
  assert.deepEqual(packLockCounts(packStateWith([])), { aligned: 0, close: 0, discuss: 0 });
  assert.deepEqual(packLockCounts(null), { aligned: 0, close: 0, discuss: 0 });

  const app = await readFile("mobile/App.js", "utf8");
  assert.match(app, /onCompleted=\{\(view\) => setState\(packRunCompleted\(stateRef\.current, view\?\.state\)\)\}/);
  assert.match(app, /counts=\{state\.packCounts \|\| countSampleLabels/);
  // The certificate keeps its locked copy: the run reuses the screen, it does not invent one.
  assert.equal(app.includes("CertificateScreen"), true);
  const screens = await readFile("mobile/src/screens.js", "utf8");
  assert.match(screens, /CERTIFICATE_COPY\.body/);

  // Reopening a finished pack must not bounce past it to the certificate, and nothing is
  // reported before the mount's first loaded view.
  assert.match(app, /createPackCompletionWatch\(\)/);
  const observe = createPackCompletionWatch();
  assert.equal(observe({ state: null, completed: false }), false, "no verdict before the pack loads");
  assert.equal(observe({ state: view.state, completed: true }), false, "already finished when it opened");
  assert.equal(observe({ state: view.state, completed: true }), false, "and it stays readable");

  const run = createPackCompletionWatch();
  assert.equal(run({ state: null, completed: false }), false);
  assert.equal(run({ state: view.state, completed: false }), false, "the first loaded view is the baseline");
  assert.equal(run({ state: view.state, completed: false }), false);
  assert.equal(run({ state: view.state, completed: true }), true, "the submit that locked the last question");
  assert.equal(run({ state: view.state, completed: true }), false, "reported once, never twice");
});
