/** Thin client for the existing web invite/session APIs. No new endpoints. */
export const INVITE_API = Object.freeze({
  send: { method: "POST", path: "/api/invite" },
  preview: { method: "GET", path: "/api/invite/preview" },
  accept: { method: "POST", path: "/api/invite/accept" },
  session: { method: "GET", path: "/api/auth/session" },
  forceLogout: { method: "POST", path: "/api/auth/force-logout" }
});

export function createInviteApi(io = {}) {
  const request = io.request || defaultRequest({
    fetchImpl: io.fetch || globalThis.fetch.bind(globalThis),
    origin: String(io.origin || "").replace(/\/$/, ""),
    getCookie: io.getCookie,
    setCookie: io.setCookie
  });

  return {
    async session() {
      return request(INVITE_API.session);
    },

    /** First send and email-typo resend. Server expires the previous token. */
    async sendOrResend(email) {
      return request({
        ...INVITE_API.send,
        body: { email }
      });
    },

    async preview(token) {
      const path = `${INVITE_API.preview.path}?token=${encodeURIComponent(String(token || ""))}`;
      return request({ method: INVITE_API.preview.method, path });
    },

    async accept(token) {
      return request({
        ...INVITE_API.accept,
        body: { token }
      });
    },

    /** Same-session CTA: force logout, then continue for the invited email. */
    async logoutAndContinue() {
      return request(INVITE_API.forceLogout);
    }
  };
}

function defaultRequest({ fetchImpl, origin = "", getCookie, setCookie } = {}) {
  return async function request({ method, path, body } = {}) {
    const headers = {};
    if (body) headers["content-type"] = "application/json";
    const cookie = getCookie?.();
    if (cookie) headers.cookie = cookie;
    const response = await fetchImpl(`${origin}${path}`, {
      method,
      credentials: origin ? "include" : "same-origin",
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const listed = response.headers?.getSetCookie?.() || [];
    const single = response.headers?.get?.("set-cookie");
    const setCookieHeader = listed.length ? listed : (single ? [single] : []);
    if (setCookie && setCookieHeader.length) {
      setCookie(setCookieHeader.map((value) => String(value).split(";")[0].trim()).filter(Boolean).join("; "));
    }
    const payload = await response.json().catch(() => ({ ok: false, error: "invalid-json" }));
    return { status: response.status, ok: response.ok && payload?.ok !== false, payload };
  };
}
