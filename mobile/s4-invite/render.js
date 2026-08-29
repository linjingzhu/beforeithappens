import { formatRemaining, formatSentAt } from "../../src/auth.js";
import { S4_COPY, SAME_SESSION_COPY, PRODUCT_INVITE_COPY } from "./copy.js";
import { s4ViewModel, sameSessionViewModel } from "./flow.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function logoutChrome(ctaLabel, { continueInvite = false } = {}) {
  const action = continueInvite ? "logout-continue" : "logout";
  return `
    <div class="logout-cluster">
      <button class="results-link" type="button" data-action="${action}">${escapeHtml(ctaLabel)}</button>
      <small>${escapeHtml(S4_COPY.logoutHandoff)}</small>
    </div>
  `;
}

export function renderS4BuyerHome(input = {}) {
  const model = s4ViewModel(input);
  const invite = model.invite;
  const remaining = invite ? formatRemaining(invite.remainingMs) : "";
  const share = model.actions.share ? `
        <div class="invite-share">
          <p>${escapeHtml(S4_COPY.share)}</p>
          <div class="invite-share-actions" role="group" aria-label="${escapeHtml(S4_COPY.share)}">
            <button class="secondary invite-share-button" type="button" data-action="copy-invite-link">${escapeHtml(S4_COPY.copyLink)}</button>
            <button class="secondary invite-share-button" type="button" data-action="share-instagram">${escapeHtml(S4_COPY.instagram)}</button>
            <button class="secondary invite-share-button" type="button" data-action="share-kakao">${escapeHtml(S4_COPY.kakao)}</button>
          </div>
          ${model.copied ? `<p class="invite-copied" role="status">${escapeHtml(S4_COPY.copied)}</p>` : ""}
        </div>
        <p>${escapeHtml(S4_COPY.deviceRule)}</p>
        <p>${escapeHtml(S4_COPY.emailCheck)}</p>
  ` : `
        <p>${escapeHtml(S4_COPY.deviceRule)}</p>
  `;
  return `
    <header class="topbar">
      <a class="brand" href="/mobile/s4-invite/preview.html"><span>AB</span><strong>Before life changes, talk.</strong></a>
      ${logoutChrome(S4_COPY.logout)}
    </header>
    <main class="auth-shell">
      <section class="auth-card" data-screen="s4-invite-waiting">
        <span class="eyebrow">AB · INVITE WAITING</span>
        <h1>${escapeHtml(S4_COPY.title)}</h1>
        ${invite ? `
          <dl class="invite-status">
            <div><dt>상태</dt><dd>${escapeHtml(invite.status === "expired" ? "만료됨" : S4_COPY.waiting)}</dd></div>
            <div><dt>${escapeHtml(S4_COPY.remainingLabel)}</dt><dd>${escapeHtml(remaining)}</dd></div>
            <div><dt>${escapeHtml(S4_COPY.lastSentLabel)}</dt><dd>${escapeHtml(formatSentAt(invite.lastSentAt))}</dd></div>
          </dl>
        ` : ""}
        ${share}
        <form class="auth-form" data-invite-form>
          <label for="invite-email">파트너 이메일</label>
          <input id="invite-email" name="email" type="email" autocomplete="email" inputmode="email" required value="${escapeHtml(model.partnerEmail)}">
          <button class="primary auth-submit" type="submit">${escapeHtml(model.primaryCta)}</button>
        </form>
        ${model.email ? `<p class="auth-email-hint">${escapeHtml(model.email)}</p>` : ""}
        ${model.error ? `<p class="auth-error" role="alert">${escapeHtml(model.error)}</p>` : ""}
      </section>
    </main>
  `;
}

export function renderSameSessionFail() {
  const model = sameSessionViewModel();
  return `
    <header class="topbar">
      <a class="brand" href="/mobile/s4-invite/preview.html"><span>AB</span><strong>Before life changes, talk.</strong></a>
      ${logoutChrome(SAME_SESSION_COPY.cta, { continueInvite: true })}
    </header>
    <main class="auth-shell">
      <section class="auth-card" data-screen="same-session-fail">
        <span class="eyebrow">AB · INVITE</span>
        <h1>${escapeHtml(S4_COPY.title)}</h1>
        <p role="status">${escapeHtml(model.message)}</p>
        <button class="primary auth-submit" type="button" data-action="logout-continue">${escapeHtml(model.cta)}</button>
      </section>
    </main>
  `;
}

export function renderInviteBlock(error) {
  const body = error === "expired" ? PRODUCT_INVITE_COPY.expired : error === "mismatch" ? PRODUCT_INVITE_COPY.mismatch : "";
  if (!body) return "";
  return `<p class="auth-error" role="alert" data-invite-block="${escapeHtml(error)}">${escapeHtml(body)}</p>`;
}
