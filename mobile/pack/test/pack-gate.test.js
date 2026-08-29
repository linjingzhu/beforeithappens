import test from "node:test";
import assert from "node:assert/strict";
import { canContinuePack, canStartPack, packReadyScreen, requiresPaywall, startPackDecision } from "../contract/pack-gate.js";
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
  assert.equal(ready.cta, "결혼 팩 시작하기");
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

test("S7–S8 stay open after sample locks and never require 29000 KRW", () => {
  const paired = { user: { id: "u1" }, workspace: { acceptedPartner: true } };
  assert.equal(requiresPaywall(0), false);
  assert.equal(requiresPaywall(3), false);
  assert.equal(requiresPaywall(12), false);
  assert.equal(canContinuePack(paired, { lockCount: 3 }), true);
  assert.equal(canContinuePack(paired, { lockCount: 12 }), true);
  assert.equal(canContinuePack({ user: { id: "u1" }, workspace: { acceptedPartner: false } }, { lockCount: 3 }), false);
});
