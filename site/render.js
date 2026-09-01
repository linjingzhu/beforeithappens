import { escapeHtml } from "../src/html.js";
import { SITE } from "./config.js";
import { absoluteUrl, indexModel } from "./content.js";
import { headTags, structuredData } from "./seo.js";
import { RESULT_COPY } from "./result.js";

/**
 * Whole documents, not fragments.
 *
 * The app renders by replacing `innerHTML`, which is right for a logged-in workspace and wrong
 * here: a crawler that runs nothing would see an empty shell, and an ad unit that lives across a
 * client-side route change is the impression-inflation shape. So every page is a real file, and
 * turning a page is a real navigation.
 *
 * One script is shipped, and only as enhancement. Every question, every choice and every word of
 * explanation is in the HTML: a crawler, or a reader with scripting off, loses the ability to
 * *record* an answer, never the ability to read one. Answers live in that browser and nowhere else,
 * so the page needs no session, no account, and no request.
 */
export const SITE_COPY = Object.freeze({
  wordmark: "Love Me",
  next: "다음",
  previous: "이전",
  backToIndex: "질문집 목록",
  partsLabel: "파트",
  partsUnit: "개 파트",
  packsLabel: "질문집",
  partWord: (n) => `Part ${n}`,
  progress: (page, pages) => `${page} / ${pages}`,
  ctaTitle: "이 질문, 혼자 답하고 끝내지 마세요.",
  ctaBody: "같은 질문에 상대도 답하면, 서로의 답을 같은 화면에서 볼 수 있어요. 먼저 답한 사람의 답은 상대가 낼 때까지 보이지 않습니다.",
  ctaAction: "둘이 함께 해보기",
  choicesLabel: "네 가지 답",
  whyLabel: "왜 묻는 질문인가요",
  notDiscussed: "아직 상대와 이야기해 본 적 없어요",
  resultAction: "결과 보기",
  noScriptNote: "브라우저 저장이 꺼져 있으면 답이 기억되지 않아요. 질문은 그대로 읽으실 수 있습니다."
});

function questionArticle(question) {
  const choices = question.choices
    .map((choice) => {
      // The name of the value a choice stands for, where the pack's author wrote one. It is what
      // makes four plausible answers legible as four different things to want.
      const value = choice.valueLabel
        ? `<em class="q-choice-value">${escapeHtml(choice.valueLabel)}</em>`
        : "";
      return `          <li><label class="q-choice">
            <input type="radio" name="q-${escapeHtml(question.id)}" value="${escapeHtml(choice.id)}">
            <span>${escapeHtml(choice.label)}${value}</span>
          </label></li>`;
    })
    .join("\n");
  const mood = question.mood ? `<span class="q-mood">${escapeHtml(question.mood)}</span>` : "";
  // Guidance copy is app-pack only (see `PACK_SURFACE` in `src/pack-schema.js`). A site pack has
  // none, and an empty <p> would render as a gap the reader cannot account for, so the elements are
  // omitted rather than emptied.
  const intent = question.intent ? `\n        <p class="q-intent">${escapeHtml(question.intent)}</p>` : "";
  const example = question.example ? `\n        <p class="q-example">${escapeHtml(question.example)}</p>` : "";
  const why = question.whyItMatters
    ? `\n        <details class="q-why">
          <summary>${escapeHtml(SITE_COPY.whyLabel)}</summary>
          <p>${escapeHtml(question.whyItMatters)}</p>
        </details>`
    : "";
  return `      <article class="q" id="q-${escapeHtml(question.id)}" data-question="${escapeHtml(question.id)}">
        <h2><span class="q-number">${question.number}</span> ${escapeHtml(question.title)}${mood}</h2>${intent}${example}
        <h3 class="q-label">${escapeHtml(SITE_COPY.choicesLabel)}</h3>
        <ul class="q-choices">
${choices}
        </ul>
        <label class="q-undiscussed">
          <input type="checkbox" data-undiscussed="${escapeHtml(question.id)}">
          <span>${escapeHtml(SITE_COPY.notDiscussed)}</span>
        </label>${why}
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

/**
 * The tab strip. One tab per Part, and the page is the Part — so a tab is a link to a real
 * document, not a control that hides and shows things. That is what lets a reader open Part 7 in a
 * new tab, land on it from a search result, or read the whole pack with scripting off.
 */
function partTabs(model) {
  const tabs = model.parts
    .map((part) => `        <a class="part-tab${part.current ? " is-current" : ""}" href="${escapeHtml(part.path)}"${part.current ? ' aria-current="page"' : ""}>
          <span class="part-tab-n">${escapeHtml(SITE_COPY.partWord(part.number))}</span>
          <span class="part-tab-title">${escapeHtml(part.title)}</span>
        </a>`)
    .join("\n");
  return `      <nav class="parts" aria-label="${escapeHtml(SITE_COPY.partsLabel)}">
${tabs}
      </nav>`;
}

/**
 * The bottom control. Forward is the prominent one because forward is what a reader is doing; the
 * last Part offers the sheet instead, since there is no next Part to promise. The next Part is named
 * rather than counted — "다음 · 감정과 애정" tells you what you are about to be asked.
 */
function pager(model) {
  const nextPart = model.parts.find((part) => part.number === model.page + 1);
  const previous = model.previousPath
    ? `<a class="pager-prev" href="${escapeHtml(model.previousPath)}" rel="prev">${escapeHtml(SITE_COPY.previous)}</a>`
    : `<a class="pager-prev" href="/">${escapeHtml(SITE_COPY.backToIndex)}</a>`;
  const next = model.nextPath
    ? `<a class="pager-next" href="${escapeHtml(model.nextPath)}" rel="next">${escapeHtml(SITE_COPY.next)}<span class="pager-next-part">${escapeHtml(nextPart ? nextPart.title : "")}</span></a>`
    : `<a class="pager-next is-result" href="/${escapeHtml(model.slug)}/result/">${escapeHtml(SITE_COPY.resultAction)}</a>`;
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

function enhancement() {
  return `  <script type="module" src="/enhance.js"></script>`;
}

/**
 * The left rail: the mark, then one entry per published pack.
 *
 * It is built from `indexModel`, the same list the index page renders, so a pack cannot appear in
 * one and not the other. Today that is one entry; the markup is a list because it will not be, and
 * a list of one costs nothing while a list grown out of a single hard-coded link costs a rewrite.
 */
function rail(site, currentSlug) {
  const packs = indexModel({ site }).packs;
  // A list of one is not a list: with a single pack published, the rail's nav names the page the
  // reader is already on, under a heading for a category with one member. So the rail carries the
  // mark alone until there is a second pack, and the nav comes back on its own when there is —
  // which is the same list, appearing when it starts saying something.
  const nav = packs.length < 2
    ? ""
    : `
    <nav class="rail-nav" aria-label="${escapeHtml(SITE_COPY.packsLabel)}">
      <p class="rail-label">${escapeHtml(SITE_COPY.packsLabel)}</p>
      <ul>
${packs.map((pack) => {
  const current = pack.slug === currentSlug;
  // `true`, not `page`: this links to the pack's first Part, and the reader may be on its
  // seventh. The Part tab is the one that is genuinely the current page.
  return `        <li><a class="rail-item${current ? " is-current" : ""}" href="${escapeHtml(pack.path)}"${current ? ' aria-current="true"' : ""}>${escapeHtml(pack.navTitle)}</a></li>`;
}).join("\n")}
      </ul>
    </nav>`;
  return `  <aside class="rail">
    <a class="mark" href="/">
      <img class="mark-logo" src="/brand/logo.png" width="32" height="32" alt="" decoding="async">
      <span class="wordmark">${escapeHtml(SITE_COPY.wordmark)}</span>
    </a>${nav}
    <p class="rail-foot">${escapeHtml(site.tagline)}</p>
  </aside>`;
}

function document_({ site, head, body, scripts = "", currentSlug = "" }) {
  return `<!doctype html>
<html lang="${escapeHtml(site.locale.split("-")[0])}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
${head}
  <link rel="stylesheet" href="/tokens.css">
  <link rel="stylesheet" href="/site.css">
  <link rel="preload" href="/brand/pretendard-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/brand/maruburi-600.woff2" as="font" type="font/woff2" crossorigin>
</head>
<body>
  <div class="shell">
${rail(site, currentSlug)}
    <div class="stage">
${body}
      <footer class="foot">
        <p>${escapeHtml(SITE_COPY.wordmark)} · ${escapeHtml(site.tagline)}</p>
      </footer>
    </div>
  </div>
${scripts}
</body>
</html>
`;
}

export function renderQuestionPage(model, site = SITE) {
  const body = `      <header class="stage-head">
        <h1>${escapeHtml(model.title)}</h1>
${partTabs(model)}
      </header>
      <main class="page">
        <h2 class="part-title"><span class="part-title-n">${escapeHtml(SITE_COPY.partWord(model.part.number))}</span> ${escapeHtml(model.part.title)}</h2>
${model.part.blurb ? `        <p class="part-blurb">${escapeHtml(model.part.blurb)}</p>\n` : ""}${model.lead ? `        <p class="lead">${escapeHtml(model.lead)}</p>\n` : ""}        <section class="questions">
${model.questions.map(questionArticle).join("\n")}
        </section>
${adSlot(model)}
${pager(model)}
${callToAction(site)}
      </main>`;
  return document_({
    site,
    head: `${headTags(model, site)}\n  ${structuredData(model, site)}`,
    body,
    scripts: enhancement(),
    currentSlug: model.slug
  });
}

/**
 * The sheet is a shell. Its content cannot be generated, because the answers are in the reader's
 * browser and have never been anywhere else — which is the point. The script fills it from there.
 *
 * Without scripting the page states plainly that there is nothing to show and why, rather than
 * rendering an empty frame that looks broken.
 */
export function renderResultPage(slug, questions, site = SITE) {
  // A compact index so the script can name a chapter and a choice without loading the registry.
  const index = questions.map((question) => ({
    id: question.id,
    n: question.number,
    t: question.title,
    c: question.chapter,
    o: question.choices.map((choice) => ({ id: choice.id, l: choice.label }))
  }));
  const head = [
    `  <title>${escapeHtml(RESULT_COPY.title)} · ${escapeHtml(site.name)}</title>`,
    // The sheet is personal and has nothing to offer a search engine.
    '  <meta name="robots" content="noindex">'
  ].join("\n");
  const data = JSON.stringify({ slug, questions: index }).replace(/</g, "\\u003c");
  return document_({
    site,
    head,
    body: `  <main class="page result" data-result-slug="${escapeHtml(slug)}">
    <h1>${escapeHtml(RESULT_COPY.title)}</h1>
    <p class="lead">${escapeHtml(RESULT_COPY.lead)}</p>
    <div class="result-body" data-result-body>
      <h2>${escapeHtml(RESULT_COPY.emptyTitle)}</h2>
      <p>${escapeHtml(RESULT_COPY.emptyBody)}</p>
    </div>
    <p class="result-clear-note">${escapeHtml(RESULT_COPY.clearNote)}</p>
    <button class="result-clear" type="button" data-result-clear hidden>${escapeHtml(RESULT_COPY.clearAction)}</button>
${callToAction(site)}
  </main>
  <script type="application/json" data-question-index>${data}</script>`,
    scripts: enhancement(),
    currentSlug: slug
  });
}

export function renderIndex(model, site = SITE) {
  const cards = model.packs
    .map((pack) => `      <li class="card">
        <h2><a href="${escapeHtml(pack.path)}">${escapeHtml(pack.title)}</a></h2>
        <p>${escapeHtml(pack.description)}</p>
        <p class="card-meta">${pack.total}개의 질문 · ${pack.pages}${escapeHtml(SITE_COPY.partsUnit)}</p>
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
