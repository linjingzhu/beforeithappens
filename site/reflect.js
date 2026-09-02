/**
 * The reflection itself: one implementation, used by the build and by the browser.
 *
 * It was briefly two — the generator computing from the pack registry, the page computing from its
 * own embedded index — and two implementations of the same rule drift. This has no imports at all,
 * so the browser can load it without pulling the registry along, and `site/result.js` adapts
 * registry questions into the same shape rather than repeating the logic.
 *
 * A reflection, never a verdict. There is no number here that could be read as a rating: `answered`
 * is a fact about what a person did, not a judgement about their relationship. See
 * `docs/WEB_SERVICE_STRATEGY.md`.
 */

/**
 * `questions` is the compact shape the result page embeds:
 * `{ id, n: number, t: title, c: chapter, o: [{ id, l: label }] }`.
 */
export function reflect(questions = [], answers = { items: {} }) {
  const items = answers?.items || {};
  const chapters = [];
  const byChapter = new Map();

  for (const question of questions) {
    const item = items[question.id];
    if (!item) continue;
    // A stored choice that no longer exists in the pack is dropped rather than rendered blank.
    const choice = (question.o || []).find((option) => option.id === item.choiceId);
    if (!choice) continue;

    if (!byChapter.has(question.c)) {
      const bucket = { chapter: question.c, answers: [] };
      byChapter.set(question.c, bucket);
      chapters.push(bucket);
    }
    byChapter.get(question.c).answers.push({
      questionId: question.id,
      number: question.n,
      title: question.t,
      choice: choice.l
    });
  }

  const answered = chapters.reduce((total, bucket) => total + bucket.answers.length, 0);
  return {
    total: questions.length,
    answered,
    complete: questions.length > 0 && answered === questions.length,
    empty: answered === 0,
    chapters
  };
}

/** The shape the result page embeds and `reflect` consumes. */
export function toQuestionIndex(questions = []) {
  return questions.map((question) => ({
    id: question.id,
    n: question.number,
    t: question.title,
    c: question.chapter,
    o: question.choices.map((choice) => ({ id: choice.id, l: choice.label }))
  }));
}
