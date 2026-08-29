import { afterSplashScreen, isLoggedIn } from "./session.js";
import { attachS9IfPresent, S9_HOST } from "./s9-mount.js";

export const PACK_ROOTS = ["s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"];

export function hostEntry() {
  return {
    kind: "host",
    name: "LoveMe",
    splash: "s0",
    afterSplash: afterSplashScreen(),
    packs: PACK_ROOTS.map((id) => `mobile/${id}/`)
  };
}

export async function logoutChromeForHost(logoutControl) {
  if (!isLoggedIn()) return null;
  return attachS9IfPresent(logoutControl, S9_HOST);
}
