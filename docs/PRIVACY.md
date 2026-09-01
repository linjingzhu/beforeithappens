# Privacy — data inventory, Korean legal baseline, and the gap list before shipping

**This document is engineering analysis, not legal advice.** It was written by reading this
repository and public sources. Every claim about the code is anchored to `file:line`. Every claim
about Korean law is labelled with a confidence level and a source. **A qualified Korean privacy
lawyer (개인정보 보호 전문 변호사) must review both this document and
`docs/proposals/privacy-policy-ko.md` before either is published or relied on.** Nothing here is a
substitute for that review, and nothing here should be pasted into an app-store submission
unchanged.

Companion file: `docs/proposals/privacy-policy-ko.md` — the Korean 개인정보처리방침 draft written
from the inventory below.

---

## 0. Why a template will not do

Two facts make this service unusual, and both come from the code, not from an assumption:

1. **The content is intimate by design.** The published pack (`src/questions.js:1-24`) asks two
   people about money and household finance (`money-01`, `money-02`), 원가족 boundaries and
   명절 obligations (`family-01`), how much of a fight may be told to a friend (`family-02`),
   what each person needs immediately after being hurt (`conflict-01`, `conflict-02`), physical
   affection and closeness (`connection-01` — "포옹이나 손잡기 같은 편안한 신체적 친밀감"),
   how much time apart each wants (`connection-02`), and whether and when to revisit having
   children (`future-02`). This is a structured record of a couple's private life, tied to a
   verified email address.
2. **The product makes an explicit confidentiality promise.** Private notes are described to the
   user as author-only, the results screen tells the user in Korean that private notes are not
   included (`src/app.js:360`, `.privacy-reminder` block), and the code enforces that boundary
   structurally (`server/report.mjs:9-31`, `server/answers.mjs:263-278`). A privacy policy that
   fails to describe this boundary would understate what the service actually holds *and*
   understate the protection it actually gives.

There is currently **no privacy policy, no consent step, and no in-app privacy notice anywhere in
the repository.** The only trace is a copy constant, `legal: "이용약관 | 개인정보 처리방침"` at
`src/hearts.js:21`, which is defined and never rendered — `grep -rn "\.legal\b" src/ mobile/`
returns nothing. The app cannot be submitted to either store in this state.

---

## 1. Data inventory, derived from the code

### 1.1 What the store holds

The persisted collections are declared in `server/store.mjs:3-22` (`emptyState()`), and the durable
engine mirrors them one-for-one in `server/store-sqlite.mjs:27-54` (`COLLECTIONS`). Storage is a
local SQLite database (`server/store.mjs:45-48`, `server/store-sqlite.mjs:12`), with the legacy
JSON file left in place as a cold backup after a one-time import (`server/store.mjs:42-43`).

| 항목 (field) | 어디에 (collection · `file:line`) | 수집 시점 | 목적 | 보유기간 (as coded) | 제3자 |
|---|---|---|---|---|---|
| 이메일 주소 | `users.email` · `server/auth.mjs:134`, `:208-213`, `:63-67` | 매직링크 로그인 요청 시, 또는 Google 로그인에서 email_verified가 참일 때, 또는 이메일 연결 시 | 계정 식별, 로그인, 초대 대상 확인 | 탈퇴 시 즉시 삭제 (`server/account.mjs:84`) | 메일 발송 시 Resend |
| 계정 생성/최종 로그인 시각 | `users.createdAt`, `users.lastLoginAt` · `server/auth.mjs:134`, `:83`, `:172` | 가입 및 매 로그인 | 계정 수명주기, 지원 | 탈퇴 시 삭제 | 없음 |
| 소셜 로그인 식별자 (provider + providerUserId) | `identities` · `server/auth.mjs:223-229` | 카카오·네이버·구글 로그인 성공 시 | 동일 계정 재인식 | 탈퇴 시 삭제 (`server/account.mjs:85`) | 카카오/네이버/구글 (이미 보유) |
| 매직링크 토큰 **해시**, 대상 이메일, 목적, 만료·사용 시각 | `magicLinks` · `server/auth.mjs:139-148`, `:251-260` | 로그인 링크 요청 또는 이메일 연결 요청 시 | 비밀번호 없는 인증 | TTL 10분 (`server/auth.mjs:3`), 단 행은 만료 후에도 남음 — 별도 파기 작업 없음 | Resend (링크 자체를 메일로 발송) |
| 세션 id, userId, 생성 시각 | `sessions` · `server/auth.mjs:74-79`, `:175-180` | 로그인 성공 시 | 로그인 유지 | 서버 만료 없음. 쿠키만 30일 (`server/http.mjs:18`). 새 로그인·로그아웃·탈퇴 시 삭제 | 없음 |
| 워크스페이스 id, 소유자, 상태, 페어코드 | `workspaces` · `server/workspace.mjs:115-120`, `:218-221` | 로그인 직후 자동 생성 (`scripts/server.mjs:29`) | 커플 공간 구성 | 단독 사용자면 탈퇴 시 삭제, 파트너가 남으면 archived (`server/account.mjs:111`, `:135-137`) | 없음 |
| 멤버십 (workspaceId, userId, role, status) | `members` · `server/workspace.mjs:121-128`, `:251-258`, `:320-327` | 워크스페이스 생성 / 초대 수락 / 페어코드 연결 | 접근 권한 | 탈퇴 시 본인 행 삭제 (`server/account.mjs:101-103`) | 없음 |
| **초대받는 사람의 이메일 주소** | `invitations.email` · `server/workspace.mjs:167-178` | 구매자가 파트너를 초대할 때 | 초대 대상 고정 (이메일 일치해야 수락 가능, `server/workspace.mjs:303`) | 초대자 탈퇴 시 삭제 (`server/account.mjs:104-106`). 만료(7일)만으로는 삭제되지 않음 | Resend (초대 메일) |
| **초대 토큰 원문** `shareToken` | `invitations.shareToken` · `server/workspace.mjs:173` | 초대 발급 시 | 재공유용 링크 표시 (`server/workspace.mjs:93`) | 재발급·만료 시 `""`로 비움 (`server/workspace.mjs:53`) | 링크로 전달됨 |
| 질문별 임시 선택 (draft) | `answers.draftChoice` · `server/answers.mjs:123-131`, `:371-400` | 질문 화면에서 선택할 때마다 자동 저장 | 이어서 답하기 | 탈퇴 시 삭제 (`server/account.mjs:95-97`) | 없음 |
| 질문별 제출 선택 + 제출 시각 | `answers.submittedChoice`, `submittedAt` · `server/answers.mjs:429-432` | 제출 버튼 | 공개 비교 | 탈퇴 시 삭제 | 없음 |
| 미리보기 1번 문항 선택 | `answers` (`home-01`) · `server/answers.mjs:336-359` | 파트너 연결 전, 로그인 상태에서 첫 질문 선택 시 | 온보딩 이어가기 | 탈퇴 시 삭제 | 없음 |
| **비공개 메모 (자유 서술)** | `privateNotes.text` · `server/answers.mjs:144`, `:381-400` | 질문 화면에서 입력할 때마다 자동 저장 | 본인만 보는 생각 정리 | 탈퇴 시 삭제 (`server/account.mjs:92-94`) | 없음 — 리포트 쿼리에서 구조적으로 차단 (`server/report.mjs:33-37`) |
| 공동 합의문 (자유 서술) + 상태 + 제안/승인자 | `agreements` · `server/answers.mjs:449-470` | 공개 후 합의 작성/승인 시 | 두 사람의 결론 기록 | **탈퇴해도 본문은 남고 userId 포인터만 null** (`server/account.mjs:114-117`) | 없음 |
| 공개 잠금 스냅샷: 양쪽 선택, 제출 시각, 비교 결과, **양쪽 userId** | `publicLocks.submissions.a/b` · `server/answers.mjs:207-222` | 두 번째 사람이 제출하는 순간 | 되돌릴 수 없는 결과 스냅샷 | **탈퇴해도 삭제·수정되지 않음** (`server/account.mjs:14-18`) | 없음 |
| 진행 위치 (index) | `progress` · `server/answers.mjs:319-327` | 질문 이동 시 | 이어서 답하기 | 탈퇴 시 삭제 (`server/account.mjs:98-100`) | 없음 |
| 주문 기록 (orderId, workspaceId, buyerUserId, 금액, 상태) | `purchases` · `server/entitlement.mjs:150-165` | 구매 시작 시 | 결제·정산 | **탈퇴해도 행은 남고 buyerUserId만 null** (`server/account.mjs:118-120`) | 아직 없음 (아래 1.4 참조) |
| 이용권 (workspaceId, orderId, 상태) | `entitlements` · `server/entitlement.mjs:109-122` | 결제 확인 시 | 팩 잠금 해제 | 남은 파트너의 새 워크스페이스로 이전 (`server/account.mjs:165-170`) | 없음 |
| 결제 웹훅 이벤트 id | `webhookEvents` · `server/entitlement.mjs:101-106` | 웹훅 수신 시 | 중복 처리 방지 | 무기한 | 결제사 (미연동) |
| 감사 로그: 행위, 시각, **가명 참조값**(userId/workspaceId의 단방향 해시), 허용목록 컨텍스트 | `auditEvents` · `server/audit.mjs:161-178` | 로그인·강제 로그아웃·초대 발급/수락·이용권 부여·탈퇴 시 | 보안·지원 이력 | **탈퇴해도 삭제·수정되지 않음** (설계상 append-only, `server/audit.mjs:20-22`). 이메일·토큰·본문은 구조적으로 기록 불가 (`server/audit.mjs:58-121`) | 없음 |
| 리포트 스냅샷: workspaceId, 양쪽 제출 선택, 비교 결과, **합의 본문(AGREED인 경우)** | `reportSnapshots` · `server/report.mjs:222-233`, `:247-249` | 리포트 생성 시 | 팩 버전 고정 결과 재현 | **어떤 삭제 경로에서도 지워지지 않음** — `server/account.mjs`에 해당 컬렉션 처리 없음 | 없음 |

### 1.2 What identifies a person

- **Email address** — `users.email` (`server/auth.mjs:134`) and `invitations.email`
  (`server/workspace.mjs:170`). Normalized to lowercase (`server/auth.mjs:7-9`) and unique
  (`server/store-sqlite.mjs:28`). This is the primary identifier and the invite-matching key
  (`server/workspace.mjs:303`).
- **OAuth provider subject** — `identities.providerUserId` for kakao / naver / google
  (`server/auth.mjs:223-229`, `server/oauth.mjs:203-224`). A stable pseudonymous identifier at the
  provider; combined with `userId` it is personal data.
- **Session id** — `sessions.id`, a 128-bit random value sent as the `ab_session` cookie
  (`server/auth.mjs:76`, `server/http.mjs:18-28`). HttpOnly, SameSite=Lax, Secure only when
  `x-forwarded-proto` is https (`server/app.mjs:17-20`).
- **Internal ids** — `usr_…`, `ws_…`, `mem_…` etc., 128-bit random (`server/auth.mjs:26-28`).
  Pseudonymous while a `users` row exists; opaque once it does not.
- **IP address** — **not logged and not stored anywhere in this repository.** `grep -rn
  "remoteAddress\|x-forwarded-for"` over `server/`, `src/`, `scripts/` returns nothing. The only
  request-header reads are `cookie`, `host`, `accept` and `x-forwarded-proto`
  (`server/app.mjs:89`, `:162`, `server/http.mjs:76-82`). **The hosting platform's own access logs
  are outside this repository and almost certainly do contain IP addresses — the policy must
  account for that, and the operator must confirm the host's retention.**
- **User-Agent** — read in the browser only, to detect an in-app browser
  (`src/app.js:206`, `src/install.js:42-43`). Never sent to the server, never stored.

### 1.3 The author-only boundary, and where it is enforced

| Data | Visible to author | Visible to partner | Enforcement |
|---|---|---|---|
| `privateNotes.text` | yes | **never** | `server/answers.mjs:263-278` returns `""` for the other role; `server/report.mjs:33-37` makes `privateNotes` *unreachable* from report queries — a later join throws instead of leaking |
| `answers.draftChoice` | yes | **not before reveal** | `server/answers.mjs:279-285` — the other role's draft is hard-coded `null`; only `completed: Boolean(theirs?.submittedChoice)` is exposed |
| `answers.submittedChoice` | yes | **only after both submitted** | reveal happens once in `createPublicLock` (`server/answers.mjs:207-228`); the projection reads the lock, not the peer's row (`server/answers.mjs:262-277`) |
| `agreements.proposal` | yes | yes (shared by design) | `server/answers.mjs:288-300` |
| `publicLocks` | yes | yes (shared by design) | `server/answers.mjs:231-241` |

This is a genuinely strong design and the Korean policy should say so plainly, because it is the
single most important promise this product makes to its users.

### 1.4 Every third party that receives data

| 수탁자/수령자 | 무엇을 받는가 | 근거 (`file:line`) | 국외 여부 |
|---|---|---|---|
| **Resend** (메일 발송) | 수신 이메일 주소, 로그인 링크(토큰 포함), 제목·본문 | `server/mail.mjs:9`, `:155-168`; from-address default `onboarding@resend.dev` at `:8` | **국외 (미국) — 확인 필요**, ⟪Resend 법인 정식 명칭·소재국⟫ |
| **Kakao** | OAuth 인가코드 교환 시 client_id/secret; 응답으로 `id`, `kakao_account.email` | `server/oauth.mjs:23`, `:29`, `:35`, `:203-209` | 국내 |
| **Naver** | 동일 구조; 응답으로 `response.id`, `response.email` | `server/oauth.mjs:24`, `:30`, `:36`, `:211-217` | 국내 |
| **Google** | 동일 구조; scope `openid email profile`, 응답으로 `sub`, `email`, `email_verified` | `server/oauth.mjs:25`, `:31`, `:37`, `:45`, `:219-224` | **국외 (미국)** |
| **호스팅 사업자 (Render)** | 서버가 처리하는 모든 데이터 + 접근 로그 | `mobile/eas.json` `EXPO_PUBLIC_API_ORIGIN: https://loveme-api.onrender.com`; `docs/DEPLOY.md:4`, `:39` | **국외 추정 — 배포 리전 확인 필요**, ⟪호스팅 사업자 정식 명칭·리전⟫ |
| **Apple / Google (앱 배포)** | 앱 설치·구매 관련 정보 (스토어 자체 처리) | `mobile/app.json` bundle ids `com.beforeithappens.loveme` | 국외 |
| **EAS / Expo (빌드)** | 소스와 빌드 산출물. 최종 사용자 개인정보는 아님 | `mobile/app.json` `extra.eas.projectId`, `mobile/package.json` | 국외 |
| 결제대행사(PG) | — | **현재 없음.** `entitlement.createPurchase` grants the entitlement directly with a synthetic event id (`server/entitlement.mjs:168-172`) — no payment processor is integrated | 해당 없음 (연동 시 재작성 필요) |

**Push / analytics / tracking:** none. `mobile/src/notifications.js:4-11` calls
`Notifications.requestPermissionsAsync()` and nothing else — **no push token is registered and
nothing is sent to Expo's push service**. `mobile/package.json` lists no analytics, crash-reporting
or advertising SDK. There is no tracking identifier anywhere in the repository. This is a
genuinely clean answer for both store questionnaires and should be preserved deliberately.

### 1.5 Retention and destruction — exactly what 탈퇴 does

`POST /api/account/delete` with `confirm: true` (`server/app.mjs:397-408`,
`server/account.mjs:186-198`) runs `purgeUser` (`server/account.mjs:68-177`):

**Erased outright** — `users` row incl. email (`:84`), all `identities` (`:85`), all `magicLinks`
by userId *and* by that email address (`:86-88`), all `sessions` (`:89`), all `privateNotes`
(`:92-94`), all `answers` incl. drafts (`:95-97`), all `progress` (`:98-100`), the user's `members`
rows (`:101-103`), invitations they issued (`:104-106`), and — where the user was the only accepted
member — that whole workspace with its rounds, agreements, locks and entitlements (`:107-111`).

**Kept, never rewritten** — `publicLocks` of a *shared* workspace (`server/account.mjs:14-18`).
Each lock still contains `submissions.a.userId` and `submissions.b.userId`
(`server/answers.mjs:217-218`). After deletion these are opaque random strings with no row behind
them.

**Kept with the pointer scrubbed** — `agreements`: the free-text `proposal` survives, only
`proposedByUserId` / `approvedByUserId` are nulled (`:114-117`). `purchases`: the order row
survives for accounting, `buyerUserId` nulled (`:118-120`).

**The surviving partner** — the shared workspace is archived, `pairCode` cleared, `ownerUserId`
nulled (`:135-137`); unused invitations are expired and their `shareToken` blanked (`:138-142`); a
fresh active workspace is created with them as buyer (`:148-164`); an active entitlement moves to
it (`:165-170`).

**Untouched by deletion entirely** — `auditEvents` (by design: the rows name nobody,
`server/audit.mjs:20-22`) and `reportSnapshots` (**not by design — the collection is simply absent
from `purgeUser`**; see G8a).

**What no code deletes on a schedule:** expired `magicLinks` rows, expired/unused `invitations`
rows (which contain a third party's email address), old `sessions`, `webhookEvents`, and the
`archivedAt` workspaces. There is **no retention job anywhere in the repository** — `grep` for a
scheduler or cron finds none. Under PIPA Art.21 this is a real gap; see §3.

---

## 2. The Korean legal baseline (개인정보 보호법 / PIPA)

**Method note:** researched via web search. `WebFetch` is blocked by this environment's egress
proxy, so statutory text below is taken from search-result summaries of 국가법령정보센터,
개인정보보호위원회, 개인정보포털 and CaseNote pages rather than from the primary text read
end-to-end. **Confidence is labelled per claim. Anything below HIGH must be verified against the
current statute before publication, and all of it must be reviewed by counsel.**

### 2.1 The service is a 개인정보처리자 and PIPA applies

**Confidence: HIGH.** A Korean-language consumer service, operated from Korea, collecting email
addresses and user content from Korean data subjects, is an 개인정보처리자 under PIPA. There is no
small-business exemption from the Act itself (only narrower exemptions such as the CPO designation
rule in §2.6).

### 2.2 개인정보처리방침 must exist and must contain specific items — Art.30 + 시행령 Art.31

**Confidence: HIGH (that the duty exists and must be published on the website/service).
MEDIUM (that the enumeration below is complete and current).**

Art.30(1) requires a 개인정보 처리방침 containing, among the items named in the statute:

- 개인정보의 파기절차 및 파기방법 (including, where data must be retained under Art.21(1) proviso,
  the retention basis and the retained items);
- 민감정보의 공개 가능성 및 비공개 선택 방법 — Art.23(3), *where applicable*;
- 개인정보 처리의 위탁에 관한 사항 — *where applicable* (**applicable here: Resend, hosting**);
- 개인정보 보호책임자의 성명 또는 개인정보 보호업무·고충처리 부서의 명칭과 전화번호 등 연락처
  (Art.31);
- 인터넷 접속정보파일 등 개인정보를 자동으로 수집하는 장치의 설치·운영 및 그 거부에 관한 사항 —
  *where applicable*;
- 그 밖에 대통령령으로 정하는 사항 (시행령 Art.31) — which includes 처리 목적, 처리 항목,
  보유·이용 기간, 제3자 제공, 정보주체와 법정대리인의 권리·의무 및 행사방법, 안전성 확보 조치,
  and **국외 이전의 근거 및 관련 법령에서 정한 사항** (시행령 Art.31(1)(2)).

Art.30(2) requires publication in a way the data subject can readily check; continuous posting on
the operator's website is the standard method.

Sources: [개인정보 보호법 제30조 (CaseNote)](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C30%EC%A1%B0),
[개인정보포털 — 개인정보처리방침](https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=283),
[개인정보 보호법 시행령 (국가법령정보센터)](https://www.law.go.kr/LSW/lsInfoP.do?lsId=011468&ancYnChk=0).

### 2.3 Consent — and when *separate* consent is required

**Confidence: HIGH for the separate-consent rule; MEDIUM for which of this app's data triggers it.**

Consent under Art.15/Art.22 must be informed (purpose, items, retention period, the right to
refuse and the consequence of refusing) and must be **collected separately** — not bundled into one
"모두 동의" checkbox — for each of:

- 민감정보 (Art.23): 사상·신념, 노조·정당 가입, 정치적 견해, **건강, 성생활** 등. Processing is
  prohibited unless the operator gives the Art.15(2)/17(2) notice **and obtains consent separate
  from all other consents**.
  ([제23조 · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C23%EC%A1%B0))
- 국외 이전 where consent is the chosen basis (Art.28-8(1)(1)).
- 제3자 제공 (Art.17) — distinct from 처리위탁 (Art.26).
- 마케팅·광고성 정보 수신 — not currently applicable; the service sends transactional mail only
  (`server/mail.mjs:3-6`, `:144-177`).

**Applied to this repository — and this is the judgement counsel must confirm, confidence LOW:**
the twelve published questions (`src/questions.js:12-23`) ask about money, family boundaries,
conflict, affection and family planning. `connection-01` includes a physical-affection option and
`future-02` concerns children. In my reading the *fixed choice set* stops short of 성생활 or 건강
as PIPA defines them, but **`privateNotes.text` is unconstrained free text**
(`server/answers.mjs:144`) into which a user may write anything, including health or sexual
matters, and the product invites exactly that kind of candour. A later pack could cross the line
outright. Counsel must decide whether (a) 민감정보 별도 동의 is required today, and (b) whether the
free-text field alone makes the operator a processor of 민감정보 in practice. **Do not resolve this
by guessing.** The conservative engineering position is to build the separate-consent step now so
the answer does not gate the launch.

### 2.4 만 14세 미만 아동 — Art.22-2

**Confidence: HIGH.** Where consent is required to process the personal data of a child under 14,
the operator must obtain the **legal representative's consent and verify that it was given**
(Art.22-2(1)); may collect from the child directly only the minimum information needed to contact
the legal representative (Art.22-2(2)); and must use plain, easily understood language when
notifying children (Art.22-2(3)).
([제22조의2 · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C22%EC%A1%B0%EC%9D%982))

**Applied here:** the repository collects no age at all and has no age gate — `grep` for 나이/생년/
age over `src/`, `server/`, `mobile/src/` returns nothing. For a marriage-preparation product aimed
at adults, the ordinary approach is to state that the service is not for under-14s and to refuse
their sign-up, rather than to build guardian-consent flows. That still requires **an actual age
confirmation step in the sign-up UI** — which does not exist today.

### 2.5 국외 이전 — Art.28-8

**Confidence: HIGH for the rule; MEDIUM for the application, pending confirmation of where Resend
and the host actually process.**

Transfer abroad (제공·처리위탁·보관) is prohibited unless one of the statutory bases applies:
(1) 정보주체의 별도 동의; (2) 법률·조약에 특별한 규정; (3) **계약의 체결·이행을 위해 처리위탁·보관이
필요한 경우로서 법정 사항을 개인정보 처리방침에 공개하거나 전자우편 등으로 알린 경우**;
(4) 이전받는 자의 인증; (5) 이전 대상 국가·국제기구의 보호수준 인정. 시행령 Art.31(1)(2) then
requires the transfer basis (and, where consent is the basis, the content of the consent) to be
disclosed in the 처리방침.
([제28조의8 · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C28%EC%A1%B0%EC%9D%988),
[개인정보보호위원회 — 국외이전 제도](https://www.pipc.go.kr/np/default/page.do?mCode=D060040010))

**Applied here:** Resend (`server/mail.mjs:9`) is a US service and receives the user's email address
plus the login link. The API host in `mobile/eas.json` is `loveme-api.onrender.com`; Render is a US
company and the deployment region determines where the SQLite database physically sits — this
**must be confirmed by the operator**, because if the database is outside Korea then *everything*
in §1.1 is transferred abroad, not just the mail. Google OAuth is likewise a US processor. The
route (3) disclosure — 이전받는 자, 이전 국가·일시·방법, 이전 항목, 이전받는 자의 이용목적·보유기간,
거부 방법 — is drafted into the Korean policy with placeholders.

### 2.6 개인정보 보호책임자 (CPO) — Art.31 + 시행령 Art.32

**Confidence: MEDIUM-HIGH.** Every 개인정보처리자 must designate a CPO. Where the operator is a
소상공인 under 소상공인기본법 Art.2(1), **the proprietor or representative is deemed designated as
CPO without a separate designation**, and the CPO-independence provisions do not apply to them.
Either way the CPO's name (or the responsible department's name) and contact details must appear in
the 처리방침 (Art.30(1)(5)).
([시행령 제32조 · 국가법령정보센터](https://www.law.go.kr/LSW/lumLsLinkPop.do?lspttninfSeq=67003&chrClsCd=010202),
[보호법 제31조 · LBOX](https://lbox.kr/v2/statute/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%20%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C31%EC%A1%B0))

### 2.7 파기 (destruction) — Art.21 + 시행령 Art.16

**Confidence: MEDIUM-HIGH.** Personal data must be destroyed **지체 없이** once the retention period
has passed or the purpose is achieved; the enforcement decree adds that, absent justification,
destruction must occur **within 5 days of the data becoming unnecessary**; and destruction must be
by a method from which the data **cannot be restored or reproduced**.
([제21조 · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C21%EC%A1%B0),
[개인정보의 파기 · 찾기쉬운 생활법령정보](https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?popMenu=ov&csmSeq=1257&ccfNo=2&cciNo=2&cnpClsNo=3))

**Applied here:** §1.5 shows no scheduled destruction of expired magic links, expired invitations
(which hold a *third party's* email), stale sessions or archived workspaces. Also relevant: the
"cannot be restored" standard sits uneasily with `server/store.mjs:42-43`, which leaves the
pre-migration JSON file on disk untouched as a cold backup — deleted rows may still be readable
there. Both are §3 gaps.

### 2.8 정보주체의 권리 — Art.35 / 36 / 37

**Confidence: HIGH.** The data subject may request 열람 (access, Art.35), 정정·삭제 (correction and
deletion, Art.36 — deletion may be refused where another statute mandates collection) and
처리정지·동의철회 (suspension of processing / withdrawal of consent, Art.37). The 처리방침 must
describe how to exercise these rights and name a channel.
([제35조](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C35%EC%A1%B0),
[제36조](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C36%EC%A1%B0),
[정보주체의 열람·정정·삭제 · 찾기쉬운 생활법령정보](https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?popMenu=ov&csmSeq=1257&ccfNo=2&cciNo=2&cnpClsNo=1))

**Applied here:** deletion is implemented and good (`server/account.mjs:186-198`). **열람 (access /
export) is not implemented at all** — there is no endpoint that returns a user their own data in
portable form; `/api/pack/state` returns only the current projection. 처리정지 is not implemented.
Correction is limited to editing answers in place.

### 2.9 유출 통지·신고 — Art.34 + 시행령 Art.40

**Confidence: MEDIUM.** On becoming aware of a breach the operator must notify affected data
subjects without delay and, where thresholds are met — **1,000명 이상의 정보주체**, or a breach of
**민감정보 또는 고유식별정보**, or a breach caused by **외부로부터의 불법적인 접근** — report to the
개인정보보호위원회 or KISA **within 72 hours**.
([유출 시 조치방안 · 찾기쉬운 생활법령정보](https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1257&ccfNo=3&cciNo=2&cnpClsNo=3),
[보안뉴스 — 1천명 이상·민감정보 유출 시 72시간](http://www.boannews.com/media/view.asp?idx=118230&skind=6))

**Applied here:** there is no incident-response runbook in the repository and — see §3 — no
persisted audit trail from which a breach could be reconstructed.

### 2.10 안전성 확보조치 — Art.29

**Confidence: MEDIUM** (the duty is HIGH; the specific technical standard, 개인정보의 안전성 확보조치
기준 고시, was not read in full here). What the code does have, and what a policy may honestly
claim: magic-link tokens stored **only as SHA-256 hashes** (`server/auth.mjs:15-17`, `:144`),
invite tokens compared by hash (`server/workspace.mjs:194`), timing-safe comparison
(`server/auth.mjs:19-24`), HttpOnly/SameSite session cookie (`server/http.mjs:18-28`), one active
session per user with immediate invalidation on new login (`server/auth.mjs:72`, `:174`), OAuth
state signed with HMAC (`server/oauth.mjs:107-145`), and an 8 KB request body cap
(`server/http.mjs:30`). What it does **not** have: encryption at rest for the SQLite database, any
access control on the database file, or a documented key-management story. Do not claim
암호화 저장 in the policy beyond the token hashing that actually exists.

### 2.11 Not researched — flag for counsel

- 정보통신망법 앱 접근권한 고지·동의 (the notification permission request at
  `mobile/src/notifications.js:4-11`) — **not researched here; confidence NONE.**
- 위치정보법 — no location data is collected, so presumably N/A, but not verified.
- 전자상거래법 duties around the 29,000원 purchase (청약철회, 거래기록 5년 보존) — this interacts
  directly with the `purchases` retention answer in the policy. **Not researched; the draft leaves
  this as an explicit placeholder rather than inventing a retention period.**
- 국내대리인 지정 (Art.31-2) — applies to operators without a Korean address; presumably N/A for a
  Korean operator, unverified.

---

## 3. Gap list — what this repository must change before it can lawfully ship

Ranked by how badly each blocks a store submission.

### BLOCKER — cannot submit to either store without these

**G1. No privacy policy exists, and no URL hosts one.** Both stores require a publicly reachable
privacy-policy URL entered in the listing. `docs/proposals/privacy-policy-ko.md` is a draft, not a
published page. *Fix:* fill the placeholders, have counsel review, publish at a stable URL
(e.g. `⟪https://…/privacy⟫`), and serve it from the web app too.

**G2. No in-app link to the policy.** `src/hearts.js:21` defines the label and nothing renders it.
Apple and Google both expect the policy to be reachable from within the app, and PIPA Art.30(2)
expects it to be readily checkable. *Fix:* render a footer/settings link on the web app and in
`mobile/`, at minimum on the sign-up screen and the account screen.

**G3. No consent step at sign-up.** There is no screen anywhere that presents 수집·이용 동의 before
`POST /api/auth/magic-link` or an OAuth start. Sign-up currently collects an email address with no
notice whatsoever. *Fix:* a consent screen before first collection, with **separate** checkboxes for
(필수) 서비스 이용을 위한 개인정보 수집·이용, (필수/해당 시) 국외 이전, and — pending counsel's call
in §2.3 — (필수) 민감정보 처리. Record the consent (version + timestamp) server-side.

**G4. No age confirmation (만 14세 미만).** §2.4. *Fix:* a "만 14세 이상입니다" confirmation in the
same consent step, and a refusal path.

**G5. The 국외 이전 disclosure cannot be written truthfully yet.** The operator has not confirmed
where Render actually hosts the database or Resend's processing location. Publishing a policy with
a guessed country is worse than publishing none. *Fix:* confirm both, then complete §2.5's
placeholders.

**G6. No 개인정보 보호책임자 named.** Art.30(1)(5) makes this a mandatory item of the policy itself;
without a real name/부서 and contact the policy is incomplete on its face.

### HIGH — defensible to a store reviewer, indefensible to a regulator

**G7. `/api/dev/outbox` returns login links, and login links are printed to stdout.**
`server/app.mjs:509-516` serves the last 20 outbox items — each `{ type, email, url }` where `url`
contains a **live, unexpired magic-link token** — with **no authentication whatsoever**, gated only
by the `allowDevOutbox` flag. `server/app.mjs:30-35` additionally writes
`` `${item.type} for ${item.email}: ${item.url}` `` to `console.log` — an email address and an
authentication credential in the host's log stream. The flag is defended well
(`scripts/server.mjs:32` requires `AB_DEV_OUTBOX=1` *and* `NODE_ENV !== "production"`, and
`server/mail.mjs:199-206` refuses the outbox outright on any recognised production host), so this
is a *conditional* exposure, not an open one. It is still the single thing here I would least like
to explain to the 개인정보보호위원회: one mis-set environment variable on an unrecognised host turns
it into an unauthenticated account-takeover endpoint plus a log full of credentials. *Fix:*
authenticate the endpoint or delete it; and drop the email and URL from the log line (log a count
or a hashed reference, as `server/audit.mjs:113-121` already does correctly for audit rows).

**G8. The audit trail is written but never called.** `server/audit.mjs` is a careful,
privacy-correct design — pseudonymous one-way refs instead of `userId` (`server/audit.mjs:106-111`),
a per-action context allowlist (`:58-84`), and a final sweep that rejects anything email-shaped,
token-shaped or long enough to be prose (`:113-121`). The `auditEvents` collection is now registered
in both `server/store.mjs:21` and `server/store-sqlite.mjs:55`, so writes would persist. **But as of
this reading `createAudit` is still never called from anywhere outside its own file** — neither
`scripts/server.mjs` nor `server/app.mjs` imports it, so no login, forced logout, invite, grant or
deletion is actually recorded. Legally this matters twice: without a history there is no way to
answer an 열람 request about account activity, and no way to reconstruct a breach for the 72-hour
report in §2.9. *Fix (owned by whoever owns those modules, not by this pack):* wire the recorders at
their call sites. Once wired, note that audit rows deliberately **survive 탈퇴**
(`server/audit.mjs:20-22`) — that is defensible because they name nobody, but the 파기 section of
the policy must say it, and it is stated in the Korean draft.

**G8a. Report snapshots are never destroyed.** `reportSnapshots` rows
(`server/report.mjs:222-233`) hold a workspace's full result set — both partners' submitted choices
and the free-text AGREED 합의문 (`server/report.mjs:126`, `:207`) — keyed by `workspaceId`. They
carry no `userId`, which is good. But **`server/account.mjs:68-177` does not touch the collection at
all**, so a snapshot survives even the case where 탈퇴 deletes the entire workspace and every lock
inside it (`server/account.mjs:107-111`). The couple's answers then outlive the workspace they came
from. *Fix:* purge `reportSnapshots` for removed workspaces in `purgeUser`, or state a retention
period for them in the policy. Until then the 파기 description cannot be written truthfully.

**G9. No retention/destruction job.** §2.7. Expired magic links, expired invitations (holding a
non-user's email address), stale sessions and archived workspaces persist forever. *Fix:* a periodic
purge, and state its schedule in the policy's 파기 section.

**G10. The pre-migration JSON store is left on disk as a cold backup.** `server/store.mjs:42-43`.
Rows deleted from SQLite by 탈퇴 may remain readable in that file, which is in tension with Art.21's
"cannot be restored or reproduced". *Fix:* delete it after a successful migration, or document it as
a backup with a stated retention period and include it in the deletion path.

**G11. Raw invite tokens are stored.** `server/workspace.mjs:173` persists `shareToken` — the
plaintext token — alongside its hash, so that the buyer can re-share the link
(`server/workspace.mjs:93`). Anyone with read access to the database holds a live invitation
credential. Impact is bounded (accept still requires the invited email address,
`server/workspace.mjs:303`) and it is blanked on reissue/expiry (`server/workspace.mjs:53`). *Fix:*
hold the raw token only in the issuing response, or accept the residual risk explicitly and
document it.

**G12. No 열람 (access/export) and no 처리정지.** §2.8. Deletion alone does not satisfy Art.35/37.
*Fix:* a "내 데이터 내려받기" endpoint and a documented 처리정지 request channel — the channel may be
email, but it must exist and be named in the policy.

### MEDIUM — the policy must describe these honestly, even if no code changes

**G13. Deletion leaves identifying traces, and the policy must say so.** `publicLocks` keep both
`userId`s (`server/answers.mjs:217-218`), `agreements` keep free text the departed user wrote
(`server/account.mjs:114-117`), `purchases` keep the order (`:118-120`), `reportSnapshots` keep the
whole result set (G8a), `auditEvents` keep a pseudonymous action history (G8), and the surviving
partner keeps an archived workspace. The design reasoning is sound — a lock is a joint record, an order is
an accounting record — but "탈퇴하면 모두 삭제됩니다" would be **false**. The Korean draft states the
carve-outs explicitly. Counsel must confirm the 보존 근거 for each (Art.21(1) proviso requires the
basis and the retained items to be stated).

**G14. Third-party host log retention is unknown.** §1.2. The policy claims about IP addresses
cannot be finalised until the operator confirms what Render logs and for how long.

**G15. No 이용약관 exists either.** Out of scope for this pack, but both stores and 전자상거래법
expect one alongside the privacy policy, and `src/hearts.js:21` already promises both.

---

## 4. App-store checklist, answered from the real inventory

**These are drafted answers, not filed ones.** Re-verify each against the code at submission time —
if a sibling worker adds an SDK, several answers change.

### 4.1 Apple — App Privacy questionnaire (App Store Connect)

Apple asks, per data type, whether it is collected, for what purposes, whether it is **linked to
the user's identity**, and whether it is **used for tracking**.
([App Privacy Details · Apple Developer](https://developer.apple.com/app-store/app-privacy-details/))

| Apple data type | Collected? | Answer, and why |
|---|---|---|
| **Contact Info → Email Address** | **Yes** | `users.email` (`server/auth.mjs:134`) and `invitations.email` (`server/workspace.mjs:170`). Purpose: **App Functionality**. **Linked to the user: Yes.** Tracking: No. |
| Contact Info → Name, Phone, Address | No | Never collected. |
| **User Content → Other User Content** | **Yes** | `privateNotes.text` (`server/answers.mjs:144`), `agreements.proposal` (`server/answers.mjs:454`), and the question selections in `answers`/`publicLocks`. Purpose: **App Functionality**. **Linked: Yes.** Tracking: No. |
| User Content → Emails or Text Messages, Photos, Audio, Gameplay Content, Customer Support | No | None collected. |
| **Identifiers → User ID** | **Yes** | `users.id`, `sessions.id`, and the OAuth `providerUserId` (`server/auth.mjs:223-229`). Purpose: **App Functionality**. **Linked: Yes.** Tracking: No. |
| Identifiers → Device ID | No | No IDFA/IDFV is read; no analytics or ads SDK in `mobile/package.json`. |
| **Purchases → Purchase History** | **Yes** (once payment ships) | `purchases` (`server/entitlement.mjs:150-165`). Purpose: **App Functionality**. **Linked: Yes.** Tracking: No. **If in-app purchase is not enabled in the submitted build, answer No and re-answer when it is.** |
| Financial Info → Payment Info | No | No card or bank data touches this server; no PG is integrated (`server/entitlement.mjs:168-172`). Re-answer when a PG lands. |
| **Sensitive Info** | **⟪counsel's call — see §2.3⟫** | Apple's "Sensitive Info" covers, among others, sexual orientation and health. The fixed choice set arguably does not reach it; free-text private notes might. **Do not answer this box until counsel has ruled.** |
| Health & Fitness, Location, Contacts, Browsing History, Search History, Diagnostics | No | None collected. `mobile/src/notifications.js` registers no push token. |
| Usage Data | No | No analytics SDK, no event pipeline anywhere in the repository. |

**Tracking (ATT):** answer **No** to "used for tracking" for every type. Nothing in the app shares
data with a data broker or links it to third-party data for advertising, and there is no
`NSUserTrackingUsageDescription` need.

**Guideline 5.1.1(v) — in-app account deletion:** **required**, because the app supports account
creation. Already implemented server-side (`POST /api/account/delete`, `server/app.mjs:397-408`,
two-step confirm at `server/account.mjs:186-198`). **What is missing is the UI path in the mobile
app** — the deletion must be initiable from within the app and easy to find, and temporarily
disabling is not sufficient.
([Apple Developer — account deletion requirement](https://developer.apple.com/news/?id=12m75xbj))
Note: if Sign in with Apple is ever added, deletion must also revoke tokens via the Sign in with
Apple REST API. It is not used today (`server/oauth.mjs:4` lists kakao/naver/google only).

**Privacy policy URL:** mandatory field in App Store Connect. → G1.

### 4.2 Google Play — Data safety form

Google asks per data type: collected / shared, purpose, whether optional, whether **encrypted in
transit**, and whether users can **request deletion**. Answers must match the privacy policy, and
third-party SDK collection counts as yours.
([Play Console Help — Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en))

| Play data type | Collected | Shared | Purpose | Optional? | Encrypted in transit | Deletable |
|---|---|---|---|---|---|---|
| **Personal info → Email address** | Yes | **Yes** — to the email provider (Resend) to send login and invite links (`server/mail.mjs:155-168`). *Confirm whether Play classes a transactional mail processor as "shared"; a processor acting on the developer's behalf is normally **not** "shared" — verify before filing.* | Account management, App functionality | Required | **Yes, if and only if the deployment terminates TLS** (`docs/DEPLOY.md`) | **Yes** (`/api/account/delete`) |
| **Personal info → User IDs** | Yes | No | App functionality | Required | Yes | Yes |
| **App activity → Other user-generated content** | Yes | No | App functionality | Required | Yes | Yes — with the carve-outs in G13, which must be described on the deletion page |
| **Financial info → Purchase history** | Yes (when payment ships) | No | App functionality | Required for paid pack | Yes | **Partially** — `purchases` rows are retained with `buyerUserId` nulled (`server/account.mjs:118-120`). Declare honestly. |
| App activity → App interactions, search history; Device or other IDs; Location; Photos; Contacts; Messages; Health; Audio | No | No | — | — | — | — |

**Account deletion URL (Play's Data deletion section):** Google requires a URL where users can
request account and data deletion, and it must be the same URL referenced in the privacy policy.
→ needs a real page: `⟪https://…/account/delete⟫`.

**Privacy policy URL:** mandatory. Must be the same policy the form matches. → G1.

**"Data is encrypted in transit":** only answerable Yes once TLS is confirmed end to end. The server
itself is plain HTTP behind a proxy (`scripts/server.mjs:34-36`) and derives `secure` on the session
cookie from `x-forwarded-proto` (`server/app.mjs:17-20`), so this depends entirely on the
deployment. Confirm before ticking the box.

### 4.3 Where the policy must appear in-app

1. **Before first collection** — on the sign-up / login screen, above the email field and the social
   buttons, with the consent checkboxes of G3 (`mobile/S2SignupScreen.*`, `mobile/src/screens.js`,
   and the web equivalent in `src/app.js`).
2. **Persistently** — a footer or settings entry reachable at any time; this is where
   `src/hearts.js:21`'s unused `legal` string was meant to go.
3. **Next to account deletion** — the deletion screen should link the policy's 파기 section, since
   that is where the G13 carve-outs are explained.
4. **In both store listings** — the policy URL field, matching the questionnaire answers exactly.

---

## 5. Placeholders the owner must fill in

Every one of these appears as a `⟪…⟫` marker in `docs/proposals/privacy-policy-ko.md`. **None of
them may be invented.**

| Placeholder | Why it is needed |
|---|---|
| ~~⟪사업자명(상호)⟫~~ **afterscent** | 처리방침 필수 — who the 개인정보처리자 is. Given by the owner 2026-09-01 and filled in |
| ⟪대표자 성명⟫ | 처리방침 / 이용약관 통상 기재 |
| ⟪사업자등록번호⟫ | 전자상거래 사업자 표시 |
| ⟪통신판매업 신고번호⟫ | 유료 판매 시 |
| ⟪사업장 주소⟫ | 처리방침 필수 |
| ⟪개인정보 보호책임자 성명 / 직책⟫ | Art.30(1)(5) — mandatory item |
| ⟪보호책임자 연락처: 이메일 / 전화⟫ | Art.30(1)(5) — mandatory item |
| ⟪고객문의 이메일⟫ | 권리 행사 창구 (Art.35/36/37) |
| ⟪Resend 법인 정식 명칭 및 소재 국가⟫ | 처리위탁 + 국외이전 disclosure |
| ⟪호스팅 사업자 정식 명칭 · 서비스 리전(국가)⟫ | **§2.5 — determines whether the whole database is a 국외 이전** |
| ⟪결제대행사 정식 명칭⟫ | Only when a PG is integrated; leave blank until then |
| ⟪호스팅 접근로그 보관 기간⟫ | The IP-address answer depends on it (§1.2, G14) |
| ⟪결제·거래기록 보존기간 및 근거 법령⟫ | §2.11 — 전자상거래법 retention, unresearched |
| ⟪처리방침 시행일자⟫ | Required; must be a real date |
| ⟪처리방침 공개 URL⟫ | For both store listings |
| ⟪계정·데이터 삭제 요청 URL⟫ | Google Play Data safety deletion URL |
| ⟪민감정보 별도 동의 여부 — 법률 검토 결과⟫ | §2.3, unresolved |

---

## 6. Standing caveat

This document and the accompanying Korean draft were produced by reading source code and public
legal summaries. They are a starting point for a lawyer, not a substitute for one. The Korean draft
in particular contains statements of legal effect that only a qualified 변호사 licensed in the
Republic of Korea should approve. **Do not publish either document, and do not answer an app-store
privacy questionnaire from them, until that review is complete.**

### Sources

- [개인정보 보호법 제30조 (개인정보 처리방침의 수립 및 공개) · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C30%EC%A1%B0)
- [개인정보포털 — 개인정보처리방침](https://www.privacy.go.kr/front/contents/cntntsView.do?contsNo=283)
- [개인정보 보호법 시행령 · 국가법령정보센터](https://www.law.go.kr/LSW/lsInfoP.do?lsId=011468&ancYnChk=0)
- [개인정보 보호법 제22조의2 (아동의 개인정보 보호) · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C22%EC%A1%B0%EC%9D%982)
- [개인정보 보호법 제23조 (민감정보의 처리 제한) · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C23%EC%A1%B0)
- [개인정보 보호법 제28조의8 (개인정보의 국외 이전) · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C28%EC%A1%B0%EC%9D%988)
- [개인정보보호위원회 — 국외이전 제도](https://www.pipc.go.kr/np/default/page.do?mCode=D060040010)
- [개인정보 보호법 시행령 제32조 (보호책임자) · 국가법령정보센터](https://www.law.go.kr/LSW/lumLsLinkPop.do?lspttninfSeq=67003&chrClsCd=010202)
- [개인정보 보호법 제31조 · LBOX](https://lbox.kr/v2/statute/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%20%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C31%EC%A1%B0)
- [개인정보 보호법 제21조 (개인정보의 파기) · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C21%EC%A1%B0)
- [개인정보의 파기 · 찾기쉬운 생활법령정보](https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?popMenu=ov&csmSeq=1257&ccfNo=2&cciNo=2&cnpClsNo=3)
- [개인정보 보호법 제35조 (열람) · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C35%EC%A1%B0)
- [개인정보 보호법 제36조 (정정·삭제) · CaseNote](https://casenote.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4_%EB%B3%B4%ED%98%B8%EB%B2%95/%EC%A0%9C36%EC%A1%B0)
- [정보주체의 개인정보 열람·정정·삭제 · 찾기쉬운 생활법령정보](https://www.easylaw.go.kr/CSP/CnpClsMainBtr.laf?popMenu=ov&csmSeq=1257&ccfNo=2&cciNo=2&cnpClsNo=1)
- [개인정보 유출 시의 조치방안 · 찾기쉬운 생활법령정보](https://easylaw.go.kr/CSP/CnpClsMain.laf?popMenu=ov&csmSeq=1257&ccfNo=3&cciNo=2&cnpClsNo=3)
- [보안뉴스 — 1천명 이상 민감정보 유출 시 72시간 이내 신고](http://www.boannews.com/media/view.asp?idx=118230&skind=6)
- [Apple Developer — App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Apple Developer — Account deletion requirement (Guideline 5.1.1(v))](https://developer.apple.com/news/?id=12m75xbj)
- [Google Play Console Help — Provide information for Data safety section](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en)
