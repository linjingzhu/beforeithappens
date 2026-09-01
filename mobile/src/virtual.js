export const DEBUG_LINE = "[debug]";

/**
 * Expo replaces the *literal* expression `process.env.EXPO_PUBLIC_NAME` with the build's
 * value while bundling; nothing reads an env var at runtime on a phone. `process.env` on
 * device is only React Native's shim (`{ NODE_ENV }`), so a lookup written as
 * `globalThis.process?.env?.EXPO_PUBLIC_NAME` is not a substitution target and always
 * answers `undefined` in a built app — the flag silently stops existing.
 *
 * These reads are therefore spelled out literally, one per name, and merged over whatever
 * `process.env` the host happens to have. Node keeps its real environment (the tests pass
 * their own object and still win); a device gets the values EAS built in.
 */
function inlinedBuildEnv() {
  if (typeof process === "undefined" || !process.env) return {};
  return {
    EXPO_PUBLIC_STORE_BUILD: process.env.EXPO_PUBLIC_STORE_BUILD,
    EXPO_PUBLIC_LOVEME_VIRTUAL: process.env.EXPO_PUBLIC_LOVEME_VIRTUAL
  };
}

export function buildEnv() {
  const runtime = globalThis.process?.env || {};
  const merged = { ...runtime };
  for (const [key, value] of Object.entries(inlinedBuildEnv())) {
    if (value !== undefined) merged[key] = value;
  }
  return merged;
}

export function isStoreBuild(env = buildEnv()) {
  return env.EAS_BUILD_PROFILE === "production"
    || env.EXPO_PUBLIC_STORE_BUILD === "1";
}

/**
 * Virtual mail, pairing and IAP for demos. It is opt-in: a build talks to the real server
 * unless it is explicitly asked not to, so "it worked on my machine" cannot mean a fake
 * partner. Expo only exposes EXPO_PUBLIC_* to the bundle, so both spellings are honoured.
 * Store builds are never virtual.
 */
export function isVirtualDebug(env = buildEnv()) {
  if (isStoreBuild(env)) return false;
  return env.LOVEME_VIRTUAL === "1" || env.EXPO_PUBLIC_LOVEME_VIRTUAL === "1";
}

export function debugLine(env = buildEnv(), extra = "") {
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
