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
 * A choice alone can only be aggregated, not reflected on. `notDiscussed` is the one extra fact
 * worth capturing: it is observable rather than a self-rating, and it is exactly what turns a list
 * of answers into "these are the ones to bring to the other person".
 */

/** Bumped only if the stored shape changes incompatibly; an unknown version is discarded, not guessed at. */
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
  if (!choiceId) return null;
  return { choiceId, notDiscussed: value.notDiscussed === true };
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
export function withAnswer(answers, questionId, choiceId, notDiscussed = null) {
  const id = String(questionId || "");
  if (!id || !String(choiceId || "")) return answers;
  const previous = answers.items[id];
  return {
    ...answers,
    items: {
      ...answers.items,
      [id]: {
        choiceId: String(choiceId),
        notDiscussed: notDiscussed === null ? Boolean(previous?.notDiscussed) : Boolean(notDiscussed)
      }
    }
  };
}

/** Marking a question undiscussed before answering it is meaningless, so it is refused. */
export function withDiscussionFlag(answers, questionId, notDiscussed) {
  const id = String(questionId || "");
  const previous = answers.items[id];
  if (!previous) return answers;
  return {
    ...answers,
    items: { ...answers.items, [id]: { ...previous, notDiscussed: Boolean(notDiscussed) } }
  };
}

export function clearAnswers(slug) {
  return emptyAnswers(slug);
}

export function answeredCount(answers) {
  return Object.keys(answers?.items || {}).length;
}

export function isComplete(answers, questions) {
  const items = answers?.items || {};
  return (questions || []).every((question) => Boolean(items[question.id]));
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
