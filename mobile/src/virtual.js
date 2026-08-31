export const DEBUG_LINE = "[debug]";

export function isStoreBuild(env = globalThis.process?.env || {}) {
  return env.EAS_BUILD_PROFILE === "production"
    || env.EXPO_PUBLIC_STORE_BUILD === "1";
}

/** Virtual mail/IAP for the app. Node tests stay live unless LOVEME_VIRTUAL=1. Store builds are never virtual. */
export function isVirtualDebug(env = globalThis.process?.env || {}) {
  if (isStoreBuild(env)) return false;
  if (env.LOVEME_VIRTUAL === "1") return true;
  if (env.LOVEME_VIRTUAL === "0") return false;
  if (env.NODE_TEST_CONTEXT) return false;
  return true;
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
