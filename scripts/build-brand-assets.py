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

Logo. The app icon is 1024x1024 and 897KB. The site shows it at 32px.

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
    parts.push(entry.title, entry.description, entry.lead);
    const pack = packs.findPack(entry.packId);
    for (const section of pack.sections) parts.push(section.title);
    for (const question of pack.questions) {
      parts.push(question.title);
      for (const choice of question.choices) parts.push(choice.label);
    }
  }
  const { SITE } = await import('./site/config.js');
  parts.push(SITE.name, SITE.tagline);
  const { SITE_COPY } = await import('./site/render.js');
  parts.push(...Object.values(SITE_COPY).filter((v) => typeof v === 'string'));
  const { RESULT_COPY } = await import('./site/result-copy.js');
  parts.push(...Object.values(RESULT_COPY).filter((v) => typeof v === 'string'));
  const pages = await import('./site/pages.js');
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

    icon = Image.open(ROOT / "mobile" / "assets" / "icon.png").convert("RGBA")
    icon.resize((96, 96), Image.LANCZOS).save(OUT / "logo.png", optimize=True)
    print(f"logo.png: {(OUT / 'logo.png').stat().st_size / 1024:.1f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
