# AB MVP UX Contract

## Experience rules

- The product entry is magic-link email onboarding. There is no password, Kakao button, or role switcher on the signed-out path.
- Explain expected time and the reveal rule before answering starts. Answering does not start until a partner has accepted the invite.
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

### Expected visible result

1. Valid email plus CTA shows the sent copy. The magic link is valid for 10 minutes.
2. A valid link establishes one server session and shows the post-login notice before anything else.
3. Buyer home is invite-waiting. It has no pack CTA and does not open the marriage pack.
4. Logout returns the user to onboarding and invalidates the session.

### Important states

- initial onboarding, sending, sent, invalid email, send failed;
- expired or invalid magic link;
- post-login notice;
- invite waiting, expired invite, invalid invite;
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
