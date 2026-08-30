export const SOCIAL_PROVIDERS = ["kakao", "naver", "google"];

const CLIENT_ID_ENV = {
  kakao: "AB_OAUTH_KAKAO_CLIENT_ID",
  naver: "AB_OAUTH_NAVER_CLIENT_ID",
  google: "AB_OAUTH_GOOGLE_CLIENT_ID"
};

export function normalizeProvider(value) {
  const provider = String(value || "").trim().toLowerCase();
  return SOCIAL_PROVIDERS.includes(provider) ? provider : "";
}

export function isOAuthConfigured(provider, env = process.env) {
  const key = CLIENT_ID_ENV[normalizeProvider(provider)];
  return Boolean(key && String(env[key] || "").trim());
}

export function oauthEnvFlags(env = process.env) {
  return Object.fromEntries(SOCIAL_PROVIDERS.map((provider) => [provider, isOAuthConfigured(provider, env)]));
}

export function oauthAuthorizeUrl(provider, { origin = "", env = process.env, state = "" } = {}) {
  const name = normalizeProvider(provider);
  if (!name || !isOAuthConfigured(name, env)) return "";
  const clientId = String(env[CLIENT_ID_ENV[name]]).trim();
  const redirect = `${String(origin || "").replace(/\/$/, "")}/api/auth/oauth/${name}/callback`;
  const hosts = {
    kakao: "https://kauth.kakao.com/oauth/authorize",
    naver: "https://nid.naver.com/oauth2.0/authorize",
    google: "https://accounts.google.com/o/oauth2/v2/auth"
  };
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirect,
    response_type: "code",
    state: String(state || "")
  });
  if (name === "google") params.set("scope", "openid email profile");
  return `${hosts[name]}?${params}`;
}
