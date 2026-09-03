---
doc_id: ai-project-context
version: 1.0.0
canonical_path: .ai/PROJECT_CONTEXT.md
updated: 2026-09-03
---

# Love Me Dialogue — Project Context

This is the **only** file in `.ai/` that is allowed to know what the project
is. Keep it a routing map: facts a run reads by name, then the shortest map
that lets a new session act.

## repository_mode

```text
repository_mode: personal
```

`.ai/REPOSITORY.md` § *Repository mode* reads this line and nothing else to
decide merge authority. One owner, one branch protected only by CI.

## Facts the checks read

```text
base_branch: stable
merge_deploys: yes
runtime_gate: node scripts/observe-site.mjs
test_command: npm test
lint_command: npm run lint
build_command: node scripts/build-site.mjs
generated: site/brand/*.woff2 + site/brand/COVERAGE.txt + site/brand/scene-*.jpg + site/brand/share-*.jpg ← every word the site prints, brand/*.jpg : python3 scripts/build-brand-assets.py; site/content-stamp.json ← page content : node scripts/stamp-content.mjs; src/tokens.css ← src/design-tokens.js : node scripts/build-tokens.mjs; src/questions-marriage-100.js ← question-packs/marriage.html : node scripts/build-marriage-100.mjs
external_scripts: pagead2.googlesyndication.com (AdSense loader) : only when SITE.adsenseClient is set; t1.kakaocdn.net (Kakao JS SDK) : only when SITE.kakaoJsKey is set, fetched when the invite panel opens
public_ids: SITE.adsenseClient, SITE.adsenseSlot, SITE.verification.google, SITE.verification.naver, SITE.kakaoJsKey — all in site/config.js; anything that authenticates lives in the host environment (docs/DEPLOY.md)
owner_ledger: docs/OWNER_ACTIONS.md
```

What the facts mean here:

- `merge_deploys: yes` — `.github/workflows/deploy-site.yml` publishes
  `site/dist/` to GitHub Pages on every push to `stable` that touches
  `site/**`, `src/**` or `scripts/build-site.mjs`. A docs-only merge does not
  deploy. **Standing approval (owner, 2026-09-03):** merge and deploy without
  asking once tests, lint and the runtime gate pass; a change to layout or
  copy still carries its screenshots in the pull request body.
- External review window: Google AdSense site review requested 2026-09-02
  (`docs/OWNER_ACTIONS.md` X7). Until the result arrives, merges are fixes and
  small content changes; a new pack or a redesign waits.
- `runtime_gate` — builds, serves `site/dist/`, and screenshots the home,
  pack, about and privacy pages at 1280 and 390 into `.observe/`. Exit 0 means
  every page answered and every screenshot was written; a person looks at
  them. Playwright is not a dependency; see the script header.
- `generated` — each artefact changes only in the same pull request as its
  source, by the listed command. `npm test` fails on a stale font subset,
  stamp or share card, and refuses a regenerated pack that differs from the
  editorial source.

## Authoritative product constraints

- The product is `lovemedialogue.com`: a static question site. Milestone 1
  (`docs/MILESTONES.md`) is the marriage 100-question pack, free, ad-supported
  — answers stay in the reader's browser, there is no server and no login.
  Milestone 2 adds server storage and login; milestone 3 the app link.
- No score, no verdict, no advice: the result sheet returns the reader's own
  choices. The invitation link carries no answers; the shared result is a
  compressed fragment (`site/share.js`, v2; v1 still decoded).
- No third-party script loads by default; the two exceptions are listed under
  `external_scripts`, each behind a configuration value, each guarded by a
  test in `test/site.test.js`.
- Operator: afterscent (Jeongsu Lim), contact `studio@afterscent.kr`, address
  and privacy-policy fields from `site/config.js` — the 문의, 소개 and
  개인정보 처리방침 pages render from them.
- The responses shown to the user are in Korean; commit messages and pull
  request bodies too.

## Current architecture

- `site/` — dependency-free ES modules rendered at build time:
  `render.js` (pages and chrome), `pages.js` (standing pages), `seo.js`
  (meta, JSON-LD, sitemap, verification tags, AdSense), `config.js` (every
  owner-settable value), `enhance.js` (answers in `localStorage`, dock,
  question map), `invite.js` (the invitation panel, app buttons),
  `share.js` (result link codec). Built by `scripts/build-site.mjs` into
  `site/dist/`; deployed by `.github/workflows/deploy-site.yml`.
- `question-packs/marriage.html` is the editorial source of the marriage
  pack; `scripts/build-marriage-100.mjs` renders it to
  `src/questions-marriage-100.js`, and the site reads that.
- `src/`, `server/`, `mobile/` — the earlier web app and Expo host for
  milestones 2–3. Not under development; their tests still run and pass.
- Tests: `node --test` under `test/` (506 on 2026-09-03), CI in
  `.github/workflows/test-build.yml`; `scripts/lint.mjs` over 129 files.
- `scripts/build-brand-assets.py` needs `fontTools`, `brotli` and `pillow`,
  which is why it is not a build step.

## Current development slice

- Milestone 1 is code-complete. Waiting on the AdSense review and the Daum
  registration review; both land in `docs/OWNER_ACTIONS.md`.
- Next: the newsletter (`docs/proposals/newsletter-ko.md` v2). D1 is decided
  — own relay + Resend; D2–D5 are open. Not started.
- Held: the pregnancy pack publication (`claude/pregnancy-100-publish`),
  pending the owner's editorial pass.

## Permanently excluded scope

- Server-side storage of answers in milestone 1 (decided against
  2026-09-01: built as a pull request, discarded the same evening).
- App integration in milestone 1.
- The Kakao SDK without a key, and any third-party script on page load.
- The device share sheet for the invitation buttons (rejected 2026-09-02;
  each button copies the link and opens its app).
- A random result address: impossible without a server; the compressed
  fragment is the design.

## Important paths

- `site/config.js` — every owner-settable value: packs, ids, tokens, operator
- `site/render.js` — page renderer, dock, question map, invitation panel
- `site/invite.js` — invitation panel behaviour (copy, open app, Kakao picker)
- `site/share.js` — result link codec (v2, v1 compat)
- `scripts/build-site.mjs` — the build; `scripts/observe-site.mjs` — the gate
- `scripts/build-brand-assets.py` — fonts, scenes, share cards
- `scripts/stamp-content.mjs` — sitemap `lastmod` from content hashes
- `test/site.test.js` — the site's tests, incl. drift guards
- `docs/OWNER_ACTIONS.md` — the owner ledger (row ids `N…`, `X…`)
- `docs/MILESTONES.md` — milestone status; cites ledger rows
- `docs/proposals/` — newsletter, SEO and service strategy proposals
- `.ai/memory/PROJECT_LESSONS.md` — hotspots and lessons for this repository
