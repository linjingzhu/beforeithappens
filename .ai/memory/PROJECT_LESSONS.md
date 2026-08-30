# Project Lessons

Repository-specific memory for reducing rediscovery and repeated mistakes.

Do not copy this file into unrelated projects.

## Conflict Hotspots

- None recorded yet.

## Build / Compile Lessons

### 2026-08-30 — Empty API origin makes native session fetch hang the splash
Area: Expo iOS splash / mobile auth client
Evidence: Preview EAS had no `EXPO_PUBLIC_API_ORIGIN`. `api.session()` called `fetch("" + "/api/auth/session")`; native fetch never settled, so `App.js` never `setState` after the 1.2s hold.
Impact: JS splash stayed forever even though S0 copy is only 1200ms.
Recommended future behavior: Treat empty origin, rejected fetch, or a ≤2s session timeout as logged-out and `finishSplash` to signup. Do not invent a production origin in-repo.
Confidence: high

### 2026-08-30 — Metro project root is mobile/, not the repo root
Area: Expo iOS JS bundle / EAS preview
Evidence: EAS build `ce372f4a` failed with `Unable to resolve module ../../src/auth.js` from `mobile/s4-invite/flow.js`. File exists at repo-root `src/auth.js`; Metro looked for `mobile/src/auth.js`. `npx expo export:embed --eager --platform ios --dev false` succeeded after `mobile/metro.config.js` watchFolders `../src` (599 modules).
Impact: Native S4 imports of the web auth module break the iOS bundle even when pods/Xcode succeed. Duplicating `src/auth.js` into `mobile/src/` would drift copy.
Recommended future behavior: Keep shared web modules at repo-root `src/` and extend Metro `watchFolders` (not a full-app copy). Do not watch the entire repo root — that collides with `mobile/src/`.
Confidence: high

## UX / Runtime Lessons

### 2026-08-30 — iOS first tap on S2 CTA only dismisses the keyboard
Area: Expo signup / bind
Evidence: SignupScreen had a TextInput then Pressable CTAs with no KeyboardAvoidingView/ScrollView. On iOS the first tap dismisses the keyboard and does not fire onPress. App.js also `setState(await sendHostMagicLink(...))`, so a hung Render fetch left the CTA looking dead.
Impact: Preview-build signup appeared broken even when the handler was wired.
Recommended future behavior: Wrap email forms in KeyboardAvoidingView + ScrollView `keyboardShouldPersistTaps="handled"`. `setState` busy/pending before await. Timeout magic-link and oauth start (a few seconds); map 501 to `oauth-unconfigured`.
Confidence: high

### 2026-08-30 — S2 Kakao start is not S4 KakaoTalk share
Area: auth / invite share
Evidence: S2 social login uses `카카오로 시작`; S4 share stays `카카오톡`. Tests that banned any `Kakao` substring in the host broke the start buttons.
Impact: A host-wide Kakao ban treats login and share as the same product surface.
Recommended future behavior: Forbid Kakao SDK / `카카오 로그인` / `카카오톡` on S2, not the English word Kakao or `카카오로 시작`.
Confidence: high

## Domain Risk Lessons

### 2026-08-30 — Physical iPhone IPA is blocked on Apple, not on eas.json
Area: native iOS distribution
Evidence: `npx eas-cli@latest whoami` on the Linux cloud agent returned `Not logged in`; `EXPO_TOKEN` and Apple API keys were unset. LoveMe has custom native Swift/Kotlin, so Expo Go is not a substitute.
Impact: Adding `mobile/eas.json` preview/internal does not produce a TestFlight or Expo install URL. Inventing one would be false.
Recommended future behavior: Stop after a failed `eas whoami`. Do not start `eas build` or invent a `testflight.apple.com/join/` link. Checklist lives in `docs/IOS_INSTALL.md`.
Confidence: high


### 2026-08-23 — Invite latest-row ties
Area: couple invite view
Evidence: Two `issueInvite` calls in the same clock ms left `latestInvite` pointing at the first row when sort compared only `createdAt`.
Impact: Email-typo resend expired the old token but buyer home could still show the old address/share URL.
Recommended future behavior: Break invite recency ties by last-sent time, then by insertion order.
Confidence: high

### 2026-08-29 — Native cookie jar must ignore empty Set-Cookie
Area: mobile auth client
Evidence: `createAuthApi` treated an empty `getSetCookie()` array as a new cookie and cleared `ab_session` after `ack-notice`.
Impact: Session restore after splash returned a signed-out signup screen.
Recommended future behavior: Persist cookies only when a response actually includes `Set-Cookie`.
Confidence: high

## Strategy Observations

### 2026-08-23 — Magic-link delivery must fail closed
Area: auth / persistence
Evidence: Isolated review of the P0 session slice found unconditional console logging of consume URLs and `/api/dev/outbox` enabled whenever `NODE_ENV` was not production.
Impact: In any forgotten-env deployment those paths are a full account-takeover vector.
Recommended future behavior: Keep login secrets opt-in (`AB_DEV_OUTBOX=1`) and treat real mail transport as a launch prerequisite.
Confidence: high

### 2026-08-30 — Production login mail fails closed without RESEND_API_KEY
Area: auth / mail
Evidence: `POST /api/auth/magic-link` used to return `{ok:true}` with outbox off in `NODE_ENV=production`. After Resend wiring, a missing key without `allowDevOutbox` returns `{ok:false, error:"failed"}`.
Impact: Render login is a send failure until `RESEND_API_KEY` is set on the host. That is intended; do not restore fake success.
Recommended future behavior: Keep invite off Resend. Do not put the API key in the repo. Set `RESEND_API_KEY` and optional `MAIL_FROM` on the host only.
Confidence: high

## Recording rule

Add only concise, evidence-backed facts such as:

```text
### 2026-XX-XX — <lesson>
Area:
Evidence:
Impact:
Recommended future behavior:
Confidence:
```

Prefer facts that can change future Mission Packing, verification timing, or conflict prevention.

Remove/replace stale lessons when repository reality changes.
