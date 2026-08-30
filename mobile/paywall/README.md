# LoveMe paywall pack

Native iOS and Android remaining-pack gate. It reuses the web Purchase / Entitlement HTTP APIs. This folder is the only write surface for paywall copy and overlay screens.

## When it appears

After the third sample question public lock. The sample comparison stays visible. The gate sits on top.

Not before invite accept. Not on questions 1–3.

## Screens

- **Buyer** title `결혼 팩 나머지 열기`. CTA `29,000원에 나머지 열기` goes through `POST /api/purchase`. Secondary `나중에` dismisses the overlay without unlocking the rest.
- **Partner** title `상대가 팩을 열고 있어요`. No payment button. `ALIGNED` / `CLOSE` / `DISCUSS` are labels only.

## Server

```text
GET  /api/entitlement
POST /api/purchase
POST /api/purchase/webhook   { eventId, orderId }
```

One 29,000 KRW purchase grants the marriage pack to one paired workspace. The invited partner pays nothing. Webhook event IDs are unique.

## Integration

Hosts should present `PaywallPackRootView` / `PaywallPackRootScreen` (or `RemainingPackGateHost` on the existing pack root) so the overlay sits on the sample comparison. S6–S8 copy stays payment-free.

## Verify

```text
node --test mobile/paywall/test/*.test.js test/entitlement.test.js
```
