import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PAYWALL_COPY, PAYWALL_FORBIDDEN } from "../contract/paywall-copy.js";

const copyFiles = [
  "mobile/paywall/ios/LoveMePaywall/PaywallCopy.swift",
  "mobile/paywall/android/src/main/java/app/loveme/paywall/PaywallCopy.kt"
];

const screenFiles = [
  "mobile/paywall/ios/LoveMePaywall/PaywallOverlay.swift",
  "mobile/paywall/android/src/main/java/app/loveme/paywall/PaywallScreens.kt",
  "mobile/paywall/screens.js"
];

test("buyer and partner copy is locked", () => {
  assert.equal(PAYWALL_COPY.buyerTitle, "두 사람 답을 비교했어요.");
  assert.equal(PAYWALL_COPY.buyerBody, "나머지 문항을 이어서 열 수 있어요.");
  assert.equal(PAYWALL_COPY.buyerCta, "열기");
  assert.equal(PAYWALL_COPY.needHearts, "♡ 하트 10이 필요해요.");
  assert.equal(PAYWALL_COPY.shopCta, "29,000원에 | ♡ 12");
  assert.equal(PAYWALL_COPY.later, "나중에");
  assert.equal(PAYWALL_COPY.partnerTitle, "상대가 열면 이어집니다.");
  assert.equal(PAYWALL_COPY.partnerBody, "");
  assert.equal(PAYWALL_COPY.aligned, "같음");
  assert.equal(PAYWALL_COPY.close, "가까움");
  assert.equal(PAYWALL_COPY.discuss, "이야기해요");
});

test("iOS, Android, and RN copy tables match and stay off forbidden surfaces", () => {
  for (const file of copyFiles) {
    const text = readFileSync(file, "utf8");
    assert.match(text, /두 사람 답을 비교했어요/);
    assert.match(text, /열기/);
    assert.match(text, /29,000원에 \| ♡ 12/);
    assert.match(text, /나중에/);
    assert.match(text, /상대가 열면 이어집니다/);
    assert.match(text, /같음/);
    assert.equal(text.includes("관계가 틀렸다"), false, `${file} contains 관계가 틀렸다`);
    assert.equal(text.includes("29,000원에 나머지 열기"), false);
    assert.equal(text.includes("1000원"), false);
    for (const banned of PAYWALL_FORBIDDEN) {
      assert.equal(text.includes(banned), false, `${file} contains ${banned}`);
    }
  }
  const rn = readFileSync("mobile/paywall/screens.js", "utf8");
  assert.match(rn, /PAYWALL_COPY\.buyerTitle/);
  assert.match(rn, /PAYWALL_COPY\.partnerTitle/);
  assert.match(rn, /PAYWALL_COPY\.buyerCta/);
  assert.equal(rn.includes("관계가 틀렸다"), false);
  for (const file of screenFiles) {
    const text = readFileSync(file, "utf8");
    assert.equal(text.includes("관계가 틀렸다"), false, `${file} contains 관계가 틀렸다`);
    assert.equal(text.includes("구독"), false, `${file} contains 구독`);
    assert.equal(text.includes("100문"), false, `${file} contains 100문`);
    assert.equal(text.includes("29,000원에 나머지 열기"), false);
  }
});

test("partner surface has no purchase button; buyer CTA is 열기 and shop is a sheet", () => {
  const ios = readFileSync("mobile/paywall/ios/LoveMePaywall/PaywallOverlay.swift", "utf8");
  const android = readFileSync("mobile/paywall/android/src/main/java/app/loveme/paywall/PaywallScreens.kt", "utf8");
  const rn = readFileSync("mobile/paywall/screens.js", "utf8");
  const partnerIos = ios.slice(ios.indexOf("struct PaywallPartnerView"), ios.indexOf("struct PaywallOverlay"));
  const partnerAndroid = android.slice(android.indexOf("fun PaywallPartnerScreen"), android.indexOf("fun PaywallOverlay"));
  const partnerRn = rn.slice(rn.indexOf("export function PaywallPartnerScreen"), rn.indexOf("export function PaywallOverlay"));
  assert.equal(partnerIos.includes("buyerCta"), false);
  assert.equal(partnerIos.includes("purchase()"), false);
  assert.equal(partnerAndroid.includes("BUYER_CTA"), false);
  assert.equal(partnerAndroid.includes("model.purchase"), false);
  assert.equal(partnerRn.includes("onPurchase"), false);
  assert.equal(partnerRn.includes("paywall-purchase"), false);
  assert.match(ios, /purchaseRemaining/);
  assert.match(android, /purchaseRemaining/);
  assert.match(ios, /PaywallCopy\.buyerCta/);
  assert.match(android, /PaywallCopy\.BUYER_CTA/);
  assert.match(rn, /testID="paywall-purchase"/);
});
