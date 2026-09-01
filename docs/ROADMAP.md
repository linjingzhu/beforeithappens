# LoveMe / AB Roadmap

This roadmap is evidence-based. Every "current state" claim below points at a file in this
repository. It sequences the work between today's slice and a product that can take money and
keep two people in a conversation loop.

It is a routing document, not a product contract. `docs/PRODUCT_SPEC.md` stays the contract;
where this file and the spec disagree, the spec wins.

## Where the product stands

Working today, with tests:

- Magic-link identity, one session per user, forced logout (`server/auth.mjs`).
- Couple workspace, email-bound single-use 7-day invite, in-app pair code (`server/workspace.mjs`).
- Answer rounds, author-only drafts and private notes, agree/hold, immutable public lock
  (`server/answers.mjs`).
- Entitlement bookkeeping for one 29,000 KRW purchase with webhook idempotency
  (`server/entitlement.mjs`).
- Expo LoveMe host: splash, login, `질문집` home, invite, a solo sample engine, and — once the
  server confirms a partner — the real two-person pack (`mobile/pack/`), driven end to end
  against a live server: ghost workspace locked, private drafts, reveal only after both
  submit, agreement and hold. Virtual mail, a simulated partner and virtual hearts are now
  opt-in (`EXPO_PUBLIC_LOVEME_VIRTUAL=1`) and never on in a store build.
- 164 tests under `test/`, run by `.github/workflows/test-build.yml`.

Not present yet, in the order it starts to hurt:

| Gap | Evidence |
|---|---|
| The deployed host is undocumented here | the API runs at the origin `mobile/eas.json` points the preview build at, and `.ai/memory/PROJECT_LESSONS.md` records its live behaviour, but nothing in this document said so |
| Storage is one JSON file | `server/store.mjs` re-serializes whole state per mutation, no locking, single process |
| Payment is not real | `POST /api/purchase` mints the order server-side (`server/app.mjs:414`); the mobile purchase is virtual hearts |
| Webhook is unauthenticated | `grantFromPaidOrder` (`server/entitlement.mjs`) checks event id, order id and amount, but no signature or shared secret |
| iOS cannot be installed | `docs/IOS_INSTALL.md:3` — blocked on Apple Developer enrollment and `eas login` |
| Only marriage has content | `src/questions.js` holds 12 four-choice questions; `src/marriage-sample.js:24` lists every other pack as empty |
| No notification is ever sent | `mobile/src/notifications.js` requests the iOS permission and nothing publishes |
| Reports and audit are documented only | `ReportSnapshot` / `AuditEvent` appear in `docs/DATA_MODEL.md` with zero occurrences in code |
| The spec locks screens that exist nowhere | `PackDetailScreen` (`mobile/src/screens.js:185`) and `TasteResultScreen` (`:277`) are stubs `resolveNativeScreen` never routes to; the 임시 체험 path was deliberately discarded (`src/marriage-sample.js:113`) without updating `docs/PRODUCT_SPEC.md`, so two locked gates now contradict each other |
| The paid boundary is misdocumented | `SAMPLE_LOCK_COUNT = 3` (`server/answers.mjs:6`) means 29,000 KRW unlocks 9 of 12 questions, but `marriagePack.freeQuestionCount` is `12` (`src/questions.js:2`) and is dead at runtime — referenced only by `test/questions.test.js:30` |
| Social login is a stub | `server/oauth.mjs` builds authorize URLs; token exchange is not implemented |

## Sequence

```text
M0 green CI                (done)
  └─ M1 deployable service   (groundwork done; host not chosen)
       └─ M2 durable storage
            └─ M3 two-device loop proof   (app loop built and driven against a live server)
                 └─ M4 real payment        ← revenue unblocked
M5 iOS distribution        (parallel from M0; gated on an Apple account, not on code)
M6 content beyond marriage (after M4)
M7 partner notifications   (needs M5 + M2)
M8 reports and audit
M9 social login            (built; waiting on provider credentials)
M10 account deletion       (in progress; one product decision open)
```

## Status

| # | Milestone | Status | What it waits on |
|---|---|---|---|
| M0 | Green CI | **Done** | — |
| M1 | A service that runs somewhere | **Done in code.** A host already runs the API (`mobile/eas.json`). Added `AB_STORE_PATH`, `GET /healthz`, an opt-in https login link, distinct mail-failure codes, and an outbox that refuses on a production-looking host so a missing key can no longer report a mail it never sent. `docs/DEPLOY.md` is the operator's page | Host env only: `RESEND_API_KEY`, a verified `MAIL_FROM` domain, `AB_PUBLIC_ORIGIN`, `AB_DEV_OUTBOX` unset |
| M2 | Durable storage | **Done.** SQLite on Node's built-in driver, zero new dependencies. Uniqueness enforced by the database, the lost-update window closed inside a transaction, an existing JSON store migrated once with conflicting rows parked rather than dropped | — |
| M3 | Prove the loop on two devices | The app runs the real loop and its controller was driven end to end against a live server; two real phones still unproven | M1's host env and M5 |
| M4 | Payment that actually charges | Not started | A decision: StoreKit IAP on iOS, or keep the paid unlock off iOS |
| M5 | iOS distribution | Blocked outside the repo | Apple Developer enrolment and `eas login` |
| M6 | Content beyond marriage | Draft only (`docs/proposals/pack-home-mgmt.md`), deliberately not registered | A pack registry, real comparison rules, and a pack-scoped entitlement — a second pack cannot ship without them |
| M7 | Tell the partner it is their turn | Not started; nothing is ever sent | M5 |
| M8 | Reports and audit | **Done.** The report's query window throws on private notes rather than trusting the caller, and audit now records login, forced logout, invite issue and accept, entitlement grant and account deletion — with no email, token or resolvable id in any row | Nothing reads the log yet: there is deliberately no audit HTTP route |
| M9 | Social login | Token exchange, profile read and a signed callback state, verified over HTTP against a stubbed provider | Client ids and secrets; see `docs/SOCIAL_LOGIN.md` |
| M10 | Account deletion | **Done** across server, web and native, including report snapshots, which outlived deletion until this session | Decisions: grace period, and whether a survivor may read the archived record |
| — | Privacy | Analysis and a Korean policy draft (`docs/PRIVACY.md`, `docs/proposals/privacy-policy-ko.md`) | **Store blockers**: no policy URL, no in-app link, no consent step, no age gate, no 보호책임자. 39 placeholders for the owner |
| — | Design system | **Done.** One token source for both surfaces, adapting to width and to aspect ratio; no hardcoded size left in the native screens, no palette of its own left in the web sheets, and a drift test that fails when the generated CSS and the module disagree | — |

---

## M0 — Green CI — **DONE**

**Goal** The build gate tells the truth again.

The certificate test asserted the body literal in the Swift, Kotlin and Expo sources. Swift and
Kotlin carry the literal; the Expo screen renders the shared constant instead, which is the better
structure, so the assertion failed on correct code. It now pins `CERTIFICATE_COPY.body` and `.cta`
to their Korean strings and checks that the Expo screen references those constants — the same shape
the stamp assertion already used — while Swift and Kotlin keep their literal checks.

**Exit gate met** `npm run lint && npm test && npm run build` clean; 164/164.

## M1 — A service that runs somewhere

**Goal** A real person can receive a real magic link at a real origin.

Today the application only runs on a developer machine. Resend delivery (`server/mail.mjs`) needs
`RESEND_API_KEY`; the file store needs a path that survives a restart; the magic link needs a
stable origin, because consume redirects into the `loveme` app scheme.

**Work** Choose a host. Add the start path and health endpoint. Configure `RESEND_API_KEY` and the
store path as environment, never as committed values. Confirm the consume hop
(`server/mail.mjs` `consumeHopHtml`) works from a phone's mail client.

**Exit gate** A magic link mailed to a real inbox opens a session on the deployed origin, and the
session survives a process restart.

## M2 — Durable storage

**Goal** Two people writing at the same moment cannot lose each other's answer.

`server/store.mjs` rewrites the entire state file on every mutation with a synchronous write, and
holds no lock. That is correct for tests and fatal for two concurrent submits — which is exactly
the moment the product is designed around.

**Work** Move persistence behind the same `snapshot` / `mutate` shape so callers do not change.
SQLite is enough for a single node and is the smaller diff; Postgres is the answer only if more
than one instance will ever run. Push the uniqueness rules `docs/DATA_MODEL.md` already states
down into the database: `User.email`, invitation token, `Purchase.orderId`, webhook `eventId`, and
`(workspaceId, questionId, roundNumber, userId)`.

**Exit gate** A concurrent double-submit test reveals exactly once; a restart preserves state;
duplicate keys are rejected by the database, not only by application code.

## M3 — Prove the loop on two devices

**Goal** The product's one irreplaceable moment works outside the test runner.

The invite → both answer → reveal → agree path now runs on web and in the Expo app, and the
app's own controller has been driven end to end against a live server. What is still unproven
is two real phones against a deployed origin, which needs M1 and M5.

**Work** Buyer and partner on separate devices: invite, accept, answer all 12, reveal, agree and
hold, re-answer to open a new round, confirm the earlier lock is untouched. Fix what breaks; do
not widen scope while fixing.

**Exit gate** A recorded two-device pass on the deployed origin, and a note in
`.ai/reports/` describing what broke.

## M4 — Payment that actually charges

**Goal** The 29,000 KRW unlock is real money and cannot be forged.

Two things are missing, and they are different problems. The purchase side has no payment
gateway — `POST /api/purchase` simply records an order. The grant side has no authentication:
`grantFromPaidOrder` accepts any caller that presents a known order id and the right amount. Order
ids are generated values rather than public ones, so this is not an open door today, but it must
not meet a real gateway in this shape.

**Owner decision required.** Apple requires in-app purchase for digital content consumed in the
app. Either ship StoreKit IAP with server-side receipt validation for iOS while a domestic gateway
(토스페이먼츠 or 포트원) handles web, or keep the paid unlock off the iOS surface entirely. This
decision changes the shape of the milestone, so it is worth settling before the work starts.

**Work** A gateway adapter behind the existing entitlement API. Webhook signature verification.
Explicit failed, cancelled and refunded states. Every locked rule holds: one purchase, partner
free, a ghost workspace can neither unlock nor pay.

**Exit gate** A sandbox payment grants the entitlement exactly once; a replayed webhook is a
no-op; a forged webhook is rejected; a refund revokes access.

## M5 — iOS distribution

**Goal** LoveMe installs on a real iPhone.

`docs/IOS_INSTALL.md` already documents this precisely: EAS cannot produce a signed installable
build without an Apple Developer team. No amount of repository work removes that.

**Owner action** Enroll in the Apple Developer Program, register bundle id
`com.beforeithappens.loveme`, create the App Store Connect record, run `eas login` and store
credentials.

**Exit gate** A TestFlight internal build installs and opens on the owner's iPhone.

**Note** Independent of M1–M4; start the enrollment early because it has a waiting period.

## M6 — Content beyond marriage

**Goal** More than one pack is worth paying for.

`src/marriage-sample.js:24` records that `연애`, `가정 경영`, `임신`, `출산`, `육아` have no
questions, and the sample engine deliberately refuses to invent copy for them. So every
`곧 열려요` pack is a shell by design, and no amount of engineering changes that — this milestone
is writing, reviewed against the comparison rules, not code.

**Work** Author one pack at a time in the `marriagePack` shape: sections, four choices, `intent`,
`example`, `whyItMatters`, and an explicit comparison rule per choice pair. Expanding the marriage
pack past 12 questions is the cheapest first move, because it deepens a pack people already paid
for.

**Exit gate** A new pack loads through the existing engine with no code change beyond content and
registration.

## M7 — Tell the partner it is their turn

**Goal** The loop stops stalling on silence.

`mobile/src/notifications.js` asks for the iOS permission and nothing ever sends. Every waiting
state in this product — invite sent, partner submitted, round revealed — is invisible until
someone reopens the app.

**Work** Register push tokens against the user session. Send on invite accepted, partner
submitted, and round revealed. Nothing else; this product does not nag.

**Exit gate** A submit on device A raises a notification on device B.

## M8 — Reports and audit

**Goal** The privacy promise is enforced by structure, not by discipline.

`ReportSnapshot` and `AuditEvent` are specified in `docs/DATA_MODEL.md` and do not exist in code.
The private-note boundary currently holds because every query author remembered it.

**Work** Report snapshots per pack version containing shared content only, with private notes
excluded by the query path rather than by the view. Audit events for login, forced logout, invite
lifecycle and entitlement grant.

**Exit gate** A test that joins a report query against private notes fails by construction.

## M9 — Social login (deferred)

`server/oauth.mjs` produces authorize URLs and stops; token exchange is unimplemented and
`/api/dev/oauth/complete` is development-only. `.ai/PROJECT_CONTEXT.md` already marks this pack as
not shippable.

Keep it deferred. Email remains the source of truth for invite matching either way, so Kakao and
Naver add a login path without removing the email one. Revisit only if magic-link drop-off proves
it necessary.

---

## Decisions this roadmap is waiting on

1. **iOS payment** — StoreKit IAP, or keep the paid unlock off iOS. Shapes M4.
2. **Database** — SQLite single node, or Postgres. Shapes M2.
3. **Apple enrollment timing** — has a lead time; gates M5 and therefore M7.
4. **Next pack** — deeper marriage, or the first new pack. Shapes M6.

## Guardrails

No milestone may break these. They are product law from `docs/PRODUCT_SPEC.md`:

- A workspace without an accepted partner never unlocks a pack and never pays.
- Comparison stays `같음` / `가까움` / `이야기해요`. No scores, diagnoses, probabilities, faces or
  graphs.
- Private notes never enter partner APIs, reports, exports or admin tooling.
- A public lock is immutable. A later change opens a new round.
- Coming-soon packs never sell and never send invite links.
- Do not invent copy for a pack that has no questions.
- Locked Korean copy changes only when the spec changes first.

## Maintenance

Update this file when a milestone's exit gate is met or a decision above is settled. Record what
was actually delivered in `.ai/reports/`, not here. Keep the evidence column pointing at real
paths; a claim without a path does not belong in this document.
