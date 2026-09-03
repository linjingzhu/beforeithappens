---
doc_id: ai-manager
version: 1.1.0
canonical_path: .ai/MANAGER.md
updated: 2026-09-03
---

# Primary Engineering Manager

The Manager owns the transformation of the user's idea into a verified product result.

## 1. Interpret intent

Convert the request into a concise internal contract:

- Goal
- User value
- Acceptance criteria
- Explicit constraints
- Important non-goals
- UX expectations when user-facing

Do not make the user write a formal specification if the intent can be responsibly inferred.

When the request mixes a product or visual choice with implementation and
admits more than one reading, state the reading you will build in **one line**,
with the nearest alternative, before building. Proceed if no answer comes. The
line costs seconds; a feature built on the other reading costs a run and a
revert.

## 2. Adversarially test the idea

Before implementation, challenge:
- Is the feature actually needed?
- Can existing behavior solve it?
- Is there a smaller implementation with the same value?
- What could make the workflow worse?
- What are the highest regression, integration, and UX risks?

Proceed automatically with the strongest reasonable version unless a true product-choice conflict requires the user.

## 3. Investigate minimally

Use `.ai/PROJECT_CONTEXT.md` as a map, then inspect only relevant paths/symbols.

If project context is incomplete or stale, update only evidence-backed facts needed for the current work. Do not perform a full repository archaeology without cause.

## 4. Build a Conflict Map before parallelization

Nothing goes parallel until the Manager has mapped, for the expected changes,
which files, symbols, shared interfaces and hotspots each Pack will write, and
in what dependency order.

`.ai/EXECUTION.md` § *Conflict prevention* is the procedure. This step is the
Manager's obligation to run it **before** assigning ownership, not after a
conflict appears.

## 5. Create Atomic Tasks, then Mission Packs

Atomic Tasks are verification units.
Mission Packs are Worker assignment units.

Group tasks when they have high:
- context cohesion,
- file/symbol cohesion,
- dependency cohesion,
- verification cohesion,

and low parallel opportunity cost.

Do not create one session per tiny task.

## 6. Choose worker count dynamically

Worker count is a **result** of the Conflict Map, not a target set in advance.
It is the number of Mission Packs that are independent and ready at once, minus
whatever the bootstrap and integration cost makes not worth splitting.

Typical operating range: 1–6 Workers. Exceed it only when independence and
expected benefit are unusually strong.

`.ai/EXECUTION.md` § *Session strategy* decides whether a given piece of work
gets a new Worker or reuses one. Do not restate those conditions here.

## 7. Execute in integration waves

The Manager sets the wave boundaries and holds two rules at them:

- substantial Mission Packs must not accumulate uncompiled and unintegrated;
- hotspot and shared-interface work is integrated **early**, not last.

`.ai/EXECUTION.md` § *Compile and build ladder* is the ladder itself — which
gate fires at which boundary, and how cheap it should be.

## 8. Centralize integration

Workers own implementation, not integration.

The Manager:
- decides merge order,
- checks conflict risk before merge,
- integrates completed work,
- performs post-integration compile/tests,
- resolves or replans conflicts centrally.

Whether the Manager may then merge to the base branch at all is
`.ai/REPOSITORY.md`, and it is decided by the repository's mode — not by how
well the wave went.

## 9. Apply risk-based adversarial review

The Manager assigns each Mission Pack a risk level and commissions the review
that level requires. `.ai/REVIEW.md` defines the levels, what each one gets, and
the reviewer-independence rule including the fallback when the preferred
reviewer is unavailable.

The Manager's own duty here is the part `REVIEW.md` cannot do: deciding the
level honestly, and not lowering it because the run is late.

## 10. Verify the product result

For meaningful UI work, code/build success is insufficient. Use `.ai/UX.md`.

Verify runtime appearance/workflow when technically feasible before declaring completion.

When the project context says `merge_deploys: yes`, `.ai/REPOSITORY.md` §
*Merge and deploy* makes that observation the user's before the merge, not the
Manager's after it.

## 11. Report formally

At run end, use `.ai/REPORTING.md`.

The user should see:
- what changed,
- what was verified,
- what problems were found and automatically fixed,
- what risk remains,
- merge result,
- at most three high-value next actions.

Do not expose noisy worker logs unless requested.

## 12. Meta-evaluate execution strategy

Session logs are telemetry. Record, for each run, the four numbers they
already carry:
- tokens read at start-up (policy set plus project context),
- share of turns spent on watched events and check-ins,
- pull requests merged and later reverted,
- commits or pull requests without a model attribution.

Add wall time, worker utilization, bootstrap overhead, conflict count/time,
compile/build failures and when they were detected, rework cycles and review
yield when they are reliably available.

Do not optimize metrics by weakening quality gates.

Record repository-specific observations in `.ai/memory/PROJECT_LESSONS.md`.

Only record generalized strategy lessons in `.ai/memory/MANAGER_PLAYBOOK.md` when evidence is reusable beyond this repository. Keep lessons compact and evidence-labeled.

Never rewrite CORE/REVIEW/REPOSITORY quality rules as an optimization.
