import { INVITE_ERRORS } from "../../src/auth.js";
import { absoluteInviteUrl } from "../../src/auth.js";
import { createInviteApi } from "./api.js";
import { shareS4Invite } from "./flow.js";
import { renderS4BuyerHome, renderSameSessionFail } from "./render.js";

const api = createInviteApi();
const root = document.querySelector("[data-app]");
const params = new URLSearchParams(location.search);
const fixture = params.get("fixture") || "s4";

const fixtures = {
  s4: {
    email: "buyer@example.com",
    invite: {
      status: "waiting",
      remainingMs: 6 * 60 * 60 * 1000,
      lastSentAt: "2026-08-23T00:00:00.000Z",
      email: "partner@example.com",
      url: "/invite/accept?token=preview-s4"
    }
  },
  "s4-empty": {
    email: "buyer@example.com"
  },
  "same-session": { screen: "same-session" }
};

let state = { ...fixtures[fixture] || fixtures.s4, copied: false, error: "" };

function paint() {
  if ((fixtures[fixture] || {}).screen === "same-session" || state.screen === "same-session") {
    root.innerHTML = renderSameSessionFail();
  } else {
    root.innerHTML = renderS4BuyerHome(state);
  }
  bind();
}

function bind() {
  document.querySelector("[data-invite-form]")?.addEventListener("submit", onSend);
  document.querySelector('[data-action="copy-invite-link"]')?.addEventListener("click", () => onShare("copy"));
  document.querySelector('[data-action="share-instagram"]')?.addEventListener("click", () => onShare("instagram"));
  document.querySelector('[data-action="share-kakao"]')?.addEventListener("click", () => onShare("kakao"));
  document.querySelectorAll('[data-action="logout-continue"]').forEach((node) => {
    node.addEventListener("click", onLogoutContinue);
  });
  document.querySelector('[data-action="logout"]')?.addEventListener("click", onLogout);
}

async function onSend(event) {
  event.preventDefault();
  const email = new FormData(event.target).get("email");
  const result = await api.sendOrResend(String(email || ""));
  if (!result.ok) {
    state = { ...state, error: INVITE_ERRORS[result.payload?.error] || INVITE_ERRORS.failed };
    paint();
    return;
  }
  state = {
    ...state,
    error: "",
    copied: false,
    invite: result.payload.workspace?.invite || {
      status: "waiting",
      remainingMs: result.payload.expiresAt ? Date.parse(result.payload.expiresAt) - Date.now() : 0,
      lastSentAt: result.payload.lastSentAt,
      email: result.payload.email,
      url: result.payload.url
    }
  };
  paint();
}

async function onShare(channel) {
  const url = absoluteInviteUrl(location.origin, state.invite?.url || "");
  const result = await shareS4Invite(url, channel);
  state = { ...state, copied: result === "copied" };
  paint();
}

async function onLogoutContinue() {
  await api.logoutAndContinue();
  state = { ...state, screen: "same-session" };
  paint();
}

async function onLogout() {
  await api.logoutAndContinue();
}

paint();
