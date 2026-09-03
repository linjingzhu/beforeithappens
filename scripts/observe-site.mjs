#!/usr/bin/env node
/**
 * The runtime gate: build the site, serve it, and look at it.
 *
 * `.ai/PROJECT_CONTEXT.md` names this script as `runtime_gate`. It builds `site/dist/`, serves it
 * on a free port, opens the pages a reader lands on at the two widths the product is measured at,
 * and writes screenshots to `.observe/` for a person to look at. Exit status 0 means every page
 * answered 200 and every screenshot was written — it does not mean the pages look right; that is
 * what the screenshots are for.
 *
 * Playwright is not a dependency of this repository (it has none). The script finds it through
 * `PLAYWRIGHT_MODULE` (a path to playwright's `index.mjs`), then a plain import, and says how to
 * install it when neither works. `PLAYWRIGHT_CHROMIUM` points at a browser binary when the
 * bundled one is elsewhere.
 */
import { spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DIST = join(ROOT, "site/dist");
const OUT = join(ROOT, ".observe");
const PAGES = ["/", "/marriage/", "/about/", "/privacy/"];
const WIDTHS = [1280, 390];
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".xml": "application/xml", ".txt": "text/plain", ".ico": "image/x-icon" };

async function loadPlaywright() {
  const candidates = [process.env.PLAYWRIGHT_MODULE, "playwright", "/opt/node22/lib/node_modules/playwright/index.mjs"].filter(Boolean);
  for (const spec of candidates) {
    try { return await import(spec); } catch { /* next */ }
  }
  console.error("playwright not found. Install it somewhere and point PLAYWRIGHT_MODULE at its index.mjs, e.g.\n  npm i -g playwright && PLAYWRIGHT_MODULE=$(npm root -g)/playwright/index.mjs node scripts/observe-site.mjs");
  process.exit(2);
}

const build = spawnSync(process.execPath, [join(ROOT, "scripts/build-site.mjs")], { stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);

const server = createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (path.endsWith("/")) path += "index.html";
  const file = join(DIST, path);
  try {
    if ((await stat(file)).isDirectory()) throw new Error("dir");
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404); res.end("not found");
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const { chromium } = await loadPlaywright();
const executablePath = process.env.PLAYWRIGHT_CHROMIUM || (existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined);
const browser = await chromium.launch({ executablePath });
await mkdir(OUT, { recursive: true });
let failures = 0;
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  for (const route of PAGES) {
    const response = await page.goto(origin + route, { waitUntil: "load" });
    const status = response?.status();
    const name = `${route === "/" ? "home" : route.replace(/\//g, "").replace(/^$/, "home")}-${width}.png`;
    if (status !== 200) { failures++; console.log(`FAIL ${route} → ${status}`); continue; }
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: join(OUT, name), fullPage: true });
    console.log(`ok   ${route} @${width} → .observe/${name}`);
  }
  await page.close();
}
await browser.close();
server.close();
console.log(failures ? `${failures} page(s) failed` : `all ${PAGES.length * WIDTHS.length} screenshots written to .observe/ — now look at them`);
process.exit(failures ? 1 : 0);
