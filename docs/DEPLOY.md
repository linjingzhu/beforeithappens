# LoveMe host deployment (API server)

Operator page for the Node server in `server/` started by `scripts/server.mjs` (`npm start`).
Live preview origin used by the app build (`mobile/eas.json`): `https://loveme-api.onrender.com`.

Zero runtime dependencies: the server is Node built-ins only. Do not add packages to run it.

**Running this round for the first time? Start at §0** — it is the ordered checklist. §1–§5 are the reference behind it. Install paths live in `docs/IOS_INSTALL.md` (iPhone, the critical path) and `docs/ANDROID_INSTALL.md` (Android, the fallback).

## 0. Owner runbook — get one friend installed and submitting

Ordered by what blocks what. Steps 1 and 2 are independent of each other and of the app build, so
**start step 1 today**: it is the only step whose duration is not under your control.

Login for this round is **Kakao**. That lowers the priority of mail, but does not remove it —
see step 4.

### Step 1 — Start Apple Developer enrollment (do this first)

The friend's phone is an iPhone. Nothing installs on it without a paid Apple Developer membership,
and enrollment approval is the long pole: commonly a day, allowed by Apple to take up to 48 hours,
longer if Apple asks for extra identity verification. Choose **Individual** enrollment; the
Organization form additionally needs a D-U-N-S number and takes far longer.

Full step-by-step, including the ad hoc vs TestFlight decision: `docs/IOS_INSTALL.md`.

**Success check:** <https://developer.apple.com/account> shows an active membership and a Team ID.

### Step 2 — Bring the host up with the right variables

Set these on the host (Render dashboard → Environment). Names only — never commit a value, and
never paste one into this repository.

| Variable | Why it is on this list |
| --- | --- |
| `NODE_ENV=production` | Turns off the dev outbox and the dev OAuth stub (§3). |
| `AB_PUBLIC_ORIGIN` | The public origin of this host. Also builds the OAuth redirect URI (step 3) and the mailed links. |
| `AB_STORE_PATH` | Point at a mounted persistent disk, or every account, session and answer is lost on the next redeploy. |
| `AB_OAUTH_KAKAO_CLIENT_ID` | Kakao login. Both Kakao variables must be set or the provider answers `oauth-unconfigured` (501). |
| `AB_OAUTH_KAKAO_CLIENT_SECRET` | Same pairing rule. |
| `AB_OAUTH_STATE_SECRET` | A long random string. Unset, each process picks its own, so a restart or a second instance invalidates in-flight logins — which looks exactly like "Kakao login is broken". |
| `RESEND_API_KEY` | Mail. Lower priority this round (step 4), still needed for the fallbacks. |
| `MAIL_FROM` | An address at a **verified** domain (step 4). |
| `AB_DEV_OUTBOX` | **Must be unset.** |
| `AB_DEV_OAUTH` | **Must be unset.** |

Full table with defaults and readers: §1.

**Success check:**

- `GET /healthz` answers with `service: "ab"`.
- `GET /api/dev/outbox` answers `404`. If it answers `200`, the host is exposing live login
  tokens — fix that before anything else (§3).
- On a free Render instance the first request after idle can take 20–40 seconds (cold start).
  A slow first `/healthz` is not a down server.

**Not verified from this repository:** the agent that wrote this document had all outbound HTTPS
denied by egress policy, so `https://loveme-api.onrender.com/healthz` could not be called. The
deployment's live state is unknown here — run the check yourself and trust that, not this file.

### Step 3 — Register the Kakao redirect URI

Server-side Kakao login is owned by another pack; this section covers only what the **host** needs.

The redirect URI the server sends to Kakao is derived from the origin:

```
<AB_PUBLIC_ORIGIN>/api/auth/oauth/kakao/callback
```

That exact string must be registered as a Redirect URI in the Kakao Developers console for the
same app the client id belongs to. A mismatch (http vs https, trailing slash, a stale origin) makes
Kakao refuse before the server is ever reached, and the failure looks like a login bug.

**Success check:** `POST /api/auth/oauth/start` with `provider: "kakao"` returns an authorize URL
instead of `501 oauth-unconfigured`, and following it in a browser reaches Kakao's consent screen
rather than a Kakao redirect-URI error.

**확인 필요:** whether the Kakao app is approved for the account-email consent item. The server
only accepts a Kakao email when Kakao affirms both `is_email_valid` and `is_email_verified`
(`server/oauth.mjs`). If Kakao hands over no affirmed email, the account has no email, and the
invite gate — the accepting user's email must equal the invite email — pushes the friend into
`POST /api/auth/email-bind`, **which sends mail**. That is the case where step 4 becomes blocking
again.

### Step 4 — Resend domain verification (lower priority now, still not optional)

With Kakao as the login method, mail is no longer on the first-login path, so this no longer has to
be finished before the friend can sign in. It is still required for:

- the magic-link login fallback, if Kakao login fails or the friend prefers email;
- **email-bind**, which is mandatory before invite accept when the Kakao account carries no
  affirmed email (step 3);
- any future mail at all.

The hard fact that makes this non-optional in the general case: the default sender
`LoveMe <onboarding@resend.dev>` is Resend's shared testing sender. Resend accepts it **only when
the recipient is the address that owns the Resend account**; every other recipient comes back
`403` (`mail-sender-restricted`). **Before a domain is verified, the friend cannot receive a login
or email-bind mail.** Not slowly — not at all.

Procedure and DNS records: §4. Rough time: adding the records takes minutes; DNS propagation is
usually minutes, but can run to hours depending on the record's TTL and the provider. Verification
in Resend is instant once the records resolve.

**Success check:** the domain reads **Verified** in Resend, `MAIL_FROM` on the host is an address
at that domain, and a login link sent to an address that is *not* the Resend account owner arrives
and shows as delivered in Resend's Emails log.

### Step 5 — Build and install

**iPhone (critical path, after step 1 clears)** — full detail and the ad hoc vs TestFlight
comparison in `docs/IOS_INSTALL.md`:

```bash
cd mobile
npm ci
npx eas-cli@latest login
npx eas-cli@latest credentials --platform ios     # let EAS create cert + ad hoc profile
npx eas-cli@latest device:create                  # friend opens the link in Safari on the iPhone
npx eas-cli@latest build --platform ios --profile preview
```

The device must be registered **before** the build; a device added afterwards needs a new build.
No Mac is required — EAS builds in the cloud.

**Android (fallback / second device)** — `docs/ANDROID_INSTALL.md`:

```bash
cd mobile
npx eas-cli@latest build --platform android --profile preview
```

No Apple account, no device registration, no Play Console. Produces an installable APK because
`mobile/eas.json`'s `preview` profile sets `android.buildType: "apk"`.

Both platforms read `EXPO_PUBLIC_API_ORIGIN` from the profile-level `env` of `preview` in
`mobile/eas.json`. It is inlined into the bundle **at build time**: if the host origin changes, the
already-installed app does not follow — it needs a new build.

**Success check:** the EAS build page reaches `finished` and shows an install link. That URL exists
only after the build succeeds; do not write it down in advance and do not put it in this repo.

### Step 6 — End-to-end run

1. Owner signs in with Kakao and sees the wedding pack.
2. Owner creates the invite (`POST /api/invite` returns a share URL — invites never go through
   Resend, so a mail misconfiguration cannot block this).
3. Friend installs the app (step 5) and opens the invite link.
4. Friend signs in with Kakao. If the account has no affirmed email, the friend completes
   email-bind — this is the point that needs step 4 to be finished.
5. Friend accepts the invite and lands in the owner's workspace.
6. Both answer and submit; the reveal opens only after both have submitted.

If any step fails, the diagnosis tables in §2 and §5 name the exact cause by `reason` code.

## 1. Environment variables the server reads

Every variable below is read by repository code. Nothing else is read; anything not listed has no effect.

| Variable | Read by | Default | What it does |
| --- | --- | --- | --- |
| `PORT` | `scripts/server.mjs` | `4173` | TCP port. Render/Fly/Heroku set this for you — do not hard-code it. |
| `AB_STORE_PATH` | `scripts/server.mjs` | `<repo>/data/ab-store.json` | JSON store file. On a host with an ephemeral disk, point this at a mounted persistent disk or every session, login and answer is lost on redeploy. |
| `AB_PUBLIC_ORIGIN` | `server/http.mjs` (`requestOrigin`) | request `Host` + `x-forwarded-proto` | Forces the public origin used to build links. Also read by the mail layer as a production signal (see §3). |
| `NODE_ENV` | `scripts/server.mjs`, `server/mail.mjs` | unset | `production` disables the dev outbox and the dev OAuth stub, and makes the mail layer refuse the outbox. **Set it to `production` on the host.** |
| `RESEND_API_KEY` | `server/mail.mjs` | unset | **Required for real login mail.** Resend API key. Without it, login mail fails closed (502). Never commit it. |
| `MAIL_FROM` | `server/mail.mjs` | `LoveMe <onboarding@resend.dev>` | Sender of the login mail. **Required in practice** — the default is Resend's testing sender and only reaches the Resend account owner (§4). |
| `AB_WEB_CONSUME_FALLBACK` | `server/mail.mjs` | unset (= on) | The mailed link is an `https` hop on this host's own origin: a phone is offered the `loveme://` app, everything else goes straight to the web. Set it to `0` to mail the app scheme instead — a link no browser can open, so only for a deployment whose readers all have the app. |
| `AB_DEV_OUTBOX` | `scripts/server.mjs` | unset | `1` (and `NODE_ENV !== production`) exposes `GET /api/dev/outbox` and lets login "succeed" with no mail sent. **Must be unset in production** (§3). |
| `AB_DEV_OAUTH` | `scripts/server.mjs` | unset | `1` (and `NODE_ENV !== production`) opens `POST /api/dev/oauth/complete`, which mints a session for any provider id with no provider check. Test-only. Must be unset in production. |
| `AB_OAUTH_KAKAO_CLIENT_ID` / `AB_OAUTH_KAKAO_CLIENT_SECRET` | `server/oauth.mjs` | unset | Kakao social login. Both must be set or the provider reports `oauth-unconfigured` (501). |
| `AB_OAUTH_NAVER_CLIENT_ID` / `AB_OAUTH_NAVER_CLIENT_SECRET` | `server/oauth.mjs` | unset | Naver social login. Same pairing rule. |
| `AB_OAUTH_GOOGLE_CLIENT_ID` / `AB_OAUTH_GOOGLE_CLIENT_SECRET` | `server/oauth.mjs` | unset | Google social login. Same pairing rule. |
| `AB_OAUTH_STATE_SECRET` | `server/oauth.mjs` | random per process | HMAC key for the OAuth `state` value. Unset, each process picks its own random secret, so a restart or a second instance invalidates in-flight logins. Set a long random string if social login is on. |

Platform-set markers the mail layer only *reads as a signal* (it never writes them):
`RENDER`, `RENDER_SERVICE_ID`, `RENDER_EXTERNAL_URL`, `FLY_APP_NAME`, `DYNO`, `K_SERVICE`, `VERCEL`, `RAILWAY_ENVIRONMENT`, `AWS_EXECUTION_ENV`.

Client-side (build-time, not read by this server): `EXPO_PUBLIC_API_ORIGIN` in `mobile/eas.json` must point at this host, or the app talks to nothing.

### Minimum production set

```
NODE_ENV=production
RESEND_API_KEY=...                     # from the Resend dashboard, host only
MAIL_FROM=LoveMe <login@yourdomain>    # a verified domain, not resend.dev
AB_PUBLIC_ORIGIN=https://loveme-api.onrender.com
AB_STORE_PATH=/var/data/ab-store.json  # persistent disk mount
# Kakao login (this round's login method) — values from the Kakao Developers console:
AB_OAUTH_KAKAO_CLIENT_ID=...
AB_OAUTH_KAKAO_CLIENT_SECRET=...
AB_OAUTH_STATE_SECRET=...              # one long random string, stable across restarts
# AB_DEV_OUTBOX and AB_DEV_OAUTH: unset
```

Values above are placeholders. Never commit a real key, secret or token to this repository.

Invites do **not** go through Resend. `POST /api/invite` returns a share URL the buyer sends themselves; no mail provider is involved, so a mail misconfiguration never blocks invites.

## 2. Mail failure codes

Login mail fails closed: a failed send is a `502`, never a fake `ok:true`. The 502 body keeps
`error: "failed"` for the client copy, and carries a `reason` naming the exact misconfiguration.
Codes never contain a key, a login token, or a recipient address.

| `reason` | Cause | Fix |
| --- | --- | --- |
| `mail-not-configured` | No `RESEND_API_KEY` on the host (and no dev outbox). | Set `RESEND_API_KEY`. |
| `mail-outbox-refused` | `AB_DEV_OUTBOX=1` on a host that looks like production, with no key. | Unset `AB_DEV_OUTBOX` and set `RESEND_API_KEY`. |
| `mail-key-rejected` | Resend `401` — key is wrong, revoked, or truncated. | Re-copy the key from the Resend dashboard. |
| `mail-sender-restricted` | Resend `403` — the testing sender only mails the account owner, or the `MAIL_FROM` domain is not verified. | Verify a domain and set `MAIL_FROM` to it (§4). |
| `mail-sender-rejected` | Resend `422` — malformed `from`/`to`. | Fix `MAIL_FROM` formatting: `Name <user@domain>`. |
| `mail-rate-limited` | Resend `429`. | Wait, or raise the plan limit. |
| `mail-provider-unavailable` | Resend `5xx`. | Retry; check Resend status. |
| `mail-provider-error` | Any other non-2xx. | Check the Resend dashboard logs for the send. |
| `mail-unreachable` | The HTTP request to Resend threw (DNS, egress block, timeout). | Check host egress to `api.resend.com`. |

## 3. `AB_DEV_OUTBOX` must be unset in production

With `AB_DEV_OUTBOX=1` and `NODE_ENV` not `production`, the server used to answer login with
`ok:true` while sending nothing, and `GET /api/dev/outbox` returned the last 20 login links —
every one of them a live, single-use session token for whichever address asked. On a public host
that is both a lie to the user and an account-takeover endpoint.

Two guards now stand between a forgotten variable and that outcome:

- The delivery result carries `delivered` and `via`. `delivered: true` happens only for
  `via: "resend"`; the outbox answers `{ ok: true, delivered: false, via: "outbox" }`, so no
  caller can print "we sent the mail" off a truthy `ok`.
- **The outbox path refuses outright when the host looks like production.** `looksLikeProductionHost`
  is true when `NODE_ENV=production`, when any platform marker above is set (Render sets `RENDER`),
  or when `AB_PUBLIC_ORIGIN` names a non-local host. In that case a missing key returns
  `mail-outbox-refused` instead of a fake success.

The refusal is deliberate: `scripts/server.mjs` already gates the outbox on `NODE_ENV`, but the
whole failure mode being defended against is a host where `NODE_ENV` was never set. A guard that
depends on the variable someone forgot is not a guard. Local development is untouched — no
platform marker, no `AB_PUBLIC_ORIGIN`, so the outbox still works on `localhost`.

Still unset `AB_DEV_OUTBOX` in production. The guard removes the silent failure, not the need.

## 4. Escaping the Resend testing-sender restriction

The default `LoveMe <onboarding@resend.dev>` is Resend's shared testing sender. Resend accepts it
only when the recipient is the address that owns the Resend account; every other recipient comes
back `403` (`mail-sender-restricted`). Every real user is "every other recipient", so login mail is
broken for everyone but you until a domain is verified.

Do **not** "fix" this by editing `MAIL_FROM`'s default in the repository. The escape is host-side:

1. Resend dashboard → **Domains** → **Add Domain**. Enter the domain you own (e.g. `loveme.kr`);
   a subdomain such as `mail.loveme.kr` is fine and keeps the apex free for other mail.
2. Resend shows DNS records — a `MX` and `TXT` pair for the sending subdomain (SPF), a `TXT`
   DKIM record (`resend._domainkey...`), and an optional DMARC `TXT`. Add all of them verbatim at
   your DNS provider. Do not alter host names or values.
3. Back in Resend, press **Verify**. Propagation is usually minutes; the domain must read
   **Verified** before any send from it will pass.
4. Resend dashboard → **API Keys** → create a key with **Sending access**. Copy it once.
5. On the host, set `RESEND_API_KEY` to that key and `MAIL_FROM` to an address at the verified
   domain, in the form `LoveMe <login@mail.loveme.kr>`. Restart the service.
6. Send yourself a login link from the app and confirm the mail arrives, and that the Resend
   dashboard's **Emails** log shows the send as delivered.

Until step 5 is done on the host, keep the default sender and expect `mail-sender-restricted` for
anyone who is not the account owner. That is the correct, honest failure.

## 5. "Login mail is not arriving" checklist

Work top to bottom. `POST /api/auth/magic-link` with a real address and read the status plus the
`reason` in the body.

| Symptom | Cause | Fix |
| --- | --- | --- |
| `502` + `reason: mail-not-configured` | No `RESEND_API_KEY` on the host. | Set it (§4 step 4–5) and restart. |
| `502` + `reason: mail-outbox-refused` | `AB_DEV_OUTBOX=1` on a live host with no key. | Unset `AB_DEV_OUTBOX`, set `RESEND_API_KEY`. |
| `502` + `reason: mail-key-rejected` | Key wrong, revoked, or pasted with whitespace/truncation. | Re-create the key in Resend, re-set it, restart. |
| `502` + `reason: mail-sender-restricted` | Still on `onboarding@resend.dev`, or `MAIL_FROM`'s domain is unverified. | Verify the domain and set `MAIL_FROM` (§4). |
| `502` + `reason: mail-sender-rejected` | `MAIL_FROM` is not a valid `Name <addr>`. | Fix the format. |
| `502` + `reason: mail-unreachable` | Host cannot reach `api.resend.com`. | Check egress/firewall; retry. |
| `200` but nothing arrives, and the response says `via: "outbox"` | The dev outbox answered — nothing was mailed. | This should be impossible in production; if you see it, `NODE_ENV`, the platform marker and `AB_PUBLIC_ORIGIN` are all absent. Set `NODE_ENV=production` and `AB_PUBLIC_ORIGIN`, unset `AB_DEV_OUTBOX`, set a key. |
| `200`, Resend log shows **delivered**, user sees nothing | Recipient spam filter, or a wrong address. | Check spam; check SPF/DKIM/DMARC are the records Resend printed. |
| App shows `로그인 링크를 보내지 못했어요.` but the host log shows a 200 | Client timed out before the host answered — typically a free-plan cold start of 20–40s. | `AUTH_FETCH_MS` must stay in the **45–60s** band (currently 55s) for magic-link and email-bind. Do not lower it, and do not change `MAIL_FROM` to chase this. |
| Mail arrives, the link opens a web page instead of the app | Expected: the web is the product, and the hop only hands off to the app on a phone. | Nothing to fix. A deployment that wants the app-scheme link sets `AB_WEB_CONSUME_FALLBACK=0`. |
| `400` + `error: invalid-email` | The address was rejected before any send. | Not a mail problem. |
| Invite mail "missing" | Invites never use Resend. `POST /api/invite` returns a share URL the buyer sends themselves. | Use the returned URL; do not wire invites to a mail provider. |

`GET /api/dev/outbox` returning `404` is correct on a production host. If it returns `200`, the
host is leaking live login tokens — unset `AB_DEV_OUTBOX`, set `NODE_ENV=production`, redeploy, and
treat any token the endpoint exposed as compromised.
