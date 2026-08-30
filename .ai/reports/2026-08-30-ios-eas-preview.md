# 2026-08-30 — LoveMe iOS EAS preview path

## Result

ACTION_REQUIRED. `mobile/eas.json` preview/internal is on the branch. No IPA and no TestFlight/Expo install URL exist.

## Evidence

- `npx eas-cli@latest whoami` (from `mobile/`, 2026-08-30): `Not logged in`
- `EXPO_TOKEN` unset; no Apple API key / `.p8` / provisioning profile on the agent
- `eas build --platform ios --profile preview` was not started
- `npm test` 113 pass; `npm run lint`; `npm run build`

## Why Expo cannot skip Apple

LoveMe is a custom-native Expo app (`mobile/ios/`, Swift/Kotlin hosts). Expo Go is not an install path. EAS cannot sign a device IPA without an Apple Developer team.

## Next owner action

정수 follows `docs/IOS_INSTALL.md`: Apple Developer team → `eas login` → credentials / device UDID → `eas build --platform ios --profile preview` (or production + `eas submit` for TestFlight).
