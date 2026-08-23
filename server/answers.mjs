import { randomBytes } from "node:crypto";
import { hasAcceptedPartner } from "./auth.mjs";
import { comparisonFor, createInitialState } from "../src/state.js";

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

function currentRoundNumber(state, workspaceId, questionId) {
  const nums = state.answerRounds
    .filter((row) => row.workspaceId === workspaceId && row.questionId === questionId)
    .map((row) => row.roundNumber);
  return nums.length ? Math.max(...nums) : 1;
}

function latestLock(state, workspaceId, questionId) {
  return state.publicLocks
    .filter((row) => row.workspaceId === workspaceId && row.questionId === questionId)
    .reduce((best, row) => !best || row.roundNumber > best.roundNumber ? row : best, null);
}

function lockFor(state, workspaceId, questionId, roundNumber) {
  return state.publicLocks.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === roundNumber) || null;
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

  function ensureRound(workspaceId, questionId, roundNumber) {
    const existing = store.snapshot().answerRounds.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === roundNumber);
    if (existing) return existing;
    const row = {
      id: createId("rnd"),
      workspaceId,
      questionId,
      roundNumber,
      revealedAt: null,
      createdAt: iso(now())
    };
    store.mutate((state) => {
      if (!state.answerRounds.some((item) => item.workspaceId === workspaceId && item.questionId === questionId && item.roundNumber === roundNumber)) {
        state.answerRounds.push(row);
      }
    });
    return store.snapshot().answerRounds.find((item) => item.workspaceId === workspaceId && item.questionId === questionId && item.roundNumber === roundNumber);
  }

  function ensureAnswer(workspaceId, questionId, userId, roundNumber) {
    ensureRound(workspaceId, questionId, roundNumber);
    const existing = store.snapshot().answers.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === roundNumber && row.userId === userId);
    if (existing) return existing;
    const row = {
      id: createId("ans"),
      workspaceId,
      questionId,
      roundNumber,
      userId,
      draftChoice: null,
      submittedChoice: null,
      submittedAt: null
    };
    store.mutate((state) => {
      if (!state.answers.some((item) => item.workspaceId === workspaceId && item.questionId === questionId && item.roundNumber === roundNumber && item.userId === userId)) {
        state.answers.push(row);
      }
    });
    return store.snapshot().answers.find((item) => item.workspaceId === workspaceId && item.questionId === questionId && item.roundNumber === roundNumber && item.userId === userId);
  }

  function ensureNote(workspaceId, questionId, userId, roundNumber) {
    const existing = store.snapshot().privateNotes.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === roundNumber && row.userId === userId);
    if (existing) return existing;
    const row = { id: createId("note"), workspaceId, questionId, roundNumber, userId, text: "" };
    store.mutate((state) => {
      if (!state.privateNotes.some((item) => item.workspaceId === workspaceId && item.questionId === questionId && item.roundNumber === roundNumber && item.userId === userId)) {
        state.privateNotes.push(row);
      }
    });
    return store.snapshot().privateNotes.find((item) => item.workspaceId === workspaceId && item.questionId === questionId && item.roundNumber === roundNumber && item.userId === userId);
  }

  function ensureAgreement(workspaceId, questionId, roundNumber) {
    const existing = store.snapshot().agreements.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === roundNumber);
    if (existing) return existing;
    const row = {
      id: createId("agr"),
      workspaceId,
      questionId,
      roundNumber,
      proposal: "",
      proposedByUserId: null,
      approvedByUserId: null,
      status: "none"
    };
    store.mutate((state) => {
      if (!state.agreements.some((item) => item.workspaceId === workspaceId && item.questionId === questionId && item.roundNumber === roundNumber)) {
        state.agreements.push(row);
      }
    });
    return store.snapshot().agreements.find((item) => item.workspaceId === workspaceId && item.questionId === questionId && item.roundNumber === roundNumber);
  }

  function answerOf(state, workspaceId, questionId, userId, roundNumber) {
    return state.answers.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === roundNumber && row.userId === userId);
  }

  function noteOf(state, workspaceId, questionId, userId, roundNumber) {
    return state.privateNotes.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === roundNumber && row.userId === userId);
  }

  function openNextRound(workspaceId, questionId) {
    const snapshot = store.snapshot();
    const next = currentRoundNumber(snapshot, workspaceId, questionId) + 1;
    ensureRound(workspaceId, questionId, next);
    return next;
  }

  function createPublicLock(workspaceId, questionId, roundNumber, at) {
    const snapshot = store.snapshot();
    if (lockFor(snapshot, workspaceId, questionId, roundNumber)) return lockFor(snapshot, workspaceId, questionId, roundNumber);
    const buyer = memberForRole(snapshot, workspaceId, "a");
    const partner = memberForRole(snapshot, workspaceId, "b");
    if (!buyer || !partner) return null;
    const answerA = answerOf(snapshot, workspaceId, questionId, buyer.userId, roundNumber);
    const answerB = answerOf(snapshot, workspaceId, questionId, partner.userId, roundNumber);
    const choiceA = validChoice(choiceIdsByQuestion, questionId, answerA?.submittedChoice);
    const choiceB = validChoice(choiceIdsByQuestion, questionId, answerB?.submittedChoice);
    if (!choiceA || !choiceB) return null;
    const round = snapshot.answerRounds.find((row) => row.workspaceId === workspaceId && row.questionId === questionId && row.roundNumber === roundNumber);
    const comparison = comparisonFor({
      roles: {
        a: { submittedChoice: choiceA },
        b: { submittedChoice: choiceB }
      }
    });
    const lock = {
      id: createId("lock"),
      workspaceId,
      questionId,
      roundNumber,
      answerRoundId: round?.id || null,
      lockedAt: iso(at),
      packId: pack.id || null,
      packVersion: pack.version || null,
      submissions: {
        a: { userId: buyer.userId, choice: choiceA, submittedAt: answerA.submittedAt },
        b: { userId: partner.userId, choice: choiceB, submittedAt: answerB.submittedAt }
      },
      comparison
    };
    store.mutate((state) => {
      if (lockFor(state, workspaceId, questionId, roundNumber)) return;
      state.publicLocks.push(structuredClone(lock));
      const row = state.answerRounds.find((item) => item.workspaceId === workspaceId && item.questionId === questionId && item.roundNumber === roundNumber);
      if (row && !row.revealedAt) row.revealedAt = lock.lockedAt;
    });
    return lockFor(store.snapshot(), workspaceId, questionId, roundNumber);
  }

  function publicLockView(lock) {
    if (!lock) return null;
    return {
      id: lock.id,
      roundNumber: lock.roundNumber,
      lockedAt: lock.lockedAt,
      submittedChoices: { a: lock.submissions.a.choice, b: lock.submissions.b.choice },
      submittedAt: { a: lock.submissions.a.submittedAt, b: lock.submissions.b.submittedAt },
      comparison: lock.comparison
    };
  }

  function projectState(access) {
    const snapshot = store.snapshot();
    const projected = createInitialState(questionIds, pack);
    const progress = snapshot.progress.find((row) => row.workspaceId === access.workspaceId && row.userId === access.user.id);
    projected.index = Number.isInteger(progress?.index) && progress.index >= 0 && progress.index < questionIds.length ? progress.index : 0;
    projected.activeRole = access.role;
    for (const questionId of questionIds) {
      const roundNumber = currentRoundNumber(snapshot, access.workspaceId, questionId);
      const lock = latestLock(snapshot, access.workspaceId, questionId);
      const mineMember = access.user.id;
      const otherMember = memberForRole(snapshot, access.workspaceId, otherRole(access.role));
      const mine = answerOf(snapshot, access.workspaceId, questionId, mineMember, roundNumber);
      const theirs = otherMember ? answerOf(snapshot, access.workspaceId, questionId, otherMember.userId, roundNumber) : null;
      const mineNote = noteOf(snapshot, access.workspaceId, questionId, mineMember, roundNumber);
      projected.questions[questionId].round = lock?.roundNumber || roundNumber;
      projected.questions[questionId].lock = publicLockView(lock);
      if (lock) {
        projected.questions[questionId].roles.a = {
          draftChoice: access.role === "a" ? mine?.draftChoice ?? lock.submissions.a.choice : null,
          privateNote: access.role === "a" ? mineNote?.text ?? "" : "",
          submittedChoice: lock.submissions.a.choice,
          submittedAt: lock.submissions.a.submittedAt,
          completed: true
        };
        projected.questions[questionId].roles.b = {
          draftChoice: access.role === "b" ? mine?.draftChoice ?? lock.submissions.b.choice : null,
          privateNote: access.role === "b" ? mineNote?.text ?? "" : "",
          submittedChoice: lock.submissions.b.choice,
          submittedAt: lock.submissions.b.submittedAt,
          completed: true
        };
      } else {
        projected.questions[questionId].roles[access.role] = {
          draftChoice: mine?.draftChoice ?? null,
          privateNote: mineNote?.text ?? "",
          submittedChoice: mine?.submittedChoice ?? null,
          submittedAt: mine?.submittedAt ?? null
        };
        projected.questions[questionId].roles[otherRole(access.role)] = {
          draftChoice: null,
          privateNote: "",
          submittedChoice: null,
          submittedAt: null,
          completed: Boolean(theirs?.submittedChoice)
        };
      }
      const agreementRound = lock?.roundNumber || roundNumber;
      const agreement = snapshot.agreements.find((row) => row.workspaceId === access.workspaceId && row.questionId === questionId && row.roundNumber === agreementRound);
      if (lock && agreement) {
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
      let snapshot = store.snapshot();
      let roundNumber = currentRoundNumber(snapshot, access.workspaceId, questionId);
      const lock = latestLock(snapshot, access.workspaceId, questionId);
      const incoming = draftChoice === null || draftChoice === undefined ? undefined : validChoice(choiceIdsByQuestion, questionId, draftChoice);
      if (lock && lock.roundNumber === roundNumber) {
        const existing = ensureAnswer(access.workspaceId, questionId, access.user.id, roundNumber);
        const wantsNewChoice = incoming !== undefined && incoming !== null && incoming !== lock.submissions[access.role].choice;
        if (wantsNewChoice) {
          roundNumber = openNextRound(access.workspaceId, questionId);
        } else if (existing.submittedChoice) {
          if (typeof privateNote === "string") {
            ensureNote(access.workspaceId, questionId, access.user.id, roundNumber);
            store.mutate((state) => {
              const note = noteOf(state, access.workspaceId, questionId, access.user.id, roundNumber);
              if (note) note.text = privateNote;
            });
          }
          saveProgress(access.workspaceId, access.user.id, index);
          return { ok: true, state: projectState(access) };
        }
      }
      const existing = ensureAnswer(access.workspaceId, questionId, access.user.id, roundNumber);
      if (existing.submittedChoice && latestLock(store.snapshot(), access.workspaceId, questionId)?.roundNumber !== roundNumber) {
        saveProgress(access.workspaceId, access.user.id, index);
        return { ok: true, state: projectState(access) };
      }
      const choice = incoming === undefined ? existing.draftChoice : incoming;
      ensureNote(access.workspaceId, questionId, access.user.id, roundNumber);
      store.mutate((state) => {
        const answer = answerOf(state, access.workspaceId, questionId, access.user.id, roundNumber);
        if (answer && !answer.submittedChoice) answer.draftChoice = choice;
        const note = noteOf(state, access.workspaceId, questionId, access.user.id, roundNumber);
        if (note && typeof privateNote === "string") note.text = privateNote;
      });
      saveProgress(access.workspaceId, access.user.id, index);
      return { ok: true, state: projectState(access) };
    },

    submit(sessionId, { questionId, index } = {}) {
      const access = requirePaired(sessionId);
      if (!access.ok) return access;
      if (!questionIds.includes(questionId)) return { ok: false, error: "invalid-question" };
      const snapshot = store.snapshot();
      const roundNumber = currentRoundNumber(snapshot, access.workspaceId, questionId);
      if (lockFor(snapshot, access.workspaceId, questionId, roundNumber)) {
        saveProgress(access.workspaceId, access.user.id, index);
        return { ok: true, state: projectState(access) };
      }
      const existing = ensureAnswer(access.workspaceId, questionId, access.user.id, roundNumber);
      if (!existing.draftChoice) return { ok: false, error: "empty" };
      if (existing.submittedChoice) {
        createPublicLock(access.workspaceId, questionId, roundNumber, now());
        saveProgress(access.workspaceId, access.user.id, index);
        return { ok: true, state: projectState(access) };
      }
      const at = now();
      store.mutate((state) => {
        const answer = answerOf(state, access.workspaceId, questionId, access.user.id, roundNumber);
        if (!answer || answer.submittedChoice || !answer.draftChoice) return;
        answer.submittedChoice = answer.draftChoice;
        answer.submittedAt = iso(at);
      });
      createPublicLock(access.workspaceId, questionId, roundNumber, at);
      saveProgress(access.workspaceId, access.user.id, index);
      return { ok: true, state: projectState(access) };
    },

    saveAgreement(sessionId, { questionId, action, proposal, index } = {}) {
      const access = requirePaired(sessionId);
      if (!access.ok) return access;
      if (!questionIds.includes(questionId)) return { ok: false, error: "invalid-question" };
      const snapshot = store.snapshot();
      const lock = latestLock(snapshot, access.workspaceId, questionId);
      if (!lock) return { ok: false, error: "not-revealed" };
      const roundNumber = lock.roundNumber;
      ensureAgreement(access.workspaceId, questionId, roundNumber);
      store.mutate((state) => {
        const row = state.agreements.find((item) => item.workspaceId === access.workspaceId && item.questionId === questionId && item.roundNumber === roundNumber);
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
