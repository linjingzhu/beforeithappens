#!/usr/bin/env node
/**
 * Records the date each page's content last changed, into `site/content-stamp.json`.
 *
 * Run it after changing anything a reader reads — a question, a Part's name, the prose on 소개, the
 * home page's own words — and commit the result beside the change. `test/site.test.js` fails while
 * the two disagree, so this is not something to remember: the build tells you.
 *
 * What it does is narrow on purpose. It compares today's content hashes against the stamped ones
 * and writes today's date **only** where a hash moved. Every other date is carried across exactly
 * as it was, because a sitemap whose dates all change together tells a crawler nothing.
 *
 * Run: node scripts/stamp-content.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { contentHashes } from "../site/stamp.js";

const FILE = "site/content-stamp.json";

const previous = await readFile(FILE, "utf8").then(JSON.parse).catch(() => ({}));
const hashes = contentHashes();

// UTC, and the date alone: the sitemap spec takes a W3C datetime, and a date is one. An hour would
// claim a precision this does not have — the stamp knows what changed, not when it was written.
const today = new Date().toISOString().slice(0, 10);

const stamp = {};
const moved = [];
// Sorted, so a diff of this file shows what changed rather than what got reordered.
for (const path of Object.keys(hashes).sort()) {
  const before = previous[path];
  if (before && before.hash === hashes[path]) {
    stamp[path] = before;
    continue;
  }
  stamp[path] = { hash: hashes[path], date: today };
  moved.push(path);
}

const dropped = Object.keys(previous).filter((path) => !(path in hashes));

await writeFile(FILE, `${JSON.stringify(stamp, null, 2)}\n`);

console.log(`${FILE}: ${Object.keys(stamp).length} pages`);
if (moved.length) console.log(`  dated ${today}: ${moved.join(", ")}`);
else console.log("  nothing changed");
if (dropped.length) console.log(`  dropped: ${dropped.join(", ")}`);
