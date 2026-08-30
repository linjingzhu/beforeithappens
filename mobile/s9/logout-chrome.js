import { S9_COPY, S9_PLACEMENT, handoffAllowedAt } from "./copy.js";

export const S9_ENDPOINTS = {
  session: { method: "GET", path: "/api/auth/session" },
  logout: { method: "POST", path: "/api/auth/logout" },
  forceLogout: { method: "POST", path: "/api/auth/force-logout" }
};

export function composeLogoutChrome({ logoutControl, caption = S9_COPY.logoutHandoff } = {}) {
  return {
    kind: "chrome",
    screen: false,
    route: false,
    modal: false,
    page: false,
    placement: S9_PLACEMENT.host,
    logoutControl: logoutControl ?? null,
    caption
  };
}

export function attachHandoffCaption(host, caption = S9_COPY.logoutHandoff) {
  if (!handoffAllowedAt(host)) {
    return { ok: false, error: "forbidden-host", caption: "" };
  }
  return { ok: true, host, caption };
}

export async function requestDeviceHandoffLogout(fetchImpl, { origin = "" } = {}) {
  if (typeof fetchImpl !== "function") throw new Error("fetch is required");
  const base = String(origin || "").replace(/\/$/, "");
  const post = (path) => fetchImpl(`${base}${path}`, {
    method: "POST",
    credentials: "same-origin"
  });
  try {
    const forced = await post(S9_ENDPOINTS.forceLogout.path);
    if (forced && forced.ok !== false) return { ok: true, via: "force-logout" };
  } catch {
    /* fall through to regular logout */
  }
  const regular = await post(S9_ENDPOINTS.logout.path);
  return { ok: Boolean(regular && regular.ok !== false), via: "logout" };
}
