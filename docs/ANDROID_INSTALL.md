# LoveMe Android install path (physical Android phone)

Status: **unblocked by Apple.** The Android path needs no Apple Developer membership, no Mac,
no Google Play developer registration and no device registration. It needs one Expo login and
one EAS Android build. No build has been run from this agent — this repository contains no APK
and no install URL.

**Scope for this round: fallback / second device.** The friend's phone is an iPhone, so the
critical path is `docs/IOS_INSTALL.md`. Use this document when an Android phone is involved — the
owner's own second phone, a second tester, or a way to exercise the whole flow end to end while
Apple enrollment is still pending. Measured purely on time-to-install, this is the cheaper path;
it simply does not apply to an iPhone.

Package: `com.beforeithappens.loveme`
App name: LoveMe
URL scheme: `loveme://`
Source: `mobile/` (committed native project in `mobile/android/`).

## Why Android skips the Apple wait

| Requirement | iOS | Android |
| --- | --- | --- |
| Paid developer program to install on one phone | **Yes** — Apple Developer Program, paid, enrollment can take days | **No** |
| Signing identity | Apple certificate + provisioning profile tied to an Apple team | Any keystore. EAS generates and stores one for you on the first Android build |
| Per-device registration before install | **Yes** — each iPhone's UDID must be registered (`eas device:create`) before an ad hoc build installs | **No** — an APK installs on any phone that allows install from the source app |
| A Mac | Only for the local Xcode route | Never |
| Store account | TestFlight requires an App Store Connect record | Play Console registration (one-time fee) is only for **Play Store publishing**, not for sideloading an APK |

Google Play developer registration is **not** part of this path. We are handing the friend an
APK file, not a store listing.

What this path does still require:

- An Expo account, logged in on the machine that runs the build. Free plan is enough to run
  EAS Build. Build quota per month and free-queue wait time depend on the current Expo plan —
  **확인 필요:** read the numbers off expo.dev/pricing and the build page rather than trusting a
  number written here.
- The Expo account must be able to act as **`jeongsulims-team`**, the `expo.owner` in
  `mobile/app.json`, because `expo.extra.eas.projectId` (`0ec4ea96-…`) belongs to that account.
  Logging in as an unrelated personal account makes the build fail on project ownership, not on
  anything in this repo. Do not "fix" that by editing `app.json` — it is a shared contract.

## What is already prepared in this repo

Checked in the working tree, not assumed:

- `mobile/app.json` → `expo.android.package = "com.beforeithappens.loveme"`, `expo.scheme = "loveme"`.
- `mobile/android/` is a full committed Gradle project (`gradlew`, `app/build.gradle`,
  `AndroidManifest.xml`, `MainActivity.kt`).
- `mobile/android/app/src/main/AndroidManifest.xml` registers the launcher intent **and** the
  `loveme` scheme:
  `<data android:scheme="loveme"/>` on an exported `VIEW` / `BROWSABLE` intent filter.
  This is what makes the mailed login link (`loveme:///auth/consume?token=…`) open the installed
  app on Android. No `applinks` / App Links are configured, which is intentional.
- `mobile/eas.json` → `preview` profile is `distribution: "internal"` with
  `android.buildType: "apk"` and profile-level `env.EXPO_PUBLIC_API_ORIGIN`.

### Why `android.buildType: "apk"` and not the default

`distribution: "store"` builds an Android App Bundle (`.aab`). An `.aab` **cannot be installed on
a phone** — it is an upload format for Play. Setting `buildType: "apk"` on the internal profile
makes EAS produce the single installable file we intend to hand over. Setting it explicitly also
removes the question of what the default is for a given EAS CLI version.

### Why the API origin matters here

`EXPO_PUBLIC_API_ORIGIN` sits at the **profile** level of `preview` in `mobile/eas.json`, not
under `ios`, so it applies to the Android build of that profile as well. `EXPO_PUBLIC_*` values
are inlined into the JS bundle **at build time** — an APK built without it talks to nothing, and
no amount of server-side configuration fixes an already-built APK. A wrong or missing origin
means a new build, not a new setting.

**확인 필요:** the `preview` profile also sets `"environment": "preview"`, which pulls EAS
server-side environment variables for that environment. If a different `EXPO_PUBLIC_API_ORIGIN`
is stored in the EAS `preview` environment, one of the two wins and this document does not assert
which. Confirm from the build log's environment section (EAS prints which variables it loaded and
from where) before shipping the APK.

## Build it

From a clone of this repo, on any OS (Linux is fine — no Mac, no Android Studio, no local Android
SDK: EAS builds in the cloud):

```bash
cd mobile
npm ci
npx eas-cli@latest login
npx eas-cli@latest whoami          # must print an account with access to jeongsulims-team
npx eas-cli@latest build --platform android --profile preview
```

First Android build only: EAS asks whether to **generate a new Android keystore**. Answer yes and
let EAS keep it. Nothing outside EAS is needed, and there is no fee.

Success looks like: the CLI prints a build page URL on `expo.dev`, the build reaches
`finished`, and the page offers an **Install** button / QR code plus a downloadable `.apk`.
The real install URL is the one that page shows. **It does not exist until the build finishes —
do not write it down, share it, or paste it into this repo in advance.**

**확인 필요 (signing):** `mobile/android/app/build.gradle` has, from `expo prebuild`, a `release`
build type whose `signingConfig` is `signingConfigs.debug` (the checked-in `app/debug.keystore`).
EAS Build applies its own managed Android credentials during a cloud build, and this document does
not claim to have observed the result on this project. It does not block the friend: an APK signed
with any key installs by sideload. It matters later, for Play Store upload and for update
continuity. Check the fingerprint with `npx eas-cli@latest credentials --platform android` and on
the build page before treating the key as the app's real upload key.

## Give it to the friend

Best to worst:

1. **Send the EAS build page link.** The friend opens it in Chrome on the Android phone and taps
   Install. This is the shortest hop and needs no file transfer. No device registration.
2. **Send the `.apk` file.** Download it from the build page, put it on Google Drive, and share
   the Drive link. Messenger apps often refuse or rename `.apk` attachments — a Drive/file link is
   the reliable form.

On the phone, Android will ask for permission to install from that app (Chrome, Drive, Files —
the permission is per source app, Android 8+): **설정 → 앱 → 특별한 앱 접근 → 알 수 없는 앱 설치**,
allow the app being used, then install. Play Protect may warn about an app from an unknown
developer — "자세히 → 무시하고 설치". That warning is expected for a sideloaded APK, and it is the
honest cost of skipping the store.

The APK does not auto-update: `expo.modules.updates.ENABLED` is `false` in the manifest. Every
change means a new build and a new install.

## Confirm it worked

In order, each step observable:

1. LoveMe appears in the app drawer and opens to the splash (`두 사람의 결혼 준비, 한곳에`).
2. The friend requests a login link. A quick "sent" answer means the app reached the API origin
   baked into the APK. An immediate network failure means `EXPO_PUBLIC_API_ORIGIN` is wrong or the
   host is asleep/down — see `docs/DEPLOY.md`.
3. The login mail arrives. **This requires a verified Resend domain on the host** — with the
   default `onboarding@resend.dev` sender, Resend returns `403` for anyone who is not the Resend
   account owner, so the friend receives nothing. See `docs/DEPLOY.md` §4.
4. Tapping the link in the mail opens LoveMe (not a browser). That proves the `loveme` scheme
   filter above is live in the installed build.
5. The friend accepts the invite and lands in the owner's workspace.

If step 4 opens a browser instead of the app, the app is not installed on that phone or the link
was opened on a different device — not a build problem.

## Out of scope

- Play Store listing, internal testing tracks, Play Console registration
- App Links / `assetlinks.json` / universal links (deliberately absent)
- Kakao or other social login for this path
- Any invented install URL, QR image, or Play Store product link
