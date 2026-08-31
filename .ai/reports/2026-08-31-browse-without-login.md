# 2026-08-31 — Splash then home; login only at keep-gates

## Result

First-run LoveMe iOS preview is splash (1.2s) → `질문집` home. Magic-link login is a keep-gate, not the first screen.

## Routing

- Logged-out splash fail-open: `pack-list`
- Browse without login: marriage pack detail (3 samples + caption + `링크 보내기` visible), coming-soon taste (1q + `같음`/`가까움`/`이야기해요` + `목록으로`)
- Login required: `링크 보내기`, in-app `연결하기`, 결제 hook (`requireLoginForPay`, no paywall screen), `계정`
- After consume: notice (when present) then `pendingGate` destination, not a generic home reset
- Logout: `질문집` home

## Kept from #29

- `AUTH_FETCH_MS` 55s
- No red `실패` banner while send is in flight
- Login does not render `두 사람의 결혼 준비, 한곳에`

## Verification

- `npm test` pass
- `npm run lint` pass
- `npm run build` pass
- No physical iOS / EAS preview in this environment
