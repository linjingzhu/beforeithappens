# LoveMe pack S6–S8

Native iOS and Android marriage-pack slice. It reuses the web AnswerRound and public-lock HTTP APIs. This folder is the only write surface for this pack.

## Screens

- **S6** `PackReadyView` / `PackReadyScreen` — CTA `결혼 팩 시작하기` only when `session.workspace.acceptedPartner === true`. Ghost workspaces stay locked.
- **S7** one question per screen. Drafts and private notes show `나만 보임` and stay author-only. Submit writes the current private round. Local-simulator drafts are never read or migrated.
- **S8** both submits write an immutable public lock. Shared actions are `합의` and `다음에 미룸`. `다시 답하기` opens a new private round and never mutates the previous lock.

Out of this pack: payment/paywall (a later pack after the third sample lock), the 100-question line, install landing, magic-link, invite wait/join, and session handoff. S7–S8 stay open after sample questions; they are not gated on 29,000 KRW, a subscription, or partner billing. If a comparison label is shown it is only `ALIGNED`, `CLOSE`, or `DISCUSS` — never a relationship diagnosis.

## Integration

S4–S5 should present the pack-ready screen after partner accept and pass the existing `ab_session` cookie plus workspace role. Do not add a join or install landing here. Android `PackHttp` writes the real HTTP method on the socket, including `PATCH /api/pack/draft`. Hosts may still inject OkHttp via `PackClient.send`. Do not rewrite drafts to `POST` and do not add pack endpoints.

```text
GET    /api/pack/state
PATCH  /api/pack/draft      { questionId, draftChoice, privateNote, index }
POST   /api/pack/submit     { questionId, index }
POST   /api/pack/agreement  { questionId, action, proposal, index }
```

Agreement actions: `propose` / `approve` from `합의`, `deferred` from `다음에 미룸`.

## Files

- `contract/` shared gate, copy, catalog, client, projection
- `ios/LoveMePack/` SwiftUI screens and view model
- `android/src/main/java/app/loveme/pack/` Compose screens and view model
- `test/` Node tests against the existing web APIs

## Verify

```text
node --test mobile/pack/test/*.test.js
```
