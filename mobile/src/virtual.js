export const DEBUG_LINE = "[debug]";

export function isStoreBuild(env = globalThis.process?.env || {}) {
  return env.EAS_BUILD_PROFILE === "production"
    || env.EXPO_PUBLIC_STORE_BUILD === "1";
}

/**
 * Virtual mail, pairing and IAP for demos. It is opt-in: a build talks to the real server
 * unless it is explicitly asked not to, so "it worked on my machine" cannot mean a fake
 * partner. Expo only exposes EXPO_PUBLIC_* to the bundle, so both spellings are honoured.
 * Store builds are never virtual.
 */
export function isVirtualDebug(env = globalThis.process?.env || {}) {
  if (isStoreBuild(env)) return false;
  return env.LOVEME_VIRTUAL === "1" || env.EXPO_PUBLIC_LOVEME_VIRTUAL === "1";
}

export function debugLine(env = globalThis.process?.env || {}, extra = "") {
  if (isStoreBuild(env)) return "";
  const word = String(extra || "").trim();
  return word ? `${DEBUG_LINE} ${word}` : DEBUG_LINE;
}

export function fakeSession(email, { role = "buyer", acceptedPartner = false, partnerEmail = "" } = {}) {
  return {
    user: { id: "usr_virtual", email: String(email || "").trim().toLowerCase() },
    notice: null,
    workspace: {
      id: "ws_virtual",
      role,
      acceptedPartner: Boolean(acceptedPartner),
      partnerEmail: partnerEmail || ""
    }
  };
}
