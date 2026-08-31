import { PACK_LIST_ROWS, packListLabel } from "./pair-code.js";

/**
 * The narration a pack opens with, once per pack. It sets the mood and says what the
 * questions are about. It never sells, scores, or promises an outcome.
 */
export const PACK_INTRO_COPY = Object.freeze({
  start: "시작하기"
});

/** Timing for the staggered reveal, shared by the app and the preview harness. */
export const PACK_INTRO_MOTION = Object.freeze({
  lineDelayMs: 420,
  durationMs: 620,
  riseFrom: 10
});

export const PACK_INTRO_LINES = Object.freeze({
  dating: Object.freeze([
    "아직 서로를 알아가는 중입니다.",
    "좋아하는 것보다, 다른 것을 먼저 알게 될 거예요.",
    "다름을 확인하는 일은 멀어지는 일이 아닙니다."
  ]),
  marriage: Object.freeze([
    "곧 같은 집에서 아침을 맞이하게 됩니다.",
    "집, 돈, 양가, 다툼, 그리고 앞으로의 시간.",
    "언젠가 부딪힐 이야기를 지금 꺼내 봅니다."
  ]),
  "home-mgmt": Object.freeze([
    "함께 사는 일은 매일의 결정으로 이루어집니다.",
    "누가 무엇을 맡을지, 무엇을 미룰지.",
    "사소해 보이는 것이 가장 오래 남습니다."
  ]),
  pregnancy: Object.freeze([
    "두 사람의 몸과 하루가 달라지기 시작합니다.",
    "기대하는 것과, 솔직히 두려운 것.",
    "혼자 감당하지 않도록 미리 나눠 봅니다."
  ]),
  birth: Object.freeze([
    "정해야 할 일이 갑자기 많아지는 시기입니다.",
    "어디서, 누구와, 무엇을 먼저.",
    "급해지기 전에 이야기해 둡니다."
  ]),
  parenting: Object.freeze([
    "두 사람 모두 처음 해보는 일이 시작됩니다.",
    "어떻게 키울지, 무엇을 물려줄지.",
    "정답을 찾기보다 서로의 기준을 맞춰 봅니다."
  ])
});

export function packIntroLines(packId) {
  return PACK_INTRO_LINES[String(packId || "")] || [];
}

export function packIntroTitle(packId) {
  return packListLabel(packId) || "";
}

export function introSeen(seen, packId) {
  return Array.isArray(seen) && seen.includes(String(packId || ""));
}

export function markIntroSeen(seen, packId) {
  const id = String(packId || "");
  const current = Array.isArray(seen) ? seen : [];
  return introSeen(current, id) ? current : [...current, id];
}

export function everyPackHasIntro() {
  return PACK_LIST_ROWS.every((row) => packIntroLines(row.id).length > 0);
}
