import { ACCOUNT_COPY, FORBIDDEN_APP_COPY, PACK_DETAIL_COPY, PACK_LIST_COPY, PACK_LIST_ROWS, PAIR_COPY, S0_COPY, S2_COPY, S2_EMAIL_BIND_COPY, S3_COPY } from "./s0-s2-s3-copy.js";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);
}

function brand() {
  return `<header class="loveme-topbar"><strong>${escapeHtml(S0_COPY.brand)}</strong></header>`;
}

function backButton(action = "back") {
  return `<button class="loveme-back" type="button" data-action="${escapeHtml(action)}" aria-label="back">‹</button>`;
}

export function renderS0SplashScreen() {
  return `
    <section class="loveme-screen loveme-splash" data-screen="splash">
      <h1>${escapeHtml(S0_COPY.brand)}</h1>
      <p>${escapeHtml(S0_COPY.title)}</p>
    </section>
  `;
}

export function renderS2SignupScreen({ email = "", error = "", busy = false } = {}) {
  return `
    <section class="loveme-gate" data-screen="signup">
      <p class="loveme-gate-brand">${escapeHtml(S0_COPY.brand)}</p>
      <article class="loveme-gate-card">
        <h1>${escapeHtml(S2_COPY.title)}</h1>
        <p>${escapeHtml(S2_COPY.body)}</p>
        <form class="loveme-form" data-s2-form>
          <label for="s2-email">${escapeHtml(S2_COPY.emailLabel)}</label>
          <input id="s2-email" name="email" type="email" autocomplete="email" inputmode="email" required value="${escapeHtml(email)}" placeholder="${escapeHtml(S2_COPY.emailLabel)}" ${busy ? "disabled" : ""}>
          <button class="loveme-primary" type="submit" ${busy ? "disabled" : ""}>${escapeHtml(S2_COPY.cta)}</button>
          ${error ? `<p class="loveme-error" role="alert">${escapeHtml(error)}</p>` : ""}
        </form>
      </article>
    </section>
  `;
}

export function renderS2SentScreen({ email = "" } = {}) {
  return `
    ${brand()}
    <section class="loveme-screen loveme-card" data-screen="sent">
      <span class="loveme-eyebrow">AB · EMAIL SIGN IN</span>
      <h1>${escapeHtml(S2_COPY.title)}</h1>
      <p role="status">${escapeHtml(S2_COPY.sent)}</p>
      ${email ? `<p class="loveme-email">${escapeHtml(email)}</p>` : ""}
      <button class="loveme-secondary" type="button" data-action="back-to-signup">${escapeHtml(S2_COPY.otherEmail)}</button>
    </section>
  `;
}

export function renderS2LoginNoticeScreen({ email = "", error = "", busy = false } = {}) {
  return `
    ${brand()}
    <section class="loveme-screen loveme-card" data-screen="notice">
      <span class="loveme-eyebrow">AB · SIGNED IN</span>
      <h1>${escapeHtml(S2_COPY.title)}</h1>
      <p role="status">${escapeHtml(S2_COPY.afterLogin)}</p>
      ${email ? `<p class="loveme-email">${escapeHtml(email)}</p>` : ""}
      <button class="loveme-primary" type="button" data-action="ack-notice" ${busy ? "disabled" : ""}>${escapeHtml(S2_COPY.ack)}</button>
      ${error ? `<p class="loveme-error" role="alert">${escapeHtml(error)}</p>` : ""}
    </section>
  `;
}

export function renderS2EmailBindScreen({ email = "", error = "", busy = false } = {}) {
  return `
    ${brand()}
    <section class="loveme-screen loveme-card" data-screen="bind">
      <span class="loveme-eyebrow">AB · EMAIL BIND</span>
      <h1>${escapeHtml(S2_EMAIL_BIND_COPY.title)}</h1>
      <p>${escapeHtml(S2_EMAIL_BIND_COPY.body)}</p>
      <form class="loveme-form" data-bind-form>
        <label for="s2-bind-email">${escapeHtml(S2_EMAIL_BIND_COPY.emailLabel)}</label>
        <input id="s2-bind-email" name="email" type="email" autocomplete="email" inputmode="email" required value="${escapeHtml(email)}" ${busy ? "disabled" : ""}>
        <button class="loveme-primary" type="submit" ${busy ? "disabled" : ""}>${escapeHtml(S2_EMAIL_BIND_COPY.cta)}</button>
      </form>
      ${error ? `<p class="loveme-error" role="alert">${escapeHtml(error)}</p>` : ""}
    </section>
  `;
}

export function renderPackDetailScreen() {
  return `
    <section class="loveme-screen loveme-cover" data-screen="pack-detail">
      ${backButton("back-pack-detail")}
      <h1>${escapeHtml(PACK_DETAIL_COPY.title)}</h1>
      <p class="loveme-detail-sub">${escapeHtml(PACK_DETAIL_COPY.subtitle)}</p>
      <article class="loveme-notebook" aria-label="notebook">
        <div class="loveme-notebook-shadow"></div>
        <div class="loveme-notebook-face">
          <div class="loveme-stitch"><span class="loveme-notebook-heart">♡</span></div>
          <span class="loveme-strap"><span class="loveme-snap"></span></span>
          <span class="loveme-ribbon"></span>
        </div>
      </article>
      <p class="loveme-cover-line">${escapeHtml(PACK_DETAIL_COPY.line1)}</p>
      <p class="loveme-cover-line">${escapeHtml(PACK_DETAIL_COPY.line2)}</p>
      <p class="loveme-cover-line">${escapeHtml(PACK_DETAIL_COPY.line3)}</p>
      <button class="loveme-primary loveme-cover-cta" type="button" data-action="send-link">${escapeHtml(PACK_DETAIL_COPY.cta)}</button>
    </section>
  `;
}

export function renderPackListScreen() {
  const rows = PACK_LIST_ROWS.map((row) => row.open
    ? `<button class="loveme-pack-row is-open" type="button" data-action="open-marriage">${escapeHtml(row.label)}<span>›</span></button>`
    : `<div class="loveme-pack-row"><span>${escapeHtml(row.label)}</span><span class="loveme-soon">${escapeHtml(PACK_LIST_COPY.soon)}</span></div>`
  ).join("");
  return `
    <section class="loveme-screen loveme-pack-list" data-screen="pack-list">
      <div class="loveme-pack-top">
        <p class="loveme-cover-brand">${escapeHtml(S0_COPY.brand)}</p>
        <button class="loveme-account-entry" type="button" data-action="open-account">${escapeHtml(ACCOUNT_COPY.title)}</button>
      </div>
      <h1>${escapeHtml(PACK_LIST_COPY.title)}</h1>
      <p class="loveme-pack-sub">${escapeHtml(PACK_LIST_COPY.subtitle)}</p>
      <article class="loveme-pack-stack">${rows}</article>
    </section>
  `;
}

export function renderAccountScreen({ email = "" } = {}) {
  return `
    <section class="loveme-screen loveme-account" data-screen="account">
      <div class="loveme-nav">
        ${backButton("back-account")}
        <h1>${escapeHtml(ACCOUNT_COPY.title)}</h1>
      </div>
      <article class="loveme-account-card">
        <span>${escapeHtml(ACCOUNT_COPY.email)}</span>
        <strong>${escapeHtml(email)}</strong>
      </article>
      <button class="loveme-logout" type="button" data-action="logout">${escapeHtml(ACCOUNT_COPY.logout)}</button>
    </section>
  `;
}

export function renderInviteScreen({ pairCodeDisplay = "", partnerCode = "", error = "" } = {}) {
  return `
    <section class="loveme-screen loveme-invite" data-screen="invite">
      <div class="loveme-nav">
        ${backButton("back-invite")}
        <h1>${escapeHtml(PAIR_COPY.headline)}</h1>
      </div>
      <p class="loveme-invite-sub">${escapeHtml(PAIR_COPY.sub)}</p>
      <article class="loveme-share-card">
        <button type="button" data-action="share-copy">${escapeHtml(PAIR_COPY.copyLink)}</button>
        <button type="button" data-action="share-instagram">${escapeHtml(PAIR_COPY.instagram)}</button>
        <button type="button" data-action="share-kakao">${escapeHtml(PAIR_COPY.kakao)}</button>
      </article>
      <article class="loveme-code-card">
        <p class="loveme-code-eyebrow">${escapeHtml(PAIR_COPY.appCode)}</p>
        <div class="loveme-my-code-row">
          <span>${escapeHtml(PAIR_COPY.myCode)}</span>
          <strong class="loveme-my-code">${escapeHtml(pairCodeDisplay)}</strong>
          <button class="loveme-code-copy" type="button" data-action="copy-code">${escapeHtml(PAIR_COPY.copyCode)}</button>
        </div>
        <p>${escapeHtml(PAIR_COPY.partnerCard)}</p>
        <div class="loveme-connect-row">
          <input name="partner-code" placeholder="${escapeHtml(PAIR_COPY.partnerPlaceholder)}" value="${escapeHtml(partnerCode)}">
          <button class="loveme-connect" type="button" data-action="connect-code">${escapeHtml(PAIR_COPY.connect)}</button>
        </div>
      </article>
      ${error ? `<p class="loveme-error" role="alert">${escapeHtml(error)}</p>` : ""}
    </section>
  `;
}

export function renderS3WorkspaceCreatedScreen({ email = "" } = {}) {
  return `
    ${brand()}
    <section class="loveme-screen loveme-card" data-screen="workspace">
      <span class="loveme-eyebrow">AB · WORKSPACE</span>
      <h1>${escapeHtml(S3_COPY.created)}</h1>
      ${email ? `<p class="loveme-email">${escapeHtml(email)}</p>` : ""}
      <button class="loveme-primary" type="button" data-action="invite-partner">${escapeHtml(S3_COPY.inviteCta)}</button>
    </section>
  `;
}

export function renderNativeScreen(state) {
  if (state.screen === "splash") return renderS0SplashScreen();
  if (state.screen === "pack-detail") return renderPackDetailScreen();
  if (state.screen === "sent") return renderS2SentScreen({ email: state.sentEmail });
  if (state.screen === "bind") return renderS2EmailBindScreen({ email: state.email, error: state.error, busy: state.busy });
  if (state.screen === "notice") return renderS2LoginNoticeScreen({ email: state.session?.user?.email || "", error: state.error, busy: state.busy });
  if (state.screen === "pack-list") return renderPackListScreen();
  if (state.screen === "account") return renderAccountScreen({ email: state.session?.user?.email || "" });
  if (state.screen === "invite") {
    return renderInviteScreen({
      pairCodeDisplay: state.pairCodeDisplay || "",
      partnerCode: state.partnerCode || "",
      error: state.error
    });
  }
  if (state.screen === "workspace") return renderS3WorkspaceCreatedScreen({ email: state.session?.user?.email || "" });
  return renderS2SignupScreen({ email: state.email, error: state.error, busy: state.busy });
}

export function screenForbidsPackAndInstall(html) {
  return !html.includes(FORBIDDEN_APP_COPY.packCta)
    && !html.includes(FORBIDDEN_APP_COPY.installLanding)
    && !html.includes(FORBIDDEN_APP_COPY.installCta)
    && !html.includes("Kakao.Auth")
    && !html.includes("kauth.kakao.com")
    && !html.includes(FORBIDDEN_APP_COPY.kakaoLogin);
}
