# Web invite drop-off A/B and share

## Scope

- Buyer invite-waiting share copy and copy/Instagram/KakaoTalk actions for the current invite link.
- Email-typo recovery that edits the same field and expires the previous token on resend.
- Same-session accept block with force logout, then web magic-link continue for the invited email.
- No native join, store landing, universal links, Kakao login, or payment.

## Verification

- Lint: passed
- Tests: 47 passed
- Static build: passed
- Isolated review: PASS_WITH_NOTES; follow-up fixed contract CTA drift, logout conflict cleanup, expired share-token scrub, and composed HTTP recovery test
- Runtime/visual: buyer home, share + typo recovery, copy success, same-session block, and logout-continue onboarding observed
- GitHub CI on the branch: success

## Remaining risk

- Real-device Instagram/KakaoTalk share-sheet membership depends on the OS share intent.
- No production email transport yet.
