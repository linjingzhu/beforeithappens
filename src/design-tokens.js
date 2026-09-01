/**
 * One source for the values both surfaces draw from.
 *
 * Colours were defined twice — `mobile/src/theme.js` and the `:root` block in
 * `src/styles.css` — and drifted. They stay two palettes here, because the LoveMe app and
 * the AB web product genuinely look different and unifying them is a brand decision, not a
 * refactor. What they now share is the shape: the same token names, the same scales, and
 * the same rules for adapting to a screen.
 */

export const PALETTES = Object.freeze({
  loveme: Object.freeze({
    ink: "#3A3338",
    muted: "#7A7278",
    surface: "#FFFFFF",
    card: "rgba(255, 255, 255, 0.72)",
    line: "rgba(58, 51, 56, 0.14)",
    accent: "#F6C8D8",
    accentAlt: "#B7D9F0",
    error: "#8C3A44"
  }),
  /*
   * Warm taupe under frosted glass, from the owner's second palette. The ground is the colour;
   * every panel is white laid over it at a fraction, which is what makes a card look like glass
   * rather than paper — and it is why `surface`, `card`, `soft` and `line` are alpha rather than
   * hex. A panel over a lighter part of the ground comes out lighter, exactly as in the reference.
   *
   * Text is dark, and that is the one place this parts company with the reference. White on glass
   * reads at 1.43:1 there, which is beautiful in a mock of eight buttons and unreadable in a
   * hundred Korean questions. Measured against the composite each sits on — glass #E4E0DB, the
   * recessed #D5CDC5, the bare ground #C4B9AE — `ink` reads 10.45 / 8.74 / 7.13 and `muted`
   * 6.64 / 5.55 / 4.52, so every one of them clears 4.5:1. `onInk` is the light text that goes the
   * other way, on a filled button, at 13.7:1.
   */
  ab: Object.freeze({
    ink: "#332c26",
    muted: "#544942",
    surface: "rgba(255, 255, 255, 0.55)",
    card: "rgba(255, 255, 255, 0.55)",
    line: "rgba(255, 255, 255, 0.6)",
    accent: "#6b5346",
    accentAlt: "#8a7566",
    error: "#8C3A44",
    paper: "#c4b9ae",
    soft: "rgba(255, 255, 255, 0.28)",
    onInk: "#f4f0ec",
    shadowLight: "rgba(255, 255, 255, 0.75)",
    shadowDark: "rgba(58, 45, 35, 0.28)"
  })
});

/** Steps a designer can name, sized from what the screens already use. */
export const TYPE_SCALE = Object.freeze({
  caption: 12,
  footnote: 13,
  body: 15,
  bodyLarge: 17,
  title: 22,
  display: 28,
  hero: 32
});

export const LINE_HEIGHT = Object.freeze({ tight: 1.25, normal: 1.5, relaxed: 1.75 });

/** A 4pt rhythm; every margin and pad should land on one of these. */
export const SPACE = Object.freeze({ xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 });

export const RADIUS = Object.freeze({ sm: 8, md: 12, lg: 20, pill: 999 });

/** Reuses the narration timing so motion feels like one system. */
export const MOTION = Object.freeze({ quick: 180, base: 320, gentle: 620, stagger: 420 });

/** Minimum touch target. Anything tappable must reach this on every device. */
export const HIT_SLOP_MIN = 44;

/** The width the current screens were drawn against. */
export const BASE_WIDTH = 390;

/**
 * Width classes. `compact` is an iPhone SE and the narrow half of a folded phone;
 * `wide` is a Pro Max; `tablet` is where a single column stops making sense.
 */
export const BREAKPOINTS = Object.freeze({ compact: 0, base: 360, wide: 430, tablet: 768 });

export function widthClass(width) {
  const value = Number(width) || 0;
  if (value >= BREAKPOINTS.tablet) return "tablet";
  if (value >= BREAKPOINTS.wide) return "wide";
  if (value >= BREAKPOINTS.base) return "base";
  return "compact";
}

/**
 * Type scales with the screen but never runs away with it: a Pro Max should feel roomier,
 * not 15% larger, and an SE must stay legible rather than shrink to fit.
 */
export function scaleFor(width, { min = 0.92, max = 1.12 } = {}) {
  const ratio = (Number(width) || BASE_WIDTH) / BASE_WIDTH;
  return Math.min(max, Math.max(min, Number(ratio.toFixed(4))));
}

export function fontSize(step, width) {
  const base = TYPE_SCALE[step] ?? Number(step) ?? TYPE_SCALE.body;
  return Math.round(base * scaleFor(width));
}

/**
 * Aspect ratio decides vertical breathing room, not width. A 20:9 phone can afford the
 * designed rhythm; a short or landscape window has to give some back or the primary action
 * falls below the fold.
 */
export function verticalDensity(width, height) {
  const w = Number(width) || BASE_WIDTH;
  const h = Number(height) || 844;
  const ratio = h / w;
  if (ratio < 1.4) return "short";
  if (ratio < 1.9) return "regular";
  return "tall";
}

export const DENSITY_SCALE = Object.freeze({ short: 0.7, regular: 1, tall: 1.12 });

export function space(step, { width, height } = {}) {
  const base = SPACE[step] ?? Number(step) ?? SPACE.md;
  if (width === undefined && height === undefined) return base;
  return Math.round(base * DENSITY_SCALE[verticalDensity(width, height)]);
}

/** The whole adaptive context in one call, so a screen asks once and lays out from it. */
export function layoutFor({ width = BASE_WIDTH, height = 844 } = {}) {
  return Object.freeze({
    width,
    height,
    widthClass: widthClass(width),
    density: verticalDensity(width, height),
    scale: scaleFor(width),
    maxContentWidth: width >= BREAKPOINTS.tablet ? 560 : width
  });
}
