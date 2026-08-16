import { questions } from "./questions.js";
import { canApproveAgreement, comparisonFor, isRevealed, isSubmitted, normalizeState, submittedCount } from "./state.js";

const STORAGE_KEY = "ab-couple-demo-v2";
const ids = questions.map((question) => question.id);
let state = loadState();
let saveStatus = "saved";

function loadState() {
  try { return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)), ids); }
  catch { return normalizeState(null, ids); }
}

function saveState() {
  try { saveStatus = "saving"; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); saveStatus = "saved"; return true; }
  catch { saveStatus = "failed"; return false; }
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function roleName(role) { return role === "a" ? "나" : "파트너"; }

function render() {
  const question = questions[state.index];
  const questionState = state.questions[question.id];
  const mine = questionState.roles[state.activeRole];
  const otherRole = state.activeRole === "a" ? "b" : "a";
  const revealed = isRevealed(questionState);
  const submitted = submittedCount(state, state.activeRole, ids);
  const progress = Math.round((submitted / questions.length) * 100);

  document.querySelector("#app").innerHTML = `
    <header class="topbar">
      <a class="brand" href="#" aria-label="AB 홈"><span>AB</span><strong>Before life changes, talk.</strong></a>
      <div class="role-switcher" aria-label="데모 역할 선택"><span>현재 역할</span><button data-role="a" aria-pressed="${state.activeRole === "a"}" class="${state.activeRole === "a" ? "active" : ""}">나</button><button data-role="b" aria-pressed="${state.activeRole === "b"}" class="${state.activeRole === "b" ? "active" : ""}">파트너</button></div>
    </header>
    <div class="role-announcement sr-only" role="status" aria-live="polite">현재 ${roleName(state.activeRole)} 역할입니다.</div>
    <main>
      <section class="demo-notice"><strong>두 사람 데모 모드</strong><p>한 브라우저에서 역할을 바꿔 진행 과정을 시험합니다. 역할 전환으로 다른 역할의 초안과 메모에 접근할 수 있으므로 공유 기기에서는 안전하지 않습니다.</p></section>
      <section class="journey">
        <div class="journey-copy"><span class="eyebrow">TWO-PERSON CONVERSATION · ROLE ${state.activeRole.toUpperCase()}</span><h1>${roleName(state.activeRole)}의 답을<br><em>먼저 생각해요.</em></h1><p>두 사람이 같은 질문에 제출하기 전에는 상대의 선택을 공개하지 않습니다.</p></div>
        <div class="progress-card"><div class="progress-ring" style="--progress:${progress * 3.6}deg"><div><strong>${progress}%</strong><span>${roleName(state.activeRole)} 제출률</span></div></div><div><span>${submitted} / ${questions.length} 제출</span><small>${roleName(otherRole)} 제출 ${submittedCount(state, otherRole, ids)} / ${questions.length}<br>이 기기에 자동 저장돼요.</small></div></div>
      </section>
      <section class="question-shell">
        <aside class="chapter-nav"><span>CONVERSATION</span>${questions.map((item, index) => {
          const itemState = state.questions[item.id];
          const status = isRevealed(itemState) ? "revealed" : isSubmitted(itemState.roles[state.activeRole]) ? "submitted" : "";
          return `<button class="chapter ${index === state.index ? "active" : ""} ${status}" data-index="${index}"><i>${String(index + 1).padStart(2, "0")}</i><strong>${item.chapter}</strong><small>${status === "revealed" ? "공개됨" : status === "submitted" ? "제출됨" : "답변 전"}</small></button>`;
        }).join("")}</aside>
        <article class="question-card">
          <div class="question-meta"><span>QUESTION ${String(question.number).padStart(2, "0")}</span><strong>${question.chapter}</strong><i class="privacy-badge">${isSubmitted(mine) ? "제출 잠금" : "비공개 초안"}</i></div>
          <h2>${question.title}</h2>
          <div class="intent"><strong>이 질문을 나누는 이유</strong><p>${question.intent}</p><small>${question.example}</small></div>
          <fieldset ${isSubmitted(mine) ? "disabled" : ""}><legend class="sr-only">${roleName(state.activeRole)}의 답변을 하나 선택하세요</legend>${question.choices.map((choice, index) => `<label class="choice ${mine.draftChoice === index ? "selected" : ""}"><input type="radio" name="answer" value="${index}" ${mine.draftChoice === index ? "checked" : ""}><span class="choice-key">${String.fromCharCode(65 + index)}</span><span>${choice}</span><i>✓</i></label>`).join("")}</fieldset>
          <label class="memo"><span>비공개 메모 <small>비교 화면과 공유 결과에는 포함되지 않아요</small></span><textarea ${isSubmitted(mine) ? "disabled" : ""} placeholder="이 데모는 역할 전환으로 메모를 볼 수 있으므로 공유 기기에서 사용하지 마세요.">${escapeHtml(mine.privateNote)}</textarea></label>
          ${isSubmitted(mine) ? `<div class="submitted-panel"><strong>이번 라운드의 답변을 제출했어요.</strong><p>제출한 답변은 데모에서 수정할 수 없습니다. ${isSubmitted(questionState.roles[otherRole]) ? "두 사람의 답이 공개됐어요." : `${roleName(otherRole)}의 제출을 기다리고 있어요.`}</p>${!isSubmitted(questionState.roles[otherRole]) ? `<button class="handoff" data-action="handoff">${roleName(otherRole)} 역할로 전환 →</button>` : ""}</div>` : `<p class="submit-help">제출하면 이번 데모에서는 답변을 수정할 수 없어요.</p>`}
          <div class="actions"><button class="secondary" data-action="previous" ${state.index === 0 || saveStatus === "failed" ? "disabled" : ""}>이전 질문</button><span class="save-state ${saveStatus}" role="status" aria-live="polite">${saveStatus === "failed" ? `저장 실패 <button data-action="retry-save">다시 저장</button>` : "● 이 기기에 저장됨"}</span><button class="primary" data-action="submit" ${mine.draftChoice === null || isSubmitted(mine) || saveStatus === "failed" ? "disabled" : ""}>이 답변 제출</button></div>
          ${revealed ? renderReveal(question, questionState) : renderLocked(questionState)}
        </article>
      </section>
    </main>
    <footer><span>AB</span><p>다가올 삶을, 함께 준비하다.</p><button data-action="reset">데모 기록 초기화</button></footer>`;
  bindEvents();
}

function renderLocked(questionState) {
  return `<section class="reveal-locked"><span aria-hidden="true">🔒</span><div><strong>답변은 아직 비공개예요.</strong><p>역할 A ${isSubmitted(questionState.roles.a) ? "제출 완료" : "제출 전"} · 역할 B ${isSubmitted(questionState.roles.b) ? "제출 완료" : "제출 전"}</p></div></section>`;
}

function renderReveal(question, questionState) {
  const comparison = comparisonFor(questionState);
  const shared = questionState.shared;
  const canApprove = canApproveAgreement(shared, state.activeRole);
  const proposalLabel = shared.status === "agreed" ? "두 사람이 승인한 합의" : shared.status === "pending" ? `${roleName(shared.proposedBy)}의 합의안 · ${roleName(shared.proposedBy === "a" ? "b" : "a")} 승인 대기` : "함께 정할 합의안";
  const approverView = shared.status === "pending" && shared.proposedBy !== state.activeRole;
  return `<section class="reveal-panel" aria-labelledby="comparison-title"><div class="reveal-heading"><span>TOGETHER · REVEALED</span><h3 id="comparison-title">${comparison.label}</h3><p>${comparison.detail}</p></div><div class="answer-pair"><article><small>역할 A 제출 답변</small><strong>${question.choices[questionState.roles.a.submittedChoice]}</strong></article><article><small>역할 B 제출 답변</small><strong>${question.choices[questionState.roles.b.submittedChoice]}</strong></article></div><label class="agreement"><span>${proposalLabel}</span><textarea ${approverView ? "disabled" : ""} placeholder="함께 지킬 원칙이나 다음 행동을 제안해 보세요.">${escapeHtml(shared.proposal)}</textarea></label><div class="agreement-actions"><button class="secondary ${shared.status === "deferred" ? "selected-status" : ""}" data-agreement="deferred">다시 이야기할 항목</button>${canApprove ? `<button class="secondary" data-agreement="revise">수정 제안하기</button><button class="primary" data-agreement="approve">상대의 합의안 승인</button>` : `<button class="primary" data-agreement="propose" ${shared.proposal.trim() ? "" : "disabled"}>${shared.proposedBy === state.activeRole && shared.status === "pending" ? "합의안 업데이트" : "합의안 제안"}</button>`}</div><p class="agreement-state" role="status">${shared.status === "agreed" ? "✓ 상대 역할의 승인까지 완료된 공동 합의입니다." : shared.status === "deferred" ? "↻ 다시 대화할 항목으로 표시했어요." : shared.status === "pending" ? `${roleName(shared.proposedBy)}이 제안했고 상대의 승인을 기다립니다.` : "아직 합의 상태를 정하지 않았어요."}</p></section>`;
}

function bindEvents() {
  document.querySelectorAll("[data-role]").forEach((button) => button.addEventListener("click", () => { if (saveStatus === "failed") return; state.activeRole = button.dataset.role; saveState(); render(); }));
  document.querySelectorAll('.choice input[name="answer"]').forEach((input) => input.addEventListener("change", (event) => { state.questions[questions[state.index].id].roles[state.activeRole].draftChoice = Number(event.target.value); saveState(); render(); }));
  document.querySelector(".memo textarea")?.addEventListener("input", (event) => { state.questions[questions[state.index].id].roles[state.activeRole].privateNote = event.target.value; if (!saveState()) render(); });
  document.querySelectorAll(".chapter").forEach((button) => button.addEventListener("click", () => { if (saveStatus === "failed") return; state.index = Number(button.dataset.index); saveState(); render(); }));
  document.querySelector('[data-action="previous"]')?.addEventListener("click", () => { if (saveStatus === "failed") return; state.index -= 1; saveState(); render(); });
  document.querySelector('[data-action="submit"]')?.addEventListener("click", () => { if (saveStatus === "failed") return; const mine = state.questions[questions[state.index].id].roles[state.activeRole]; mine.submittedChoice = mine.draftChoice; mine.submittedAt = new Date().toISOString(); saveState(); render(); });
  document.querySelector('[data-action="handoff"]')?.addEventListener("click", () => { if (saveStatus === "failed") return; state.activeRole = state.activeRole === "a" ? "b" : "a"; saveState(); render(); });
  document.querySelector(".agreement textarea")?.addEventListener("input", (event) => { const shared = state.questions[questions[state.index].id].shared; shared.proposal = event.target.value; shared.status = "none"; shared.approvedBy = null; shared.proposedBy = null; const saved = saveState(); const button = document.querySelector('[data-agreement="propose"]'); if (button) button.disabled = !shared.proposal.trim(); if (!saved) render(); });
  document.querySelector('[data-agreement="propose"]')?.addEventListener("click", () => { if (saveStatus === "failed") return; const shared = state.questions[questions[state.index].id].shared; if (!shared.proposal.trim()) return; shared.proposedBy = state.activeRole; shared.approvedBy = null; shared.status = "pending"; saveState(); render(); });
  document.querySelector('[data-agreement="revise"]')?.addEventListener("click", () => { if (saveStatus === "failed") return; const shared = state.questions[questions[state.index].id].shared; shared.status = "none"; shared.proposedBy = null; shared.approvedBy = null; saveState(); render(); });
  document.querySelector('[data-agreement="approve"]')?.addEventListener("click", () => { if (saveStatus === "failed") return; const shared = state.questions[questions[state.index].id].shared; if (!canApproveAgreement(shared, state.activeRole)) return; shared.approvedBy = state.activeRole; shared.status = "agreed"; saveState(); render(); });
  document.querySelector('[data-agreement="deferred"]')?.addEventListener("click", () => { if (saveStatus === "failed") return; const shared = state.questions[questions[state.index].id].shared; shared.status = "deferred"; shared.approvedBy = null; saveState(); render(); });
  document.querySelector('[data-action="retry-save"]')?.addEventListener("click", () => { saveState(); render(); });
  document.querySelector('[data-action="reset"]')?.addEventListener("click", resetDemo);
}

function resetDemo() {
  if (!confirm("두 역할의 답변, 비공개 메모와 합의를 모두 지울까요?")) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch { saveStatus = "failed"; }
  state = normalizeState(null, ids);
  render();
}

render();
