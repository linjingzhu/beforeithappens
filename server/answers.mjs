import { randomBytes } from "node:crypto";
import { hasAcceptedPartner } from "./auth.mjs";
import { createInitialState } from "../src/state.js";

function createId(prefix, bytes = 16) {
  return `${prefix}_${randomBytes(bytes).toString("hex")}`;
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function activeMembership(state, userId) {
  return state.members.find((member) => {
    if (member.userId !== userId || member.status !== "accepted") return false;
    const workspace = state.workspaces.find((item) => item.id === member.workspaceId);
    return workspace?.status === "active";
  });
}

function roleOf(member) {
  return member.role === "partner" ? "b" : "a";
}

function otherRole(role) {
  return role === "a" ? "b" : "a";
}

function memberForRole(state, workspaceId, role) {
  const wanted = role === "b" ? "partner" : "buyer";
  return state.members.find((member) => member.workspaceId === workspaceId && member.role === wanted && member.status === "accepted");
}

function validChoice(choiceIdsByQuestion, questionId, choice) {
  const allowed = choiceIdsByQuestion[questionId] || [];
  return typeof choice === "string" && allowed.includes(choice) ? choice : null;
}

export function createAnswers({ store, now = Date.now, questionIds = [], choiceIdsByQuestion = {}, pack = {} } = {}) {
  if (!store) throw new Error("store is required");

  function requirePaired(sessionId) {
    const session = store.snapshot().sessions.find((item) => item.id === sessionId);
    if (!session) return { ok: false, error: "unauthenticated" };
    const user = store.snapshot().users.find((item) => item.id === session.userId);
    if (!user) return { ok: false, error: "unauthenticated" };
    const membership = activeMembership(store.snapshot(), user.id);
    if (!membership) return { ok: false, error: "forbidden" };
    if (!hasAcceptedPartner(store.snapshot(), user.id)) return { ok: false, error: "locked" };
    return { ok: true, user, membership, workspaceId: membership.workspaceId, role: roleOf(membership) };
  }

  function ensureRound(workspaceId, questionId) {
    const existing = store.snapshot().answerRounds.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === 1);
    if (existing) return existing;
    const row = {
      id: createId("rnd"),
      workspaceId,
      questionId,
      roundNumber: 1,
      revealedAt: null,
      createdAt: iso(now())
    };
    store.mutate((state) => state.answerRounds.push(row));
    return row;
  }

  function ensureAnswer(workspaceId, questionId, userId) {
    ensureRound(workspaceId, questionId);
    const existing = store.snapshot().answers.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === 1 && row.userId === userId);
    if (existing) return existing;
    const row = {
      id: createId("ans"),
      workspaceId,
      questionId,
      roundNumber: 1,
      userId,
      draftChoice: null,
      submittedChoice: null,
      submittedAt: null
    };
    store.mutate((state) => state.answers.push(row));
    return row;
  }

  function ensureNote(workspaceId, questionId, userId) {
    const existing = store.snapshot().privateNotes.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === 1 && row.userId === userId);
    if (existing) return existing;
    const row = { id: createId("note"), workspaceId, questionId, roundNumber: 1, userId, text: "" };
    store.mutate((state) => state.privateNotes.push(row));
    return row;
  }

  function ensureAgreement(workspaceId, questionId) {
    const existing = store.snapshot().agreements.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === 1);
    if (existing) return existing;
    const row = {
      id: createId("agr"),
      workspaceId,
      questionId,
      roundNumber: 1,
      proposal: "",
      proposedByUserId: null,
      approvedByUserId: null,
      status: "none"
    };
    store.mutate((state) => state.agreements.push(row));
    return row;
  }

  function answerOf(state, workspaceId, questionId, userId) {
    return state.answers.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === 1 && row.userId === userId);
  }

  function noteOf(state, workspaceId, questionId, userId) {
    return state.privateNotes.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === 1 && row.userId === userId);
  }

  function projectState(access) {
    const snapshot = store.snapshot();
    const projected = createInitialState(questionIds, pack);
    const progress = snapshot.progress.find((row) => row.workspaceId === access.workspaceId && row.userId === access.user.id);
    projected.index = Number.isInteger(progress?.index) && progress.index >= 0 && progress.index < questionIds.length ? progress.index : 0;
    projected.activeRole = access.role;
    for (const questionId of questionIds) {
      const mineMember = access.user.id;
      const otherMember = memberForRole(snapshot, access.workspaceId, otherRole(access.role));
      const mine = answerOf(snapshot, access.workspaceId, questionId, mineMember);
      const theirs = otherMember ? answerOf(snapshot, access.workspaceId, questionId, otherMember.userId) : null;
      const mineNote = noteOf(snapshot, access.workspaceId, questionId, mineMember);
      const bothSubmitted = Boolean(mine?.submittedChoice && theirs?.submittedChoice);
      projected.questions[questionId].roles[access.role] = {
        draftChoice: mine?.draftChoice ?? null,
        privateNote: mineNote?.text ?? "",
        submittedChoice: mine?.submittedChoice ?? null,
        submittedAt: mine?.submittedAt ?? null
      };
      projected.questions[questionId].roles[otherRole(access.role)] = {
        draftChoice: null,
        privateNote: "",
        submittedChoice: bothSubmitted ? theirs.submittedChoice : null,
        submittedAt: bothSubmitted ? theirs.submittedAt : null,
        completed: Boolean(theirs?.submittedChoice)
      };
      const agreement = snapshot.agreements.find((row) => row.workspaceId === access.workspaceId && row.questionId === questionId && row.roundNumber === 1);
      if (bothSubmitted && agreement) {
        const proposedBy = agreement.proposedByUserId === mineMember ? access.role : agreement.proposedByUserId && otherMember && agreement.proposedByUserId === otherMember.userId ? otherRole(access.role) : null;
        const approvedBy = agreement.approvedByUserId === mineMember ? access.role : agreement.approvedByUserId && otherMember && agreement.approvedByUserId === otherMember.userId ? otherRole(access.role) : null;
        projected.questions[questionId].shared = {
          proposal: agreement.proposal || "",
          proposedBy,
          approvedBy,
          status: agreement.status || "none"
        };
      }
    }
    return projected;
  }

  function saveProgress(workspaceId, userId, index) {
    if (!Number.isInteger(index) || index < 0 || index >= questionIds.length) return;
    store.mutate((state) => {
      const row = state.progress.find((item) => item.workspaceId === workspaceId && item.userId === userId);
      if (row) row.index = index;
      else state.progress.push({ workspaceId, userId, index });
    });
  }

  return {
    stateFor(sessionId) {
      const access = requirePaired(sessionId);
      if (!access.ok) return access;
      return { ok: true, state: projectState(access) };
    },

    saveDraft(sessionId, { questionId, draftChoice, privateNote, index } = {}) {
      const access = requirePaired(sessionId);
      if (!access.ok) return access;
      if (!questionIds.includes(questionId)) return { ok: false, error: "invalid-question" };
      const existing = ensureAnswer(access.workspaceId, questionId, access.user.id);
      if (existing.submittedChoice) {
        saveProgress(access.workspaceId, access.user.id, index);
        return { ok: true, state: projectState(access) };
      }
      const choice = draftChoice === null || draftChoice === undefined ? existing.draftChoice : validChoice(choiceIdsByQuestion, questionId, draftChoice);
      ensureNote(access.workspaceId, questionId, access.user.id);
      store.mutate((state) => {
        const answer = answerOf(state, access.workspaceId, questionId, access.user.id);
        if (answer && !answer.submittedChoice) answer.draftChoice = choice;
        const note = noteOf(state, access.workspaceId, questionId, access.user.id);
        if (note && typeof privateNote === "string") note.text = privateNote;
      });
      saveProgress(access.workspaceId, access.user.id, index);
      return { ok: true, state: projectState(access) };
    },

    submit(sessionId, { questionId, index } = {}) {
      const access = requirePaired(sessionId);
      if (!access.ok) return access;
      if (!questionIds.includes(questionId)) return { ok: false, error: "invalid-question" };
      const existing = ensureAnswer(access.workspaceId, questionId, access.user.id);
      if (!existing.draftChoice) return { ok: false, error: "empty" };
      if (existing.submittedChoice) return { ok: true, state: projectState(access) };
      const at = now();
      store.mutate((state) => {
        const answer = answerOf(state, access.workspaceId, questionId, access.user.id);
        if (!answer || answer.submittedChoice || !answer.draftChoice) return;
        answer.submittedChoice = answer.draftChoice;
        answer.submittedAt = iso(at);
      });
      const snapshot = store.snapshot();
      const other = memberForRole(snapshot, access.workspaceId, otherRole(access.role));
      const mine = answerOf(snapshot, access.workspaceId, questionId, access.user.id);
      const theirs = other ? answerOf(snapshot, access.workspaceId, questionId, other.userId) : null;
      if (mine?.submittedChoice && theirs?.submittedChoice) {
        store.mutate((state) => {
          const round = state.answerRounds.find((row) => row.workspaceId === access.workspaceId && row.questionId === questionId && row.roundNumber === 1);
          if (round && !round.revealedAt) round.revealedAt = iso(at);
        });
      }
      saveProgress(access.workspaceId, access.user.id, index);
      return { ok: true, state: projectState(access) };
    },

    saveAgreement(sessionId, { questionId, action, proposal, index } = {}) {
      const access = requirePaired(sessionId);
      if (!access.ok) return access;
      if (!questionIds.includes(questionId)) return { ok: false, error: "invalid-question" };
      const snapshot = store.snapshot();
      const other = memberForRole(snapshot, access.workspaceId, otherRole(access.role));
      const mine = answerOf(snapshot, access.workspaceId, questionId, access.user.id);
      const theirs = other ? answerOf(snapshot, access.workspaceId, questionId, other.userId) : null;
      if (!mine?.submittedChoice || !theirs?.submittedChoice) return { ok: false, error: "not-revealed" };
      ensureAgreement(access.workspaceId, questionId);
      store.mutate((state) => {
        const row = state.agreements.find((item) => item.workspaceId === access.workspaceId && item.questionId === questionId && item.roundNumber === 1);
        if (!row) return;
        if (action === "propose") {
          const text = typeof proposal === "string" ? proposal : row.proposal;
          if (!text.trim()) return;
          row.proposal = text;
          row.proposedByUserId = access.user.id;
          row.approvedByUserId = null;
          row.status = "pending";
        } else if (action === "revise") {
          row.status = "none";
          row.proposedByUserId = null;
          row.approvedByUserId = null;
        } else if (action === "approve") {
          if (row.status !== "pending" || !row.proposal.trim() || row.proposedByUserId === access.user.id) return;
          row.approvedByUserId = access.user.id;
          row.status = "agreed";
        } else if (action === "deferred") {
          row.status = "deferred";
          row.approvedByUserId = null;
        } else if (action === "draft") {
          row.proposal = typeof proposal === "string" ? proposal : row.proposal;
          row.status = "none";
          row.proposedByUserId = null;
          row.approvedByUserId = null;
        }
      });
      saveProgress(access.workspaceId, access.user.id, index);
      return { ok: true, state: projectState(access) };
    }
  };
}
