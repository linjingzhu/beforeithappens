# LoveMe host app

This is the installable iOS and Android app (Expo / React Native). It is not a wrapper folder.

- Open iOS: `ios/LoveMe.xcodeproj` (run `pod install` on a Mac first)
- Open Android: `android/` in Android Studio, or `npm run android`
- Shared JS UI: `App.js` + `src/`
- Other packs mount under `mobile/<pack>/` (for example `mobile/s9/`). The host imports them. Do not copy pack UI into `src/`.

This folder owns the **installable host** plus **S0 splash** and **S2–S3** magic-link / workspace screens. The S1 install landing (`/install`, App Store / Google Play, `지금은 웹에서 시작할래요.`) stays on the web. Do not add it here.

S9 logout chrome (`로그아웃 후 이 기기를 넘겨주세요.`) is owned by `mobile/s9/`. `src/s9-mount.js` attaches it beside an existing logout control when that pack is present and the user is logged in. Splash and signup do not show it.

## Screens in this slice

1. **S0 splash** — no buttons, 1.2 seconds. Wordmark `LoveMe`. Copy `두 사람의 결혼 준비, 한곳에`.
2. **S2 signup** — magic-link email form plus Kakao/Naver/Google start. Missing-email social accounts must connect email before invite accept.
3. **S3 workspace** — `워크스페이스가 만들어졌어요.` with `파트너 초대하기` after the login notice. No pack CTA.

S4 share stays `카카오톡`. No payment, universal links, or pack CTA.

## Run

From `mobile/`:

```bash
npm ci
```

### Expo web (Linux / this VM)

```bash
npm run web
```

Opens the shared UI in a browser. Confirm splash (1.2s) then `질문집` home. Login opens only from `링크 보내기`, pair connect, or `계정`.

### Android

```bash
npm run android
```

Or open `android/` in Android Studio. Package: `com.beforeithappens.loveme`.

Requires a local Android SDK. This Linux VM may not have one; Expo web is the fallback check.

### iOS on a physical iPhone (EAS preview)

There is no IPA or TestFlight URL in this repo. Expo cannot sign a custom-native iOS binary without an Apple Developer team.

From `mobile/` after `eas login` and Apple credentials exist:

```bash
npx eas-cli@latest whoami
npx eas-cli@latest build --platform ios --profile preview
```

`eas.json` `preview` is internal / ad hoc (`simulator: false`, bundle id `com.beforeithappens.loveme`). `production` is the store profile for later TestFlight (`eas submit`). Full checklist: `docs/IOS_INSTALL.md`.

### iOS (macOS / local Xcode)

```bash
cd ios && pod install && cd ..
npm run ios
```

Or open `ios/LoveMe.xcodeproj` in Xcode. CocoaPods was skipped on Linux; run `pod install` on a Mac before the first device/simulator build.

### Regenerate native projects

```bash
npx expo prebuild --platform all
```

Committed `ios/` and `android/` are the project targets. Re-run prebuild only when Expo config changes.
