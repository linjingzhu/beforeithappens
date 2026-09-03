---
doc_id: ai-project-context
version: 1.1.0
canonical_path: .ai/PROJECT_CONTEXT.md
updated: 2026-09-03
---

# Love Me Dialogue — Project Context

The only file in `.ai/` that knows the project. Facts a run reads by name,
then the shortest map that lets a session act. Longer prose lives in
`docs/PROJECT_MAP.md`.

## repository_mode

```text
repository_mode: personal
```

## Facts the checks read

```text
base_branch: stable
merge_deploys: yes
runtime_gate: node scripts/observe-site.mjs
test_command: npm test
lint_command: npm run lint
build_command: node scripts/build-site.mjs
generated: site/brand/{*.woff2,COVERAGE.txt,scene-*.jpg,share-*.jpg} ← site copy, brand/*.jpg : python3 scripts/build-brand-assets.py; site/content-stamp.json : node scripts/stamp-content.mjs; src/tokens.css ← src/design-tokens.js : node scripts/build-tokens.mjs; src/questions-marriage-100.js ← question-packs/marriage.html : node scripts/build-marriage-100.mjs
external_scripts: pagead2.googlesyndication.com : only when SITE.adsenseClient is set; t1.kakaocdn.net : only when SITE.kakaoJsKey is set and the invite panel opens
public_ids: SITE.adsenseClient, SITE.adsenseSlot, SITE.verification.google, SITE.verification.naver, SITE.kakaoJsKey (site/config.js); anything that authenticates stays in the host environment
owner_ledger: docs/OWNER_ACTIONS.md
```

- `merge_deploys` — `deploy-site.yml` publishes on a push to `stable` touching
  `site/**`, `src/**` or `scripts/build-site.mjs`. Standing approval (owner,
  2026-09-03): merge and deploy without asking once tests, lint and the
  runtime gate pass; layout or copy changes carry screenshots in the PR.
- Review window: Google AdSense site review, requested 2026-09-02
  (ledger X7). Until it answers: fixes and small content changes only.

## Authoritative product constraints

- `lovemedialogue.com`, a static question site. M1 = the marriage 100-pack,
  free, ad-supported, answers only in the reader's browser; M2 server +
  login; M3 app link (`docs/MILESTONES.md`).
- No score, verdict or advice. The invite link carries no answers; the
  shared result is a compressed fragment (`site/share.js`).
- No third-party script by default; the two exceptions are in
  `external_scripts`, each behind a config value and a test.
- Operator afterscent, contact `studio@afterscent.kr`; replies, commits and
  PR bodies in Korean.

## Current architecture

`site/` renders at build time (`render.js`, `pages.js`, `seo.js`,
`config.js`, `enhance.js`, `invite.js`, `share.js`) → `scripts/build-site.mjs`
→ `site/dist/` → GitHub Pages. `question-packs/marriage.html` is the editorial
source. `src/`, `server/`, `mobile/` are M2–M3, idle; tests still run (506).

## Current development slice

M1 code-complete; waiting on AdSense and Daum reviews (ledger). Next: the
newsletter, `docs/proposals/newsletter-ko.md` (D1 decided, D2–D5 open). Held:
pregnancy pack, branch `claude/pregnancy-100-publish`.

## Permanently excluded scope

Server-side answers in M1 (2026-09-01); app integration in M1; Kakao SDK
without a key; the device share sheet for invite buttons (2026-09-02); a
random result address without a server.

## Important paths

`site/config.js` (every owner value) · `site/render.js` · `site/invite.js` ·
`test/site.test.js` (drift guards) · `docs/OWNER_ACTIONS.md` (ledger) ·
`docs/MILESTONES.md` · `.ai/memory/PROJECT_LESSONS.md` (hotspots).
