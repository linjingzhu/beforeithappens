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

- The shape is not configurable: `oauthRedirectUri` in `server/oauth.mjs` builds
  `<origin>/api/auth/oauth/<provider>/callback`, and the route that answers it in
  `server/app.mjs` matches exactly that path. Register that string, nothing else.
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
6. **제품 설정 → 카카오 로그인 → 동의항목 → 카카오계정(이메일)**: set it to
   **선택 동의** if the console lets you, and write the purpose text the console
   asks for. This is the item that decides whether the friend ever sees the
   이메일 연결 screen. See "Kakao 이메일 동의항목: what is certain and what is
   not" below before you count on it.
7. **앱 설정 → 플랫폼 → Web**: add the site domain (`https://loveme.example`).
   Kakao refuses the authorize call if the Redirect URI's origin has no matching
   Web platform entry.

Scopes: the code deliberately sends **no** `scope` parameter for Kakao. Kakao
takes the consent items from the console, and sending a scope that is not
enabled there fails the authorize call (KOE205). If you later want to force a
re-consent for email, add `scope=account_email` at the authorize step only after
the consent item is enabled.

### How a Kakao email is trusted

Two different bars, on purpose:

- `readKakaoProfile` (`server/oauth.mjs`) returns the address whenever Kakao does
  not flag it `is_email_valid: false` / `is_email_verified: false`.
- It marks that address **verified** only when Kakao affirms *both* flags as
  `true`. A missing flag is not an affirmation.

Only a verified address is turned into a single-use claim
(`attestProviderEmail` in `server/auth.mjs`) that `completeOAuth` may spend to
write the address onto the account. The claim is bound to the exact
`(provider, providerUserId, email)` triple, expires in a minute, and can only be
minted by `exchangeOAuthCode` — the one function that holds the client secret
and has actually talked to Kakao. So:

- Kakao login **with** a verified email → `needsEmail: false`, the friend can
  accept an email-bound invite immediately, and no login mail has to be sent.
- Kakao login **without** one (declined consent, unverified account, consent
  item not enabled) → `email: ""`, `needsEmail: true`, the 이메일 연결 gate.
- A caller that did not perform a token exchange — including the dev routes
  `POST /api/dev/oauth/complete` and `?dev=1` on the callback — can pass any
  address it likes and it is still ignored. `test/kakao-verified-email.test.js`
  and `test/social-login.test.js` pin that.

### Kakao 이메일 동의항목: what is certain and what is not

**Certain (from this repo's code):** the app never asks for `scope=account_email`
at the authorize step, so whatever the console grants is what arrives; and an
absent email is a supported outcome, not an error.

**Not verified by anyone here — check it in your own console:** Kakao gates
personal-information consent items (이메일, 전화번호, 생년월일 …) behind app
status. The rules have changed more than once, and this repo's authors have no
Kakao console access. Before launch, confirm in
**제품 설정 → 카카오 로그인 → 동의항목**:

1. Is **카카오계정(이메일)** selectable at all for your app, or does the row say
   the app must first become a **비즈 앱** (business app, which needs a
   비즈니스 채널 and business-registration verification)?
2. If it is selectable, which levels are offered — 선택 동의 only, or 필수 동의
   too? Take 선택 동의; 필수 동의 is the level most likely to demand 비즈 앱.
3. Does saving the item put the app into a review/검수 queue, and if so how long?

Do not assume the answer from this document. If the item is blocked, nothing in
the code breaks — the friend simply lands on the 이메일 연결 screen, which is
useless without working mail. Use the pair-code path in §7 instead.

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

Email note: the Naver login profile carries no verification flag, so the address
is never treated as verified — a Naver login always goes through the 이메일 연결
gate (or the pair code in §7). Do not widen this without a real signal from
Naver's API.

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

Email note: Google's `email` is used only when `email_verified === true`. An
unverified Google email is treated as **no email**, so the user lands on the
email-bind screen instead of silently claiming an address they do not own. A
verified one also mints the same single-use claim described under Kakao.

## 6. What is already wired

The route in `server/app.mjs` is in place, so configuring a console is the only
missing step:

- `POST /api/auth/oauth/start` → `createOAuthState` + `oauthAuthorizeUrl`.
- `GET /api/auth/oauth/:provider/callback` → `verifyOAuthState`, then
  `exchangeOAuthCode`, then `auth.completeOAuth`, then the `ab_session` cookie.

## 7. Fallback when Kakao email is not available: the pair code

If the 이메일 동의항목 is blocked, or the friend declines it, the friend still
logs in with Kakao — they just have no email, and with no working outbound mail
the 이메일 연결 screen is a dead end. The pair code goes around it:

1. The owner (who does have an email) calls `GET /api/pair-code`
   (`couple.ensurePairCode`) and reads back a code plus its display form.
2. The friend logs in with Kakao — an account with `email: ""` is fine — and
   posts the code to `POST /api/pair-code/connect`
   (`couple.connectByPairCode` in `server/workspace.mjs`).
3. Neither call looks at the user's email. `connectByPairCode` needs only a
   session and a code that matches an active workspace, and it joins the friend
   as `partner`. `test/kakao-verified-email.test.js` proves the whole join for a
   Kakao account with no email.

Server-side this path is complete today. The screens that show and enter the
code are owned elsewhere; this document only claims the API works.

## 8. Rollout checklist


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
