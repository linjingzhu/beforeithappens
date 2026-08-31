import { createPackClient } from "./contract/pack-client.js";
import { createPackController } from "./contract/pack-controller.js";
import { loadMarriagePack } from "./contract/pack-catalog.js";
import { createPaywallClient } from "../paywall/contract/paywall-client.js";

/**
 * The host owns one cookie jar for the logged-in session. Pack calls must ride on it,
 * so requests go through a fetch that carries that cookie and records any refresh.
 */
export function hostPackFetch({ origin = "", getCookie, setCookie } = {}, fetchImpl = globalThis.fetch) {
  if (typeof fetchImpl !== "function") throw new Error("fetchImpl is required");
  return async (url, init = {}) => {
    const target = /^[a-z]+:\/\//i.test(String(url)) ? String(url) : `${origin}${url}`;
    const headers = { ...(init.headers || {}) };
    const cookie = getCookie?.();
    if (cookie && !headers.cookie) headers.cookie = cookie;
    const response = await fetchImpl(target, { ...init, credentials: "include", headers });
    const listed = response.headers?.getSetCookie?.() || [];
    const single = response.headers?.get?.("set-cookie");
    const values = listed.length ? listed : (single ? [single] : []);
    if (setCookie && values.length) {
      setCookie(values.map((value) => String(value).split(";")[0].trim()).filter(Boolean).join("; "));
    }
    return response;
  };
}

/**
 * The catalog arrives as already-parsed JSON from the host, which Metro bundles.
 * Passing it in keeps node:fs — and a bundler-only import — out of this module.
 */
export function hostMarriagePack(source) {
  return loadMarriagePack(source);
}

export function createHostPack({
  session,
  cookieAccess = {},
  fetchImpl = globalThis.fetch,
  catalog,
  pack = catalog ? hostMarriagePack(catalog) : null
} = {}) {
  if (!pack) throw new Error("pack catalog is required");
  const packFetch = hostPackFetch(cookieAccess, fetchImpl);
  return createPackController({
    pack,
    session,
    client: createPackClient({ fetchImpl: packFetch }),
    paywallClient: createPaywallClient({ fetchImpl: packFetch })
  });
}

/** The real pack opens only when the server says a partner accepted. */
export function hostPackReady(session) {
  return session?.workspace?.acceptedPartner === true;
}
