# LoveMe iOS install path (physical iPhone)

Status: **blocked on Apple Developer + Expo login.** This repository now has an EAS preview profile. It does **not** contain an IPA, a TestFlight invite, or an Expo install URL.

Bundle id: `com.beforeithappens.loveme`  
App name: LoveMe  
Source: `mobile/` on `stable` (magic-link S0–S3, S4 invite, S9 logout chrome, paywall). Do not add Kakao/social login or gift features for this path.

## Expo cannot skip Apple

EAS / Expo **cannot** produce a shareable, signed, custom-native iOS binary for a physical iPhone without an Apple Developer team and signing credentials.

Why a workaround does not exist here:

- LoveMe ships committed native projects (`mobile/ios/`, `mobile/android/`) and custom Swift/Kotlin (`LoveMeAuthApi`, host screens). **Expo Go is not an install path** for this app.
- A simulator EAS artifact (`ios.simulator: true`) cannot be installed on a real iPhone. The `preview` profile sets `simulator: false` on purpose.
- EAS cloud build still needs Apple certificates, a provisioning profile, and (for ad hoc) the phone’s UDID. There is no Mac pool and no registered user Mac on this agent, and no Expo/Apple credentials in the environment.

Do not invent a TestFlight URL. Apple or Expo generate that URL only after a signed store/internal build succeeds.

## Commands this agent already ran

From `mobile/`:

```bash
npx eas-cli@latest whoami
```

Result (2026-08-30, this Linux cloud agent): **not logged in.** `EXPO_TOKEN` is unset. No Apple API key, `.p8`, or provisioning profile is present.

Because login and Apple credentials are missing, **`eas build --platform ios --profile preview` was not started.** Starting it would only fail and would not produce an install URL.

## What 정수 must do

Do these on a machine that can complete Expo login (any OS) and Apple enrollment (Apple’s site). A Mac is required only if you choose local Xcode signing instead of EAS cloud build. EAS cloud build does **not** require a Mac after credentials exist.

### 1. Apple Developer team (required)

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/) with the account that will own LoveMe (paid membership; team id appears after enrollment completes).
2. In [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list), register App ID **com.beforeithappens.loveme** if EAS does not create it automatically.
3. In [App Store Connect](https://appstoreconnect.apple.com/), create the LoveMe app record with that bundle id when you want TestFlight. Do this after the identifier exists. Do not publish a fake store listing URL.

### 2. Expo login and project id (required)

From a clone of this repo:

```bash
cd mobile
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest build:configure
```

`build:configure` (or the first successful `eas build`) writes `expo.extra.eas.projectId` into `mobile/app.json`. **Commit the real id Expo prints.** Do not invent a UUID.

### 3. iPhone registration + Apple credentials for EAS

Let EAS manage signing:

```bash
cd mobile
npx eas-cli@latest credentials --platform ios
```

Choose the Apple team from step 1. Let EAS create the distribution certificate and the profile for `com.beforeithappens.loveme`.

**Internal / preview (ad hoc) — fastest path onto one iPhone**

```bash
cd mobile
npx eas-cli@latest device:create
```

Open the registration page on the iPhone (or enter the UDID). Rebuild after the device is on the allow-list. Only registered devices can install the preview IPA.

**TestFlight (store profile)**

Create an App Store Connect API key (Users and Access → Integrations → App Store Connect API) and store it with EAS when prompted, or sign in interactively during submit. TestFlight testers are added in App Store Connect, not in this repo.

### 4. Cloud build

Internal install URL (registered iPhones only):

```bash
cd mobile
npx eas-cli@latest build --platform ios --profile preview
```

When the build finishes, Expo shows a build page. That page’s install link is the real internal URL. Share it only after it exists.

TestFlight:

```bash
cd mobile
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```

Then in App Store Connect → TestFlight, add 정수 (or the tester Apple ID) as an Internal tester. The invite email / redeem link comes from **Apple**. It does not exist until submit succeeds.

### 5. Install on the iPhone

- **Preview:** on the registered iPhone, open the Expo build install URL, trust the developer profile if iOS asks, then launch LoveMe.
- **TestFlight:** install Apple’s TestFlight app, accept the email invite, install LoveMe from TestFlight.

## Local Mac path (optional)

If you prefer Xcode instead of EAS:

1. On a Mac: `cd mobile/ios && pod install`
2. Open `mobile/ios/LoveMe.xcodeproj`, select the Apple Developer team, confirm bundle id `com.beforeithappens.loveme`, plug in the iPhone, enable Developer Mode.
3. Run onto the device.

This still requires the same Apple Developer team. This agent has no Mac and did not do this.

## Out of scope

- Kakao login, other social login, gift features, universal links
- Invented TestFlight join links or App Store product URLs
- Changing the web “never blocked on install” rule (`docs/PRODUCT_SPEC.md`)
