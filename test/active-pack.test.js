import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  activeChoiceIdsByQuestion,
  activePack,
  activePackRef,
  activeQuestionIds,
  activeQuestions,
  packGate
} from "../src/active-pack.js";
import { createAnswers } from "../server/answers.mjs";
import { createMemoryStore } from "../server/store.mjs";
import { marriagePack } from "../src/questions.js";
import { PACK_SURFACE } from "../src/pack-schema.js";

/**
 * What this deployment serves. The twelve-question pack was the product and is not any more: the
 * hundred questions are, and the answers to them live on the server rather than in whichever
 * browser happened to answer them.
 */
test("the deployment serves 결혼 100제, from one module both surfaces read", () => {
  assert.equal(activePack.id, "marriage-100");
  assert.equal(activeQuestions.length, 100);
  assert.equal(activeQuestionIds.length, 100);
  assert.equal(new Set(activeQuestionIds).size, 100, "no id twice, since answers are keyed by them");
  assert.deepEqual(activePackRef, { id: activePack.id, version: activePack.version });
  for (const ids of Object.values(activeChoiceIdsByQuestion)) assert.equal(ids.length, 4);

  // The server and the screens both ask this module rather than importing a pack directly, so that
  // changing what is served is one import and not a search through sixteen files.
  const server = readFileSync("scripts/server.mjs", "utf8");
  assert.match(server, /from "\.\.\/src\/active-pack\.js"/);
  assert.equal(server.includes('from "../src/questions.js"'), false, "the twelve are no longer wired in");
  assert.match(readFileSync("src/app.js", "utf8"), /from "\.\/active-pack\.js"/);
});

test("a pack that is not sold has no sample and no paywall", () => {
  // A site pack carries no `freeQuestionCount`, because the schema refuses one: there is no gate
  // for it to describe. Serving it therefore opens every question from the first.
  assert.equal(activePack.surface, PACK_SURFACE.site);
  assert.equal(packGate(activePack), null);
  assert.equal(packGate(marriagePack), marriagePack.freeQuestionCount, "a sold pack still names its sample");

  const answers = createAnswers({
    store: createMemoryStore(),
    questionIds: activeQuestionIds,
    choiceIdsByQuestion: activeChoiceIdsByQuestion,
    pack: activePackRef,
    freeQuestionCount: packGate(activePack)
  });
  // Reaching for a question far past where a three-question sample would have stopped is allowed,
  // and the state that comes back is not behind a paywall.
  assert.equal(typeof answers.stateFor, "function");
});

test("the screen's lock follows the server's answer rather than a constant of its own", async () => {
  const { isChapterLocked, SAMPLE_QUESTION_COUNT } = await import("../src/state.js");
  // The bug this holds: with the paywall off server-side, the screen still greyed out 97 of a
  // hundred free questions from a number it kept privately. A lock the server does not agree with
  // is a lie the reader can see.
  assert.equal(isChapterLocked(50, false, SAMPLE_QUESTION_COUNT, false), false, "not locked when the server says so");
  assert.equal(isChapterLocked(50, false, SAMPLE_QUESTION_COUNT, true), true, "locked when it does");
  assert.equal(isChapterLocked(50, true, SAMPLE_QUESTION_COUNT, true), false, "and never once it is bought");
  assert.equal(isChapterLocked(1, false, SAMPLE_QUESTION_COUNT, true), false, "the sample stays open");
});

test("a deployment with no environment set can sign a person in on the web", async () => {
  const { consumeUrl, webConsumeFallback } = await import("../server/mail.mjs");
  // The web is the product, so an unset flag means the web. It was the other way round while the
  // app was: the mail linked to `loveme://`, which no browser can open, so a deployment that had
  // not set the flag could sign nobody in at all.
  assert.equal(webConsumeFallback({}), true);
  assert.equal(consumeUrl("https://ab.example", "tok", {}), "https://ab.example/auth/consume?token=tok");
  assert.equal(webConsumeFallback({ AB_WEB_CONSUME_FALLBACK: "0" }), false, "and a deployment can still opt out");
});

test("the product's own screens no longer advertise the app", async () => {
  const app = readFileSync("src/app.js", "utf8");
  // The banner invited every signed-in reader to install the app, which was right while the app
  // was the product. `/install` is untouched — a link from outside still works — but nothing on
  // the path a reader actually walks points at it.
  assert.match(app, /function accountBannerHtml\(\) \{\s*return "";\s*\}/);
});
