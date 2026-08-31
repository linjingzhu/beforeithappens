import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ACCOUNT_COPY, COMING_SOON_TASTE_COPY, PACK_DETAIL_COPY, RESULT_TASTE_COPY, S2_COPY } from "../mobile/s0-s2-s3-copy.js";
import {
  backFromAccount,
  backFromComingSoon,
  backFromPackDetail,
  backFromTasteResult,
  backToPackList,
  consumeSucceeded,
  createNativeFlow,
  finishSplash,
  loggedOutHome,
  logoutAccount,
  openAccount,
  openComingSoonFromList,
  openMarriageFromList,
  openSendLink,
  openTasteResult,
  resolveNativeScreen
} from "../mobile/s0-s2-s3-flow.js";
import { renderAccountScreen, renderComingSoonScreen, renderPackDetailScreen, renderS2SignupScreen, renderTasteResultScreen } from "../mobile/s0-s2-s3-screens.js";

test("logged-in pack detail and account copy are designer-locked", () => {
  assert.equal(PACK_DETAIL_COPY.title, "결혼");
  assert.equal(PACK_DETAIL_COPY.subtitle, "두 사람의 결혼 준비, 한곳에.");
  assert.equal(PACK_DETAIL_COPY.samplesTitle, "예시 질문");
  assert.equal(PACK_DETAIL_COPY.caption, "여기서 답하지 않아요. 파트너가 연결된 다음 질문이 열려요.");
  assert.equal(PACK_DETAIL_COPY.samples.length, 3);
  assert.equal(PACK_DETAIL_COPY.cta, "링크 보내기");
  assert.equal(ACCOUNT_COPY.title, "계정");
  assert.equal(ACCOUNT_COPY.email, "이메일");
  assert.equal(ACCOUNT_COPY.logout, "로그아웃");
});

test("splash opens magic-link login, not the discarded workbook cover", () => {
  const state = finishSplash(createNativeFlow());
  assert.equal(state.screen, "signup");
  assert.notEqual(state.screen, "cover");
  assert.notEqual(state.screen, "preview-q1");
  const login = renderS2SignupScreen();
  assert.match(login, /LoveMe/);
  assert.match(login, /두 사람의 결혼 준비, 한곳에/);
  assert.match(login, /비밀번호 없이 이메일로 로그인 링크를 보내드려요/);
  assert.match(login, /로그인 링크 보내기/);
  assert.equal(login.includes("미리 질문 하나 보기"), false);
  assert.equal(login.includes("이 답을 남기려면 로그인해 주세요"), false);
  assert.equal(login.includes("카카오로 시작"), false);
  assert.equal(login.includes("네이버로 시작"), false);
  assert.equal(login.includes("Google로 시작"), false);
  assert.equal(login.includes("홈"), false);
  assert.equal(login.includes("프로필"), false);
  assert.equal(login.includes("선물"), false);
});

test("marriage pack detail matches the locked mock and does not start questions", () => {
  const loggedIn = {
    user: { id: "usr_1", email: "sartre.art@gmail.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  };
  let state = finishSplash(createNativeFlow(loggedIn));
  assert.equal(state.screen, "pack-list");
  state = openMarriageFromList(state);
  assert.equal(state.screen, "pack-detail");
  const html = renderPackDetailScreen();
  assert.match(html, /결혼/);
  assert.match(html, /두 사람의 결혼 준비, 한곳에\./);
  assert.match(html, /예시 질문/);
  assert.match(html, /예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요\?/);
  assert.match(html, /명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요\?/);
  assert.match(html, /우리에게 집은 어떤 의미에 가장 가까울까요\?/);
  assert.equal(html.includes("결혼식 규모"), false);
  assert.equal(html.includes("결혼 비용"), false);
  assert.equal(html.includes("양가 명절은"), false);
  assert.match(html, /여기서 답하지 않아요/);
  assert.match(html, /파트너가 연결된 다음 질문이 열려요/);
  assert.match(html, /링크 보내기/);
  assert.equal(html.includes("notebook"), false);
  assert.equal(html.includes("type=\"radio\""), false);
  assert.equal(html.includes("type=\"text\""), false);
  assert.equal(html.includes("29,000"), false);
  assert.equal(html.includes("미리 질문 하나 보기"), false);
  assert.equal(html.includes("100"), false);
  state = openSendLink(state);
  assert.equal(state.screen, "invite");
  state = backFromPackDetail({ ...state, inviteOpen: false, packDetailOpen: true });
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
  assert.match(html, /이메일/);
  assert.match(html, /sartre\.art@gmail\.com/);
  assert.match(html, /로그아웃/);
  assert.equal(html.includes("이 폰을 상대에게 넘기려면 먼저 로그아웃하세요."), false);
  assert.equal(html.includes("로그아웃 후 이 기기를 넘겨주세요"), false);
  assert.equal(html.includes("얼굴"), false);
  assert.equal(html.includes("선물"), false);
  assert.equal(html.includes("29,000"), false);
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

test("Expo pack-detail and account omit prices, gifts, social, and preview Q1", async () => {
  const screens = await readFile("mobile/src/screens.js", "utf8");
  const css = await readFile("mobile/s0-s2-s3-preview.css", "utf8");
  const app = await readFile("mobile/App.js", "utf8");
  assert.match(screens, /PACK_DETAIL_COPY\.samplesTitle/);
  assert.match(screens, /PACK_DETAIL_COPY\.samples\.map/);
  assert.match(screens, /PACK_DETAIL_COPY\.captionLines/);
  assert.match(screens, /ComingSoonScreen/);
  assert.match(screens, /TasteResultScreen/);
  assert.match(screens, /SafeAreaView/);
  assert.match(screens, /function SafeScreen/);
  assert.equal(screens.includes("NotebookGraphic"), false);
  assert.equal(screens.includes("QR"), false);
  assert.equal(screens.includes("qrcode"), false);
  assert.equal(screens.includes("결혼식 규모"), false);
  const swift = await readFile("mobile/LoveMeInvitePackScreens.swift", "utf8");
  const kotlin = await readFile("mobile/LoveMeInvitePackScreens.kt", "utf8");
  for (const text of [swift, kotlin]) {
    assert.match(text, /예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요\?/);
    assert.match(text, /명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요\?/);
    assert.match(text, /우리에게 집은 어떤 의미에 가장 가까울까요\?/);
    assert.match(text, /가사와 시간은 어떻게 나누고 싶나요\?/);
    assert.match(text, /결과 맛보기/);
    assert.match(text, /임시 체험/);
    assert.match(text, /가까움/);
    assert.equal(text.includes("ALIGNED"), false);
    assert.equal(text.includes("CLOSE"), false);
    assert.equal(text.includes("DISCUSS"), false);
    assert.equal(text.includes("QR"), false);
    assert.equal(text.includes("qrcode"), false);
    assert.equal(text.includes("결혼식 규모"), false);
    assert.equal(text.includes("결혼 비용"), false);
    assert.equal(text.includes("양가 명절은"), false);
  }
  assert.match(screens, /ACCOUNT_COPY\.logout/);
  assert.match(screens, /testID="pack-detail"/);
  assert.match(screens, /testID="account"/);
  assert.equal(screens.includes("CoverScreen"), false);
  assert.equal(screens.includes("PreviewQ1Screen"), false);
  assert.equal(screens.includes("S2_KEEP_COPY"), false);
  assert.equal(screens.includes("프로필"), false);
  assert.equal(screens.includes("선물"), false);
  assert.equal(screens.includes("이 폰을 상대에게 넘기려면 먼저 로그아웃하세요."), false);
  assert.equal(app.includes("preview-q1"), false);
  assert.equal(app.includes("CoverScreen"), false);
  assert.match(css, /\.loveme-cover-line/);
  assert.match(css, /\.loveme-logout/);
  assert.match(css, /\.loveme-coming-soon/);
  assert.match(css, /\.loveme-taste-result/);
  assert.match(css, /safe-area-inset-top/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(swift, /safeAreaInsets/);
  assert.match(kotlin, /systemBarsPadding/);
  const s2Swift = await readFile("mobile/S2SignupScreen.swift", "utf8");
  const s2Kotlin = await readFile("mobile/S2SignupScreen.kt", "utf8");
  assert.match(s2Swift, /loveMeSafeChrome/);
  assert.match(s2Kotlin, /systemBarsPadding/);
  assert.match(app, /ComingSoonScreen/);
  assert.match(app, /TasteResultScreen/);
  assert.match(app, /openComingSoonFromList/);
});

test("coming-soon packs are enterable taste, not sale or invite", () => {
  const loggedIn = {
    user: { id: "usr_1", email: "sartre.art@gmail.com" },
    notice: null,
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  };
  let state = finishSplash(createNativeFlow(loggedIn));
  assert.equal(state.screen, "pack-list");
  assert.equal(openComingSoonFromList(state, "marriage").screen, "pack-list");
  state = openComingSoonFromList(state, "home-mgmt");
  assert.equal(state.screen, "coming-soon");
  assert.equal(COMING_SOON_TASTE_COPY.sampleQuestion, "가사와 시간은 어떻게 나누고 싶나요?");
  assert.equal(RESULT_TASTE_COPY.label, "가까움");
  const home = renderComingSoonScreen({ packId: "home-mgmt" });
  assert.match(home, /곧 열려요/);
  assert.match(home, /LoveMe coming-soon pack/);
  assert.match(home, /가정 경영/);
  assert.match(home, /임시 체험/);
  assert.match(home, /가사와 시간은 어떻게 나누고 싶나요\?/);
  assert.match(home, /예시입니다\. 여기서 답하거나 팔지 않아요/);
  assert.match(home, /결과 맛보기/);
  assert.match(home, /목록으로/);
  assert.equal(home.includes("링크 보내기"), false);
  assert.equal(home.includes("ALIGNED"), false);
  assert.equal(home.includes("29,000"), false);
  assert.equal(home.includes("type=\"radio\""), false);
  for (const pack of [
    ["pregnancy", "임신"],
    ["birth", "출산"],
    ["parenting", "육아"]
  ]) {
    const html = renderComingSoonScreen({ packId: pack[0] });
    assert.match(html, new RegExp(pack[1]));
    assert.match(html, /가사와 시간은 어떻게 나누고 싶나요\?/);
    assert.match(html, /임시 체험/);
    assert.equal(html.includes("링크 보내기"), false);
  }
  state = openTasteResult(state);
  assert.equal(state.screen, "taste-result");
  const result = renderTasteResultScreen({ packId: "home-mgmt" });
  assert.match(result, /결과 맛보기/);
  assert.match(result, /가까움/);
  assert.match(result, /가사와 시간은 어떻게 나누고 싶나요\?/);
  assert.match(result, /나/);
  assert.match(result, /상대/);
  assert.match(result, /평일은 반반, 주말은 그때 그때요/);
  assert.match(result, /한 사람이 메인으로 하고 나머지는 나눠요/);
  assert.match(result, /진짜 비교는 열린 팩에서 둘이 낸 다음입니다/);
  assert.match(result, /예시입니다/);
  assert.match(result, /목록으로/);
  assert.equal(result.includes("ALIGNED"), false);
  assert.equal(result.includes("CLOSE"), false);
  assert.equal(result.includes("DISCUSS"), false);
  assert.equal(result.includes("링크 보내기"), false);
  assert.equal(result.includes("29,000"), false);
  assert.equal(result.includes("얼굴"), false);
  state = backFromTasteResult(state);
  assert.equal(state.screen, "coming-soon");
  state = backFromComingSoon(state);
  assert.equal(state.screen, "pack-list");
  const fromResult = backToPackList(openTasteResult(openComingSoonFromList(finishSplash(createNativeFlow(loggedIn)), "pregnancy")));
  assert.equal(fromResult.screen, "pack-list");
  assert.equal(PACK_DETAIL_COPY.samples[2], "우리에게 집은 어떤 의미에 가장 가까울까요?");
});
