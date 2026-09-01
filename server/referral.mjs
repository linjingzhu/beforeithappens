import { randomBytes } from "node:crypto";
import { generatePairCode, normalizePairCode } from "../src/pair-code.js";

/**
 * Recommending the product to someone who is not your partner.
 *
 * This is a different link from an invitation. An invitation is bound to one email, single-use,
 * and joins one workspace; a recommendation is open, reusable, and joins nothing — it only records
 * who brought whom. Keeping them separate is what stops a referral link from ever becoming a way
 * into someone's private pack.
 *
 * The reward exists but is deliberately anchored to the one event that is hard to fake once
 * payment is real: the referred person paying. Today `POST /api/purchase` grants without charging,
 * so a reward earned this way is exactly as forgeable as the purchase behind it — no worse, and it
 * becomes sound the moment a gateway is wired, with no change here.
 */
export const REFERRAL_REWARD_PURCHASES = 3;

function createId(prefix, bytes = 16) {
  return `${prefix}_${randomBytes(bytes).toString("hex")}`;
}

function iso(ms) {
  return new Date(ms).toISOString();
}

function rows(state, key) {
  return Array.isArray(state[key]) ? state[key] : [];
}

export function createReferral({
  store,
  now = Date.now,
  randomCode = () => generatePairCode(randomBytes(8)),
  gift,
  rewardEvery = REFERRAL_REWARD_PURCHASES,
  audit = null
} = {}) {
  if (!store) throw new Error("store is required");

  function requireSession(sessionId) {
    const state = store.snapshot();
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return { ok: false, error: "unauthenticated" };
    const user = state.users.find((item) => item.id === session.userId);
    if (!user) return { ok: false, error: "unauthenticated" };
    return { ok: true, state, user };
  }

  function codeRow(state, userId) {
    return rows(state, "referralCodes").find((row) => row.userId === userId) || null;
  }

  function ownerOfCode(state, code) {
    const wanted = normalizePairCode(code);
    if (!wanted) return null;
    return rows(state, "referralCodes").find((row) => normalizePairCode(row.code) === wanted) || null;
  }

  function ensureCode(userId, at = now()) {
    const existing = codeRow(store.snapshot(), userId);
    if (existing) return existing.code;
    let code = "";
    store.mutate((state) => {
      if (!Array.isArray(state.referralCodes)) state.referralCodes = [];
      const already = state.referralCodes.find((row) => row.userId === userId);
      if (already) {
        code = already.code;
        return;
      }
      // Collisions are cheap to avoid and expensive to debug, so retry rather than trust the odds.
      let candidate = randomCode();
      for (let attempt = 0; attempt < 12; attempt += 1) {
        const taken = state.referralCodes.some((row) => normalizePairCode(row.code) === normalizePairCode(candidate));
        if (!taken) break;
        candidate = randomCode();
      }
      code = candidate;
      state.referralCodes.push({ id: createId("ref"), userId, code, createdAt: iso(at) });
    });
    return code;
  }

  function statsFor(state, userId) {
    const mine = rows(state, "referrals").filter((row) => row.referrerUserId === userId);
    return {
      joined: mine.length,
      credited: mine.filter((row) => row.creditedAt).length,
      rewarded: rows(state, "packGifts").filter((row) => row.fromUserId === userId && row.origin === "referral").length
    };
  }

  return {
    ensureCode,

    viewFor(sessionId) {
      const access = requireSession(sessionId);
      if (!access.ok) return access;
      const code = ensureCode(access.user.id);
      const stats = statsFor(store.snapshot(), access.user.id);
      return {
        ok: true,
        code,
        rewardEvery,
        ...stats,
        toNextReward: Math.max(0, rewardEvery - (stats.credited % rewardEvery || (stats.credited ? rewardEvery : 0)))
      };
    },

    /**
     * Attribution happens once per account and only before that account has bought anything, so a
     * code cannot be applied retroactively to a purchase that already happened.
     *
     * One limit is worth stating rather than hiding: an account that deletes itself and signs up
     * again is a genuinely new row, because deletion erases the identifiers that would let us
     * recognise it. Closing that would mean keeping a record of people who asked to be forgotten,
     * which the deletion promise forbids. Rate limiting belongs in front of this, not inside it.
     */
    claim(sessionId, rawCode) {
      const access = requireSession(sessionId);
      if (!access.ok) return access;
      const owner = ownerOfCode(access.state, rawCode);
      if (!owner) return { ok: false, error: "invalid-code" };
      if (owner.userId === access.user.id) return { ok: false, error: "self" };
      if (rows(access.state, "referrals").some((row) => row.referredUserId === access.user.id)) {
        return { ok: false, error: "already-claimed" };
      }
      const mine = rows(access.state, "members")
        .filter((row) => row.userId === access.user.id)
        .map((row) => row.workspaceId);
      if (rows(access.state, "purchases").some((row) => mine.includes(row.workspaceId))) {
        return { ok: false, error: "too-late" };
      }
      const at = now();
      store.mutate((state) => {
        if (!Array.isArray(state.referrals)) state.referrals = [];
        if (state.referrals.some((row) => row.referredUserId === access.user.id)) return;
        state.referrals.push({
          id: createId("rfl"),
          referrerUserId: owner.userId,
          referredUserId: access.user.id,
          createdAt: iso(at),
          creditedAt: null
        });
      });
      audit?.recordReferralClaimed?.({ userId: access.user.id });
      return { ok: true };
    },

    /**
     * Called when a workspace becomes entitled by paying. Credits the referrer once for that
     * person, ever, and mints a gift every `rewardEvery` credits. Idempotent: a replayed webhook
     * finds `creditedAt` already set and does nothing.
     */
    creditPurchase({ workspaceId, at = now() } = {}) {
      if (!workspaceId) return { ok: true, credited: false };
      const state = store.snapshot();
      const buyerIds = rows(state, "members")
        .filter((row) => row.workspaceId === workspaceId && row.status === "accepted")
        .map((row) => row.userId);
      const referral = rows(state, "referrals").find((row) => buyerIds.includes(row.referredUserId) && !row.creditedAt);
      if (!referral) return { ok: true, credited: false };

      let credited = false;
      store.mutate((mutable) => {
        const row = mutable.referrals.find((item) => item.id === referral.id);
        if (!row || row.creditedAt) return;
        row.creditedAt = iso(at);
        credited = true;
      });
      if (!credited) return { ok: true, credited: false };

      const total = rows(store.snapshot(), "referrals")
        .filter((row) => row.referrerUserId === referral.referrerUserId && row.creditedAt).length;
      const earned = rewardEvery > 0 && total % rewardEvery === 0;
      let rewardToken = "";
      if (earned && gift?.issue) {
        rewardToken = gift.issue({ fromUserId: referral.referrerUserId, origin: "referral", at }).token;
      }
      audit?.recordReferralCredited?.({ userId: referral.referrerUserId, rewarded: Boolean(earned) });
      return { ok: true, credited: true, rewarded: Boolean(earned), rewardToken };
    }
  };
}
