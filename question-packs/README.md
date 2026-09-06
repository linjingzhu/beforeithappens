# AB Question Packs

Standalone editorial review builds for the six AB question packs.

## Packs

| Pack | Core questions | Bonus | File |
| --- | ---: | --- | --- |
| Marriage | 100 | — | `marriage.html` |
| Pregnancy | 100 | Emergency appendix (10) | `pregnancy.html` |
| Birth | 100 | Emergency appendix (10) | `birth.html` |
| Parenting | 100 | Emergency appendix (11) | `parenting.html` |
| Later life (노후) | 100 | Emergency appendix (10) | `later.html` |
| Depression (우울, solo) | 100 | Help-line card, per-question reflection | `depression.html` |

The shared campaign concept is **“우리는 얼마나 알고 있었을까?”**. The solo depression pack turns it inward: **“나는 나를 얼마나 알고 있었을까?”** — no partner guess, no score, a warm reflection after every question, and a help-line card instead of an emergency quiz.

Pregnancy, birth, parenting, and later-life builds include per-question five-star editorial feedback, free-form notes, browser-local persistence, JSON feedback export, and a separate safety-learning appendix. The emergency appendix is educational and never replaces `119`, the attending medical team, or individualized medical advice.

## Status

These files are standalone editorial and UX review artifacts. They are intentionally isolated from `src/questions.js` so adding them does not change the current sample, entitlement, answer-round, or completion behavior. Promote content into the runtime only after item-level editorial review, schema conversion, medical review of the appendices, and application tests.

## Review workflow

1. Open a pack HTML file directly in a browser.
2. Answer or inspect each item.
3. Enter a star rating and editorial feedback.
4. Export the feedback JSON.
5. Apply accepted revisions to the pack source before runtime integration.
