import { SITE_PACK_SOURCES, buildSitePack, sitePackSource } from "./lib/site-pack-source.mjs";

/**
 * Generates the site's question-pack modules from the editorial review builds.
 *
 * Run: `node scripts/build-site-packs.mjs` for all of them, or with a slug — `pregnancy`, `birth`,
 * `parenting`, `later` — for one. `scripts/lib/site-pack-source.mjs` holds the reader and the table
 * of what is built; this file is the command.
 */
const [which] = process.argv.slice(2);
const specs = which
  ? [sitePackSource(which) || (() => { throw new Error(`no site pack named ${which}`); })()]
  : SITE_PACK_SOURCES;

for (const spec of specs) {
  const pack = await buildSitePack(spec);
  console.log(`Wrote ${spec.out}: ${pack.questions.length} questions in ${pack.sections.length} sections`);
}
