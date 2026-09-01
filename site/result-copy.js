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
  ctaAction: "둘이 함께 해보기"
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
