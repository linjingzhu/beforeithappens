import test from "node:test";
import assert from "node:assert/strict";
import { developmentHistory, developmentStages, developmentSummary } from "../src/development.js";

test("development dashboard has one explicit next stage", () => {
  const summary = developmentSummary();
  assert.equal(developmentStages.filter((stage) => stage.status === "next").length, 1);
  assert.equal(summary.next.id, "payment");
  assert.equal(summary.complete, 8);
  assert.equal(summary.total, 10);
});

test("development stage and history identities are usable", () => {
  assert.equal(new Set(developmentStages.map((stage) => stage.id)).size, developmentStages.length);
  assert.ok(developmentHistory.length > 0);
  assert.ok(developmentHistory.every((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date)));
});
