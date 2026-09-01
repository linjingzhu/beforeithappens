import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PUBLISHED, SITE } from "../site/config.js";
import { SITE_COPY, renderIndex, renderQuestionPage } from "../site/render.js";
import { indexModel, pageModel } from "../site/content.js";
import { RESULT_COPY } from "../site/result-copy.js";
import { findPack } from "../src/packs.js";

/**
 * The brand faces are subsetted to the characters these pages actually say, which takes 9.6MB of
 * MaruBuri and Pretendard down to about 250KB. The cost is that new copy can name a character the
 * subset does not carry, and the failure is quiet: the browser falls back for that one glyph, so a
 * sentence renders in two typefaces and nobody notices until it is live.
 *
 * `site/brand/COVERAGE.txt` is what `scripts/build-brand-assets.py` asked the subsetter for, and it
 * verified the built fonts against it before writing this file. So checking the page text against
 * the manifest is checking it against the fonts, in plain Node, with none of that script's Python
 * packages needed in CI.
 */
function renderedCharacters() {
  const parts = [SITE.name, SITE.tagline];
  for (const entry of PUBLISHED) {
    parts.push(entry.title, entry.navTitle || "", entry.description, entry.lead);
    const pack = findPack(entry.packId);
    for (const section of pack.sections) parts.push(section.title);
    for (const question of pack.questions) {
      parts.push(question.title);
      for (const choice of question.choices) parts.push(choice.label);
    }
  }
  for (const copy of [SITE_COPY, RESULT_COPY]) {
    for (const value of Object.values(copy)) if (typeof value === "string") parts.push(value);
  }
  return new Set(parts.join(""));
}

test("the subsetted faces carry every character the site puts on a page", () => {
  const covered = new Set(readFileSync("site/brand/COVERAGE.txt", "utf8"));
  const missing = [...renderedCharacters()].filter((c) => !covered.has(c) && c.trim());
  assert.deepEqual(
    missing,
    [],
    `regenerate with \`python3 scripts/build-brand-assets.py\`; missing: ${missing.join("")}`
  );
});

test("the mark and the four faces are all present and small enough to send", () => {
  // A Korean face that was not subsetted is megabytes. This is the check that would have caught
  // shipping the app's originals by mistake.
  const files = [
    ["site/brand/logo.png", 40],
    ["site/brand/apple-touch-icon.png", 40],
    ["site/brand/favicon.ico", 40],
    ["site/brand/maruburi-400.woff2", 200],
    ["site/brand/maruburi-600.woff2", 200],
    ["site/brand/pretendard-400.woff2", 200],
    ["site/brand/pretendard-600.woff2", 200]
  ];
  let total = 0;
  for (const [path, maxKb] of files) {
    const bytes = readFileSync(path).length;
    total += bytes;
    assert.ok(bytes > 0, `${path} is not empty`);
    assert.ok(bytes / 1024 < maxKb, `${path} is ${(bytes / 1024).toFixed(0)}KB, over ${maxKb}KB`);
  }
  assert.ok(total / 1024 < 400, `the brand costs ${(total / 1024).toFixed(0)}KB on first load`);
});

test("the stylesheet declares the faces it preloads, and the app's typographic lock", () => {
  const css = readFileSync("site/site.css", "utf8");
  for (const face of ["maruburi-400", "maruburi-600", "pretendard-400", "pretendard-600"]) {
    assert.ok(css.includes(`/brand/${face}.woff2`), `${face} has an @font-face`);
  }
  // `.ai/PROJECT_CONTEXT.md`: titles and question stems MaruBuri; body, choices, buttons Pretendard.
  assert.match(css, /body \{[^}]*font-family: Pretendard/s, "body is Pretendard");
  assert.match(css, /\.q h2 \{[^}]*font-family: MaruBuri/s, "the question stem is MaruBuri");
  assert.match(css, /\.wordmark-name \{[^}]*font-family: MaruBuri/s, "the mark's name is MaruBuri");
  // Its second line is the sans face, so the two halves of the mark read as different weights of
  // the same thing rather than as one word in two serifs.
  assert.match(css, /\.wordmark-sub \{[^}]*font-family: Pretendard/s);
  // Every *use* of a family needs a real fallback: a reader whose browser refuses a webfont should
  // still get a sensible shape. The @font-face blocks are where a bare family name is the point, so
  // they are removed before scanning rather than special-cased inside it.
  const uses = css.replace(/@font-face \{[^}]*\}/g, "");
  for (const [, stack] of uses.matchAll(/font-family: (MaruBuri[^;]*|Pretendard[^;]*);/g)) {
    assert.ok(stack.includes(","), `"${stack}" has no fallback`);
  }
});

test("every page asks for the mark as its icon, and the .ico carries the size a tab draws", () => {
  // A tab with no icon is a blank square next to the name, and the browser asks for /favicon.ico
  // whether or not a page links one — so both the link and the root file have to exist.
  const site = { ...SITE, origin: "" };
  const published = PUBLISHED;
  const pages = [
    renderIndex(indexModel({ site, published }), site),
    renderQuestionPage(pageModel(published[0].slug, 1, { site, published }), site)
  ];
  for (const html of pages) {
    assert.match(html, /<link rel="icon" href="\/favicon\.ico"/, "the tab icon");
    assert.match(html, /<link rel="apple-touch-icon" href="\/brand\/apple-touch-icon\.png">/);
  }
  assert.match(readFileSync("scripts/build-site.mjs", "utf8"), /join\(OUT, "favicon\.ico"\)/);

  // The .ico holds 16, 32 and 48. A single 48 downsampled by the browser is what the drawing
  // cannot survive — the stroke is one hairline wide at 16px and averages away into grey.
  const ico = readFileSync("site/brand/favicon.ico");
  const widths = [];
  for (let i = 0; i < ico.readUInt16LE(4); i += 1) {
    // ICONDIR is 6 bytes, then one 16-byte entry per image, whose first byte is the width (0=256).
    widths.push(ico[6 + i * 16] || 256);
  }
  assert.deepEqual(widths.sort((a, b) => a - b), [16, 32, 48]);
});
