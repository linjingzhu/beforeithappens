import { ACCOUNT_COPY, COMING_SOON_TASTE_COPY, comingSoonPackLabel, FORBIDDEN_APP_COPY, PACK_LIST_COPY, PACK_LIST_ROWS, PAIR_COPY, packListLabel, S0_COPY, S2_COPY, S2_EMAIL_BIND_COPY, S3_COPY } from "./s0-s2-s3-copy.js";
import { HEART_COPY, HEARTS, canUnlockRest, showsHeartBalance } from "../src/hearts.js";
import { CERTIFICATE_COPY, comingSoonExistingQuestion, REASON_PROMPT, SAMPLE_LABELS, SAMPLE_NEXT, SAMPLE_RESULT_EXAMPLE, SAMPLE_SIZE, sampleCounterLabel, TOGETHER_CTA } from "../src/marriage-sample.js";
import { debugLine } from "./src/virtual.js";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);
}

function debug() {
  const line = debugLine();
  return line ? `<p class="loveme-debug" data-debug="1">${escapeHtml(line)}</p>` : "";
}

function heartsChip(balance) {
  return `<p class="loveme-hearts" data-hearts="${escapeHtml(String(balance))}">♡ ${escapeHtml(String(balance))}</p>`;
}

export function renderS0SplashScreen() {
  return `
    <section class="loveme-screen loveme-splash" data-screen="splash">
      <h1>${escapeHtml(S0_COPY.brand)}</h1>
      ${debug()}
    </section>
  `;
}

export function renderS2SignupScreen({ email = "", error = "", busy = false, firstRun = true } = {}) {
  return `
    <section class="loveme-gate${firstRun ? " loveme-login-first" : ""}" data-screen="signup">
      ${firstRun ? "" : `<button class="loveme-back" type="button" data-action="cancel-login" aria-label="back">‹</button>`}
      <h1 class="loveme-login-mark">${escapeHtml(S0_COPY.brand)}</h1>
      ${firstRun ? "" : `<p class="loveme-login-body">${escapeHtml(S2_COPY.body)}</p>`}
      <form class="loveme-form loveme-login-form" data-s2-form>
        <label class="loveme-email-field" for="s2-email">
          <span class="loveme-mail-icon" aria-hidden="true">✉</span>
          <input id="s2-email" name="email" type="email" autocomplete="email" inputmode="email" required value="${escapeHtml(email)}" placeholder="${escapeHtml(S2_COPY.emailPlaceholder)}" ${busy ? "disabled" : ""}>
        </label>
        <button class="loveme-primary" type="submit" ${busy ? "disabled" : ""}>${escapeHtml(S2_COPY.cta)}</button>
        ${error ? `<p class="loveme-error" role="alert">${escapeHtml(error)}</p>` : ""}
      </form>
      ${debug()}
    </section>
  `;
}

export function renderS2SentScreen({ email = "" } = {}) {
  return `
    <section class="loveme-screen loveme-card" data-screen="sent">
      <p role="status">${escapeHtml(S2_COPY.sent)}</p>
      ${email ? `<p class="loveme-email">${escapeHtml(email)}</p>` : ""}
      <button class="loveme-secondary" type="button" data-action="back-to-signup">${escapeHtml(S2_COPY.otherEmail)}</button>
      ${debug()}
    </section>
  `;
}

export function renderS2LoginNoticeScreen({ email = "", error = "", busy = false } = {}) {
  return `
    <section class="loveme-screen loveme-card" data-screen="notice">
      <p role="status">${escapeHtml(S2_COPY.afterLogin)}</p>
      ${email ? `<p class="loveme-email">${escapeHtml(email)}</p>` : ""}
      <button class="loveme-primary" type="button" data-action="ack-notice" ${busy ? "disabled" : ""}>${escapeHtml(S2_COPY.ack)}</button>
      ${error ? `<p class="loveme-error" role="alert">${escapeHtml(error)}</p>` : ""}
      ${debug()}
    </section>
  `;
}

export function renderS2EmailBindScreen({ email = "", error = "", busy = false } = {}) {
  return `
    <section class="loveme-screen loveme-card" data-screen="bind">
      <h1>${escapeHtml(S2_EMAIL_BIND_COPY.title)}</h1>
      <p>${escapeHtml(S2_EMAIL_BIND_COPY.body)}</p>
      <form class="loveme-form" data-bind-form>
        <label for="s2-bind-email">${escapeHtml(S2_EMAIL_BIND_COPY.emailLabel)}</label>
        <input id="s2-bind-email" name="email" type="email" autocomplete="email" inputmode="email" required value="${escapeHtml(email)}" ${busy ? "disabled" : ""}>
        <button class="loveme-primary" type="submit" ${busy ? "disabled" : ""}>${escapeHtml(S2_EMAIL_BIND_COPY.cta)}</button>
      </form>
      ${error ? `<p class="loveme-error" role="alert">${escapeHtml(error)}</p>` : ""}
      ${debug()}
    </section>
  `;
}

export function renderPackDetailScreen() {
  return renderSampleQuestionScreen({
    question: { title: "결혼", choices: [] },
    choiceId: "",
    reason: ""
  });
}

export function renderSampleQuestionScreen({
  question = { title: "", choices: [] },
  choiceId = "",
  reason = "",
  error = "",
  progressLabel = "결혼 1/3"
} = {}) {
  const choices = (question.choices || []).map((choice) => `
      <label class="loveme-choice${choiceId === choice.id ? " is-on" : ""}">
        <input type="radio" name="sample-choice" value="${escapeHtml(choice.id)}" ${choiceId === choice.id ? "checked" : ""}>
        <span>${escapeHtml(choice.label)}</span>
      </label>`).join("");
  return `
    <section class="loveme-screen loveme-sample" data-screen="sample-q">
      <button class="loveme-back" type="button" data-action="back-pack-detail" aria-label="back">‹</button>
      <p class="loveme-sample-progress">${escapeHtml(progressLabel)}</p>
      <h1 class="loveme-stem">${escapeHtml(question.title || "")}</h1>
      <fieldset>${choices}</fieldset>
      <p class="loveme-reason-label"><span class="loveme-reason-heart" aria-hidden="true">♡</span> ${escapeHtml(REASON_PROMPT)}</p>
      <input id="sample-reason" name="sample-reason" type="text" required value="${escapeHtml(reason)}" placeholder="${escapeHtml(REASON_PROMPT)}">
      <button class="loveme-primary" type="button" data-action="submit-sample" ${sampleAnswerReady(choiceId, reason) ? "" : "disabled"}>${escapeHtml(SAMPLE_NEXT)}</button>
      ${error ? `<p class="loveme-error" role="alert">${escapeHtml(error)}</p>` : ""}
      ${debug()}
    </section>
  `;
}

function sampleAnswerReady(choiceId, reason) {
  return Boolean(String(choiceId || "").trim()) && Boolean(String(reason || "").trim());
}

export function renderSampleResultScreen({
  question = { title: "", choices: [] },
  myChoice = { label: "" },
  partnerChoice = { label: "" }
} = {}) {
  const labels = Object.values(SAMPLE_LABELS).map((label) => `<span class="loveme-taste-label-chip">${escapeHtml(label)}</span>`).join("");
  return `
    <section class="loveme-screen loveme-taste-result" data-screen="sample-result">
      <p class="loveme-example">${escapeHtml(SAMPLE_RESULT_EXAMPLE)}</p>
      <div class="loveme-taste-labels">${labels}</div>
      <p class="loveme-taste-question">${escapeHtml(question.title || "")}</p>
      <article class="loveme-taste-answer"><span>나</span><p>${escapeHtml(myChoice.label || "")}</p></article>
      <article class="loveme-taste-answer"><span>상대</span><p>${escapeHtml(partnerChoice.label || "")}</p></article>
      <button class="loveme-primary" type="button" data-action="together">${escapeHtml(TOGETHER_CTA)}</button>
      ${debug()}
    </section>
  `;
}

export function renderComingSoonScreen({ packId = "home-mgmt" } = {}) {
  const title = comingSoonPackLabel(packId) || comingSoonPackLabel("home-mgmt");
  const question = comingSoonExistingQuestion(packId);
  return `
    <section class="loveme-screen loveme-coming-soon" data-screen="coming-soon" data-pack="${escapeHtml(packId)}">
      <span class="loveme-soon-badge">${escapeHtml(COMING_SOON_TASTE_COPY.badge)}</span>
      <h1>${escapeHtml(title)}</h1>
      ${question ? `<article class="loveme-taste-card"><p>${escapeHtml(question)}</p></article>` : ""}
      <button class="loveme-text-link" type="button" data-action="back-coming-soon">${escapeHtml(COMING_SOON_TASTE_COPY.backToList)}</button>
      ${debug()}
    </section>
  `;
}

export function renderTasteResultScreen({ packId = "home-mgmt" } = {}) {
  return renderComingSoonScreen({ packId });
}

export function renderPackListScreen({ hearts = HEARTS.start, session = null } = {}) {
  const rows = PACK_LIST_ROWS.map((row) => row.open
    ? `<button class="loveme-pack-row is-open" type="button" data-action="open-marriage"><span class="loveme-pack-mark">${escapeHtml(row.mark || "")}</span><span class="loveme-pack-name">${escapeHtml(row.label)}</span><span>›</span></button>`
    : `<button class="loveme-pack-row" type="button" data-action="open-coming-soon" data-pack="${escapeHtml(row.id)}"><span class="loveme-pack-mark">${escapeHtml(row.mark || "")}</span><span class="loveme-pack-name">${escapeHtml(row.label)}</span><span class="loveme-soon">${escapeHtml(PACK_LIST_COPY.soon)}</span></button>`
  ).join("");
  const heartsHtml = showsHeartBalance(session) ? heartsChip(hearts) : "";
  return `
    <section class="loveme-screen loveme-pack-list" data-screen="pack-list">
      ${heartsHtml}
      <h1 class="loveme-title">${escapeHtml(PACK_LIST_COPY.title)}</h1>
      <article class="loveme-pack-stack">${rows}</article>
      <button class="loveme-account-entry" type="button" data-action="open-account">${escapeHtml(ACCOUNT_COPY.title)}</button>
      ${debug()}
    </section>
  `;
}

export function renderAccountScreen({
  email = "",
  partnerEmail = "",
  acceptedPartner = false,
  guest = false
} = {}) {
  if (guest) {
    return `
    <section class="loveme-screen loveme-account" data-screen="account">
      <h1>${escapeHtml(ACCOUNT_COPY.title)}</h1>
      <button class="loveme-primary" type="button" data-action="account-login">${escapeHtml(ACCOUNT_COPY.login)}</button>
      ${debug()}
    </section>`;
  }
  if (acceptedPartner) {
    return `
    <section class="loveme-screen loveme-account" data-screen="account">
      <div class="loveme-nav">
        <button class="loveme-back" type="button" data-action="back-account" aria-label="back">‹</button>
        <h1>${escapeHtml(ACCOUNT_COPY.title)}</h1>
      </div>
      <article class="loveme-account-card">
        <strong data-account-partner>${escapeHtml(partnerEmail || email)}</strong>
      </article>
      <button class="loveme-logout" type="button" data-action="logout">${escapeHtml(ACCOUNT_COPY.logout)}</button>
      ${debug()}
    </section>`;
  }
  return `
    <section class="loveme-screen loveme-account" data-screen="account">
      <div class="loveme-nav">
        <button class="loveme-back" type="button" data-action="back-account" aria-label="back">‹</button>
        <h1>${escapeHtml(ACCOUNT_COPY.title)}</h1>
      </div>
      <p class="loveme-email" data-account-email>${escapeHtml(email)}</p>
      <button class="loveme-primary" type="button" data-action="invite-partner">${escapeHtml(ACCOUNT_COPY.invite)}</button>
      <button class="loveme-logout" type="button" data-action="logout">${escapeHtml(ACCOUNT_COPY.logout)}</button>
      ${debug()}
    </section>
  `;
}

export function renderUnlockScreen({ hearts = 0, shopOpen = false } = {}) {
  const need = canUnlockRest(hearts) ? "" : `<p class="loveme-need">${escapeHtml(HEART_COPY.needHearts)}</p>`;
  const shop = shopOpen ? renderShopSheet({ hearts }) : "";
  return `
    <section class="loveme-screen loveme-unlock" data-screen="unlock">
      ${heartsChip(hearts)}
      <h1>${escapeHtml(HEART_COPY.unlockTitle)}</h1>
      <p>${escapeHtml(HEART_COPY.unlockBody)}</p>
      <button class="loveme-primary" type="button" data-action="unlock-rest">${escapeHtml(HEART_COPY.unlockCta)}</button>
      ${need}
      ${shop}
      ${debug()}
    </section>
  `;
}

export function renderShopSheet({ hearts = 0 } = {}) {
  return `
    <aside class="loveme-shop" data-screen="shop">
      ${heartsChip(hearts)}
      <h2>${escapeHtml(HEART_COPY.shopTitle)}</h2>
      <button class="loveme-primary" type="button" data-action="buy-hearts">${escapeHtml(HEART_COPY.shopCta)}</button>
      <button class="loveme-text-link" type="button" data-action="shop-later">${escapeHtml(HEART_COPY.later)}</button>
    </aside>
  `;
}

export function renderPartnerWaitScreen() {
  return `
    <section class="loveme-screen loveme-partner-wait" data-screen="partner-wait">
      <p>${escapeHtml(HEART_COPY.partnerWait)}</p>
      ${debug()}
    </section>
  `;
}

export function renderCertificateScreen({ packLabel = "결혼" } = {}) {
  return `
    <section class="loveme-screen loveme-certificate" data-screen="certificate">
      <h1>${escapeHtml(CERTIFICATE_COPY.title)}</h1>
      <p>${escapeHtml(packLabel)}</p>
      <p class="loveme-example">${escapeHtml(CERTIFICATE_COPY.body)}</p>
      <p class="loveme-example">${escapeHtml(SAMPLE_RESULT_EXAMPLE)}</p>
      <button class="loveme-text-link" type="button" data-action="back-certificate">${escapeHtml(CERTIFICATE_COPY.cta)}</button>
      ${debug()}
    </section>
  `;
}

export function renderInviteScreen({ pairCodeDisplay = "", partnerCode = "", error = "" } = {}) {
  return `
    <section class="loveme-screen loveme-invite" data-screen="invite">
      <div class="loveme-nav">
        <button class="loveme-back" type="button" data-action="back-invite" aria-label="back">‹</button>
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
      ${debug()}
    </section>
  `;
}

export function renderS3WorkspaceCreatedScreen({ email = "" } = {}) {
  return `
    <section class="loveme-screen loveme-card" data-screen="workspace">
      <h1>${escapeHtml(S3_COPY.created)}</h1>
      ${email ? `<p class="loveme-email">${escapeHtml(email)}</p>` : ""}
      <button class="loveme-primary" type="button" data-action="invite-partner">${escapeHtml(S3_COPY.inviteCta)}</button>
      ${debug()}
    </section>
  `;
}

export function renderNativeScreen(state) {
  if (state.screen === "splash") return renderS0SplashScreen();
  if (state.screen === "coming-soon") return renderComingSoonScreen({ packId: state.comingSoonId });
  if (state.screen === "taste-result") return renderComingSoonScreen({ packId: state.comingSoonId });
  if (state.screen === "sample-q") {
    return renderSampleQuestionScreen({
      question: state.sampleQuestions?.[state.sampleIndex] || { title: "", choices: [] },
      choiceId: state.sampleChoice,
      reason: state.sampleReason,
      error: state.error,
      progressLabel: sampleCounterLabel(state.samplePackId, state.sampleIndex, SAMPLE_SIZE)
    });
  }
  if (state.screen === "sample-result") {
    const question = state.sampleQuestions?.[state.sampleQuestions.length - 1] || { title: "", choices: [] };
    const mine = question.choices?.find((choice) => choice.id === state.sampleAnswers?.at?.(-1)?.choiceId) || {};
    return renderSampleResultScreen({ question, myChoice: mine, partnerChoice: state.samplePartner || {} });
  }
  if (state.screen === "unlock") return renderUnlockScreen({ hearts: state.hearts, shopOpen: state.shopOpen });
  if (state.screen === "certificate") return renderCertificateScreen({ packLabel: packListLabel(state.samplePackId) || "결혼" });
  if (state.screen === "partner-wait") return renderPartnerWaitScreen();
  if (state.screen === "sent") return renderS2SentScreen({ email: state.sentEmail });
  if (state.screen === "bind") return renderS2EmailBindScreen({ email: state.email, error: state.error, busy: state.busy });
  if (state.screen === "notice") return renderS2LoginNoticeScreen({ email: state.session?.user?.email || "", error: state.error, busy: state.busy });
  if (state.screen === "pack-list") return renderPackListScreen({ hearts: state.hearts, session: state.session });
  if (state.screen === "account") {
    return renderAccountScreen({
      email: state.session?.user?.email || "",
      partnerEmail: state.session?.workspace?.partnerEmail || "",
      acceptedPartner: Boolean(state.session?.workspace?.acceptedPartner),
      guest: !state.session?.user
    });
  }
  if (state.screen === "invite") {
    return renderInviteScreen({
      pairCodeDisplay: state.pairCodeDisplay || "",
      partnerCode: state.partnerCode || "",
      error: state.error
    });
  }
  if (state.screen === "workspace") return renderS3WorkspaceCreatedScreen({ email: state.session?.user?.email || "" });
  const firstRun = !state.session?.user && (state.pendingGate === "home" || !state.pendingGate);
  return renderS2SignupScreen({ email: state.email, error: state.error, busy: state.busy, firstRun });
}

export function screenForbidsPackAndInstall(html) {
  return !html.includes(FORBIDDEN_APP_COPY.packCta)
    && !html.includes(FORBIDDEN_APP_COPY.installLanding)
    && !html.includes(FORBIDDEN_APP_COPY.installCta)
    && !html.includes("Kakao.Auth")
    && !html.includes("kauth.kakao.com")
    && !html.includes(FORBIDDEN_APP_COPY.kakaoLogin);
}
