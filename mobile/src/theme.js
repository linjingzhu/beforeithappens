/**
 * The native palette. The values live in `src/design-tokens.js` (`PALETTES.loveme`) so the
 * app and the web surface cannot drift again; this module only keeps the names the screens
 * already call them by.
 */
import { PALETTES } from "../../src/design-tokens.js";

const loveme = PALETTES.loveme;
const ab = PALETTES.ab;

export const colors = Object.freeze({
  babyPink: loveme.accent,
  skyBlue: loveme.accentAlt,
  charcoal: loveme.ink,
  muted: loveme.muted,
  white: loveme.surface,
  line: loveme.line,
  card: loveme.card,
  error: loveme.error,
  /**
   * The S4 invite screen (`mobile/s4-invite/screens.js`) was drawn against the AB surface and
   * asks for `ink` / `paper` / `coral`. Those three names were never exported here, so every
   * rule using them resolved to `undefined`: the screen lost its ground, and its primary CTA —
   * white label on `colors.coral` — became white-on-nothing, i.e. an invisible
   * `초대 링크 만들기` button. `ink` and `paper` take the LoveMe values, matching the
   * `muted`/`line`/`card` that screen already resolves; `coral` has no LoveMe equivalent that
   * carries a white label, so it keeps the AB accent it was designed with.
   */
  ink: loveme.ink,
  paper: loveme.surface,
  coral: ab.accent
});

export const gradientVertical = `linear-gradient(180deg, ${loveme.accent} 0%, ${loveme.accentAlt} 100%)`;
export const gradientHorizontal = `linear-gradient(90deg, ${loveme.accent} 0%, ${loveme.accentAlt} 100%)`;
