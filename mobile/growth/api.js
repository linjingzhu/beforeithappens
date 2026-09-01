/** Thin client for the recommend and gift routes. Same request shape as the S4 invite client. */
export const GROWTH_API = Object.freeze({
  referral: { method: "GET", path: "/api/referral" },
  claim: { method: "POST", path: "/api/referral/claim" },
  createGift: { method: "POST", path: "/api/gift" },
  sentGifts: { method: "GET", path: "/api/gift/sent" },
  revokeGift: { method: "POST", path: "/api/gift/revoke" },
  redeemGift: { method: "POST", path: "/api/gift/redeem" },
  previewGift: { method: "GET", path: "/api/gift/preview" }
});

export function createGrowthApi(io = {}) {
  const request = io.request || defaultRequest({
    fetchImpl: io.fetch || globalThis.fetch.bind(globalThis),
    origin: String(io.origin || "").replace(/\/$/, ""),
    getCookie: io.getCookie,
    setCookie: io.setCookie
  });

  return {
    async referral() {
      return request(GROWTH_API.referral);
    },

    async claim(code) {
      return request({ ...GROWTH_API.claim, body: { code } });
    },

    async createGift() {
      return request(GROWTH_API.createGift);
    },

    async sentGifts() {
      return request(GROWTH_API.sentGifts);
    },

    async revokeGift(giftId) {
      return request({ ...GROWTH_API.revokeGift, body: { giftId } });
    },

    async redeemGift(token) {
      return request({ ...GROWTH_API.redeemGift, body: { token } });
    },

    async previewGift(token) {
      const path = `${GROWTH_API.previewGift.path}?token=${encodeURIComponent(String(token || ""))}`;
      return request({ method: GROWTH_API.previewGift.method, path });
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
