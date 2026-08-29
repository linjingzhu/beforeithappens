import test from "node:test";
import assert from "node:assert/strict";
import { canStartPack, packReadyScreen, startPackDecision } from "../contract/pack-gate.js";
import { PACK_COPY } from "../contract/pack-copy.js";

test("S6 start CTA appears only after partner accept", () => {
  assert.equal(canStartPack({ user: null, workspace: { acceptedPartner: false } }), false);
  assert.equal(canStartPack({ user: { id: "u1" }, workspace: { acceptedPartner: false } }), false);
  assert.equal(canStartPack({ user: { id: "u1" }, workspace: {} }), false);
  assert.equal(canStartPack({ user: { id: "u1" }, workspace: { acceptedPartner: true } }), true);

  const locked = packReadyScreen({ user: { id: "u1" }, workspace: { acceptedPartner: false } });
  assert.equal(locked.screen, "locked");
  assert.equal(locked.canStart, false);
  assert.equal(locked.cta, "");
  assert.equal(locked.body, PACK_COPY.lockedBody);

  const ready = packReadyScreen({ user: { id: "u1", email: "a@b.c" }, workspace: { acceptedPartner: true, role: "buyer" } });
  assert.equal(ready.screen, "ready");
  assert.equal(ready.canStart, true);
  assert.equal(ready.cta, "발행 팩 시작하기");
  assert.equal(ready.title, "두 사람의 결혼 준비, 한곳에");
});

test("startPackDecision refuses ghost workspaces even if a client asks for state", () => {
  const session = { user: { id: "u1" }, workspace: { acceptedPartner: false } };
  const denied = startPackDecision(session, { ok: true, state: { index: 0 } });
  assert.equal(denied.ok, false);
  assert.equal(denied.error, "locked");

  const allowed = startPackDecision(
    { user: { id: "u1" }, workspace: { acceptedPartner: true } },
    { ok: true, state: { index: 0 } }
  );
  assert.equal(allowed.ok, true);
  assert.equal(allowed.screen, "question");

  const transport = startPackDecision(
    { user: { id: "u1" }, workspace: { acceptedPartner: true } },
    { ok: false, error: "failed" }
  );
  assert.equal(transport.ok, false);
  assert.equal(transport.screen, "ready");
  assert.equal(transport.error, "failed");
});
