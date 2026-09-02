import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The cheapest checks worth running on every source file: it is not empty, and its line endings are
 * not CRLF.
 *
 * The list of files used to be written out here by hand, and by the time it was replaced it was six
 * files out of date — `site/pages.js`, the three copy modules the browser loads, and both halves of
 * the content stamp were all outside it. That is the same shape of miss as the font scanner's, and
 * the same fix: walk the directories rather than name what is in them, so a file added tomorrow is
 * covered without anyone remembering this file exists.
 */
const ROOTS = ["src", "site", "server", "scripts", "mobile"];
const EXTENSIONS = [".js", ".mjs", ".css", ".html"];
// Generated, vendored or checked out — none of it is this repository's source to hold to a rule.
const SKIP = new Set(["node_modules", "dist", "data", "assets", ".expo", "build"]);

async function sources(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || SKIP.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await sources(path));
    else if (EXTENSIONS.some((extension) => entry.name.endsWith(extension))) found.push(path);
  }
  return found;
}

const files = ["index.html"];
for (const root of ROOTS) files.push(...await sources(root));

for (const file of files.sort()) {
  const value = await readFile(file, "utf8");
  if (!value.trim()) throw new Error(`${file} is empty`);
  if (value.includes("\r\n")) throw new Error(`${file} uses CRLF line endings`);
}
console.log(`Checked ${files.length} source files`);
