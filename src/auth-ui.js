import { AUTH_COPY, INVITE_COPY, formatRemaining, formatSentAt } from "./auth.js";
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

export function renderInviteWaitingHome({ email = "", partnerEmail = "", invite = null, error = "", busy = false, copied = false } = {}) {
  const hasInvite = Boolean(invite);
  const shareUrl = invite?.url || "";
  const remaining = hasInvite ? formatRemaining(invite.remainingMs) : "";
  const shareBlock = hasInvite ? `
          ${shareUrl ? `
          <div class="invite-share">
            <p>${escapeHtml(INVITE_COPY.share)}</p>
            <div class="invite-share-actions" role="group" aria-label="${escapeHtml(INVITE_COPY.share)}">
              <button class="secondary invite-share-button" type="button" data-action="copy-invite-link">${escapeHtml(INVITE_COPY.copyLink)}</button>
              <button class="secondary invite-share-button" type="button" data-action="share-instagram">${escapeHtml(INVITE_COPY.instagram)}</button>
              <button class="secondary invite-share-button" type="button" data-action="share-kakao">${escapeHtml(INVITE_COPY.kakao)}</button>
            </div>
            ${copied ? `<p class="invite-copied" role="status">${escapeHtml(INVITE_COPY.copied)}</p>` : ""}
          </div>
          ` : ""}
          <p>${escapeHtml(INVITE_COPY.deviceRule)}</p>
          <p>${escapeHtml(INVITE_COPY.emailCheck)}</p>
        ` : `
          <p>파트너 이메일로 초대를 보내면, 상대가 수락한 뒤에만 결혼 준비 팩이 열려요.</p>
          <p>${escapeHtml(INVITE_COPY.rule)}</p>
        `;
  return `
    ${brand(logoutCluster())}
    <main class="auth-shell">
      <section class="auth-card">
        <span class="eyebrow">AB · INVITE WAITING</span>
        <h1>${escapeHtml(INVITE_COPY.title)}</h1>
        ${hasInvite ? `
          <dl class="invite-status">
            <div><dt>상태</dt><dd>${escapeHtml(invite.status === "expired" ? "만료됨" : INVITE_COPY.waiting)}</dd></div>
            <div><dt>${escapeHtml(INVITE_COPY.remainingLabel)}</dt><dd>${escapeHtml(remaining)}</dd></div>
            <div><dt>${escapeHtml(INVITE_COPY.lastSentLabel)}</dt><dd>${escapeHtml(formatSentAt(invite.lastSentAt))}</dd></div>
          </dl>
        ` : ""}
        ${shareBlock}
        <form class="auth-form" data-invite-form>
          <label for="invite-email">파트너 이메일</label>
          <input id="invite-email" name="email" type="email" autocomplete="email" inputmode="email" required value="${escapeHtml(partnerEmail || invite?.email || "")}" ${busy ? "disabled" : ""}>
          <button class="primary auth-submit" type="submit" ${busy ? "disabled" : ""}>${escapeHtml(hasInvite ? INVITE_COPY.editResend : INVITE_COPY.send)}</button>
        </form>
        ${email ? `<p class="auth-email-hint">${escapeHtml(email)}</p>` : ""}
        ${error ? `<p class="auth-error" role="alert">${escapeHtml(error)}</p>` : ""}
      </section>
    </main>
    ${footer()}
  `;
}

export function renderInviteAccept({ email = "", error = "", preview = null, accepted = false, busy = false } = {}) {
  const body = error === "expired"
    ? INVITE_COPY.expired
    : error === "other-session"
      ? INVITE_COPY.otherSession
      : error === "mismatch"
        ? INVITE_COPY.mismatch
        : error === "unauthenticated"
          ? INVITE_COPY.loginRequired
          : accepted
            ? "초대를 수락했어요. 두 사람 모두 결혼 준비 팩을 시작할 수 있어요."
            : preview?.ok
              ? INVITE_COPY.rule
              : AUTH_COPY.body;
  const canAccept = preview?.ok && email && error !== "other-session" && error !== "mismatch";
  const action = accepted
    ? `<button class="primary auth-submit" type="button" data-action="open-pack">${escapeHtml(INVITE_COPY.startPack)}</button>`
    : error === "other-session"
      ? `<button class="primary auth-submit" type="button" data-action="logout-continue-invite" ${busy ? "disabled" : ""}>${escapeHtml(INVITE_COPY.logoutContinue)}</button>`
      : error === "unauthenticated"
        ? `<button class="primary auth-submit" type="button" data-action="continue-invite-login">${escapeHtml(AUTH_COPY.cta)}</button>`
        : canAccept
          ? `<button class="primary auth-submit" type="button" data-action="accept-invite" ${busy ? "disabled" : ""}>${escapeHtml(INVITE_COPY.accept)}</button>`
          : "";
  return `
    ${brand(email ? logoutCluster() : "")}
    <main class="auth-shell">
      <section class="auth-card">
        <span class="eyebrow">AB · INVITE</span>
        <h1>${escapeHtml(INVITE_COPY.title)}</h1>
        <p role="status">${escapeHtml(body)}</p>
        ${email ? `<p class="auth-email-hint">${escapeHtml(email)}</p>` : ""}
        ${action}
      </section>
    </main>
    ${footer()}
  `;
}

export function renderPackReady({ email = "" } = {}) {
  return `
    ${brand(logoutCluster())}
    <main class="auth-shell">
      <section class="auth-card">
        <span class="eyebrow">AB · PACK READY</span>
        <h1>${escapeHtml(AUTH_COPY.title)}</h1>
        <p>파트너가 초대를 수락했어요. 이제 두 사람이 결혼 준비 팩을 시작할 수 있어요.</p>
        ${email ? `<p class="auth-email-hint">${escapeHtml(email)}</p>` : ""}
        <button class="primary auth-submit" type="button" data-action="open-pack">${escapeHtml(INVITE_COPY.startPack)}</button>
      </section>
    </main>
    ${footer()}
  `;
}
