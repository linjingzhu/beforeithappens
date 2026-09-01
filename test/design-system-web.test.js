import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  BREAKPOINTS,
  HIT_SLOP_MIN,
  PALETTES,
  TYPE_SCALE,
  verticalDensity
} from "../src/design-tokens.js";
import { renderTokensCss, WEB_PALETTE } from "../scripts/build-tokens.mjs";

const WEB_SHEETS = ["src/styles.css", "src/accessibility.css", "src/auth.css"];

const read = (path) => readFile(path, "utf8");

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** Type steps in scale order, under the names the generated sheet gives them. */
const STEPS = Object.entries(TYPE_SCALE).map(([step, px]) => ({ name: kebab(step), px }));

/** Resolves a token-only length expression to px at a given viewport width. */
function resolve(expression, width) {
  const inner = expression.trim().replace(/^calc\((.*)\)$/s, "$1");
  return inner.split("+").reduce((total, rawTerm) => {
    const term = rawTerm.trim();
    const vw = term.match(/^([\d.]+)vw$/);
    if (vw) return total + (Number(vw[1]) * width) / 100;
    const token = term.match(/^var\(--text-([a-z-]+)\)(?:\s*([*/])\s*([\d.]+))?$/);
    assert.ok(token, `unexpected term in a type ramp: ${term}`);
    const step = STEPS.find((candidate) => candidate.name === token[1]);
    assert.ok(step, `type ramp refers to a step the token module does not have: ${token[1]}`);
    if (!token[2]) return total + step.px;
    return total + (token[2] === "*" ? step.px * Number(token[3]) : step.px / Number(token[3]));
  }, 0);
}

/** `clamp(min, preferred, max)` split on top-level commas. */
function splitClamp(value) {
  const body = value.trim().replace(/^clamp\((.*)\)$/s, "$1");
  const parts = [];
  let depth = 0;
  let current = "";
  for (const character of body) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (character === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += character;
  }
  parts.push(current);
  assert.equal(parts.length, 3, `a fluid ramp needs three clamp arguments: ${value}`);
  return parts.map((part) => part.trim());
}

function typeRamps(css) {
  const ramps = new Map();
  for (const match of css.matchAll(/--type-([a-z-]+):\s*(clamp\([^;]+\));/g)) {
    ramps.set(match[1], splitClamp(match[2]));
  }
  return ramps;
}

/** The ratio at which verticalDensity() stops calling a viewport `from`. */
function densityBoundary(from) {
  let low = 1;
  let high = 4;
  for (let index = 0; index < 60; index += 1) {
    const middle = (low + high) / 2;
    if (verticalDensity(1000, 1000 * middle) === from) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

test("the CSS custom properties are generated from the token module, not restated", async () => {
  const onDisk = await read("src/tokens.css");
  assert.equal(
    onDisk,
    renderTokensCss(),
    "src/tokens.css is stale — run `node scripts/build-tokens.mjs` after editing src/design-tokens.js"
  );

  assert.equal(WEB_PALETTE, "ab", "the web product renders in the ab palette");
  for (const [key, value] of Object.entries(PALETTES.ab)) {
    assert.match(onDisk, new RegExp(`--ab-${kebab(key)}: ${value.replace(/[()]/g, "\\$&")};`));
  }
  for (const [key, value] of Object.entries(PALETTES.loveme)) {
    assert.match(onDisk, new RegExp(`--loveme-${kebab(key)}: ${value.replace(/[()]/g, "\\$&")};`));
  }
  for (const [step, px] of Object.entries(TYPE_SCALE)) {
    assert.match(onDisk, new RegExp(`--text-${kebab(step)}: ${px}px;`));
  }
  assert.match(onDisk, new RegExp(`--hit-slop-min: ${HIT_SLOP_MIN}px;`));
  for (const [name, px] of Object.entries(BREAKPOINTS)) {
    assert.match(onDisk, new RegExp(`--breakpoint-${name}: ${px}px;`));
  }
});

test("a palette change reaches the generated sheet, so the two cannot drift apart", () => {
  const before = renderTokensCss();
  assert.ok(before.includes(PALETTES.ab.accent), "the generator reads the live palette");
  assert.ok(before.includes(PALETTES.loveme.accent));
  assert.equal(
    before.includes("--ink: var(--ab-ink);"),
    true,
    "the shared names point at the palette rather than carrying their own value"
  );
});

test("the web stylesheets keep no palette of their own", async () => {
  const styles = await read("src/styles.css");
  assert.match(styles, /@import url\("\.\/tokens\.css"\);/);
  assert.equal(/:root\s*{[^}]*--ink:\s*#/.test(styles), false, "styles.css must not redeclare a palette");

  for (const path of WEB_SHEETS) {
    const css = await read(path);
    for (const value of Object.values(PALETTES.ab)) {
      assert.equal(
        css.toLowerCase().includes(value.toLowerCase()),
        false,
        `${path} writes the token colour ${value} out by hand`
      );
    }
  }
});

test("type is fluid between token steps rather than pinned to a pixel", async () => {
  const styles = await read("src/styles.css");
  const ramps = typeRamps(styles);
  assert.ok(ramps.size >= 6, "the web surface needs a ramp per named step it uses");

  for (const [name, [min, , max]] of ramps) {
    const lower = min.match(/^var\(--text-([a-z-]+)\)$/);
    const upper = max.match(/^var\(--text-([a-z-]+)\)$/);
    if (lower && upper) {
      const from = STEPS.findIndex((step) => step.name === lower[1]);
      const to = STEPS.findIndex((step) => step.name === upper[1]);
      assert.ok(from >= 0 && to >= 0, `--type-${name} names a step the token module does not have`);
      assert.equal(to, from + 1, `--type-${name} should run between neighbouring steps of TYPE_SCALE`);
    } else {
      assert.match(max, /var\(--text-hero\)/, `--type-${name} must still be derived from the top step`);
    }

    const floor = resolve(min, 0);
    const ceiling = resolve(max, 0);
    assert.ok(floor < ceiling, `--type-${name} has an inverted range`);
    assert.ok(
      floor >= TYPE_SCALE.caption,
      `--type-${name} floors at ${floor}px, below the smallest step a designer named`
    );

    const at = (width) => Math.min(ceiling, Math.max(floor, resolve(ramps.get(name)[1], width)));
    assert.ok(at(375) < at(1180), `--type-${name} does not grow with the viewport`);
    assert.ok(at(320) >= floor, `--type-${name} shrinks below its own step on a small phone`);
    assert.equal(at(2560), ceiling, `--type-${name} must stop growing at its upper step`);

    const widths = [];
    for (let width = 320; width <= 2560; width += 4) widths.push(width);
    assert.ok(
      widths.some((width) => at(width) > floor && at(width) < ceiling),
      `--type-${name} is a fixed size dressed as a clamp: it never lands between its two steps`
    );
  }

  for (const path of WEB_SHEETS) {
    const css = (await read(path)).replace(/\/\*[\s\S]*?\*\//g, "");
    const fixed = [
      ...css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g),
      ...css.matchAll(/\bfont:\s*(?:\d+\s+)?(\d+(?:\.\d+)?)px/g)
    ];
    assert.deepEqual(fixed.map((match) => match[0]), [], `${path} still sets type in absolute pixels`);
  }
});

test("the layout answers to every token breakpoint, not one hand-picked width", async () => {
  const styles = await read("src/styles.css");
  for (const name of ["base", "wide", "tablet"]) {
    assert.match(
      styles,
      new RegExp(`@media \\(min-width: ${BREAKPOINTS[name]}px\\)`),
      `no rules respond at the ${name} breakpoint (${BREAKPOINTS[name]}px)`
    );
  }

  assert.match(styles, /@media \(min-width: 768px\)[\s\S]*grid-template-columns: 1fr minmax/, "the journey stays one column until tablet");
  assert.match(styles, /\.question-shell\s*{[^}]*grid-template-columns: 1fr;/, "the question shell starts as one column");
  assert.match(styles, /@media \(min-width: 768px\)[\s\S]*\.chapter-nav\s*{[^}]*border-right/, "the chapter rail only becomes a rail at tablet");

  for (const path of [...WEB_SHEETS, "src/tokens.css"]) {
    const css = await read(path);
    assert.equal(css.includes("@media (max-width: 760px)"), false, `${path} still uses the old ad-hoc 760px breakpoint`);
    assert.equal(css.includes("@media (max-width: 460px)"), false, `${path} still uses the old ad-hoc 460px breakpoint`);
  }
  for (const path of ["src/accessibility.css", "src/auth.css"]) {
    const css = await read(path);
    assert.match(css, /@media \(max-width: 767\.98px\)/, `${path} should hand over at the tablet breakpoint`);
  }
});

test("a short or landscape viewport keeps the primary action reachable", async () => {
  const styles = await read("src/styles.css");

  const short = styles.match(/@media \(min-aspect-ratio: (\d+) \/ (\d+)\)\s*{\s*:root\s*{\s*--density: var\(--density-short\);/);
  assert.ok(short, "no aspect-ratio rule swaps in the short density");
  assert.ok(
    Math.abs(Number(short[1]) / Number(short[2]) - 1 / densityBoundary("short")) < 0.001,
    "the short-viewport query does not sit at the ratio verticalDensity() calls short"
  );

  const tall = styles.match(/@media \(max-aspect-ratio: (\d+) \/ (\d+)\)\s*{\s*:root\s*{\s*--density: var\(--density-tall\);/);
  assert.ok(tall, "no aspect-ratio rule swaps in the tall density");
  assert.ok(
    Math.abs(Number(tall[1]) / Number(tall[2]) - 1 / densityBoundary("regular")) < 0.001,
    "the tall-viewport query does not sit at the ratio verticalDensity() calls tall"
  );

  const fold = styles.match(/@media \(max-height: \d+px\) and \(min-aspect-ratio: \d+ \/ \d+\)\s*{([\s\S]*?)\n}/);
  assert.ok(fold, "nothing protects the fold on a short window");
  assert.match(fold[1], /\.actions\s*{[^}]*position: sticky;[^}]*bottom: 0;/, "the action row must stay on screen when the window is short");
  assert.match(fold[1], /\.actions\s*{[^}]*padding:[^}]*var\(--safe-bottom\)/, "the stuck action row must clear the home indicator");
  assert.match(fold[1], /\.question-shell\s*{\s*min-height: 0;/, "the shell must stop reserving a screen of height when there is none");
  assert.match(fold[1], /\.journey h1\s*{\s*font-size: var\(--type-headline\);/, "the hero must give height back on a short window");

  assert.ok(
    styles.indexOf("--density: var(--density-regular);") < styles.indexOf("--density: var(--density-short);"),
    "the regular density must be the default the aspect-ratio queries override"
  );
});

test("viewport height and the safe area are handled the way a phone browser needs", async () => {
  const styles = await read("src/styles.css");
  const heights = [...styles.matchAll(/min-height:[^;]*?(100dvh|100vh)/g)].map((match) => match[1]);
  assert.ok(heights.includes("100dvh"), "the page must size itself with dvh");
  assert.ok(heights.includes("100vh"), "a browser without dvh still needs a fallback");
  for (const [index, unit] of heights.entries()) {
    if (unit !== "100dvh") continue;
    assert.equal(heights[index - 1], "100vh", "every dvh height needs the vh fallback declared before it");
  }

  for (const side of ["top", "right", "bottom", "left"]) {
    assert.match(styles, new RegExp(`--safe-${side}: env\\(safe-area-inset-${side}, 0px\\);`));
  }
  assert.match(styles, /\.topbar\s*{[^}]*padding: var\(--safe-top\)/, "the top bar must clear the notch");
  assert.match(styles, /footer\s*{[^}]*var\(--safe-bottom\)/, "the footer must clear the home indicator");
  assert.match(styles, /--gutter-left: calc\(var\(--gutter\) \+ var\(--safe-left\)\);/);
});

test("hit targets and spacing come off the token scale", async () => {
  const styles = await read("src/styles.css");
  assert.match(styles, /\.chapter\s*{[^}]*min-height: var\(--hit-slop-min\);/);
  assert.match(styles, /\.actions button\s*{[^}]*min-height: var\(--hit-slop-min\);/);
  assert.match(styles, /footer button\s*{[^}]*min-height: var\(--hit-slop-min\);/);

  const rhythm = ["--v-sm", "--v-md", "--v-lg", "--v-xl", "--v-xxl", "--v-xxxl"];
  for (const name of rhythm) {
    assert.match(
      styles,
      new RegExp(`${name}: calc\\(var\\(--space-[a-z]+\\) \\* var\\(--density\\)\\);`),
      `${name} should scale a token space step by the density`
    );
  }
});

test("the native preview harness draws from the loveme palette in the same token sheet", async () => {
  const preview = await read("mobile/s0-s2-s3-preview.css");
  assert.match(preview, /@import url\("\.\.\/src\/tokens\.css"\);/);
  for (const [key, value] of Object.entries(PALETTES.loveme)) {
    assert.equal(
      preview.includes(value),
      false,
      `the preview writes the loveme ${key} colour out by hand instead of using the token`
    );
    assert.match(preview, new RegExp(`var\\(--loveme-${kebab(key)}\\)`), `the preview never reads --loveme-${kebab(key)}`);
  }
  assert.match(preview, /--gradient: linear-gradient\(180deg, var\(--baby-pink\) 0%, var\(--sky-blue\) 100%\);/);
  assert.match(preview, /safe-area-inset-top/);
  assert.match(preview, /safe-area-inset-bottom/);
});

test("the generated sheet reaches dist without a build step of its own", async () => {
  const build = await read("scripts/build.mjs");
  assert.match(build, /cp\("src", "dist\/src", \{ recursive: true \}\)/, "the whole src folder ships, generated CSS included");
  const index = await read("index.html");
  assert.match(index, /<link rel="stylesheet" href="\/src\/styles\.css" \/>/, "styles.css is the entry that imports the tokens");
});
