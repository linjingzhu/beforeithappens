---
doc_id: ai-tools
version: 1.2.1
canonical_path: .ai/tools/README.md
updated: 2026-09-03
---

# Tools

Structural guards over the policy set.

```bash
python3 .ai/tools/check_policy_set.py        # the checks
python3 .ai/tools/test_check_policy_set.py   # prove each one fails on purpose
```

Standard library only, no dependencies, no configuration beyond the denylist.

## What each check asks

The script prints the question beside every result, because a result is
evidence only for the question its check actually asked — `.ai/CORE.md` §
*The question each result answers*.

| Check | Question it answers |
| --- | --- |
| front matter | Does every policy document carry the four fields, with a unique `doc_id` and a `canonical_path` matching where it lives? |
| cross-references | Does every referenced file, and every pointer written as a backticked path followed by `§ *Section*`, resolve to something that exists? |
| one owner per heading | Is any section heading claimed by two policy documents? |
| portability | Does any declared project-specific term appear outside the files allowed to know what the project is? |
| changelog | Does every release entry carry a version, a date and at least one improvement, newest first and each version once? |
| project context | Does the filled-in `.ai/PROJECT_CONTEXT.md` carry every fact the set reads by name, with no placeholder or template line left — and, where no instance exists, does the template still declare every key? |

## What they do not answer

- **Whether a rule is right.** These read structure, not argument.
- **Whether a version bump was correct.** Policy impact is a judgement; the
  check only sees that the field is well-formed.
- **Whether a pointer stayed a pointer.** "One owner per heading" catches a rule
  re-added under its own heading, which is how re-duplication usually happens.
  Prose that restates another file's rule *without* reusing its heading is not
  detected, and stays a convention enforced by review.
- **Whether a project-specific fact leaked using no denylisted word.** The
  denylist is a list of proper nouns someone wrote down on purpose.
- **Whether a changelog entry is true, or its version level right.** The check
  sees that a version, a date and improvements are present and ordered. Whether
  the improvements listed are the ones that shipped is a judgement.
- **Whether the facts in the project context are true.** The check sees that
  `test_command` has a value; whether that command runs the tests is answered
  by running it.

Guards here read structure — front matter, headings, references, paths — rather
than prose, per `LESSONS_FROM_PRACTICE.md` entry 14: a check that greps
documentation teaches contributors to avoid words, not defects. The portability
denylist is the deliberate exception, and it matches names rather than rules.

## Where the checks look

`.ai/**` and `CLAUDE.md`, everywhere. The root `README.md` and
`LESSONS_FROM_PRACTICE.md` are read only where the set itself lives (detected
by `LESSONS_FROM_PRACTICE.md` being present): in a repository that adopted the
set, the root `README.md` is the adopter's own and names its product, and the
set's pointers at those two files resolve to files that were deliberately not
copied.

## Adopting this

`.ai/tools/` travels with the set. Two things do not, and are yours to set up:

1. **`portability-denylist.txt`** ships seeded with the names removed when this
   set was separated from the project that produced it. Replace them with your
   own product and organisation names. An empty denylist makes that check
   vacuous, and the script says so rather than passing quietly.
2. **The CI workflow.** This repository runs these on every pull request from
   `.github/workflows/policy-set.yml`; copy or adapt it into whatever your
   repository already uses. A guard nothing runs is a comment.
