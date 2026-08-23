# AB Paid MVP Product Specification

## Product contract

AB is a mobile-first web service where two people independently answer questions before important life events, reveal answers only after both submit, discuss differences safely, and record shared agreements.

## Locked product gates

These gates are current product law. Later slices may implement them, but must not contradict them.

- One email identity and one active session per user.
- One active `CoupleWorkspace` per user. Two members maximum: the buyer and one invited partner.
- No Kakao. Onboarding is magic-link email only. There is no password.
- Payment is out of the current foundation slice. The marriage pack does not open until the invited partner accepts. Buyer home after login is invite-waiting only. A workspace without an accepted partner (a ghost workspace) must not unlock the pack.
- Invite is single-use and expires after 7 days. Reissue immediately expires the previous token. Accept creates a `CoupleMember` and consumes that invite. Accept email must equal the invite email. A link-only visitor with the wrong login, or no login, cannot accept.
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

1. Request a magic-link email. The link is valid for 10 minutes.
2. See the sent confirmation copy.
3. Consume a valid link and receive one server session.
4. See the post-login notice that local temporary answers do not continue.
5. Land on invite-waiting buyer home. The pack stays closed until a partner accepts.
6. Log out. Forced logout invalidates the user's only session so a later handoff can clear this device.

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

Later packs, in order, add workspace + invite, device handoff, answer rounds, and public lock. Payment stays closed until a later commercial slice. Ghost workspaces still must not unlock the pack.

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

## Commercial contract

One 29,000 KRW purchase grants one immutable pack version to one two-person couple workspace. The invited partner pays nothing. Payment entitlement is granted only after a verified, idempotent server webhook. This foundation slice does not collect payment or open the pack from payment state.

## Explicit non-goals

- AI counseling or clinical relationship diagnosis
- Kakao login or automated Kakao messages
- password accounts
- one-device two-role product login
- local-simulator draft migration
- native mobile apps
- community or counselor marketplace
- subscription billing
- follow-up pregnancy, birth, and parenting content in the first release
- the 100-question lifecycle line in this slice
