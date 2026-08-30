import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FORBIDDEN_PACK_SURFACES, PACK_COPY } from "../contract/pack-copy.js";

const copyFiles = [
  "mobile/pack/ios/LoveMePack/PackCopy.swift",
  "mobile/pack/android/src/main/java/app/loveme/pack/PackCopy.kt"
];

const screenFiles = [
  "mobile/pack/ios/LoveMePack/PackReadyView.swift",
  "mobile/pack/ios/LoveMePack/PackQuestionView.swift",
  "mobile/pack/ios/LoveMePack/PackRevealView.swift",
  "mobile/pack/android/src/main/java/app/loveme/pack/PackScreens.kt"
];

test("S6–S8 copy is locked", () => {
  assert.equal(PACK_COPY.startPack, "결혼 팩 시작하기");
  assert.equal(PACK_COPY.draftBadge, "나만 보임");
  assert.equal(PACK_COPY.agree, "합의");
  assert.equal(PACK_COPY.hold, "다음에 미룸");
  assert.equal(PACK_COPY.reanswer, "다시 답하기");
  assert.notEqual(PACK_COPY.reanswer, "재시 답하기");
  assert.notEqual(PACK_COPY.hold, "보류");
  assert.equal(PACK_COPY.aligned, "ALIGNED");
  assert.equal(PACK_COPY.close, "CLOSE");
  assert.equal(PACK_COPY.discuss, "DISCUSS");
});

test("iOS and Android copy tables match the locked strings", () => {
  for (const file of copyFiles) {
    const text = readFileSync(file, "utf8");
    assert.match(text, /결혼 팩 시작하기/);
    assert.match(text, /나만 보임/);
    assert.match(text, /합의/);
    assert.match(text, /다음에 미룸/);
    assert.match(text, /다시 답하기/);
    assert.equal(text.includes("재시 답하기"), false, `${file} contains 재시 답하기`);
    assert.match(text, /ALIGNED/);
    assert.match(text, /CLOSE/);
    assert.match(text, /DISCUSS/);
    for (const banned of FORBIDDEN_PACK_SURFACES) {
      assert.equal(text.includes(banned), false, `${file} contains ${banned}`);
    }
  }
});

test("native HTTP clients keep real PATCH and API path shape", () => {
  const android = readFileSync("mobile/pack/android/src/main/java/app/loveme/pack/PackClient.kt", "utf8")
    + readFileSync("mobile/pack/android/src/main/java/app/loveme/pack/PackHttp.kt", "utf8");
  const ios = readFileSync("mobile/pack/ios/LoveMePack/PackClient.swift", "utf8");
  assert.match(android, /PATCH/);
  assert.match(android, /\/api\/pack\/draft/);
  assert.match(android, /append\(method\)/);
  assert.match(android, /decodeChunked/);
  assert.match(android, /transfer-encoding/);
  assert.equal(/java\.net\.HttpURLConnection/.test(android), false);
  assert.equal(android.includes("X-HTTP-Method-Override"), false);
  assert.equal(android.includes("if (method == \"PATCH\") \"POST\""), false);
  assert.match(ios, /URL\(string: path, relativeTo: baseURL\)/);
  assert.match(ios, /returnGateErrors: true/);
  assert.equal(ios.includes("appendingPathComponent"), false);
});

test("iOS maps GET /api/pack/state 403 locked onto the locked screen", () => {
  const viewModel = readFileSync("mobile/pack/ios/LoveMePack/PackViewModel.swift", "utf8");
  const client = readFileSync("mobile/pack/ios/LoveMePack/PackClient.swift", "utf8");
  const ready = readFileSync("mobile/pack/ios/LoveMePack/PackReadyView.swift", "utf8");
  assert.match(client, /returnGateErrors: true/);
  assert.match(client, /PackClientError\.isGate/);
  assert.match(viewModel, /applyGatePayload/);
  assert.match(viewModel, /applyClientError/);
  assert.match(viewModel, /code == "locked" \|\| code == "forbidden" \|\| status == 403/);
  assert.match(viewModel, /screen = \.locked/);
  assert.match(viewModel, /var showsStartCTA/);
  assert.match(ready, /showsStartCTA/);
  assert.equal(ready.includes("PackGate.canStartPack(model.session)"), false);
});

test("native VMs stay on the lock snapshot after submit until beginReanswer", () => {
  const ios = readFileSync("mobile/pack/ios/LoveMePack/PackViewModel.swift", "utf8");
  const android = readFileSync("mobile/pack/android/src/main/java/app/loveme/pack/PackViewModel.kt", "utf8");
  assert.equal(ios.includes("draft != lock.submittedChoices"), false);
  assert.equal(android.includes("mine.draftChoice != lockedChoice"), false);
  assert.equal(ios.includes("reanswering = true") && ios.includes("func beginReanswer"), true);
  assert.equal(android.includes("if (lock != null && lockedChoice != id) reanswering = true"), false);
  assert.match(ios, /canEdit = reanswering \|\| \(lock == nil && !submitted\)/);
  assert.match(android, /canEdit = reanswering \|\| \(lock == null && !submitted\)/);
  assert.match(ios, /reanswering = false/);
  assert.match(android, /reanswering = false/);
  assert.match(ios, /func beginReanswer/);
  assert.match(android, /fun beginReanswer/);
  assert.match(ios, /if lock != nil && !reanswering \{ screen = \.reveal \}/);
  assert.match(android, /lock != null && !reanswering/);
});

test("native screens bind the locked copy constants and stay off install/payment", () => {
  const ready = readFileSync("mobile/pack/ios/LoveMePack/PackReadyView.swift", "utf8")
    + readFileSync("mobile/pack/android/src/main/java/app/loveme/pack/PackScreens.kt", "utf8");
  assert.match(ready, /startPack|START_PACK/);
  const question = readFileSync("mobile/pack/ios/LoveMePack/PackQuestionView.swift", "utf8")
    + readFileSync("mobile/pack/android/src/main/java/app/loveme/pack/PackScreens.kt", "utf8");
  assert.match(question, /privacyBadge/);
  const reveal = readFileSync("mobile/pack/ios/LoveMePack/PackRevealView.swift", "utf8")
    + readFileSync("mobile/pack/android/src/main/java/app/loveme/pack/PackScreens.kt", "utf8");
  assert.match(reveal, /agree|AGREE/);
  assert.match(reveal, /hold|HOLD/);
  assert.match(reveal, /reanswer|REANSWER/);
  assert.match(reveal, /NEXT|next|이전 질문/);
  const androidScreens = readFileSync("mobile/pack/android/src/main/java/app/loveme/pack/PackScreens.kt", "utf8");
  assert.match(androidScreens, /submittedChoices/);
  assert.match(androidScreens, /PackCopy\.NEXT/);
  assert.match(androidScreens, /partnerStatus/);
  assert.match(reveal, /comparisonLabel/);
  for (const file of screenFiles) {
    const text = readFileSync(file, "utf8");
    for (const banned of FORBIDDEN_PACK_SURFACES) {
      assert.equal(text.includes(banned), false, `${file} contains ${banned}`);
    }
  }
});
