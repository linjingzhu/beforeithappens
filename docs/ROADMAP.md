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
- Expo LoveMe host: splash, login, `질문집` home, marriage pack detail, invite, hearts, sample
  engine, certificate (`mobile/src/`).
- 164 tests under `test/`, run by `.github/workflows/test-build.yml`.

Not present yet, in the order it starts to hurt:

| Gap | Evidence |
|---|---|
| One test fails on `stable` | `test/loveme-next-home.test.js:217` greps a literal that `mobile/src/screens.js:365` renders through `CERTIFICATE_COPY.body` |
| Nothing deploys | no Dockerfile / host config / deploy workflow; `scripts/server.mjs` only binds `PORT \|\| 4173` |
| Storage is one JSON file | `server/store.mjs` re-serializes whole state per mutation, no locking, single process |
| Payment is not real | `POST /api/purchase` mints the order server-side (`server/app.mjs:414`); the mobile purchase is virtual hearts |
| Webhook is unauthenticated | `grantFromPaidOrder` (`server/entitlement.mjs`) checks event id, order id and amount, but no signature or shared secret |
| iOS cannot be installed | `docs/IOS_INSTALL.md:3` — blocked on Apple Developer enrollment and `eas login` |
| Only marriage has content | `src/questions.js` holds 12 four-choice questions; `src/marriage-sample.js:24` lists every other pack as empty |
| No notification is ever sent | `mobile/src/notifications.js` requests the iOS permission and nothing publishes |
| Reports and audit are documented only | `ReportSnapshot` / `AuditEvent` appear in `docs/DATA_MODEL.md` with zero occurrences in code |
| Social login is a stub | `server/oauth.mjs` builds authorize URLs; token exchange is not implemented |

## Sequence

```text
M0 green CI
  └─ M1 deployable service
       └─ M2 durable storage
            └─ M3 two-device loop proof
                 └─ M4 real payment        ← revenue unblocked
M5 iOS distribution        (parallel from M0; gated on an Apple account, not on code)
M6 content beyond marriage (after M4)
M7 partner notifications   (needs M5 + M2)
M8 reports and audit
M9 social login            (deferred)
```

---

## M0 — Green CI

**Goal** The build gate tells the truth again.

`test/loveme-next-home.test.js:217` asserts the certificate body literal in the Swift, Kotlin and
Expo sources. Swift and Kotlin carry the literal; the Expo screen renders the shared constant
instead, which is the better structure. The same test already asserts the stamp through
`CERTIFICATE_COPY.stamp`, so assert the body the same way.

**Exit gate** `npm run lint && npm test && npm run build` clean.

**Cost** Under an hour. No dependencies.

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

The invite → both answer → reveal → agree path is covered by tests and has never run across two
real phones against a deployed server.

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
