import test from "node:test";
import assert from "node:assert/strict";
import {
  S9_COPY,
  S9_FORBIDDEN_SCREENS,
  S9_ONBOARDING_BODY,
  S9_PLACEMENT,
  handoffAllowedAt,
  onboardingBodyContainsHandoff
} from "./copy.js";

test("S9 handoff copy is exact and logout-only", () => {
  assert.equal(S9_COPY.logoutHandoff, "로그아웃 후 이 기기를 넘겨주세요.");
  assert.equal(S9_PLACEMENT.host, "logout-control");
  assert.equal(handoffAllowedAt("logout-control"), true);
  assert.equal(handoffAllowedAt("onboarding-body"), false);
  assert.equal(handoffAllowedAt("same-session-fail"), false);
});

test("device-handoff copy is forbidden in the onboarding body", () => {
  assert.equal(S9_ONBOARDING_BODY, "비밀번호 없이 이메일로 로그인 링크를 보내드려요.");
  assert.equal(onboardingBodyContainsHandoff(S9_ONBOARDING_BODY), false);
  assert.equal(onboardingBodyContainsHandoff(`${S9_ONBOARDING_BODY}\n${S9_COPY.logoutHandoff}`), true);
  assert.equal(S9_ONBOARDING_BODY.includes(S9_COPY.logoutHandoff), false);
});

test("S9 does not own the same-session fail screen copy", () => {
  assert.equal(S9_FORBIDDEN_SCREENS.otherSession, "이 기기에 다른 계정으로 로그인되어 있어요.");
  assert.equal(S9_FORBIDDEN_SCREENS.logoutContinue, "로그아웃하고 넘기기");
  assert.equal(Object.values(S9_COPY).includes(S9_FORBIDDEN_SCREENS.otherSession), false);
  assert.equal(Object.values(S9_COPY).includes(S9_FORBIDDEN_SCREENS.logoutContinue), false);
});
