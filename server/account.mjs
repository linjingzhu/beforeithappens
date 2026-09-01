import { randomBytes } from "node:crypto";

/**
 * Account deletion (탈퇴).
 *
 * Design, in one line: erase the person, close the couple space, keep the survivor whole.
 *
 * ERASED OUTRIGHT (identifying or author-only, and therefore never handed to anyone):
 *   - the `User` row (email), OAuth `identities`, `magicLinks` (by user and by email), `sessions`
 *   - every `PrivateNote`, `Answer` (draft and submitted) and `progress` row authored by the user
 *   - every `CoupleMember` row of the user, and every invitation the user issued
 *   - any workspace where the user was the only accepted member, with all of its content
 *
 * KEPT, NEVER MUTATED:
 *   - `PublicLock` rows of a shared workspace. A lock is an immutable snapshot of a completed
 *     round and belongs to both members, so it is not rewritten and not deleted. Its
 *     `submissions.*.userId` is an opaque random id with no row behind it any more, so it
 *     resurrects no identity and joins to nothing.
 *
 * KEPT, IDENTITY POINTER SCRUBBED (these rows are not immutable):
 *   - `Agreement`: shared text stays, `proposedByUserId` / `approvedByUserId` are nulled.
 *   - `Purchase`: financial record stays, `buyerUserId` is nulled.
 *
 * THE SURVIVING PARTNER:
 *   - their shared workspace is archived, not deleted, so nothing immutable is destroyed and no
 *     future partner can ever be shown the departed couple's locks;
 *   - they get a fresh active workspace where they are the buyer, so they can invite again;
 *   - an active `Entitlement` moves with them, so nobody loses a paid pack because their
 *     partner left.
 *
 * The shape of the fresh workspace/member rows mirrors `ensureWorkspace` in ./workspace.mjs.
 */

function createId(prefix, bytes = 16) {
  return `${prefix}_${randomBytes(bytes).toString("hex")}`;
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function rows(state, key) {
  if (!Array.isArray(state[key])) state[key] = [];
  return state[key];
}

function acceptedOthers(state, workspaceId, userId) {
  return rows(state, "members").filter((member) =>
    member.workspaceId === workspaceId
    && member.userId !== userId
    && member.status === "accepted"
  );
}

export function createAccount({ store, now = Date.now } = {}) {
  if (!store) throw new Error("store is required");

  function requireSession(sessionId) {
    const snapshot = store.snapshot();
    const session = snapshot.sessions.find((item) => item.id === sessionId);
    if (!session) return { ok: false, error: "unauthenticated" };
    const user = snapshot.users.find((item) => item.id === session.userId);
    if (!user) return { ok: false, error: "unauthenticated" };
    return { ok: true, user };
  }

  /** Removes every trace of one user. Safe to run again on an already purged user. */
  function purgeUser(userId, at) {
    const outcome = { removedWorkspaces: [], archivedWorkspaces: [], partnerRemains: false };
    store.mutate((state) => {
      const email = state.users.find((item) => item.id === userId)?.email || "";
      const removed = new Set();
      const kept = new Set();
      const claimed = new Set([
        ...rows(state, "members").filter((member) => member.userId === userId).map((member) => member.workspaceId),
        ...rows(state, "workspaces").filter((workspace) => workspace.ownerUserId === userId).map((workspace) => workspace.id)
      ]);
      for (const workspaceId of claimed) {
        if (acceptedOthers(state, workspaceId, userId).length > 0) kept.add(workspaceId);
        else removed.add(workspaceId);
      }

      // Identity and credentials.
      state.users = rows(state, "users").filter((item) => item.id !== userId);
      state.identities = rows(state, "identities").filter((item) => item.userId !== userId);
      state.magicLinks = rows(state, "magicLinks").filter((item) =>
        item.userId !== userId && (!email || item.email !== email)
      );
      state.sessions = rows(state, "sessions").filter((item) => item.userId !== userId);

      // Author-only material, plus everything inside a workspace nobody else is in.
      state.privateNotes = rows(state, "privateNotes").filter((item) =>
        item.userId !== userId && !removed.has(item.workspaceId)
      );
      state.answers = rows(state, "answers").filter((item) =>
        item.userId !== userId && !removed.has(item.workspaceId)
      );
      state.progress = rows(state, "progress").filter((item) =>
        item.userId !== userId && !removed.has(item.workspaceId)
      );
      state.members = rows(state, "members").filter((item) =>
        item.userId !== userId && !removed.has(item.workspaceId)
      );
      state.invitations = rows(state, "invitations").filter((item) =>
        item.invitedByUserId !== userId && !removed.has(item.workspaceId)
      );
      state.answerRounds = rows(state, "answerRounds").filter((item) => !removed.has(item.workspaceId));
      state.agreements = rows(state, "agreements").filter((item) => !removed.has(item.workspaceId));
      state.publicLocks = rows(state, "publicLocks").filter((item) => !removed.has(item.workspaceId));
      // A report snapshot carries both partners' submitted choices and the agreed text, so it
      // must not outlive the workspace it describes.
      state.reportSnapshots = rows(state, "reportSnapshots").filter((item) => !removed.has(item.workspaceId));
      state.entitlements = rows(state, "entitlements").filter((item) => !removed.has(item.workspaceId));
      state.workspaces = rows(state, "workspaces").filter((item) => !removed.has(item.id));

      // Shared rows that survive keep their text and lose the pointer to the deleted account.
      for (const agreement of rows(state, "agreements")) {
        if (agreement.proposedByUserId === userId) agreement.proposedByUserId = null;
        if (agreement.approvedByUserId === userId) agreement.approvedByUserId = null;
      }
      for (const purchase of rows(state, "purchases")) {
        if (purchase.buyerUserId === userId) purchase.buyerUserId = null;
      }

      // A surviving workspace keeps no pointer to the deleted owner.
      for (const workspace of rows(state, "workspaces")) {
        if (workspace.ownerUserId === userId) workspace.ownerUserId = null;
      }

      // The couple space closes; the person still here continues in a fresh one.
      for (const workspaceId of kept) {
        const workspace = rows(state, "workspaces").find((item) => item.id === workspaceId);
        if (!workspace || workspace.status !== "active") continue;
        const survivor = rows(state, "members").find((member) =>
          member.workspaceId === workspaceId && member.status === "accepted"
        );
        if (!survivor) continue;
        workspace.status = "archived";
        workspace.archivedAt = iso(at);
        workspace.pairCode = "";
        for (const invite of rows(state, "invitations")) {
          if (invite.workspaceId !== workspaceId || invite.usedAt) continue;
          invite.expiresAt = iso(at);
          invite.shareToken = "";
        }
        // Normally the survivor now has no active workspace at all; reuse one if they somehow do.
        let fresh = rows(state, "members")
          .filter((member) => member.userId === survivor.userId && member.status === "accepted")
          .map((member) => rows(state, "workspaces").find((item) => item.id === member.workspaceId))
          .find((item) => item?.status === "active") || null;
        if (!fresh) {
          fresh = {
            id: createId("ws"),
            ownerUserId: survivor.userId,
            status: "active",
            createdAt: iso(at)
          };
          rows(state, "workspaces").push(fresh);
          rows(state, "members").push({
            id: createId("mem"),
            workspaceId: fresh.id,
            userId: survivor.userId,
            role: "buyer",
            status: "accepted",
            createdAt: iso(at)
          });
        }
        for (const entitlement of rows(state, "entitlements")) {
          if (entitlement.workspaceId !== workspaceId || entitlement.status !== "active") continue;
          entitlement.transferredFromWorkspaceId = workspaceId;
          entitlement.transferredAt = iso(at);
          entitlement.workspaceId = fresh.id;
        }
        outcome.archivedWorkspaces.push(workspaceId);
        outcome.partnerRemains = true;
      }
      outcome.removedWorkspaces.push(...removed);
    });
    return outcome;
  }

  return {
    /**
     * Deletes the signed-in account. Irreversible, so the caller must pass `confirm: true`;
     * the UI turns that into a two-step confirmation.
     * Repeating the call changes nothing: the session is gone with the account, so the second
     * call is simply unauthenticated.
     */
    deleteAccount(sessionId, { confirm = false } = {}) {
      const access = requireSession(sessionId);
      if (!access.ok) return access;
      if (confirm !== true) return { ok: false, error: "unconfirmed" };
      const outcome = purgeUser(access.user.id, now());
      return {
        ok: true,
        userId: access.user.id,
        removedWorkspaces: outcome.removedWorkspaces.length,
        archivedWorkspaces: outcome.archivedWorkspaces.length,
        partnerRemains: outcome.partnerRemains
      };
    },

    /** Exposed for support tooling and tests; deletion itself always goes through a session. */
    purgeUser(userId) {
      if (!userId) return { ok: false, error: "invalid-user" };
      purgeUser(userId, now());
      return { ok: true };
    }
  };
}
