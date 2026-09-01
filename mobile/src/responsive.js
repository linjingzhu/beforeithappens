/**
 * The adaptive layer between the shared design tokens and React Native.
 *
 * `StyleSheet.create` runs once at module load, so a sheet written with absolute numbers
 * renders the same on a 375×667 SE as on a 430×932 Pro Max. Screens here declare their sheet
 * as a *builder* — a pure function of the token tools for the current window — and read it
 * through the hook `createStyles` returns. The builder re-runs only when the window changes,
 * and the result is cached per size so several screens at the same size share one sheet.
 *
 * No design value is defined here. Everything comes from `src/design-tokens.js`; this module
 * only binds those helpers to the live window and to the native palette/font names.
 */
import { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  HIT_SLOP_MIN,
  LINE_HEIGHT,
  MOTION,
  RADIUS,
  fontSize,
  layoutFor,
  space
} from "../../src/design-tokens.js";
import { colors } from "./theme.js";
import { fonts } from "./fonts.js";

/** How many window sizes we keep built sheets for (portrait, landscape, a split view or two). */
const SHEET_CACHE_LIMIT = 8;

/** The adaptive context for the current window: width class, density, scale, content width. */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  return useMemo(() => layoutFor({ width, height }), [width, height]);
}

/**
 * The tools a sheet builder is handed. Deliberately the only vocabulary a screen gets:
 *
 * - `font(step)` / `lineHeight(step, ratio)` — type from `TYPE_SCALE`, scaled and clamped by width.
 * - `space(step)` — vertical rhythm; `verticalDensity` gives a short screen its margins back.
 * - `gutter(step)` — horizontal padding; the same on every phone, because aspect ratio is a
 *   vertical question (see the note on `verticalDensity` in the token module).
 * - `hit` — the floor every tappable target has to reach; control heights are built up from it.
 */
export function styleTools(layout) {
  return {
    layout,
    colors,
    fonts,
    radius: RADIUS,
    motion: MOTION,
    hit: HIT_SLOP_MIN,
    hairline: StyleSheet.hairlineWidth,
    font: (step) => fontSize(step, layout.width),
    lineHeight: (step, ratio = "normal") => Math.round(fontSize(step, layout.width) * LINE_HEIGHT[ratio]),
    space: (step) => space(step, layout),
    gutter: (step) => space(step)
  };
}

/**
 * Turns a sheet builder into a hook. Call it once per component:
 * `const styles = useStyles();`
 */
export function createStyles(build) {
  const cache = new Map();
  return function useStyles() {
    const layout = useLayout();
    return useMemo(() => {
      const key = `${layout.width}x${layout.height}`;
      let sheet = cache.get(key);
      if (!sheet) {
        sheet = StyleSheet.create(build(styleTools(layout)));
        if (cache.size >= SHEET_CACHE_LIMIT) cache.delete(cache.keys().next().value);
        cache.set(key, sheet);
      }
      return sheet;
    }, [layout]);
  };
}
