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
 * The encoding is positional against the question index the result page already embeds, so it
 * holds no ids — a link cannot leak which build it came from or be replayed as an answer set for a
 * different pack. The version and slug in front of it are the two things worth refusing on.
 *
 * Two versions are read and one is written. `v1` was one character per question, `a`–`d` for the
 * choice and `-` for unanswered: a hundred questions, a hundred characters, plain enough to read by
 * eye. `v2` packs the same five states three to a byte (5³ = 125 fits one byte) and writes the
 * bytes as base64url, so a hundred questions is 46 characters rather than a hundred and the link
 * reads as a token rather than a stripe of dashes — at the owner's word, the address should look
 * clean. It is still only the choices, still only in the fragment, still refused if anything about
 * it does not match. Links already sent as `v1` keep working: a link is a promise made to the
 * person holding it.
 *
 * There is no imports line on purpose: the browser loads this without the pack registry, exactly
 * like `reflect.js`.
 */
export const SHARE_VERSION = "v2";
const LEGACY_VERSION = "v1";
const BLANK = "-";
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
/** v2 holds five states per question: 0 for unanswered, 1–4 for the choice. */
const STATES = 5;
const PER_BYTE = 3;
const BASE64URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function toBase64url(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const c = i + 2 < bytes.length ? bytes[i + 2] : 0;
    const n = (a << 16) | (b << 8) | c;
    out += BASE64URL[(n >> 18) & 63] + BASE64URL[(n >> 12) & 63];
    if (i + 1 < bytes.length) out += BASE64URL[(n >> 6) & 63];
    if (i + 2 < bytes.length) out += BASE64URL[n & 63];
  }
  return out;
}

/** Bytes, or null for anything that is not base64url of the length base64url would produce. */
function fromBase64url(text) {
  if (!/^[A-Za-z0-9_-]*$/.test(text) || text.length % 4 === 1) return null;
  const bytes = [];
  for (let i = 0; i < text.length; i += 4) {
    const chunk = text.slice(i, i + 4);
    let n = 0;
    for (let j = 0; j < 4; j += 1) n = (n << 6) | (j < chunk.length ? BASE64URL.indexOf(chunk[j]) : 0);
    bytes.push((n >> 16) & 255);
    if (chunk.length > 2) bytes.push((n >> 8) & 255);
    if (chunk.length > 3) bytes.push(n & 255);
  }
  return bytes;
}

/** The state of each question in pack order: 0 unanswered, 1–4 the choice. Counts what is answered. */
function states(questions, answers) {
  const items = answers?.items || {};
  let written = 0;
  const list = questions.map((question) => {
    const choiceId = items[question.id]?.choiceId;
    const index = (question.o || []).findIndex((option) => option.id === choiceId);
    if (index < 0 || index >= STATES - 1) return 0;
    written += 1;
    return index + 1;
  });
  return { list, written };
}

/** `v2.<slug>.<base64url of the choices, three to a byte>`, or "" when there is nothing worth sending. */
export function encodeShare(slug, questions = [], answers = { items: {} }) {
  const { list, written } = states(questions, answers);
  if (!written) return "";
  const bytes = [];
  for (let i = 0; i < list.length; i += PER_BYTE) {
    let value = 0;
    for (let j = PER_BYTE - 1; j >= 0; j -= 1) value = value * STATES + (list[i + j] || 0);
    bytes.push(value);
  }
  return `${SHARE_VERSION}.${String(slug || "")}.${toBase64url(bytes)}`;
}

/** The v1 body: one letter or dash per question. Null for anything that does not fit exactly. */
function decodeLegacyBody(body, questions) {
  if (body.length !== questions.length) return null;
  const indices = [];
  for (let i = 0; i < questions.length; i += 1) {
    const character = body[i];
    if (character === BLANK) {
      indices.push(-1);
      continue;
    }
    const index = LETTERS.indexOf(character);
    if (index < 0) return null;
    indices.push(index);
  }
  return indices;
}

/** The v2 body: bytes of three states each. Null when the byte count or any digit is wrong. */
function decodeBody(body, questions) {
  const bytes = fromBase64url(body);
  if (!bytes || bytes.length !== Math.ceil(questions.length / PER_BYTE)) return null;
  const indices = [];
  for (const byte of bytes) {
    if (byte >= STATES ** PER_BYTE) return null;
    let value = byte;
    for (let j = 0; j < PER_BYTE; j += 1) {
      indices.push((value % STATES) - 1);
      value = Math.floor(value / STATES);
    }
  }
  // The last byte may carry padding past the last question, and that padding must be blank.
  if (indices.slice(questions.length).some((index) => index !== -1)) return null;
  return indices.slice(0, questions.length);
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
  if (from !== String(slug || "") || !questions.length) return null;
  const indices = version === SHARE_VERSION
    ? decodeBody(body, questions)
    : version === LEGACY_VERSION ? decodeLegacyBody(body, questions) : null;
  if (!indices) return null;

  const items = {};
  for (let i = 0; i < questions.length; i += 1) {
    const index = indices[i];
    if (index < 0) continue;
    const option = (questions[i].o || [])[index];
    if (!option) return null;
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
