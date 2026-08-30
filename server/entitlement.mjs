import { randomBytes } from "node:crypto";
import { hasAcceptedPartner } from "./auth.mjs";

export const PACK_PRICE_KRW = 29000;
export const PACK_CURRENCY = "KRW";

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

function rows(state, key) {
  return Array.isArray(state[key]) ? state[key] : [];
}

export function isEntitled(state, workspaceId) {
  if (!workspaceId) return false;
  return rows(state, "entitlements").some((row) => row.workspaceId === workspaceId && row.status === "active");
}

export function createEntitlement({ store, now = Date.now, pack = {} } = {}) {
  if (!store) throw new Error("store is required");

  function requireSession(sessionId) {
    const snapshot = store.snapshot();
    const session = snapshot.sessions.find((item) => item.id === sessionId);
    if (!session) return { ok: false, error: "unauthenticated" };
    const user = snapshot.users.find((item) => item.id === session.userId);
    if (!user) return { ok: false, error: "unauthenticated" };
    const membership = activeMembership(snapshot, user.id);
    if (!membership) return { ok: false, error: "forbidden" };
    if (!hasAcceptedPartner(snapshot, user.id)) return { ok: false, error: "locked" };
    return {
      ok: true,
      user,
      membership,
      workspaceId: membership.workspaceId,
      role: membership.role === "partner" ? "partner" : "buyer"
    };
  }

  function entitlementRow(workspaceId) {
    return rows(store.snapshot(), "entitlements").find((row) => row.workspaceId === workspaceId && row.status === "active") || null;
  }

  function purchaseRow(workspaceId) {
    return rows(store.snapshot(), "purchases").find((row) => row.workspaceId === workspaceId) || null;
  }

  function publicView(access) {
    const entitled = Boolean(entitlementRow(access.workspaceId));
    return {
      ok: true,
      entitled,
      role: access.role,
      canPurchase: access.role === "buyer" && !entitled,
      amount: PACK_PRICE_KRW,
      currency: PACK_CURRENCY,
      packId: pack.id || null,
      packVersion: pack.version || null
    };
  }

  function grantFromPaidOrder({ eventId, orderId, at = now() }) {
    if (typeof eventId !== "string" || !eventId.trim()) return { ok: false, error: "invalid-event" };
    if (typeof orderId !== "string" || !orderId.trim()) return { ok: false, error: "invalid-order" };
    const snapshot = store.snapshot();
    const seen = rows(snapshot, "webhookEvents").find((row) => row.eventId === eventId);
    if (seen) {
      const purchase = rows(snapshot, "purchases").find((row) => row.orderId === orderId || row.orderId === seen.orderId);
      return {
        ok: true,
        duplicate: true,
        entitled: purchase ? isEntitled(snapshot, purchase.workspaceId) : false,
        eventId,
        orderId: seen.orderId
      };
    }
    const purchase = rows(snapshot, "purchases").find((row) => row.orderId === orderId);
    if (!purchase) return { ok: false, error: "unknown-order" };
    if (purchase.amount !== PACK_PRICE_KRW || purchase.currency !== PACK_CURRENCY) {
      return { ok: false, error: "invalid-amount" };
    }

    store.mutate((state) => {
      if (!Array.isArray(state.webhookEvents)) state.webhookEvents = [];
      if (!Array.isArray(state.entitlements)) state.entitlements = [];
      if (!Array.isArray(state.purchases)) state.purchases = [];
      if (state.webhookEvents.some((row) => row.eventId === eventId)) return;
      state.webhookEvents.push({
        id: createId("evt"),
        eventId,
        orderId,
        processedAt: iso(at)
      });
      const row = state.purchases.find((item) => item.orderId === orderId);
      if (row) row.status = "paid";
      if (!state.entitlements.some((item) => item.workspaceId === purchase.workspaceId && item.status === "active")) {
        state.entitlements.push({
          id: createId("ent"),
          workspaceId: purchase.workspaceId,
          purchaseId: purchase.id,
          orderId,
          packId: purchase.packId,
          packVersion: purchase.packVersion,
          amount: PACK_PRICE_KRW,
          currency: PACK_CURRENCY,
          status: "active",
          grantedAt: iso(at)
        });
      }
    });

    return { ok: true, duplicate: false, entitled: true, eventId, orderId };
  }

  return {
    isEntitled(workspaceId) {
      return isEntitled(store.snapshot(), workspaceId);
    },

    viewFor(sessionId) {
      const access = requireSession(sessionId);
      if (!access.ok) return access;
      return publicView(access);
    },

    createPurchase(sessionId) {
      const access = requireSession(sessionId);
      if (!access.ok) return access;
      if (access.role !== "buyer") return { ok: false, error: "forbidden" };
      const existing = entitlementRow(access.workspaceId);
      if (existing) return { ...publicView(access), alreadyEntitled: true };

      const at = now();
      const prior = purchaseRow(access.workspaceId);
      const orderId = prior?.orderId || createId("ord");
      if (!prior) {
        store.mutate((state) => {
          if (!Array.isArray(state.purchases)) state.purchases = [];
          if (state.purchases.some((row) => row.workspaceId === access.workspaceId)) return;
          state.purchases.push({
            id: createId("pur"),
            orderId,
            workspaceId: access.workspaceId,
            buyerUserId: access.user.id,
            amount: PACK_PRICE_KRW,
            currency: PACK_CURRENCY,
            status: "pending",
            packId: pack.id || null,
            packVersion: pack.version || null,
            createdAt: iso(at)
          });
        });
      }

      const granted = grantFromPaidOrder({
        eventId: `purchase:${orderId}`,
        orderId,
        at
      });
      if (!granted.ok) return granted;
      return { ...publicView(access), purchase: { orderId, amount: PACK_PRICE_KRW, currency: PACK_CURRENCY } };
    },

    applyWebhook({ eventId, orderId } = {}) {
      return grantFromPaidOrder({ eventId, orderId });
    }
  };
}
