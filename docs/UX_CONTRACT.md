# AB MVP UX Contract

## Experience rules

- The product entry is magic-link email onboarding plus Kakao/Naver/Google start. There is no password or role switcher. Kakao login copy is `카카오로 시작`. S4 share stays `카카오톡`. iOS measurement next-build is browse-first (no social stubs): splash → `질문집` home without login. Marriage pack detail and coming-soon taste are readable logged out. Login (magic link only) opens only when tapping `링크 보내기`, in-app `연결하기`, 결제, or `계정`. After a successful consume, return to that intended destination (notice first when present). Discarded: unauthenticated cover, preview Q1 before login, `미리 질문 하나 보기`, `이 답을 남기려면 로그인해 주세요`. Pack list: `결혼만 지금 열려 있어요.` Closed packs show `곧 열려요` and open a coming-soon taste, not a sale or invite. Top-right `계정`. Account has email + `로그아웃` only. Invite title is `링크 보내기` with `초대를 보내면 상대도 같은 팩을 받아요.` Questions stay closed until a partner connects. Coming-soon taste: `임시 체험` / `가사와 시간은 어떻게 나누고 싶나요?` / `결과 맛보기` / `목록으로`. Result labels are `같음` / `가까움` / `이야기해요` (never `ALIGNED` / `CLOSE` / `DISCUSS`). Safe Area: top chrome below the Dynamic Island, bottom CTAs above the home indicator. No QR-code screen.
- Explain expected time and the reveal rule before answering starts. The pack opens only after the partner accepts the invite. The invited partner is free. After the third sample lock, remaining questions stay locked until a buyer 29,000 KRW entitlement. The 100-question lifecycle line is out of this slice.
- Use one question per screen with explicit save state and resume behavior.
- Let one person continue while waiting for the partner, after the pack is unlocked.
- Reveal only questions submitted by both people.
- Describe results as similarities, different priorities, and conversation opportunities.
- Label private and shared writing areas with text, not color alone.
- A shared agreement requires the partner's approval; edits require reapproval.
- Summaries show conversations, agreements, deferrals, and revisit items—not a relationship score.
- LoveMe NEXT home (this PR; live `d3be894e` stays splash→`질문집`): splash → magic-link login (`로그인 링크 보내기`, iOS system notification permission, virtual `[debug]` send) → `질문집` with hearts from 0. Coming-soon packs keep `곧 열려요` and use the marriage sample engine on existing questions only (no invented `임신`/`출산`/`육아` copy). Shop SKU `29,000원에 하트 12`; `열기` costs 10 hearts (enough → `열기` only). After 3 sample questions stay on sample result (`예시입니다` / `같음`·`가까움`·`이야기해요`), not the certificate. After virtual 10-heart `열기`, certificate: pack name, `두 사람이 이 질문집을 마쳤어요`, counts for `같음` / `가까움` / `이야기해요` only, heart stamp, CTA `홈으로`, `[debug] 수료` (not a conversion). No scores, faces, or graphs. Titles/stems: MaruBuri. Body/choices/buttons/`곧 열려요`: Pretendard. Sample header `결혼 1/3`. Prompt `왜 그 선택인지 한 줄로 적어주세요.` Do not show the font-name label `MaruBuri 🐾`.


## Foundation auth flow

### Entry point

Signed-out `/` on web: request a login link. iOS measurement first run: splash then `질문집` home. Login is a keep-gate, not the first screen. LoveMe NEXT home on this PR is splash then magic-link login then `질문집`.

### Required copy

| State | Copy |
|---|---|
| Title | 두 사람의 결혼 준비, 한곳에 |
| Body | 비밀번호 없이 이메일로 로그인 링크를 보내드려요. |
| CTA | 로그인 링크 보내기 |
| After send | 메일을 확인해 주세요. 링크는 10분 동안만 유효해요. |
| Social start | 카카오로 시작 / 네이버로 시작 / Google로 시작 |
| Missing email title | 이메일을 연결해 주세요. |
| Missing email CTA | 이메일 연결하기 |
| Provider not configured | 이 로그인은 아직 준비 중이에요. 이메일 링크로 시작해 주세요. |
| Immediately after login | 이 기기 임시 답은 이어지지 않아요. |
| Next to logout only | 로그아웃 후 이 기기를 넘겨주세요. |

Device-handoff copy is forbidden in the onboarding body. It may appear only next to logout.

Invite-waiting home (buyer, no pack CTA):

| State | Copy |
|---|---|
| Title | 파트너 초대 |
| Status | 대기중 / 만료 남은 시간 / 마지막 발송 시각 |
| First-send CTA | 초대 보내기 |
| Reissue CTA | 이메일 수정하고 다시 보내기 |
| Rule | 같은 메일로만 수락할 수 있어요. 같은 폰에서 두 계정을 동시에 쓸 수는 없어요. |
| Share copy | 링크를 보내 파트너를 초대하세요. |
| Share buttons | 링크 복사 / 인스타그램 / 카카오톡 |
| Copy success | 링크를 복사했어요. |
| Device rule | 같은 폰에서 두 계정을 동시에 쓸 수는 없어요. |
| Email typo | 초대 메일이 맞는지 다시 확인해 주세요. |
| Email typo CTA | 이메일 수정하고 다시 보내기 |
| Same-session accept | 이 기기에 다른 계정으로 로그인되어 있어요. |
| Same-session CTA | 로그아웃하고 넘기기 |
| Success CTA after accept | 결혼 팩 시작하기 |
| Expired invite | 초대가 만료됐어요. 구매자에게 새 링크를 부탁해 주세요. |
| Email mismatch | 이 초대는 다른 이메일로 보내졌어요. 초대받은 메일로 로그인해야 해요. |
| Draft badge | 나만 보임 |

Recommended web install (not a gate):

| State | Copy |
|---|---|
| Logged-in banner | 앱에서 보면 초대와 알림이 더 쉬워요. |
| Banner CTA | 앱 설치하기 |
| Banner skip | 웹에서 계속 |
| Install landing title | 앱을 설치하면 시작할 수 있어요. |
| Store CTAs | App Store / Google Play |
| Landing secondary | 지금은 웹에서 시작할래요. |
| Instagram CTA | 시작하기 |
| In-app browser | 바로 설치가 안 될 수 있어요. Safari 또는 Chrome에서 열어 주세요. |
| In-app CTA | 브라우저에서 열기 |

Instagram and KakaoTalk buttons share the existing invite link through copy or the system share intent. Do not replace KakaoTalk share with Kakao login. Kakao/Naver, and Google without email, must connect email before invite accept. Editing the partner email and resending immediately expires the previous token. Opening an invite while another account is logged in cannot accept; the CTA force-logs out and continues the web magic-link accept for the invited email. Native join screens and universal links stay out of this slice. `시작하기` opens the web install landing and never the store. Install is recommended and skippable; the web path is never blocked on install.

### Expected visible result

1. Valid email plus CTA shows the sent copy. The magic link is valid for 10 minutes. Web S2 also shows `카카오로 시작` / `네이버로 시작` / `Google로 시작` without replacing the magic-link form. iOS measurement next-build is splash → `질문집` (no login gate) → marriage pack detail (`결혼` / `두 사람의 결혼 준비, 한곳에.` / `예시 질문` / `예상하지 못한 여유 자금이 생기면 어떻게 하고 싶나요?` / `명절 당일 양가 일정이 겹친다면 어떤 기본 원칙을 선호하나요?` / `우리에게 집은 어떤 의미에 가장 가까울까요?` / `여기서 답하지 않아요. 파트너가 연결된 다음 질문이 열려요.` / `링크 보내기`) readable logged out. Tapping `링크 보내기` / in-app `연결하기` / 결제 / `계정` opens login (`비밀번호 없이 이메일로 로그인 링크를 보내드려요.` / `로그인 링크 보내기`). After consume, return to that intended destination, not a generic home reset. Coming-soon packs from `질문집` (`가정 경영` `임신` `출산` `육아`) open `곧 열려요` / `임시 체험` / `가사와 시간은 어떻게 나누고 싶나요?` / `예시입니다. 여기서 답하거나 팔지 않아요.` / `결과 맛보기` / `목록으로`, then `결과 맛보기` / `같음` / `가까움` / `이야기해요` / `나` / `상대` / `진짜 비교는 열린 팩에서 둘이 낸 다음입니다.` / `예시입니다.` No `링크 보내기` there and no login. Discarded cover/preview-Q1 copy: `미리 질문 하나 보기`, `이 답을 남기려면 로그인해 주세요`. Login does not show `두 사람의 결혼 준비, 한곳에`; that line is marriage pack detail only. Consume opens the installed app via `loveme:///auth/consume` and lands on notice then the intended keep-gate (or `질문집` when there is no pending gate). Account is `계정` / `이메일` / `로그아웃`.
2. A valid link establishes one server session and shows the post-login notice before anything else.
3. Buyer home is invite-waiting. It has no pack CTA and does not open the marriage pack.
4. After the first send, buyer home shows share copy, copy/Instagram/KakaoTalk actions for the existing invite link, the device rule, and the email-typo field with `이메일 수정하고 다시 보내기`.
5. Opening an invite while another account is logged in shows the same-session copy and `로그아웃하고 넘기기`. Accept cannot succeed. The CTA force-logs out and continues magic-link accept for the invited email.
6. Logged-in buyer home and pack may show the install banner. `앱 설치하기` opens `/install`. `웹에서 계속` or `지금은 웹에서 시작할래요.` keeps the web flow open.
7. Instagram `시작하기` opens `/install`. In Instagram/Kakao in-app browsers the landing shows the in-app hint and `브라우저에서 열기`.
8. Logout on iOS measurement returns the user to `질문집` home. Web logout still returns to onboarding and invalidates the session.

### Important states

- initial onboarding, sending, sent, social start, missing-email bind, invalid email, send failed;
- expired or invalid magic link;
- post-login notice;
- invite waiting, share/copy, email typo resend, expired invite, invalid invite;
- same-session other account, email mismatch;
- recommended install banner, skipped banner, install landing, Instagram start, in-app browser hint;
- unanswered, editing, saving, saved, save failed;
- only me submitted, only partner submitted, both submitted;
- revealed, revised, needs reconfirmation;
- agreement draft, awaiting approval, agreed, revised;
- offline, reconnecting, conflict, disconnected.

### Disabled / blocked behavior

- Empty or invalid email cannot send a link.
- Unauthenticated sessions can browse `질문집`, marriage pack detail samples, and coming-soon taste. They cannot send an invite, connect a pair code, pay, or open `계정` until magic-link login succeeds.
- Sessions without an accepted partner cannot open the pack, including ghost workspaces.
- Install is never required. Skip and web-continue always return to the web flow.
- Onboarding does not migrate or resume local-simulator drafts.

### Error feedback and recovery

- Invalid email asks the user to check the address.
- Send failure offers retry.
- Expired or already-used links return the user to onboarding to request a new link.

## Accessibility floor

- Minimum 44px touch targets on mobile.
- Visible selection state beyond color.
- Full keyboard completion of the core flow, including onboarding.
- Programmatic labels and visible focus treatment.
- Reduced-motion support for reveal effects.
- Skip and revisit options for sensitive questions.
