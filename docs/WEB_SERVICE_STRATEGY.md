# Web service strategy — the question site that feeds the app

Two products, one content core. This file is the routing document for the web service; where it
and `docs/PRODUCT_SPEC.md` disagree about the **app**, the spec wins. The web service is not
governed by that spec, which is exactly why the boundary below has to be explicit.

## What is being built

A public, ad-supported question site. First topic `연애`, 100 questions across four movements,
ten to a page, ten pages. Finish the set and a result sheet is produced and sent to the address the
person gave, or to KakaoTalk. Topics multiply after that — 인생의 질문들.

Its job is priming water. The site answers a question someone has **alone**; the app answers one
that takes **two people**. The site earns attention and an email; the app earns money.

## The one collision, and how it is resolved

`docs/PRODUCT_SPEC.md` states product law for the app: **no scores, no diagnoses, no
probabilities, no faces, no graphs.** Comparison stays `같음` / `가까움` / `이야기해요`.

The proposed result sheet answers "내가 만나고 있는 그 사람은 나에게 좋은 사람인가?" — which, if
it answers, **is a diagnosis**. Not a near miss: the exact thing the app forbids.

There are only two honest resolutions.

1. **Separate brand and separate rules.** The site diagnoses; the app does not; they do not share a
   name. Clean, and throws away the funnel — a person who trusts the diagnosis has no reason to
   believe the app's refusal to diagnose, and vice versa.
2. **The sheet reflects rather than judges.** It gives the person back what they said, organised so
   they can see it, and names what they might want to talk about. It scores nothing.

**Take 2.** It keeps one brand, and it is also the better product. Nobody needs a stranger's
verdict on their relationship; what is actually scarce is seeing your own answers laid out in one
place. That is the same discipline the app already runs on, applied to one person instead of two —
and it is the honest version, because no 100-question form is entitled to a verdict.

Concretely, the sheet may say: 이 열 가지에는 확신이 있었고, 이 여섯 가지에서는 망설였고, 이
세 가지는 아직 상대와 이야기해 본 적이 없다고 답하셨어요. It may not say: 이 관계는 건강합니다,
헤어지는 것이 좋겠습니다, 궁합 72점, or anything shaped like those.

## Safety, which is not optional here

A hundred questions answered alone about a partner will, in some fraction of cases, be answered by
someone in a controlling or abusive relationship. That is not an edge case to wave at; it is the
predictable tail of this exact question set. Two failure modes follow, and both are ours:

- A sheet that reassures — "대체로 좋은 관계로 보여요" — read by someone being harmed.
- A sheet that alarms, **delivered to an inbox or a KakaoTalk their partner can open.**

The second is the more dangerous one and it is created by the delivery mechanism, not the content.
Design consequences, all cheap:

- Reflect, never judge (above). A reflection is far less dangerous when read by the wrong person.
- **Show the sheet on screen first.** Delivery is opt-in, after they have seen it and chosen.
- Say plainly what the email will look like before sending, and make a neutral subject line the
  default — the subject is the part a partner sees without opening anything.
- A visible way to leave without a trace: clear answers, no delivery, no account.
- Somewhere on the result page, a line pointing at real help (여성긴급전화 1366 and equivalents),
  chosen and checked by the owner rather than invented here.

None of this makes the product timid. It makes it trustworthy, which is the only reason anyone
would hand it a hundred honest answers.

## Ads: in the page, not between the pages

An ad on every page turn is an interstitial. Interstitials are the pattern most exposed to
Google's intrusive-interstitial treatment in search, and page-turn ad refreshes in a single-page
app are the shape that reads as impression inflation.

They are also wrong on the merits. Question 34 of a set about whether the person you love is good
for you is not a moment to interrupt for money.

Put units **inside** the page — after the ten questions, before the next-page control — and let a
real page load per page carry a real impression. Ten pages is ten page loads; that is already the
inventory. Nothing needs to be squeezed out of the transition.

## Personal data comes back the moment delivery does

The earlier argument that a public page carries no privacy burden held only while the page
collected nothing. An email address plus a hundred answers about a relationship is personal data,
and the answers sit close enough to 민감정보 that `docs/PRIVACY.md:215` already flags the category.

So the site needs, before it can take a single address: a published privacy policy, a consent step,
an age gate, and a named 보호책임자. Those are the same 54 placeholders already open for the app
(`docs/PRIVACY.md`, `docs/proposals/privacy-policy-ko.md`) — the work is shared, not doubled.

Two delivery-specific facts:

- **Email** needs the Resend domain verification that is already blocking the app. Until then
  `onboarding@resend.dev` reaches only the Resend account owner.
- **KakaoTalk** delivery is not a share link. 알림톡/친구톡 needs a 카카오 비즈니스 채널, a
  발신프로필, and per-template review. That is a lead time, not a task. Ship email first; add
  KakaoTalk when the channel exists.

## Architecture: separate deployment, shared core

Separate the **hosts**, share the **content**.

A public site that wants traffic and an API that holds couples' private notes should not be the
same process on the same origin. Different scaling, different blast radius, different privacy
posture. The site is mostly static; it can sit somewhere cheap and cacheable.

What both sides share is the part that is expensive to write twice:

| Shared | Why |
|---|---|
| Question content and its shape | `intent` / `example` / `whyItMatters` / `researchKeywords` / four choices already exist |
| Design tokens (`src/design-tokens.js`) | One visual system across web, site and app |
| The share row and its copy | Already unified across four surfaces |
| Privacy documents | Same operator, same obligations |

**And the thing that makes this worth doing beyond ads:** the site cannot be built without a pack
registry. `src/questions.js` exports exactly `marriagePack` and `questions` — one pack, hardcoded.
`docs/ROADMAP.md` M6 says a second pack cannot ship without a registry. Building the site properly
creates it, and the app gets it for free. The web service is not a detour from M6; it is the thing
that forces it.

Note the app already reserves the slot: `PACK_LIST_ROWS[0]` is `{ id: "dating", label: "연애" }`,
locked by assertion in `src/pair-code.js:206`. The site's first topic and the app's first
coming-soon pack are the same pack. Write the questions once.

## Order of work

1. **Pack registry.** Make packs data, not a hardcoded export. Serves the site and unblocks M6.
2. **Site skeleton** on its own origin: ten paginated pages, question rendering from the registry,
   SEO metadata, structured data, a CTA into the app.
3. **Write `연애` 100문항** in four movements. This is the long pole and it is writing, not code.
4. **Result sheet, on screen only.** Reflection, no verdict, no delivery yet.
5. **Consent, policy, age gate** — the gate before any address is accepted.
6. **Email delivery** once the Resend domain is verified.
7. **Ads** once there is enough content to pass review; in-page units only.
8. **KakaoTalk** when the business channel and templates exist.

Steps 1–4 need nothing from outside the repository. Steps 5–8 each wait on an owner action that
has its own lead time, which is why they are last and why none of them blocks the others.

## Decisions the owner still owns

1. **Reflect or judge.** This document recommends reflect, and everything above assumes it. Choosing
   judge means a separate brand and a different legal posture, and should be decided now rather
   than discovered at launch.
2. **Domain and hosting** for the site, separate from the API origin.
3. **The four movements' balance** — how the 100 questions divide across 나와 맞는가 / 좋은
   사람인가 / 행복하고 성장하는가 / 미래를 함께할 수있는가.
4. **Where the help line goes and which one**, per the safety section.
5. **Whether the site takes accounts at all**, or stays anonymous with delivery-only email. Anonymous
   is simpler, safer, and gives up the ability to say "이어서 하기".

## What this document does not decide

Nothing here changes `docs/PRODUCT_SPEC.md`. The app keeps its rules. If the site ever needs a rule
that contradicts the app's, that contradiction goes in this file with a reason, not into the spec.
