/**
 * Generates `src/tokens.css` from `src/design-tokens.js`.
 *
 * The web surface has no CSS build step and no runtime dependencies, so the custom
 * properties the stylesheets use are written out once, here, instead of being restated by
 * hand in a `:root` block. `test/design-system-web.test.js` re-renders this output and
 * compares it with the file on disk, so a change to the token module that is not carried
 * into CSS fails the suite rather than drifting quietly — which is exactly how the two
 * palettes came apart in the first place.
 *
 * Run: `node scripts/build-tokens.mjs`
 */

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import {
  BASE_WIDTH,
  BREAKPOINTS,
  DENSITY_SCALE,
  HIT_SLOP_MIN,
  LINE_HEIGHT,
  MOTION,
  PALETTES,
  RADIUS,
  SPACE,
  TYPE_SCALE
} from "../src/design-tokens.js";

/** The palette the AB web product renders in. The other palette ships as reference vars. */
export const WEB_PALETTE = "ab";

/**
 * Names the stylesheets already use for two AB colours. Keeping them as aliases means the
 * token module stays the only place a colour is written down, without a rename sweep
 * through markup-owning files this worker does not own.
 */
const LEGACY_COLOUR_ALIASES = Object.freeze({ coral: "accent", green: "accent-alt" });

export const TOKENS_CSS_URL = new URL("../src/tokens.css", import.meta.url);

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** `0.7` not `0.7000000000000001`, and `1` not `1.0`, so output is stable to compare. */
const num = (value) => String(Number(value.toFixed(4)));

const section = (title) => `  /* ${title} */`;

const decl = (name, value) => `  --${name}: ${value};`;

function paletteVars(prefix, palette) {
  return Object.entries(palette).map(([key, value]) => decl(`${prefix}-${kebab(key)}`, value));
}

function activePaletteVars(palette) {
  const lines = Object.keys(palette).map((key) => decl(kebab(key), `var(--${WEB_PALETTE}-${kebab(key)})`));
  for (const [alias, target] of Object.entries(LEGACY_COLOUR_ALIASES)) {
    lines.push(decl(alias, `var(--${target})`));
  }
  return lines;
}

export function renderTokensCss() {
  const lines = [
    "/*",
    " * GENERATED FILE — do not edit.",
    " * Source: src/design-tokens.js · Generator: scripts/build-tokens.mjs",
    " * Regenerate with `node scripts/build-tokens.mjs`; test/design-system-web.test.js",
    " * fails when this file and the token module disagree.",
    " */",
    "",
    ":root {",
    section(`palette · ${WEB_PALETTE} (the AB web product)`),
    ...paletteVars(WEB_PALETTE, PALETTES[WEB_PALETTE]),
    "",
    section("palette · loveme (the native screens and their browser preview)"),
    ...paletteVars("loveme", PALETTES.loveme),
    "",
    section(`active palette · ${WEB_PALETTE}`),
    ...activePaletteVars(PALETTES[WEB_PALETTE]),
    "",
    section("type scale · a step is a size a designer can name"),
    ...Object.entries(TYPE_SCALE).map(([step, size]) => decl(`text-${kebab(step)}`, `${size}px`)),
    "",
    section("line height"),
    ...Object.entries(LINE_HEIGHT).map(([step, value]) => decl(`leading-${kebab(step)}`, num(value))),
    "",
    section("space · a 4pt rhythm"),
    ...Object.entries(SPACE).map(([step, value]) => decl(`space-${kebab(step)}`, `${value}px`)),
    "",
    section("radius"),
    ...Object.entries(RADIUS).map(([step, value]) => decl(`radius-${kebab(step)}`, `${value}px`)),
    "",
    section("motion"),
    ...Object.entries(MOTION).map(([step, value]) => decl(`motion-${kebab(step)}`, `${value}ms`)),
    "",
    section("layout constants"),
    decl("hit-slop-min", `${HIT_SLOP_MIN}px`),
    decl("base-width", `${BASE_WIDTH}px`),
    "",
    section("width classes · media queries cannot read a var, so these document the ladder"),
    ...Object.entries(BREAKPOINTS).map(([step, value]) => decl(`breakpoint-${kebab(step)}`, `${value}px`)),
    "",
    section("vertical density · how much breathing room an aspect ratio can afford"),
    ...Object.entries(DENSITY_SCALE).map(([step, value]) => decl(`density-${kebab(step)}`, num(value))),
    "}",
    ""
  ];
  return lines.join("\n");
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  await writeFile(TOKENS_CSS_URL, renderTokensCss());
  console.log(`Wrote ${fileURLToPath(TOKENS_CSS_URL)} from src/design-tokens.js`);
}
