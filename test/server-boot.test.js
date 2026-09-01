import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import http from "node:http";

/**
 * scripts/server.mjs was only ever read as text, so a reordering that made it throw
 * `Cannot access 'pack' before initialization` passed every check and would have taken the
 * deployed service down on its next boot. This starts the real entry point.
 */
function get(port, path) {
  return new Promise((resolve, reject) => {
    const request = http.get({ host: "127.0.0.1", port, path, timeout: 5000 }, (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, body }));
    });
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error("timed out")));
  });
}

async function waitForBoot(port, child, stderr) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`server exited ${child.exitCode}: ${stderr.text}`);
    try {
      return await get(port, "/healthz");
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`server never answered: ${stderr.text}`);
}

test("the real server entry point boots and answers", async () => {
  const dir = await mkdtemp(join(tmpdir(), "ab-boot-"));
  const port = 4300 + Math.floor(Math.random() * 400);
  const child = spawn(process.execPath, ["scripts/server.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), AB_STORE_PATH: join(dir, "store.json"), NODE_ENV: "" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const stderr = { text: "" };
  child.stderr.on("data", (chunk) => { stderr.text += chunk; });
  child.stdout.on("data", () => {});

  try {
    const health = await waitForBoot(port, child, stderr);
    assert.equal(health.status, 200, `health check failed: ${stderr.text}`);
    assert.match(health.body, /"ok":true/);
    assert.match(health.body, /"service":"ab"/);

    // A route from every module the entry point wires, so a missing dependency shows up here.
    const session = await get(port, "/api/auth/session");
    assert.equal(session.status, 200, "auth is wired");

    const pack = await get(port, "/api/pack/state");
    assert.equal(pack.status, 401, "answers is wired and refuses an anonymous caller");

    const report = await get(port, "/api/report");
    assert.equal(report.status, 401, "report is wired and refuses an anonymous caller");

    assert.equal(stderr.text.includes("before initialization"), false, "no temporal dead zone at boot");
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => child.once("exit", resolve));
    await rm(dir, { recursive: true, force: true });
  }
});
