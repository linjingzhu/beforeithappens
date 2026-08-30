export const LOGIN_MAIL = {
  subject: "로그인 링크",
  text: "비밀번호 없이 로그인하려면 이 링크를 열어 주세요. 링크는 10분 동안만 유효해요."
};

export const DEFAULT_MAIL_FROM = "LoveMe <onboarding@resend.dev>";
export const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export function consumeUrl(origin, token) {
  return `${origin}/auth/consume?token=${encodeURIComponent(token)}`;
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
