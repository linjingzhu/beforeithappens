# AB Paid MVP Product Specification

## Product contract

AB is a mobile-first web service where two people independently answer questions before important life events, reveal answers only after both submit, discuss differences safely, and record shared agreements.

## Locked product gates

These gates are current product law. Later slices may implement them, but must not contradict them.

- One email identity and one active session per user.
- One active `CoupleWorkspace` per user. Two members maximum: the buyer and one invited partner.
- Onboarding is magic-link email plus Kakao/Naver/Google start. There is no password. Kakao login copy is `카카오로 시작`, not S4 KakaoTalk share. iOS measurement next-build is browse-first: splash (1.2s fail-open) → `질문집` home without login. Marriage pack detail and coming-soon taste are readable logged out. Magic-link login (`비밀번호 없이 이메일로 로그인 링크를 보내드려요.` + `로그인 링크 보내기`) opens only when tapping `링크 보내기`, in-app `연결하기`, 결제, or `계정`. After consume, return to that intended destination (notice first when present), not a generic home reset. No Kakao/Naver/Google. Discard the unauthenticated workbook cover and preview-Q1-before-login path (`미리 질문 하나 보기` / `이 답을 남기려면 로그인해 주세요` are not this build). Pack-list home is `질문집` / `결혼만 지금 열려 있어요.` / `결혼` open / `가정 경영` `임신` `출산` `육아` each `곧 열려요` / top-right `계정`. Account is `계정` + read-only `이메일` + `로그아웃`. Do not show `이 폰을 상대에게 넘기려면 먼저 로그아웃하세요.` Marriage pack detail is `결혼` / `두 사람의 결혼 준비, 한곳에.` / section `예시 질문` with three CPO-locked read-only sample cards (`예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요?` / `명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요?` / `우리에게 집은 어떤 의미에 가장 가까울까요?`) / caption `여기서 답하지 않아요. 파트너가 연결된 다음 질문이 열려요.` / CTA `링크 보내기`. Do not start the question-answering flow from this screen. Do not use `결혼식 규모` / `결혼 비용` / `양가 명절은`. Coming-soon packs (`가정 경영` `임신` `출산` `육아`) are enterable from `질문집` and are not sold. They do not send invite links. `가정 경영` taste is badge `곧 열려요` / `임시 체험` / Designer sample `가사와 시간은 어떻게 나누고 싶나요?` / caption `예시입니다. 여기서 답하거나 팔지 않아요.` / CTA `결과 맛보기` / text link `목록으로`. `결과 맛보기` is title `결과 맛보기` / badge `가까움` (Korean only; never show `ALIGNED` / `CLOSE` / `DISCUSS` on this surface) / the same sample Q / fake answers `나` `평일은 반반, 주말은 그때 그때요.` and `상대` `한 사람이 메인으로 하고 나머지는 나눠요.` / caption `진짜 비교는 열린 팩에서 둘이 낸 다음입니다.` plus `예시입니다.` / CTA `목록으로`. Label set if needed: `같음` / `가까움` / `이야기해요`. `임신` `출산` `육아` reuse that 임시 체험 shell and the same swappable sample-Q constant. No 100-question body, prices, scores, graphs, faces, or `링크 보내기` on coming-soon. Logged-in chrome uses Safe Area / `safeAreaInsets`: top chrome (`계정`, titles) sits below the iPhone Dynamic Island; bottom CTAs (`링크 보내기`, `목록으로`, `결과 맛보기`, `로그아웃`) sit above the home indicator. No QR-code screen. Invite is `링크 보내기` / `초대를 보내면 상대도 같은 팩을 받아요.` / `링크 복사` / `인스타그램` / `카카오톡` / `앱에서 코드로 연결` / `내 코드` / `상대 코드를 알고 있다면` / `상대 코드 입력` / `연결하기`. Those three share the invite LINK only; pair codes stay in-app. Magic-link consume uses the `loveme` app URL scheme so the installed iOS app opens, not Safari/web. Consume lands on notice then the intended keep-gate (or `질문집` when there is no pending gate), never preview Q1. Questions do not start until a partner is connected. Comparison opens only after both submit. No prices. Do not open all 12 questions alone.
- Payment is out of the current foundation slice. The marriage pack does not open until the invited partner accepts. Buyer home after login is invite-waiting only. A workspace without an accepted partner (a ghost workspace) must not unlock the pack.
- Invite is single-use and expires after 7 days. Reissue immediately expires the previous token. Editing the invited email and resending immediately expires the previous token. Accept creates a `CoupleMember` and consumes that invite. Accept email must equal the invite email. A link-only visitor with the wrong login, or no login, cannot accept. Opening the invite while another account is logged in cannot accept; the web path is force logout, then magic-link accept for the invited email. There is no role switch.
- Buyer invite-waiting share copy is `링크를 보내 파트너를 초대하세요.` with buttons `링크 복사` / `인스타그램` / `카카오톡` and copy success `링크를 복사했어요.` Those buttons share the existing invite link through copy or the system share intent. Do not replace KakaoTalk share with Kakao login.
- The invite is a link the buyer delivers themselves; nothing is emailed to the invited address. The partner email binds who may accept, so the copy says so rather than claiming a send: first CTA `초대 링크 만들기`, status row `링크 만든 시각`, typo recovery `상대 이메일이 맞는지 다시 확인해 주세요.` with CTA `이메일 고치고 링크 다시 만들기`, using the same email field.
- Same-session accept copy is `이 기기에 다른 계정으로 로그인되어 있어요.` with CTA `로그아웃하고 넘기기`. Expired and mismatch copies stay `초대가 만료됐어요. 구매자에게 새 링크를 부탁해 주세요.` and `이 초대는 다른 이메일로 만들어졌어요. 초대받은 메일로 로그인해야 해요.`
- Kakao/Naver, and Google without email, must connect an email before invite accept. Title `이메일을 연결해 주세요.` CTA `이메일 연결하기`. Google with email proceeds immediately. Server session/user email is the source of truth for invite matching. If a provider has no OAuth keys, show `이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요.` This social pack is not shippable until provider callbacks are wired.
- This slice is web-only. Logged-in web may recommend the app with `앱에서 보면 초대와 알림이 더 쉬워요.`, CTA `앱 설치하기` to the web install landing (`/install`, not the store), and skip `웹에서 계속`. The landing title is `앱을 설치하면 시작할 수 있어요.` with App Store / Google Play placeholder store homepages (do not invent a fake app listing) and secondary `지금은 웹에서 시작할래요.` Install is recommended, not a hard gate. The web path is never blocked on install.
- Instagram `시작하기` opens the web install landing and never deep-links to the store. In Instagram/Kakao in-app browsers show `바로 설치가 안 될 수 있어요. Safari 또는 Chrome에서 열어 주세요.` with CTA `브라우저에서 열기`.
- The invite accept screen is the first screen an invited partner ever sees, and it is usually opened inside the KakaoTalk in-app browser, where a social login provider may refuse an embedded webview. Show the same escape there: `카카오톡 안에서는 로그인이 막힐 수 있어요. Safari 또는 Chrome에서 열어 주세요.` with CTA `브라우저에서 열기`. The invite token must survive that handoff.
- Do not add a native join screen or universal links. Do not implement native app signup screens. Do not change locked invite expiry, mismatch, or partner-not-installed copies.
- One-device two-role simulation is discarded as a product path. Device handoff is buyer forced logout, then handing the phone. There is no role switch.
- Local-simulator drafts are not migrated into an account.
- Persisted shared records are submitted answers and agree/hold. Drafts and private notes autosave to the server after login and stay author-only.
- A public lock is an immutable snapshot. Re-answer opens a new private round and never reopens the same lock.
- LoveMe NEXT home (this PR only; live preview `d3be894e` stays splash → `질문집` without this first-run login). First-run: splash → magic-link login (`LoveMe` wordmark, email placeholder `이메일 주소를 입력해주세요`, CTA `로그인 링크 보내기`; no phone, password, social, or visible `MaruBuri 🐾` font-label). Request the iOS **system** notification permission (app name LoveMe). Don't Allow still continues. Do not ship a custom Korean notification body or a fake UIAlert. Sending the link is virtual (`[debug]`; no real mail). After virtual success, `질문집` home shows heart balance starting at `0`. Unsold packs keep `곧 열려요`. Marriage is the live pack. Coming-soon packs use the same sample engine as marriage: random 3 from that pack's **existing** 4-choice questions (do not invent `임신`/`출산`/`육아` copy when none exist) → sample result `예시입니다` / `같음` / `가까움` / `이야기해요` → `함께 풀어보기` → virtual connect → shop one SKU `29,000원에 하트 12` (12 hearts) → enough hearts → `열기` only (virtual 10-heart spend) → certificate: pack name, `두 사람이 이 질문집을 마쳤어요`, counts for `같음` / `가까움` / `이야기해요` only, heart stamp, CTA `홈으로`, `[debug] 수료` (not a conversion). After the 3 sample questions stay on sample result, not the certificate. No scores, faces, or graphs. Partner has no hearts/shop; copy is `상대가 열면 이어집니다.` Store builds hide `[debug]`. Designer font lock: titles and question stems use MaruBuri; body, choices, buttons, and `곧 열려요` use Pretendard. Sample Q header is `결혼 1/3` (of 3, not 3/12). Prompt `왜 그 선택인지 한 줄로 적어주세요.` with outline heart. CTA `다음`. Pack names stay `연애` `결혼` `가정 경영` `임신` `출산` `육아`.


## MVP success criteria

- One purchaser can later buy a question pack and invite one partner. Payment entitlement is not granted in this foundation slice.
- Both people answer without seeing the other's answer.
- A question is revealed only after both people submit it.
- Each revealed question supports a shared agreement or deferral.
- Progress resumes across sessions and devices after login. Device-local demo drafts do not continue into an account.
- Reports contain shared results only; private notes are always excluded.
- Users cannot access another couple's workspace or their partner's private data.

## Foundation slice (current)

Authentication is a real `User` session, not another local role:

1. Request a magic-link email, or start with Kakao/Naver/Google. The magic link is valid for 10 minutes. If Kakao/Naver (or Google without email) has no email, connect email before invite accept.
2. See the sent confirmation copy.
3. Consume a valid link and receive one server session.
4. See the post-login notice that local temporary answers do not continue.
5. Land on invite-waiting buyer home. The pack stays closed until a partner accepts.
6. After sending an invite, share the existing link (copy / Instagram / KakaoTalk system share). Confirm the invited email and resend if needed; resend expires the previous token.
7. If an invite link is opened while another account is logged in, block accept, force logout, and continue the web magic-link accept for the invited email.
8. Log out. Forced logout invalidates the user's only session so a later handoff can clear this device.
9. Logged-in web may show the recommended install banner. Skip or `지금은 웹에서 시작할래요.` continues the web flow. Instagram `시작하기` opens `/install`, never the store.

Onboarding copy is fixed:

- Title: `두 사람의 결혼 준비, 한곳에`
- Body: `비밀번호 없이 이메일로 로그인 링크를 보내드려요.`
- CTA: `로그인 링크 보내기`
- After send: `메일을 확인해 주세요. 링크는 10분 동안만 유효해요.`
- Immediately after login: `이 기기 임시 답은 이어지지 않아요.`
- Device-handoff copy is forbidden in the onboarding body. It appears only next to logout: `로그아웃 후 이 기기를 넘겨주세요.`

## Historical local slices

Earlier implementation proved the question loop on one browser:

1. Open the marriage preparation pack locally.
2. Answer one question at a time, with a labeled private note.
3. Use a device-local two-role simulator to submit, reveal, and agree.

That simulator is not an authentication or privacy boundary. It is not the current product entry. Role switching is not offered as a way to sign in or hand off a device.

## Later slices

This slice includes public lock: the second submit writes an immutable snapshot, and a later change opens a new private round. Payment stays closed until a later commercial slice. Ghost workspaces still must not unlock the pack.

## Question state model

```text
UNANSWERED
→ DRAFT_PRIVATE
→ SUBMITTED_PRIVATE
→ REVEALED
→ DISCUSSING
→ AGREED | DEFERRED
```

- Drafts never count as submitted.
- Before reveal, the partner sees completion status only.
- Both submissions transition the question atomically to `REVEALED`.
- Skipping is an explicit submission without a compatibility score.
- Changing a revealed answer creates a new private round; it never silently overwrites history or reopens a public lock.

## Comparison language

- `ALIGNED`: similar priorities
- `CLOSE`: similar direction, different degree
- `DISCUSS`: an important conversation is recommended
- `NEUTRAL`: choices cannot responsibly be ranked
- `UNRATED`: skipped or no comparison rule

AB never describes answers as correct/incorrect and does not produce a relationship diagnosis or success probability.

## Privacy boundaries

Author only:

- answer drafts;
- private notes;
- authentication data.

Both partners after reveal:

- submitted selections;
- shared explanations;
- agreements and their revision history;
- couple progress and report.

Private notes are excluded from partner APIs, administrator tools, PDFs, and shared reports by design.

## Commercial line (this slice)

- The invited partner is free.
- The pack opens only after the partner accepts the invite.
- After the third sample public lock, remaining questions stay locked until a buyer 29,000 KRW entitlement. The invited partner pays nothing.
- Payment card-form, subscriptions, and the 100-question lifecycle line are out of this slice.

## Commercial contract

One 29,000 KRW purchase grants one immutable pack version to one two-person couple workspace. The invited partner pays nothing. Payment entitlement is granted only after a verified, idempotent server webhook. Sample questions 1–3 stay open after partner accept. The remaining pack stays locked until buyer entitlement exists.

## Explicit non-goals

- AI counseling or clinical relationship diagnosis
- automated Kakao messages
- password accounts
- one-device two-role product login
- local-simulator draft migration
- native mobile apps
- community or counselor marketplace
- subscription billing
- follow-up pregnancy, birth, and parenting content in the first release
- the 100-question lifecycle line in this slice
