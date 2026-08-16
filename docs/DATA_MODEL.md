# AB MVP Data Model

## Core entities

| Entity | Purpose |
|---|---|
| `User` | Account identity and lifecycle |
| `CoupleWorkspace` | One isolated two-person relationship space |
| `CoupleMember` | Membership and role inside a workspace |
| `Invitation` | Single-use, expiring partner invitation |
| `QuestionPack` | Logical commercial product |
| `PackVersion` | Immutable published content snapshot |
| `Section` / `Question` / `Choice` | Ordered question content |
| `ComparisonRule` | Explicit choice-pair interpretation matrix |
| `Purchase` / `Entitlement` | Payment record and pack access |
| `AnswerRound` | One reveal lifecycle for one question |
| `Answer` | One member's draft or submitted selection |
| `PrivateNote` | Author-only note stored separately from shared content |
| `Agreement` / `AgreementRevision` | Partner-approved shared conclusion and history |
| `ReportSnapshot` | Reproducible report for a fixed pack version |
| `AuditEvent` | Security- and support-relevant action history |

## Required constraints

- Maximum two active members per workspace.
- Maximum one active workspace per user in the MVP.
- `(workspaceId, questionId, roundNumber, userId)` is unique.
- Published pack versions and their children are immutable.
- Payment order IDs and webhook event IDs are unique.
- Private notes have a separate authorization path and never join report queries.
- Database timestamps use UTC; presentation uses the user's locale.

## Reveal transaction

When the second member submits, the server locks the answer round, verifies two valid submissions, marks it revealed exactly once, and returns the comparison result. Frontend hiding is never used as the security boundary.
