import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const MAGIC_LINK_TTL_MS = 10 * 60 * 1000;
export const SESSION_COOKIE = "ab_session";
export const LOGIN_NOTICE = "no-local-draft";

export function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function hashToken(token) {
  return createHash("sha256").update(String(token)).digest("hex");
}

function equalHash(left, right) {
  const a = Buffer.from(String(left), "utf8");
  const b = Buffer.from(String(right), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function createId(prefix, bytes = 16) {
  return `${prefix}_${randomBytes(bytes).toString("hex")}`;
}

function iso(ms) {
  return new Date(ms).toISOString();
}

export function hasAcceptedPartner(state, userId) {
  const memberships = state.members.filter((member) => member.userId === userId && member.status === "accepted");
  return memberships.some((membership) =>
    state.members.some((other) =>
      other.workspaceId === membership.workspaceId
      && other.userId !== userId
      && other.status === "accepted"
    )
  );
}

function findIdentity(state, provider, providerUserId) {
  return state.identities.find((item) => item.provider === provider && item.providerUserId === providerUserId);
}

function bindEmailToUser(store, sourceUser, rawEmail, at) {
  const email = normalizeEmail(rawEmail);
  const existing = store.snapshot().users.find((item) => item.email === email);
  if (existing && existing.id !== sourceUser.id) {
    store.mutate((state) => {
      for (const identity of state.identities) {
        if (identity.userId === sourceUser.id) identity.userId = existing.id;
      }
      state.sessions = state.sessions.filter((session) => session.userId !== sourceUser.id && session.userId !== existing.id);
      const account = state.users.find((item) => item.id === existing.id);
      if (account) account.lastLoginAt = iso(at);
    });
    return { user: store.snapshot().users.find((item) => item.id === existing.id) };
  }
  store.mutate((state) => {
    const account = state.users.find((item) => item.id === sourceUser.id);
    if (account) account.email = email;
  });
  return { user: store.snapshot().users.find((item) => item.id === sourceUser.id) };
}

function createSessionFor(store, user, at, onLogin) {
  store.mutate((state) => {
    state.sessions = state.sessions.filter((session) => session.userId !== user.id);
  });
  const session = {
    id: createId("ses"),
    userId: user.id,
    createdAt: iso(at),
    notice: LOGIN_NOTICE
  };
  store.mutate((state) => {
    state.sessions.push(session);
    const account = state.users.find((item) => item.id === user.id);
    if (account) account.lastLoginAt = iso(at);
  });
  onLogin?.(user.id);
  return session;
}

export function createAuth({ store, now = Date.now, randomToken = () => randomBytes(32).toString("hex"), onLogin, describeWorkspace } = {}) {
  if (!store) throw new Error("store is required");

  function expireUnusedLinks(email, at) {
    for (const link of store.snapshot().magicLinks) {
      if (link.email === email && !link.usedAt && new Date(link.expiresAt).getTime() > at) {
        store.mutate((state) => {
          const row = state.magicLinks.find((item) => item.id === link.id);
          if (row && !row.usedAt) row.expiresAt = iso(at);
        });
      }
    }
  }

  function forceLogoutUser(userId) {
    store.mutate((state) => {
      state.sessions = state.sessions.filter((session) => session.userId !== userId);
    });
  }

  function publicSession(sessionId) {
    const state = store.snapshot();
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return { user: null, notice: null, workspace: { acceptedPartner: false } };
    const user = state.users.find((item) => item.id === session.userId);
    if (!user) return { user: null, notice: null, workspace: { acceptedPartner: false } };
    const workspace = describeWorkspace?.(user.id) || { acceptedPartner: hasAcceptedPartner(state, user.id) };
    return {
      user: {
        id: user.id,
        email: user.email || "",
        needsEmail: !isValidEmail(user.email)
      },
      notice: session.notice,
      workspace
    };
  }

  return {
    requestMagicLink(rawEmail) {
      const email = normalizeEmail(rawEmail);
      if (!isValidEmail(email)) return { ok: false, error: "invalid-email" };
      const at = now();
      let user = store.snapshot().users.find((item) => item.email === email);
      if (!user) {
        user = { id: createId("usr"), email, createdAt: iso(at), lastLoginAt: null };
        store.mutate((state) => state.users.push(user));
      }
      expireUnusedLinks(email, at);
      const token = randomToken();
      const link = {
        id: createId("ml"),
        userId: user.id,
        email,
        purpose: "login",
        tokenHash: hashToken(token),
        createdAt: iso(at),
        expiresAt: iso(at + MAGIC_LINK_TTL_MS),
        usedAt: null
      };
      store.mutate((state) => state.magicLinks.push(link));
      return { ok: true, email, token, expiresAt: link.expiresAt };
    },

    consumeMagicLink(rawToken) {
      const token = String(rawToken ?? "");
      if (!token) return { ok: false, error: "invalid" };
      const tokenHash = hashToken(token);
      const at = now();
      const link = store.snapshot().magicLinks.find((item) => equalHash(item.tokenHash, tokenHash));
      if (!link) return { ok: false, error: "invalid" };
      if (link.usedAt) return { ok: false, error: "used" };
      if (new Date(link.expiresAt).getTime() <= at) return { ok: false, error: "expired" };
      let user = store.snapshot().users.find((item) => item.id === link.userId);
      if (!user) return { ok: false, error: "invalid" };
      if (link.purpose === "email-bind") {
        const bound = bindEmailToUser(store, user, link.email, at);
        user = bound.user;
      }
      store.mutate((state) => {
        const row = state.magicLinks.find((item) => item.id === link.id);
        if (row) row.usedAt = iso(at);
        const account = state.users.find((item) => item.id === user.id);
        if (account) account.lastLoginAt = iso(at);
      });
      forceLogoutUser(user.id);
      const session = {
        id: createId("ses"),
        userId: user.id,
        createdAt: iso(at),
        notice: LOGIN_NOTICE
      };
      store.mutate((state) => state.sessions.push(session));
      onLogin?.(user.id);
      return { ok: true, sessionId: session.id, user: { id: user.id, email: user.email || "" } };
    },

    sessionFor(sessionId) {
      return publicSession(sessionId);
    },

    completeOAuth({ provider, providerUserId, email } = {}) {
      const name = String(provider || "").trim().toLowerCase();
      const subject = String(providerUserId || "").trim();
      if (name !== "kakao" && name !== "naver" && name !== "google") {
        return { ok: false, error: "invalid-provider" };
      }
      if (!subject) return { ok: false, error: "invalid-provider" };
      const at = now();
      const normalizedEmail = normalizeEmail(email);
      const trustEmail = name === "google" && isValidEmail(normalizedEmail);
      const existingIdentity = findIdentity(store.snapshot(), name, subject);
      let user = existingIdentity
        ? store.snapshot().users.find((item) => item.id === existingIdentity.userId)
        : null;
      if (!user && trustEmail) {
        user = store.snapshot().users.find((item) => item.email === normalizedEmail) || null;
      }
      if (!user) {
        user = {
          id: createId("usr"),
          email: trustEmail ? normalizedEmail : "",
          createdAt: iso(at),
          lastLoginAt: null
        };
        store.mutate((state) => state.users.push(user));
      } else if (trustEmail && !isValidEmail(user.email)) {
        store.mutate((state) => {
          const account = state.users.find((item) => item.id === user.id);
          if (account && !isValidEmail(account.email)) account.email = normalizedEmail;
        });
        user = store.snapshot().users.find((item) => item.id === user.id);
      }
      if (!existingIdentity) {
        store.mutate((state) => state.identities.push({
          id: createId("idp"),
          userId: user.id,
          provider: name,
          providerUserId: subject,
          createdAt: iso(at)
        }));
      } else if (existingIdentity.userId !== user.id) {
        store.mutate((state) => {
          const row = state.identities.find((item) => item.id === existingIdentity.id);
          if (row) row.userId = user.id;
        });
      }
      const session = createSessionFor(store, user, at, onLogin);
      return { ok: true, sessionId: session.id, user: { id: user.id, email: user.email || "" } };
    },

    requestEmailBind(sessionId, rawEmail) {
      const session = store.snapshot().sessions.find((item) => item.id === sessionId);
      if (!session) return { ok: false, error: "unauthenticated" };
      const user = store.snapshot().users.find((item) => item.id === session.userId);
      if (!user) return { ok: false, error: "unauthenticated" };
      const email = normalizeEmail(rawEmail);
      if (!isValidEmail(email)) return { ok: false, error: "invalid-email" };
      if (isValidEmail(user.email) && user.email !== email) return { ok: false, error: "invalid-email" };
      const at = now();
      expireUnusedLinks(email, at);
      const token = randomToken();
      const link = {
        id: createId("ml"),
        userId: user.id,
        email,
        purpose: "email-bind",
        tokenHash: hashToken(token),
        createdAt: iso(at),
        expiresAt: iso(at + MAGIC_LINK_TTL_MS),
        usedAt: null
      };
      store.mutate((state) => state.magicLinks.push(link));
      return { ok: true, email, token, expiresAt: link.expiresAt };
    },

    acknowledgeNotice(sessionId) {
      const session = store.snapshot().sessions.find((item) => item.id === sessionId);
      if (!session) return { ok: false, error: "unauthenticated" };
      store.mutate((state) => {
        const row = state.sessions.find((item) => item.id === sessionId);
        if (row) row.notice = null;
      });
      return { ok: true, session: publicSession(sessionId) };
    },

    logout(sessionId) {
      const session = store.snapshot().sessions.find((item) => item.id === sessionId);
      if (session) forceLogoutUser(session.userId);
      else if (sessionId) {
        store.mutate((state) => {
          state.sessions = state.sessions.filter((item) => item.id !== sessionId);
        });
      }
      return { ok: true };
    },

    forceLogout(sessionId) {
      const session = store.snapshot().sessions.find((item) => item.id === sessionId);
      if (!session) return { ok: false, error: "unauthenticated" };
      forceLogoutUser(session.userId);
      return { ok: true };
    }
  };
}
