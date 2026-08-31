import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ACCOUNT_COPY, COMING_SOON_TASTE_COPY, PACK_DETAIL_COPY, RESULT_TASTE_COPY, S2_COPY } from "../mobile/s0-s2-s3-copy.js";
import {
  backFromAccount,
  backFromComingSoon,
  backFromPackDetail,
  backToPackList,
  cancelLogin,
  consumeSucceeded,
  createNativeFlow,
  finishSplash,
  loggedOutHome,
  logoutAccount,
  noticeAcknowledged,
  openAccount,
  openComingSoonFromList,
  openMarriageFromList,
  openSendLink,
  requireLogin,
  requireLoginForPay,
  resolveNativeScreen
} from "../mobile/s0-s2-s3-flow.js";
import { renderAccountScreen, renderS2SignupScreen } from "../mobile/s0-s2-s3-screens.js";

test("logged-in pack detail constants remain for historical cover copy", () => {
  assert.equal(PACK_DETAIL_COPY.title, "결혼");
  assert.equal(PACK_DETAIL_COPY.subtitle, "두 사람의 결혼 준비, 한곳에.");
  assert.equal(PACK_DETAIL_COPY.samplesTitle, "예시 질문");
  assert.equal(PACK_DETAIL_COPY.caption, "여기서 답하지 않아요. 파트너가 연결된 다음 질문이 열려요.");
  assert.equal(PACK_DETAIL_COPY.samples.length, 3);
  assert.equal(PACK_DETAIL_COPY.cta, "링크 보내기");
  assert.equal(ACCOUNT_COPY.title, "계정");
  assert.equal(ACCOUNT_COPY.logout, "로그아웃");
});

test("splash opens magic-link login, not 질문집 home or the discarded workbook cover", () => {
  const state = finishSplash(createNativeFlow());
  assert.equal(state.screen, "signup");
  assert.notEqual(state.screen, "pack-list");
  assert.notEqual(state.screen, "cover");
  assert.notEqual(state.screen, "preview-q1");
  const login = renderS2SignupScreen();
  assert.match(login, /LoveMe/);
  assert.equal(login.includes("두 사람의 결혼 준비, 한곳에"), false);
  assert.equal(login.includes("비밀번호 없이 이메일로 로그인 링크를 보내드려요"), false);
  assert.match(login, /로그인 링크 보내기/);
  assert.match(login, /이메일 주소를 입력해주세요/);
  assert.equal(login.includes("cancel-login"), false);
  assert.equal(login.includes("MaruBuri"), false);
  const keepGate = renderS2SignupScreen({ firstRun: false });
  assert.match(keepGate, /cancel-login/);
  assert.match(keepGate, /비밀번호 없이 이메일로 로그인 링크를 보내드려요/);
  assert.equal(login.includes("미리 질문 하나 보기"), false);
  assert.equal(login.includes("이 답을 남기려면 로그인해 주세요"), false);
  assert.equal(login.includes("카카오로 시작"), false);
  assert.equal(login.includes("네이버로 시작"), false);
  assert.equal(login.includes("Google로 시작"), false);
  assert.equal(login.includes("MaruBuri"), false);
  assert.equal(login.includes("프로필"), false);
  assert.equal(login.includes("선물"), false);
});

test("logged-in marriage opens the 3-question sample, not read-only pack detail", () => {
  const loggedIn = {
    user: { id: "usr_1", email: "sartre.art@gmail.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  };
  let state = finishSplash(createNativeFlow(loggedIn));
  assert.equal(state.screen, "pack-list");
  state = openMarriageFromList(state, () => 0);
  assert.equal(state.screen, "sample-q");
  assert.equal(state.sampleQuestions.length, 3);
  state = backFromPackDetail(state);
  assert.equal(resolveNativeScreen(state), "pack-list");
});

test("account shows email and logout without discarded handoff copy", () => {
  const loggedIn = {
    user: { id: "usr_1", email: "sartre.art@gmail.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  };
  let state = openAccount(finishSplash(createNativeFlow(loggedIn)));
  assert.equal(state.screen, "account");
  const html = renderAccountScreen({ email: loggedIn.user.email });
  assert.match(html, /계정/);
  assert.match(html, /sartre\.art@gmail\.com/);
  assert.match(html, /로그아웃/);
  assert.match(html, /연인을 초대하세요/);
  assert.equal(html.includes("이 폰을 상대에게 넘기려면 먼저 로그아웃하세요."), false);
  assert.equal(html.includes("얼굴"), false);
  assert.equal(html.includes("선물"), false);
  assert.equal(html.includes("29,000원에 나머지 열기"), false);
  state = backFromAccount(state);
  assert.equal(state.screen, "pack-list");
});

test("consume and logout never resume preview Q1", async () => {
  const loggedIn = {
    user: { id: "usr_1", email: "buyer@example.com" },
    notice: "no-local-draft",
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  };
  let state = consumeSucceeded(finishSplash(createNativeFlow()), loggedIn);
  assert.equal(resolveNativeScreen(state), "notice");
  assert.notEqual(state.screen, "preview-q1");
  assert.notEqual(state.screen, "cover");
  const bare = consumeSucceeded(finishSplash(createNativeFlow()), {
    user: { id: "usr_3", email: "buyer@example.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  });
  assert.equal(bare.screen, "pack-list");
  const out = await logoutAccount(bare, { logout: async () => ({ ok: true }) });
  assert.equal(out.screen, "signup");
  assert.equal(loggedOutHome().screen, "signup");
  assert.equal(S2_COPY.cta, "로그인 링크 보내기");
});

test("Expo sample, hearts, and account omit gifts, social, and preview Q1", async () => {
  const screens = await readFile("mobile/src/screens.js", "utf8");
  const css = await readFile("mobile/s0-s2-s3-preview.css", "utf8");
  const app = await readFile("mobile/App.js", "utf8");
  assert.match(screens, /SampleQuestionScreen/);
  assert.match(screens, /UnlockRestScreen/);
  assert.match(screens, /CertificateScreen/);
  assert.match(screens, /ComingSoonScreen/);
  assert.match(screens, /SafeAreaView/);
  assert.match(screens, /function SafeScreen/);
  assert.equal(screens.includes("NotebookGraphic"), false);
  assert.equal(screens.includes("QR"), false);
  assert.equal(screens.includes("결혼식 규모"), false);
  const swift = await readFile("mobile/LoveMeInvitePackScreens.swift", "utf8");
  const kotlin = await readFile("mobile/LoveMeInvitePackScreens.kt", "utf8");
  for (const text of [swift, kotlin]) {
    assert.match(text, /예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요\?/);
    assert.match(text, /명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요\?/);
    assert.match(text, /우리에게 집은 어떤 의미에 가장 가까울까요\?/);
    assert.match(text, /가까움/);
    assert.equal(text.includes("ALIGNED"), false);
    assert.equal(text.includes("QR"), false);
    assert.equal(text.includes("결혼식 규모"), false);
  }
  assert.match(screens, /ACCOUNT_COPY\.logout/);
  assert.match(screens, /testID="account"/);
  assert.equal(screens.includes("CoverScreen"), false);
  assert.equal(screens.includes("PreviewQ1Screen"), false);
  assert.equal(screens.includes("프로필"), false);
  assert.equal(screens.includes("선물"), false);
  assert.equal(app.includes("preview-q1"), false);
  assert.equal(app.includes("CoverScreen"), false);
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(swift, /safeAreaInsets/);
  assert.match(kotlin, /systemBarsPadding/);
  const s2Swift = await readFile("mobile/S2SignupScreen.swift", "utf8");
  const s2Kotlin = await readFile("mobile/S2SignupScreen.kt", "utf8");
  assert.match(s2Swift, /loveMeSafeChrome/);
  assert.match(s2Kotlin, /systemBarsPadding/);
  assert.match(app, /ComingSoonScreen/);
  assert.match(app, /openComingSoonFromList/);
  assert.equal(COMING_SOON_TASTE_COPY.backToList, "목록으로");
  assert.equal(RESULT_TASTE_COPY.labels.close, "가까움");
});

test("coming-soon packs use the sample engine and do not invent 임신/출산/육아 questions", () => {
  const loggedIn = {
    user: { id: "usr_1", email: "sartre.art@gmail.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  };
  let state = finishSplash(createNativeFlow(loggedIn));
  assert.equal(state.screen, "pack-list");
  assert.equal(openComingSoonFromList(state, "marriage").screen, "pack-list");
  state = openComingSoonFromList(state, "pregnancy");
  assert.equal(state.screen, "sample-result");
  assert.equal(state.sampleQuestions.length, 0);
  state = backFromComingSoon(state);
  assert.equal(state.screen, "pack-list");
  const fromResult = backToPackList(openComingSoonFromList(finishSplash(createNativeFlow(loggedIn)), "pregnancy"));
  assert.equal(fromResult.screen, "pack-list");
  assert.equal(PACK_DETAIL_COPY.samples[2], "우리에게 집은 어떤 의미에 가장 가까울까요?");
});

test("logged-out first-run stays on login; keep-gates still resume after consume", () => {
  let state = finishSplash(createNativeFlow());
  assert.equal(state.screen, "signup");
  const cancelled = cancelLogin(state);
  assert.equal(cancelled.screen, "signup");

  const accountGate = openAccount(finishSplash(createNativeFlow()));
  assert.equal(accountGate.screen, "signup");
  assert.equal(accountGate.pendingGate, "account");

  const payGate = requireLoginForPay(finishSplash(createNativeFlow()));
  assert.equal(payGate.screen, "signup");
  assert.equal(payGate.pendingGate, "paywall");
  const loggedIn = {
    user: { id: "usr_1", email: "buyer@example.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  };
  const payLoggedIn = requireLoginForPay(finishSplash(createNativeFlow(loggedIn)));
  assert.equal(payLoggedIn.screen, "unlock");

  const session = {
    user: { id: "usr_2", email: "buyer@example.com" },
    notice: "no-local-draft",
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  };
  let headed = consumeSucceeded(openSendLink(finishSplash(createNativeFlow())), session);
  assert.equal(headed.screen, "notice");
  assert.equal(headed.pendingGate, "invite");
  headed = noticeAcknowledged(headed, { ...session, notice: null });
  assert.equal(headed.screen, "invite");

  const accountResume = consumeSucceeded(openAccount(finishSplash(createNativeFlow())), {
    user: { id: "usr_3", email: "buyer@example.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  });
  assert.equal(accountResume.screen, "account");
  assert.equal(requireLogin(finishSplash(createNativeFlow()), "connect").pendingGate, "connect");
});
