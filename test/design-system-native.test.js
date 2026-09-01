import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  BASE_WIDTH,
  HIT_SLOP_MIN,
  LINE_HEIGHT,
  MOTION,
  PALETTES,
  RADIUS,
  SPACE,
  TYPE_SCALE,
  fontSize,
  layoutFor,
  space
} from "../src/design-tokens.js";
import { colors, gradientHorizontal, gradientVertical } from "../mobile/src/theme.js";

const SCREEN_FILES = ["mobile/src/screens.js", "mobile/pack/screens.js", "mobile/paywall/screens.js"];

/** The four faces the designer font lock allows; `mobile/src/fonts.js` declares them. */
const FONTS = { title: "MaruBuri", titleStrong: "MaruBuri-SemiBold", body: "Pretendard", bodyStrong: "Pretendard-SemiBold" };
const MARUBURI = [FONTS.title, FONTS.titleStrong];
const PRETENDARD = [FONTS.body, FONTS.bodyStrong];

/**
 * The same tools `mobile/src/responsive.js` hands a sheet builder, rebuilt here from the
 * token module so the sheets can be evaluated for a given window outside React Native.
 * `responsive.js` is checked against this mapping below so the two cannot drift.
 */
function tools(width, height, feedback) {
  const layout = layoutFor({ width, height });
  return {
    layout,
    colors,
    fonts: FONTS,
    radius: RADIUS,
    motion: MOTION,
    hit: HIT_SLOP_MIN,
    hairline: 0.5,
    absoluteFill: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
    withAlpha: (color, alpha) => `rgba(${color}, ${alpha})`,
    font: (step) => fontSize(step, layout.width),
    lineHeight: (step, ratio = "normal") => Math.round(fontSize(step, layout.width) * LINE_HEIGHT[ratio]),
    space: (step) => space(step, layout),
    gutter: (step) => space(step)
  };
}

const sources = new Map();
async function sourceOf(file) {
  if (!sources.has(file)) sources.set(file, await readFile(file, "utf8"));
  return sources.get(file);
}

/** Pulls the sheet builder out of a screen file and runs it for one window size. */
async function sheetFor(file, width, height) {
  const source = await sourceOf(file);
  const match = source.match(/export function buildStyles\(t\) \{[\s\S]*?\n\}\n/);
  assert.ok(match, `${file} must declare its sheet as buildStyles(t)`);
  const feedbackSource = source.match(/const FEEDBACK = (\{.*\});/);
  const feedback = feedbackSource ? new Function(`return ${feedbackSource[1]};`)() : null;
  const build = new Function("FEEDBACK", `return (${match[0].replace("export function", "function")});`)(feedback);
  return build(tools(width, height, feedback));
}

const SE = { width: 375, height: 667 };
const PRO_MAX = { width: 430, height: 932 };

test("the native palette is the shared token palette, not a second copy", async () => {
  assert.equal(colors.babyPink, PALETTES.loveme.accent);
  assert.equal(colors.skyBlue, PALETTES.loveme.accentAlt);
  assert.equal(colors.charcoal, PALETTES.loveme.ink);
  assert.equal(colors.muted, PALETTES.loveme.muted);
  assert.equal(colors.white, PALETTES.loveme.surface);
  assert.equal(colors.line, PALETTES.loveme.line);
  assert.equal(colors.card, PALETTES.loveme.card);
  assert.equal(colors.error, PALETTES.loveme.error);
  assert.ok(gradientVertical.includes(PALETTES.loveme.accent) && gradientVertical.includes(PALETTES.loveme.accentAlt));
  assert.ok(gradientHorizontal.includes(PALETTES.loveme.accent) && gradientHorizontal.includes(PALETTES.loveme.accentAlt));

  const theme = await sourceOf("mobile/src/theme.js");
  assert.match(theme, /PALETTES/);
  assert.equal(/#[0-9a-fA-F]{6}/.test(theme), false, "theme.js must not restate a colour the token module holds");
});

test("responsive.js adapts through the token helpers and memoises per window", async () => {
  const responsive = await sourceOf("mobile/src/responsive.js");
  assert.match(responsive, /useWindowDimensions/);
  assert.match(responsive, /layoutFor\(\{ width, height \}\)/);
  assert.match(responsive, /useMemo/);
  assert.match(responsive, /font: \(step\) => fontSize\(step, layout\.width\)/);
  assert.match(responsive, /space: \(step\) => space\(step, layout\)/, "vertical rhythm follows the window");
  assert.match(responsive, /gutter: \(step\) => space\(step\)/, "gutters stay off the density scale");
  assert.match(responsive, /hit: HIT_SLOP_MIN/);
  assert.match(responsive, /StyleSheet\.create\(build\(styleTools\(layout\)\)\)/, "the sheet is built per window, not at module load");
  assert.equal(/TYPE_SCALE = |SPACE = |RADIUS = |PALETTES = /.test(responsive), false, "responsive.js must not become a second source of values");
});

test("screens carry no hardcoded type, spacing or corner numbers", async () => {
  for (const file of SCREEN_FILES) {
    const source = await sourceOf(file);
    assert.equal(/fontSize:\s*\d/.test(source), false, `${file} still hardcodes a font size`);
    assert.equal(/borderRadius:\s*\d/.test(source), false, `${file} still hardcodes a corner radius`);
    // `padding: 0` is a reset, not a spacing decision, so only non-zero literals are a smell.
    assert.equal(/(margin|padding|gap)(Top|Bottom|Left|Right|Horizontal|Vertical)?:\s*[1-9]/.test(source), false, `${file} still hardcodes a spacing`);
    assert.match(source, /createStyles\(buildStyles\)/, `${file} must build its sheet per window`);
    assert.equal(/StyleSheet\.create/.test(source), false, `${file} must not freeze a sheet at module load`);
  }
});

test("an SE and a Pro Max get different, sensible type and rhythm", async () => {
  const se = await sheetFor("mobile/src/screens.js", SE.width, SE.height);
  const max = await sheetFor("mobile/src/screens.js", PRO_MAX.width, PRO_MAX.height);

  // Type follows width: the narrow phone reads smaller, the wide one roomier.
  assert.ok(se.body.fontSize < max.body.fontSize, "body type should grow with width");
  assert.ok(se.sampleTitle.fontSize < max.sampleTitle.fontSize, "question stems should grow with width");
  assert.ok(se.wordmark.fontSize < max.wordmark.fontSize);
  assert.equal(se.body.fontSize, Math.round(TYPE_SCALE.bodyLarge * 0.9615));
  assert.equal(max.body.fontSize, Math.round(TYPE_SCALE.bodyLarge * (PRO_MAX.width / BASE_WIDTH)));

  // Vertical rhythm follows aspect ratio: 375×667 is 1.78 (regular), 430×932 is 2.17 (tall).
  assert.ok(se.packShell.paddingBottom < max.packShell.paddingBottom, "a shorter screen gives vertical space back");
  assert.ok(se.loginScroll.paddingBottom < max.loginScroll.paddingBottom);
  assert.equal(se.packShell.paddingBottom, SPACE.xl);
  assert.equal(max.packShell.paddingBottom, Math.round(SPACE.xl * 1.12));

  // Gutters are a width question, not an aspect-ratio one: they stay put.
  assert.equal(se.centered.paddingHorizontal, SPACE.xl);
  assert.equal(max.centered.paddingHorizontal, SPACE.xl);

  // A landscape window is short: it must not keep the tall phone's margins.
  const landscape = await sheetFor("mobile/src/screens.js", 667, 375);
  assert.ok(landscape.packShell.paddingBottom < se.packShell.paddingBottom, "a short window tightens the rhythm further");
  assert.equal(landscape.centered.paddingHorizontal, SPACE.xl);
});

test("type is clamped: it never shrinks past 0.92 or runs past 1.12", async () => {
  for (const width of [240, 320, 360, 375, 390, 430, 744, 1024, 2560]) {
    const sheet = await sheetFor("mobile/src/screens.js", width, Math.round(width * 2.1));
    for (const [key, style] of Object.entries(sheet)) {
      if (typeof style?.fontSize !== "number") continue;
      const base = style.fontSize / Math.min(1.12, Math.max(0.92, width / BASE_WIDTH));
      assert.ok(base >= 10, `${key} at ${width} is unreadably small`);
    }
    assert.equal(sheet.body.fontSize, Math.round(TYPE_SCALE.bodyLarge * Math.min(1.12, Math.max(0.92, width / BASE_WIDTH))));
    assert.ok(sheet.body.fontSize >= Math.round(TYPE_SCALE.bodyLarge * 0.92));
    assert.ok(sheet.body.fontSize <= Math.round(TYPE_SCALE.bodyLarge * 1.12));
    assert.ok(sheet.wordmark.fontSize <= Math.round(44 * 1.12));
    assert.ok(sheet.wordmark.fontSize >= Math.round(44 * 0.92));
  }
});

test("a tablet keeps one readable column instead of a stretched one", async () => {
  const tablet = await sheetFor("mobile/src/screens.js", 1024, 1366);
  assert.equal(tablet.safeFill.maxWidth, layoutFor({ width: 1024, height: 1366 }).maxContentWidth);
  assert.ok(tablet.safeFill.maxWidth < 1024);
  const phone = await sheetFor("mobile/src/screens.js", PRO_MAX.width, PRO_MAX.height);
  assert.equal(phone.safeFill.maxWidth, PRO_MAX.width, "a phone column is the whole phone");
});

test("the font lock survives the move to tokens", async () => {
  const fontMod = await sourceOf("mobile/src/fonts.js");
  assert.match(fontMod, /FONT_TITLE = "MaruBuri"/);
  assert.match(fontMod, /FONT_TITLE_STRONG = "MaruBuri-SemiBold"/);
  assert.match(fontMod, /FONT_BODY = "Pretendard"/);
  assert.match(fontMod, /FONT_BODY_STRONG = "Pretendard-SemiBold"/);

  const allowed = new Set([...MARUBURI, ...PRETENDARD]);
  for (const file of SCREEN_FILES) {
    const sheet = await sheetFor(file, PRO_MAX.width, PRO_MAX.height);
    for (const [key, style] of Object.entries(sheet)) {
      if (!style?.fontFamily) continue;
      assert.ok(allowed.has(style.fontFamily), `${file}:${key} uses ${style.fontFamily}`);
    }
  }

  const app = await sheetFor("mobile/src/screens.js", PRO_MAX.width, PRO_MAX.height);
  for (const key of ["wordmark", "title", "sampleTitle", "packTitle", "navTitle", "introTitle", "soonTitle", "shopTitle", "packRowLabel", "packRowLabelMuted"]) {
    assert.ok(MARUBURI.includes(app[key].fontFamily), `${key} is a title: it must stay MaruBuri`);
  }
  for (const key of ["body", "choiceLabel", "primaryLabel", "secondaryLabel", "textLinkLabel", "introLine", "sampleProgress"]) {
    assert.ok(PRETENDARD.includes(app[key].fontFamily), `${key} is body/choice/button text: it must stay Pretendard`);
  }

  const pack = await sheetFor("mobile/pack/screens.js", PRO_MAX.width, PRO_MAX.height);
  assert.ok(MARUBURI.includes(pack.title.fontFamily));
  assert.ok(MARUBURI.includes(pack.stem.fontFamily), "a question stem stays MaruBuri");
  assert.ok(PRETENDARD.includes(pack.choiceLabel.fontFamily));
  assert.ok(PRETENDARD.includes(pack.primaryLabel.fontFamily));

  const paywall = await sheetFor("mobile/paywall/screens.js", PRO_MAX.width, PRO_MAX.height);
  assert.ok(MARUBURI.includes(paywall.title.fontFamily));
  assert.ok(PRETENDARD.includes(paywall.body.fontFamily));
  assert.ok(PRETENDARD.includes(paywall.primaryLabel.fontFamily));
});

test("every tappable target reaches the minimum touch size on the smallest screen", async () => {
  for (const file of SCREEN_FILES) {
    for (const [width, height] of [[240, 480], [SE.width, SE.height], [667, 375]]) {
      const sheet = await sheetFor(file, width, height);
      for (const [key, style] of Object.entries(sheet)) {
        if (typeof style?.minHeight === "number") {
          assert.ok(style.minHeight >= HIT_SLOP_MIN, `${file}:${key} is ${style.minHeight}pt tall at ${width}×${height}`);
        }
        if (typeof style?.height === "number") {
          assert.ok(style.height >= HIT_SLOP_MIN, `${file}:${key} is ${style.height}pt tall at ${width}×${height}`);
        }
      }
    }
  }
  const app = await sheetFor("mobile/src/screens.js", SE.width, SE.height);
  assert.ok(app.backBtn.width >= HIT_SLOP_MIN && app.backBtn.height >= HIT_SLOP_MIN, "back is a real target, not a 36pt chevron");
  assert.ok(app.textLink.minHeight >= HIT_SLOP_MIN);
});

test("safe-area chrome and the keyboard shell stay in place", async () => {
  const app = await sourceOf("mobile/src/screens.js");
  const pack = await sourceOf("mobile/pack/screens.js");
  assert.match(app, /SafeAreaView style=\{\[styles\.safeFill, style\]\}/, "top chrome and bottom CTAs stay inside the safe area");
  assert.match(app, /KeyboardAvoidingView/);
  assert.match(app, /keyboardShouldPersistTaps="handled"/);
  assert.match(pack, /<SafeAreaView style=\{styles\.shell\}/);
  const sheet = await sheetFor("mobile/src/screens.js", PRO_MAX.width, PRO_MAX.height);
  assert.equal(sheet.certificateCta.marginTop, "auto", "the certificate CTA stays pinned above the home indicator");
  assert.equal(sheet.accountFooter.marginTop, "auto");
});

test("radii, rhythm and control heights come from the token module", async () => {
  const app = await sheetFor("mobile/src/screens.js", BASE_WIDTH, 844);
  assert.equal(app.labelChip.borderRadius, RADIUS.pill);
  assert.equal(app.gateCard.borderRadius, RADIUS.lg);
  assert.equal(app.input.borderRadius, RADIUS.md);
  assert.ok(Object.values(SPACE).includes(app.centered.paddingHorizontal));
  // Control heights are the touch minimum plus a step, so they move with the rhythm.
  assert.equal(app.input.minHeight, HIT_SLOP_MIN + space("xs", { width: BASE_WIDTH, height: 844 }));
  assert.equal(app.choice.minHeight, HIT_SLOP_MIN + space("sm", { width: BASE_WIDTH, height: 844 }));

  const pack = await sheetFor("mobile/pack/screens.js", BASE_WIDTH, 844);
  assert.equal(pack.primary.borderRadius, RADIUS.pill);
  assert.equal(pack.choice.borderRadius, RADIUS.md);

  const paywall = await sheetFor("mobile/paywall/screens.js", BASE_WIDTH, 844);
  assert.equal(paywall.card.borderRadius, RADIUS.lg);
  assert.match(paywall.overlay.backgroundColor, new RegExp(colors.babyPink.replace("#", "")), "the scrim is the palette accent, not a pasted colour");
});

test("the reference 390×844 screen is not redrawn by the move to tokens", async () => {
  const app = await sheetFor("mobile/src/screens.js", BASE_WIDTH, 844);
  // Type lands on the designed scale exactly at the reference width.
  assert.equal(app.body.fontSize, TYPE_SCALE.bodyLarge);
  assert.equal(app.title.fontSize, TYPE_SCALE.display);
  assert.equal(app.sampleTitle.fontSize, TYPE_SCALE.title);
  assert.equal(app.choiceLabel.fontSize, TYPE_SCALE.body);
  assert.equal(app.debug.fontSize, TYPE_SCALE.caption);
  // Rhythm stays within a step of what the screens were drawn with.
  assert.ok(Math.abs(app.centered.paddingHorizontal - 24) <= 1);
  assert.ok(Math.abs(app.coverShell.paddingTop - 12) <= 2);
  assert.ok(Math.abs(app.loginHero.marginTop - 36) <= 1);
  assert.ok(Math.abs(app.choice.minHeight - 52) <= 2);
  assert.ok(Math.abs(app.emailField.minHeight - 52) <= 2);
});
