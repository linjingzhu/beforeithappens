import { randomBytes, timingSafeEqual } from "node:crypto";
import { hashToken } from "./auth.mjs";
import { PACK_CURRENCY, PACK_PRICE_KRW } from "./entitlement.mjs";

/**
 * Gifting a pack, not a heart.
 *
 * Hearts are a display layer: `src/hearts.js` is pure arithmetic over a number the client holds,
 * and nothing in `server/` has ever stored a balance. The thing that actually opens the remaining
 * questions is a workspace entitlement, so that is what a gift moves.
 *
 * A gift is deliberately shaped like an invitation — a hashed single-use token with an expiry —
 * because the two are the same problem: a link that must work exactly once, for one person, and
 * stop working afterwards. It differs in one way that matters: an invitation is bound to an email
 * so only the named partner can accept, while a gift is bearer-held on purpose. You send a present
 * to whoever you meant to send it to, and the sender can revoke it while it is unredeemed.
 */
export const GIFT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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

function rows(state, key) {
  return Array.isArray(state[key]) ? state[key] : [];
}

function giftStatus(gift, at) {
  if (!gift) return "invalid";
  if (gift.revokedAt) return "revoked";
  if (gift.redeemedAt) return "used";
  if (new Date(gift.expiresAt).getTime() <= at) return "expired";
  return "ok";
}

export function createGift({
  store,
  now = Date.now,
  randomToken = () => randomBytes(32).toString("hex"),
  entitlement,
  pack = {},
  audit = null
} = {}) {
  if (!store) throw new Error("store is required");
  if (!entitlement) throw new Error("entitlement is required");

  function requireSession(sessionId) {
    const state = store.snapshot();
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return { ok: false, error: "unauthenticated" };
    const user = state.users.find((item) => item.id === session.userId);
    if (!user) return { ok: false, error: "unauthenticated" };
    return { ok: true, state, user };
  }

  function activeWorkspaceId(state, userId) {
    const member = rows(state, "members").find((row) => {
      if (row.userId !== userId || row.status !== "accepted") return false;
      return rows(state, "workspaces").find((item) => item.id === row.workspaceId)?.status === "active";
    });
    return member?.workspaceId || "";
  }

  function findByToken(state, token) {
    const wanted = hashToken(String(token || ""));
    return rows(state, "packGifts").find((row) => equalHash(row.tokenHash, wanted)) || null;
  }

  function publicGift(gift, at) {
    return {
      id: gift.id,
      status: giftStatus(gift, at),
      createdAt: gift.createdAt,
      expiresAt: gift.expiresAt,
      redeemedAt: gift.redeemedAt,
      origin: gift.origin
    };
  }

  /**
   * Mints a gift without charging anyone. `origin` records where the value came from so a
   * referral reward and a bought present are never confused for each other in the ledger.
   */
  function issue({ fromUserId, origin, orderId = null, at = now() }) {
    const token = randomToken();
    const gift = {
      id: createId("gft"),
      fromUserId: fromUserId || null,
      origin,
      orderId,
      tokenHash: hashToken(token),
      shareToken: token,
      createdAt: iso(at),
      expiresAt: iso(at + GIFT_TTL_MS),
      redeemedAt: null,
      redeemedByUserId: null,
      redeemedWorkspaceId: null,
      revokedAt: null,
      packId: pack.id || null,
      packVersion: pack.version || null
    };
    store.mutate((state) => {
      if (!Array.isArray(state.packGifts)) state.packGifts = [];
      state.packGifts.push(gift);
    });
    audit?.recordGiftIssued?.({ userId: fromUserId, origin });
    return { gift, token };
  }

  return {
    issue,

    /**
     * Buying a present. This is a second purchase, not a re-gift of the buyer's own unlock:
     * the giver keeps whatever they already have, and the money buys a token someone else uses.
     */
    createGiftPurchase(sessionId) {
      const access = requireSession(sessionId);
      if (!access.ok) return access;
      const at = now();
      const orderId = createId("ord");
      store.mutate((state) => {
        if (!Array.isArray(state.purchases)) state.purchases = [];
        state.purchases.push({
          id: createId("pur"),
          orderId,
          workspaceId: null,
          buyerUserId: access.user.id,
          amount: PACK_PRICE_KRW,
          currency: PACK_CURRENCY,
          status: "paid",
          kind: "gift",
          packId: pack.id || null,
          packVersion: pack.version || null,
          createdAt: iso(at)
        });
      });
      const { gift, token } = issue({ fromUserId: access.user.id, origin: "purchase", orderId, at });
      return {
        ok: true,
        token,
        gift: publicGift(gift, at),
        amount: PACK_PRICE_KRW,
        currency: PACK_CURRENCY
      };
    },

    /** What the receiver's browser may learn before signing in: enough to explain, nothing more. */
    previewGift(token) {
      const at = now();
      const gift = findByToken(store.snapshot(), token);
      const status = giftStatus(gift, at);
      if (status !== "ok") return { ok: false, error: status };
      return { ok: true, status, expiresAt: gift.expiresAt, packId: gift.packId };
    },

    /** Everything the giver has sent, so an unredeemed present can be found and revoked. */
    listSent(sessionId) {
      const access = requireSession(sessionId);
      if (!access.ok) return access;
      const at = now();
      const sent = rows(access.state, "packGifts")
        .filter((row) => row.fromUserId === access.user.id)
        .map((row) => ({
          ...publicGift(row, at),
          token: row.redeemedAt || row.revokedAt ? "" : row.shareToken
        }))
        .reverse();
      return { ok: true, gifts: sent };
    },

    revoke(sessionId, giftId) {
      const access = requireSession(sessionId);
      if (!access.ok) return access;
      const at = now();
      const gift = rows(access.state, "packGifts").find((row) => row.id === giftId);
      if (!gift || gift.fromUserId !== access.user.id) return { ok: false, error: "not-found" };
      const status = giftStatus(gift, at);
      if (status === "used") return { ok: false, error: "used" };
      store.mutate((state) => {
        const row = state.packGifts.find((item) => item.id === giftId);
        if (row && !row.redeemedAt) {
          row.revokedAt = iso(at);
          row.shareToken = "";
        }
      });
      return { ok: true, giftId };
    },

    /**
     * Redeeming needs a session because the entitlement lands on the redeemer's workspace, and
     * a workspace only exists once someone has signed in. Giving to yourself is refused: it would
     * launder a gift purchase into your own unlock and make the two paths indistinguishable.
     */
    redeem(sessionId, token) {
      const access = requireSession(sessionId);
      if (!access.ok) return access;
      const at = now();
      const gift = findByToken(access.state, token);
      const status = giftStatus(gift, at);
      if (status !== "ok") return { ok: false, error: status };
      if (gift.fromUserId === access.user.id) return { ok: false, error: "self" };

      const workspaceId = activeWorkspaceId(access.state, access.user.id);
      if (!workspaceId) return { ok: false, error: "no-workspace" };
      if (entitlement.isEntitled(workspaceId)) return { ok: false, error: "already-entitled" };

      let claimed = false;
      store.mutate((state) => {
        const row = state.packGifts.find((item) => item.id === gift.id);
        // Re-checked inside the mutation: two taps of the same link must not both win.
        if (!row || row.redeemedAt || row.revokedAt) return;
        row.redeemedAt = iso(at);
        row.redeemedByUserId = access.user.id;
        row.redeemedWorkspaceId = workspaceId;
        row.shareToken = "";
        claimed = true;
      });
      if (!claimed) return { ok: false, error: "used" };

      const granted = entitlement.grantFromGift({ giftId: gift.id, orderId: gift.orderId, workspaceId, at });
      if (!granted.ok) return granted;
      audit?.recordGiftRedeemed?.({ userId: access.user.id, workspaceId, origin: gift.origin });
      return { ok: true, entitled: true, workspaceId };
    }
  };
}
