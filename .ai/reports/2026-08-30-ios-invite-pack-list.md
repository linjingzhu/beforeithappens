# iOS measurement: in-app consume, Q1 persist, invite, pack-list

## Delivered
- Magic-link consume URL is `loveme:///auth/consume?token=...`. GET `/auth/consume` hops into the app instead of the old web form.
- Preview Q1 draft persists across leave/mail/consume. Consume resumes that draft, then invite after save. Consume never lands on the pack list.
- After logged-in Q1 save, the locked pair-code invite screen is shown. Share buttons send `/invite/open` only.
- Cold logged-in home (no in-flight Q1 / invite) is the `질문집` list. Profile sheet stays out.

## Verification
- `npm test`: 155 passed (plus routing lock additions)
- `npm run lint`: 30 source files
- Not merged
