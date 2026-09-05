import { readFile, writeFile } from "node:fs/promises";
import { literal } from "./lib/js-literal.mjs";

/**
 * Converts `question-packs/pregnancy.html` into a pack module.
 *
 * Same arrangement as `build-marriage-100.mjs` — the HTML stays the editorial source, nothing at
 * runtime reads it, and `test/pregnancy-100.test.js` re-runs this extraction to prove the two have
 * not drifted — but the source is shaped differently and so is this reader. 결혼 100제 keeps its
 * questions in a `const QUESTIONS = [...]` array; 임신 100제 is a rendered document whose questions
 * are `<article data-q>` elements inside `<section>`s, so the structure has to be read out of the
 * markup. The file is machine-generated and uniform, which is what makes that safe; a mis-read
 * shows up as a missing field rather than as silence, because every field is asserted below.
 *
 * **The emergency appendix is deliberately not extracted.** It is the 11th section, and it is a
 * different kind of thing: a quiz with right and wrong answers (`data-correct`) about bleeding,
 * pre-eclampsia and when to call 119. Two reasons it stays out. The site's whole contract is that
 * there is no score and no verdict — `site/result-copy.js` forbids the vocabulary — and a quiz with
 * correct answers cannot live inside that. And `question-packs/README.md` requires medical review
 * before that content is promoted to a runtime, which is a person's job and not this script's.
 *
 * Run: `node scripts/build-pregnancy-100.mjs`
 */
const SOURCE = "question-packs/pregnancy.html";
const OUT = "src/questions-pregnancy-100.js";

const text = (html) => String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export async function readSourceSections(path = SOURCE) {
  const html = await readFile(path, "utf8");
  // Everything before the appendix; see the note above.
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
export function toPack(sections) {
  const out = { sections: [], questions: [] };
  sections.forEach((section, index) => {
    const id = `s${String(index + 1).padStart(2, "0")}`;
    out.sections.push({ id, title: section.title, blurb: section.blurb });
    section.questions.forEach((question, position) => {
      const questionId = `p100-${id}-${String(position + 1).padStart(2, "0")}`;
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
    example: ${literal(question.example)},
    mood: ${literal(question.mood)},
    choices: [
${choices}
    ]
  }`;
    })
    .join(",\n");

  return `/**
 * 임신 100제 — a site pack. Generated; do not edit by hand.
 *
 * Source: \`question-packs/pregnancy.html\`, the editorial review build.
 * Regenerate: \`node scripts/build-pregnancy-100.mjs\`. \`test/pregnancy-100.test.js\` fails if this
 * file and that one disagree.
 *
 * The source's 11th section — the emergency appendix — is not here on purpose. It is a quiz with
 * right and wrong answers about obstetric emergencies, which cannot live inside a site whose whole
 * contract is that there is no score and no verdict, and \`question-packs/README.md\` requires
 * medical review before that material is promoted to any runtime.
 */
import { definePack, PACK_SURFACE } from "./pack-schema.js";

export const pregnancy100Pack = definePack({
  id: "pregnancy-100",
  surface: PACK_SURFACE.site,
  audience: "couple",
  version: "2026-09-05",
  locale: "ko-KR",
  title: "임신 100제",
  sections: [
${sectionLines}
  ],
  questions: [
${questionLines}
  ]
});

export const pregnancy100Questions = pregnancy100Pack.orderedQuestions;
`;
}

const pack = toPack(await readSourceSections());
await writeFile(OUT, render(pack));
console.log(`Wrote ${OUT}: ${pack.questions.length} questions in ${pack.sections.length} sections`);
