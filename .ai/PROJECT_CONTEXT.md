# Project Context

Keep this file compact. It is a routing map, not full documentation.

## Repository

repository_mode: personal
base_branch: stable
primary_platform: Web / Windows

## Product

Purpose:
- Help couples discover expectations before major life events, discuss differences safely, and record shared agreements.

Primary user value:
- Prevent avoidable conflict by turning private assumptions into structured, psychologically safe conversations.

## Architecture Map

Core:
- Dependency-free ES module web application with a Node HTTP API for magic-link sessions (`server/auth.mjs`), couple workspace/invite (`server/workspace.mjs`), and AnswerRound persist (`server/answers.mjs`). Question content is in `src/questions.js`; projection/reveal helpers stay in `src/state.js`; product entry and pack gating live in `src/app.js`.

UI:
- Mobile-first development dashboard, single-question experience, and shared results in `index.html`, `src/app.js`, and `src/styles.css`.

Persistence/Data:
- File store persists `User` sessions, `CoupleWorkspace`, `CoupleMember`, email-bound `Invitation`, `AnswerRound`, `Answer`, author-only `PrivateNote`, `Agreement`, and immutable `PublicLock` snapshots. Buyer login attaches a ghost workspace that stays pack-locked until the partner accepts. Local-simulator drafts are not migrated. Re-answer opens a new private round and never mutates a lock.

Tests:
- Node built-in test runner under `test/`; GitHub Actions workflow at `.github/workflows/test-build.yml`.

Build:
- Dependency-free Node scripts copy the static application into `dist/`.

## Verified Commands

Windows configure:
- `npm install` (no external dependencies in the current slice)

Windows targeted build:
- `npm run build`

Windows full build:
- `npm run lint && npm test && npm run build`

Targeted tests:
- `npm test`

## Important Paths / Symbols

- `src/questions.js` — structured question content
- `src/app.js` — session-gated product views and historical local question workflow
- `src/auth.js` / `src/auth-ui.js` — magic-link copy, pack gate, invite-waiting share, email-typo resend, same-session accept block
- `src/install.js` — recommended web install banner, `/start` Instagram CTA, `/install` landing, in-app browser hint
- `server/auth.mjs` — User session, 10-minute magic links, forced logout
- `server/workspace.mjs` — CoupleWorkspace, CoupleMember, 7-day email-bound invite
- `server/answers.mjs` — AnswerRound persist, author-only drafts/notes, agree/hold, immutable PublicLock
- `src/development.js` — development stage and history dashboard data
- `src/state.js` — two-role state normalization, submission/reveal, comparison helpers
- `src/styles.css` — responsive product UI
- `docs/PRODUCT_SPEC.md` — product contract
- `docs/DATA_MODEL.md` — planned secure server model

## Known Integration Hotspots

- See `.ai/memory/PROJECT_LESSONS.md`.

## Context maintenance rule

Update this file only with stable, evidence-backed facts that reduce future rediscovery.

Do not turn it into a long architecture document.
