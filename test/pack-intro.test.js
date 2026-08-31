import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  PACK_INTRO_COPY,
  PACK_INTRO_LINES,
  PACK_INTRO_MOTION,
  everyPackHasIntro,
  introSeen,
  markIntroSeen,
  packIntroLines,
  packIntroTitle
} from "../src/pack-intro.js";
import { PACK_LIST_ROWS } from "../src/pair-code.js";
import {
  createNativeFlow,
  finishSplash,
  openComingSoonFromList,
  openMarriageFromList,
  startPackFromIntro
} from "../mobile/s0-s2-s3-flow.js";
import { renderNativeScreen } from "../mobile/s0-s2-s3-screens.js";

const loggedIn = {
  user: { id: "usr_1", email: "buyer@example.com" },
  notice: null,
  workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
};

test("every pack in the list opens with its own narration", () => {
  assert.equal(everyPackHasIntro(), true);
  for (const row of PACK_LIST_ROWS) {
    const lines = packIntroLines(row.id);
    assert.equal(lines.length, 3, `${row.id} should carry three lines`);
    for (const line of lines) assert.ok(line.trim().length > 0);
    assert.equal(packIntroTitle(row.id), row.label);
  }
  assert.equal(packIntroLines("nope").length, 0);
  assert.equal(Object.keys(PACK_INTRO_LINES).length, PACK_LIST_ROWS.length);
});

test("narration sets mood without selling, scoring or promising an outcome", () => {
  const all = Object.values(PACK_INTRO_LINES).flat().join(" ");
  for (const forbidden of ["29,000", "29000", "원", "하트", "점수", "확률", "진단", "성공", "무료", "결제"]) {
    assert.equal(all.includes(forbidden), false, `narration must not mention ${forbidden}`);
  }
  assert.equal(PACK_INTRO_COPY.start, "시작하기");
});

test("first entry into a pack shows narration; starting it keeps the existing flow", () => {
  const home = finishSplash(createNativeFlow(loggedIn));
  const intro = openMarriageFromList(home, () => 0);
  assert.equal(intro.screen, "pack-intro");
  assert.equal(intro.samplePackId, "marriage");

  const started = startPackFromIntro(intro, () => 0);
  assert.equal(started.screen, "sample-q");
  assert.equal(started.sampleQuestions.length, 3);
  assert.deepEqual(started.seenPackIntros, ["marriage"]);

  const again = openMarriageFromList(started, () => 0);
  assert.equal(again.screen, "sample-q", "narration is for the first entry only");
});

test("a pack with no questions still gets its narration and its existing destination", () => {
  const home = finishSplash(createNativeFlow(loggedIn));
  const intro = openComingSoonFromList(home, "pregnancy");
  assert.equal(intro.screen, "pack-intro");
  assert.equal(intro.samplePackId, "pregnancy");
  const started = startPackFromIntro(intro, () => 0);
  assert.equal(started.screen, "sample-result");
  assert.equal(started.sampleQuestions.length, 0);
});

test("seen packs are tracked without duplicates and never lose earlier ones", () => {
  assert.equal(introSeen(undefined, "marriage"), false);
  const once = markIntroSeen([], "marriage");
  assert.deepEqual(once, ["marriage"]);
  assert.deepEqual(markIntroSeen(once, "marriage"), ["marriage"]);
  assert.deepEqual(markIntroSeen(once, "birth"), ["marriage", "birth"]);
  assert.equal(introSeen(once, "marriage"), true);
});

test("the narration renders its lines, its CTA and a staggered reveal", () => {
  const home = finishSplash(createNativeFlow(loggedIn));
  const html = renderNativeScreen(openMarriageFromList(home, () => 0));
  assert.match(html, /data-screen="pack-intro"/);
  for (const line of packIntroLines("marriage")) assert.ok(html.includes(line));
  assert.match(html, /시작하기/);
  assert.match(html, /animation-delay:0ms/);
  assert.match(html, new RegExp(`animation-delay:${PACK_INTRO_MOTION.lineDelayMs}ms`));
  assert.match(html, new RegExp(`animation-delay:${PACK_INTRO_MOTION.lineDelayMs * 2}ms`));
  assert.equal(html.includes("29,000"), false);
});

test("motion is gentle and stands down for Reduce Motion", async () => {
  assert.ok(PACK_INTRO_MOTION.durationMs >= 300 && PACK_INTRO_MOTION.durationMs <= 900);
  assert.ok(PACK_INTRO_MOTION.lineDelayMs >= 200 && PACK_INTRO_MOTION.lineDelayMs <= 600);
  assert.ok(PACK_INTRO_MOTION.riseFrom > 0 && PACK_INTRO_MOTION.riseFrom <= 24);

  const screens = await readFile("mobile/src/screens.js", "utf8");
  assert.match(screens, /export function PackIntroScreen/);
  assert.match(screens, /AccessibilityInfo\.isReduceMotionEnabled/);
  assert.match(screens, /Animated\.stagger/);
  assert.match(screens, /PACK_INTRO_MOTION\.lineDelayMs/);
  assert.match(screens, /fontFamily: fonts\.titleStrong/);

  const css = await readFile("mobile/s0-s2-s3-preview.css", "utf8");
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /loveme-intro-line/);

  const app = await readFile("mobile/App.js", "utf8");
  assert.match(app, /PackIntroScreen/);
  assert.match(app, /startPackFromIntro/);
});
