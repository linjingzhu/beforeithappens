import { createHash } from "node:crypto";
import { COMING, SITE } from "./config.js";
import { allPages, indexModel } from "./content.js";
import { standingPages } from "./pages.js";
import { guidePages } from "./guides.js";
import { SITE_COPY } from "./render.js";

/**
 * When each page's *content* last changed, for the sitemap's `lastmod`.
 *
 * A crawler that trusts `lastmod` spends its next visit on what actually moved. The catch is the
 * word actually: a date taken from the build clock says every page changed on every deploy, which
 * is not a signal, it is noise with a timestamp on it — and Google's stated position is that it
 * ignores `lastmod` from a site whose dates it has learned not to believe. So the date has to come
 * from the content and nothing else.
 *
 * Hence a hash rather than a clock. `contentHashes` digests what each page is *about* — the
 * questions on it, the prose on it, the packs the home page lists — and deliberately not the
 * markup around it, so a change to the shell, the palette or the footer moves no page's date.
 * `scripts/stamp-content.mjs` compares those hashes against `site/content-stamp.json` and only
 * writes today's date where one has moved; every other date is carried across untouched.
 *
 * The stamp is committed, like the fonts and the scenes, and `test/site.test.js` fails when it is
 * out of date. That is the whole enforcement: content cannot ship with a stale date, because the
 * check that would catch it runs before the build.
 */
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);

/**
 * One hash per public path.
 *
 * Every field here is something a reader can see on that page. Nothing here is a file's mtime or a
 * build number — two builds of the same content must produce the same hashes, on any machine, or
 * the drift test becomes a coin toss.
 */
export function contentHashes({ site = SITE } = {}) {
  const hashes = {};

  // The home page is its packs and its own words. A pack appearing, or a holder's picture being
  // described differently, is a change to this page; a card's shadow moving is not.
  hashes["/"] = digest({
    tagline: site.tagline,
    words: [SITE_COPY.homeTagline, SITE_COPY.homeBlurb, SITE_COPY.homeDescription],
    packs: indexModel({ site }).packs.map((pack) => [pack.slug, pack.title, pack.description, pack.total, pack.pages]),
    coming: COMING.map((entry) => [entry.id, entry.alt])
  });

  for (const model of allPages({ site })) {
    hashes[model.path] = digest({
      title: model.title,
      part: [model.part.number, model.part.title, model.part.blurb || ""],
      // Page one also carries the pack's opening, which the others do not.
      lead: model.page === 1 ? [model.descriptionText || "", model.lead || ""] : "",
      questions: model.questions.map((question) => [
        question.number,
        question.title,
        question.scene || "",
        question.intent || "",
        question.choices.map((choice) => choice.label)
      ])
    });
  }

  // 읽을거리 and the standing pages are the same shape — a title, a line, and sections of prose —
  // so they are hashed the same way. The guides are in the sitemap, and a sitemap entry with no
  // `lastmod` beside sixty that have one is the crawler being told these six are the ones nobody
  // knows anything about.
  for (const page of [...guidePages({ site }), ...standingPages({ site })]) {
    hashes[page.path] = digest({
      title: page.title,
      description: page.description,
      sections: page.sections.map((section) => [section.heading, ...section.paragraphs]),
      // The row of ways on is part of what the page says: a guide that starts pointing somewhere
      // else has changed, even when its prose has not.
      links: (page.links || []).map((link) => [link.path, link.label])
    });
  }

  return hashes;
}
