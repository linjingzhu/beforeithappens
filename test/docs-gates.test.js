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
  assert.match(ux, /forbidden in the onboarding body/);
});
