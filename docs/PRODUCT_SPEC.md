# AB Paid MVP Product Specification

## Product contract

AB is a mobile-first web service where two people independently answer questions before important life events, reveal answers only after both submit, discuss differences safely, and record shared agreements.

## MVP success criteria

- One purchaser can buy a question pack and invite one partner.
- Both people answer without seeing the other's answer.
- A question is revealed only after both people submit it.
- Each revealed question supports a shared agreement or deferral.
- Progress resumes across sessions and devices.
- Reports contain shared results only; private notes are always excluded.
- Users cannot access another couple's workspace or their partner's private data.

## First executable slice

The first implementation proves the smallest useful loop before authentication or payment:

1. Open the marriage preparation pack.
2. Answer one question at a time.
3. Write a clearly labeled private note.
4. Auto-save the answer, note, and last position locally.
5. Resume after refresh.

The next slice adds two-role demo mode, an answer submission barrier, neutral comparison, and shared agreement.

## Question state model

```text
UNANSWERED
→ DRAFT_PRIVATE
→ SUBMITTED_PRIVATE
→ REVEALED
→ DISCUSSING
→ AGREED | DEFERRED
```

- Drafts never count as submitted.
- Before reveal, the partner sees completion status only.
- Both submissions transition the question atomically to `REVEALED`.
- Skipping is an explicit submission without a compatibility score.
- Changing a revealed answer creates a new private round; it never silently overwrites history.

## Comparison language

- `ALIGNED`: similar priorities
- `CLOSE`: similar direction, different degree
- `DISCUSS`: an important conversation is recommended
- `NEUTRAL`: choices cannot responsibly be ranked
- `UNRATED`: skipped or no comparison rule

AB never describes answers as correct/incorrect and does not produce a relationship diagnosis or success probability.

## Privacy boundaries

Author only:
- answer drafts;
- private notes;
- authentication data.

Both partners after reveal:
- submitted selections;
- shared explanations;
- agreements and their revision history;
- couple progress and report.

Private notes are excluded from partner APIs, administrator tools, PDFs, and shared reports by design.

## Commercial contract

One 29,000 KRW purchase grants one immutable pack version to one two-person couple workspace. The invited partner pays nothing. Payment entitlement is granted only after a verified, idempotent server webhook.

## Explicit non-goals

- AI counseling or clinical relationship diagnosis
- Kakao login or automated Kakao messages
- native mobile apps
- community or counselor marketplace
- subscription billing
- follow-up pregnancy, birth, and parenting content in the first release
