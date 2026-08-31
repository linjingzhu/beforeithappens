# 2026-08-31 LoveMe NEXT home (login + coming-soon engine + hearts)

PR vs `stable`. Not merged. No EAS. Live preview `d3be894e` unchanged (splash→home).

## Delivered
- First-run: splash → magic-link login (iOS **system** notification permission, app name LoveMe) → `질문집`. Don't Allow still continues. No custom Korean notification body, no fake UIAlert, no `MaruBuri 🐾`.
- Login is email + `로그인 링크 보내기` only. Send is virtual (`[debug]`; no real mail). Keep-gates remain.
- Hearts start at 0. Unlock `열기` costs 10. Shop one virtual SKU 29,000 → 12 hearts.
- Coming-soon packs keep `곧 열려요` and use the marriage 3-question sample engine on **existing** questions only (임신/출산/육아/연애/가정 경영 currently have none; no invented copy). Discarded 1-question-then-list.
- Designer font lock: titles and question stems MaruBuri; body, choices, buttons, `곧 열려요` Pretendard. Sample Q header `결혼 1/3` (not 3/12). Prompt `왜 그 선택인지 한 줄로 적어주세요.` with outline heart. CTA `다음`. Do not show the font-name label `MaruBuri 🐾`.
- Partner: `상대가 열면 이어집니다.` No hearts, no shop.

## Verification
- `npm test` after this revision.
- No EAS. HTML preview at `mobile/s0-s2-s3-preview.html`.
