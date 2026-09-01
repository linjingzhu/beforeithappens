import { questionsFor } from "../src/packs.js";
import { publishedBySlug } from "./config.js";
import { answeredCount } from "./answers.js";
import { RESULT_COPY, RESULT_FORBIDDEN } from "./result-copy.js";
import { reflect, toQuestionIndex } from "./reflect.js";

/**
 * The build side of the result sheet: resolve a published slug to its questions, then hand them to
 * the same `reflect` the browser uses. The grouping rule lives in one place; this only adapts.
 */
export { RESULT_COPY, RESULT_FORBIDDEN };

export function resultModel(slug, answers, { questions = null } = {}) {
  const entry = publishedBySlug(slug);
  if (!entry) return null;

  const all = questions || questionsFor(entry.catalogId);
  if (!all.length) return null;

  const model = reflect(toQuestionIndex(all), answers);
  return Object.freeze({
    slug: entry.slug,
    title: RESULT_COPY.title,
    ...model,
    stored: answeredCount(answers),
    chapters: Object.freeze(model.chapters.map((bucket) => Object.freeze({
      chapter: bucket.chapter,
      answers: Object.freeze(bucket.answers.map((row) => Object.freeze(row)))
    }))),
    notDiscussed: Object.freeze(model.notDiscussed.map((row) => Object.freeze(row))),
    path: `/${entry.slug}/result/`
  });
}
