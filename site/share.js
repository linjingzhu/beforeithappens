/**
 * Comparing answers with the other person, on a site that has no server.
 *
 * The whole comparison rides in the URL's fragment. A fragment is never sent to a server — not to
 * GitHub Pages, not to any proxy in between — so two people can put their answers side by side
 * without this site ever holding, seeing or logging one. That is the same promise `answers.js`
 * makes about the browser, extended to the one case where the data has to leave it: it leaves in a
 * link the reader hands over themselves, to a person they chose, and nowhere else.
 *
 * What travels is the choices and nothing else. The notes beside a question — why they chose it,
 * what they guessed about the other person, the rule they wrote — stay in the browser they were
 * written in. A choice is what the two of them are here to compare; a note is a private thought
 * about the person who is about to read it.
 *
 * The encoding is positional against the question index the result page already embeds: one
 * character per question, in the pack's own order, `a`–`d` for the choice and `-` for unanswered.
 * A hundred questions is a hundred characters, which fits any browser's URL with room to spare, and
 * it holds no ids — so a link cannot leak which build it came from or be replayed as an answer set
 * for a different pack. The version and slug in front of it are the two things worth refusing on.
 *
 * There is no imports line on purpose: the browser loads this without the pack registry, exactly
 * like `reflect.js`.
 */

export const SHARE_VERSION = "v1";
const BLANK = "-";
const LETTERS = "abcdefghijklmnopqrstuvwxyz";

/** `v1.<slug>.<one character per question>`, or "" when there is nothing worth sending. */
export function encodeShare(slug, questions = [], answers = { items: {} }) {
  const items = answers?.items || {};
  let written = 0;
  const body = questions
    .map((question) => {
      const choiceId = items[question.id]?.choiceId;
      const index = (question.o || []).findIndex((option) => option.id === choiceId);
      if (index < 0 || index >= LETTERS.length) return BLANK;
      written += 1;
      return LETTERS[index];
    })
    .join("");
  if (!written) return "";
  return `${SHARE_VERSION}.${String(slug || "")}.${body}`;
}

/**
 * The other person's choices, as a map of question id to choice id.
 *
 * Everything that does not match exactly is refused rather than repaired: another version, another
 * pack, another length. A link from a build with a different question order would otherwise line
 * answers up against the wrong questions, and a comparison that is quietly wrong is worse than one
 * that says it cannot be read.
 */
export function decodeShare(text, slug, questions = []) {
  const parts = String(text || "").split(".");
  if (parts.length !== 3) return null;
  const [version, from, body] = parts;
  if (version !== SHARE_VERSION) return null;
  if (from !== String(slug || "")) return null;
  if (body.length !== questions.length || !questions.length) return null;

  const items = {};
  for (let i = 0; i < questions.length; i += 1) {
    const character = body[i];
    if (character === BLANK) continue;
    const index = LETTERS.indexOf(character);
    const option = (questions[i].o || [])[index];
    if (index < 0 || !option) return null;
    items[questions[i].id] = option.id;
  }
  return { slug: String(slug || ""), items };
}

/**
 * The two sets side by side, under the rule the app already keeps: the other person's answer to a
 * question appears only once the reader has answered it themselves.
 *
 * Not to make anyone earn it. Seeing what your partner said before you have decided is how an
 * honest answer turns into an agreeable one, and the whole point of a hundred questions is the
 * difference between those two things. Nothing here counts, scores or rates the pair: the rows are
 * sorted so that the questions they answered differently come first, because those are the ones
 * worth an evening, not because a different answer is a worse one.
 */
export function compareAnswers(questions = [], mine = { items: {} }, theirs = { items: {} }) {
  const ours = mine?.items || {};
  const others = theirs?.items || {};
  const differing = [];
  const shared = [];
  const waiting = [];

  for (const question of questions) {
    const myChoiceId = ours[question.id]?.choiceId;
    const theirChoiceId = others[question.id];
    const label = (id) => (question.o || []).find((option) => option.id === id)?.l || "";

    if (!myChoiceId) {
      // Their answer is not read out here, and not put in the row either.
      if (theirChoiceId) waiting.push({ number: question.n, title: question.t, chapter: question.c });
      continue;
    }
    if (!theirChoiceId) continue;

    const row = {
      number: question.n,
      title: question.t,
      chapter: question.c,
      mine: label(myChoiceId),
      theirs: label(theirChoiceId),
      same: myChoiceId === theirChoiceId
    };
    (row.same ? shared : differing).push(row);
  }

  return {
    total: questions.length,
    differing,
    shared,
    waiting,
    /** Both answered this many; the rest is still one person's. */
    compared: differing.length + shared.length,
    empty: differing.length + shared.length === 0
  };
}
