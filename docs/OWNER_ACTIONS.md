# Owner actions — one ledger, past to future

Everything that needs a person rather than a commit, in the order it stops being optional.

Kept here rather than only in chat because it accumulates: this list is the residue of every run,
and a chat table scrolls away. **Update the status column whenever one moves**, and say so in the
run's report.

## Status

| | |
|---|---|
| ✅ | done |
| 🟢 | can be done now — nothing is blocking it |
| ⏳ | waiting on something above it |
| ❓ | unknown here — this agent could not verify it and will not guess |
| 🔄 | in progress, owner-side |
| 🤔 | a decision, not a task |

---

## Surface

Rows are marked so the ledger can be sliced without re-deriving it: **앱** (the couple app and its
API), **웹** (the public question site), **공통** (serves both).

### The smallest live web service

Worth stating separately because it is much smaller than the full list looks. The site is live and
useful with **N7 + X5 only** — the hundred questions, and somewhere to put them. The result sheet
already works: it is computed in the reader's browser from answers that never leave it.

Everything else on the 웹 rows is enhancement on top of a working site:

- A privacy policy is not what gates *launch* — a site that collects nothing has little to declare.
  It gates **ads** (AdSense requires one) and **delivery** (X6, the moment an address is taken).
- Email and KakaoTalk delivery are additions to a sheet that already renders.

So the order is: write, publish, then decide whether to monetise — not the other way round.

---

## Past — settled

| # | 면 | What | Status | Note |
|---|---|---|---|---|
| P1 | 앱 | Apple Developer account | ✅ | Owner confirmed |
| P2 | 앱 | Expo account | ✅ | Owner confirmed |
| P3 | 앱 | Login method for the friend | ✅ | Kakao chosen over magic-link mail |
| P4 | 앱 | Friend's phone | ✅ | iPhone — so ad hoc, not Android sideload |
| P5 | 웹 | Web service: reflect or judge | ✅ 🤔 | **Reflect.** Built that way; `docs/WEB_SERVICE_STRATEGY.md` carries the reasoning |
| P6 | 공통 | Same repo or separate for the site | ✅ 🤔 | **Same repo, separate deployment** |
| P7 | 웹 | Page shape for the site | ✅ 🤔 | Ten questions per page, ten pages |

---

## Now — nothing is blocking these

| # | 면 | What | Status | Why it is first | Where |
|---|---|---|---|---|---|
| N1 | 앱 | **Confirm the deployment is current** | ❓ 🟢 | The app calls `/api/referral` and `/api/gift/*`. If the host still runs old code those screens 404. This agent cannot reach the host (proxy blocks all outbound HTTPS) | `curl .../api/referral` → **401 = new code**, **404 = old** |
| N2 | 앱 | **Host environment variables** | 🟢 | `NODE_ENV=production` also closes the dev OAuth routes; without `AB_STORE_PATH` on a persistent disk every account is lost on redeploy | `docs/DEPLOY.md` §0 |
| N3 | 앱 | **Kakao developer app** | 🟢 | Registration is immediate. Redirect URI must match exactly or it fails before reaching the server | `docs/SOCIAL_LOGIN.md` §3 |
| N4 | 앱 | **Apple Developer: enrol as Individual** | 🟢 | The only wait nobody controls. Organization needs a D-U-N-S number and takes days to weeks | `docs/IOS_INSTALL.md` |
| N5 | 공통 | **Business details for the privacy policy** | 🟢 | 54 placeholders: 상호, 대표자, 주소, 사업자등록번호, 보호책임자, 문의 이메일 | `docs/PRIVACY.md`, `docs/proposals/privacy-policy-ko.md` |
| N6 | 공통 | **Resend domain verification** | 🟢 | Until then `onboarding@resend.dev` reaches only the Resend account owner. Needed for login mail and later for the result sheet | `docs/DEPLOY.md` §4 |
| N7 | 웹 | **Write `혼자만의 연애` 100문항** | 🔄 | The long pole, and it is writing, not code. ~31,000자. Everything in step 7 below waits on it | `docs/WEB_SERVICE_STRATEGY.md` |

---

## Next — waiting on something above

| # | 면 | What | Status | Waits on | Note |
|---|---|---|---|---|---|
| X1 | 앱 | **One preview build on a real device** | ⏳ | N2, N3 | Confirms the `EXPO_PUBLIC` substitution fix and every native screen. Nothing native has run on a phone yet |
| X2 | 앱 | Friend's UDID, then `eas device:create` | ⏳ | N4 | **Register the device before building.** A device added later is not in the built profile and needs a rebuild |
| X3 | 앱 | The two-person round on real phones | ⏳ | X1, X2 | The round this whole effort was aimed at |
| X4 | 공통 | Consent step + age gate + published policy | ⏳ | N5 | Store-blocking, and required before the site accepts a single email address |
| X5 | 웹 | Site domain and hosting | ✅ | — | `lovemedialogue.com`, GitHub Pages. Build emits CNAME; deploy workflow on `stable` |
| X5a | 웹 | **Point DNS at GitHub Pages** | 🟢 | X5 | **The last step.** The site is deployed and waiting; the apex still answers `118.67.131.217`, the registrar's parking page. Records, verification and the failure modes: `docs/DNS_SETUP.md` |
| X5b | 웹 | ~~Turn Pages on~~ | ✅ | X5 | Done by the owner. The deploy then ran clean end to end: build, CNAME check, configure, upload, deploy |
| X5c | 웹 | **Enforce HTTPS** once the certificate is issued | ⏳ | X5a | The build already writes `https://` canonicals; serving over http would contradict them. Usually tickable within an hour of DNS resolving |
| X6 | 웹 | Result sheet delivery by email | ⏳ | N6, X4 | Show on screen first, delivery opt-in, neutral subject line by default |
| X7 | 웹 | AdSense application | ⏳ | X5c, N5 | Ten pages of a hundred questions now exist. What is still missing is a **published** privacy policy (N5) and a live HTTPS site (X5c). In-page units only, never on the page turn |
| X8 | 웹 | KakaoTalk delivery | ⏳ | X6 | Needs a 비즈니스 채널, a 발신프로필, and per-template review. A lead time, not a task |

---

## Decisions still open

| # | 면 | Decision | Status | What hangs on it |
|---|---|---|---|---|
| D1 | 앱 | **iOS payment**: StoreKit IAP, or keep the paid unlock off iOS | 🤔 | Shapes M4 entirely. `POST /api/purchase` still grants without charging |
| D2 | 앱 | Who may read the audit log, and for how long | 🤔 | No audit HTTP route was built without this |
| D3 | 앱 | Account deletion grace period; may a survivor read the archived record | 🤔 | Deletion is immediate and total today |
| D4 | 앱 | `PackDetailScreen` / `TasteResultScreen` — fix the spec or build the screens | 🤔 | Two locked gates contradict each other |
| D5 | 앱 | Next pack: deepen marriage, or a new one | 🤔 | Shapes M6 |
| D6 | 웹 | Publish the marriage pack on the site? | 🤔 | It is in `site/config.js` `PUBLISHED` today to prove the machine. Removing it is one line |
| D7 | 웹 | How the 100 questions divide across the four movements | 🤔 | Shapes N7 |
| D8 | 웹 | Which help line the result page carries | 🤔 | Safety section. Not invented here on purpose |
| D9 | 웹 | Does the site take accounts, or stay anonymous | 🤔 | Anonymous is simpler and safer; it gives up "이어서 하기" |

---

## What is already built and waiting

Not owner actions — recorded so the ledger reads as a whole.

| Built | Waiting on |
|---|---|
| Kakao sign-in, token exchange, verified-email claim | N3 |
| Recommend + gift, four surfaces | Nothing — merged and live in code |
| Audit log with six event types | D2 for a read path |
| Account deletion, all surfaces | D3 |
| Pack registry, app and site surfaces | Nothing — holds two packs |
| Question site: 결혼 100제, 10 pages | Nothing — built and deployed |
| Pages deploy workflow, CNAME, .nojekyll | Nothing — deployed successfully on 2026-09-01 |
| Result sheet, browser-only, no delivery | X6 |
