import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHostPack, hostPackFetch, hostPackReady, hostMarriagePack } from "../mobile/pack/host-mount.js";
import { isVirtualDebug } from "../mobile/src/virtual.js";
import {
  createNativeFlow,
  finishSplash,
  hasAcceptedPartner,
  openMarriageFromList,
  openRealPack,
  openTogetherFromSample,
  startPackFromIntro
} from "../mobile/s0-s2-s3-flow.js";

const paired = {
  user: { id: "usr_1", email: "buyer@example.com" },
  notice: null,
  workspace: { id: "ws_1", role: "buyer", acceptedPartner: true }
};
const alone = {
  user: { id: "usr_1", email: "buyer@example.com" },
  notice: null,
  workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
};

function fakeResponse(setCookie = []) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null, getSetCookie: () => setCookie },
    json: async () => ({ ok: true })
  };
}

test("virtual mode is opt-in, so a build talks to the real server by default", () => {
  assert.equal(isVirtualDebug({}), false, "a plain build must be real");
  assert.equal(isVirtualDebug({ LOVEME_VIRTUAL: "1" }), true);
  assert.equal(isVirtualDebug({ EXPO_PUBLIC_LOVEME_VIRTUAL: "1" }), true);
  assert.equal(isVirtualDebug({ EAS_BUILD_PROFILE: "production", LOVEME_VIRTUAL: "1" }), false);
  assert.equal(isVirtualDebug({ EXPO_PUBLIC_STORE_BUILD: "1", EXPO_PUBLIC_LOVEME_VIRTUAL: "1" }), false);
});

test("pack requests ride on the host login cookie and keep it fresh", async () => {
  const seen = [];
  let stored = "ab_session=first";
  const access = {
    origin: "https://api.example.test",
    getCookie: () => stored,
    setCookie: (value) => { stored = value; }
  };
  const fetchImpl = async (url, init) => {
    seen.push({ url, cookie: init.headers.cookie, credentials: init.credentials });
    return fakeResponse(["ab_session=second; Path=/; HttpOnly"]);
  };
  const packFetch = hostPackFetch(access, fetchImpl);

  await packFetch("/api/pack/state", { headers: {} });
  assert.equal(seen[0].url, "https://api.example.test/api/pack/state", "relative paths resolve against the host origin");
  assert.equal(seen[0].cookie, "ab_session=first");
  assert.equal(seen[0].credentials, "include");
  assert.equal(stored, "ab_session=second", "a refreshed session cookie is kept");

  await packFetch("https://other.example.test/api/pack/state", { headers: {} });
  assert.equal(seen[1].url, "https://other.example.test/api/pack/state", "absolute urls are left alone");
});

test("the real pack needs a catalog and a partner the server confirmed", () => {
  assert.throws(() => createHostPack({ session: paired, fetchImpl: async () => fakeResponse() }), /catalog/);
  assert.equal(hostPackReady(paired), true);
  assert.equal(hostPackReady(alone), false);
  assert.equal(hostPackReady({ workspace: { acceptedPartner: "true" } }), false, "only a real boolean counts");

  const pack = hostMarriagePack({
    id: "marriage-preparation",
    version: "test",
    title: "t",
    questions: [{ id: "q1", title: "질문", choices: [{ id: "c1", label: "A" }] }]
  });
  assert.deepEqual(pack.questionIds, ["q1"]);
  const controller = createHostPack({ session: paired, pack, fetchImpl: async () => fakeResponse() });
  assert.equal(typeof controller.startPack, "function");
  assert.equal(controller.canStartPack(), true);
});

test("a confirmed partner opens the server-backed pack, not the simulated sample", () => {
  const pairedHome = finishSplash(createNativeFlow(paired));
  assert.equal(hasAcceptedPartner(pairedHome), true);
  const intro = openMarriageFromList(pairedHome, () => 0);
  assert.equal(intro.screen, "pack-intro");
  assert.equal(startPackFromIntro(intro, () => 0).screen, "pack");

  const aloneHome = finishSplash(createNativeFlow(alone));
  assert.equal(hasAcceptedPartner(aloneHome), false);
  const soloIntro = openMarriageFromList(aloneHome, () => 0);
  assert.equal(startPackFromIntro(soloIntro, () => 0).screen, "sample-q", "without a partner the sample still teaches the idea");

  assert.equal(openRealPack(pairedHome).screen, "pack");
});

test("함께 풀어보기 never invents a partner outside an explicit virtual build", () => {
  const pairedHome = finishSplash(createNativeFlow(paired));
  assert.equal(openTogetherFromSample(pairedHome, {}).screen, "pack");

  const aloneHome = finishSplash(createNativeFlow(alone));
  const real = openTogetherFromSample(aloneHome, {});
  assert.equal(real.screen, "invite", "a real build asks for a real invite");
  assert.equal(real.session.workspace.acceptedPartner, false, "no partner is fabricated");
  assert.equal(JSON.stringify(real).includes("partner@email.com"), false);

  const demo = openTogetherFromSample(aloneHome, { LOVEME_VIRTUAL: "1" });
  assert.equal(demo.screen, "unlock", "the hearts demo still runs when virtual mode is switched on");
});

test("the host mounts the real pack and the pack screens simulate nobody", async () => {
  const app = await readFile("mobile/App.js", "utf8");
  assert.match(app, /PackMount/);
  assert.match(app, /marriage-pack\.json/);
  assert.match(app, /cookieAccess=\{hostCookieAccess\(\)\}/);
  assert.match(app, /state\.screen === "pack"/);

  const screens = await readFile("mobile/pack/screens.js", "utf8");
  assert.equal(screens.includes("partner@email.com"), false);
  assert.equal(screens.includes("pickPartnerChoice"), false);
  assert.match(screens, /controller\.submit\(\)/);
  assert.match(screens, /controller\.agree\(/);

  const catalog = JSON.parse(await readFile("mobile/pack/contract/marriage-pack.json", "utf8"));
  const { questions, marriagePack } = await import("../src/questions.js");
  assert.deepEqual(catalog.questions.map((q) => q.id), questions.map((q) => q.id), "the app must ask the questions the server accepts");
  assert.equal(catalog.version, marriagePack.version);
});
