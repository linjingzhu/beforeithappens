import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { AUTH_FETCH_MS } from "../mobile/s0-s2-s3-api.js";
import {
  canUnlockRest,
  grantShopHearts,
  HEART_COPY,
  HEART_FORBIDDEN,
  HEARTS,
  spendUnlockHearts,
  startingHearts,
  showsHeartBalance
} from "../src/hearts.js";
import {
  CERTIFICATE_COPY,
  classifySamplePair,
  countSampleLabels,
  existingQuestionsForPack,
  pickPackSample,
  SAMPLE_LABELS,
  SAMPLE_SIZE,
  sampleCounterLabel,
  TOGETHER_CTA
} from "../src/marriage-sample.js";
import { debugLine, isStoreBuild, isVirtualDebug } from "../mobile/src/virtual.js";
import {
  backFromCertificate,
  createNativeFlow,
  finishSplash,
  isFirstRunLogin,
  loggedOutHome,
  openComingSoonFromList,
  openMarriageFromList,
  openTogetherFromSample,
  purchaseShopHearts,
  setEmail,
  setSampleChoice,
  setSampleReason,
  submitMagicLink,
  submitSampleAnswer,
  tapUnlock
} from "../mobile/s0-s2-s3-flow.js";
import { renderNativeScreen, renderS2SignupScreen, renderUnlockScreen } from "../mobile/s0-s2-s3-screens.js";
import { PACK_LIST_COPY, PACK_LIST_ROWS } from "../src/pair-code.js";

const loggedIn = {
  user: { id: "usr_1", email: "buyer@example.com" },
  notice: null,
  workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
};

test("NEXT home first-run is splash → magic-link login → 질문집, not splash→home", async () => {
  const cold = finishSplash(createNativeFlow());
  assert.equal(cold.screen, "signup");
  assert.equal(isFirstRunLogin(cold), true);
  assert.equal(cold.pendingGate, "home");
  const login = renderS2SignupScreen();
  assert.match(login, /LoveMe/);
  assert.match(login, /로그인 링크 보내기/);
  assert.match(login, /이메일 주소를 입력해주세요/);
  assert.equal(login.includes("MaruBuri 🐾"), false);
  assert.equal(login.includes("cancel-login"), false);
  assert.equal(login.includes("알림을 허용하면"), false);
  const keepGate = renderS2SignupScreen({ firstRun: false });
  assert.match(keepGate, /cancel-login/);
  assert.equal(login.includes("type=\"password\""), false);
  assert.equal(login.includes("카카오로 시작"), false);
  assert.equal(login.includes("전화번호"), false);

  const sent = await submitMagicLink(
    setEmail(cold, "buyer@example.com"),
    { requestMagicLink: async () => ({ ok: false }) },
    { LOVEME_VIRTUAL: "1" }
  );
  assert.equal(sent.screen, "pack-list");
  assert.equal(sent.session.user.email, "buyer@example.com");
  assert.match(renderNativeScreen(sent), /질문집/);
  assert.match(renderNativeScreen(sent), /♡ 0/);
});

test("hearts SKU is 29000→12, unlock costs 10, old paywall CTA is shop-only", () => {
  assert.equal(startingHearts(), 0);
  assert.equal(HEARTS.unlockCost, 10);
  assert.equal(HEARTS.skuHearts, 12);
  assert.equal(HEARTS.skuPriceKrw, 29000);
  assert.equal(canUnlockRest(0), false);
  assert.equal(canUnlockRest(12), true);
  assert.equal(grantShopHearts(0), 12);
  assert.equal(spendUnlockHearts(12).balance, 2);
  assert.equal(HEART_COPY.unlockCta, "열기");
  assert.equal(HEART_COPY.shopCta, "29,000원에 하트 12");
  assert.equal(HEART_COPY.partnerWait, "상대가 열면 이어집니다.");
  for (const banned of HEART_FORBIDDEN) {
    assert.equal(HEART_COPY.unlockCta.includes(banned), false);
  }
  const needy = renderUnlockScreen({ hearts: 0, shopOpen: false });
  assert.match(needy, /열기/);
  assert.match(needy, /하트 10이 필요해요/);
  assert.equal(needy.includes("29,000원에 나머지 열기"), false);
  assert.equal(needy.includes("29,000"), false);
  const shop = renderUnlockScreen({ hearts: 0, shopOpen: true });
  assert.match(shop, /29,000원에 하트 12/);
  assert.equal(shop.includes("29,000원에 나머지 열기"), false);
  const rich = renderUnlockScreen({ hearts: 12, shopOpen: false });
  assert.match(rich, /열기/);
  assert.equal(rich.includes("29,000"), false);
  assert.equal(showsHeartBalance({ workspace: { role: "partner" } }), false);
});

test("marriage sample is 3 existing questions; coming-soon packs invent no 임신/출산/육아 copy", () => {
  assert.equal(SAMPLE_SIZE, 3);
  assert.equal(existingQuestionsForPack("marriage").length >= 3, true);
  assert.equal(pickPackSample("marriage", undefined, () => 0).length, 3);
  assert.deepEqual(existingQuestionsForPack("dating"), []);
  assert.deepEqual(existingQuestionsForPack("pregnancy"), []);
  assert.deepEqual(existingQuestionsForPack("birth"), []);
  assert.deepEqual(existingQuestionsForPack("parenting"), []);
  assert.deepEqual(existingQuestionsForPack("home-mgmt"), []);
  assert.equal(PACK_LIST_COPY.soon, "곧 열려요");
  assert.equal(PACK_LIST_ROWS.filter((row) => !row.open).length, 5);
  const home = finishSplash(createNativeFlow(loggedIn));
  assert.equal(home.screen, "pack-list");
  const marriage = openMarriageFromList(home, () => 0);
  assert.equal(marriage.screen, "sample-q");
  assert.equal(marriage.sampleQuestions.length, 3);
  const q1 = renderNativeScreen(marriage);
  assert.match(q1, /결혼 1\/3/);
  assert.match(q1, /왜 그 선택인지 한 줄로 적어주세요/);
  assert.match(q1, />다음</);
  assert.equal(q1.includes("3/12"), false);
  const emptySoon = openComingSoonFromList(home, "pregnancy");
  assert.equal(emptySoon.screen, "sample-result");
  assert.equal(emptySoon.sampleQuestions.length, 0);
  const html = renderNativeScreen(emptySoon);
  assert.equal(html.includes("임신 질문"), false);
  assert.match(html, /함께 풀어보기/);
  assert.match(html, /예시입니다/);
});

test("three sample answers stay on sample result, not the certificate", () => {
  const home = finishSplash(createNativeFlow(loggedIn));
  let state = openMarriageFromList(home, () => 0);
  assert.equal(state.screen, "sample-q");
  while (state.screen === "sample-q") {
    const question = state.sampleQuestions[state.sampleIndex];
    state = setSampleChoice(state, question.choices[0].id);
    state = setSampleReason(state, "이유는 이거예요");
    state = submitSampleAnswer(state, () => 0);
  }
  assert.equal(state.screen, "sample-result");
  const html = renderNativeScreen(state);
  assert.match(html, /예시입니다/);
  assert.match(html, /같음/);
  assert.match(html, /가까움/);
  assert.match(html, /이야기해요/);
  assert.match(html, /함께 풀어보기/);
  assert.equal(html.includes("두 사람이 이 질문집을 마쳤어요"), false);
  assert.equal(html.includes("[debug] 수료"), false);
  assert.equal(html.includes("이수증"), false);
});

test("unlock spends 10 hearts then shows certificate with counts, heart stamp, 홈으로", () => {
  const four = {
    id: "demo",
    choices: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }]
  };
  assert.equal(classifySamplePair(four, "a", "a"), "aligned");
  assert.equal(classifySamplePair(four, "a", "b"), "close");
  assert.equal(classifySamplePair(four, "a", "d"), "discuss");
  assert.deepEqual(countSampleLabels([
    { questionId: "demo", choiceId: "a", partnerChoiceId: "a" },
    { questionId: "demo", choiceId: "a", partnerChoiceId: "b" },
    { questionId: "demo", choiceId: "a", partnerChoiceId: "d" }
  ], [four]), { aligned: 1, close: 1, discuss: 1 });

  const home = finishSplash(createNativeFlow(loggedIn));
  let state = openMarriageFromList(home, () => 0);
  while (state.screen === "sample-q") {
    const question = state.sampleQuestions[state.sampleIndex];
    state = setSampleChoice(state, question.choices[0].id);
    state = setSampleReason(state, "이유는 이거예요");
    state = submitSampleAnswer(state, () => 0);
  }
  state = openTogetherFromSample(state);
  assert.equal(state.screen, "unlock");
  state = tapUnlock(state);
  assert.equal(state.shopOpen, true);
  state = purchaseShopHearts(state);
  assert.equal(state.hearts, 12);
  state = tapUnlock(state);
  assert.equal(state.screen, "certificate");
  assert.equal(state.hearts, 2);
  assert.equal(CERTIFICATE_COPY.body, "두 사람이 이 질문집을 마쳤어요");
  assert.equal(CERTIFICATE_COPY.cta, "홈으로");
  assert.equal(CERTIFICATE_COPY.debugExtra, "수료");
  const html = renderNativeScreen(state);
  assert.match(html, /결혼/);
  assert.match(html, /두 사람이 이 질문집을 마쳤어요/);
  assert.match(html, /같음 0/);
  assert.match(html, /가까움 3/);
  assert.match(html, /이야기해요 0/);
  assert.match(html, />홈으로</);
  assert.match(html, /\[debug\] 수료/);
  assert.match(html, /loveme-certificate-stamp/);
  assert.equal(html.includes("이수증"), false);
  assert.equal(html.includes("목록으로"), false);
  assert.equal(html.includes("점수"), false);
  assert.equal(html.includes("얼굴"), false);
  assert.equal(html.includes("graph"), false);
  assert.equal(html.includes("예시입니다"), false);
  assert.equal(backFromCertificate(state).screen, "pack-list");
  assert.equal(TOGETHER_CTA, "함께 풀어보기");
  assert.equal(SAMPLE_LABELS.aligned, "같음");
});

test("native certificate copy is pack counts heart stamp 홈으로 and debug 수료", async () => {
  const swift = await readFile("mobile/LoveMeInvitePackScreens.swift", "utf8");
  const kotlin = await readFile("mobile/LoveMeInvitePackScreens.kt", "utf8");
  const expo = await readFile("mobile/src/screens.js", "utf8");
  assert.equal(CERTIFICATE_COPY.body, "두 사람이 이 질문집을 마쳤어요");
  assert.equal(CERTIFICATE_COPY.cta, "홈으로");
  for (const text of [swift, kotlin]) {
    assert.match(text, /두 사람이 이 질문집을 마쳤어요/);
    assert.match(text, /홈으로/);
  }
  // The Expo screen renders the shared constants rather than repeating the literals.
  assert.match(expo, /CERTIFICATE_COPY\.body/);
  assert.match(expo, /CERTIFICATE_COPY\.cta/);
  for (const text of [swift, kotlin, expo]) {
    assert.equal(text.includes("이수증"), false);
    assert.equal(text.includes("점수"), false);
  }
  assert.match(swift, /LoveMeDebugLine\(extra: LoveMeInvitePackCopy.debugDone\)/);
  assert.match(kotlin, /debugDone/);
  assert.match(expo, /certificate-home/);
  assert.match(expo, /CERTIFICATE_COPY\.stamp/);
});

test("virtual debug is on; store builds hide [debug]; AUTH_FETCH_MS stays 55s", async () => {
  assert.equal(isVirtualDebug({ LOVEME_VIRTUAL: "1" }), true);
  assert.equal(debugLine(), "[debug]");
  assert.equal(debugLine(undefined, "수료"), "[debug] 수료");
  assert.equal(isStoreBuild({ EAS_BUILD_PROFILE: "production" }), true);
  assert.equal(debugLine({ EXPO_PUBLIC_STORE_BUILD: "1" }), "");
  assert.equal(debugLine({ EXPO_PUBLIC_STORE_BUILD: "1" }, "수료"), "");
  assert.ok(AUTH_FETCH_MS >= 45000 && AUTH_FETCH_MS <= 60000);
  const apiSwift = await readFile("mobile/LoveMeAuthApi.swift", "utf8");
  const apiKt = await readFile("mobile/LoveMeAuthApi.kt", "utf8");
  assert.match(apiSwift, /static let authTimeout: TimeInterval = 55/);
  assert.match(apiKt, /const val AUTH_FETCH_MS = 55_000/);
  const screens = await readFile("mobile/src/screens.js", "utf8");
  const s2Swift = await readFile("mobile/S2SignupScreen.swift", "utf8");
  assert.match(screens, /requestLoveMeNotificationPermission/);
  assert.match(s2Swift, /requestAuthorization\(options: \[\.alert, \.sound, \.badge\]\)/);
  assert.equal(s2Swift.includes("알림을 허용하면"), false);
  assert.equal(screens.includes("MaruBuri 🐾"), false);
  assert.match(screens, /fontFamily: fonts\.titleStrong/);
  assert.match(screens, /fonts\.body/);
  assert.equal(loggedOutHome().screen, "signup");
});

test("Designer font lock uses MaruBuri for titles/stems and Pretendard for body", async () => {
  assert.equal(sampleCounterLabel("marriage", 0), "결혼 1/3");
  assert.equal(sampleCounterLabel("marriage", 2), "결혼 3/3");
  assert.deepEqual(PACK_LIST_ROWS.map((row) => row.label), ["연애", "결혼", "가정 경영", "임신", "출산", "육아"]);
  const css = await readFile("mobile/s0-s2-s3-preview.css", "utf8");
  assert.match(css, /font-family: "MaruBuri"/);
  assert.match(css, /font-family: "Pretendard"/);
  assert.match(css, /\.loveme-stem/);
  assert.match(css, /\.loveme-soon[\s\S]*font-family: var\(--font-body\)/);
  const fontMod = await readFile("mobile/src/fonts.js", "utf8");
  assert.match(fontMod, /FONT_TITLE = "MaruBuri"/);
  assert.match(fontMod, /FONT_BODY = "Pretendard"/);
  assert.equal(fontMod.includes("MaruBuri 🐾"), false);
  const screens = await readFile("mobile/src/screens.js", "utf8");
  assert.match(screens, /styles\.sampleProgress/);
  assert.match(screens, /reasonHeart/);
});
