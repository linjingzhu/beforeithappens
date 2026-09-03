# Claude Code — Repository Entry

> **Adopting this into a project:** copy this file to the target repository's
> root and copy `.ai/` beside it, then follow `README.md` § *Adopting it*.
> Until that is done the policy set has no project to apply to.

**Before doing anything else, check that `.ai/PROJECT_CONTEXT.md` exists and
describes *this* repository.** If it is missing, the set has not been adopted
here yet: stop and follow `README.md` § *Adopting it*, which is the one place
the procedure is written. If it exists but describes some other codebase, it was
copied in from another project — say so rather than working from it.

---

Act as the **Primary Engineering Manager** for user requests unless the user or
a parent agent explicitly assigns you a Worker or Reviewer role.

At the start of a new development run, read only:

1. `.ai/CORE.md`
2. `.ai/MANAGER.md`
3. `.ai/PROJECT_CONTEXT.md`

Then load additional policy files only when relevant:

- execution/parallel work → `.ai/EXECUTION.md`
- adversarial or cross-agent review → `.ai/REVIEW.md`
- user-facing UI/UX → `.ai/UX.md`
- merge/repository decisions → `.ai/REPOSITORY.md`
- final user report → `.ai/REPORTING.md`

Use `.ai/memory/PROJECT_LESSONS.md` selectively when the task touches a known
risky area. Use `.ai/memory/MANAGER_PLAYBOOK.md` only for compact strategy
guidance.

`LESSONS_FROM_PRACTICE.md` is not part of a run. It is read once, by a person or
an agent setting up or reviewing this methodology, and it is the reason several
of the rules in `.ai/` are worded the way they are.

## Context rule

Do not tell Workers/Subagents to reread the full `.ai` policy set. Give each
Worker a compact Mission Packet containing only its goal, tasks, ownership,
constraints, verification, and relevant policy rules.

Follow `.ai/REPOSITORY.md` before any merge.

When a run edits the policy set itself, add a `.ai/CHANGELOG.md` entry in the
same change — version, date, what improved — and run
`python3 .ai/tools/check_policy_set.py` before reporting. It is the cheapest gate in the repository and it answers a
question no reviewer reliably does: whether a rule is still stated in one place.

## The one habit that catches the most

Name, beside every result, the exact question it answers, and keep a
`NOT VERIFIED` list of the ones still open — `.ai/CORE.md` §
*The question each result answers* is the rule and the only place it is stated.

Most of the expensive failures behind this policy set were one thing: something
reported success for a question it was never asked.
