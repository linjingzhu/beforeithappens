# AB Question Packs

Standalone editorial review builds for the six AB question packs.

## Packs

| Pack | Core questions | Bonus | File | On the site |
| --- | ---: | --- | --- | --- |
| Marriage | 100 | — | `marriage.html` | `/marriage/` |
| Pregnancy | 100 | Emergency appendix (10) | `pregnancy.html` | `/pregnancy/` |
| Birth | 100 | Emergency appendix (10) | `birth.html` | `/birth/` |
| Parenting | 100 | Emergency appendix (11) | `parenting.html` | `/parenting/` |
| Later life (노후) | 100 | Emergency appendix (10) | `later.html` | `/later/` |
| Depression (우울, solo) | 100 | Help-line card, per-question reflection | `depression.html` | not published |

The four lifecycle packs became site pages on 2026-09-28. `scripts/build-site-packs.mjs` reads each
document into `src/questions-*.js`; `test/site-packs.test.js` fails if a module and its document
disagree, so the document stays the thing an author edits. Marriage is generated from its own data
array by `scripts/build-marriage-100.mjs`.

**No appendix is published.** Each of the four ends with a quiz that has right answers, which cannot
live on a site whose contract is that there is no score and no verdict — and the medical review below
has not happened. The reader is asked to keep those in `question-packs/`.

우울 100제 is not published either, and not because it is unfinished. It is answered alone, and every
surface around a pack on the site is built for two: the invite panel, the 상대의 답 prompt under each
question, the result page that waits for a second sheet. It needs a solo surface, not an entry in
`site/config.js`.

The shared campaign concept is **“우리는 얼마나 알고 있었을까?”**. The solo depression pack turns it inward: **“나는 나를 얼마나 알고 있었을까?”** — no partner guess, no score, a warm reflection after every question, and a help-line card instead of an emergency quiz.

Pregnancy, birth, parenting, and later-life builds include per-question five-star editorial feedback, free-form notes, browser-local persistence, JSON feedback export, and a separate safety-learning appendix. The emergency appendix is educational and never replaces `119`, the attending medical team, or individualized medical advice.

## Status

These files stay editorial and UX review artifacts, and they are still isolated from `src/questions.js` — the app's twelve-question sample, its entitlements, answer rounds and completion behaviour are untouched by anything here.

What changed on 2026-09-28 is the site, and only the core hundred of four packs: they went through item-level editorial review (every one of the four had its four hundred choices rewritten so the answers sit at different points on one axis rather than saying one thing in four tones) and schema conversion, and the site's own tests cover them. The appendices did not, and are still waiting on medical review; the solo depression pack is waiting on a surface. Promote anything else only after the same steps.

## Review workflow

1. Open a pack HTML file directly in a browser.
2. Answer or inspect each item.
3. Enter a star rating and editorial feedback.
4. Export the feedback JSON.
5. Apply accepted revisions to the pack source before runtime integration.
