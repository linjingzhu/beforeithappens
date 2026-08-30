import { COVER_COPY, FORBIDDEN_APP_COPY, PREVIEW_Q1_COPY, S0_COPY, S2_COPY, S2_EMAIL_BIND_COPY, S2_KEEP_COPY, S3_COPY } from "./s0-s2-s3-copy.js";
import { previewQ1Question } from "./preview-q1.js";

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
        <h1>${escapeHtml(S2_KEEP_COPY.title)}</h1>
        <p>${escapeHtml(S2_KEEP_COPY.body)}</p>
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

export function renderCoverScreen() {
  return `
    <section class="loveme-screen loveme-cover" data-screen="cover">
      <p class="loveme-cover-brand">${escapeHtml(S0_COPY.brand)}</p>
      <p class="loveme-heart">♡</p>
      <h1>${escapeHtml(COVER_COPY.title)}</h1>
      <article class="loveme-notebook" aria-label="notebook">
        <div class="loveme-notebook-shadow"></div>
        <div class="loveme-notebook-face">
          <div class="loveme-stitch"><span class="loveme-notebook-heart">♡</span></div>
          <span class="loveme-strap"><span class="loveme-snap"></span></span>
          <span class="loveme-ribbon"></span>
        </div>
      </article>
      <p class="loveme-cover-line">${escapeHtml(COVER_COPY.line1)}</p>
      <p class="loveme-cover-line">${escapeHtml(COVER_COPY.line2)}</p>
      <button class="loveme-primary loveme-cover-cta" type="button" data-action="preview-q1">${escapeHtml(COVER_COPY.cta)}</button>
    </section>
  `;
}

export function renderPreviewQ1Screen({ choiceId = "", loggedIn = false, question = previewQ1Question() } = {}) {
  const choices = (question?.choices || []).map((choice) => `
        <button class="loveme-choice${choiceId === choice.id ? " is-on" : ""}" type="button" data-action="select-q1" data-choice="${escapeHtml(choice.id)}">${escapeHtml(choice.label)}</button>
  `).join("");
  const cta = loggedIn ? PREVIEW_Q1_COPY.continueCta : PREVIEW_Q1_COPY.keepCta;
  const action = loggedIn ? "continue-preview" : "keep-preview";
  return `
    ${brand()}
    <section class="loveme-screen loveme-card" data-screen="preview-q1">
      <span class="loveme-eyebrow">${escapeHtml(PREVIEW_Q1_COPY.draftBadge)}</span>
      <h1>${escapeHtml(question?.title || "")}</h1>
      <p>${escapeHtml(question?.intent || "")}</p>
      <div class="loveme-choices">${choices}</div>
      <button class="loveme-primary" type="button" data-action="${action}" ${choiceId ? "" : "disabled"}>${escapeHtml(cta)}</button>
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
  if (state.screen === "cover") return renderCoverScreen();
  if (state.screen === "preview-q1") {
    return renderPreviewQ1Screen({
      choiceId: state.previewQ1?.choiceId || "",
      loggedIn: Boolean(state.session?.user)
    });
  }
  if (state.screen === "sent") return renderS2SentScreen({ email: state.sentEmail });
  if (state.screen === "bind") return renderS2EmailBindScreen({ email: state.email, error: state.error, busy: state.busy });
  if (state.screen === "notice") return renderS2LoginNoticeScreen({ email: state.session?.user?.email || "", error: state.error, busy: state.busy });
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
