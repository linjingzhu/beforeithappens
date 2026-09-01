import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { siteWith } from "../site/config.js";
import { allPages, indexModel } from "../site/content.js";
import { renderIndex, renderQuestionPage } from "../site/render.js";
import { robotsTxt, sitemapXml } from "../site/seo.js";

/**
 * Generates the public question site into `site/dist/`.
 *
 * Separate from `scripts/build.mjs` because the two are separate deployables: the app's API holds
 * couples' private notes and the site wants to be cached by strangers, so they do not belong in
 * one process on one origin. They share this repository, and nothing else.
 *
 * Every page is written as `<slug>/<n>/index.html` so a static host serves it at a trailing-slash
 * URL with no rewrite rules to configure — the cheapest hosting arrangement that still gives clean
 * URLs, which matters because the whole point is being crawled.
 *
 * Run: `AB_SITE_ORIGIN=https://… AB_APP_ORIGIN=https://… node scripts/build-site.mjs`
 * Both origins are optional: without them the pages build and read correctly, they just carry no
 * canonical and the call to action points at `/`. A real deployment should set them.
 */
const OUT = "site/dist";

const site = siteWith({
  origin: String(process.env.AB_SITE_ORIGIN || "").replace(/\/$/, ""),
  appOrigin: String(process.env.AB_APP_ORIGIN || "").replace(/\/$/, "")
});

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await cp("site/site.css", join(OUT, "site.css"));
await cp("src/tokens.css", join(OUT, "tokens.css"));

await writeFile(join(OUT, "index.html"), renderIndex(indexModel({ site }), site));

const pages = allPages({ site });
for (const model of pages) {
  // model.path is `/slug/` or `/slug/2/`; both become a directory with an index.html in it.
  const dir = join(OUT, model.path.replace(/^\/|\/$/g, ""));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), renderQuestionPage(model, site));
}

await writeFile(join(OUT, "sitemap.xml"), sitemapXml(pages, site));
await writeFile(join(OUT, "robots.txt"), robotsTxt(site));

console.log(`Built AB question site to ${OUT}/ (${pages.length} question page${pages.length === 1 ? "" : "s"})`);
if (!site.origin) console.log("  note: AB_SITE_ORIGIN is unset, so pages carry no canonical URL");
if (!site.appOrigin) console.log("  note: AB_APP_ORIGIN is unset, so the call to action points at /");
