import test from "node:test";
import assert from "node:assert/strict";
import { S9_COPY } from "./copy.js";
import { S9_ENDPOINTS, attachHandoffCaption, composeLogoutChrome, requestDeviceHandoffLogout } from "./logout-chrome.js";

test("S9 chrome attaches the caption beside logout and is not a screen", () => {
  const chrome = composeLogoutChrome({ logoutControl: { id: "existing-logout" } });
  assert.equal(chrome.kind, "chrome");
  assert.equal(chrome.screen, false);
  assert.equal(chrome.route, false);
  assert.equal(chrome.modal, false);
  assert.equal(chrome.page, false);
  assert.equal(chrome.placement, "logout-control");
  assert.deepEqual(chrome.logoutControl, { id: "existing-logout" });
  assert.equal(chrome.caption, S9_COPY.logoutHandoff);
});

test("handoff caption cannot attach to onboarding or same-session hosts", () => {
  assert.deepEqual(attachHandoffCaption("logout-control"), {
    ok: true,
    host: "logout-control",
    caption: S9_COPY.logoutHandoff
  });
  assert.equal(attachHandoffCaption("onboarding-body").ok, false);
  assert.equal(attachHandoffCaption("same-session-fail").error, "forbidden-host");
  assert.equal(attachHandoffCaption("onboarding-body").caption, "");
});

test("device handoff logout reuses web force-logout then logout APIs", async () => {
  assert.deepEqual(S9_ENDPOINTS.session, { method: "GET", path: "/api/auth/session" });
  assert.deepEqual(S9_ENDPOINTS.logout, { method: "POST", path: "/api/auth/logout" });
  assert.deepEqual(S9_ENDPOINTS.forceLogout, { method: "POST", path: "/api/auth/force-logout" });

  const calls = [];
  const result = await requestDeviceHandoffLogout(async (url, options) => {
    calls.push({ url, options });
    return { ok: true };
  }, { origin: "https://ab.example" });
  assert.equal(result.ok, true);
  assert.equal(result.via, "force-logout");
  assert.deepEqual(calls, [{
    url: "https://ab.example/api/auth/force-logout",
    options: { method: "POST", credentials: "same-origin" }
  }]);

  const fallback = [];
  const recovered = await requestDeviceHandoffLogout(async (url, options) => {
    fallback.push({ url, options });
    if (url.endsWith("/api/auth/force-logout")) throw new Error("network");
    return { ok: true };
  });
  assert.equal(recovered.via, "logout");
  assert.equal(fallback[1].url, "/api/auth/logout");
});
