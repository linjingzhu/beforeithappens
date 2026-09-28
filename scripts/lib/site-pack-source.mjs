import { readFile, writeFile } from "node:fs/promises";
import { literal } from "./js-literal.mjs";

/**
 * Turning an editorial review build in `question-packs/` into a site pack module.
 *
 * The four lifecycle packs — 임신, 출산, 육아, 노후 — are written as one document each: a rendered
 * HTML page an author reads end to end, with the questions as `<article data-q>` elements inside
 * `<section>`s. That document stays the source of truth; nothing at runtime reads it. This reader is
 * what stands between it and `src/questions-*.js`, and `test/site-packs.test.js` re-runs the
 * extraction on every pack so the two cannot drift apart unnoticed.
 *
 * It was `scripts/build-pregnancy-100.mjs`, which read one file and hardcoded one pack's metadata.
 * Four packs written to the same template did not need four copies of it — and the copies are where
 * a fix to the reader reaches one pack and not the other three.
 *
 * **The emergency appendix is deliberately not extracted.** Every lifecycle pack ends with one: a
 * quiz with right and wrong answers (`data-correct`) about bleeding, 진통, 고열, 낙상. Two reasons it
 * stays out. The site's whole contract is that there is no score and no verdict —
 * `site/result-copy.js` forbids the vocabulary — and a quiz with correct answers cannot live inside
 * that. And `question-packs/README.md` requires medical review before that content is promoted to a
 * runtime, which is a person's job and not this script's.
 */

/**
 * Every pack the site builds, and the two things about it that are not in the source document.
 *
 * `idPrefix` is what question ids are built from, and it is per pack because a reader's saved
 * answers are keyed by question id: two packs sharing a prefix would share ids, and one pack's
 * answers would read as another's. 임신 keeps `p100` — the prefix it was generated with before this
 * table existed, and changing it would rewrite four hundred ids to no end.
 *
 * `version` is the pack identity stamped onto an answer round, so it is the date the questions last
 * changed, not the date this script ran.
 */
export const SITE_PACK_SOURCES = Object.freeze([
  Object.freeze({
    slug: "pregnancy",
    id: "pregnancy-100",
    exportBase: "pregnancy100",
    title: "임신 100제",
    source: "question-packs/pregnancy.html",
    out: "src/questions-pregnancy-100.js",
    idPrefix: "p100",
    version: "2026-09-05"
  }),
  Object.freeze({
    slug: "birth",
    id: "birth-100",
    exportBase: "birth100",
    title: "출산 100제",
    source: "question-packs/birth.html",
    out: "src/questions-birth-100.js",
    idPrefix: "b100",
    version: "2026-09-28"
  }),
  Object.freeze({
    slug: "parenting",
    id: "parenting-100",
    exportBase: "parenting100",
    title: "육아 100제",
    source: "question-packs/parenting.html",
    out: "src/questions-parenting-100.js",
    idPrefix: "c100",
    version: "2026-09-28"
  }),
  Object.freeze({
    slug: "later",
    id: "later-100",
    exportBase: "later100",
    title: "노후 100제",
    source: "question-packs/later.html",
    out: "src/questions-later-100.js",
    idPrefix: "l100",
    version: "2026-09-28"
  })
]);

export function sitePackSource(slugOrId) {
  const key = String(slugOrId || "");
  return SITE_PACK_SOURCES.find((spec) => spec.slug === key || spec.id === key) || null;
}

const text = (html) => String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

/**
 * The sections of one source document, as the author wrote them.
 *
 * The file is machine-generated and uniform, which is what makes reading structure out of markup
 * safe. Every field is asserted, so a mis-read surfaces as a named failure rather than as a pack
 * that is quietly missing a line.
 */
export async function readSourceSections(path) {
  if (!path) throw new Error("readSourceSections needs a source path");
  const html = await readFile(path, "utf8");
  // Everything before the appendix; see the note at the top of this file.
  const emergency = html.indexOf('<section id="emergency"');
  if (emergency === -1) throw new Error(`${path}: expected an emergency section to cut before`);
  const core = html.slice(0, emergency);

  const sections = core.split(/(?=<section\b)/).slice(1);
  if (!sections.length) throw new Error(`${path}: no sections found`);

  return sections.map((block) => {
    const title = text(block.match(/<h2>([\s\S]*?)<\/h2>/)?.[1] || "");
    const blurb = text(block.match(/<h2>[\s\S]*?<\/h2>\s*<p>([\s\S]*?)<\/p>/)?.[1] || "");
    if (!title) throw new Error(`${path}: a section has no title`);
    if (!blurb) throw new Error(`${path}: section ${title} has no introduction`);

    const questions = [...block.matchAll(/<article data-q="(\d+)">([\s\S]*?)<\/article>/g)].map(([, n, article]) => {
      const question = {
        sourceNumber: Number(n),
        title: text(article.match(/<h3>([\s\S]*?)<\/h3>/)?.[1] || ""),
        // The one line that is genuinely this question's: a hundred distinct scenes. The `wave`
        // line beside it is not extracted — there are ten of them cycling across the hundred, so it
        // glosses the mood tag rather than the question, and printing it ten times to a page is
        // noise where the tag says the same thing in a word.
        example: text(article.match(/<div class="scene"><b>[^<]*<\/b><p>([\s\S]*?)<\/p>/)?.[1] || ""),
        mood: text(article.match(/<span class="mood">([\s\S]*?)<\/span>/)?.[1] || ""),
        // `<label>` with nothing on it: the review build's star ratings are `<label title="1점">`
        // and the 우울 pack's follow-up is `<label>` around a `<select>`, so the bare-label-then-radio
        // shape is what separates the four answers from everything else wearing a label.
        choices: [...article.matchAll(/<label><input type="radio"[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span><\/label>/g)]
          .map(([, span]) => ({
            label: text(span.replace(/<small>[\s\S]*?<\/small>/, "")),
            valueLabel: text(span.match(/<small>([\s\S]*?)<\/small>/)?.[1] || "")
          }))
      };
      for (const [field, value] of Object.entries(question)) {
        if (field !== "choices" && !value) throw new Error(`${path}: question ${n} has no ${field}`);
      }
      if (question.choices.length !== 4) {
        throw new Error(`${path}: question ${n} has ${question.choices.length} choices, expected 4`);
      }
      for (const choice of question.choices) {
        if (!choice.label || !choice.valueLabel) throw new Error(`${path}: question ${n} has an empty choice`);
      }
      return question;
    });

    if (!questions.length) throw new Error(`${path}: section ${title} has no questions`);
    return { title, blurb, questions };
  });
}

/** Ids are derived from position, never authored — four hundred choices is four hundred collisions. */
export function toPack(sections, idPrefix) {
  if (!idPrefix) throw new Error("toPack needs an id prefix");
  const out = { sections: [], questions: [] };
  sections.forEach((section, index) => {
    const id = `s${String(index + 1).padStart(2, "0")}`;
    out.sections.push({ id, title: section.title, blurb: section.blurb });
    section.questions.forEach((question, position) => {
      const questionId = `${idPrefix}-${id}-${String(position + 1).padStart(2, "0")}`;
      out.questions.push({
        id: questionId,
        sectionId: id,
        title: question.title,
        example: question.example,
        mood: question.mood,
        choices: question.choices.map((choice, choiceIndex) => ({
          id: `${questionId}-${"abcd"[choiceIndex]}`,
          label: choice.label,
          valueLabel: choice.valueLabel
        }))
      });
    });
  });
  return out;
}

export function renderModule(spec, { sections, questions }) {
  const sectionLines = sections
    .map((section) => `  { id: ${literal(section.id)}, title: ${literal(section.title)}, blurb: ${literal(section.blurb)} }`)
    .join(",\n");

  const questionLines = questions
    .map((question) => {
      const choices = question.choices
        .map((choice) => `      { id: ${literal(choice.id)}, label: ${literal(choice.label)}, valueLabel: ${literal(choice.valueLabel)} }`)
        .join(",\n");
      return `  {
    id: ${literal(question.id)},
    sectionId: ${literal(question.sectionId)},
    title: ${literal(question.title)},
    example: ${literal(question.example)},
    mood: ${literal(question.mood)},
    choices: [
${choices}
    ]
  }`;
    })
    .join(",\n");

  return `/**
 * ${spec.title} — a site pack. Generated; do not edit by hand.
 *
 * Source: \`${spec.source}\`, the editorial review build.
 * Regenerate: \`node scripts/build-site-packs.mjs ${spec.slug}\`. \`test/site-packs.test.js\` fails if
 * this file and that one disagree.
 *
 * The source's last section — the emergency appendix — is not here on purpose. It is a quiz with
 * right and wrong answers about emergencies, which cannot live inside a site whose whole contract is
 * that there is no score and no verdict, and \`question-packs/README.md\` requires medical review
 * before that material is promoted to any runtime.
 */
import { definePack, PACK_SURFACE } from "./pack-schema.js";

export const ${spec.exportBase}Pack = definePack({
  id: ${literal(spec.id)},
  surface: PACK_SURFACE.site,
  audience: "couple",
  version: ${literal(spec.version)},
  locale: "ko-KR",
  title: ${literal(spec.title)},
  sections: [
${sectionLines}
  ],
  questions: [
${questionLines}
  ]
});

export const ${spec.exportBase}Questions = ${spec.exportBase}Pack.orderedQuestions;
`;
}

/** Reads one spec's source and writes its module. Returns the pack, for a caller that reports. */
export async function buildSitePack(spec) {
  const pack = toPack(await readSourceSections(spec.source), spec.idPrefix);
  await writeFile(spec.out, renderModule(spec, pack));
  return pack;
}
