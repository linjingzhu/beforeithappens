# AB Paid MVP Product Specification

## Product contract

AB is a mobile-first web service where two people independently answer questions before important life events, reveal answers only after both submit, discuss differences safely, and record shared agreements.

## Locked product gates

These gates are current product law. Later slices may implement them, but must not contradict them.

- One email identity and one active session per user.
- One active `CoupleWorkspace` per user. Two members maximum: the buyer and one invited partner.
- Onboarding is magic-link email plus Kakao/Naver/Google start. There is no password. Kakao login copy is `카카오로 시작`, not S4 KakaoTalk share.
- Payment is out of the current foundation slice. The marriage pack does not open until the invited partner accepts. Buyer home after login is invite-waiting only. A workspace without an accepted partner (a ghost workspace) must not unlock the pack.
- Invite is single-use and expires after 7 days. Reissue immediately expires the previous token. Editing the invited email and resending immediately expires the previous token. Accept creates a `CoupleMember` and consumes that invite. Accept email must equal the invite email. A link-only visitor with the wrong login, or no login, cannot accept. Opening the invite while another account is logged in cannot accept; the web path is force logout, then magic-link accept for the invited email. There is no role switch.
- Buyer invite-waiting share copy is `링크를 보내 파트너를 초대하세요.` with buttons `링크 복사` / `인스타그램` / `카카오톡` and copy success `링크를 복사했어요.` Those buttons share the existing invite link through copy or the system share intent. Do not replace KakaoTalk share with Kakao login.
- Email typo recovery copy is `초대 메일이 맞는지 다시 확인해 주세요.` with CTA `이메일 수정하고 다시 보내기`, using the same email field as the first send.
- Same-session accept copy is `이 기기에 다른 계정으로 로그인되어 있어요.` with CTA `로그아웃하고 넘기기`. Expired and mismatch copies stay `초대가 만료됐어요. 구매자에게 새 링크를 부탁해 주세요.` and `이 초대는 다른 이메일로 보내졌어요. 초대받은 메일로 로그인해야 해요.`
- Kakao/Naver, and Google without email, must connect an email before invite accept. Title `이메일을 연결해 주세요.` CTA `이메일 연결하기`. Google with email proceeds immediately. Server session/user email is the source of truth for invite matching.
- This slice is web-only. Logged-in web may recommend the app with `앱에서 보면 초대와 알림이 더 쉬워요.`, CTA `앱 설치하기` to the web install landing (`/install`, not the store), and skip `웹에서 계속`. The landing title is `앱을 설치하면 시작할 수 있어요.` with App Store / Google Play placeholder store homepages (do not invent a fake app listing) and secondary `지금은 웹에서 시작할래요.` Install is recommended, not a hard gate. The web path is never blocked on install.
- Instagram `시작하기` opens the web install landing and never deep-links to the store. In Instagram/Kakao in-app browsers show `바로 설치가 안 될 수 있어요. Safari 또는 Chrome에서 열어 주세요.` with CTA `브라우저에서 열기`.
- Do not add a native join screen or universal links. Do not implement native app signup screens. Do not change locked invite expiry, mismatch, or partner-not-installed copies.
- One-device two-role simulation is discarded as a product path. Device handoff is buyer forced logout, then handing the phone. There is no role switch.
- Local-simulator drafts are not migrated into an account.
- Persisted shared records are submitted answers and agree/hold. Drafts and private notes autosave to the server after login and stay author-only.
- A public lock is an immutable snapshot. Re-answer opens a new private round and never reopens the same lock.
- The 100-question lifecycle line is backlog. It is not this slice.

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
