import { randomBytes, timingSafeEqual } from "node:crypto";
import { hashToken, hasAcceptedPartner, isValidEmail, normalizeEmail } from "./auth.mjs";
import { inviteAcceptUrl } from "../src/auth.js";
import { formatPairCode, generatePairCode, normalizePairCode } from "../src/pair-code.js";

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function createId(prefix, bytes = 16) {
  return `${prefix}_${randomBytes(bytes).toString("hex")}`;
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function equalHash(left, right) {
  const a = Buffer.from(String(left), "utf8");
  const b = Buffer.from(String(right), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function activeMembership(state, userId) {
  return state.members.find((member) => {
    if (member.userId !== userId || member.status !== "accepted") return false;
    const workspace = state.workspaces.find((item) => item.id === member.workspaceId);
    return workspace?.status === "active";
  });
}

function acceptedCount(state, workspaceId) {
  return state.members.filter((member) => member.workspaceId === workspaceId && member.status === "accepted").length;
}

function latestInvite(state, workspaceId) {
  return state.invitations.reduce((latest, invite) => {
    if (invite.workspaceId !== workspaceId) return latest;
    if (!latest) return invite;
    const latestAt = new Date(latest.lastSentAt || latest.createdAt).getTime();
    const inviteAt = new Date(invite.lastSentAt || invite.createdAt).getTime();
    if (inviteAt > latestAt) return invite;
    if (inviteAt === latestAt) return invite;
    return latest;
  }, null);
}

function expireUnusedInvites(store, workspaceId, at) {
  for (const invite of store.snapshot().invitations) {
    if (invite.workspaceId === workspaceId && !invite.usedAt && new Date(invite.expiresAt).getTime() > at) {
      store.mutate((state) => {
        const row = state.invitations.find((item) => item.id === invite.id);
        if (row && !row.usedAt) {
          row.expiresAt = iso(at);
          row.shareToken = "";
        }
      });
    }
  }
}

function archiveGhostOwnedBy(store, userId, keepWorkspaceId, at) {
  const state = store.snapshot();
  for (const workspace of state.workspaces) {
    if (workspace.ownerUserId !== userId || workspace.id === keepWorkspaceId || workspace.status !== "active") continue;
    if (hasAcceptedPartner(state, userId) && activeMembership(state, userId)?.workspaceId === workspace.id) continue;
    const others = state.members.filter((member) => member.workspaceId === workspace.id && member.userId !== userId && member.status === "accepted");
    if (others.length > 0) continue;
    store.mutate((next) => {
      const row = next.workspaces.find((item) => item.id === workspace.id);
      if (row) {
        row.status = "archived";
        row.archivedAt = iso(at);
      }
    });
  }
}

export function workspaceView(state, userId, now = Date.now) {
  const membership = activeMembership(state, userId);
  if (!membership) {
    return { id: null, role: null, acceptedPartner: false, invite: null };
  }
  const inviteRow = latestInvite(state, membership.workspaceId);
  const remainingMs = inviteRow ? new Date(inviteRow.expiresAt).getTime() - now() : 0;
  let invite = null;
  if (membership.role === "buyer" && inviteRow && !inviteRow.usedAt) {
    invite = {
      email: inviteRow.email,
      status: remainingMs > 0 ? "waiting" : "expired",
      expiresAt: inviteRow.expiresAt,
      lastSentAt: inviteRow.lastSentAt || inviteRow.createdAt,
      remainingMs: Math.max(0, remainingMs),
      url: inviteRow.shareToken ? inviteAcceptUrl("", inviteRow.shareToken) : ""
    };
  }
  const workspace = state.workspaces.find((item) => item.id === membership.workspaceId);
  return {
    id: membership.workspaceId,
    role: membership.role,
    acceptedPartner: hasAcceptedPartner(state, userId),
    pairCode: workspace?.pairCode || "",
    pairCodeDisplay: workspace?.pairCode ? formatPairCode(workspace.pairCode) : "",
    invite
  };
}

export function createCouple({ store, now = Date.now, randomToken = () => randomBytes(32).toString("hex"), audit = null } = {}) {
  if (!store) throw new Error("store is required");

  function ensureWorkspace(userId) {
    const state = store.snapshot();
    const existing = activeMembership(state, userId);
    if (existing) return existing.workspaceId;
    const at = now();
    const workspace = {
      id: createId("ws"),
      ownerUserId: userId,
      status: "active",
      createdAt: iso(at)
    };
    const member = {
      id: createId("mem"),
      workspaceId: workspace.id,
      userId,
      role: "buyer",
      status: "accepted",
      createdAt: iso(at)
    };
    store.mutate((next) => {
      next.workspaces.push(workspace);
      next.members.push(member);
    });
    return workspace.id;
  }

  function requireBuyer(sessionId) {
    const session = store.snapshot().sessions.find((item) => item.id === sessionId);
    if (!session) return { ok: false, error: "unauthenticated" };
    const user = store.snapshot().users.find((item) => item.id === session.userId);
    if (!user) return { ok: false, error: "unauthenticated" };
    ensureWorkspace(user.id);
    const membership = activeMembership(store.snapshot(), user.id);
    if (!membership || membership.role !== "buyer") return { ok: false, error: "forbidden" };
    return { ok: true, user, membership };
  }

  return {
    ensureWorkspace,

    viewForUser(userId) {
      if (userId) ensureWorkspace(userId);
      return workspaceView(store.snapshot(), userId, now);
    },

    issueInvite(sessionId, rawEmail) {
      const access = requireBuyer(sessionId);
      if (!access.ok) return access;
      const email = normalizeEmail(rawEmail);
      if (!isValidEmail(email)) return { ok: false, error: "invalid-email" };
      if (!isValidEmail(access.user.email)) return { ok: false, error: "needs-email" };
      if (email === access.user.email) return { ok: false, error: "self" };
      if (hasAcceptedPartner(store.snapshot(), access.user.id)) return { ok: false, error: "already-paired" };
      if (acceptedCount(store.snapshot(), access.membership.workspaceId) >= 2) return { ok: false, error: "full" };
      const at = now();
      const reissue = store.snapshot().invitations.some((item) =>
        item.workspaceId === access.membership.workspaceId && !item.usedAt
      );
      expireUnusedInvites(store, access.membership.workspaceId, at);
      const token = randomToken();
      const invite = {
        id: createId("inv"),
        workspaceId: access.membership.workspaceId,
        invitedByUserId: access.user.id,
        email,
        tokenHash: hashToken(token),
        shareToken: token,
        createdAt: iso(at),
        lastSentAt: iso(at),
        expiresAt: iso(at + INVITE_TTL_MS),
        usedAt: null
      };
      store.mutate((state) => state.invitations.push(invite));
      audit?.recordInviteIssued({
        userId: access.user.id,
        workspaceId: access.membership.workspaceId,
        reissue
      });
      return {
        ok: true,
        email,
        token,
        url: inviteAcceptUrl("", token),
        expiresAt: invite.expiresAt,
        lastSentAt: invite.lastSentAt
      };
    },

    previewInvite(rawToken) {
      const token = String(rawToken ?? "");
      if (!token) return { ok: false, error: "invalid" };
      const tokenHash = hashToken(token);
      const invite = store.snapshot().invitations.find((item) => equalHash(item.tokenHash, tokenHash));
      if (!invite) return { ok: false, error: "invalid" };
      if (invite.usedAt) return { ok: false, error: "used" };
      if (new Date(invite.expiresAt).getTime() <= now()) return { ok: false, error: "expired" };
      return { ok: true, email: invite.email, expiresAt: invite.expiresAt };
    },

    ensurePairCode(sessionId) {
      const session = store.snapshot().sessions.find((item) => item.id === sessionId);
      if (!session) return { ok: false, error: "unauthenticated" };
      const user = store.snapshot().users.find((item) => item.id === session.userId);
      if (!user) return { ok: false, error: "unauthenticated" };
      const workspaceId = ensureWorkspace(user.id);
      const existing = store.snapshot().workspaces.find((item) => item.id === workspaceId);
      if (existing?.pairCode) {
        return { ok: true, code: existing.pairCode, display: formatPairCode(existing.pairCode) };
      }
      const taken = new Set(store.snapshot().workspaces.map((item) => normalizePairCode(item.pairCode)).filter(Boolean));
      let code = "";
      for (let i = 0; i < 8 && !code; i++) {
        const next = generatePairCode(() => randomBytes(8));
        if (!taken.has(normalizePairCode(next))) code = next;
      }
      if (!code) return { ok: false, error: "failed" };
      store.mutate((state) => {
        const row = state.workspaces.find((item) => item.id === workspaceId);
        if (row && !row.pairCode) row.pairCode = code;
      });
      const saved = store.snapshot().workspaces.find((item) => item.id === workspaceId)?.pairCode || code;
      return { ok: true, code: saved, display: formatPairCode(saved) };
    },

    connectByPairCode(sessionId, rawCode) {
      const session = store.snapshot().sessions.find((item) => item.id === sessionId);
      if (!session) return { ok: false, error: "unauthenticated" };
      const user = store.snapshot().users.find((item) => item.id === session.userId);
      if (!user) return { ok: false, error: "unauthenticated" };
      const code = normalizePairCode(rawCode);
      if (!code) return { ok: false, error: "invalid-code" };
      const target = store.snapshot().workspaces.find((item) =>
        item.status === "active" && item.pairCode && normalizePairCode(item.pairCode) === code
      );
      if (!target) return { ok: false, error: "not-found" };
      ensureWorkspace(user.id);
      const membership = activeMembership(store.snapshot(), user.id);
      if (membership?.workspaceId === target.id) return { ok: false, error: "self" };
      if (hasAcceptedPartner(store.snapshot(), user.id)) return { ok: false, error: "already-paired" };
      if (acceptedCount(store.snapshot(), target.id) >= 2) return { ok: false, error: "full" };
      const at = now();
      const fromId = membership?.workspaceId || "";
      archiveGhostOwnedBy(store, user.id, target.id, at);
      store.mutate((state) => {
        const existing = state.members.find((member) => member.workspaceId === target.id && member.userId === user.id);
        if (existing) {
          existing.status = "accepted";
          existing.role = "partner";
        } else {
          state.members.push({
            id: createId("mem"),
            workspaceId: target.id,
            userId: user.id,
            role: "partner",
            status: "accepted",
            createdAt: iso(at)
          });
        }
        if (fromId && fromId !== target.id) {
          for (const answer of state.answers || []) {
            if (answer.userId !== user.id || answer.workspaceId !== fromId) continue;
            const clash = state.answers.some((item) =>
              item.workspaceId === target.id
              && item.questionId === answer.questionId
              && item.roundNumber === answer.roundNumber
              && item.userId === user.id
            );
            if (!clash) answer.workspaceId = target.id;
          }
          for (const note of state.privateNotes || []) {
            if (note.userId !== user.id || note.workspaceId !== fromId) continue;
            note.workspaceId = target.id;
          }
          for (const round of [...(state.answerRounds || [])]) {
            if (round.workspaceId !== fromId) continue;
            const exists = state.answerRounds.some((item) =>
              item.workspaceId === target.id
              && item.questionId === round.questionId
              && item.roundNumber === round.roundNumber
            );
            if (!exists) {
              state.answerRounds.push({
                ...round,
                id: createId("rnd"),
                workspaceId: target.id
              });
            }
          }
        }
      });
      audit?.recordInviteAccepted({ userId: user.id, workspaceId: target.id, viaPairCode: true });
      return { ok: true, workspace: workspaceView(store.snapshot(), user.id, now) };
    },

    acceptInvite(sessionId, rawToken) {
      const session = store.snapshot().sessions.find((item) => item.id === sessionId);
      if (!session) return { ok: false, error: "unauthenticated" };
      const user = store.snapshot().users.find((item) => item.id === session.userId);
      if (!user) return { ok: false, error: "unauthenticated" };
      const preview = this.previewInvite(rawToken);
      if (!preview.ok) return preview;
      if (!isValidEmail(user.email)) return { ok: false, error: "needs-email" };
      if (user.email !== preview.email) return { ok: false, error: "mismatch" };
      const tokenHash = hashToken(String(rawToken));
      const invite = store.snapshot().invitations.find((item) => equalHash(item.tokenHash, tokenHash));
      if (invite.invitedByUserId === user.id) return { ok: false, error: "self" };
      if (acceptedCount(store.snapshot(), invite.workspaceId) >= 2) return { ok: false, error: "full" };
      if (hasAcceptedPartner(store.snapshot(), user.id)) return { ok: false, error: "already-paired" };
      const at = now();
      ensureWorkspace(user.id);
      archiveGhostOwnedBy(store, user.id, invite.workspaceId, at);
      store.mutate((state) => {
        const row = state.invitations.find((item) => item.id === invite.id);
        if (row) row.usedAt = iso(at);
        const existing = state.members.find((member) => member.workspaceId === invite.workspaceId && member.userId === user.id);
        if (existing) {
          existing.status = "accepted";
          existing.role = "partner";
        } else {
          state.members.push({
            id: createId("mem"),
            workspaceId: invite.workspaceId,
            userId: user.id,
            role: "partner",
            status: "accepted",
            createdAt: iso(at)
          });
        }
      });
      audit?.recordInviteAccepted({ userId: user.id, workspaceId: invite.workspaceId });
      return { ok: true, workspace: workspaceView(store.snapshot(), user.id, now) };
    }
  };
}
