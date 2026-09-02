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
  // The Part's own name, because the ten pages of a pack are otherwise told apart by a number.
  // `결혼 100제 (5/10)` and `결혼 100제 (6/10)` give a search engine nothing to distinguish, and give
  // a reader no reason to open one rather than the other; `결혼 100제 5부 우리 사이의 경계` gives both.
  // The pack's name stays in front so the pack's own query still matches at the strongest position.
  const base = model.part?.title
    ? `${model.title} ${model.part.number}부 ${model.part.title}`
    : model.title;
  return `${base} · ${site.name}`;
}

export function pageDescription(model) {
  if (!model) return "";
  // Page one is the pack's front door — the home page links to it and it is what should answer the
  // pack's own name — so it keeps the author's pitch. The others describe the Part they are.
  if (model.page === 1) return model.descriptionText || model.description;
  const first = model.questions[0];
  const last = model.questions[model.questions.length - 1];
  const where = `${model.title} ${model.page}부, ${first.number}번부터 ${last.number}번까지의 질문입니다.`;
  return model.part?.blurb ? `${model.part.blurb} ${where}` : where;
}

function tag(name, content) {
  return content ? `  <meta name="${name}" content="${escapeHtml(content)}">` : "";
}

function property(name, content) {
  return content ? `  <meta property="${name}" content="${escapeHtml(content)}">` : "";
}

/**
 * One head for every public page, so a page cannot be built with half of one.
 *
 * It was not always shared: the question pages called `headTags` and the home page and the three
 * standing pages each wrote their own `<title>` and canonical by hand. The result was that the home
 * page — the one every other page links to — carried no description and no Open Graph tags at all,
 * so a search result invented its own two lines and a link pasted into a chat opened as a bare
 * title. Three copies of the same block is how that happens; there is one now.
 */
function metaBlock({ title, description, url, previousUrl, nextUrl, type = "article" }, site = SITE) {
  const lines = [
    `  <title>${escapeHtml(title)}</title>`,
    tag("description", description),
    url ? `  <link rel="canonical" href="${escapeHtml(url)}">` : "",
    // Prev/next tell a crawler this is one series rather than nine near-duplicates.
    previousUrl ? `  <link rel="prev" href="${escapeHtml(previousUrl)}">` : "",
    nextUrl ? `  <link rel="next" href="${escapeHtml(nextUrl)}">` : "",
    property("og:type", type),
    property("og:title", title),
    property("og:description", description),
    url ? property("og:url", url) : "",
    property("og:locale", site.locale),
    property("og:site_name", site.name),
    tag("twitter:card", "summary")
  ];
  return lines.filter(Boolean).join("\n");
}

export function headTags(model, site = SITE) {
  const at = (path) => (site.origin && path ? absoluteUrl(site.origin, path) : "");
  return metaBlock({
    title: pageTitle(model, site),
    description: pageDescription(model),
    url: model ? at(model.path) : at("/"),
    previousUrl: at(model?.previousPath),
    nextUrl: at(model?.nextPath)
  }, site);
}

/**
 * The head of a page that is not a Part — the home page and the standing pages.
 *
 * `og:type` is `website` for the home page and `article` for the prose ones, which is what those
 * two values mean: one is a site, the others are documents on it.
 */
export function standaloneHead({ title, description, path, type = "article" }, site = SITE) {
  return metaBlock({
    title,
    description,
    url: site.origin ? absoluteUrl(site.origin, path) : "",
    type
  }, site);
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
        // `text` is the question as asked. The app pack's `intent` is a better one-line gloss where
        // it exists; where it does not, the title is the question and repeating it is honest.
        text: question.intent || question.title,
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

/**
 * A sitemap is how a crawler finds page seven, which nothing links to from outside.
 *
 * The root is emitted here rather than passed in, because it was passed in and then it was not:
 * the build handed this function the question pages and the standing pages, and the home page is
 * in neither list, so the one page every other page links to was the one page the sitemap left
 * out. A site always has a root; there is nothing for a caller to decide and so nothing to forget.
 */
export function sitemapXml(pages, site = SITE) {
  const paths = ["/", ...pages.map((model) => model.path)];
  const urls = paths
    .map((path) => `  <url><loc>${escapeHtml(absoluteUrl(site.origin, path))}</loc></url>`)
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
