import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ACCOUNT_COPY, PACK_DETAIL_COPY, S2_COPY } from "../mobile/s0-s2-s3-copy.js";
import {
  backFromAccount,
  backFromPackDetail,
  consumeSucceeded,
  createNativeFlow,
  finishSplash,
  loggedOutHome,
  logoutAccount,
  openAccount,
  openMarriageFromList,
  openSendLink,
  resolveNativeScreen
} from "../mobile/s0-s2-s3-flow.js";
import { renderAccountScreen, renderPackDetailScreen, renderS2SignupScreen } from "../mobile/s0-s2-s3-screens.js";

test("logged-in pack detail and account copy are designer-locked", () => {
  assert.equal(PACK_DETAIL_COPY.title, "결혼");
  assert.equal(PACK_DETAIL_COPY.subtitle, "두 사람의 결혼 준비, 한곳에.");
  assert.equal(PACK_DETAIL_COPY.line1, "질문은 나만 먼저 답해요.");
  assert.equal(PACK_DETAIL_COPY.line2, "비교는 둘이 낸 뒤에만 열려요.");
  assert.equal(PACK_DETAIL_COPY.line3, "파트너가 연결된 다음 질문이 열려요.");
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
  assert.match(html, /질문은 나만 먼저 답해요\./);
  assert.match(html, /비교는 둘이 낸 뒤에만 열려요\./);
  assert.match(html, /파트너가 연결된 다음 질문이 열려요\./);
  assert.match(html, /링크 보내기/);
  assert.match(html, /notebook/);
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
  assert.match(screens, /PACK_DETAIL_COPY\.line1/);
  assert.match(screens, /PACK_DETAIL_COPY\.line3/);
  assert.match(screens, /NotebookGraphic/);
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
});
