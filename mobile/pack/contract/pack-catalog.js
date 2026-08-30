import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const catalogPath = join(dirname(fileURLToPath(import.meta.url)), "marriage-pack.json");

export function loadMarriagePack(source = catalogPath) {
  const pack = typeof source === "string" ? JSON.parse(readFileSync(source, "utf8")) : source;
  const questions = Array.isArray(pack.questions) ? pack.questions : [];
  return {
    id: pack.id,
    version: pack.version,
    locale: pack.locale || "ko-KR",
    title: pack.title,
    questions,
    questionIds: questions.map((question) => question.id),
    choiceIdsByQuestion: Object.fromEntries(
      questions.map((question) => [question.id, (question.choices || []).map((choice) => choice.id)])
    )
  };
}

export function questionAt(pack, index) {
  if (!Number.isInteger(index) || index < 0 || index >= pack.questions.length) return null;
  return pack.questions[index];
}

export function choiceLabel(question, choiceId) {
  return question?.choices?.find((choice) => choice.id === choiceId)?.label || "";
}
