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
- Dependency-free ES module web application with a Node HTTP API for magic-link sessions (`server/auth.mjs`). Question content is in `src/questions.js`; historical local two-role state stays in `src/state.js`; product entry and pack gating live in `src/app.js`.

UI:
- Mobile-first development dashboard, single-question experience, and shared results in `index.html`, `src/app.js`, and `src/styles.css`.

Persistence/Data:
- Foundation slice uses a Node session store for `User`, hashed magic-link tokens, and one active session per email. Buyer home stays invite-waiting until an accepted partner exists. Historical local role A/B state remains a workflow simulator only and is not the auth path. Planned workspace/invite/round model is documented in `docs/DATA_MODEL.md`.

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
- `src/auth.js` / `src/auth-ui.js` — magic-link copy, pack gate, onboarding and invite-waiting views
- `server/auth.mjs` — User session, 10-minute magic links, forced logout
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
