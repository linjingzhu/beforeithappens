import { questionsFor } from "../src/packs.js";
import { PUBLISHED, SITE, publishedBySlug } from "./config.js";

/**
 * Turning a registered pack into a sequence of real pages.
 *
 * Real pages, not routes. The site is generated as separate HTML documents so a crawler sees the
 * questions without running anything, and so ten pages are ten page loads — which is the entire
 * basis for putting ad units in the page rather than squeezing them out of a transition.
 *
 * Pagination is derived, never configured per pack: a pack that grows from twelve questions to a
 * hundred becomes ten pages by being written, with nothing here to update.
 */
export function pageCount(total, pageSize = SITE.pageSize) {
  const size = Number(pageSize) > 0 ? Number(pageSize) : 1;
  return Math.max(1, Math.ceil((Number(total) || 0) / size));
}

/** 1-based, because the number is in the URL and in front of a reader. */
export function pageSlice(questions, pageNumber, pageSize = SITE.pageSize) {
  const size = Number(pageSize) > 0 ? Number(pageSize) : 1;
  const page = Math.max(1, Math.floor(Number(pageNumber) || 1));
  return questions.slice((page - 1) * size, page * size);
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
export function pageModel(slug, pageNumber, { site = SITE } = {}) {
  const entry = publishedBySlug(slug);
  if (!entry) return null;

  const questions = questionsFor(entry.packId);
  if (!questions.length) return null;

  const pages = pageCount(questions.length, site.pageSize);
  const page = Math.max(1, Math.floor(Number(pageNumber) || 1));
  if (page > pages) return null;

  const slice = pageSlice(questions, page, site.pageSize);
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
    // The number a reader sees is the question's own, so page two starts at 11 rather than 1.
    questions: slice,
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
    const questions = questionsFor(entry.packId);
    if (!questions.length) continue;
    const pages = pageCount(questions.length, site.pageSize);
    for (let page = 1; page <= pages; page += 1) {
      const model = pageModel(entry.slug, page, { site });
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
        description: entry.description,
        total: questions.length,
        pages: pageCount(questions.length, site.pageSize),
        path: pagePath(entry.slug, 1)
      });
    })
    .filter(Boolean);
  return Object.freeze({ packs, path: "/" });
}
