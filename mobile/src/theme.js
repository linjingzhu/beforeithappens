/**
 * The native palette. The values live in `src/design-tokens.js` (`PALETTES.loveme`) so the
 * app and the web surface cannot drift again; this module only keeps the names the screens
 * already call them by.
 */
import { PALETTES } from "../../src/design-tokens.js";

const loveme = PALETTES.loveme;

export const colors = Object.freeze({
  babyPink: loveme.accent,
  skyBlue: loveme.accentAlt,
  charcoal: loveme.ink,
  muted: loveme.muted,
  white: loveme.surface,
  line: loveme.line,
  card: loveme.card,
  error: loveme.error
});

export const gradientVertical = `linear-gradient(180deg, ${loveme.accent} 0%, ${loveme.accentAlt} 100%)`;
export const gradientHorizontal = `linear-gradient(90deg, ${loveme.accent} 0%, ${loveme.accentAlt} 100%)`;
