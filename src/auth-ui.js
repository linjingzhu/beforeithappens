import { AUTH_COPY } from "./auth.js";
import { escapeHtml } from "./html.js";

function brand(extraActions = "") {
  return `<header class="topbar"><a class="brand" href="/" aria-label="AB 홈"><span>AB</span><strong>Before life changes, talk.</strong></a>${extraActions}</header>`;
}

function footer(extra = "") {
  return `<footer><span>AB</span><p>다가올 삶을, 함께 준비하다.</p>${extra}<button data-action="show-dashboard">개발 기록</button></footer>`;
}

function logoutCluster() {
  return `<div class="logout-cluster"><button class="results-link" type="button" data-action="logout">로그아웃</button><small>${escapeHtml(AUTH_COPY.logoutHandoff)}</small></div>`;
}

export function renderOnboarding({ email = "", error = "", busy = false } = {}) {
  return `
    ${brand()}
    <main class="auth-shell">
      <section class="auth-card">
        <span class="eyebrow">AB · EMAIL SIGN IN</span>
        <h1>${escapeHtml(AUTH_COPY.title)}</h1>
        <p>${escapeHtml(AUTH_COPY.body)}</p>
        <form class="auth-form" data-auth-form>
          <label for="auth-email">이메일</label>
          <input id="auth-email" name="email" type="email" autocomplete="email" inputmode="email" required value="${escapeHtml(email)}" ${busy ? "disabled" : ""}>
          <button class="primary auth-submit" type="submit" ${busy ? "disabled" : ""}>${escapeHtml(AUTH_COPY.cta)}</button>
        </form>
        ${error ? `<p class="auth-error" role="alert">${escapeHtml(error)}</p>` : ""}
      </section>
    </main>
    ${footer()}
  `;
}

export function renderSent({ email = "" } = {}) {
  return `
    ${brand()}
    <main class="auth-shell">
      <section class="auth-card">
        <span class="eyebrow">AB · EMAIL SIGN IN</span>
        <h1>${escapeHtml(AUTH_COPY.title)}</h1>
        <p role="status">${escapeHtml(AUTH_COPY.sent)}</p>
        ${email ? `<p class="auth-email-hint">${escapeHtml(email)}</p>` : ""}
        <button class="secondary auth-submit" type="button" data-action="back-to-onboarding">다른 이메일로 요청</button>
      </section>
    </main>
    ${footer()}
  `;
}

export function renderLoginNotice({ email = "" } = {}) {
  return `
    ${brand(logoutCluster())}
    <main class="auth-shell">
      <section class="auth-card">
        <span class="eyebrow">AB · SIGNED IN</span>
        <h1>${escapeHtml(AUTH_COPY.title)}</h1>
        <p role="status">${escapeHtml(AUTH_COPY.afterLogin)}</p>
        ${email ? `<p class="auth-email-hint">${escapeHtml(email)}</p>` : ""}
        <button class="primary auth-submit" type="button" data-action="ack-notice">확인</button>
      </section>
    </main>
    ${footer()}
  `;
}

export function renderInviteWaitingHome({ email = "" } = {}) {
  return `
    ${brand(logoutCluster())}
    <main class="auth-shell">
      <section class="auth-card">
        <span class="eyebrow">AB · INVITE WAITING</span>
        <h1>파트너가 초대를 수락하면 시작해요</h1>
        <p>상대가 초대를 받기 전에는 결혼 준비 팩을 열 수 없어요. 지금은 초대를 기다리는 홈만 열려 있어요.</p>
        ${email ? `<p class="auth-email-hint">${escapeHtml(email)}</p>` : ""}
      </section>
    </main>
    ${footer()}
  `;
}
