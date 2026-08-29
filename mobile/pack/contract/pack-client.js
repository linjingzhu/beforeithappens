const SESSION_COOKIE = "ab_session";

export function createPackClient({
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
    async getState() {
      return request("/api/pack/state");
    },
    async saveDraft({ questionId, draftChoice, privateNote, index } = {}) {
      return request("/api/pack/draft", {
        method: "PATCH",
        body: { questionId, draftChoice, privateNote, index }
      });
    },
    async submit({ questionId, index } = {}) {
      return request("/api/pack/submit", {
        method: "POST",
        body: { questionId, index }
      });
    },
    async saveAgreement({ questionId, action, proposal, index } = {}) {
      return request("/api/pack/agreement", {
        method: "POST",
        body: { questionId, action, proposal, index }
      });
    }
  };
}

export function neverMigrateLocalSim(storage) {
  if (!storage) return [];
  const keys = typeof storage.keys === "function"
    ? storage.keys()
    : Object.keys(storage);
  return keys.filter((key) => /local[-_]?sim|ab-local|simulator/i.test(String(key)));
}
