import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { attestProviderEmail, isValidEmail, normalizeEmail } from "./auth.mjs";

export const SOCIAL_PROVIDERS = ["kakao", "naver", "google"];

const CLIENT_ID_ENV = {
  kakao: "AB_OAUTH_KAKAO_CLIENT_ID",
  naver: "AB_OAUTH_NAVER_CLIENT_ID",
  google: "AB_OAUTH_GOOGLE_CLIENT_ID"
};

const CLIENT_SECRET_ENV = {
  kakao: "AB_OAUTH_KAKAO_CLIENT_SECRET",
  naver: "AB_OAUTH_NAVER_CLIENT_SECRET",
  google: "AB_OAUTH_GOOGLE_CLIENT_SECRET"
};

export const OAUTH_CLIENT_ID_ENV = Object.freeze({ ...CLIENT_ID_ENV });
export const OAUTH_CLIENT_SECRET_ENV = Object.freeze({ ...CLIENT_SECRET_ENV });
export const OAUTH_STATE_SECRET_ENV = "AB_OAUTH_STATE_SECRET";

export const OAUTH_AUTHORIZE_ENDPOINTS = Object.freeze({
  kakao: "https://kauth.kakao.com/oauth/authorize",
  naver: "https://nid.naver.com/oauth2.0/authorize",
  google: "https://accounts.google.com/o/oauth2/v2/auth"
});

export const OAUTH_TOKEN_ENDPOINTS = Object.freeze({
  kakao: "https://kauth.kakao.com/oauth/token",
  naver: "https://nid.naver.com/oauth2.0/token",
  google: "https://oauth2.googleapis.com/token"
});

export const OAUTH_PROFILE_ENDPOINTS = Object.freeze({
  kakao: "https://kapi.kakao.com/v2/user/me",
  naver: "https://openapi.naver.com/v1/nid/me",
  google: "https://openidconnect.googleapis.com/v1/userinfo"
});

// Kakao and Naver take their consent items from the provider console, not from a
// scope parameter: sending a scope that is not enabled there fails the authorize call.
export const OAUTH_SCOPES = Object.freeze({
  kakao: "",
  naver: "",
  google: "openid email profile"
});

export const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
export const OAUTH_REQUEST_TIMEOUT_MS = 10 * 1000;

const STATE_VERSION = "v1";

export function normalizeProvider(value) {
  const provider = String(value || "").trim().toLowerCase();
  return SOCIAL_PROVIDERS.includes(provider) ? provider : "";
}

function clientId(provider, env) {
  const key = CLIENT_ID_ENV[provider];
  return key ? String(env[key] || "").trim() : "";
}

function clientSecret(provider, env) {
  const key = CLIENT_SECRET_ENV[provider];
  return key ? String(env[key] || "").trim() : "";
}

export function isOAuthConfigured(provider, env = process.env) {
  const name = normalizeProvider(provider);
  if (!name) return false;
  return Boolean(clientId(name, env) && clientSecret(name, env));
}

export function oauthEnvFlags(env = process.env) {
  return Object.fromEntries(SOCIAL_PROVIDERS.map((provider) => [provider, isOAuthConfigured(provider, env)]));
}

export function oauthRedirectUri(provider, origin = "") {
  const name = normalizeProvider(provider);
  if (!name) return "";
  return `${String(origin || "").replace(/\/$/, "")}/api/auth/oauth/${name}/callback`;
}

export function oauthAuthorizeUrl(provider, { origin = "", env = process.env, state = "" } = {}) {
  const name = normalizeProvider(provider);
  if (!name || !isOAuthConfigured(name, env)) return "";
  const params = new URLSearchParams({
    client_id: clientId(name, env),
    redirect_uri: oauthRedirectUri(name, origin),
    response_type: "code",
    state: String(state || "")
  });
  const scope = OAUTH_SCOPES[name];
  if (scope) params.set("scope", scope);
  return `${OAUTH_AUTHORIZE_ENDPOINTS[name]}?${params}`;
}

let processStateSecret = "";

function stateSecret(env) {
  const configured = String(env[OAUTH_STATE_SECRET_ENV] || "").trim();
  if (configured) return configured;
  if (!processStateSecret) processStateSecret = randomBytes(32).toString("hex");
  return processStateSecret;
}

function signState(payload, env) {
  return createHmac("sha256", stateSecret(env)).update(payload).digest("hex");
}

function equalSignature(left, right) {
  const a = Buffer.from(String(left), "utf8");
  const b = Buffer.from(String(right), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createOAuthState({
  provider = "",
  env = process.env,
  now = Date.now(),
  ttlMs = OAUTH_STATE_TTL_MS
} = {}) {
  const name = normalizeProvider(provider);
  const expiresAt = Number(now) + Number(ttlMs);
  const nonce = randomBytes(16).toString("hex");
  const payload = `${STATE_VERSION}.${name}.${expiresAt}.${nonce}`;
  return `${payload}.${signState(payload, env)}`;
}

export function verifyOAuthState(state, { provider = "", env = process.env, now = Date.now() } = {}) {
  const raw = String(state || "");
  const parts = raw.split(".");
  if (parts.length !== 5) return { ok: false, error: "invalid-state" };
  const [version, name, expiresAt, nonce, signature] = parts;
  if (version !== STATE_VERSION || !nonce) return { ok: false, error: "invalid-state" };
  const expires = Number(expiresAt);
  if (!Number.isFinite(expires)) return { ok: false, error: "invalid-state" };
  const payload = `${version}.${name}.${expiresAt}.${nonce}`;
  if (!equalSignature(signature, signState(payload, env))) return { ok: false, error: "invalid-state" };
  if (expires <= Number(now)) return { ok: false, error: "expired-state" };
  const expected = normalizeProvider(provider);
  if (expected && name !== expected) return { ok: false, error: "state-mismatch" };
  return { ok: true, provider: name };
}

function requestOptions(extra = {}) {
  const options = { ...extra };
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    options.signal = AbortSignal.timeout(OAUTH_REQUEST_TIMEOUT_MS);
  }
  return options;
}

async function readJson(response) {
  if (!response) return null;
  const status = Number(response.status);
  if (!Number.isFinite(status) || status < 200 || status >= 300) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function requestAccessToken({ provider, code, redirectUri, state, env, fetchImpl }) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId(provider, env),
    client_secret: clientSecret(provider, env),
    redirect_uri: redirectUri,
    code
  });
  if (provider === "naver" && state) body.set("state", state);
  let response;
  try {
    response = await fetchImpl(OAUTH_TOKEN_ENDPOINTS[provider], requestOptions({
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
        accept: "application/json"
      },
      body: body.toString()
    }));
  } catch {
    return { ok: false, error: "token-exchange-failed" };
  }
  const payload = await readJson(response);
  const accessToken = String(payload?.access_token || "").trim();
  if (!accessToken) return { ok: false, error: "token-exchange-failed" };
  return { ok: true, accessToken };
}

function safeEmail(value) {
  const email = normalizeEmail(value);
  return isValidEmail(email) ? email : "";
}

function isDeniedFlag(value) {
  return value === false || value === "false";
}

function isAffirmedFlag(value) {
  return value === true || value === "true";
}

// `email` is what the provider handed over; `emailVerified` is the stricter
// question of whether the provider affirmed it. Only `emailVerified` may be
// turned into a verified-email claim, because that claim lets auth.mjs write
// the address onto the account and match an existing one.
function readKakaoProfile(payload) {
  const providerUserId = String(payload?.id ?? "").trim();
  if (!providerUserId) return { ok: false, error: "profile-failed" };
  const account = payload?.kakao_account || {};
  const denied = isDeniedFlag(account.is_email_valid) || isDeniedFlag(account.is_email_verified);
  const email = denied ? "" : safeEmail(account.email);
  // Both flags must be an explicit yes — an absent flag is not an affirmation,
  // the same bar Google's email_verified has to clear.
  const emailVerified = Boolean(email)
    && isAffirmedFlag(account.is_email_valid)
    && isAffirmedFlag(account.is_email_verified);
  return { ok: true, providerUserId, email, emailVerified };
}

function readNaverProfile(payload) {
  if (payload?.resultcode && String(payload.resultcode) !== "00") return { ok: false, error: "profile-failed" };
  const profile = payload?.response || {};
  const providerUserId = String(profile.id ?? "").trim();
  if (!providerUserId) return { ok: false, error: "profile-failed" };
  // Naver's login profile carries no verification flag, so nothing here is
  // affirmed: the address only feeds the email-bind gate.
  return { ok: true, providerUserId, email: safeEmail(profile.email), emailVerified: false };
}

function readGoogleProfile(payload) {
  const providerUserId = String(payload?.sub ?? "").trim();
  if (!providerUserId) return { ok: false, error: "profile-failed" };
  const verified = isAffirmedFlag(payload?.email_verified);
  const email = verified ? safeEmail(payload?.email) : "";
  return { ok: true, providerUserId, email, emailVerified: Boolean(email) };
}

const PROFILE_READERS = {
  kakao: readKakaoProfile,
  naver: readNaverProfile,
  google: readGoogleProfile
};

async function requestProfile({ provider, accessToken, fetchImpl }) {
  let response;
  try {
    response = await fetchImpl(OAUTH_PROFILE_ENDPOINTS[provider], requestOptions({
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: "application/json"
      }
    }));
  } catch {
    return { ok: false, error: "profile-failed" };
  }
  const payload = await readJson(response);
  if (!payload) return { ok: false, error: "profile-failed" };
  return PROFILE_READERS[provider](payload);
}

export async function exchangeOAuthCode({
  provider,
  code,
  redirectUri,
  state,
  env = process.env,
  fetchImpl = globalThis.fetch
} = {}) {
  const name = normalizeProvider(provider);
  if (!name) return { ok: false, error: "invalid-provider" };
  if (!isOAuthConfigured(name, env)) return { ok: false, error: "oauth-unconfigured" };
  const authCode = String(code || "").trim();
  if (!authCode) return { ok: false, error: "invalid-code" };
  const redirect = String(redirectUri || "").trim();
  if (!redirect) return { ok: false, error: "invalid-redirect" };
  if (typeof fetchImpl !== "function") return { ok: false, error: "token-exchange-failed" };

  const token = await requestAccessToken({
    provider: name,
    code: authCode,
    redirectUri: redirect,
    state: String(state || ""),
    env,
    fetchImpl
  });
  if (!token.ok) return { ok: false, error: token.error };

  const profile = await requestProfile({ provider: name, accessToken: token.accessToken, fetchImpl });
  if (!profile.ok) return { ok: false, error: profile.error };

  // The provider affirmed this address over a channel only this function can
  // reach (client secret + authorization code). Hand auth.mjs a single-use
  // claim for exactly this identity so completeOAuth may trust the address.
  if (profile.emailVerified && profile.email) {
    attestProviderEmail({ provider: name, providerUserId: profile.providerUserId, email: profile.email });
  }

  return {
    ok: true,
    provider: name,
    providerUserId: profile.providerUserId,
    email: profile.email || ""
  };
}
