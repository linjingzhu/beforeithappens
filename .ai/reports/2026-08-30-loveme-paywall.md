# 2026-08-30 — LoveMe paywall pack

## Delivered

- `mobile/paywall/` buyer and partner overlays after the third sample public lock.
- Server `Purchase` / `Entitlement` with one 29,000 KRW grant and webhook-idempotent events.
- Remaining questions stay locked until buyer entitlement. Partner cannot pay.
- 「나중에」 dismisses the overlay without unlocking.

## Verification

- `npm test` — 112 passed
- `npm run lint` — passed
- `npm run build` — passed
- Native iOS/Android compile: not run on this Linux VM
- Review: same-family fallback; fixed native unlock sync and Android root mount
