# App S4 invite-waiting + same-session fail

## Scope

- Native S4 buyer home is invite-waiting only: share copy, copy/Instagram/KakaoTalk, typo resend, no pack CTA.
- Independent same-session fail screen with force logout. S9 is logout chrome only.
- Store redirect, deferred deep link, and uninstalled join-confirm stay on the web accept flow.

## Verification

- Lint: passed
- Tests: 60 passed
- Static build: passed
- Isolated review: self-review of this pack (same-family fallback; no opposite-family reviewer)
- Runtime/visual: S4 waiting, copy success, same-session fail, and first-send observed on `/mobile/s4-invite/preview.html`

## Remaining risk

- iOS/Android views are drop-in screens; they are not yet wired into an app shell.
- Real-device Instagram/KakaoTalk share-sheet membership depends on the OS share intent.
