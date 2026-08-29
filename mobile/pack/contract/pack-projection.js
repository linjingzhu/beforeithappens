import { PACK_COPY } from "./pack-copy.js";
import { choiceLabel, questionAt } from "./pack-catalog.js";

export function viewerRole(session) {
  return session?.workspace?.role === "partner" ? "b" : "a";
}

export function otherRole(role) {
  return role === "a" ? "b" : "a";
}

export function isSubmitted(roleState) {
  return Boolean(roleState?.submittedChoice) || roleState?.completed === true;
}

export function isRevealed(questionState) {
  return Boolean(questionState?.lock)
    || (isSubmitted(questionState?.roles?.a) && isSubmitted(questionState?.roles?.b));
}

export function privacyBadge(questionState, mine, { reanswering = false } = {}) {
  if (reanswering) return PACK_COPY.draftBadge;
  if (questionState?.lock) return PACK_COPY.lockBadge;
  if (isSubmitted(mine)) return PACK_COPY.submitBadge;
  return PACK_COPY.draftBadge;
}

export function canEditDraft(mine, { reanswering = false } = {}) {
  return reanswering || !isSubmitted(mine);
}

export function canSubmit(mine, { reanswering = false, saveStatus = "saved" } = {}) {
  return Boolean(mine?.draftChoice) && canEditDraft(mine, { reanswering }) && saveStatus !== "failed";
}

export function shouldOpenNewRound(lock, role, incomingChoice) {
  if (!lock || incomingChoice == null) return false;
  return incomingChoice !== lock.submittedChoices?.[role];
}

export function isReanswerDraft(lock, role, draftChoice) {
  return shouldOpenNewRound(lock, role, draftChoice);
}

export function agreementAction(shared, role) {
  if (shared?.status === "pending" && shared.proposedBy && shared.proposedBy !== role) return "approve";
  return "propose";
}

export function projectQuestionScreen({
  pack,
  state,
  session,
  reanswering = false,
  saveStatus = "saved"
} = {}) {
  const role = state?.activeRole || viewerRole(session);
  const index = Number.isInteger(state?.index) ? state.index : 0;
  const question = questionAt(pack, index);
  if (!question) return null;
  const questionState = state?.questions?.[question.id] || { roles: { a: {}, b: {} }, shared: {}, lock: null };
  const mine = questionState.roles?.[role] || {};
  const theirs = questionState.roles?.[otherRole(role)] || {};
  const revealed = isRevealed(questionState);
  const lock = questionState.lock || null;
  const shared = questionState.shared || { proposal: "", status: "none" };
  const editing = canEditDraft(mine, { reanswering });

  return {
    screen: revealed && !reanswering ? "reveal" : "question",
    index,
    role,
    question,
    mine,
    theirs,
    lock,
    shared,
    revealed,
    reanswering,
    privacyBadge: privacyBadge(questionState, mine, { reanswering }),
    privacyRule: PACK_COPY.privacyRule,
    noteLabel: PACK_COPY.noteLabel,
    noteHint: PACK_COPY.noteHint,
    canEditDraft: editing,
    canSubmit: canSubmit(mine, { reanswering, saveStatus }),
    canReanswer: Boolean(lock) && !reanswering,
    submitLabel: PACK_COPY.submit,
    agreeLabel: PACK_COPY.agree,
    holdLabel: PACK_COPY.hold,
    reanswerLabel: PACK_COPY.reanswer,
    agreementAction: agreementAction(shared, role),
    partnerWaiting: isSubmitted(mine) && !isSubmitted(theirs),
    partnerStatus: isSubmitted(theirs) ? PACK_COPY.bothSubmitted : PACK_COPY.waitingPartner,
    lockHint: lock ? PACK_COPY.lockHint : "",
    myChoiceLabel: choiceLabel(question, mine.submittedChoice || mine.draftChoice),
    theirChoiceLabel: revealed ? choiceLabel(question, theirs.submittedChoice) : "",
    lockChoices: lock ? {
      a: choiceLabel(question, lock.submittedChoices?.a),
      b: choiceLabel(question, lock.submittedChoices?.b),
      roundNumber: lock.roundNumber
    } : null
  };
}

export function nextIndex(state, pack, delta) {
  const max = pack.questions.length - 1;
  const current = Number.isInteger(state?.index) ? state.index : 0;
  return Math.min(max, Math.max(0, current + delta));
}
