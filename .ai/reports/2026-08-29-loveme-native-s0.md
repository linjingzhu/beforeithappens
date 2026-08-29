# 2026-08-29 — LoveMe native S0

## Delivered

Expo app in `mobile/` with committed iOS and Android targets. Shared UI: 1.2s LoveMe splash, then logged-out S2 signup placeholder. S1 install landing stays on web.

## Verification

- `npm run lint && npm test && npm run build` — 57 tests passed, web dist built.
- Expo web on Linux: splash then signup placeholder; no store/pack/invite UI.
- Korean title font fixed after Georgia fallback broke `혼` on web.

## Handoff

S2–S3 owns magic-link send/consume. Replace `SignupPlaceholder` / `isLoggedIn()`. Do not add a native install landing.
