import { ACCOUNT_COPY, COMING_SOON_TASTE_COPY, comingSoonPackLabel, FORBIDDEN_APP_COPY, PACK_DETAIL_COPY, PACK_LIST_COPY, PACK_LIST_ROWS, PAIR_COPY, RESULT_TASTE_COPY, S0_COPY, S2_COPY, S2_EMAIL_BIND_COPY, S3_COPY } from "./s0-s2-s3-copy.js";

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
      ${backButton("cancel-login")}
      <p class="loveme-gate-brand">${escapeHtml(S0_COPY.brand)}</p>
      <article class="loveme-gate-card">
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
  const samples = PACK_DETAIL_COPY.samples.map((sample, index) => `
      <article class="loveme-sample-card" data-sample="${index + 1}">
        <span class="loveme-sample-num">${index + 1}</span>
        <p>${escapeHtml(sample)}</p>
      </article>`).join("");
  const caption = PACK_DETAIL_COPY.captionLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
  return `
    <section class="loveme-screen loveme-pack-detail" data-screen="pack-detail">
      ${backButton("back-pack-detail")}
      <h1>${escapeHtml(PACK_DETAIL_COPY.title)}</h1>
      <p class="loveme-detail-sub">${escapeHtml(PACK_DETAIL_COPY.subtitle)}</p>
      <h2 class="loveme-samples-title">${escapeHtml(PACK_DETAIL_COPY.samplesTitle)}</h2>
      <div class="loveme-sample-stack">${samples}</div>
      <div class="loveme-lock-caption">
        <span class="loveme-lock" aria-hidden="true"></span>
        <div>${caption}</div>
      </div>
      <button class="loveme-primary loveme-cover-cta" type="button" data-action="send-link"><span class="loveme-link-mark" aria-hidden="true"></span>${escapeHtml(PACK_DETAIL_COPY.cta)}</button>
    </section>
  `;
}

function tasteHouse() {
  return `<div class="loveme-taste-house" aria-hidden="true"><span class="loveme-taste-roof"></span><span class="loveme-taste-wall"><span class="loveme-taste-heart">♡</span></span></div>`;
}

export function renderComingSoonScreen({ packId = "home-mgmt" } = {}) {
  const title = comingSoonPackLabel(packId) || comingSoonPackLabel("home-mgmt");
  return `
    <section class="loveme-screen loveme-coming-soon" data-screen="coming-soon" data-pack="${escapeHtml(packId)}">
      <span class="loveme-soon-badge">${escapeHtml(COMING_SOON_TASTE_COPY.badge)}</span>
      <p class="loveme-soon-eyebrow">${escapeHtml(COMING_SOON_TASTE_COPY.eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      ${tasteHouse()}
      <article class="loveme-taste-card">
        <p class="loveme-taste-experience">${escapeHtml(COMING_SOON_TASTE_COPY.experience)}</p>
        <div class="loveme-taste-q">
          <span class="loveme-taste-qmark">Q</span>
          <p>${escapeHtml(COMING_SOON_TASTE_COPY.sampleQuestion)}</p>
          <p class="loveme-taste-q-caption">${escapeHtml(COMING_SOON_TASTE_COPY.sampleCaption)}</p>
        </div>
      </article>
      <button class="loveme-primary loveme-cover-cta" type="button" data-action="open-taste-result">${escapeHtml(COMING_SOON_TASTE_COPY.cta)}</button>
      <button class="loveme-text-link" type="button" data-action="back-coming-soon">${escapeHtml(COMING_SOON_TASTE_COPY.backToList)}</button>
    </section>
  `;
}

export function renderTasteResultScreen({ packId = "home-mgmt" } = {}) {
  const labels = Object.values(RESULT_TASTE_COPY.labels).map((label) => {
    const on = label === RESULT_TASTE_COPY.label ? " is-on" : "";
    return `<span class="loveme-taste-label-chip${on}">${escapeHtml(label)}</span>`;
  }).join("");
  return `
    <section class="loveme-screen loveme-taste-result" data-screen="taste-result" data-pack="${escapeHtml(packId)}">
      <h1>${escapeHtml(RESULT_TASTE_COPY.title)}</h1>
      <div class="loveme-taste-labels">${labels}</div>
      <p class="loveme-taste-question">${escapeHtml(RESULT_TASTE_COPY.question)}</p>
      <article class="loveme-taste-answer">
        <span>${escapeHtml(RESULT_TASTE_COPY.me)}</span>
        <p>${escapeHtml(RESULT_TASTE_COPY.meAnswer)}</p>
      </article>
      <article class="loveme-taste-answer">
        <span>${escapeHtml(RESULT_TASTE_COPY.partner)}</span>
        <p>${escapeHtml(RESULT_TASTE_COPY.partnerAnswer)}</p>
      </article>
      <p class="loveme-taste-result-caption">${escapeHtml(RESULT_TASTE_COPY.caption)}</p>
      <p class="loveme-taste-result-example">${escapeHtml(RESULT_TASTE_COPY.example)}</p>
      <button class="loveme-taste-list-cta" type="button" data-action="back-to-list">${escapeHtml(RESULT_TASTE_COPY.cta)}</button>
    </section>
  `;
}

export function renderPackListScreen() {
  const rows = PACK_LIST_ROWS.map((row) => row.open
    ? `<button class="loveme-pack-row is-open" type="button" data-action="open-marriage">${escapeHtml(row.label)}<span>›</span></button>`
    : `<button class="loveme-pack-row" type="button" data-action="open-coming-soon" data-pack="${escapeHtml(row.id)}"><span>${escapeHtml(row.label)}</span><span class="loveme-soon">${escapeHtml(PACK_LIST_COPY.soon)}</span></button>`
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
  if (state.screen === "coming-soon") return renderComingSoonScreen({ packId: state.comingSoonId });
  if (state.screen === "taste-result") return renderTasteResultScreen({ packId: state.comingSoonId });
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
