# Project Lessons

Repository-specific memory for reducing rediscovery and repeated mistakes.

Do not copy this file into unrelated projects.

## Conflict Hotspots

- None recorded yet.

## Build / Compile Lessons

- None recorded yet.

## UX / Runtime Lessons

- None recorded yet.

## Domain Risk Lessons

### 2026-08-23 — Invite latest-row ties
Area: couple invite view
Evidence: Two `issueInvite` calls in the same clock ms left `latestInvite` pointing at the first row when sort compared only `createdAt`.
Impact: Email-typo resend expired the old token but buyer home could still show the old address/share URL.
Recommended future behavior: Break invite recency ties by last-sent time, then by insertion order.
Confidence: high

## Strategy Observations

### 2026-08-23 — Magic-link delivery must fail closed
Area: auth / persistence
Evidence: Isolated review of the P0 session slice found unconditional console logging of consume URLs and `/api/dev/outbox` enabled whenever `NODE_ENV` was not production.
Impact: In any forgotten-env deployment those paths are a full account-takeover vector.
Recommended future behavior: Keep login secrets opt-in (`AB_DEV_OUTBOX=1`) and treat real mail transport as a launch prerequisite.
Confidence: high

## Recording rule

Add only concise, evidence-backed facts such as:

```text
### 2026-XX-XX — <lesson>
Area:
Evidence:
Impact:
Recommended future behavior:
Confidence:
```

Prefer facts that can change future Mission Packing, verification timing, or conflict prevention.

Remove/replace stale lessons when repository reality changes.
