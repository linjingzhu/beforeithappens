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
- Dependency-free ES module web application; question content in `src/questions.js`, normalized two-role state in `src/state.js`, and UI workflow in `src/app.js`.

UI:
- Mobile-first development dashboard, single-question experience, and shared results in `index.html`, `src/app.js`, and `src/styles.css`.

Persistence/Data:
- Current executable slice uses validated device-local role A/B state with draft/submitted separation, reveal barriers, and two-role agreement approval. It is a workflow simulator, not a privacy boundary. Planned server model is documented in `docs/DATA_MODEL.md`.

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
- `src/app.js` — local state and question workflow
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
