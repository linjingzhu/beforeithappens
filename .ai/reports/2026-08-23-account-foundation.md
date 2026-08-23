# Account foundation slice

## Scope

- Overlay locked product gates onto PRODUCT_SPEC, DATA_MODEL, and UX_CONTRACT.
- Add a real User session via 10-minute email magic links.
- Show exact onboarding, sent, and post-login Korean copy.
- Keep buyer home invite-waiting with no pack CTA.
- Support forced logout for later device handoff.
- Leave invite, rounds, public lock, and payment to later packs.

## Product boundaries

- Local two-role simulation is no longer the product auth path.
- Device-local drafts are not migrated.
- Pack access requires an accepted partner; ghost workspaces stay locked.
- Magic-link URLs are not logged or exposed unless `AB_DEV_OUTBOX=1` in non-production.

## Verification

- Lint: passed
- Tests: 28 passed
- Static build: passed
- HTTP flow: request, GET prefetch does not consume, POST consume, notice, force logout
- Runtime screenshots: onboarding, sent, notice, invite-waiting, logout
- Isolated review: PASS after fail-closed outbox fix

## Remaining risk

- No production email transport yet.
- Invite accept is not implemented; pack remains closed for every current session.
