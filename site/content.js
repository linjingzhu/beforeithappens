import { findPack, questionsFor } from "../src/packs.js";
import { PUBLISHED, SITE, publishedBySlug } from "./config.js";

/**
 * Turning a registered pack into a sequence of real pages.
 *
 * Real pages, not routes. The site is generated as separate HTML documents so a crawler sees the
 * questions without running anything, and so ten pages are ten page loads — which is the entire
 * basis for putting ad units in the page rather than squeezing them out of a transition.
 *
 * **A page is a Part.** Pagination used to be arithmetic — ten questions, count them off — and for
 * 결혼 100제 the two agree exactly, because every Part holds ten. They agree by luck. Cutting on the
 * count puts a reader mid-theme whenever a pack is written unevenly, and it gives the page no name:
 * "2/10" says where you are in a list, "감정과 애정" says what you are being asked about. Cutting on
 * the Part means the tab strip, the page, and the pack's own structure are one thing rather than
 * three that have to be kept in step.
 */
export function partsOf(packId) {
  const pack = findPack(packId);
  if (!pack) return [];
  const questions = pack.orderedQuestions;
  return pack.sections
    .map((section, index) => Object.freeze({
      id: section.id,
      title: section.title,
      blurb: section.blurb || "",
      number: index + 1,
      questions: Object.freeze(questions.filter((question) => question.sectionId === section.id))
    }))
    // A section nobody wrote questions for is not a page; it would be a tab onto nothing.
    .filter((part) => part.questions.length > 0);
}

export function pagePath(slug, pageNumber) {
  const page = Math.max(1, Math.floor(Number(pageNumber) || 1));
  return page === 1 ? `/${slug}/` : `/${slug}/${page}/`;
}

export function absoluteUrl(origin, path) {
  const base = String(origin || "").replace(/\/$/, "");
  return `${base}${path}`;
}

/**
 * Everything one page needs, resolved in one call so the renderer holds no logic of its own.
 * Returns `null` for a slug that is not published or a page past the end — the generator and any
 * future server both need that to be a definite "no" rather than an empty page.
 */
export function pageModel(slug, pageNumber, { site = SITE, published = null } = {}) {
  // `published` is an override for callers holding their own list — `allPages` when it is given
  // one, and tests that need to render a pack the site does not publish today.
  const entry = published ? published.find((each) => each.slug === slug) || null : publishedBySlug(slug);
  if (!entry) return null;

  const questions = questionsFor(entry.packId);
  if (!questions.length) return null;

  const parts = partsOf(entry.packId);
  const pages = parts.length;
  const page = Math.max(1, Math.floor(Number(pageNumber) || 1));
  if (page > pages) return null;

  const part = parts[page - 1];
  const first = page === 1;
  const last = page === pages;

  return Object.freeze({
    slug: entry.slug,
    packId: entry.packId,
    title: entry.title,
    description: entry.description,
    lead: first ? entry.lead : "",
    page,
    pages,
    first,
    last,
    total: questions.length,
    /** The Part this page is, and the strip of all of them for the tabs above the questions. */
    part: Object.freeze({ id: part.id, title: part.title, blurb: part.blurb, number: part.number }),
    parts: Object.freeze(parts.map((each) => Object.freeze({
      id: each.id,
      title: each.title,
      number: each.number,
      count: each.questions.length,
      path: pagePath(entry.slug, each.number),
      current: each.number === page
    }))),
    // The number a reader sees is the question's own, so Part two starts at 11 rather than 1.
    questions: part.questions,
    path: pagePath(entry.slug, page),
    previousPath: page > 1 ? pagePath(entry.slug, page - 1) : "",
    nextPath: last ? "" : pagePath(entry.slug, page + 1),
    // One ad slot per page, after the questions and before the control that leaves. Declared here
    // so the position is a content decision rather than something a template improvises.
    adSlot: "after-questions"
  });
}

/** Every page the generator has to emit, in order. */
export function allPages({ site = SITE, published = PUBLISHED } = {}) {
  const out = [];
  for (const entry of published) {
    const pages = partsOf(entry.packId).length;
    if (!pages) continue;
    for (let page = 1; page <= pages; page += 1) {
      const model = pageModel(entry.slug, page, { site, published });
      if (model) out.push(model);
    }
  }
  return out;
}

/** The index: one card per published pack. */
export function indexModel({ site = SITE, published = PUBLISHED } = {}) {
  const packs = published
    .map((entry) => {
      const questions = questionsFor(entry.packId);
      if (!questions.length) return null;
      return Object.freeze({
        slug: entry.slug,
        title: entry.title,
        navTitle: entry.navTitle || entry.title,
        description: entry.description,
        total: questions.length,
        pages: partsOf(entry.packId).length,
        path: pagePath(entry.slug, 1)
      });
    })
    .filter(Boolean);
  return Object.freeze({ packs, path: "/" });
}
