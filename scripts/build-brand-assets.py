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
  // The whole module, rather than a list of the copies in it. The list was the bug: 처리방침 was
  // added and not listed, then the 404 page was added and not listed, and each time the miss is
  // silent — the subset simply lacks a glyph and one character on a live page renders in another
  // face. Walking the namespace covers what is there now and what is added next. `walk` calls the
  // exported builders (privacyCopy, standingPages) and they are copy builders, which is the whole
  // module. The policy in particular is scanned even while it is gated on the owner's details:
  // scanning only what is emitted would first reveal a gap on the day the page goes live. Its
  // identity lines carry a name and address no subset can anticipate — regenerate after a change.
  walk(await import('./site/pages.js'));
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


# The vignettes on the owner's scene sheets, and what each one became.
#
# The first sheet is one wide image: proposal, wedding, pregnancy, newborn, childcare. Four are cut
# from it, each named for the pack it serves; the fifth — the bench with the childcare book — stood
# in for 노후 until a drawing made for 노후 arrived, and is now cut by nothing.
# Three were taken first and the other two were held back — the proposal because it was not a pack,
# and the newborn because its hospital panel was judged to be a coloured background that would sit
# among white cards as a blue rectangle. Rendered at the size a card actually draws, that was wrong:
# the panel is pale and reads as a soft backdrop on white. Both are in now, as 연애 and 출산, which
# are packs the site already plans — `docs/OWNER_ACTIONS.md` N7 and `docs/WEB_SERVICE_STRATEGY.md`.
#
# The boxes were measured rather than eyeballed: column density across the source falls to zero in
# the gaps between figures, and each crop is taken inside its own gap with a little air left around
# the figures so they are not trimmed against their own outline.
#
# A second sheet arrived later — `brand/pack-scenes-2.jpg`, three panels: a family reading a
# picture book across the top, an old couple on a bench at bottom left, and a third at bottom right
# the owner did not name, which is therefore not cut. It carried 교육 and 노후 until the drawings
# below replaced both.
#
# Three single drawings arrived on 2026-09-03, one per pack and each on its own white ground:
# `pack-later.jpg` (an old couple on a bench sharing a cup — 노후), `pack-birth.jpg` (a couple with a
# newborn — 출산) and `pack-education.jpg` (parents with a schoolgirl — 자녀교육). Each is cut to its
# figures with a little air, measured the same way: the bounding box of everything darker than the
# paper, widened by twenty pixels a side where the drawing allows it. They replace the newborn from
# the first sheet and both panels from the second, which are now cut by nothing.
#
# `pack-goodbye.jpg` arrived on 2026-09-11, drawn for 이별: two people standing apart, both heads
# bowed. Measured the same way as the three above but against a darker threshold. Its ground carries
# a faint gradient the others do not, and the threshold that suited them reads that gradient as ink
# out to the paper's own edge — which would have cropped the picture to the whole file and left the
# figures swimming in white while every other card sits tight around its own.
#
# So the boxes are grouped by the file they are cut from, and a name appearing under two files
# would be a silent overwrite — `write_pack_scenes` refuses that rather than letting file order
# decide which picture wins.
PACK_SCENES = {
    "pack-scenes.jpg": {
        "dating": (17, 144, 349, 808),
        "marriage": (355, 140, 712, 810),
        "pregnancy": (718, 150, 1050, 810),
    },
    "pack-later.jpg": {"later": (136, 112, 1149, 1492)},
    "pack-birth.jpg": {"birth": (656, 0, 1172, 983)},
    "pack-education.jpg": {"education": (544, 0, 1293, 1008)},
    "pack-goodbye.jpg": {"goodbye": (49, 180, 1018, 1732)},
}

# Sized by height, not width: the figures stand, so the three crops differ in width and agree in
# height, and a card that draws them to a common height is what makes them read as one set. Twice
# the height the card draws them at, so they stay sharp on a phone.
SCENE_HEIGHT = 440


def write_pack_scenes() -> None:
    """Crop the owner's scene sheets into one image per pack card."""
    written: dict[str, str] = {}
    for sheet_name, boxes in PACK_SCENES.items():
        source = ROOT / "brand" / sheet_name
        if not source.exists():
            print(f"brand/{sheet_name} missing; skipping its pack scenes")
            continue
        sheet = Image.open(source).convert("RGB")
        for name, box in boxes.items():
            if name in written:
                raise SystemExit(
                    f"scene-{name}.jpg is cut from both {written[name]} and {sheet_name}"
                )
            written[name] = sheet_name
            tile = sheet.crop(box)
            width = round(tile.width * SCENE_HEIGHT / tile.height)
            tile = tile.resize((width, SCENE_HEIGHT), Image.LANCZOS)
            out = ROOT / "site" / "brand" / f"scene-{name}.jpg"
            # JPEG rather than PNG: these are renders on a white ground with no transparency to
            # keep, and the same picture is four times the bytes as a PNG.
            tile.save(out, "JPEG", quality=86, optimize=True, progressive=True)
            print(f"scene-{name}.jpg: {out.stat().st_size / 1024:.1f} KB, {width}x{SCENE_HEIGHT}")


def share_cards() -> list[dict]:
    """What each card says, read from the site's own config rather than typed here twice."""
    import json
    import subprocess

    script = """
Promise.all([import('./site/config.js'), import('./site/render.js')]).then(([config, render]) => {
  const { SITE, PUBLISHED, SCENES } = config;
  const { SITE_COPY } = render;
  // The home card carries no scene on purpose: with more than one pack published there is no one
  // picture that stands for the site, and a brand card that is the mark and the line is honest.
  const cards = [{
    file: 'share-home.jpg',
    site: SITE.name,
    title: SITE.tagline,
    line: SITE_COPY.homeTagline
  }];
  for (const entry of PUBLISHED) {
    cards.push({
      file: `share-${entry.slug}.jpg`,
      site: SITE.name,
      title: entry.title,
      line: entry.tagline || '',
      scene: SCENES[entry.slug]?.src || ''
    });
  }
  process.stdout.write(JSON.stringify(cards));
});
"""
    out = subprocess.run(
        ["node", "-e", script], cwd=ROOT, capture_output=True, text=True, check=True
    )
    return json.loads(out.stdout)


# The share card's palette, from `src/design-tokens.js` — the site's page ground, its ink and its
# muted text. Written out rather than parsed: three values that change when the palette does, and a
# card whose colours have drifted from the site is obvious the moment anyone shares a link.
SHARE = (1200, 630)
SITE_PAPER = (233, 239, 248)   # --ab-paper
SITE_INK = (42, 55, 67)        # --ab-ink
SITE_MUTED = (87, 103, 122)    # --ab-muted


def _font(name: str, size: int):
    from PIL import ImageFont
    return ImageFont.truetype(str(ROOT / "mobile" / "assets" / "fonts" / name), size)


def _wrap(draw, text: str, font, width: int) -> list[str]:
    """Break `text` to `width`, at spaces where there are any.

    Korean can be broken between any two syllables, which is why the fallback below is per
    character — but it should not be the first choice. Breaking `함께 준비하다` after `준` is legal
    and reads as a mistake, and a share card is seen once, in a chat, at a glance.
    """
    lines, line = [], ""
    for word in text.split(" "):
        trial = f"{line} {word}" if line else word
        if draw.textlength(trial, font=font) <= width:
            line = trial
            continue
        if line:
            lines.append(line)
            line = ""
        # A single word wider than the measure has to break somewhere; that is what this is for.
        for char in word:
            trial = line + char
            if draw.textlength(trial, font=font) <= width or not line:
                line = trial
            else:
                lines.append(line)
                line = char
    if line:
        lines.append(line)
    return lines


def write_share_cards(cards) -> None:
    """One 1200x630 card per published pack, plus the site's own.

    Every page on this site had no `og:image` at all, which for a service whose whole distribution
    is one person sending another a link meant the link arrived as a grey rectangle. 1200x630 is
    what Open Graph, Twitter and KakaoTalk all read a large card at.

    The card is the page's own palette with the pack's scene beside its name, so the thing that
    arrives in a chat looks like the thing it opens.
    """
    from PIL import ImageDraw

    mark = drawn_mark()
    for card in cards:
        image = Image.new("RGB", SHARE, SITE_PAPER)
        draw = ImageDraw.Draw(image)

        scene_right = SHARE[0] - 80
        text_width = SHARE[0] - 160
        scene_path = card.get("scene")
        if scene_path:
            scene = Image.open(ROOT / "site" / scene_path.lstrip("/")).convert("RGB")
            height = 430
            width = round(scene.width * height / scene.height)
            scene = scene.resize((width, height), Image.LANCZOS)
            # The scenes are drawn on white and the card's ground is not, so the tile would show as
            # a bright rectangle. Its own white is keyed out instead, which is what leaves the clay
            # figures standing on the page rather than in a box.
            keyed = scene.convert("RGBA")
            keyed.putalpha(scene.convert("L").point(lambda v: 0 if v > 244 else 255))
            image.paste(keyed, (scene_right - width, (SHARE[1] - height) // 2), keyed)
            text_width = scene_right - width - 120
        else:
            # No scene means the site's own card, and the words alone leave the right half empty.
            # The mark fills it — the same drawing the rail carries, at the size a card can hold.
            big = mark.resize((300, 300), Image.LANCZOS)
            image.paste(big, (scene_right - 300, (SHARE[1] - 300) // 2), big)
            text_width = scene_right - 300 - 90

        # The mark, then the name, then the line under it. Same order as the page's own rail.
        image.paste(mark.resize((72, 72), Image.LANCZOS), (80, 92), mark.resize((72, 72), Image.LANCZOS))
        draw.text((172, 104), card["site"], font=_font("MaruBuri-SemiBold.ttf", 46), fill=SITE_INK)

        title_font = _font("MaruBuri-SemiBold.ttf", 74)
        body_font = _font("Pretendard-Regular.otf", 34)
        y = 250
        for line in _wrap(draw, card["title"], title_font, text_width):
            draw.text((80, y), line, font=title_font, fill=SITE_INK)
            y += 96
        y += 16
        for line in _wrap(draw, card["line"], body_font, text_width):
            draw.text((80, y), line, font=body_font, fill=SITE_MUTED)
            y += 50

        out = OUT / card["file"]
        image.save(out, "JPEG", quality=88, optimize=True, progressive=True)
        print(f"{card['file']}: {out.stat().st_size / 1024:.1f} KB, {SHARE[0]}x{SHARE[1]}")


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
    write_share_cards(share_cards())
    write_app_icons()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
