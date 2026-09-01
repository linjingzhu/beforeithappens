import { marriage100Pack, marriage100Questions } from "./questions-marriage-100.js";

/**
 * The pack this deployment serves, in one place.
 *
 * The server and the web screens used to import `src/questions.js` directly — the twelve-question
 * pack, with its guidance copy and its paywall. That pack is no longer the product: the hundred
 * questions of 결혼 100제 are, and answers to them are kept on the server rather than in whoever's
 * browser happened to answer them. So the two surfaces now ask this module what they are serving,
 * and swapping the pack is one import rather than a search through sixteen files.
 *
 * `src/questions.js` stays where it is. It is still a valid pack, the tests use it as a fixture
 * because a twelve-question pack makes for readable assertions, and deleting content to change a
 * deployment's mind about what to publish is a bad trade.
 *
 * A site pack has no gate — no `catalogId`, no `freeQuestionCount` — so serving this one means the
 * hundred questions are free. That is what the schema already said about a site pack, not a pricing
 * decision made here; when there is a price, it arrives as a field on the pack and the server picks
 * it up through `packGate` below without another change.
 */
export const activePack = marriage100Pack;

/** Ordered, renumbered, each carrying its section title as `chapter`. */
export const activeQuestions = marriage100Questions;

/** What the server needs to know about the pack, and nothing more. */
export const activePackRef = Object.freeze({ id: activePack.id, version: activePack.version });

/**
 * How many questions are free before a pack asks to be bought, or `null` for a pack that never
 * does. Read from the pack rather than assumed, so a free pack does not have to pretend to have a
 * paywall it will never use.
 */
export function packGate(pack = activePack) {
  return Number.isInteger(pack?.freeQuestionCount) ? pack.freeQuestionCount : null;
}

export const activeQuestionIds = activeQuestions.map((question) => question.id);

export const activeChoiceIdsByQuestion = Object.fromEntries(
  activeQuestions.map((question) => [question.id, question.choices.map((choice) => choice.id)])
);
