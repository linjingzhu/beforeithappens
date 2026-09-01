import { readFile, writeFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { literal } from "./lib/js-literal.mjs";

/**
 * Converts `question-packs/marriage.html` into a pack module.
 *
 * The HTML is the editorial source: it is what the questions were written and reviewed in, and it
 * stays that way. This script does not edit it, and nothing at runtime reads it — the review UI has
 * no business being imported by a build. So the questions are lifted once into a plain module, and
 * `test/marriage-100.test.js` re-runs this extraction to prove the two have not drifted.
 *
 * The source keeps its material in five arrays rather than one. `Q` holds the hundred questions in
 * the order they were written, `tags` the name each choice's value carries, `storyOrder` the order
 * they are read in, `chapters` the ten they are read in groups of, and `arcMoods` the mood of each
 * position within a chapter. Reading order is not writing order, so the pack follows `storyOrder`.
 *
 * Not everything crosses. The source composes a per-question line out of `arcWaves` and the
 * chapter's own `wave`, which is the review build talking to its reviewer about what the next ten
 * questions are for; the site says that once, as the section's blurb, rather than a hundred times.
 *
 * Ids are derived, never authored: `m100-<section>-<n>` for a question and `-a`..`-d` for its
 * choices. Derived ids are stable as long as the order is, and order is the one thing an editorial
 * file preserves. Authored ids would have to be invented for 100 questions and 400 choices, and
 * every one of them would be a chance to collide.
 *
 * Run: `node scripts/build-marriage-100.mjs`
 */
const SOURCE = "question-packs/marriage.html";
const OUT = "src/questions-marriage-100.js";

/**
 * The array literal declared as `name`, evaluated.
 *
 * Sliced by index rather than matched by regex. A lazy quantifier crossing a large file backtracks
 * once per character, and past some engine-dependent threshold it stops matching rather than
 * slowing down — it worked here and returned null on a CI runner one Node patch ahead, which is the
 * worst way to find out. Two `indexOf` calls cannot behave differently on different days.
 *
 * Evaluated rather than parsed, because these are JavaScript literals with unquoted keys and not
 * JSON. It runs in a context with no globals at all, so the worst a literal can do is describe
 * itself; anything else in scope would be a way for an editorial file to run code in a build.
 */
function arrayLiteral(html, name, path) {
  const opening = `const ${name}=[`;
  const start = html.indexOf(opening);
  if (start === -1) throw new Error(`${path}: no ${name} array found`);
  const end = html.indexOf("\n  ];", start);
  if (end === -1) throw new Error(`${path}: the ${name} array is never closed`);

  const value = runInNewContext(html.slice(start + opening.length - 1, end + 4), Object.create(null));
  if (!Array.isArray(value) || !value.length) throw new Error(`${path}: ${name} is empty`);
  // Copied out of the sandbox rather than handed back from it. Objects built in another realm carry
  // that realm's prototypes, so they are equal to a plain object in every way a reader can see and
  // unequal to `assert.deepEqual`, which compares prototypes — a drift test that fails on identical
  // text is worse than no drift test.
  return structuredClone(value);
}

export async function readSource(path = SOURCE) {
  const html = await readFile(path, "utf8");
  const source = {
    chapters: arrayLiteral(html, "chapters", path),
    moods: arrayLiteral(html, "arcMoods", path),
    questions: arrayLiteral(html, "Q", path),
    values: arrayLiteral(html, "tags", path),
    order: arrayLiteral(html, "storyOrder", path)
  };

  const perChapter = source.questions.length / source.chapters.length;
  if (!Number.isInteger(perChapter)) {
    throw new Error(`${path}: ${source.questions.length} questions do not divide into ${source.chapters.length} chapters`);
  }
  if (source.moods.length !== perChapter) {
    throw new Error(`${path}: ${source.moods.length} moods for ${perChapter} questions a chapter`);
  }
  if (source.values.length !== source.questions.length) {
    throw new Error(`${path}: ${source.values.length} value sets for ${source.questions.length} questions`);
  }
  // Reading order is a permutation, so a question dropped or repeated by a hand edit is caught here
  // rather than by a reader meeting the same question twice.
  const seen = new Set(source.order);
  if (source.order.length !== source.questions.length || seen.size !== source.questions.length) {
    throw new Error(`${path}: storyOrder is not a permutation of the ${source.questions.length} questions`);
  }
  for (const n of source.order) {
    if (!Number.isInteger(n) || n < 1 || n > source.questions.length) {
      throw new Error(`${path}: storyOrder names question ${n}`);
    }
  }
  return source;
}

/** Groups the questions into chapters in reading order, and derives every id. */
export function toPack({ chapters, moods, questions, values, order }) {
  const perChapter = questions.length / chapters.length;

  const sections = chapters.map((chapter, index) => {
    const title = String(chapter.title || "").trim();
    const blurb = String(chapter.desc || "").trim();
    if (!title) throw new Error(`chapter ${index + 1} has no title`);
    if (!blurb) throw new Error(`${title} has no description`);
    return { id: `s${String(index + 1).padStart(2, "0")}`, title, blurb };
  });

  const read = order.map((sourceNumber) => ({
    ...questions[sourceNumber - 1],
    values: values[sourceNumber - 1]
  }));

  const built = [];
  sections.forEach((section, chapterIndex) => {
    read.slice(chapterIndex * perChapter, (chapterIndex + 1) * perChapter).forEach((item, index) => {
      const id = `m100-${section.id}-${String(index + 1).padStart(2, "0")}`;
      const scene = String(item.s || "").trim();
      if (!scene) throw new Error(`${id} has no scene`);
      built.push({
        id,
        sectionId: section.id,
        title: String(item.q).trim(),
        scene,
        mood: String(moods[index]).trim(),
        choices: item.o.map((label, choiceIndex) => ({
          id: `${id}-${"abcd"[choiceIndex]}`,
          label: String(label).trim(),
          valueLabel: String(item.values[choiceIndex]).trim()
        }))
      });
    });
  });

  return { sections, questions: built };
}

function render({ sections, questions }) {
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
    scene: ${literal(question.scene)},
    mood: ${literal(question.mood)},
    choices: [
${choices}
    ]
  }`;
    })
    .join(",\n");

  return `/**
 * 결혼 100제 — the site's pack. Generated; do not edit by hand.
 *
 * Source: \`question-packs/marriage.html\`, the editorial review build.
 * Regenerate: \`node scripts/build-marriage-100.mjs\`. \`test/marriage-100.test.js\` fails if this
 * file and that one disagree, so an edit here without an edit there does not survive CI.
 *
 * This is not the app's marriage pack. That one is \`src/questions.js\`: twelve questions, each with
 * the guidance copy the app's screens render, sold behind an entitlement. This one is ${questions.length}
 * questions with no guidance copy, free, and published as web pages. They share a schema and a
 * subject and nothing else.
 */
import { definePack, PACK_SURFACE } from "./pack-schema.js";

export const marriage100Pack = definePack({
  id: "marriage-100",
  surface: PACK_SURFACE.site,
  audience: "couple",
  version: "2026-09-01",
  locale: "ko-KR",
  title: "결혼 100제",
  sections: [
${sectionLines}
  ],
  questions: [
${questionLines}
  ]
});

export const marriage100Questions = marriage100Pack.orderedQuestions;
`;
}

const pack = toPack(await readSource());
await writeFile(OUT, render(pack));
console.log(`Wrote ${OUT}: ${pack.questions.length} questions in ${pack.sections.length} sections`);
