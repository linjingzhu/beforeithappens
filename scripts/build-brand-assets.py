#!/usr/bin/env python3
"""
Produces the site's brand assets from the app's, once. The output is committed.

Two things make this a generator rather than a build step. It needs Python packages the rest of the
repository does not (`fonttools`, `brotli`, `pillow`), and running it in CI would put those in the
deploy path for files that change about as often as the brand does. So it runs by hand, its output
is committed beside the source it came from, and `test/brand.test.js` — plain Node, no packages —
fails if the site grows a character the subsetted fonts do not carry.

Fonts. `mobile/assets/fonts/` holds 9.6MB of MaruBuri and Pretendard, which is fine for an app
bundle and absurd for a web page. Korean faces are large because they carry thousands of syllables;
this site uses a few hundred. Subsetting to the ones actually rendered takes each face to well
under a tenth of its size. The cost is that new copy needs a regeneration, which is what the test
is there to catch.

The typographic lock is the app's, recorded in `.ai/PROJECT_CONTEXT.md`: titles and question stems
in MaruBuri, body and choices and buttons in Pretendard.

Mark. `brand/mark.png` is the drawn heart, 538x538 on its own cream. Everything that shows it
is smaller and wants a different framing, so this derives the sizes rather than shipping one
file three times. The drawing is cropped to its ink and re-padded, because a favicon read at
16px needs the shape to fill the tile while the source leaves a wide margin. The tab and home
screen icons keep paper behind them — the ink is nearly black, and a transparent tile
disappears into dark browser chrome — and the in-page mark drops it, so it sits on the page's
own paper with no square around it.

Run: pip install fonttools brotli pillow && python3 scripts/build-brand-assets.py
"""
import pathlib
import sys

from PIL import Image
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "site" / "brand"

FACES = [
    ("MaruBuri-Regular.ttf", "maruburi-400.woff2"),
    ("MaruBuri-SemiBold.ttf", "maruburi-600.woff2"),
    ("Pretendard-Regular.otf", "pretendard-400.woff2"),
    ("Pretendard-SemiBold.otf", "pretendard-600.woff2"),
]


def rendered_characters() -> set[str]:
    """Every character the site can put on a page, read from the same modules the build reads."""
    import json
    import subprocess

    script = """
import('./src/packs.js').then(async (packs) => {
  const { PUBLISHED } = await import('./site/config.js');
  const parts = [];
  for (const entry of PUBLISHED) {
    parts.push(entry.title, entry.navTitle || '', entry.tagline || '', entry.lead);
    // A description may be authored as lines.
    for (const line of [].concat(entry.description || [])) parts.push(line);
    const pack = packs.findPack(entry.packId);
    // Everything a page can print, not only the question: a scene, a mood, a value name or a
    // section's blurb is copy too, and a character missing from the subset falls back mid-sentence.
    for (const section of pack.sections) parts.push(section.title, section.blurb || '');
    for (const question of pack.questions) {
      parts.push(question.title, question.scene || '', question.mood || '');
      for (const choice of question.choices) parts.push(choice.label, choice.valueLabel || '');
    }
  }
  const { SITE } = await import('./site/config.js');
  parts.push(SITE.name, SITE.tagline);
  // Copy is not always a flat string any more: an options list is an array of objects, and a label
  // that takes a number is a function. Walk it, and call the formatters with a number, so that a
  // string nested one level deeper than the scanner expected cannot quietly go uncovered.
  const walk = (value) => {
    if (typeof value === 'string') parts.push(value);
    else if (typeof value === 'function') { try { walk(value(1)); } catch {} }
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  const { SITE_COPY } = await import('./site/render.js');
  walk(SITE_COPY);
  const { RESULT_COPY } = await import('./site/result-copy.js');
  walk(RESULT_COPY);
  // Debug only, and scanned anyway: it is on the live page until the owner takes it off.
  const { FEEDBACK_COPY } = await import('./site/feedback.js');
  walk(FEEDBACK_COPY);
  const { INVITE_COPY } = await import('./site/invite-copy.js');
  walk(INVITE_COPY);
  const { DOCK_COPY } = await import('./site/dock-copy.js');
  walk(DOCK_COPY);
  // Alt text is text the page prints when an image does not arrive. The first two happened to be
  // covered by other copy; 갓 was the first character that was not.
  const { COMING } = await import('./site/config.js');
  COMING.forEach((entry) => walk(entry.alt));
  const pages = await import('./site/pages.js');
  // The policy's text is fixed and known now; only whether it is emitted is gated on the owner's
  // details. Scanning only the emitted pages would leave it uncovered until the day it appears,
  // which is the day a missing glyph would first be seen. Its identity lines carry the owner's own
  // name and address, which no subset can anticipate — regenerate after filling those in.
  walk(pages.privacyCopy());
  for (const page of pages.standingPages()) {
    parts.push(page.title, page.description);
    for (const section of page.sections) parts.push(section.heading, ...section.paragraphs);
  }
  // The pages that are not built yet still have copy, and it should be covered before it ships.
  for (const copy of [pages.ABOUT_COPY, pages.CONTACT_COPY]) {
    parts.push(copy.title, copy.description);
    for (const section of copy.sections) parts.push(section.heading, ...section.paragraphs);
  }
  process.stdout.write(JSON.stringify(parts.join('')));
});
"""
    out = subprocess.run(
        ["node", "-e", script], cwd=ROOT, capture_output=True, text=True, check=True
    )
    return set(json.loads(out.stdout))


PAPER = (248, 243, 237)  # --ab-paper, so a tile with a ground matches the page it came from.
MARK = ROOT / "brand" / "mark.png"


def drawn_mark() -> Image.Image:
    """The drawing, cropped square to its ink, its cream ground turned into transparency."""
    source = Image.open(MARK).convert("RGB")
    grey = source.convert("L")

    # The ink is near-black on cream, so darkness is coverage: a pixel at the paper's brightness is
    # fully transparent, one at the ink's fully opaque, and the edges keep their antialiasing.
    floor, ceiling = 40, 235
    alpha = grey.point(lambda v: max(0, min(255, round((ceiling - v) * 255 / (ceiling - floor)))))
    drawing = source.copy()
    drawing.putalpha(alpha)

    box = alpha.point(lambda v: 255 if v > 96 else 0).getbbox()
    if box is None:
        raise SystemExit(f"{MARK}: no ink found")

    # Square the crop around the ink so the padding below does not stretch the shape.
    left, top, right, bottom = box
    half = max(right - left, bottom - top) // 2
    cx, cy = (left + right) // 2, (top + bottom) // 2
    return drawing.crop((cx - half, cy - half, cx + half, cy + half))


def framed(mark: Image.Image, size: int, fill: float, ground) -> Image.Image:
    """`mark` centred in a `size` tile, taking `fill` of its side."""
    inner = max(1, round(size * fill))
    tile = Image.new("RGBA", (size, size), ground)
    offset = (size - inner) // 2
    tile.alpha_composite(mark.resize((inner, inner), Image.LANCZOS), (offset, offset))
    return tile


def inked(mark: Image.Image, size: int, gamma: float, ground) -> Image.Image:
    """A tile like `framed`, with the mark's coverage raised by `gamma` before it is composited."""
    inner = round(size * 0.84)
    scaled = mark.resize((inner, inner), Image.LANCZOS)
    alpha = scaled.split()[3].point(lambda v: min(255, round(255 * (v / 255) ** gamma)))
    scaled.putalpha(alpha)
    tile = Image.new("RGBA", (size, size), ground)
    offset = (size - inner) // 2
    tile.alpha_composite(scaled, (offset, offset))
    return tile.convert("RGB")


def write_marks() -> None:
    mark = drawn_mark()

    # In the page the mark already sits on the paper, so it ships without a ground of its own.
    framed(mark, 96, 0.96, (0, 0, 0, 0)).save(OUT / "logo.png", optimize=True)

    # The tab and the home screen get the paper behind them. iOS also squares off a touch icon and
    # drops its alpha, so an opaque tile is the difference between cream and black.
    paper = PAPER + (255,)
    framed(mark, 180, 0.76, paper).convert("RGB").save(OUT / "apple-touch-icon.png", optimize=True)
    # A tab icon is drawn at 16px, and a hand-drawn line thinned to 16px averages away into grey.
    # So each size in the .ico is its own frame, with the smallest ones' coverage pushed back up by
    # a gamma on the alpha — the stroke stays the shape it is and regains the weight the resample
    # took off it. Frames go in largest first, matching `sizes`.
    frames = [inked(mark, size, gamma, paper) for size, gamma in ((48, 1.0), (32, 0.7), (16, 0.4))]
    frames[0].save(
        OUT / "favicon.ico",
        append_images=frames[1:],
        sizes=[(48, 48), (32, 32), (16, 16)],
    )

    for name in ("logo.png", "apple-touch-icon.png", "favicon.ico"):
        print(f"{name}: {(OUT / name).stat().st_size / 1024:.1f} KB")


APP = ROOT / "mobile" / "assets"


# The five vignettes on `brand/pack-scenes.jpg`, left to right, and what each one became.
#
# The source is one wide image the owner supplied: proposal, wedding, pregnancy, newborn, childcare.
# Four are named for the pack they serve and one — the bench — for what the owner reads in it.
# Three were taken first and the other two were held back — the proposal because it was not a pack,
# and the newborn because its hospital panel was judged to be a coloured background that would sit
# among white cards as a blue rectangle. Rendered at the size a card actually draws, that was wrong:
# the panel is pale and reads as a soft backdrop on white. Both are in now, as 연애 and 출산, which
# are packs the site already plans — `docs/OWNER_ACTIONS.md` N7 and `docs/WEB_SERVICE_STRATEGY.md`.
#
# The boxes were measured rather than eyeballed: column density across the source falls to zero in
# the gaps between figures, and each crop is taken inside its own gap with a little air left around
# the figures so they are not trimmed against their own outline.
PACK_SCENES = {
    "dating": (17, 144, 349, 808),
    "marriage": (355, 140, 712, 810),
    "pregnancy": (718, 150, 1050, 810),
    "birth": (1052, 160, 1408, 828),
    # The bench. Named for what it is used as, like the others — and the owner reads it as 노후,
    # which is what it shows: two people sitting close together, at rest. The book in her hands is
    # labelled Childcare at full resolution and that is why it was first taken for 육아, but the card
    # draws this scene 108x180, where the book is 34x31 and its lettering about 6px. Nobody reads it.
    "later": (1414, 190, 1792, 820),
}

# Sized by height, not width: the figures stand, so the three crops differ in width and agree in
# height, and a card that draws them to a common height is what makes them read as one set. Twice
# the height the card draws them at, so they stay sharp on a phone.
SCENE_HEIGHT = 440


def write_pack_scenes() -> None:
    """Crop the owner's scene sheet into one image per pack card."""
    source = ROOT / "brand" / "pack-scenes.jpg"
    if not source.exists():
        print("brand/pack-scenes.jpg missing; skipping pack scenes")
        return
    sheet = Image.open(source).convert("RGB")
    for name, box in PACK_SCENES.items():
        tile = sheet.crop(box)
        width = round(tile.width * SCENE_HEIGHT / tile.height)
        tile = tile.resize((width, SCENE_HEIGHT), Image.LANCZOS)
        out = ROOT / "site" / "brand" / f"scene-{name}.jpg"
        # JPEG rather than PNG: these are renders on a white ground with no transparency to keep,
        # and the same picture is four times the bytes as a PNG.
        tile.save(out, "JPEG", quality=86, optimize=True, progressive=True)
        print(f"scene-{name}.jpg: {out.stat().st_size / 1024:.1f} KB, {width}x{SCENE_HEIGHT}")


def write_app_icons() -> None:
    """The same mark as the app's icons, in the four shapes the platforms each demand.

    They are four files rather than one because the requirements contradict each other. iOS drops an
    icon's alpha and rejects a transparent one outright, so its tile is opaque. Android composes an
    adaptive icon from a foreground over a background and then masks the pair to whatever shape the
    launcher likes, so the foreground is transparent and the drawing is kept well inside the safe
    circle — 66% of the tile, and a square inscribed in that circle is narrower still, which is why
    the mark takes less than half the width here and two thirds of it on iOS. The monochrome layer
    is for themed icons, where only coverage is read and the colour is the system's to choose.
    """
    mark = drawn_mark()
    paper = PAPER + (255,)

    framed(mark, 1024, 0.70, paper).convert("RGB").save(APP / "icon.png", optimize=True)
    framed(mark, 1024, 0.46, (0, 0, 0, 0)).save(APP / "android-icon-foreground.png", optimize=True)
    Image.new("RGB", (1024, 1024), PAPER).save(APP / "android-icon-background.png", optimize=True)

    # Themed icons read the alpha and ignore the colour, so the ink is flattened to one value.
    monochrome = framed(mark, 1024, 0.46, (0, 0, 0, 0))
    black = Image.new("RGBA", monochrome.size, (0, 0, 0, 255))
    black.putalpha(monochrome.split()[3])
    black.save(APP / "android-icon-monochrome.png", optimize=True)

    # Expo's web build, where the tab is the same 16px problem the site's favicon has.
    inked(mark, 64, 0.55, paper).save(APP / "favicon.png", optimize=True)

    for name in ("icon.png", "android-icon-foreground.png", "android-icon-background.png",
                 "android-icon-monochrome.png", "favicon.png"):
        print(f"mobile/{name}: {(APP / name).stat().st_size / 1024:.1f} KB")


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)

    # ASCII so numerals, punctuation and the wordmark render; the rest is what the pages say.
    chars = rendered_characters() | {chr(c) for c in range(0x20, 0x7F)}
    chars = {c for c in chars if c.isprintable() or c == " "}
    text = "".join(sorted(chars))

    for source_name, out_name in FACES:
        source = ROOT / "mobile" / "assets" / "fonts" / source_name
        target = OUT / out_name
        args = [
            str(source),
            f"--text={text}",
            "--flavor=woff2",
            "--layout-features=*",
            f"--output-file={target}",
        ]
        subset.main(args)

        # Prove the subset carries what it was asked for rather than trusting the call.
        covered = set()
        for table in TTFont(target)["cmap"].tables:
            covered |= {chr(code) for code in table.cmap}
        missing = sorted(c for c in chars if c not in covered and not c.isspace())
        if missing:
            print(f"{out_name}: missing {len(missing)} characters: {''.join(missing[:20])}", file=sys.stderr)
            return 1
        print(f"{out_name}: {target.stat().st_size / 1024:.1f} KB, {len(covered)} glyphs")

    # The contract CI checks, since CI has no font tooling.
    (OUT / "COVERAGE.txt").write_text(text, encoding="utf8")

    write_marks()
    write_pack_scenes()
    write_app_icons()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
