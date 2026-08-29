# LoveMe native app

Same product as the mobile-first web app in this repository. Shared UI for iOS and Android via Expo.

This folder owns **S0 splash** and the logged-out handoff into **S2 signup**. The S1 install landing (`/install`, App Store / Google Play, `지금은 웹에서 시작할래요.`) stays on the web. Do not add it here.

## Screens in this slice

1. **S0 splash** — no buttons, 1.2 seconds. Wordmark `LoveMe`. Copy `두 사람의 결혼 준비, 한곳에`.
2. **Logged-out next** — `afterSplashScreen()` returns `signup`. S2–S3 owns the magic-link form. Until that PR lands, splash opens a signup placeholder (S2 body copy, no send CTA, not empty home, not the web install landing).

No Kakao, payment, universal links, or pack CTA.

## Run

From `mobile/`:

```bash
npm ci
```

### Expo web (Linux / this VM)

```bash
npm run web
```

Opens the shared UI in a browser. Confirm splash (1.2s) then the signup placeholder.

### Android

```bash
npm run android
```

Or open `android/` in Android Studio. Package: `com.beforeithappens.loveme`.

Requires a local Android SDK. This Linux VM may not have one; Expo web is the fallback check.

### iOS (macOS)

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
