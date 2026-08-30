import test from "node:test";
import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";

test("API listen uses PORT or 4173 and npm start runs the Node server", async () => {
  const source = await readFile("scripts/server.mjs", "utf8");
  const pkg = JSON.parse(await readFile("package.json", "utf8"));
  assert.match(source, /Number\(process\.env\.PORT\)\s*\|\|\s*4173/);
  assert.equal(pkg.scripts.start, "node scripts/server.mjs");
  assert.equal(pkg.scripts.dev, "node scripts/server.mjs");
  assert.equal(source.includes("EXPO_PUBLIC_API_ORIGIN"), false);
  assert.equal(source.includes("https://"), false);
  assert.equal(JSON.stringify(pkg).includes("EXPO_PUBLIC_API_ORIGIN"), false);
  assert.equal(source.includes("Dockerfile"), false);
  await assert.rejects(() => access("Dockerfile"));
});
