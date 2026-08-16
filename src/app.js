import { questions } from "./questions.js";

const STORAGE_KEY = "ab-demo-progress-v1";
const state = loadState();
let saveStatus = "saved";

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const index = Number.isInteger(stored?.index) && stored.index >= 0 && stored.index < questions.length ? stored.index : 0;
    const answers = stored?.answers && typeof stored.answers === "object" ? stored.answers : {};
    const notes = stored?.notes && typeof stored.notes === "object" ? Object.fromEntries(Object.entries(stored.notes).filter(([, value]) => typeof value === "string")) : {};
    return { index, answers, notes, complete: stored?.complete === true };
  } catch {
    return { index: 0, answers: {}, notes: {}, complete: false };
  }
}

function saveState() {
  try {
    saveStatus = "saving";
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saveStatus = "saved";
    return true;
  } catch {
    saveStatus = "failed";
    return false;
  }
}

function answeredCount() {
  return Object.keys(state.answers).filter((id) => state.answers[id] !== undefined).length;
}

function render() {
  if (state.complete) return renderSummary();
  const question = questions[state.index];
  const selected = state.answers[question.id];
  const progress = Math.round((answeredCount() / questions.length) * 100);

  document.querySelector("#app").innerHTML = `
    <header class="topbar">
      <a class="brand" href="#" aria-label="AB 홈"><span>AB</span><strong>Before life changes, talk.</strong></a>
      <button class="couple-button" type="button" disabled title="두 역할 데모는 다음 개발 단계에서 제공됩니다"><i></i>파트너 초대 · 다음 단계</button>
    </header>
    <main>
      <section class="journey" aria-label="질문 진행 상황">
        <div class="journey-copy">
          <span class="eyebrow">BEFORE MARRIAGE · FIRST CONVERSATION</span>
          <h1>우리의 답을<br><em>천천히 발견해요.</em></h1>
          <p>정답을 고르는 시간이 아니라, 서로의 삶을 이해하는 시간입니다.</p>
        </div>
        <div class="progress-card">
          <div class="progress-ring" style="--progress:${progress * 3.6}deg"><div><strong>${progress}%</strong><span>나의 진행률</span></div></div>
          <div><span>${answeredCount()} / ${questions.length} 답변</span><small>답변과 메모는 이 기기에 자동 저장돼요.</small></div>
        </div>
      </section>

      <section class="question-shell">
        <aside class="chapter-nav">
          <span>CHAPTER</span>
          ${questions.map((item, index) => `<button class="chapter ${index === state.index ? "active" : ""} ${state.answers[item.id] !== undefined ? "answered" : ""}" data-index="${index}"><i>${String(index + 1).padStart(2, "0")}</i><strong>${item.chapter}</strong></button>`).join("")}
        </aside>
        <article class="question-card">
          <div class="question-meta"><span>QUESTION ${String(question.number).padStart(2, "0")}</span><strong>${question.chapter}</strong></div>
          <h2>${question.title}</h2>
          <div class="intent"><strong>이 질문을 나누는 이유</strong><p>${question.intent}</p><small>${question.example}</small></div>
          <fieldset>
            <legend class="sr-only">답변을 하나 선택하세요</legend>
            ${question.choices.map((choice, index) => `<label class="choice ${selected === index ? "selected" : ""}"><input type="radio" name="answer" value="${index}" ${selected === index ? "checked" : ""}><span class="choice-key">${String.fromCharCode(65 + index)}</span><span>${choice}</span><i>✓</i></label>`).join("")}
          </fieldset>
          <label class="memo"><span>나만의 메모 <small>현재는 이 브라우저에만 저장돼요</small></span><textarea placeholder="공유 기기에서는 다른 사람이 볼 수 있어요. 왜 이 답을 골랐는지 기록해 보세요.">${escapeHtml(state.notes[question.id] ?? "")}</textarea></label>
          <div class="actions">
            <button class="secondary" data-action="previous" ${state.index === 0 ? "disabled" : ""}>이전 질문</button>
            <span class="save-state ${saveStatus}" role="status" aria-live="polite">${saveStatus === "failed" ? "저장 실패 · 다시 입력해 주세요" : "● 이 기기에 저장됨"}</span>
            <button class="primary" data-action="next" ${selected === undefined ? "disabled" : ""}>${state.index === questions.length - 1 ? "내 답변 확인" : "다음 질문"}</button>
          </div>
        </article>
      </section>
    </main>
    <footer><span>AB</span><p>다가올 삶을, 함께 준비하다.</p><button data-action="reset">데모 기록 초기화</button></footer>
  `;
  bindEvents();
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function bindEvents() {
  document.querySelectorAll('input[name="answer"]').forEach((input) => input.addEventListener("change", (event) => {
    state.answers[questions[state.index].id] = Number(event.target.value);
    saveState(); render();
  }));
  document.querySelector("textarea").addEventListener("input", (event) => { state.notes[questions[state.index].id] = event.target.value; saveState(); });
  document.querySelectorAll(".chapter").forEach((button) => button.addEventListener("click", () => { state.index = Number(button.dataset.index); saveState(); render(); }));
  document.querySelector('[data-action="previous"]')?.addEventListener("click", () => { state.index -= 1; saveState(); render(); });
  document.querySelector('[data-action="next"]')?.addEventListener("click", () => { if (state.index < questions.length - 1) state.index += 1; else state.complete = true; saveState(); render(); });
  document.querySelector('[data-action="reset"]')?.addEventListener("click", resetDemo);
}

function renderSummary() {
  document.querySelector("#app").innerHTML = `
    <header class="topbar"><a class="brand" href="#" aria-label="AB 홈"><span>AB</span><strong>Before life changes, talk.</strong></a></header>
    <main class="completion">
      <span class="eyebrow">FIRST CONVERSATION · COMPLETE</span>
      <h1>첫 번째 대화를 위한<br><em>나의 답이 준비됐어요.</em></h1>
      <p>이 단계에서는 내 답변을 저장하고 다시 확인하는 흐름을 검증합니다. 다음 개발에서는 파트너 초대, 양쪽 제출 장벽, 답변 비교와 공동 합의가 연결됩니다.</p>
      <section class="answer-review">
        ${questions.map((question, index) => `<article><small>${question.chapter}</small><h2>${question.title}</h2><strong>${question.choices[state.answers[question.id]] ?? "아직 답하지 않음"}</strong><p>${state.notes[question.id] ? `메모: ${escapeHtml(state.notes[question.id])}` : "작성한 메모 없음"}</p><button data-edit="${index}">답변 수정</button></article>`).join("")}
      </section>
      <div class="completion-actions"><button class="secondary" data-action="reset">기록 초기화</button><button class="primary" data-action="continue">답변 다시 보기</button></div>
    </main>`;
  document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => { state.index = Number(button.dataset.edit); state.complete = false; saveState(); render(); }));
  document.querySelector('[data-action="continue"]')?.addEventListener("click", () => { state.index = 0; state.complete = false; saveState(); render(); });
  document.querySelector('[data-action="reset"]')?.addEventListener("click", resetDemo);
}

function resetDemo() {
  if (confirm("저장된 답변과 메모를 모두 지울까요?")) {
    try { localStorage.removeItem(STORAGE_KEY); } catch { saveStatus = "failed"; }
    Object.assign(state, { index: 0, answers: {}, notes: {}, complete: false });
    render();
  }
}

render();
