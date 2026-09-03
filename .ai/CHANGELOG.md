---
doc_id: ai-changelog
version: 1.1.0
canonical_path: .ai/CHANGELOG.md
updated: 2026-09-03
---

# Changelog

The version of the **policy set as a whole**. Individual documents carry their
own `version` in front matter, which says how that document changed; the number
here says what an adopter is holding. § *Document versioning* below is the rule
for both — it lives here rather than in `CORE.md` because a run never needs it.

The newest entry at the top is the current version. There is no second place
that records it — `.ai/tools/check_policy_set.py` reads this file to answer
"which version is this set", so a release that is not written here did not
happen.

**Every entry needs three things, and the check enforces all three:** a semantic
version, an ISO date, and at least one improvement. An entry that records a
version and a date but not what changed is the shape of failure this whole set
exists to prevent — a result reported without the question it answers.

## Format

```text
## MAJOR.MINOR.PATCH — YYYY-MM-DD

Optional one-line summary of what the release is for.

- what changed, and why it was worth changing
- ...
```

Judge the level by policy impact, per § *Document versioning* below:
**MAJOR** when a rule is removed or reversed, so previously compliant work stops
being compliant; **MINOR** when a rule is added or its scope widens; **PATCH**
for wording, examples and ordering that change nothing about what is required.

---

## 2.2.1 — 2026-09-03

Found by adopting 2.2.0 into a real repository: the checks read the adopter's
own `README.md` as if it were the set's, and every pointer at
`LESSONS_FROM_PRACTICE.md` and `README.md` § *Adopting it* dangled, because
the adoption procedure copies neither file.

- the checks now read `.ai/**` and `CLAUDE.md` everywhere, and the root
  `README.md` and `LESSONS_FROM_PRACTICE.md` only at the set's home (where
  `LESSONS_FROM_PRACTICE.md` exists); pointers at those two files resolve in
  an adopting repository the way pointers at instance files do;
- one self-test: a copy without the set-home files, carrying a product name
  in its own README, passes; and the self-tests read the repository's own
  denylist instead of assuming the seed names, so they run unchanged in an
  adopting repository whose CI copies the workflow.

PATCH: nothing newly required; the checks stop failing on a repository that
followed the adoption procedure exactly.

## 2.2.0 — 2026-09-03

Guards for the adopter. 2.1.0 made the set check itself; this release makes it
check the repository that adopted it, with rules paid for by a second project
(`LESSONS_FROM_PRACTICE.md` entries 24–29).

- added `PROJECT_CONTEXT.template.md` § *Facts the checks read*: ten
  `key: value` facts a run reads by name — base branch, whether merge deploys,
  the runtime gate command, the verified commands, generated artefacts,
  external scripts, public identifiers, the owner ledger — and a sixth check, *project context*,
  that refuses an instance missing a key, leaving a placeholder, or keeping a
  template instruction line; where no instance exists it checks the template
  still declares every key;
- added `CORE.md` § *Tests check the shape of configuration*, § *Generated
  artefacts* and § *Public identifiers and secrets*; four token-discipline
  rules on watched events, list queries, waiting and the pre-reset state card;
  two autonomy rules on attachments that never arrive and on standing
  directives;
- added `REPOSITORY.md` § *Branch lifecycle* (one branch per pull request,
  recreated from the base after a squash merge, draft first, commit size cap,
  no tooling residue) and § *Merge and deploy* (`merge_deploys: yes` means a
  user-visible change is shown before it merges); `personal` mode now allows a
  feature branch and a draft pull request instead of asking every time;
- `REVIEW.md` no longer names vendors: the independent reviewer is a different
  *model* from the implementer, both named in the report, and a same-model
  fresh context is labelled `FALLBACK REVIEW`;
- `REPORTING.md` § *Owner ledger*: work only the user can do lives in one
  ledger file with row ids that reports cite; the persistent-report threshold
  is now a rule (a merged pull request, a ledger row changed, or a `FAILED`
  run) instead of "substantial"; the report names the implementing and
  reviewing models;
- `MANAGER.md` § 1 states the reading in one line before building an ambiguous
  product or visual ask; § 12 names four metrics that session logs already
  carry — start-up tokens, watched-event turn share, merged-then-reverted pull
  requests, unattributed commits;
- `UX.md` runs the project's own `runtime_gate` instead of a generic
  build-and-launch; `EXECUTION.md` gives a generated artefact one owner, the
  integration branch;
- moved § *Document versioning* and § *Set version* out of `CORE.md` into this
  file: a run never needs them, and `CORE.md` is read at every start;
- removed the `Default behavior` list from `CLAUDE.md`, a summary of `CORE.md`
  and `MANAGER.md` that the heading check could not see and that had grown to
  seven lines;
- `LESSONS_FROM_PRACTICE.md` entries 24–29, from a web product built by four
  agents in turn.

MINOR: rules were added and one permission widened; nothing previously
compliant became non-compliant. Adopters gain ten facts to fill in and a check
that will fail until they do — which is the point.

## 2.1.0 — 2026-09-03

Guards. Until now every rule in the set was enforced by whoever happened to read
it carefully.

- added `.ai/tools/check_policy_set.py`: five structural checks — front matter,
  cross-references, one owner per heading, a denylist of project-specific
  names, and this changelog — each printing the exact question it answers;
- added `.ai/tools/test_check_policy_set.py`: 18 tests that break one thing at a
  time and assert the matching check reports it, plus a control that the
  untouched tree stays clean. A guard that has never failed on purpose has not
  been tested;
- added `.github/workflows/policy-set.yml`, which runs the self-tests first and
  the checks second. The tools travel with `.ai/`; the workflow does not;
- added this changelog as the single home of the set's version, plus
  § *Set version* (then in `CORE.md`, now below) and a check that refuses an entry missing a
  version, a date or its improvements, out of order, or with a version already
  used;
- fixed a drift the new heading check caught on its first run:
  `PROJECT_CONTEXT.template.md` still defined `repository_mode: auto` in the
  wording `REPOSITORY.md` had moved away from in 2.0.0. The template now carries
  the value and points at `REPOSITORY.md` for the meaning.

MINOR rather than PATCH: adopting repositories now have something to maintain —
a denylist of their own names, and a place to run the checks.

## 2.0.1 — 2026-09-03

Each rule is now stated in exactly one file.

- single-sourced six rules that had been stated in two to four files each: the
  evidence habit (`CORE.md`), the compile and build ladder, conflict prevention
  and session strategy (`EXECUTION.md`), the cross-agent reviewer rule
  (`REVIEW.md`), and the adoption procedure (`README.md`);
- rewrote `MANAGER.md` as a spine: each step states the duty that is genuinely
  the Manager's and points to the file that owns the mechanics, instead of
  re-narrating it;
- emptied `memory/MANAGER_PLAYBOOK.md` of three seed lessons that were already
  policy, which its own promotion rule had always forbidden keeping, and made
  that rule say to *move* a lesson rather than summarise it;
- marked owning sections *Single source*, and stated the convention: a pointer
  is not a summary and must not grow into one.

PATCH: rules moved between documents; nothing became newly required.

## 2.0.0 — 2026-09-03

The set stopped claiming to be portable and started being portable.

- removed the filled-in `PROJECT_CONTEXT.md`, the filled-in
  `memory/PROJECT_LESSONS.md`, and eight run reports, all describing a
  repository that was not this one. The set now ships templates and no instance;
- generalised eight reusable defects out of that material into
  `LESSONS_FROM_PRACTICE.md` entries 16–23 — a clean merge is not a compatible
  merge, preparation passes the repository's own tests, record what was built
  rather than what was configured, do not shadow the platform's state, match on
  durable identity, a run over a changing tree is not a run, milestones and
  delivery units need separate status, amend a specification beside it;
- removed a specific organisation's repository name from `REPOSITORY.md` and
  replaced it with portable signals; `auto` now resolves a missing project
  context to **protected**, so an unconfigured repository fails safe;
- removed a hardcoded build platform from `CORE.md` and four other files, which
  now defer to the primary target platform named in `PROJECT_CONTEXT.md`;
- added § *Document versioning* (then in `CORE.md`, now below) and front matter on every document
  in `.ai/`, which the README had promised and nothing had implemented;
- made `CORE.md` § *The question each result answers* a normative rule rather
  than an idea repeated in three introductions.

MAJOR: rules were removed and reversed. Work that relied on the old fixed
platform, or on the old `auto` heuristic, is no longer compliant.

## 1.0.0 — 2026-08-24

First publication, extracted from the project that paid for it.

- `CLAUDE.md`, `README.md`, and the `.ai/` policy set: `CORE`, `MANAGER`,
  `EXECUTION`, `REVIEW`, `UX`, `REPOSITORY`, `REPORTING`, plus `memory/`;
- `LESSONS_FROM_PRACTICE.md` entries 1–15, each one generalised from a defect
  that had already cost something.

The extraction was incomplete — the source project's context, memory and reports
came with it, which is what 2.0.0 finished.

---

## Document versioning

Every document in `.ai/` carries front matter:

```text
---
doc_id: <stable id, never renamed>
version: MAJOR.MINOR.PATCH
canonical_path: <path this document is addressed by>
updated: YYYY-MM-DD
---
```

- `doc_id` and `canonical_path` are how other documents address this one. Change
  them only when the document itself moves or is replaced.
- `MAJOR` — a rule is removed or reversed, so previously compliant work is now
  non-compliant.
- `MINOR` — a rule is added or its scope widens.
- `PATCH` — wording, examples, or ordering, with no change to what is required.

Judge the bump by policy impact. Do not bump mechanically on every edit, and do
not bundle a `MAJOR` reversal into an edit described as wording.

Project instance files (`PROJECT_CONTEXT.md`, `memory/PROJECT_LESSONS.md`) are
versioned the same way but belong to their repository, not to this policy set.

## Set version

A document's own `version` says how that document changed. The version of the
**set as a whole** — what an adopter is holding — is the newest release entry
above, and nowhere else. The two numbers are different things and are not
expected to match.

Every release entry records three things, and the check refuses an entry
missing any of them:

- the **version**, at the level its policy impact earns;
- the **date** it was released, as `YYYY-MM-DD`;
- the **improvements** — what changed and why it was worth changing.

A version and a date without the improvements is a release reported without the
question it answers. Log the release in the same change that makes it, not
afterwards from memory.
