import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { marriagePack } from "../src/questions.js";
import { COVER_COPY, S2_COPY, S2_KEEP_COPY } from "../mobile/s0-s2-s3-copy.js";
import {
  assertLockedCoverCopy,
  coverHasInvite,
  coverHasSignup,
  PREVIEW_Q1_ID,
  previewAllowsOnlyFirstQuestion,
  previewQ1Question,
  readPreviewDraft
} from "../mobile/preview-q1.js";
import {
  consumeSucceeded,
  continueFromPreviewQ1,
  createNativeFlow,
  finishSplash,
  keepPreviewAnswer,
  openPreviewQ1,
  resolveNativeScreen,
  selectPreviewChoice
} from "../mobile/s0-s2-s3-flow.js";
import { renderCoverScreen, renderPreviewQ1Screen, renderS2SignupScreen } from "../mobile/s0-s2-s3-screens.js";

test("cover copy and login-gate copy are designer-locked", () => {
  assert.equal(assertLockedCoverCopy(), true);
  assert.equal(COVER_COPY.title, "두 사람의 결혼 준비, 한곳에");
  assert.equal(COVER_COPY.line1, "질문은 나만 먼저 답해요.");
  assert.equal(COVER_COPY.line2, "비교는 둘이 낸 뒤에만 열려요.");
  assert.equal(COVER_COPY.cta, "미리 질문 하나 보기");
  assert.equal(S2_KEEP_COPY.title, "이 답을 남기려면 로그인해 주세요");
  assert.equal(S2_KEEP_COPY.body, S2_COPY.body);
  assert.equal(coverHasInvite(), false);
  assert.equal(coverHasSignup(), false);
});

test("splash opens the workbook cover, not signup", () => {
  const state = finishSplash(createNativeFlow());
  assert.equal(state.screen, "cover");
  const cover = renderCoverScreen();
  assert.match(cover, /LoveMe/);
  assert.match(cover, /두 사람의 결혼 준비, 한곳에/);
  assert.match(cover, /질문은 나만 먼저 답해요\./);
  assert.match(cover, /비교는 둘이 낸 뒤에만 열려요\./);
  assert.match(cover, /미리 질문 하나 보기/);
  assert.match(cover, /loveme-cover-brand/);
  assert.match(cover, /loveme-cover-line/);
  assert.match(cover, /notebook/);
  assert.equal(cover.includes("파트너 초대"), false);
  assert.equal(cover.includes("로그인 링크 보내기"), false);
  assert.equal(cover.includes("카카오로 시작"), false);
  assert.equal(cover.includes("홈"), false);
  assert.equal(cover.includes("프로필"), false);
  assert.equal(cover.includes("선물"), false);
});

test("preview Q1 is offline and only the first question", () => {
  let state = openPreviewQ1(finishSplash(createNativeFlow()));
  assert.equal(state.screen, "preview-q1");
  const question = previewQ1Question();
  assert.equal(question.id, PREVIEW_Q1_ID);
  assert.equal(previewAllowsOnlyFirstQuestion(question.id), true);
  assert.equal(previewAllowsOnlyFirstQuestion("home-02"), false);
  state = selectPreviewChoice(state, question.choices[0].id);
  assert.equal(state.previewQ1.choiceId, question.choices[0].id);
  const html = renderPreviewQ1Screen({ choiceId: state.previewQ1.choiceId });
  assert.match(html, new RegExp(question.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.equal(html.includes("다음 질문"), false);
  assert.equal(html.includes("결혼 팩 시작하기"), false);
});

test("preview Q1 is the locked first marriage-pack question", () => {
  const question = previewQ1Question();
  const packQ1 = marriagePack.questions.find((item) => item.id === PREVIEW_Q1_ID);
  assert.equal(question.id, packQ1.id);
  assert.equal(question.title, packQ1.title);
  assert.deepEqual(question.choices.map((choice) => choice.id), packQ1.choices.map((choice) => choice.id));
});

test("keeping Q1 opens the login gate, not the cover", () => {
  const question = previewQ1Question();
  let state = keepPreviewAnswer(selectPreviewChoice(openPreviewQ1(finishSplash(createNativeFlow())), question.choices[1].id));
  assert.equal(state.screen, "signup");
  assert.notEqual(state.screen, "cover");
  const gate = renderS2SignupScreen();
  assert.match(gate, /이 답을 남기려면 로그인해 주세요/);
  assert.match(gate, /비밀번호 없이 이메일로 로그인 링크를 보내드려요/);
  assert.match(gate, /로그인 링크 보내기/);
  assert.match(gate, /loveme-gate-brand/);
  assert.match(gate, /placeholder="이메일"/);
  assert.equal(gate.includes("loveme-notebook"), false);
  assert.equal(gate.includes("카카오로 시작"), false);
  assert.equal(gate.includes("네이버로 시작"), false);
  assert.equal(gate.includes("Google로 시작"), false);
  assert.equal(gate.includes("미리 질문 하나 보기"), false);
  assert.equal(gate.includes("질문은 나만 먼저 답해요"), false);
});

test("Q1 draft persists across leave and returns after consume", () => {
  const data = new Map();
  const storage = {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); },
    removeItem(key) { data.delete(key); }
  };
  const question = previewQ1Question();
  const choiceId = question.choices[2].id;
  let state = selectPreviewChoice(openPreviewQ1(finishSplash(createNativeFlow())), choiceId, storage);
  state = keepPreviewAnswer(state, storage);
  const saved = readPreviewDraft(storage);
  assert.equal(saved.choiceId, choiceId);
  assert.equal(saved.keepAnswer, true);

  const resumed = finishSplash(createNativeFlow(undefined, { draft: readPreviewDraft(storage) }));
  assert.equal(resumed.screen, "signup");
  assert.equal(resumed.previewQ1.choiceId, choiceId);

  state = consumeSucceeded(resumed, {
    user: { id: "usr_1", email: "buyer@example.com" },
    notice: "no-local-draft",
    workspace: { id: "ws_1", role: "buyer", acceptedPartner: false }
  }, storage);
  assert.equal(resolveNativeScreen(state), "preview-q1");
  assert.equal(state.previewQ1.choiceId, choiceId);
  assert.equal(readPreviewDraft(storage).choiceId, choiceId);
  assert.equal(readPreviewDraft(storage).keepAnswer, false);
  assert.notEqual(state.screen, "notice");
  assert.notEqual(state.screen, "cover");

  assert.notEqual(state.screen, "pack-list");

  state = continueFromPreviewQ1(state, storage);
  assert.equal(state.screen, "invite");
  assert.equal(state.previewQ1.choiceId, choiceId);
  assert.equal(state.previewQ1.saved, true);
});

test("Expo cover and login gate do not add home, profile, gifts, or social", async () => {
  const screens = await readFile("mobile/src/screens.js", "utf8");
  const css = await readFile("mobile/s0-s2-s3-preview.css", "utf8");
  const cover = screens.slice(screens.indexOf("export function CoverScreen"), screens.indexOf("export function PreviewQ1Screen"));
  const signup = screens.slice(screens.indexOf("export function SignupScreen"), screens.indexOf("export function EmailBindScreen"));
  assert.match(cover, /COVER_COPY\.line1/);
  assert.match(cover, /COVER_COPY\.line2/);
  assert.match(cover, /NotebookGraphic/);
  assert.equal(cover.includes("초대"), false);
  assert.equal(cover.includes("signup"), false);
  assert.match(signup, /S2_KEEP_COPY\.title/);
  assert.equal(signup.includes("signup-kakao"), false);
  assert.equal(screens.includes("프로필"), false);
  assert.equal(screens.includes("선물"), false);
  assert.match(css, /\.loveme-cover-brand/);
  assert.match(css, /\.loveme-cover-line/);
  assert.equal(css.includes(".loveme-cover > p"), false);
});
