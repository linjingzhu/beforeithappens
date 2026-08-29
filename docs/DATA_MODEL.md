# AB MVP Data Model

## Core entities

| Entity | Purpose |
|---|---|
| `User` | One email identity, one active session, and account lifecycle |
| `CoupleWorkspace` | One isolated two-person relationship space |
| `CoupleMember` | Membership and role inside a workspace (buyer or invited partner) |
| `Invitation` | Single-use, 7-day, email-bound partner invitation |
| `QuestionPack` | Logical commercial product |
| `PackVersion` | Immutable published content snapshot |
| `Section` / `Question` / `Choice` | Ordered question content |
| `ComparisonRule` | Explicit choice-pair interpretation matrix |
| `Purchase` / `Entitlement` | Payment record and pack access (not opened in the foundation slice) |
| `AnswerRound` | One reveal lifecycle for one question |
| `Answer` | One member's draft or submitted selection |
| `PrivateNote` | Author-only note stored separately from shared content |
| `Agreement` / `AgreementRevision` | Partner-approved shared conclusion and history |
| `PublicLock` | Immutable published snapshot of a completed round |
| `ReportSnapshot` | Reproducible report for a fixed pack version |
| `AuditEvent` | Security- and support-relevant action history |

The current slice persists `User`, magic-link tokens, sessions, `CoupleWorkspace`, `CoupleMember`, `Invitation`, `AnswerRound`, `Answer`, `PrivateNote`, `Agreement`, and `PublicLock`. Creating a buyer workspace must not unlock the pack without an accepted partner. A later change after lock opens a new private `AnswerRound` and never mutates the existing lock.

## Identity and session

- `User.email` is unique after trim and lowercase normalization.
- One email is one user. There is no password and no Kakao identity.
- One active session per user. A new login or forced logout immediately invalidates the previous session.
- Magic-link tokens last 10 minutes, are single-use, and are stored as hashes. Requesting a new link immediately expires unused prior tokens for that email.
- Local-simulator drafts are not copied onto `User`, `Answer`, or `PrivateNote`.

## Workspace and invite

- A user may have at most one active `CoupleWorkspace`.
- A workspace may have at most two `CoupleMember` rows: buyer and invited partner.
- Pack access requires two accepted members. A workspace with no accepted partner is a ghost workspace and must not unlock the pack.
- `Invitation` is email-bound: the accepting user's email must equal the invite email.
- Invite tokens are single-use and expire after 7 days.
- Reissue immediately expires the previous invite token.
- Accept creates the partner `CoupleMember` and marks that invite consumed.
- A visitor who is not logged in, or is logged in as a different email, cannot accept from the link alone.
- The buyer may share the current unused invite URL. Reissue or editing the invited email immediately expires the previous token so the old share link cannot be accepted.
- Opening an invite while another account is logged in cannot accept. The web recovery is force logout, then magic-link accept for the invited email. There is no role switch.
- App install is not a persisted gate. Skipping the recommended install leaves the web session and pack access unchanged.
- The LoveMe native S0 shell persists nothing. Native splash does not write a session. S2–S3 owns magic-link login state.

## Persistence rules

- After login, drafts and private notes autosave on the server and remain author-only.
- Submitted answers and agree/hold (`AGREED` | `DEFERRED`) are the shared persisted records.
- `(workspaceId, questionId, roundNumber, userId)` is unique on `AnswerRound` / `Answer`.
- A `PublicLock` is an immutable snapshot. Re-answer creates a new private `AnswerRound` and never mutates or reopens the same lock.
- Published pack versions and their children are immutable.
- The invited partner is free. The pack opens only after the partner accepts the invite. Payment and the 100-question lifecycle line are out of this slice.
- Payment entities do not grant pack access in this slice. A workspace with no accepted partner is a ghost workspace and must not unlock the pack.
- Payment order IDs and webhook event IDs are unique.
- Private notes have a separate authorization path and never join report queries.
- Database timestamps use UTC; presentation uses the user's locale.

## Reveal transaction

When the second member submits, the server locks the answer round, verifies two valid submissions, marks it revealed exactly once, and returns the comparison result. Frontend hiding is never used as the security boundary.
