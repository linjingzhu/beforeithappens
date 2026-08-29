/** Thin client for the existing web invite/session APIs. No new endpoints. */
export const INVITE_API = Object.freeze({
  send: { method: "POST", path: "/api/invite" },
  preview: { method: "GET", path: "/api/invite/preview" },
  accept: { method: "POST", path: "/api/invite/accept" },
  session: { method: "GET", path: "/api/auth/session" },
  forceLogout: { method: "POST", path: "/api/auth/force-logout" }
});

export function createInviteApi(io = {}) {
  const request = io.request || defaultRequest(io.fetch || globalThis.fetch.bind(globalThis));

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

function defaultRequest(fetchImpl) {
  return async function request({ method, path, body } = {}) {
    const response = await fetchImpl(path, {
      method,
      credentials: "same-origin",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const payload = await response.json().catch(() => ({ ok: false, error: "invalid-json" }));
    return { status: response.status, ok: response.ok && payload?.ok !== false, payload };
  };
}
