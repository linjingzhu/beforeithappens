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
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>LoveMe</title></head><body><p><a href="${href}">LoveMe</a></p><p><a href="${webHref}">웹에서 열기</a></p><script>var w=${web};var t=setTimeout(function(){location.replace(w)},1200);document.addEventListener("visibilitychange",function(){if(document.hidden)clearTimeout(t)});location.href=${app}</script></body></html>`;
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
  return Boolean(String(env.RESEND_API_KEY || "").trim());
}

export async function sendLoginEmail({
  to,
  url,
  fetchImpl = globalThis.fetch,
  env = process.env
} = {}) {
  const apiKey = String(env.RESEND_API_KEY || "").trim();
  if (!apiKey) return { ok: false, error: "missing-key" };
  const from = String(env.MAIL_FROM || "").trim() || DEFAULT_MAIL_FROM;
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
    return { ok: false, error: "failed" };
  }
  const status = Number(response?.status);
  if (!Number.isFinite(status) || status < 200 || status >= 300) {
    return { ok: false, error: "failed" };
  }
  return { ok: true };
}

export async function deliverLoginLink({
  to,
  url,
  allowDevOutbox = false,
  fetchImpl = globalThis.fetch,
  env = process.env
} = {}) {
  if (hasResendKey(env)) {
    const sent = await sendLoginEmail({ to, url, fetchImpl, env });
    if (!sent.ok) return { ok: false, error: "failed" };
    return { ok: true };
  }
  if (allowDevOutbox) return { ok: true, via: "outbox" };
  return { ok: false, error: "failed" };
}
