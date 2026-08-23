# AB MVP UX Contract

## Experience rules

- The product entry is magic-link email onboarding. There is no password, Kakao button, or role switcher on the signed-out path.
- Explain expected time and the reveal rule before answering starts. The pack opens only after the partner accepts the invite. The invited partner is free. Payment and the 100-question lifecycle line are out of this slice.
- Use one question per screen with explicit save state and resume behavior.
- Let one person continue while waiting for the partner, after the pack is unlocked.
- Reveal only questions submitted by both people.
- Describe results as similarities, different priorities, and conversation opportunities.
- Label private and shared writing areas with text, not color alone.
- A shared agreement requires the partner's approval; edits require reapproval.
- Summaries show conversations, agreements, deferrals, and revisit items—not a relationship score.
- Device handoff is logout, then handing the phone. The UI never offers a same-device role switch as the product path.

## Foundation auth flow

### Entry point

Signed-out `/`. Primary action: request a login link.

### Required copy

| State | Copy |
|---|---|
| Title | 두 사람의 결혼 준비, 한곳에 |
| Body | 비밀번호 없이 이메일로 로그인 링크를 보내드려요. |
| CTA | 로그인 링크 보내기 |
| After send | 메일을 확인해 주세요. 링크는 10분 동안만 유효해요. |
| Immediately after login | 이 기기 임시 답은 이어지지 않아요. |
| Next to logout only | 로그아웃 후 이 기기를 넘겨주세요. |

Device-handoff copy is forbidden in the onboarding body. It may appear only next to logout.

Invite-waiting home (buyer, no pack CTA):

| State | Copy |
|---|---|
| Title | 파트너 초대 |
| Status | 대기중 / 만료 남은 시간 / 마지막 발송 시각 |
| Reissue CTA | 다시 보내기 |
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

Instagram and KakaoTalk buttons share the existing invite link through copy or the system share intent. Do not add Kakao login. Editing the partner email and resending immediately expires the previous token. Opening an invite while another account is logged in cannot accept; the CTA force-logs out and continues the web magic-link accept for the invited email. Native join, store landing, and universal links are out of this slice.

### Expected visible result

1. Valid email plus CTA shows the sent copy. The magic link is valid for 10 minutes.
2. A valid link establishes one server session and shows the post-login notice before anything else.
3. Buyer home is invite-waiting. It has no pack CTA and does not open the marriage pack.
4. After the first send, buyer home shows share copy, copy/Instagram/KakaoTalk actions for the existing invite link, the device rule, and the email-typo field with `이메일 수정하고 다시 보내기`.
5. Opening an invite while another account is logged in shows the same-session copy and `로그아웃하고 넘기기`. Accept cannot succeed. The CTA force-logs out and continues magic-link accept for the invited email.
6. Logout returns the user to onboarding and invalidates the session.

### Important states

- initial onboarding, sending, sent, invalid email, send failed;
- expired or invalid magic link;
- post-login notice;
- invite waiting, share/copy, email typo resend, expired invite, invalid invite;
- same-session other account, email mismatch;
- unanswered, editing, saving, saved, save failed;
- only me submitted, only partner submitted, both submitted;
- revealed, revised, needs reconfirmation;
- agreement draft, awaiting approval, agreed, revised;
- offline, reconnecting, conflict, disconnected.

### Disabled / blocked behavior

- Empty or invalid email cannot send a link.
- Unauthenticated sessions cannot open the pack.
- Sessions without an accepted partner cannot open the pack, including ghost workspaces.
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
