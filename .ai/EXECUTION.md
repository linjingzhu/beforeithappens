---
doc_id: ai-execution
version: 1.1.0
canonical_path: .ai/EXECUTION.md
updated: 2026-09-03
---

# Execution, Mission Packs, and Sessions

## Core model

```text
Run
→ Primary Manager
→ Atomic Tasks
→ Mission Packs
→ Workers
→ Integration Waves
→ Review
→ Result
```

A Task is not automatically a Session.

## Session strategy

*Single source for whether a piece of work gets a new Worker or reuses one.
`.ai/MANAGER.md` § 6 owns how many Workers result from it.*

### Manager
- one primary Manager context per run where practical;
- ends when the run is complete.

### Workers
Reuse a Worker within the run for strongly related work.
Create a new Worker when:
- a substantial independent subsystem can progress in parallel;
- context is meaningfully different;
- isolation reduces conflict;
- a specialized role is needed.

Do not spawn a new Worker for:
- copy changes,
- one tooltip,
- lint cleanup,
- a tiny validation,
- a single small test,
- a small follow-up in the same subsystem.

### Reviewers
Prefer fresh context.
Reviewer context should contain only:
- requirement/acceptance criteria,
- relevant architecture facts,
- diff/changed files,
- tests/build evidence,
- review rules.

Do not inherit the implementer's reasoning history.

## Worktrees and branches

When supported, use isolated worktrees/branches for independent Mission Packs.

Rules:
- one write owner per path/symbol at a time;
- Workers do not merge each other;
- Workers do not casually edit outside ownership;
- shared/hotspot changes are serialized or assigned to one Pack;
- a generated artefact (`.ai/PROJECT_CONTEXT.md` § *Facts the checks read*,
  `generated`) has one owner: the integration branch. Packs edit sources
  only; regeneration happens once, at integration, by the listed command.
  Two branches that each regenerate the same file will each delete the
  other's version;
- Manager owns integration order.

## Mission Packet template

The Manager should give each Worker a compact packet like:

```text
MISSION
<name>

GOAL
<one concise outcome>

OWNERSHIP
- writable paths/symbols

READ-ONLY CONTEXT
- relevant paths/symbols

DO NOT MODIFY
- explicit conflict boundaries when useful

TASKS
1. ...
2. ...

POLICY
- autonomous implementation
- smallest safe change
- verification on the primary target platform only
- sources only; do not regenerate artefacts
- no merge
- self-review and self-fix

UX CONTRACT
<include only when relevant>

VERIFY
- cheapest meaningful checks
- affected compile
- relevant tests

DONE WHEN
- acceptance criteria met
- ownership respected
- verification passed
- no unresolved major self-review finding
```

Workers should not be told to read the full `.ai` folder.

## Compile and build ladder

*Single source. `.ai/MANAGER.md` § 7 owns where the wave boundaries fall; which
gate fires at each one is here.*

Use the cheapest meaningful gate early:

```text
Edit
→ static/lint/type check where useful

Atomic Task boundary
→ targeted verification

Mission Pack boundary
→ affected compile

Integration wave
→ affected build for the primary target platform

Run boundary
→ final target-platform verification/build when justified
```

Do not let multiple substantial Packs accumulate without compilation when compilation is feasible.

## Conflict prevention

*Single source. `.ai/MANAGER.md` § 4 obliges the Manager to run this before
assigning ownership; the procedure is here.*

Before parallel work:
1. identify overlapping files/symbols;
2. identify shared interfaces;
3. consult known hotspots in Project Lessons;
4. serialize conflicting work or combine it into one Mission Pack;
5. define integration order.

Before integration, simulate/check merge conflict risk using available Git tooling or a temporary integration worktree when useful.

Track conflict count and resolution effort as a development-efficiency signal.
