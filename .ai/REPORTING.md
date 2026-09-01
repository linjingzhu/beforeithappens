# Formal Development Reporting

The Manager reports once per meaningful run. Worker logs are internal unless requested.

## Status vocabulary

- `COMPLETED`
- `COMPLETED_WITH_NOTES`
- `ACTION_REQUIRED`
- `FAILED`

## Chat report

Keep the user-facing report compact and formal:

```text
DEVELOPMENT REPORT

Status:
Repository:
Repository Mode:
Integration:

Executive Summary
<what was delivered and overall result>

Delivered
- ...

Verification
- Compile:
- Tests:
- Windows Build:
- Runtime/Visual:
- Adversarial Review:
- Cross-Agent Review:
- Git Conflicts:

Problems Found & Automatically Fixed
- severity — problem → resolution

Remaining Risks
- ...

Efficiency / Meta Evaluation
- workers / mission packs
- conflict/rework observations
- token/time metrics only when reliably available
- strategy lesson, if any

Recommended Next Actions
1. ...
2. ...
3. ...
```

Do not list actions the AI could have safely completed itself.

## Owner actions are always a table

Every report ends with the owner-action ledger **as a table, in the chat, with a status emoji on
every row** — past, present and future in one view, so the owner can see the whole thing at a glance
rather than reconstructing it from previous messages.

`docs/OWNER_ACTIONS.md` is the persistent copy and the source of truth. Update it whenever a row
moves, then render it in chat. The chat table is not a substitute for the file: the conversation
scrolls away and the ledger is the residue of every run.

Status vocabulary for that table:

| | |
|---|---|
| ✅ | done |
| 🟢 | can be done now — nothing is blocking it |
| ⏳ | waiting on something above it |
| ❓ | unknown — the agent could not verify it and does not guess |
| 🤔 | a decision, not a task |

Never mark a row ✅ on the owner's behalf, and never mark one 🟢 when a dependency above it is still
open. A row the agent could not check is ❓, not an assumption.

## Persistent detailed report

When a run is substantial or creates useful engineering history, write a detailed report under:

```text
.ai/reports/YYYY-MM-DD-<short-run-name>.md
```

Keep persistent reports factual and concise.

## Truthfulness

Never claim:
- a build passed if it was not run;
- runtime/visual verification passed if the UI was not observed;
- cross-agent validation happened if only one agent family reviewed;
- exact token/cost numbers if they were not measured.

Use `NOT RUN`, `NOT AVAILABLE`, or `FALLBACK REVIEW` explicitly.
