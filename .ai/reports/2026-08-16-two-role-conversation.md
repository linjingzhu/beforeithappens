# Two-role conversation slice

## Scope

- Added role A/B switching for one-browser workflow simulation.
- Separated private drafts from locked submitted answer snapshots.
- Added per-question two-person reveal barrier.
- Added neutral side-by-side comparison.
- Added agreement proposal and opposite-role approval.
- Added explicit revisit state and full local reset.

## Product boundaries

- This is a shared-browser simulator, not authentication or a privacy boundary.
- Role switching can expose both roles' local drafts and private notes.
- Private notes are not rendered in comparison or shared agreement output.
- Submitted answers are locked in this slice; answer revision rounds are deferred.

## Verification

- JavaScript syntax checks passed.
- Repository lint script passed.
- Node tests: 7 passed.
- Static production build passed.
- Git whitespace validation passed.
- Cloud-browser runtime verification was attempted but browser control became unavailable; hosted product verification remains required after deployment.

## Review corrections

- Replaced role-local answer flags with draft and submitted snapshots.
- Removed false privacy promise for shared-device demo mode.
- Required the opposite role to approve a proposed agreement.
- Editing a proposal invalidates prior approval and requires a new proposal.
- Prevented malformed storage and self-approval from restoring as agreed state.
