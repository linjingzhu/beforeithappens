# Social login (Kakao / Naver / Google) — owner setup

The server code for the real OAuth flow lives in `server/oauth.mjs`:
token exchange, profile fetch, and a signed CSRF `state`. None of it can run
until the owner registers the app with each provider and supplies the
credentials below. **Nothing in this document has been verified against a live
provider** — the agent that wrote it has no console access and no client
secrets, so every request path is covered only by tests with a stubbed
`fetchImpl`. Treat the first real login per provider as the actual acceptance
test.

## 1. The redirect URI (identical shape for all three providers)

```
<origin>/api/auth/oauth/<provider>/callback
```

with `<provider>` one of `kakao`, `naver`, `google`. For a production origin of
`https://loveme.example`:

| Provider | Redirect URI to register |
| --- | --- |
| Kakao | `https://loveme.example/api/auth/oauth/kakao/callback` |
| Naver | `https://loveme.example/api/auth/oauth/naver/callback` |
| Google | `https://loveme.example/api/auth/oauth/google/callback` |

Rules that bite in practice:

- The string must match **byte for byte** at authorize time and at token
  exchange time. No trailing slash, no `www.` drift, no `http` vs `https` mix.
- The server derives the origin from `AB_PUBLIC_ORIGIN` when it is set, and from
  the request `Host` (plus `x-forwarded-proto`) otherwise. Set
  `AB_PUBLIC_ORIGIN` in production so a proxy cannot produce a redirect URI the
  provider has not seen.
- For local testing register the local origin too (e.g.
  `http://localhost:4173/api/auth/oauth/google/callback`). Kakao and Naver both
  accept `http://localhost`; Google accepts `http://localhost` but not other
  plain-http hosts.

## 2. Environment variables

| Variable | Required | What it is |
| --- | --- | --- |
| `AB_OAUTH_KAKAO_CLIENT_ID` | for Kakao | Kakao **REST API key** (not the JavaScript key) |
| `AB_OAUTH_KAKAO_CLIENT_SECRET` | for Kakao | Kakao Client Secret (must be switched to "사용함") |
| `AB_OAUTH_NAVER_CLIENT_ID` | for Naver | Naver application Client ID |
| `AB_OAUTH_NAVER_CLIENT_SECRET` | for Naver | Naver application Client Secret |
| `AB_OAUTH_GOOGLE_CLIENT_ID` | for Google | Google OAuth 2.0 Web client ID (`...apps.googleusercontent.com`) |
| `AB_OAUTH_GOOGLE_CLIENT_SECRET` | for Google | Google OAuth 2.0 client secret |
| `AB_OAUTH_STATE_SECRET` | strongly recommended | HMAC key for the CSRF `state` value, e.g. `openssl rand -hex 32` |
| `AB_PUBLIC_ORIGIN` | recommended | Public origin used to build the redirect URI |

A provider counts as configured only when **both** its id and its secret are
present and non-empty (`isOAuthConfigured`). A provider with only one of the two
is treated exactly like an unconfigured one: the button stays behind the
"이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요." copy, and
`exchangeOAuthCode` returns `{ ok: false, error: "oauth-unconfigured" }` without
making any network call.

`AB_OAUTH_STATE_SECRET` is optional only in the sense that the process falls
back to a random per-process key. With that fallback, every restart invalidates
in-flight logins, and two instances behind a load balancer will reject each
other's `state`. Set it, and keep it out of logs and version control.

Secrets are read from the environment at call time and are never written to a
response body, an error, or a log line.

## 3. Kakao — https://developers.kakao.com

1. **내 애플리케이션 → 애플리케이션 추가하기**: create the app (app name, company
   name, Korean-market business info as the console asks).
2. **앱 설정 → 앱 키**: copy the **REST API 키** → `AB_OAUTH_KAKAO_CLIENT_ID`.
   Do not use the JavaScript key or the Admin key.
3. **제품 설정 → 카카오 로그인**: set 활성화 설정 to ON.
4. **제품 설정 → 카카오 로그인 → Redirect URI**: register the Kakao URI from the
   table above (one line per origin you serve).
5. **제품 설정 → 카카오 로그인 → 보안**: press Client Secret 생성 (or 코드 재생성),
   copy the value into `AB_OAUTH_KAKAO_CLIENT_SECRET`, and set 활성화 상태 to
   **사용함**. If the secret is generated but left 사용 안 함, Kakao ignores it and
   the flow is weaker than the code assumes; if it is 사용함 and the env var is
   missing, the token call fails.
6. **제품 설정 → 카카오 로그인 → 동의항목**: enable **카카오계정(이메일)**. Optional
   consent (선택 동의) is fine — the user may decline, in which case Kakao
   returns no email and the app falls through to the existing 이메일 연결
   (email-bind) screen. Required consent (필수 동의) needs Kakao's business
   verification for most apps.
7. **앱 설정 → 플랫폼 → Web**: add the site domain (`https://loveme.example`).

Scopes: the code deliberately sends **no** `scope` parameter for Kakao. Kakao
takes the consent items from the console, and sending a scope that is not
enabled there fails the authorize call (KOE205). If you later want to force a
re-consent for email, add `scope=account_email` at the authorize step only after
the consent item is enabled.

Email note: `kakao_account.email` is used only when Kakao does not flag it as
invalid or unverified. Even then, `auth.completeOAuth` never merges accounts on
a Kakao-supplied email — this is intentional, so a Kakao account cannot take
over an existing email account.

## 4. Naver — https://developers.naver.com

1. **Application → 애플리케이션 등록**: name the app (the name is shown on the
   consent screen).
2. **사용 API**: choose **네이버 아이디로 로그인**.
3. **제공 정보 선택**: tick **이메일 주소**. Naver marks it as optional for the
   user, so treat a missing email as normal; the app falls back to the
   email-bind screen. Add 회원이름/별명 only if you actually need them.
4. **로그인 오픈 API 서비스 환경**: add **PC 웹** with
   - 서비스 URL: `https://loveme.example`
   - 네이버 로그인 Callback URL: the Naver URI from the table above.
   Add a second environment (or a second callback line) for localhost while
   testing.
5. **Application → 내 애플리케이션 → 개요**: copy Client ID →
   `AB_OAUTH_NAVER_CLIENT_ID`, Client Secret → `AB_OAUTH_NAVER_CLIENT_SECRET`.
6. Naver reviews nothing up front for basic profile/email, but the app has a
   daily quota; check **애플리케이션 → 통계** after launch.

Scopes: Naver has no scope parameter for the login product — the fields come
from 제공 정보 선택. The token request forwards the `state` value, which Naver
expects.

Naver's profile response is `{ resultcode, message, response: { id, email } }`;
anything other than `resultcode === "00"` is treated as a failed login.

## 5. Google — https://console.cloud.google.com

1. Create (or select) a project.
2. **APIs & Services → OAuth consent screen**: User Type **External**, fill app
   name, support email, developer contact. While the app is in **Testing**, only
   accounts listed under **Test users** can log in — publish the app before
   real users arrive.
3. **Scopes**: add `openid`, `.../auth/userinfo.email`,
   `.../auth/userinfo.profile`. These are non-sensitive and need no Google
   verification review.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   Application type **Web application**.
   - Authorized JavaScript origins: `https://loveme.example`
   - Authorized redirect URIs: the Google URI from the table above.
5. Copy the client ID → `AB_OAUTH_GOOGLE_CLIENT_ID` and the client secret →
   `AB_OAUTH_GOOGLE_CLIENT_SECRET`.

Scopes sent by the code: `openid email profile`.

Email note: Google's `email` is used only when `email_verified` is true. An
unverified Google email is treated as **no email**, so the user lands on the
email-bind screen instead of silently claiming an address they do not own.

## 6. What the owner still has to wire

`server/oauth.mjs` is a library. The callback route in `server/app.mjs` is what
turns it into a login:

- `POST /api/auth/oauth/start` must attach `state: createOAuthState({ provider, env })`
  to the authorize URL.
- `GET /api/auth/oauth/:provider/callback` must call `verifyOAuthState` first,
  then `exchangeOAuthCode`, then `auth.completeOAuth`, then set the `ab_session`
  cookie the same way `/api/auth/consume` does.

Until that route exists, configuring the consoles changes nothing user-visible.

## 7. Rollout checklist

1. Set the env vars for **one** provider first (Google is the fastest to
   register) and restart the server.
2. `GET /api/auth/session` should still work; the social button for that
   provider should stop showing the "준비 중" copy.
3. Run the real login end to end on the deployed origin. The failure modes to
   expect, in order of likelihood: redirect URI mismatch (provider-side error
   page before the app is reached), missing/disabled client secret
   (`token-exchange-failed`), consent item not enabled (login succeeds with an
   empty email — correct behaviour, the user is asked to connect an email).
4. Only then repeat for the next provider.
