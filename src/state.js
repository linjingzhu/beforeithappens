export const ROLES = ["a", "b"];

function emptyRole() {
  return { draftChoice: null, privateNote: "", submittedChoice: null, submittedAt: null };
}

export function createInitialState(questionIds, pack = {}) {
  return {
    version: 3,
    packId: pack.id || null,
    packVersion: pack.version || null,
    index: 0,
    activeRole: "a",
    questions: Object.fromEntries(questionIds.map((id) => [id, {
      round: 1,
      roles: { a: emptyRole(), b: emptyRole() },
      shared: { proposal: "", proposedBy: null, approvedBy: null, status: "none" }
    }]))
  };
}

export function normalizeState(value, questionIds, choiceIdsByQuestion = {}, pack = {}) {
  const clean = createInitialState(questionIds, pack);
  if (!value || typeof value !== "object") return clean;
  if (value.packId && (value.packId !== pack.id || value.packVersion !== pack.version)) return clean;
  clean.index = Number.isInteger(value.index) && value.index >= 0 && value.index < questionIds.length ? value.index : 0;
  clean.activeRole = ROLES.includes(value.activeRole) ? value.activeRole : "a";
  for (const id of questionIds) {
    const source = value.questions?.[id];
    for (const role of ROLES) {
      const input = source?.roles?.[role];
      const allowed = choiceIdsByQuestion[id] || [];
      const valid = (choice) => typeof choice === "string" && allowed.includes(choice) ? choice : Number.isInteger(choice) && allowed[choice] ? allowed[choice] : null;
      const submittedChoice = valid(input?.submittedChoice);
      clean.questions[id].roles[role] = {
        draftChoice: valid(input?.draftChoice),
        privateNote: typeof input?.privateNote === "string" ? input.privateNote : "",
        submittedChoice,
        submittedAt: submittedChoice !== null && typeof input?.submittedAt === "string" ? input.submittedAt : null
      };
    }
    const shared = source?.shared;
    const proposedBy = ROLES.includes(shared?.proposedBy) ? shared.proposedBy : null;
    const approvedBy = ROLES.includes(shared?.approvedBy) && shared.approvedBy !== proposedBy ? shared.approvedBy : null;
    const proposal = typeof shared?.proposal === "string" ? shared.proposal : "";
    const status = shared?.status === "agreed" && proposal.trim() && proposedBy && approvedBy && approvedBy !== proposedBy ? "agreed" : shared?.status === "deferred" ? "deferred" : shared?.status === "pending" && proposal.trim() && proposedBy ? "pending" : "none";
    clean.questions[id].shared = { proposal, proposedBy: ["pending", "agreed"].includes(status) ? proposedBy : null, approvedBy: status === "agreed" ? approvedBy : null, status };
  }
  return clean;
}

export function isSubmitted(roleState) { return roleState.submittedChoice !== null; }
export function isRevealed(questionState) { return ROLES.every((role) => isSubmitted(questionState.roles[role])); }

export function comparisonFor(questionState) {
  if (!isRevealed(questionState)) return { key: "waiting", label: "공개 대기", detail: "두 사람의 제출이 모두 완료되면 답이 함께 열려요." };
  if (questionState.roles.a.submittedChoice === questionState.roles.b.submittedChoice) return { key: "aligned", label: "같은 선택, 다른 이유일 수도 있어요", detail: "선택은 같지만 그 이유와 기대까지 같은지는 대화로 확인해 보세요." };
  return { key: "discuss", label: "서로 다른 우선순위를 발견했어요", detail: "정답이나 점수가 아닌, 서로 중요하게 보는 지점을 발견한 상태예요." };
}

export function submittedCount(state, role, questionIds) {
  return questionIds.filter((id) => isSubmitted(state.questions[id].roles[role])).length;
}

export function canApproveAgreement(shared, role) {
  return shared?.status === "pending" && Boolean(shared.proposal?.trim()) && ROLES.includes(shared.proposedBy) && shared.proposedBy !== role;
}
