import { escapeHtml } from "../src/html.js";
import { SITE } from "./config.js";
import { absoluteUrl } from "./content.js";
import { headTags, structuredData } from "./seo.js";

/**
 * Whole documents, not fragments.
 *
 * The app renders by replacing `innerHTML`, which is right for a logged-in workspace and wrong
 * here: a crawler that runs nothing would see an empty shell, and an ad unit that lives across a
 * client-side route change is the impression-inflation shape. So every page is a real file, and
 * turning a page is a real navigation.
 *
 * There is no script tag. A page of questions needs no JavaScript to be read, and not shipping any
 * is the cheapest way to keep it that way.
 */
export const SITE_COPY = Object.freeze({
  next: "다음 질문 열 개",
  previous: "이전으로",
  backToIndex: "질문집 목록",
  progress: (page, pages) => `${page} / ${pages}`,
  ctaTitle: "이 질문, 혼자 답하고 끝내지 마세요.",
  ctaBody: "같은 질문에 상대도 답하면, 서로의 답을 같은 화면에서 볼 수 있어요. 먼저 답한 사람의 답은 상대가 낼 때까지 보이지 않습니다.",
  ctaAction: "둘이 함께 해보기",
  choicesLabel: "네 가지 답",
  whyLabel: "왜 묻는 질문인가요"
});

function questionArticle(question) {
  const choices = question.choices
    .map((choice) => `        <li>${escapeHtml(choice.label)}</li>`)
    .join("\n");
  return `      <article class="q" id="q-${escapeHtml(question.id)}">
        <h2><span class="q-number">${question.number}</span> ${escapeHtml(question.title)}</h2>
        <p class="q-intent">${escapeHtml(question.intent)}</p>
        <p class="q-example">${escapeHtml(question.example)}</p>
        <h3 class="q-label">${escapeHtml(SITE_COPY.choicesLabel)}</h3>
        <ul class="q-choices">
${choices}
        </ul>
        <details class="q-why">
          <summary>${escapeHtml(SITE_COPY.whyLabel)}</summary>
          <p>${escapeHtml(question.whyItMatters)}</p>
        </details>
      </article>`;
}

/**
 * The ad slot. Empty on purpose: ads are step 7, after there is enough content to pass review, and
 * a placeholder that already loads a network is how a site gets reviewed before it is ready. The
 * element exists so the position is fixed by the layout rather than chosen later under pressure —
 * after the questions, before the control that leaves the page.
 */
function adSlot(model) {
  return `      <div class="ad-slot" data-ad-slot="${escapeHtml(model.adSlot)}" aria-hidden="true"></div>`;
}

function pager(model) {
  const previous = model.previousPath
    ? `<a class="pager-prev" href="${escapeHtml(model.previousPath)}" rel="prev">${escapeHtml(SITE_COPY.previous)}</a>`
    : `<a class="pager-prev" href="/">${escapeHtml(SITE_COPY.backToIndex)}</a>`;
  const next = model.nextPath
    ? `<a class="pager-next" href="${escapeHtml(model.nextPath)}" rel="next">${escapeHtml(SITE_COPY.next)}</a>`
    : "";
  return `      <nav class="pager" aria-label="${escapeHtml(model.title)}">
        ${previous}
        <span class="pager-progress">${escapeHtml(SITE_COPY.progress(model.page, model.pages))}</span>
        ${next}
      </nav>`;
}

function callToAction(site) {
  const href = site.appOrigin || "/";
  return `      <aside class="cta">
        <h2>${escapeHtml(SITE_COPY.ctaTitle)}</h2>
        <p>${escapeHtml(SITE_COPY.ctaBody)}</p>
        <a class="cta-action" href="${escapeHtml(href)}">${escapeHtml(SITE_COPY.ctaAction)}</a>
      </aside>`;
}

function document_({ site, head, body }) {
  return `<!doctype html>
<html lang="${escapeHtml(site.locale.split("-")[0])}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
${head}
  <link rel="stylesheet" href="/tokens.css">
  <link rel="stylesheet" href="/site.css">
</head>
<body>
  <header class="masthead">
    <a class="brand" href="/">${escapeHtml(site.name)}</a>
    <p class="tagline">${escapeHtml(site.tagline)}</p>
  </header>
${body}
  <footer class="foot">
    <p>${escapeHtml(site.name)} · ${escapeHtml(site.tagline)}</p>
  </footer>
</body>
</html>
`;
}

export function renderQuestionPage(model, site = SITE) {
  const body = `  <main class="page">
    <h1>${escapeHtml(model.title)}</h1>
${model.lead ? `    <p class="lead">${escapeHtml(model.lead)}</p>\n` : ""}    <section class="questions">
${model.questions.map(questionArticle).join("\n")}
    </section>
${adSlot(model)}
${pager(model)}
${callToAction(site)}
  </main>`;
  return document_({
    site,
    head: `${headTags(model, site)}\n  ${structuredData(model, site)}`,
    body
  });
}

export function renderIndex(model, site = SITE) {
  const cards = model.packs
    .map((pack) => `      <li class="card">
        <h2><a href="${escapeHtml(pack.path)}">${escapeHtml(pack.title)}</a></h2>
        <p>${escapeHtml(pack.description)}</p>
        <p class="card-meta">${pack.total}개의 질문 · ${pack.pages}쪽</p>
      </li>`)
    .join("\n");
  const head = [
    `  <title>${escapeHtml(site.name)} · ${escapeHtml(site.tagline)}</title>`,
    site.origin ? `  <link rel="canonical" href="${escapeHtml(absoluteUrl(site.origin, "/"))}">` : ""
  ].filter(Boolean).join("\n");
  return document_({
    site,
    head,
    body: `  <main class="page">
    <ul class="cards">
${cards}
    </ul>
${callToAction(site)}
  </main>`
  });
}
