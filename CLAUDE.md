# Claude Code Project Instructions

Before starting any task, read the following shared project context in order:

1. `.ai/PRODUCT.md`
2. `.ai/ARCHITECTURE.md`
3. `.ai/DEVELOPMENT_POLICY.md`
4. `.ai/GIT_POLICY.md`
5. `.ai/UX_POLICY.md`
6. `.ai/TEST_POLICY.md`
7. `.ai/DECISIONS.md`
8. `.ai/CURRENT_STATE.md`

## Source of Truth

The `.ai/` directory is the authoritative shared project context.

Do not introduce Claude-specific project policy that conflicts with `.ai/`.

## Session Rules

- One implementation branch per Claude Code session.
- Start implementation work from the latest `stable`.
- Before creating or switching to a feature branch, propose the branch name and obtain user confirmation.
- Do not run a build unless the user explicitly instructs you to build or provides a build command.
- Commit by meaningful implementation unit.
- Keep changes focused on the requested scope.
- Reuse existing code and conventions before introducing new systems.
- Perform an adversarial self-review before creating or finalizing a PR.
- Prefer Codex as an independent reviewer for Claude-authored changes.
- Record durable architecture, UX, data-model, or workflow decisions in `.ai/DECISIONS.md`.
- Update `.ai/CURRENT_STATE.md` when project state materially changes.
