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
  assert.notEqual(PACK_COPY.hold, "보류");
});

test("iOS and Android copy tables match the locked strings", () => {
  for (const file of copyFiles) {
    const text = readFileSync(file, "utf8");
    assert.match(text, /결혼 팩 시작하기/);
    assert.match(text, /나만 보임/);
    assert.match(text, /합의/);
    assert.match(text, /다음에 미룸/);
    for (const banned of FORBIDDEN_PACK_SURFACES) {
      assert.equal(text.includes(banned), false, `${file} contains ${banned}`);
    }
  }
});

test("native HTTP clients keep real PATCH and API path shape", () => {
  const android = readFileSync("mobile/pack/android/src/main/java/app/loveme/pack/PackClient.kt", "utf8");
  const ios = readFileSync("mobile/pack/ios/LoveMePack/PackClient.swift", "utf8");
  assert.match(android, /connection\.requestMethod = method/);
  assert.equal(android.includes("X-HTTP-Method-Override"), false);
  assert.equal(android.includes("if (method == \"PATCH\") \"POST\""), false);
  assert.match(ios, /URL\(string: path, relativeTo: baseURL\)/);
  assert.equal(ios.includes("appendingPathComponent"), false);
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
  assert.match(reveal, /NEXT|next|이전 질문/);
  const androidScreens = readFileSync("mobile/pack/android/src/main/java/app/loveme/pack/PackScreens.kt", "utf8");
  assert.match(androidScreens, /submittedChoices/);
  assert.match(androidScreens, /PackCopy\.NEXT/);
  assert.match(androidScreens, /partnerStatus/);
  for (const file of screenFiles) {
    const text = readFileSync(file, "utf8");
    for (const banned of FORBIDDEN_PACK_SURFACES) {
      assert.equal(text.includes(banned), false, `${file} contains ${banned}`);
    }
  }
});
