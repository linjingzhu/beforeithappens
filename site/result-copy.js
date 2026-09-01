/**
 * The result sheet's words, with no imports, so the browser can load them without the pack
 * registry coming along. `site/result.js` re-exports these for the build side.
 *
 * `RESULT_FORBIDDEN` is asserted by the tests rather than left to discipline: the pull toward a
 * score is constant, and turning a reflection into a verdict is the one change that would break
 * what `docs/WEB_SERVICE_STRATEGY.md` promises.
 */
export const RESULT_COPY = Object.freeze({
  title: "내가 답한 것들",
  lead: "고른 답을 그대로 모았어요. 점수도, 판정도 없습니다.",
  answeredLabel: "답한 질문",
  notDiscussedLabel: "아직 이야기해 본 적 없다고 표시한 질문",
  notDiscussedLead: "여기부터 꺼내 보면 좋겠어요.",
  emptyTitle: "아직 답한 질문이 없어요.",
  emptyBody: "질문을 하나씩 보면서 지금의 생각을 골라 보세요.",
  incompleteNote: "아직 답하지 않은 질문이 남아 있어요. 지금까지 답한 것만 모았습니다.",
  chapterLabel: "장",
  clearAction: "답한 내용 지우기",
  clearNote: "이 브라우저에만 저장돼 있어요. 지우면 남지 않습니다.",
  ctaTitle: "이 질문들, 상대와 같이 열어 볼까요?",
  ctaBody: "같은 질문에 상대도 답하면 서로의 답을 같은 화면에서 볼 수 있어요. 먼저 답한 사람의 답은 상대가 낼 때까지 보이지 않습니다.",
  /*
   * Comparing with the other person. The link carries the choices only, and the words say so —
   * someone about to hand their answers to a person they live with should not have to guess what
   * is in the link.
   */
  shareAction: "내 답 링크 만들기",
  shareNote: "고른 답만 담깁니다. 옆에 적은 메모는 이 브라우저에만 남아요.",
  shareCopied: "링크를 복사했어요. 상대에게 보내 주세요.",
  shareManual: "복사가 안 되면 아래 주소를 직접 보내 주세요.",
  shareEmpty: "먼저 질문에 답해야 보낼 답이 생겨요.",
  compareTitle: "상대가 보낸 답",
  compareLead: "같은 질문에 두 사람이 무엇을 골랐는지 나란히 봅니다.",
  compareGateTitle: "먼저 답해 주세요.",
  compareGateBody: "상대의 답은 같은 질문에 내가 답한 뒤에 열립니다. 먼저 보고 나면 내 답도 그 답에 맞춰지니까요.",
  compareDifferentLabel: "서로 다르게 고른 질문",
  compareDifferentLead: "여기부터 이야기해 보면 좋겠어요. 다른 답은 틀린 답이 아닙니다.",
  compareSameLabel: "같은 답을 고른 질문",
  compareWaitingLabel: "상대는 답했지만 내가 아직 답하지 않은 질문",
  compareWaitingLead: "내가 답하면 그때 상대의 답이 함께 열립니다.",
  compareMine: "나",
  compareTheirs: "상대",
  compareUnreadable: "링크를 읽을 수 없어요. 같은 질문집의 링크인지 확인해 주세요.",
  compareCount: (n, total) => `두 사람 모두 답한 질문 ${n} / ${total}`,
  /*
   * Mailing a result. The site has no server and sends nothing: this opens the reader's own mail
   * app with the text already written, the recipient blank so no address is ever ours, and a copy
   * button beside it for the machines where `mailto:` does nothing at all.
   */
  mailAction: "메일로 보내기",
  mailCopy: "본문 복사",
  mailNote: "메일 앱이 열립니다. 받는 사람은 직접 고르세요. 이 사이트는 아무것도 전송하지 않아요.",
  mailCopied: "본문을 복사했어요.",
  mailEmpty: "먼저 질문에 답해야 보낼 내용이 생겨요.",
  mailSubject: (title) => `${title} · 내가 고른 답`,
  mailSubjectCompared: (title) => `${title} · 우리가 다르게 고른 질문`,
  mailMine: "나",
  mailTheirs: "상대",
  mailBothWarning: "이 메일에는 두 사람의 답이 들어 있어요.",
  mailMore: (n) => `그 밖에 ${n}개가 더 있어요. 전체는 아래 링크에서 볼 수 있어요.`,
  mailLinkLabel: "전체 보기"
});

/**
 * Shapes the sheet must never take. Asserted in tests rather than left to discipline, because the
 * pull toward a score is constant and it is the one change that would break the product's promise.
 */
export const RESULT_FORBIDDEN = Object.freeze([
  "점수",
  "진단",
  "궁합",
  "확률",
  "등급",
  "위험",
  "건강한 관계",
  "헤어",
  "이별",
  "추천드립니다"
]);
