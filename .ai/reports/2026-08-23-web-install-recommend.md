# Web install recommend + skip

## Scope

- Logged-in web banner on buyer home and pack: recommend install, skip continues web.
- `/install` landing with placeholder store homepages and web continue.
- `/start` Instagram CTA `시작하기` opens the landing, never the store.
- Instagram/Kakao in-app browser hint plus `브라우저에서 열기`.
- No native signup screens. Locked invite expiry/mismatch/share copies unchanged.

## Verification

- Lint: passed
- Tests: 53 passed
- Static build: passed
- Isolated review: PASS; follow-up restored pack view on browser-back from `/install`
- Runtime/visual: `/start`, `/install`, web continue to onboarding, buyer-home banner, and skip-to-invite-home observed

## Remaining risk

- Real Instagram/Kakao in-app `브라우저에서 열기` still depends on the host WebView; iOS has no reliable system-browser API.
- Store buttons go to store homepages until a real listing exists.
