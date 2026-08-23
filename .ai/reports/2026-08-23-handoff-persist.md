# 2026-08-23 — Device handoff and AnswerRound persist

## Status

COMPLETED

## Delivered

- Forced logout and regular logout both clear the user's only session so a partner can log in on the same device.
- Handoff copy `로그아웃 후 이 기기를 넘겨주세요.` stays next to logout only. It is absent from the onboarding body.
- Same-device two-role switch and local-sim draft migration were removed from the pack UI.
- Logged-in pairs persist drafts, private notes, submitted answers, and agree/hold on the server.
- Drafts and notes stay author-only. The pack stays locked until a partner accepts. Public lock is not implemented.

## Verification

- `npm run lint`
- `npm test` — 41 passed
- `npm run build`
- Live server on `:4173`: buyer force-logout cleared the cookie; partner login succeeded; stale buyer cookie could not read pack state; drafts stayed author-only; both submits revealed; agree/hold persisted as deferred.
- Visual: onboarding has no handoff copy; post-login notice and invite-waiting home show the handoff hint only next to logout.

## Remaining

- Public lock (P5)
- Payment
- Real mail transport
