const SESSION_COOKIE = "ab_session";

export function createPaywallClient({
  baseUrl = "",
  sessionId = "",
  fetchImpl = globalThis.fetch.bind(globalThis)
} = {}) {
  async function request(path, { method = "GET", body } = {}) {
    const headers = { accept: "application/json" };
    if (body) headers["content-type"] = "application/json";
    if (sessionId) headers.cookie = `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`;
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method,
      credentials: "include",
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: payload.error || "failed", status: response.status, payload };
    }
    return { ok: true, status: response.status, ...payload };
  }

  return {
    sessionCookieName: SESSION_COOKIE,
    async getEntitlement() {
      return request("/api/entitlement");
    },
    async purchase() {
      return request("/api/purchase", { method: "POST", body: {} });
    }
  };
}
