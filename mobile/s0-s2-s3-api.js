export const AUTH_API = {
  magicLink: "/api/auth/magic-link",
  consume: "/api/auth/consume",
  session: "/api/auth/session",
  ackNotice: "/api/auth/ack-notice",
  oauthStart: "/api/auth/oauth/start",
  emailBind: "/api/auth/email-bind",
  pairCode: "/api/pair-code",
  pairConnect: "/api/pair-code/connect",
  previewQ1: "/api/preview-q1",
  logout: "/api/auth/logout",
  accountDelete: "/api/account/delete"
};

export const SESSION_FETCH_MS = 2000;
export const AUTH_FETCH_MS = 55000;
export const OAUTH_FETCH_MS = 5000;

export function emptyAuthSession() {
  return { user: null, notice: null, workspace: { id: null, role: null, acceptedPartner: false } };
}

export function hasApiOrigin(origin) {
  return Boolean(String(origin || "").trim());
}

export async function withTimeout(promise, ms = SESSION_FETCH_MS) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), ms);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export function extractMagicLinkToken(url) {
  try {
    const parsed = new URL(String(url || ""), "https://ab.local");
    const path = `${parsed.pathname || ""}`;
    const hostPath = `${parsed.hostname || ""}${path}`;
    if (
      path === "/invite/accept"
      || path === "/install"
      || path === "/start"
      || path === "/invite/open"
      || hostPath === "invite"
      || hostPath === "invite/open"
    ) {
      return "";
    }
    return parsed.searchParams.get("token") || "";
  } catch {
    return "";
  }
}

function cookieHeader(setCookie) {
  if (!setCookie) return "";
  const values = Array.isArray(setCookie) ? setCookie : [setCookie];
  return values
    .map((value) => String(value).split(";")[0].trim())
    .filter(Boolean)
    .join("; ");
}

export function createAuthApi({
  fetchImpl = globalThis.fetch,
  origin = "",
  getCookie,
  setCookie,
  sessionTimeoutMs = SESSION_FETCH_MS,
  authTimeoutMs = AUTH_FETCH_MS,
  oauthTimeoutMs = OAUTH_FETCH_MS
} = {}) {
  if (typeof fetchImpl !== "function") throw new Error("fetchImpl is required");

  async function request(path, { method = "GET", body } = {}) {
    const headers = {};
    if (body) headers["content-type"] = "application/json";
    const cookie = getCookie?.();
    if (cookie) headers.cookie = cookie;
    const response = await fetchImpl(`${origin}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const listed = response.headers?.getSetCookie?.() || [];
    const single = response.headers?.get?.("set-cookie");
    const setCookieHeader = listed.length ? listed : (single ? [single] : []);
    if (setCookie && setCookieHeader.length) setCookie(cookieHeader(setCookieHeader));
    const payload = await response.json().catch(() => ({}));
    return { ok: response.ok, status: response.status, payload };
  }

  return {
    async requestMagicLink(email) {
      try {
        const result = await withTimeout(request(AUTH_API.magicLink, { method: "POST", body: { email } }), authTimeoutMs);
        if (!result.ok) {
          if (result.status === 502) return { ok: false, error: "failed" };
          return { ok: false, error: result.payload.error || "failed" };
        }
        return { ok: true };
      } catch {
        return { ok: false, error: "failed" };
      }
    },

    /**
     * The one call the whole deep link hangs on. It is the only place the host awaits before
     * it can leave the splash, so it must always settle: an unbounded fetch here leaves a
     * cold-started app on the wordmark for as long as the socket stays half-open. It gets the
     * same long allowance as the send, because a phone can open the mail minutes later against
     * a host that has spun down again.
     */
    async consumeMagicLink(tokenOrUrl) {
      const token = String(tokenOrUrl || "").includes("://") || String(tokenOrUrl || "").includes("/auth/consume")
        ? extractMagicLinkToken(tokenOrUrl)
        : String(tokenOrUrl || "");
      if (!token) return { ok: false, error: "invalid" };
      let result;
      try {
        result = await withTimeout(request(AUTH_API.consume, { method: "POST", body: { token } }), authTimeoutMs);
      } catch {
        return { ok: false, error: "invalid" };
      }
      if (!result.ok) return { ok: false, error: result.payload.error || "invalid" };
      return { ok: true, session: result.payload.session };
    },

    async session() {
      if (!hasApiOrigin(origin)) return emptyAuthSession();
      const result = await withTimeout(request(AUTH_API.session), sessionTimeoutMs);
      return result.payload;
    },

    async acknowledgeNotice() {
      const result = await request(AUTH_API.ackNotice, { method: "POST" });
      if (!result.ok) return { ok: false, error: result.payload.error || "unauthenticated" };
      return { ok: true, session: result.payload };
    },

    async startOAuth(provider) {
      try {
        const result = await withTimeout(request(AUTH_API.oauthStart, { method: "POST", body: { provider } }), oauthTimeoutMs);
        if (!result.ok) {
          if (result.status === 501) return { ok: false, error: "oauth-unconfigured" };
          return { ok: false, error: result.payload.error || "oauth-unconfigured" };
        }
        return { ok: true, url: result.payload.url, provider: result.payload.provider };
      } catch {
        return { ok: false, error: "oauth-unconfigured" };
      }
    },

    async savePreviewQ1({ questionId, choiceId } = {}) {
      try {
        const result = await withTimeout(request(AUTH_API.previewQ1, {
          method: "POST",
          body: { questionId, choiceId }
        }), authTimeoutMs);
        if (!result.ok) return { ok: false, error: result.payload.error || "failed" };
        return { ok: true, ...result.payload };
      } catch {
        return { ok: false, error: "failed" };
      }
    },

    async myPairCode() {
      try {
        const result = await withTimeout(request(AUTH_API.pairCode), authTimeoutMs);
        if (!result.ok) return { ok: false, error: result.payload.error || "failed" };
        return {
          ok: true,
          code: result.payload.code || "",
          display: result.payload.display || "",
          url: result.payload.url || ""
        };
      } catch {
        return { ok: false, error: "failed" };
      }
    },

    async connectPairCode(code) {
      try {
        const result = await withTimeout(request(AUTH_API.pairConnect, { method: "POST", body: { code } }), authTimeoutMs);
        if (!result.ok) return { ok: false, error: result.payload.error || "failed" };
        return { ok: true, session: result.payload.session };
      } catch {
        return { ok: false, error: "failed" };
      }
    },

    async requestEmailBind(email) {
      try {
        const result = await withTimeout(request(AUTH_API.emailBind, { method: "POST", body: { email } }), authTimeoutMs);
        if (!result.ok) return { ok: false, error: result.payload.error || "failed" };
        return { ok: true };
      } catch {
        return { ok: false, error: "failed" };
      }
    },

    async logout() {
      try {
        await withTimeout(request(AUTH_API.logout, { method: "POST" }), sessionTimeoutMs);
      } catch {
        /* still clear the local cookie */
      }
      if (setCookie) setCookie("");
      return { ok: true };
    },

    /**
     * 탈퇴. Irreversible, so it never fails open the way logout does: a failure is reported and
     * the local session cookie is kept. The long auth timeout is deliberate — reporting a
     * timeout on a delete the server actually completed is the worse lie.
     */
    async deleteAccount() {
      let result;
      try {
        result = await withTimeout(request(AUTH_API.accountDelete, {
          method: "POST",
          body: { confirm: true }
        }), authTimeoutMs);
      } catch {
        return { ok: false, error: "failed" };
      }
      if (!result.ok) return { ok: false, error: result.payload.error || "failed" };
      if (setCookie) setCookie("");
      return { ok: true };
    }
  };
}
