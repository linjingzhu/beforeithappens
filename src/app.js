import { AUTH_ERRORS, canOpenPack, consumeAuthLocation, emptySession, resolveSignedInView, resolveSignedOutView } from "./auth.js";
import { renderInviteWaitingHome, renderLoginNotice, renderOnboarding, renderSent } from "./auth-ui.js";
import { marriagePack, questions } from "./questions.js";
import { buildSharedResults, canApproveAgreement, comparisonFor, isRevealed, isSubmitted, normalizeState, submittedCount } from "./state.js";
import { escapeHtml } from "./html.js";
import { developmentHistory, developmentStages, developmentSummary } from "./development.js";

const STORAGE_KEY = "ab-couple-demo-v2";
const ids = questions.map((question) => question.id);
const choiceIdsByQuestion = Object.fromEntries(questions.map((question) => [question.id, question.choices.map((choice) => choice.id)]));
const packIdentity = { id: marriagePack.id, version: marriagePack.version };
let state = loadState();
let saveStatus = "saved";
let openRationaleQuestionId = null;
let currentView = "product";
let dashboardTab = "stages";
let session = emptySession();
let authScreen = "onboarding";
let authBusy = false;
let authError = "";
let emailDraft = "";
let noticeDismissed = false;

function loadState() {
  try { return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY)), ids, choiceIdsByQuestion, packIdentity); }
  catch { return normalizeState(null, ids, choiceIdsByQuestion, packIdentity); }
}

function saveState() {
  try { saveStatus = "saving"; localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); saveStatus = "saved"; return true; }
  catch { saveStatus = "failed"; return false; }
}

function roleName(role) { return role === "a" ? "나" : "파트너"; }

function render() {
  if (currentView === "dashboard") { renderDashboard(); return; }
  if (!canOpenPack(session)) {
    renderAccountView();
    return;
  }
  const sharedResults = buildSharedResults(state, ids, choiceIdsByQuestion, packIdentity);
  if (currentView === "results" && sharedResults.complete) { renderResultsScreen(sharedResults); return; }
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
      <div class="top-actions">${sharedResults.complete ? `<button class="results-link" data-action="show-results">공동 결과 보기</button>` : ""}<div class="role-switcher" aria-label="데모 역할 선택"><span>현재 역할</span><button data-role="a" aria-pressed="${state.activeRole === "a"}" class="${state.activeRole === "a" ? "active" : ""}">나</button><button data-role="b" aria-pressed="${state.activeRole === "b"}" class="${state.activeRole === "b" ? "active" : ""}">파트너</button></div></div>
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
          return `<button class="chapter ${index === state.index ? "active" : ""} ${status}" data-index="${index}"><i>${String(index + 1).padStart(2, "0")}</i><strong>${escapeHtml(item.chapter)}</strong><small>${status === "revealed" ? "공개됨" : status === "submitted" ? "제출됨" : "답변 전"}</small></button>`;
        }).join("")}</aside>
        <article class="question-card">
          <div class="question-meta"><span>QUESTION ${String(question.number).padStart(2, "0")}</span><strong>${escapeHtml(question.chapter)}</strong><i class="privacy-badge">${isSubmitted(mine) ? "제출 잠금" : "비공개 초안"}</i></div>
          <h2>${escapeHtml(question.title)}</h2>
          <div class="intent"><strong>질문 안내</strong><p>${escapeHtml(question.intent)}</p><small>${escapeHtml(question.example)}</small></div>
          <details class="why-it-matters" ${openRationaleQuestionId === question.id ? "open" : ""}><summary>ⓘ 왜 중요한가요?</summary><div><p>${escapeHtml(question.whyItMatters)}</p><ul>${question.researchKeywords.map((keyword) => `<li>${escapeHtml(keyword)}</li>`).join("")}</ul></div></details>
          <fieldset ${isSubmitted(mine) ? "disabled" : ""}><legend class="sr-only">${roleName(state.activeRole)}의 답변을 하나 선택하세요</legend>${question.choices.map((choice, index) => `<label class="choice ${mine.draftChoice === choice.id ? "selected" : ""}"><input type="radio" name="answer" value="${escapeHtml(choice.id)}" ${mine.draftChoice === choice.id ? "checked" : ""}><span class="choice-key">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(choice.label)}</span><i>✓</i></label>`).join("")}</fieldset>
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

function renderDashboard() {
  const summary = developmentSummary();
  const stageContent = `<section class="development-stages" aria-label="개발 단계">${developmentStages.map((stage, index) => `<article class="development-stage ${stage.status}"><span class="stage-check" aria-hidden="true">${stage.status === "complete" ? "✓" : stage.status === "next" ? "→" : String(index + 1).padStart(2, "0")}</span><div><small>${stage.status === "complete" ? "개발 완료" : stage.status === "next" ? "다음 개발" : "개발 예정"}</small><h3>${escapeHtml(stage.title)}</h3><p>${escapeHtml(stage.detail)}</p></div></article>`).join("")}</section>`;
  const historyContent = `<section class="development-history" aria-label="개발 히스토리">${developmentHistory.slice().reverse().map((item) => `<article><time datetime="${item.date}">${item.date}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.detail)}</p></div></article>`).join("")}</section>`;
  document.querySelector("#app").innerHTML = `<header class="topbar"><a class="brand" href="/" aria-label="AB 홈"><span>AB</span><strong>Before life changes, talk.</strong></a><button class="results-link" data-action="back-to-account">계정으로 가기</button></header><main class="development-dashboard"><section class="dashboard-hero"><span class="eyebrow">AB PRODUCT DEVELOPMENT</span><h1>제품이 어디까지 왔는지<br><em>한눈에 확인해요.</em></h1><p>현재 저장소의 구현과 검증 기록을 기준으로 표시한 개발 대시보드입니다.</p><div class="dashboard-summary"><article><strong>${summary.complete}</strong><span>완료 단계</span></article><article><strong>${summary.total}</strong><span>전체 단계</span></article><article><strong>${Math.round(summary.complete / summary.total * 100)}%</strong><span>개발 진행률</span></article></div><aside><small>NEXT DEVELOPMENT</small><strong>${escapeHtml(summary.next.title)}</strong><p>${escapeHtml(summary.next.detail)}</p></aside></section><nav class="dashboard-tabs" aria-label="개발 대시보드"><button data-dashboard-tab="stages" aria-selected="${dashboardTab === "stages"}" class="${dashboardTab === "stages" ? "active" : ""}">개발 단계</button><button data-dashboard-tab="history" aria-selected="${dashboardTab === "history"}" class="${dashboardTab === "history" ? "active" : ""}">개발 히스토리</button></nav>${dashboardTab === "stages" ? stageContent : historyContent}</main><footer><span>AB</span><p>다가올 삶을, 함께 준비하다.</p><button data-action="back-to-account">계정으로 가기</button></footer>`;
  document.querySelectorAll("[data-dashboard-tab]").forEach((button) => button.addEventListener("click", () => { dashboardTab = button.dataset.dashboardTab; render(); }));
  bindAccountNavigation();
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
  const label = (choiceId) => question.choices.find((choice) => choice.id === choiceId)?.label || "알 수 없는 선택";
  return `<section class="reveal-panel" aria-labelledby="comparison-title"><div class="reveal-heading"><span>TOGETHER · REVEALED</span><h3 id="comparison-title">${comparison.label}</h3><p>${comparison.detail}</p></div><div class="answer-pair"><article><small>역할 A 제출 답변</small><strong>${escapeHtml(label(questionState.roles.a.submittedChoice))}</strong></article><article><small>역할 B 제출 답변</small><strong>${escapeHtml(label(questionState.roles.b.submittedChoice))}</strong></article></div><label class="agreement"><span>${proposalLabel}</span><textarea ${approverView ? "disabled" : ""} placeholder="함께 지킬 원칙이나 다음 행동을 제안해 보세요.">${escapeHtml(shared.proposal)}</textarea></label><div class="agreement-actions"><button class="secondary ${shared.status === "deferred" ? "selected-status" : ""}" data-agreement="deferred">다시 이야기할 항목</button>${canApprove ? `<button class="secondary" data-agreement="revise">수정 제안하기</button><button class="primary" data-agreement="approve">상대의 합의안 승인</button>` : `<button class="primary" data-agreement="propose" ${shared.proposal.trim() ? "" : "disabled"}>${shared.proposedBy === state.activeRole && shared.status === "pending" ? "합의안 업데이트" : "합의안 제안"}</button>`}</div><p class="agreement-state" role="status">${shared.status === "agreed" ? "✓ 상대 역할의 승인까지 완료된 공동 합의입니다." : shared.status === "deferred" ? "↻ 다시 대화할 항목으로 표시했어요." : shared.status === "pending" ? `${roleName(shared.proposedBy)}이 제안했고 상대의 승인을 기다립니다.` : "아직 합의 상태를 정하지 않았어요."}</p></section>`;
}

function renderResultsScreen(results) {
  const choiceLabel = (question, choiceId) => question.choices.find((choice) => choice.id === choiceId)?.label || "알 수 없는 선택";
  const statusLabel = (item) => item.agreement.status === "agreed" ? "공동 합의 완료" : item.agreement.status === "deferred" ? "다시 이야기할 항목" : item.agreement.status === "pending" ? "합의 승인 대기" : "아직 합의 없음";
  document.querySelector("#app").innerHTML = `<header class="topbar"><a class="brand" href="#" aria-label="AB 홈"><span>AB</span><strong>Before life changes, talk.</strong></a><button class="results-link" data-action="back-to-questions">질문으로 돌아가기</button></header><p class="sr-only" role="status" aria-live="polite">결과가 준비되었습니다.</p><main class="results-page"><section class="results-hero"><span class="eyebrow">SHARED CONVERSATION RESULTS</span><h1 tabindex="-1">두 사람의 답을<br><em>한곳에 모았어요.</em></h1><p>이 숫자는 선택한 답변과 대화 상태만 설명하며 궁합 점수나 관계 진단이 아닙니다.</p></section><section class="results-summary" aria-label="공동 결과 요약"><article><strong>${results.alignedCount}</strong><span>같은 선택</span></article><article><strong>${results.discussCount}</strong><span>서로 다른 선택</span></article><article><strong>${results.agreedCount}</strong><span>공동 합의</span></article><article><strong>${results.deferredCount}</strong><span>다시 이야기하기</span></article><article><strong>${results.pendingCount}</strong><span>승인 대기</span></article><article><strong>${results.noneCount}</strong><span>합의 미작성</span></article></section><section class="results-list"><h2>질문별 대화 기록</h2>${results.items.map((item, index) => { const question = questions.find((entry) => entry.id === item.questionId); return `<article class="result-item"><div class="result-heading"><span>${String(index + 1).padStart(2, "0")} · ${escapeHtml(question.chapter)}</span><h3>${escapeHtml(question.title)}</h3><i class="${item.comparison}">${item.comparison === "aligned" ? "같은 선택" : "서로 다른 선택"}</i></div><div class="result-answers"><p><small>역할 A</small>${escapeHtml(choiceLabel(question, item.submittedChoices.a))}</p><p><small>역할 B</small>${escapeHtml(choiceLabel(question, item.submittedChoices.b))}</p></div><div class="result-agreement ${item.agreement.status}"><strong>${statusLabel(item)}</strong>${item.agreement.status === "agreed" ? `<p>${escapeHtml(item.agreement.text)}</p>` : ""}</div></article>`; }).join("")}</section><section class="privacy-reminder"><strong>비공개 메모는 포함하지 않았어요.</strong><p>이 화면에는 두 사람이 제출한 선택과 공유 합의만 표시됩니다.</p></section></main><footer><span>AB</span><p>다가올 삶을, 함께 준비하다.</p><button data-action="reset">데모 기록 초기화</button></footer>`;
  document.querySelector('[data-action="back-to-questions"]')?.addEventListener("click", () => { currentView = "questions"; render(); });
  document.querySelector(".brand")?.addEventListener("click", (event) => { event.preventDefault(); currentView = "product"; render(); });
  document.querySelector('[data-action="reset"]')?.addEventListener("click", resetDemo);
  document.querySelector(".results-hero h1")?.focus();
}

function renderAccountView() {
  if (session.user) {
    const view = resolveSignedInView(session, noticeDismissed);
    document.querySelector("#app").innerHTML = view === "notice"
      ? renderLoginNotice({ email: session.user.email })
      : renderInviteWaitingHome({ email: session.user.email });
  } else {
    const view = resolveSignedOutView(authScreen);
    document.querySelector("#app").innerHTML = view === "sent"
      ? renderSent({ email: emailDraft })
      : renderOnboarding({ email: emailDraft, error: authError, busy: authBusy });
  }
  bindAccountNavigation();
  document.querySelector("[data-auth-form]")?.addEventListener("submit", submitMagicLink);
  document.querySelector('[data-action="back-to-onboarding"]')?.addEventListener("click", () => {
    authScreen = "onboarding";
    authError = "";
    render();
  });
  document.querySelector('[data-action="ack-notice"]')?.addEventListener("click", acknowledgeNotice);
  document.querySelector('[data-action="logout"]')?.addEventListener("click", logout);
}

function bindAccountNavigation() {
  document.querySelector(".brand")?.addEventListener("click", (event) => {
    event.preventDefault();
    currentView = "product";
    render();
  });
  document.querySelectorAll('[data-action="show-dashboard"]').forEach((button) => button.addEventListener("click", () => {
    currentView = "dashboard";
    render();
  }));
  document.querySelectorAll('[data-action="back-to-account"]').forEach((button) => button.addEventListener("click", () => {
    currentView = "product";
    render();
  }));
  document.querySelectorAll('[data-action="open-product"]').forEach((button) => button.addEventListener("click", () => {
    if (!canOpenPack(session)) {
      currentView = "product";
      render();
      return;
    }
    currentView = "questions";
    render();
  }));
}

async function refreshSession() {
  try {
    const response = await fetch("/api/auth/session", { credentials: "same-origin" });
    session = response.ok ? await response.json() : emptySession();
  } catch {
    session = emptySession();
  }
}

async function submitMagicLink(event) {
  event.preventDefault();
  const input = document.querySelector("#auth-email");
  emailDraft = input?.value.trim() || "";
  authBusy = true;
  authError = "";
  render();
  try {
    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: emailDraft })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      authError = AUTH_ERRORS[payload.error] || AUTH_ERRORS["invalid-email"];
      authScreen = "onboarding";
    } else {
      authScreen = "sent";
      authError = "";
    }
  } catch {
    authError = AUTH_ERRORS.failed;
    authScreen = "onboarding";
  } finally {
    authBusy = false;
    render();
  }
}

async function consumeMagicLink(token) {
  const response = await fetch("/api/auth/consume", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    session = emptySession();
    authScreen = "onboarding";
    noticeDismissed = false;
    authError = AUTH_ERRORS[payload.error] || AUTH_ERRORS.invalid;
    return;
  }
  session = payload.session || emptySession();
  noticeDismissed = false;
  authScreen = "home";
  authError = "";
}

async function acknowledgeNotice() {
  try {
    const response = await fetch("/api/auth/ack-notice", { method: "POST", credentials: "same-origin" });
    if (response.ok) session = await response.json();
  } catch {
    session = { ...session, notice: null };
  }
  noticeDismissed = true;
  render();
}

async function logout() {
  try {
    await fetch("/api/auth/force-logout", { method: "POST", credentials: "same-origin" });
  } catch {
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }); } catch { /* keep local signed-out state */ }
  }
  session = emptySession();
  authScreen = "onboarding";
  noticeDismissed = false;
  authError = "";
  currentView = "product";
  render();
}

async function boot() {
  const locationInfo = consumeAuthLocation(window.location.pathname, window.location.search);
  if (locationInfo.token) {
    try {
      await consumeMagicLink(locationInfo.token);
    } catch {
      authError = AUTH_ERRORS.failed;
      session = emptySession();
    }
    history.replaceState({}, "", "/");
  } else {
    await refreshSession();
    if (locationInfo.authError) authError = AUTH_ERRORS[locationInfo.authError] || AUTH_ERRORS.invalid;
    if (locationInfo.authError || locationInfo.isConsumePath) history.replaceState({}, "", "/");
  }
  if (!session.user) authScreen = resolveSignedOutView(authScreen);
  render();
}

function bindEvents() {
  document.querySelector(".brand")?.addEventListener("click", (event) => { event.preventDefault(); currentView = "product"; render(); });
  document.querySelectorAll("[data-role]").forEach((button) => button.addEventListener("click", () => { if (saveStatus === "failed") return; state.activeRole = button.dataset.role; saveState(); render(); }));
  document.querySelector('[data-action="show-results"]')?.addEventListener("click", () => { currentView = "results"; render(); });
  document.querySelector(".why-it-matters")?.addEventListener("toggle", (event) => { openRationaleQuestionId = event.target.open ? questions[state.index].id : null; });
  document.querySelectorAll('.choice input[name="answer"]').forEach((input) => input.addEventListener("change", (event) => { state.questions[questions[state.index].id].roles[state.activeRole].draftChoice = event.target.value; saveState(); render(); }));
  document.querySelector(".memo textarea")?.addEventListener("input", (event) => { state.questions[questions[state.index].id].roles[state.activeRole].privateNote = event.target.value; if (!saveState()) render(); });
  document.querySelectorAll(".chapter").forEach((button) => button.addEventListener("click", () => { if (saveStatus === "failed") return; state.index = Number(button.dataset.index); openRationaleQuestionId = null; saveState(); render(); }));
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
  state = normalizeState(null, ids, choiceIdsByQuestion, packIdentity);
  currentView = canOpenPack(session) ? "questions" : "product";
  render();
}

boot();
