# 2026-08-23 — Public lock

## Status

COMPLETED

## Delivered

- The second submit writes an immutable `PublicLock` snapshot of the two valid submissions.
- Shared/public pack state reads that snapshot, not live answer rows.
- Private notes stay author-only and are excluded from the lock.
- A later choice change opens a new private `AnswerRound`. The previous lock is not mutated or reopened.
- Pack access still requires an accepted partner.

## Verification

- `npm run lint`
- `npm test` — 42 passed
- `npm run build`
- Live `:4173`: second submit created lock round 1; a later draft left that snapshot unchanged; both re-submits created lock round 2.

## Remaining

- Payment
- Real mail transport
