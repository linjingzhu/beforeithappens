export const S9_MODULE = "../s9/logout-chrome.js";
export const S9_HOST = "logout-control";

export async function loadS9LogoutChrome() {
  try {
    return await import("../s9/logout-chrome.js");
  } catch {
    return null;
  }
}

export function shouldAttachS9(host) {
  return host === S9_HOST;
}

export async function attachS9IfPresent(logoutControl, host = S9_HOST) {
  if (!shouldAttachS9(host) || !logoutControl) return null;
  const s9 = await loadS9LogoutChrome();
  if (!s9?.composeLogoutChrome) return null;
  return s9.composeLogoutChrome({ logoutControl });
}
