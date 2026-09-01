import { escapeHtml } from "../src/html.js";
import { SITE } from "./config.js";
import { absoluteUrl } from "./content.js";

/**
 * The half of a public page that is not for the reader.
 *
 * A paginated set has one trap worth naming: page two of a series is not a duplicate of page one,
 * but it looks like one to a crawler unless the canonical, the title, and the prev/next relations
 * all say which page it is. Every page here carries its own canonical — pointing them all at page
 * one would hide nine tenths of the content, which is the opposite of the point.
 */
export function pageTitle(model, site = SITE) {
  if (!model) return site.name;
  const base = model.page === 1 ? model.title : `${model.title} (${model.page}/${model.pages})`;
  return `${base} · ${site.name}`;
}

export function pageDescription(model) {
  if (!model) return "";
  if (model.page === 1) return model.description;
  const first = model.questions[0];
  const last = model.questions[model.questions.length - 1];
  return `${model.title} ${model.page}쪽. ${first.number}번부터 ${last.number}번까지의 질문입니다.`;
}

function tag(name, content) {
  return content ? `  <meta name="${name}" content="${escapeHtml(content)}">` : "";
}

function property(name, content) {
  return content ? `  <meta property="${name}" content="${escapeHtml(content)}">` : "";
}

export function headTags(model, site = SITE) {
  const url = model ? absoluteUrl(site.origin, model.path) : site.origin;
  const title = pageTitle(model, site);
  const description = pageDescription(model);
  const lines = [
    `  <title>${escapeHtml(title)}</title>`,
    tag("description", description),
    site.origin ? `  <link rel="canonical" href="${escapeHtml(url)}">` : "",
    // Prev/next tell a crawler this is one series rather than nine near-duplicates.
    model?.previousPath && site.origin ? `  <link rel="prev" href="${escapeHtml(absoluteUrl(site.origin, model.previousPath))}">` : "",
    model?.nextPath && site.origin ? `  <link rel="next" href="${escapeHtml(absoluteUrl(site.origin, model.nextPath))}">` : "",
    property("og:type", "article"),
    property("og:title", title),
    property("og:description", description),
    site.origin ? property("og:url", url) : "",
    property("og:locale", site.locale),
    property("og:site_name", site.name),
    tag("twitter:card", "summary")
  ];
  return lines.filter(Boolean).join("\n");
}

/**
 * Structured data. `Question` with `suggestedAnswer` rather than `acceptedAnswer`, because none of
 * these has a right answer and marking one accepted would be a lie told to a search engine and to
 * anyone who read the snippet.
 */
export function structuredData(model, site = SITE) {
  if (!model) return "";
  const payload = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: pageTitle(model, site),
    numberOfItems: model.questions.length,
    itemListElement: model.questions.map((question, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Question",
        name: question.title,
        text: question.intent,
        suggestedAnswer: question.choices.map((choice) => ({
          "@type": "Answer",
          text: choice.label
        }))
      }
    }))
  };
  if (site.origin) payload.url = absoluteUrl(site.origin, model.path);
  // JSON inside a script element: the only escape that matters is a closing tag in the data.
  return `<script type="application/ld+json">${JSON.stringify(payload).replace(/</g, "\\u003c")}</script>`;
}

const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

/** A sitemap is how a crawler finds page seven, which nothing links to from outside. */
export function sitemapXml(pages, site = SITE) {
  const urls = pages
    .map((model) => `  <url><loc>${escapeHtml(absoluteUrl(site.origin, model.path))}</loc></url>`)
    .join("\n");
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="${SITEMAP_NS}">`,
    urls,
    "</urlset>",
    ""
  ].join("\n");
}

export function robotsTxt(site = SITE) {
  const lines = ["User-agent: *", "Allow: /"];
  if (site.origin) lines.push(`Sitemap: ${absoluteUrl(site.origin, "/sitemap.xml")}`);
  return `${lines.join("\n")}\n`;
}

/**
 * The two files GitHub Pages needs, as data rather than as a side effect of the build.
 *
 * They were briefly asserted by reading `site/dist/` after a build, which passed locally and failed
 * on a fresh checkout: CI runs the tests before the build, and the output is gitignored. A test
 * that depends on a build artefact is testing the last build, not the code.
 *
 * `CNAME` matters because Pages drops a custom domain on any deploy whose artefact lacks one.
 * `.nojekyll` matters because Pages otherwise runs Jekyll, which swallows anything starting with an
 * underscore — nothing does today, and this keeps that from becoming a trap later.
 */
export function pagesFiles(site = SITE) {
  const files = { ".nojekyll": "" };
  if (site.customDomain) files.CNAME = `${site.customDomain}\n`;
  return files;
}
