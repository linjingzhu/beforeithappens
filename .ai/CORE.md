---
doc_id: ai-core
version: 1.2.0
canonical_path: .ai/CORE.md
updated: 2026-09-03
---

# Core Development Constitution

These rules are the stable quality floor. Execution strategy may adapt; these rules do not.

## Priority

1. Correctness
2. User intent and product value
3. Regression and data safety
4. UX/usability
5. Git conflict prevention
6. Delivery speed
7. Token/cost efficiency
8. Architectural elegance

Never reduce the quality floor merely to improve token, time, or worker-count metrics.

## Autonomy

Default to autonomous execution.

Do not ask the user to approve routine choices that can be resolved through:
1. repository conventions,
2. existing implementation,
3. evidence,
4. the smallest reversible safe choice.

Ask only when a decision materially changes product scope, creates irreversible external impact, requires secrets/credentials, incurs external cost, or requires accepting meaningful legal/security risk.

Two cases where saying something at once is the autonomous choice:

- An attachment the user pasted — an image, a file — that does not reach the
  working tree is reported in the same turn, with a request for a path or an
  upload. Never describe or act on an attachment that was not received.
- A directive worded as standing ("from now on", "always", "never again") is
  written into `.ai/PROJECT_CONTEXT.md` or `.ai/memory/PROJECT_LESSONS.md` in
  the turn it is given. A standing instruction that lives only in the
  conversation is gone at the next context reset.

## Implementation

- Reuse existing architecture before adding new abstractions.
- Prefer the smallest safe diff.
- Avoid duplicate implementations and unnecessary dependencies.
- Preserve backward compatibility unless the task explicitly changes it.
- Fix confirmed task-adjacent defects when the fix is small, safe, and clearly related.
- Split unrelated discoveries into follow-up work instead of expanding scope silently.
- Never treat "code written" as "feature complete."

## Token discipline

Optimize **useful development per token**, not session count.

- Do not repeatedly rediscover the same subsystem.
- Reuse context within a run when tasks are strongly related.
- Prefer compact Mission Packets over full policy reloads.
- Prefer path/symbol/diff-focused investigation over whole-repository rereads.
- Do not duplicate the same research across workers.
- Reviewers receive requirements, diff, tests, and relevant context—not the implementer's full reasoning history.
- Do not fabricate exact token/cost metrics when tooling does not expose them.
- Handle watched events as summaries. An event that echoes the agent's own
  action — a draft it flipped, a merge it made, a subscription it created — is
  read and not answered; a check-in reports only a changed state.
- Ask the smallest query that answers the question: never a list call when a
  single-item call carries the same fact, and never a tool result the harness
  has had to truncate before.
- Wait on events, not on sleeps. A build, a deploy or a review is confirmed by
  one lookup after its completion signal, not by a polling loop.
- Before a context reset is imminent, write a state card — branch, open pull
  requests, unfinished items, verification commands — to a file, and read that
  file first afterwards instead of rediscovering the tree.

## Target platform

`.ai/PROJECT_CONTEXT.md` names the project's **primary target platform**. This
file does not.

- Build and verify on the primary target platform by default.
- Do not build for a secondary platform unless the user explicitly requests it.
- Cross-platform analysis is allowed; executing a secondary-platform build is
  not a default action.
- If the project context names no platform, ask once rather than assuming the
  platform of the machine you happen to be on.

## Quality evidence

Whenever technically applicable, completion should be supported by deterministic evidence such as:
- compilation,
- static/type checks,
- tests,
- a build for the primary target platform,
- runtime verification,
- visual verification.

AI agreement is not a substitute for evidence.

### Tests check the shape of configuration

A test asserts what a configuration value must look like, not what it is today.
A real domain, identifier or token appears in at most one test — the deploy
guard — and that test says so in its name. A test that asserts today's value
breaks on the day the value is set, and is then rewritten to accommodate it
instead of catching a change.

### Generated artefacts

`.ai/PROJECT_CONTEXT.md` § *Facts the checks read* lists, under `generated`,
every committed file that is produced from a source in the repository, with
the command that produces it. Such a file changes only in the same change as
its source, by that command, never by hand — and a check regenerates it and
compares bytes, so a stale artefact fails before it merges rather than after.

### Public identifiers and secrets

A value that *identifies* — a publisher id, a verification token, a public
client key — may be committed, and is listed under `public_ids` in the project
context. A value that *authenticates* is never committed; it lives in the
host's environment. `external_scripts` names every third-party script the
product may load and the condition under which it loads; nothing loads by
default, and an unlisted script is a defect, not an integration.

### The question each result answers

*This section is the single normative statement of this rule. Every other
document in the set points here rather than restating it.*

**Name, beside every result, the exact question it answers.** A result is
evidence for the question its check actually asked and for nothing else, and the
gap between the two is where the expensive defects live.

- A compile answers "is this valid" — not "does this work", and not "is this
  reachable".
- A guard answers "does this pattern appear" — not "is this rule kept".
- A green build answers "did every step exit zero" — not "the feature works".

Keep a **`NOT VERIFIED`** list of the questions still open, carry it forward
through the run, and end the report with it. A question nobody asked is not a
question that passed.

## Versioning

`.ai/CHANGELOG.md` § *Document versioning* defines the front matter every
document here carries and what each level of bump means; `.ai/CHANGELOG.md` §
*Set version* is the version of the set as a whole. Neither is a rule a run
needs, so neither is stated here.
