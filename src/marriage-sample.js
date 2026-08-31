import { questions } from "./questions.js";
import { packListLabel } from "./pair-code.js";

export const SAMPLE_SIZE = 3;
export const REASON_PROMPT = "왜 그 선택인지 한 줄로 적어주세요.";
export const SAMPLE_NEXT = "다음";
export const SAMPLE_RESULT_EXAMPLE = "예시입니다";
export const TOGETHER_CTA = "함께 풀어보기";

export const SAMPLE_LABELS = Object.freeze({
  aligned: "같음",
  close: "가까움",
  discuss: "이야기해요"
});

export const CERTIFICATE_COPY = Object.freeze({
  body: "두 사람이 이 질문집을 마쳤어요",
  cta: "홈으로",
  debugExtra: "수료",
  stamp: "♡"
});

/** Only marriage has existing 4-choice questions in-repo. Other packs must not invent copy. */
export const PACK_EXISTING_QUESTION_IDS = Object.freeze({
  marriage: null,
  dating: Object.freeze([]),
  "home-mgmt": Object.freeze([]),
  pregnancy: Object.freeze([]),
  birth: Object.freeze([]),
  parenting: Object.freeze([])
});

export function existingFourChoiceQuestions(source = questions) {
  return (source || []).filter((question) => Array.isArray(question.choices) && question.choices.length === 4);
}

export function existingMarriageQuestions(source = questions) {
  return existingFourChoiceQuestions(source);
}

export function existingQuestionsForPack(packId, source = questions) {
  const pool = existingFourChoiceQuestions(source);
  if (!packId || packId === "marriage") return pool;
  const ids = PACK_EXISTING_QUESTION_IDS[packId];
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const allow = new Set(ids);
  return pool.filter((question) => allow.has(question.id));
}

function shuffle(list, rng) {
  const pool = list.slice();
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

export function mapSampleQuestion(question) {
  return {
    id: question.id,
    title: question.title,
    choices: question.choices.map((choice) => ({ id: choice.id, label: choice.label }))
  };
}

export function pickPackSample(packId, source = questions, rng = Math.random) {
  return shuffle(existingQuestionsForPack(packId, source), rng)
    .slice(0, SAMPLE_SIZE)
    .map(mapSampleQuestion);
}

export function pickMarriageSample(source = questions, rng = Math.random) {
  return pickPackSample("marriage", source, rng);
}

export function sampleCounterLabel(packId, index = 0, total = SAMPLE_SIZE) {
  const name = packListLabel(packId) || "결혼";
  const max = Number(total) > 0 ? Number(total) : SAMPLE_SIZE;
  return `${name} ${Number(index) + 1}/${max}`;
}

export function pickPartnerChoice(question, myChoiceId, rng = Math.random) {
  const others = (question?.choices || []).filter((choice) => choice.id !== myChoiceId);
  if (!others.length) return question?.choices?.[0] || null;
  return others[Math.floor(rng() * others.length)];
}

export function classifySamplePair(question, userChoiceId, partnerChoiceId) {
  const choices = question?.choices || [];
  const userIndex = choices.findIndex((choice) => choice.id === userChoiceId);
  const partnerIndex = choices.findIndex((choice) => choice.id === partnerChoiceId);
  if (userIndex < 0 || partnerIndex < 0) return "discuss";
  if (userIndex === partnerIndex) return "aligned";
  if (Math.abs(userIndex - partnerIndex) === 1) return "close";
  return "discuss";
}

export function countSampleLabels(answers, questions) {
  const counts = { aligned: 0, close: 0, discuss: 0 };
  const byId = new Map((questions || []).map((question) => [question.id, question]));
  for (const answer of answers || []) {
    const key = classifySamplePair(byId.get(answer.questionId), answer.choiceId, answer.partnerChoiceId);
    counts[key] += 1;
  }
  return counts;
}

export function sampleAnswerComplete(choiceId, reason) {
  return Boolean(String(choiceId || "").trim()) && Boolean(String(reason || "").trim());
}

/** Discarded 1-question coming-soon path. Packs without a catalog contribute no invented copy. */
export function comingSoonExistingQuestion(_packId) {
  return "";
}
