export const AUTH_API = {
  magicLink: "/api/auth/magic-link",
  consume: "/api/auth/consume",
  session: "/api/auth/session",
  ackNotice: "/api/auth/ack-notice"
};

export function extractMagicLinkToken(url) {
  try {
    const parsed = new URL(String(url || ""), "https://ab.local");
    if (parsed.pathname === "/invite/accept" || parsed.pathname === "/install" || parsed.pathname === "/start") {
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
  setCookie
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
      const result = await request(AUTH_API.magicLink, { method: "POST", body: { email } });
      if (!result.ok) return { ok: false, error: result.payload.error || "failed" };
      return { ok: true };
    },

    async consumeMagicLink(tokenOrUrl) {
      const token = String(tokenOrUrl || "").includes("://") || String(tokenOrUrl || "").includes("/auth/consume")
        ? extractMagicLinkToken(tokenOrUrl)
        : String(tokenOrUrl || "");
      if (!token) return { ok: false, error: "invalid" };
      const result = await request(AUTH_API.consume, { method: "POST", body: { token } });
      if (!result.ok) return { ok: false, error: result.payload.error || "invalid" };
      return { ok: true, session: result.payload.session };
    },

    async session() {
      const result = await request(AUTH_API.session);
      return result.payload;
    },

    async acknowledgeNotice() {
      const result = await request(AUTH_API.ackNotice, { method: "POST" });
      if (!result.ok) return { ok: false, error: result.payload.error || "unauthenticated" };
      return { ok: true, session: result.payload };
    }
  };
}
