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
| N5 | 웹 · M1 | **Business details for the privacy policy** | ✅ | `SITE.operator`가 다 찼습니다 — 상호 `afterscent`, **대표자 `Jeongsu Lim`(2026-09-02에 받음, 개인정보 보호책임자를 겸합니다)**, 주소 `서울특별시 구로구 개봉동 481`. **`/privacy/`가 빌드되고 푸터·사이트맵에 붙었습니다.** 이름 글자는 이미 서브셋에 들어 있어 폰트 재생성은 필요 없었습니다(확인함). `registration`(사업자등록번호)과 `mailOrder`(통신판매업 신고번호)는 아직 비어 있고, 있으면 표시되고 없으면 생략됩니다. **AdSense 심사는 이제 N5b만 남았습니다** | `site/config.js`, `site/pages.js` |
| N5a | 웹 · M1 | **A contact address** | ✅ | `studio@afterscent.kr`, given 2026-09-01, replaced by the official studio inbox 2026-09-02. The 문의 page, its footer link and its sitemap entry now build from it | `site/config.js` |
| N5b | 웹 · **M1** | **AdSense publisher id and ad unit id** | 🔴 | `SITE.adsenseClient` (`ca-pub-…`) and `SITE.adsenseSlot`. Set both and the script, the unit and `ads.txt` all appear; empty, the site builds exactly as it does now. **M1을 닫는 마지막 항목입니다(2026-09-02 기준).** 신청 순서: ① adsense.google.com에서 사이트 `lovemedialogue.com` 추가 → ② 발급되는 `ca-pub-…`를 `SITE.adsenseClient`에 넣어 배포(이 한 줄로 `<head>`의 스크립트와 `ads.txt`가 생기고, 처리방침의 「쿠키와 광고」 절이 광고 쿠키 문안으로 바뀝니다 — 심사 중 Google이 보는 것) → ③ 심사 통과 뒤 광고 단위 하나를 만들어 `SITE.adsenseSlot`에 넣어 배포. 심사 기준으로 알려진 것: 정책 페이지(있음: 소개·문의·처리방침), 탐색(있음), 충분한 원문 콘텐츠 — **질문집 하나(10쪽)는 '콘텐츠 부족'으로 반려될 수 있는 규모**라 두 번째 팩(N7) 공개가 심사 통과 확률을 올립니다. 반려되면 사유를 그대로 알려 주세요 | `site/config.js` |
| N6 | 공통 · M2 | **Resend domain verification** | 🟢 | Until then `onboarding@resend.dev` reaches only the Resend account owner. Needed for login mail and later for the result sheet | `docs/DEPLOY.md` §4 |
| N7 | 웹 · M1 | **Write `혼자만의 연애` 100문항** | 🔄 | The long pole, and it is writing, not code. ~31,000자. Everything in step 7 below waits on it | `docs/WEB_SERVICE_STRATEGY.md` |
| N8 | 웹 · M1 | **육아 홀더의 장면 그림** | 🟢 | 소유자가 두 번째 시트를 주셨습니다(2026-09-02) — 위: **교육**, 좌하단: **노년**. 둘 다 잘라 붙였습니다. 노후는 그동안 첫 시트의 벤치 그림을 빌려 쓰고 있었는데(소유자가 그렇게 짚어 주셨고, 달리 쓸 그림이 없었습니다) 이제 노후용으로 그려진 그림이 있어 그쪽으로 바꿨습니다. 시트의 우하단 칸은 소유자가 이름 붙이지 않아 쓰지 않았습니다. **남은 것은 육아 한 컷입니다** — 같은 클레이풍, 흰 배경, 같은 프레이밍. 자르는 좌표 한 줄과 `COMING` 한 줄로 붙습니다. (첫 시트의 벤치 그림은 이제 아무 데도 쓰이지 않습니다. 원본에서 그 책 라벨이 `Childcare`라 육아로 돌릴 수도 있는데, 카드 크기에서는 글자가 약 6px이라 읽히지 않습니다 — 소유자 판단이 필요합니다) | `scripts/build-brand-assets.py`, `site/config.js` |
| N9 | 웹 · M2 | **뉴스레터 — 남은 결정과 선행 조건** | 🟢 | **D1은 정해졌습니다(2026-09-02): 자체 릴레이 + Resend.** 그래서 N6(Resend 도메인 인증)이 이 기능의 필수 선행이 됐습니다. 남은 결정: **D2** 엔드포인트 위치(권장 Cloudflare Worker + D1), **D3** 자문(광고성 판단, §28의8①3호 성립 여부, 제N조 문안, Resend 법인명·연락처), **D4** 메일 제목 수위, **D5** 「곧 만나요!」 홀더에 이름을 붙일지. 켜기 전에 처리방침 개정을 먼저 게시하고 30일을 기다립니다(명세 5-10) | `docs/proposals/newsletter-ko.md` §0-1 |

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
| X5e | 웹 · **M1** | **Google Search Console: verify the property, submit the sitemap** | ✅ | X5c | 2026-09-02 완료. 도메인 속성 `lovemedialogue.com`을 후이즈 DNS TXT로 인증, `https://lovemedialogue.com/sitemap.xml` 제출, 홈 색인 요청. 실적·색인 보고서는 며칠 뒤부터 채워짐. `SITE.verification.google`은 비워 둠(DNS 인증이라 필요 없음) |
| X5f | 웹 · **M1** | **Naver Search Advisor 등록** | ✅ | X5c | 2026-09-02 완료. 발급 토큰을 `SITE.verification.naver`에 넣어 배포(#88) → HTML 태그 방식으로 소유확인 통과. 남은 것: 사이트맵 제출과 웹 페이지 수집 요청(홈, `/marriage/`) — 소유자 화면에서 바로 |
| X6 | 웹 | Result sheet delivery by email | ⏳ | N6, X4 | Show on screen first, delivery opt-in, neutral subject line by default |
| X7 | 웹 | AdSense application | 🟢 | — | The site is live over HTTPS, carries a 소개 page, **and now publishes `/privacy/`** — N5 is done, so nothing blocks the application. Note the page count: ten Parts is on the low side for review, and publishing a second pack is one entry in `site/config.js`. In-page units only, never on the page turn |
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
