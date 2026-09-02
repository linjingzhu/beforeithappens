/**
 * What a reader's answers are, and where they live.
 *
 * They live in the reader's browser and nowhere else. Not on a server, not in a session, not
 * behind an account. That is not a shortcut around building an API — it is the strongest available
 * version of the safety rule in `docs/WEB_SERVICE_STRATEGY.md`: some fraction of people answering a
 * hundred questions alone about a partner need to be able to leave without a trace, and the surest
 * way to offer that is for there to be no trace anywhere else to begin with. It also means the site
 * collects no personal data at all until someone opts into delivery, which defers the entire
 * privacy burden to the step that actually earns it.
 *
 * A question holds what the reader wrote beside it: how much the choice matters to them, why
 * they chose it, and what they think the other person will choose. Those are notes, not data about
 * a person: they never leave the browser either, and
 * `importance` is the only one with fixed values, so it is the only one checked against a list.
 * Notes can exist without a choice — someone may write before they decide — so an item is kept if
 * it carries either. Each note is capped, because a runaway paste is the one way a page of
 * textareas can fill a storage quota and lose the rest of the answers with it.
 */

/** The named fields a question can carry beside its choice, and what each one may hold. */
export const IMPORTANCE_VALUES = Object.freeze(["light", "hope", "need"]);
export const NOTE_FIELDS = Object.freeze(["importance", "reason", "guess"]);
const NOTE_MAX = 2000;

function validNote(field, value) {
  if (typeof value !== "string") return "";
  if (field === "importance") return IMPORTANCE_VALUES.includes(value) ? value : "";
  return value.slice(0, NOTE_MAX);
}

/**
 * Bumped only if the stored shape changes incompatibly; an unknown version is discarded, not
 * guessed at.
 *
 * Still 1 after `notDiscussed` was removed, deliberately. Answers already in a reader's browser
 * carry that field; `validItem` now builds an item from the fields it knows and simply does not
 * read it, so an old set loads with every choice and every note intact. Bumping the version would
 * have discarded the answers of anyone mid-pack to remove a field nothing reads.
 */
export const ANSWERS_VERSION = 1;

export function storageKey(slug) {
  return `ab.site.answers.${String(slug || "")}`;
}

export function emptyAnswers(slug) {
  return { version: ANSWERS_VERSION, slug: String(slug || ""), items: {} };
}

function validItem(value) {
  if (!value || typeof value !== "object") return null;
  const choiceId = typeof value.choiceId === "string" ? value.choiceId : "";
  const item = { choiceId };
  let written = false;
  for (const field of NOTE_FIELDS) {
    const note = validNote(field, value[field]);
    if (note) {
      item[field] = note;
      written = true;
    }
  }
  return choiceId || written ? item : null;
}

/**
 * Reads whatever is in storage into a shape the rest of the code can trust. Anything unparseable,
 * from the wrong version, or for the wrong pack is treated as absent rather than repaired — a
 * half-understood answer set is worse than a blank one.
 */
export function parseAnswers(raw, slug) {
  if (typeof raw !== "string" || !raw) return emptyAnswers(slug);
  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    return emptyAnswers(slug);
  }
  if (!value || typeof value !== "object") return emptyAnswers(slug);
  if (value.version !== ANSWERS_VERSION) return emptyAnswers(slug);
  if (String(value.slug || "") !== String(slug || "")) return emptyAnswers(slug);

  const items = {};
  for (const [questionId, item] of Object.entries(value.items || {})) {
    const kept = validItem(item);
    if (kept) items[questionId] = kept;
  }
  return { version: ANSWERS_VERSION, slug: String(slug || ""), items };
}

export function serializeAnswers(answers) {
  return JSON.stringify({
    version: ANSWERS_VERSION,
    slug: answers?.slug || "",
    items: answers?.items || {}
  });
}

/** Returns a new set; the input is not mutated, so a caller can compare before and after. */
export function withAnswer(answers, questionId, choiceId) {
  const id = String(questionId || "");
  if (!id || !String(choiceId || "")) return answers;
  const previous = answers.items[id];
  return {
    ...answers,
    items: {
      ...answers.items,
      [id]: {
        // Whatever was written beside the question survives a change of mind about the answer.
        ...previous,
        choiceId: String(choiceId)
      }
    }
  };
}

/**
 * Records one note. Unlike a choice this may be the first thing a question holds, so it creates the
 * item rather than refusing; clearing the field back to empty removes it, and an item left holding
 * nothing at all is dropped rather than kept as a husk.
 */
export function withNote(answers, questionId, field, value) {
  const id = String(questionId || "");
  if (!id || !NOTE_FIELDS.includes(field)) return answers;
  const note = validNote(field, typeof value === "string" ? value : "");
  const previous = answers.items[id] || { choiceId: "" };
  const next = { ...previous };
  if (note) next[field] = note;
  else delete next[field];

  const items = { ...answers.items };
  const empty = !next.choiceId && NOTE_FIELDS.every((name) => !next[name]);
  if (empty) delete items[id];
  else items[id] = next;
  return { ...answers, items };
}

export function clearAnswers(slug) {
  return emptyAnswers(slug);
}

/** Answered means a choice was made. A question holding only notes is written on, not answered. */
export function answeredCount(answers) {
  return Object.values(answers?.items || {}).filter((item) => Boolean(item?.choiceId)).length;
}

export function isComplete(answers, questions) {
  const items = answers?.items || {};
  return (questions || []).every((question) => Boolean(items[question.id]?.choiceId));
}

/**
 * The browser side of the same thing. Storage can throw outright — a private window, site data
 * blocked — so every call is guarded and a failure reads as "no answers yet" rather than breaking
 * the page. A reader who cannot store answers can still read every question.
 */
export function createAnswerStore(slug, storage = globalThis.localStorage) {
  const key = storageKey(slug);
  return {
    read() {
      try {
        return parseAnswers(storage?.getItem(key), slug);
      } catch {
        return emptyAnswers(slug);
      }
    },
    write(answers) {
      try {
        storage?.setItem(key, serializeAnswers(answers));
        return true;
      } catch {
        return false;
      }
    },
    /** The visible way to leave without a trace. */
    clear() {
      try {
        storage?.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };
}
