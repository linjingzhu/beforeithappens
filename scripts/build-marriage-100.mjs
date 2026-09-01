import { readFile, writeFile } from "node:fs/promises";
import { literal } from "./lib/js-literal.mjs";

/**
 * Converts `question-packs/marriage.html` into a pack module.
 *
 * The HTML is the editorial source: it is what the questions were written and reviewed in, and it
 * stays that way. This script does not edit it, and nothing at runtime reads it — 550KB of review
 * UI has no business being imported by a build. So the questions are lifted once into a plain
 * module, and `test/marriage-100.test.js` re-runs this extraction to prove the two have not drifted.
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

export async function readSourceQuestions(path = SOURCE) {
  const html = await readFile(path, "utf8");

  // Sliced by index rather than matched by regex. `const QUESTIONS = (\[[\s\S]*?\]);` did the same
  // job and did it fragilely: a lazy quantifier crossing half a megabyte backtracks once per
  // character, and past some engine-dependent threshold it stops matching rather than slowing down.
  // It worked here and returned null on a CI runner one Node patch ahead, which is the worst way to
  // find out. Two `indexOf` calls cannot behave differently on different days.
  const opening = "const QUESTIONS = [";
  const start = html.indexOf(opening);
  if (start === -1) throw new Error(`${path}: no QUESTIONS array found`);
  const end = html.indexOf("];", start);
  if (end === -1) throw new Error(`${path}: the QUESTIONS array is never closed`);

  const raw = JSON.parse(html.slice(start + opening.length - 1, end + 1));
  if (!Array.isArray(raw) || !raw.length) throw new Error(`${path}: QUESTIONS is empty`);
  return raw;
}

/** Groups by category in first-appearance order, and derives every id. */
export function toPack(raw) {
  const order = [];
  const byCategory = new Map();
  for (const item of raw) {
    const category = String(item.category || "").trim();
    if (!category) throw new Error(`question without a category: ${item.question}`);
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
      order.push(category);
    }
    byCategory.get(category).push(item);
  }

  const sections = order.map((title, index) => ({
    id: `s${String(index + 1).padStart(2, "0")}`,
    title
  }));

  const questions = [];
  for (const section of sections) {
    byCategory.get(section.title).forEach((item, index) => {
      const id = `m100-${section.id}-${String(index + 1).padStart(2, "0")}`;
      questions.push({
        id,
        sectionId: section.id,
        title: String(item.question).trim(),
        choices: item.options.map((label, choiceIndex) => ({
          id: `${id}-${"abcd"[choiceIndex]}`,
          label: String(label).trim()
        }))
      });
    });
  }

  return { sections, questions };
}

function render({ sections, questions }) {
  const sectionLines = sections
    .map((section) => `  { id: ${literal(section.id)}, title: ${literal(section.title)} }`)
    .join(",\n");

  const questionLines = questions
    .map((question) => {
      const choices = question.choices
        .map((choice) => `      { id: ${literal(choice.id)}, label: ${literal(choice.label)} }`)
        .join(",\n");
      return `  {
    id: ${literal(question.id)},
    sectionId: ${literal(question.sectionId)},
    title: ${literal(question.title)},
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

const pack = toPack(await readSourceQuestions());
await writeFile(OUT, render(pack));
console.log(`Wrote ${OUT}: ${pack.questions.length} questions in ${pack.sections.length} sections`);
