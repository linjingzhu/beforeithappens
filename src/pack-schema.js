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

/**
 * Which product a pack belongs to, which decides what it must carry.
 *
 * An **app** pack is rendered by `src/app.js`, which prints `intent`, `example`, `whyItMatters` and
 * `researchKeywords` on every question; it sits on a shelf in `PACK_LIST_ROWS` under a `catalogId`,
 * and is sold, so it declares how many questions are free. Those requirements are why the app's
 * pack cannot drift, and they stay exactly as strict as they were.
 *
 * A **site** pack is published as public web pages. It has no shelf and no price, and it carries
 * whatever guidance its author actually wrote — which is not the same across packs. 결혼 100제 is a
 * question and four choices and nothing else; 임신 100제 was written with a scene for every question.
 * Requiring the app's full set of either would mean inventing paragraphs, and invented guidance is
 * worse than none: it reads as advice and is not.
 *
 * So a site pack's guidance fields are optional but **all-or-nothing per field**: every question
 * carries an `example` or none does. That is the rule the earlier "a site pack carries none" was
 * reaching for — half a set renders inconsistently and nothing downstream would report it — without
 * throwing away copy somebody wrote.
 */
export const PACK_SURFACE = Object.freeze({ app: "app", site: "site" });

const REQUIRED_QUESTION_TEXT = ["title", "intent", "example", "whyItMatters"];
const APP_ONLY_QUESTION_FIELDS = ["intent", "example", "whyItMatters", "researchKeywords"];
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

  const surface = raw.surface || PACK_SURFACE.app;
  if (!Object.values(PACK_SURFACE).includes(surface)) {
    fail(id, `surface must be one of ${Object.values(PACK_SURFACE).join(", ")}`);
  }
  const isApp = surface === PACK_SURFACE.app;

  // A catalogId names a shelf in the app's pack list. A site pack has no shelf, and claiming one
  // would advertise it in an app that cannot open it.
  if (isApp) requireText(id, raw.catalogId, "catalogId (the id the app's pack list uses)");
  else if (raw.catalogId) fail(id, "a site pack must not claim a catalogId; it is not on the app's shelf");

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
    // A line introducing the Part, shown once above its questions.
    if (section.blurb !== undefined) requireText(id, section.blurb, `section ${section.id} blurb`);
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
    if (isApp) {
      for (const field of REQUIRED_QUESTION_TEXT) requireText(id, question[field], `${question.id}.${field}`);
      if (!Array.isArray(question.researchKeywords) || question.researchKeywords.length === 0) {
        fail(id, `${question.id}.researchKeywords is required`);
      }
    } else {
      requireText(id, question.title, `${question.id}.title`);
      if (question.researchKeywords !== undefined) {
        fail(id, `${question.id}.researchKeywords is app-only; the site renders no keyword list`);
      }
      if (question.mood !== undefined) requireText(id, question.mood, `${question.id}.mood`);
    }

    const choices = Array.isArray(question.choices) ? question.choices : [];
    if (choices.length !== CHOICES_PER_QUESTION) {
      fail(id, `${question.id} has ${choices.length} choices; the shared format is ${CHOICES_PER_QUESTION}`);
    }
    const labels = new Set();
    for (const choice of choices) {
      requireText(id, choice?.id, `${question.id} choice id`);
      requireText(id, choice?.label, `${question.id}.${choice?.id} label`);
      // The name of the value a choice stands for, where the pack's author wrote one.
      if (choice.valueLabel !== undefined) requireText(id, choice.valueLabel, `${question.id}.${choice.id} valueLabel`);
      // Choice ids are stored on answers, so a collision anywhere in the pack corrupts a reply.
      if (choiceIds.has(choice.id)) fail(id, `duplicate choice id ${choice.id}`);
      choiceIds.add(choice.id);
      if (labels.has(choice.label.trim())) fail(id, `${question.id} repeats the label ${choice.label}`);
      labels.add(choice.label.trim());
    }
  }

  // All-or-nothing per field. A pack where nine questions in ten carry a scene reads as though the
  // tenth lost one, and that is exactly the kind of gap nobody reports.
  if (!isApp) {
    for (const field of [...APP_ONLY_QUESTION_FIELDS, "mood"]) {
      const withField = questions.filter((question) => question[field] !== undefined).length;
      if (withField !== 0 && withField !== questions.length) {
        fail(id, `${field} is on ${withField} of ${questions.length} questions; a site pack carries it on all or none`);
      }
    }
    const withValue = questions.filter((q) => q.choices.every((c) => c.valueLabel !== undefined)).length;
    if (withValue !== 0 && withValue !== questions.length) {
      fail(id, `choice valueLabel is on ${withValue} of ${questions.length} questions; all or none`);
    }
  }

  // Only an app pack is sold, so only an app pack has a gate to describe.
  if (isApp) {
    const free = Number(raw.freeQuestionCount);
    if (!Number.isInteger(free) || free < 0) fail(id, "freeQuestionCount must be a non-negative integer");
    if (free >= questions.length) fail(id, "freeQuestionCount must leave at least one question behind the gate");
  } else if (raw.freeQuestionCount !== undefined) {
    fail(id, "a site pack has no gate, so freeQuestionCount does not apply; every question is free");
  }

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
    surface,
    audience,
    sections: Object.freeze(sections.map((section) => Object.freeze({ ...section }))),
    questions: Object.freeze(raw.questions.map((question) => Object.freeze({ ...question }))),
    /** Ordered by section, renumbered from 1, each carrying its section title as `chapter`. */
    orderedQuestions: Object.freeze(ordered)
  });
}
