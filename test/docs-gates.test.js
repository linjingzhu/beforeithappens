import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("locked product gates are written into the three product docs", async () => {
  const spec = await readFile("docs/PRODUCT_SPEC.md", "utf8");
  const model = await readFile("docs/DATA_MODEL.md", "utf8");
  const ux = await readFile("docs/UX_CONTRACT.md", "utf8");
  for (const text of [spec, ux]) {
    assert.match(text, /두 사람의 결혼 준비, 한곳에/);
    assert.match(text, /비밀번호 없이 이메일로 로그인 링크를 보내드려요/);
    assert.match(text, /로그인 링크 보내기/);
    assert.match(text, /메일을 확인해 주세요\. 링크는 10분 동안만 유효해요/);
    assert.match(text, /이 기기 임시 답은 이어지지 않아요/);
    assert.match(text, /로그아웃 후 이 기기를 넘겨주세요/);
  }
  assert.match(spec, /No Kakao/);
  assert.match(spec, /ghost workspace/i);
  assert.match(spec, /local-simulator drafts are not migrated/i);
  assert.match(spec, /The invited partner is free/);
  assert.match(spec, /Payment and the 100-question lifecycle line are out of this slice/);
  assert.match(model, /7 days/);
  assert.match(model, /accepting user's email must equal the invite email/);
  assert.match(model, /PublicLock/);
  assert.match(model, /never mutates or reopens the same lock/);
  assert.match(model, /The invited partner is free/);
  assert.match(ux, /invite-waiting/);
  assert.match(ux, /The invited partner is free/);
  assert.match(ux, /파트너 초대/);
  assert.match(ux, /결혼 팩 시작하기/);
  assert.match(ux, /같은 메일로만 수락할 수 있어요/);
  assert.match(ux, /링크를 보내 파트너를 초대하세요/);
  assert.match(ux, /링크 복사/);
  assert.match(ux, /인스타그램/);
  assert.match(ux, /카카오톡/);
  assert.match(ux, /링크를 복사했어요/);
  assert.match(ux, /같은 폰에서 두 계정을 동시에 쓸 수는 없어요/);
  assert.match(ux, /초대 메일이 맞는지 다시 확인해 주세요/);
  assert.match(ux, /이메일 수정하고 다시 보내기/);
  assert.match(ux, /이 기기에 다른 계정으로 로그인되어 있어요/);
  assert.match(ux, /로그아웃하고 넘기기/);
  assert.match(spec, /링크를 보내 파트너를 초대하세요/);
  assert.match(spec, /초대 메일이 맞는지 다시 확인해 주세요/);
  assert.match(spec, /이 기기에 다른 계정으로 로그인되어 있어요/);
  assert.match(spec, /Do not add Kakao login/);
  assert.match(spec, /native join screen, store landing, or universal links/);
  assert.match(ux, /forbidden in the onboarding body/);
  assert.match(model, /The current slice persists/);
  assert.match(model, /AnswerRound/);
  assert.match(model, /PublicLock/);
  assert.match(model, /never mutates the existing lock/);
});

test("pack UI has no local-sim role switch and keeps handoff copy next to logout only", async () => {
  const app = await readFile("src/app.js", "utf8");
  const onboarding = await readFile("src/auth-ui.js", "utf8");
  assert.equal(app.includes("localStorage"), false);
  assert.equal(app.includes("STORAGE_KEY"), false);
  assert.equal(app.includes("saveState("), false);
  assert.equal(app.includes('data-action="handoff"'), false);
  assert.equal(app.includes("[data-role]"), false);
  assert.equal(app.includes("데모 기록 초기화"), false);
  assert.equal(app.includes("이 기기에 자동 저장돼요"), false);
  assert.match(app, /서버에 저장됨/);
  assert.match(app, /AUTH_COPY\.logoutHandoff/);
  assert.match(app, /INVITE_COPY\.draftBadge/);
  const onboardingFn = onboarding.slice(onboarding.indexOf("export function renderOnboarding"), onboarding.indexOf("export function renderSent"));
  assert.equal(onboardingFn.includes("logoutHandoff"), false);
  assert.equal(onboardingFn.includes("로그아웃 후 이 기기를 넘겨주세요"), false);
});

test("web invite drop-off does not add Kakao login, store landing, or universal links", async () => {
  const files = [
    await readFile("src/app.js", "utf8"),
    await readFile("src/auth.js", "utf8"),
    await readFile("src/auth-ui.js", "utf8"),
    await readFile("index.html", "utf8"),
    await readFile("server/app.mjs", "utf8")
  ];
  for (const text of files) {
    assert.equal(text.includes("Kakao.Auth"), false);
    assert.equal(text.includes("kauth.kakao.com"), false);
    assert.equal(text.includes("accounts.kakao.com"), false);
    assert.equal(text.includes("apple-app-site-association"), false);
    assert.equal(text.includes("assetlinks.json"), false);
    assert.equal(text.includes("apps.apple.com"), false);
    assert.equal(text.includes("play.google.com"), false);
  }
});
