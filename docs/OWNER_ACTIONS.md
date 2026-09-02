# Owner actions — one ledger, past to future

Everything that needs a person rather than a commit, in the order it stops being optional.
What is being built now, and what waits: `docs/MILESTONES.md`.

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

## Surface and milestone

Rows are marked so the ledger can be sliced without re-deriving it: **앱** (the couple app and its
API), **웹** (the public question site), **공통** (serves both).

They also carry a milestone, from `docs/MILESTONES.md`: **M1** web only, with ads; **M2** server
storage and login; **M3** the app. The three run in parallel, so a later milestone's row is not
postponed — but the *release* order stays M1 → M2 → M3, and a row that only matters at release
(a store submission, a price) can wait while one that has a long queue (a developer enrolment)
should not.

### The smallest live web service — reached

**`https://lovemedialogue.com` serves 결혼 100제 over ten Parts.** The result sheet works: it is
computed in the reader's browser from answers that never leave it. Everything below is what turns a
live site into a monetised one, or a second pack into a reason to come back.

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

| # | 면 · M | What | Status | Why it is first | Where |
|---|---|---|---|---|---|
| N1 | 앱 · M3 | **Confirm the deployment is current** | ❓ 🟢 | The app calls `/api/referral` and `/api/gift/*`. If the host still runs old code those screens 404. This agent cannot reach the host (proxy blocks all outbound HTTPS) | `curl .../api/referral` → **401 = new code**, **404 = old** |
| N2 | 앱 · M2 | **Host environment variables** | 🟢 | `NODE_ENV=production` also closes the dev OAuth routes; without `AB_STORE_PATH` on a persistent disk every account is lost on redeploy | `docs/DEPLOY.md` §0 |
| N3 | 앱 · M3 | **Kakao developer app** | 🟢 | Registration is immediate. Redirect URI must match exactly or it fails before reaching the server | `docs/SOCIAL_LOGIN.md` §3 |
| N4 | 앱 · M3 | **Apple Developer: enrol as Individual** | 🟢 | The only wait nobody controls. Organization needs a D-U-N-S number and takes days to weeks | `docs/IOS_INSTALL.md` |
| N5 | 웹 · **M1** | **Business details for the privacy policy** | 🔴 | **처리방침 페이지는 만들어져 있고, 두 값만 채우면 나타납니다** — `SITE.operator`의 `owner`(대표자, 개인정보 보호책임자를 겸함)와 `address`(주소). 채우는 즉시 `/privacy/`가 빌드되고 푸터·사이트맵에 붙습니다. `registration`(사업자등록번호)과 `mailOrder`(통신판매업 신고번호)는 있으면 표시되고 없으면 생략됩니다. 채운 뒤에는 **폰트를 다시 만들어야 합니다**(`python3 scripts/build-brand-assets.py`) — 이름과 주소의 글자는 미리 서브셋에 넣어 둘 수 없습니다. **AdSense가 여기서 막혀 있습니다** | `site/config.js`, `site/pages.js` |
| N5a | 웹 · M1 | **A contact address** | ✅ | `loveme@afterscent.kr`, given 2026-09-01. The 문의 page, its footer link and its sitemap entry now build from it | `site/config.js` |
| N5b | 웹 · **M1** | **AdSense publisher id and ad unit id** | 🔴 | `SITE.adsenseClient` (`ca-pub-…`) and `SITE.adsenseSlot`. Set both and the script, the unit and `ads.txt` all appear; empty, the site builds exactly as it does now. Google reviews the site first, and the review needs N5 | `site/config.js` |
| N6 | 공통 · M2 | **Resend domain verification** | 🟢 | Until then `onboarding@resend.dev` reaches only the Resend account owner. Needed for login mail and later for the result sheet | `docs/DEPLOY.md` §4 |
| N7 | 웹 · M1 | **Write `혼자만의 연애` 100문항** | 🔄 | The long pole, and it is writing, not code. ~31,000자. Everything in step 7 below waits on it | `docs/WEB_SERVICE_STRATEGY.md` |

---

## Next — waiting on something above

| # | 면 | What | Status | Waits on | Note |
|---|---|---|---|---|---|
| X1 | 앱 | **One preview build on a real device** | ⏳ | N2, N3 | Confirms the `EXPO_PUBLIC` substitution fix and every native screen. Nothing native has run on a phone yet |
| X2 | 앱 | Friend's UDID, then `eas device:create` | ⏳ | N4 | **Register the device before building.** A device added later is not in the built profile and needs a rebuild |
| X3 | 앱 | The two-person round on real phones | ⏳ | X1, X2 | The round this whole effort was aimed at |
| X4 | 공통 | Consent step + age gate + published policy | ⏳ | N5 | Store-blocking, and required before the site accepts a single email address |
| X5 | 웹 | Site domain and hosting | ✅ | — | `lovemedialogue.com`, GitHub Pages. Build emits CNAME; deploy workflow on `stable` |
| X5a | 웹 | ~~Point DNS at GitHub Pages~~ | ✅ | X5 | Done at 후이즈. The apex answers the four GitHub addresses; `www` is a CNAME. `docs/DNS_SETUP.md` keeps the records and the failure modes |
| X5b | 웹 | ~~Turn Pages on~~ | ✅ | X5 | Done by the owner. The deploy then ran clean end to end: build, CNAME check, configure, upload, deploy |
| X5d | 웹 | ~~Register the custom domain in Settings~~ | ✅ | X5a | Not automatic under Actions deployment, which is what the 404 was |
| X5c | 웹 | ~~Enforce HTTPS~~ | ✅ | X5d | **`https://lovemedialogue.com` is live.** The canonicals the build writes are now true |
| X5e | 웹 | **Google Search Console: verify the property, submit the sitemap** | 🟢 | X5c | Nothing indexes a site it has not found. The build already emits `/sitemap.xml` and a `robots.txt` that points at it. Verification is a DNS TXT record or an HTML tag — the TXT goes in the same 후이즈 screen as the A records |
| X6 | 웹 | Result sheet delivery by email | ⏳ | N6, X4 | Show on screen first, delivery opt-in, neutral subject line by default |
| X7 | 웹 | AdSense application | ⏳ | N5 | The site is live over HTTPS and carries a 소개 page. **What is left is a published privacy policy** — the business details in N5, then the page. Note the page count: ten Parts is on the low side for review, and publishing a second pack is one entry in `site/config.js`. In-page units only, never on the page turn |
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
