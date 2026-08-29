import { FORBIDDEN_APP_COPY, S0_COPY, S2_COPY, S3_COPY } from "./s0-s2-s3-copy.js";

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
  return `<header class="loveme-topbar"><span class="loveme-mark">${escapeHtml(S0_COPY.brand)}</span><strong>${escapeHtml(S0_COPY.english)}</strong></header>`;
}

export function renderS0SplashScreen() {
  return `
    <section class="loveme-screen loveme-splash" data-screen="splash">
      <span class="loveme-mark loveme-mark-lg">${escapeHtml(S0_COPY.brand)}</span>
      <h1>${escapeHtml(S0_COPY.title)}</h1>
      <p>${escapeHtml(S0_COPY.tagline)}</p>
      <small>${escapeHtml(S0_COPY.english)}</small>
    </section>
  `;
}

export function renderS2SignupScreen({ email = "", error = "", busy = false } = {}) {
  return `
    ${brand()}
    <section class="loveme-screen loveme-card" data-screen="signup">
      <span class="loveme-eyebrow">AB · EMAIL SIGN IN</span>
      <h1>${escapeHtml(S2_COPY.title)}</h1>
      <p>${escapeHtml(S2_COPY.body)}</p>
      <form class="loveme-form" data-s2-form>
        <label for="s2-email">${escapeHtml(S2_COPY.emailLabel)}</label>
        <input id="s2-email" name="email" type="email" autocomplete="email" inputmode="email" required value="${escapeHtml(email)}" ${busy ? "disabled" : ""}>
        <button class="loveme-primary" type="submit" ${busy ? "disabled" : ""}>${escapeHtml(S2_COPY.cta)}</button>
      </form>
      ${error ? `<p class="loveme-error" role="alert">${escapeHtml(error)}</p>` : ""}
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
  if (state.screen === "sent") return renderS2SentScreen({ email: state.sentEmail });
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
