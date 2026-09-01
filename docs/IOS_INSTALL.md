# LoveMe iOS install path (physical iPhone)

Status: **blocked on Apple Developer + Expo login.** This repository has an EAS `preview` profile
and committed native projects. It does **not** contain an IPA, a TestFlight invite, or an Expo
install URL, and no build has been run from this agent.

The friend's phone for this round is an **iPhone**, so this document is the critical path.
`docs/ANDROID_INSTALL.md` is the fallback for a second, Android device — that path needs no Apple
account at all, but it does not help an iPhone.

Bundle id: `com.beforeithappens.loveme`
App name: LoveMe
URL scheme: `loveme://`
Source: `mobile/` (committed `mobile/ios/`, custom Swift such as `LoveMeAuthApi` and host screens).

Server-side Kakao login is owned by other packs; it changes **how the friend signs in**, not how
the app gets onto the phone. Nothing in this document is affected by it.

## Expo cannot skip Apple

EAS / Expo **cannot** produce a shareable, signed, custom-native iOS binary for a physical iPhone
without an Apple Developer team and signing credentials. There is no configuration in this repo
that removes that requirement.

Why the usual workarounds do not apply here:

- LoveMe ships committed native projects (`mobile/ios/`, `mobile/android/`) and custom Swift/Kotlin.
  **Expo Go is not an install path** for this app.
- A simulator EAS artifact (`ios.simulator: true`) cannot be installed on a real iPhone. The
  `preview` profile sets `simulator: false` on purpose.
- The **free Apple ID "personal team"** route (Xcode signs with a free account) requires a Mac with
  Xcode and the iPhone paired to that Mac, and the resulting profile **expires after 7 days**. It
  cannot be sent to a friend who is not physically at the Mac. It is not a remote install path.
- EAS cloud build still needs an Apple team, a distribution certificate and a provisioning profile.

Do not invent a TestFlight URL or an install URL. Apple and Expo generate those only after a
signed build succeeds.

## Commands this agent already ran

From `mobile/`:

```bash
npx eas-cli@latest whoami
```

Result (this Linux cloud agent): **not logged in.** `EXPO_TOKEN` is unset. No Apple API key, `.p8`,
or provisioning profile is present. Outbound HTTPS from this container is also denied by egress
policy, so nothing could be started even with credentials.

Because login and Apple credentials are missing, **`eas build --platform ios --profile preview` was
not started.** Starting it would only fail and would not produce an install URL.

## Which route is faster for exactly one friend

Two routes exist once the paid membership is active. For **one** iPhone, **ad hoc (EAS internal
distribution) is the faster route.**

| | Ad hoc / EAS internal distribution | TestFlight (internal testers) |
| --- | --- | --- |
| Paid Apple membership | Required | Required |
| App Store Connect **app record** | Not needed | **Needed** (create the app with the bundle id) |
| Apple-side review | **None** | None for *internal* testers. *External* testers need Beta App Review |
| Apple-side processing after upload | None | Build must finish processing after `eas submit` — usually minutes, sometimes longer |
| What you need **from the friend** | Their iPhone's **UDID**, collected by them opening a registration link | Their **Apple ID email**, plus they must accept an App Store Connect invitation, then install Apple's TestFlight app |
| Round-trips through the friend | 1 (register device) + install | 2 (accept team invite, then TestFlight invite) + install TestFlight + install app |
| Rebuild needed after adding a person/device | Yes — a new device needs a new build | No — new testers install the existing build |
| Scaling limit | 100 devices per product family per membership year, freed only at renewal | 100 internal testers, no per-device registration |
| Expiry | Provisioning profile lifetime (about a year) | 90 days per build |

Choose **ad hoc** now: one friend, one device, no app record, no processing wait, and the friend
never has to give you an Apple ID. Switch to TestFlight when there is more than a handful of
testers, when collecting UDIDs becomes awkward, or when heading toward the store anyway.

## Step by step, with what each step costs in time

Timings are approximations from Apple's and Expo's normal behaviour, not guarantees.
**확인 필요:** the exact enrollment approval time and the EAS free-plan queue length can only be
read off Apple's enrollment status page and the Expo build page on the day.

### 1. Apple Developer Program enrollment — the real gate (hours to ~2 days)

1. Enroll at <https://developer.apple.com/programs/> with the Apple ID that will own LoveMe.
   Paid annual membership; a credit card is required. The Apple ID must have two-factor
   authentication enabled.
2. Choose **Individual**, not Organization, unless there is a real company reason. Organization
   enrollment additionally requires a **D-U-N-S number** and a legal-entity check, which takes
   substantially longer — days to weeks. Individual enrollment skips both.
3. Enrolling from the **Apple Developer app on an iPhone** lets Apple verify identity with a photo
   ID in-app and is usually the quicker of the two forms.
4. Wait for Apple's approval mail. Apple commonly approves within a day; Apple's own wording allows
   up to 48 hours, and longer if it asks for more identity verification.

**Nothing downstream can start before this clears.** No Mac is involved in this step.

Success check: <https://developer.apple.com/account> shows an active membership and a Team ID.

### 2. Expo login (5 minutes)

From a clone of this repo, on any OS — Linux and Windows are fine:

```bash
cd mobile
npm ci
npx eas-cli@latest login
npx eas-cli@latest whoami
```

`whoami` must print an account that can act as **`jeongsulims-team`** — that is `expo.owner` in
`mobile/app.json`, and `expo.extra.eas.projectId` belongs to it. Logging in as an unrelated
personal account fails on project ownership. Do not edit `app.json` to work around it; it is a
shared contract other packs read.

`mobile/app.json` already carries a project id, so `eas build:configure` is not needed. If EAS ever
prints a *different* id, commit the one Expo prints — never invent a UUID.

Success check: `whoami` prints the account, and `npx eas-cli@latest project:info` resolves the
project without error.

### 3. Apple credentials in EAS (10 minutes, no Mac)

```bash
cd mobile
npx eas-cli@latest credentials --platform ios
```

Sign in with the Apple ID from step 1 (2FA code, or an app-specific password if asked), pick the
team, and let EAS create the **distribution certificate** and the **ad hoc provisioning profile**
for `com.beforeithappens.loveme`. EAS registers the App ID with Apple if it does not exist.

**A Mac is not required.** eas-cli talks to Apple's developer API over HTTPS and EAS builds on
macOS machines in its cloud. A Mac is only needed for the optional local Xcode route at the bottom
of this document, or to read a UDID off a cabled iPhone.

Success check: `npx eas-cli@latest credentials --platform ios` lists a distribution certificate and
a provisioning profile for the bundle id.

### 4. Register the friend's iPhone (10 minutes, needs the friend once)

Ad hoc builds install **only** on devices registered with Apple **before the build runs**.

```bash
cd mobile
npx eas-cli@latest device:create
```

Choose the **website / QR** option. EAS prints a registration URL and a QR code.

- Send that URL to the friend. **They must open it in Safari on the iPhone itself** — not Chrome,
  not an in-app browser (KakaoTalk's built-in browser will not install a configuration profile).
- iOS downloads a configuration profile. The friend then opens
  **설정 → 일반 → VPN 및 기기 관리 → 다운로드된 프로파일 → 설치** and enters the passcode.
- The device's UDID is sent to Apple through EAS.

What you need from the friend is only the **UDID**, and this flow collects it for them. You do
**not** need their Apple ID for the ad hoc route. If they would rather read the UDID off a Mac:
Finder → connected iPhone → click the device details line until the UDID shows → copy it, then
`npx eas-cli@latest device:create` and choose the manual-entry option. Do not use random
"find my UDID" websites.

Success check: `npx eas-cli@latest device:list` shows the new device. If it does not appear, the
profile was not installed on the phone.

**Order matters:** register the device *before* step 5. A device added after a build is not in that
build's provisioning profile, and the app will refuse to install until a **new** build is made.

### 5. Cloud build (roughly 15–45 minutes including queue)

```bash
cd mobile
npx eas-cli@latest build --platform ios --profile preview
```

The `preview` profile is `distribution: "internal"`, `ios.simulator: false`, and carries
`EXPO_PUBLIC_API_ORIGIN` at the profile level, which is what tells the built app which server to
call. `EXPO_PUBLIC_*` values are inlined **at build time** — a wrong origin means a new build, not
a new setting.

When the build finishes, Expo shows a build page with an **Install** button and a QR code. That
page's link is the real internal install URL. **It does not exist until the build succeeds. Share
it only after it exists, and do not write it into this repo in advance.**

Free-plan builds sit in a shared queue; the wait varies and is visible on the build page.

Success check: build state `finished` on expo.dev, and the page offers an install link.

### 6. Install on the friend's iPhone (5 minutes)

- The friend opens the build page link **in Safari on the registered iPhone** and taps Install.
- If iOS asks to trust the developer:
  **설정 → 일반 → VPN 및 기기 관리 → 개발자 앱 → 신뢰**.
- Launch LoveMe.

Success check, in order:

1. LoveMe opens to the splash (`두 사람의 결혼 준비, 한곳에`).
2. The friend signs in with Kakao (or a login link) and gets a real answer, not an instant network
   error — that proves the app reached `EXPO_PUBLIC_API_ORIGIN`.
3. The friend opens the owner's invite link and lands in the owner's workspace.

If the install fails with "unable to install", the device was not in the build's provisioning
profile: register it (step 4) and rebuild.

## TestFlight, if you choose it instead

Slower for one person, better past a handful. It needs everything above through step 3, plus:

```bash
cd mobile
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest submit --platform ios --latest
```

Before submitting, create the LoveMe app record in App Store Connect with bundle id
`com.beforeithappens.loveme`. For `eas submit`, create an App Store Connect API key
(Users and Access → Integrations) and let EAS store it, or sign in interactively.

After the upload, the build must finish **processing** in App Store Connect, and you must answer
the **export compliance** question for the build. Then, in App Store Connect → TestFlight, add the
friend as an **Internal tester** — internal testers need to be users on your App Store Connect
team, so they receive a team invitation by mail first, then a TestFlight invitation. They install
Apple's **TestFlight** app and install LoveMe from it. Internal testing does **not** go through
Beta App Review; external testing does.

The invite mail and redeem link come from **Apple**. They do not exist until submit and processing
succeed, and no such URL belongs in this repo.

## Local Mac path (optional, not required)

If you prefer Xcode over EAS:

1. On a Mac: `cd mobile/ios && pod install`
2. Open `mobile/ios/LoveMe.xcodeproj`, select the Apple Developer team, confirm bundle id
   `com.beforeithappens.loveme`, plug in the iPhone, enable Developer Mode.
3. Run onto the device.

This needs the same paid Apple team for anything shareable, and the phone must be physically at the
Mac. This agent has no Mac and did not do this.

## While Apple enrollment is pending

The web app is served by the same host as the API (`server/app.mjs` serves `index.html`), and the
product rule in `docs/PRODUCT_SPEC.md` is that the web path is never blocked on install. That is a
stopgap for trying the flow, not a substitute for the round's goal — the mailed login link is the
`loveme://` app scheme unless `AB_WEB_CONSUME_FALLBACK=1` is set on the host
(see `docs/DEPLOY.md`).

## Out of scope

- Gift features, universal links, App Links
- Invented TestFlight join links, install URLs, or App Store product URLs
- Changing the web "never blocked on install" rule (`docs/PRODUCT_SPEC.md`)
- Server-side social login configuration (owned by other packs; host variables are listed in
  `docs/DEPLOY.md`)
