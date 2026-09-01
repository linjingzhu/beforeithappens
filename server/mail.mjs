import { consumeAppUrl, inviteAppUrl } from "../src/pair-code.js";

export const LOGIN_MAIL = {
  subject: "로그인 링크",
  text: "비밀번호 없이 로그인하려면 이 링크를 열어 주세요. 링크는 10분 동안만 유효해요."
};

export const DEFAULT_MAIL_FROM = "LoveMe <onboarding@resend.dev>";
export const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export function webConsumePath(token) {
  return `/?token=${encodeURIComponent(String(token || ""))}`;
}

/**
 * The mailed link stays the `loveme` app scheme, which the spec locks so an installed app
 * opens instead of Safari. A deployment that must also serve phones without the app can set
 * AB_WEB_CONSUME_FALLBACK=1: the mail then links to an https hop that still hands off to the
 * app first and only falls back to the web when nothing answers.
 */
export function webConsumeFallback(env = process.env) {
  return String(env?.AB_WEB_CONSUME_FALLBACK || "") === "1";
}

export function consumeUrl(origin, token, env = process.env) {
  const base = String(origin || "").replace(/\/$/, "");
  if (!base || !webConsumeFallback(env)) return consumeAppUrl(token);
  return `${base}/auth/consume?token=${encodeURIComponent(String(token || ""))}`;
}

export function appHopHtml(appUrl, webFallback = "") {
  const href = escapeHtml(appUrl);
  const app = JSON.stringify(String(appUrl || ""));
  if (!webFallback) {
    return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${href}"><title>LoveMe</title></head><body><p><a href="${href}">LoveMe</a></p><script>location.replace(${app})</script></body></html>`;
  }
  const web = JSON.stringify(String(webFallback));
  const webHref = escapeHtml(webFallback);
  // A phone gets the hand-off: the app answers and the timer is cancelled by the tab going hidden.
  // A desktop browser goes straight to the web, because `loveme://` is a scheme it has never heard
  // of — it opens a modal asking which application to use, and until someone dismisses that dialog
  // the page underneath receives no clicks at all. Measured: every click on the signed-in screen
  // was swallowed. The app link stays on the page for anyone who wants it.
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>LoveMe</title></head><body><p><a href="${href}">LoveMe</a></p><p><a href="${webHref}">웹에서 열기</a></p><script>var w=${web};if(!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){location.replace(w)}else{var t=setTimeout(function(){location.replace(w)},1200);document.addEventListener("visibilitychange",function(){if(document.hidden)clearTimeout(t)});location.href=${app}}</script></body></html>`;
}

export function consumeHopHtml(token, env = process.env) {
  return appHopHtml(consumeAppUrl(token), webConsumeFallback(env) ? webConsumePath(token) : "");
}

export function inviteHopHtml() {
  return appHopHtml(inviteAppUrl());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function loginMailHtml(url) {
  const href = escapeHtml(url);
  return `<p>${escapeHtml(LOGIN_MAIL.text)}</p><p><a href="${href}">${href}</a></p>`;
}

export function hasResendKey(env = process.env) {
  return Boolean(String(env?.RESEND_API_KEY || "").trim());
}

/**
 * Distinct, non-leaking failure codes. A 502 carries one of these so the host log and the
 * operator can tell "nobody configured a key" from "Resend refused this send" without ever
 * putting an API key, a login token or a recipient address in the response.
 */
export const MAIL_ERRORS = Object.freeze({
  notConfigured: "mail-not-configured",
  outboxRefused: "mail-outbox-refused",
  keyRejected: "mail-key-rejected",
  senderRestricted: "mail-sender-restricted",
  senderRejected: "mail-sender-rejected",
  rateLimited: "mail-rate-limited",
  providerUnavailable: "mail-provider-unavailable",
  providerError: "mail-provider-error",
  unreachable: "mail-unreachable"
});

export const MAIL_VIA = Object.freeze({
  resend: "resend",
  outbox: "outbox",
  none: "none"
});

/**
 * Every non-2xx Resend reply used to collapse into `failed`. Status alone is enough to name
 * the misconfiguration, and the provider body is never read: its 403 text quotes the
 * recipient address back at you, which must not reach a client or a log line.
 */
export function mailErrorForStatus(status) {
  const code = Number(status);
  if (code === 401) return MAIL_ERRORS.keyRejected;
  if (code === 403) return MAIL_ERRORS.senderRestricted;
  if (code === 422) return MAIL_ERRORS.senderRejected;
  if (code === 429) return MAIL_ERRORS.rateLimited;
  if (Number.isFinite(code) && code >= 500) return MAIL_ERRORS.providerUnavailable;
  return MAIL_ERRORS.providerError;
}

// Hosts that announce themselves. A deploy that forgot NODE_ENV=production still sets one of
// these, so the dev outbox cannot quietly stand in for real mail on a live box.
export const PRODUCTION_HOST_ENV_KEYS = Object.freeze([
  "RENDER",
  "RENDER_SERVICE_ID",
  "RENDER_EXTERNAL_URL",
  "FLY_APP_NAME",
  "DYNO",
  "K_SERVICE",
  "VERCEL",
  "RAILWAY_ENVIRONMENT",
  "AWS_EXECUTION_ENV"
]);

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

function isRemoteOrigin(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  let host;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return false;
  }
  if (!host || LOCAL_HOSTNAMES.has(host)) return false;
  return !host.endsWith(".local") && !host.endsWith(".localhost");
}

/**
 * True when this process is answering the public internet: NODE_ENV says so, the platform
 * says so, or AB_PUBLIC_ORIGIN points at a non-local host.
 */
export function looksLikeProductionHost(env = process.env) {
  if (String(env?.NODE_ENV || "").trim().toLowerCase() === "production") return true;
  if (PRODUCTION_HOST_ENV_KEYS.some((key) => String(env?.[key] || "").trim())) return true;
  return isRemoteOrigin(env?.AB_PUBLIC_ORIGIN);
}

export async function sendLoginEmail({
  to,
  url,
  fetchImpl = globalThis.fetch,
  env = process.env
} = {}) {
  const apiKey = String(env?.RESEND_API_KEY || "").trim();
  if (!apiKey) return { ok: false, error: MAIL_ERRORS.notConfigured };
  const from = String(env?.MAIL_FROM || "").trim() || DEFAULT_MAIL_FROM;
  let response;
  try {
    response = await fetchImpl(RESEND_EMAILS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: LOGIN_MAIL.subject,
        html: loginMailHtml(url),
        text: `${LOGIN_MAIL.text}\n${url}`
      })
    });
  } catch {
    return { ok: false, error: MAIL_ERRORS.unreachable };
  }
  const status = Number(response?.status);
  if (!Number.isFinite(status) || status < 200 || status >= 300) {
    return { ok: false, error: mailErrorForStatus(status), status: Number.isFinite(status) ? status : 0 };
  }
  return { ok: true, delivered: true, via: MAIL_VIA.resend };
}

/**
 * Resolves to `{ ok, delivered, via, error? }`.
 *
 * `ok` only says the request may return 200. `delivered` is the one field that means a mail
 * provider accepted the message, and it is true only for `via: "resend"`. The dev outbox
 * answers `{ ok: true, delivered: false, via: "outbox" }` so no caller can print
 * "we sent the mail" off a truthy `ok`; use `wasMailDelivered(result)` for that claim.
 */
export async function deliverLoginLink({
  to,
  url,
  allowDevOutbox = false,
  fetchImpl = globalThis.fetch,
  env = process.env
} = {}) {
  if (hasResendKey(env)) {
    const sent = await sendLoginEmail({ to, url, fetchImpl, env });
    if (!sent.ok) return { ok: false, delivered: false, via: MAIL_VIA.resend, error: sent.error };
    return { ok: true, delivered: true, via: MAIL_VIA.resend };
  }
  if (allowDevOutbox) {
    // Refuse outright rather than hand back a success a live host would repeat to a real user:
    // the outbox is a developer console, and on a public host it is a lie plus a token leak.
    if (looksLikeProductionHost(env)) {
      return { ok: false, delivered: false, via: MAIL_VIA.none, error: MAIL_ERRORS.outboxRefused };
    }
    return { ok: true, delivered: false, via: MAIL_VIA.outbox };
  }
  return { ok: false, delivered: false, via: MAIL_VIA.none, error: MAIL_ERRORS.notConfigured };
}

/** True only when a mail provider accepted the message. The outbox never satisfies this. */
export function wasMailDelivered(result) {
  return Boolean(result?.ok && result?.delivered === true && result?.via === MAIL_VIA.resend);
}
