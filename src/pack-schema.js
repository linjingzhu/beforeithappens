/**
 * What a question pack has to be, enforced at definition time.
 *
 * Until now these rules lived in `test/questions.test.js` and were asserted by hand against the one
 * pack that existed. That is fine for one pack and useless for the second: a new pack could repeat
 * a choice id, skip `whyItMatters`, or claim more free questions than it has, and nothing would
 * notice until a screen rendered wrong. `definePack` makes them structural, so a pack that breaks
 * an invariant fails at import rather than in front of someone.
 *
 * It also owns the derivation that used to sit inline at the bottom of `src/questions.js` —
 * ordering by section, renumbering, and attaching the section title as `chapter` — so every pack
 * presents its questions the same way instead of each one re-deriving it.
 */

/**
 * Who answers a pack, and it is not decoration.
 *
 * A `couple` pack runs through `server/answers.mjs`, which refuses to open without an accepted
 * partner and reveals only once both have submitted. A `solo` pack — the web service's
 * `혼자만의 연애` — has one person and no reveal, so putting it through that machinery would be
 * incoherent. The registry carries the distinction so the server can refuse rather than improvise.
 */
export const PACK_AUDIENCE = Object.freeze({ couple: "couple", solo: "solo" });

const REQUIRED_QUESTION_TEXT = ["title", "intent", "example", "whyItMatters"];
const CHOICES_PER_QUESTION = 4;

function fail(packId, message) {
  throw new Error(`pack ${packId || "(unnamed)"}: ${message}`);
}

function requireText(packId, value, what) {
  if (typeof value !== "string" || !value.trim()) fail(packId, `${what} is required`);
}

/**
 * Validates a raw pack and returns a frozen one whose `questions` are ordered, renumbered and
 * carry their section title. The input is not mutated.
 */
export function definePack(raw = {}) {
  const id = raw.id;
  requireText(id, id, "id");
  requireText(id, raw.catalogId, "catalogId (the id the app's pack list uses)");
  requireText(id, raw.version, "version");
  requireText(id, raw.locale, "locale");
  requireText(id, raw.title, "title");

  const audience = raw.audience || PACK_AUDIENCE.couple;
  if (!Object.values(PACK_AUDIENCE).includes(audience)) {
    fail(id, `audience must be one of ${Object.values(PACK_AUDIENCE).join(", ")}`);
  }

  const sections = Array.isArray(raw.sections) ? raw.sections : [];
  if (!sections.length) fail(id, "at least one section is required");
  const sectionIds = new Set();
  for (const section of sections) {
    requireText(id, section?.id, "section id");
    requireText(id, section?.title, `section ${section?.id} title`);
    if (sectionIds.has(section.id)) fail(id, `duplicate section id ${section.id}`);
    sectionIds.add(section.id);
  }

  const questions = Array.isArray(raw.questions) ? raw.questions : [];
  if (!questions.length) fail(id, "a pack with no questions cannot be defined");

  const questionIds = new Set();
  const choiceIds = new Set();
  for (const question of questions) {
    requireText(id, question?.id, "question id");
    if (questionIds.has(question.id)) fail(id, `duplicate question id ${question.id}`);
    questionIds.add(question.id);
    if (!sectionIds.has(question.sectionId)) fail(id, `${question.id} points at unknown section ${question.sectionId}`);
    for (const field of REQUIRED_QUESTION_TEXT) requireText(id, question[field], `${question.id}.${field}`);
    if (!Array.isArray(question.researchKeywords) || question.researchKeywords.length === 0) {
      fail(id, `${question.id}.researchKeywords is required`);
    }

    const choices = Array.isArray(question.choices) ? question.choices : [];
    if (choices.length !== CHOICES_PER_QUESTION) {
      fail(id, `${question.id} has ${choices.length} choices; the shared format is ${CHOICES_PER_QUESTION}`);
    }
    const labels = new Set();
    for (const choice of choices) {
      requireText(id, choice?.id, `${question.id} choice id`);
      requireText(id, choice?.label, `${question.id}.${choice?.id} label`);
      // Choice ids are stored on answers, so a collision anywhere in the pack corrupts a reply.
      if (choiceIds.has(choice.id)) fail(id, `duplicate choice id ${choice.id}`);
      choiceIds.add(choice.id);
      if (labels.has(choice.label.trim())) fail(id, `${question.id} repeats the label ${choice.label}`);
      labels.add(choice.label.trim());
    }
  }

  const free = Number(raw.freeQuestionCount);
  if (!Number.isInteger(free) || free < 0) fail(id, "freeQuestionCount must be a non-negative integer");
  if (free >= questions.length) fail(id, "freeQuestionCount must leave at least one question behind the gate");

  const sectionsById = Object.fromEntries(sections.map((section) => [section.id, section]));
  const sectionOrder = Object.fromEntries(sections.map((section, index) => [section.id, index]));
  const ordered = [...questions]
    .sort((a, b) => sectionOrder[a.sectionId] - sectionOrder[b.sectionId])
    .map((question, index) => Object.freeze({
      ...question,
      number: index + 1,
      chapter: sectionsById[question.sectionId].title
    }));

  return Object.freeze({
    ...raw,
    audience,
    sections: Object.freeze(sections.map((section) => Object.freeze({ ...section }))),
    questions: Object.freeze(raw.questions.map((question) => Object.freeze({ ...question }))),
    /** Ordered by section, renumbered from 1, each carrying its section title as `chapter`. */
    orderedQuestions: Object.freeze(ordered)
  });
}
