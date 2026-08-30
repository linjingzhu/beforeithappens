# 2026-08-30 — Resend login magic-link mail

## Result

Production magic-link and email-bind now send transactional mail through Resend when `RESEND_API_KEY` is set. Invite stays a share URL.

## Change

- Added `server/mail.mjs` (`fetch` POST to `https://api.resend.com/emails`, no new npm dependency).
- `POST /api/auth/magic-link` and `/api/auth/email-bind` deliver `/auth/consume?token=...` with locked Korean copy.
- Missing key: outbox still works when `allowDevOutbox`; otherwise `{ok:false, error:"failed"}`.
- Resend non-2xx does not return `{ok:true}`.
- Invite does not call Resend.

## Verification

- `npm test`: 137 pass (then MAIL_FROM unit test added)
- `npm run lint`: pass
- `npm run build`: pass
- Adversarial review: PASS (minor only)

## Host env (not in repo)

- `RESEND_API_KEY` required in production
- optional `MAIL_FROM` (default `LoveMe <onboarding@resend.dev>`)
- existing `AB_PUBLIC_ORIGIN` for absolute consume URLs
