import { escapeHtml } from "../src/html.js";
import { publishedBySlug, SITE } from "./config.js";
import { absoluteUrl, descriptionLines, indexModel } from "./content.js";
import { footerLinks } from "./pages.js";
import { headTags, structuredData } from "./seo.js";
import { RESULT_COPY } from "./result.js";
// Debug only; goes with `SITE.debugFeedback` and `site/feedback.js`.
import { FEEDBACK_COPY } from "./feedback.js";

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
  next: "다음",
  previous: "이전",
  backToIndex: "질문집 목록",
  partsLabel: "파트",
  progressLabel: "답한 질문",
  /** Spelled out where there is room to spell it: the page's own heading. */
  partOrdinal: (n) => `Part ${n}`,
  partsUnit: "개 파트",
  packsLabel: "질문집",
  footerLabel: "사이트 안내",
  progress: (page, pages) => `${page} / ${pages}`,
  ctaTitle: "이 질문, 혼자 답하고 끝내지 마세요.",
  ctaBody: "상대에게 링크를 보내면 같은 질문에 답할 수 있어요. 두 사람 다 답한 질문만 나란히 열립니다.",
  ctaAction: "상대 초대하기",
  whyLabel: "왜 묻는 질문인가요",
  notDiscussed: "아직 상대와 이야기해 본 적 없어요",
  resultAction: "결과 보기",
  /* What a reader writes beside a question. Every line here is the pack's own wording. */
  depthLead: "이 선택은 내게",
  importancePlaceholder: "중요도를 선택해요",
  importanceOptions: Object.freeze([
    { value: "light", label: "가벼운 선호예요" },
    { value: "hope", label: "가능하면 지키고 싶어요" },
    { value: "need", label: "꼭 존중받아야 해요" }
  ]),
  reasonPlaceholder: "왜 이 답을 골랐나요? 내가 지키고 싶은 마음이나 경험을 적어보세요.",
  guessPlaceholder: "상대는 무엇을 고를까요? 그 이유까지 다정하게 추측해보세요.",
  noScriptNote: "브라우저 저장이 꺼져 있으면 답이 기억되지 않아요. 질문은 그대로 읽으실 수 있습니다."
});

/**
 * What a reader writes beside a question: how much the choice matters, why they chose it, and what
 * they think the other person will choose. It is one block of form controls rather than three,
 * because they are one thought, and nothing here is required — a reader who only picks an answer
 * sees three empty fields and loses nothing by leaving them empty.
 */
function depthBlock(question) {
  const options = SITE_COPY.importanceOptions
    .map((option) => `            <option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
    .join("\n");
  return `
        <div class="q-depth">
          <label class="q-depth-lead" for="importance-${escapeHtml(question.id)}">${escapeHtml(SITE_COPY.depthLead)}</label>
          <select id="importance-${escapeHtml(question.id)}" data-note="importance">
            <option value="">${escapeHtml(SITE_COPY.importancePlaceholder)}</option>
${options}
          </select>
          <textarea data-note="reason" rows="3" placeholder="${escapeHtml(SITE_COPY.reasonPlaceholder)}" aria-label="${escapeHtml(SITE_COPY.reasonPlaceholder)}"></textarea>
          <textarea data-note="guess" rows="3" placeholder="${escapeHtml(SITE_COPY.guessPlaceholder)}" aria-label="${escapeHtml(SITE_COPY.guessPlaceholder)}"></textarea>
        </div>`;
}

/**
 * The review block, and the only place on the site where a star means anything. It rates the
 * *question* — whether the scene is real and the four answers are distinct — never the reader and
 * never the couple. It exists while the pack is being read through and comes out with
 * `SITE.debugFeedback`; see `site/feedback.js`.
 */
function feedbackBlock(question) {
  const stars = [1, 2, 3, 4, 5]
    .map((value) => `            <label title="${value}"><input type="radio" name="rating-${escapeHtml(question.id)}" value="${value}" data-feedback-score><span aria-hidden="true">★</span></label>`)
    .join("\n");
  return `
        <aside class="q-feedback" data-feedback="${escapeHtml(question.id)}">
          <div class="q-feedback-head">
            <b>${escapeHtml(FEEDBACK_COPY.title)}</b>
            <span>${escapeHtml(FEEDBACK_COPY.badge)}</span>
          </div>
          <p>${escapeHtml(FEEDBACK_COPY.lead)}</p>
          <fieldset class="q-stars" aria-label="${escapeHtml(FEEDBACK_COPY.starsLabel)}">
${stars}
          </fieldset>
          <p class="q-feedback-state" data-feedback-state>${escapeHtml(FEEDBACK_COPY.unrated)}</p>
          <textarea data-feedback-comment rows="2" placeholder="${escapeHtml(FEEDBACK_COPY.commentPlaceholder)}" aria-label="${escapeHtml(FEEDBACK_COPY.title)}"></textarea>
        </aside>`;
}

/**
 * How the review gets off the reviewer's phone. The site makes no request, so the feedback leaves
 * as a file the reviewer saves and sends — which keeps that true while the pack is being reviewed.
 * Goes with the rest of the debug block.
 */
function feedbackExport() {
  return `        <p class="q-feedback-export">
          <button type="button" data-feedback-export>${escapeHtml(SITE_COPY.feedbackExport)}</button>
        </p>
`;
}

function questionArticle(question, site = SITE) {
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
  // The pack writes a mood for every question and the page does not print it. It is a note about
  // the arc — the tenth question of a Part is meant to land differently from the first — and beside
  // the question it read as a label telling the reader how to feel before they had answered.
  // Guidance copy is app-pack only (see `PACK_SURFACE` in `src/pack-schema.js`). A site pack has
  // none, and an empty <p> would render as a gap the reader cannot account for, so the elements are
  // omitted rather than emptied.
  // The situation the question is asked inside. It comes before the guidance copy because it is
  // what a reader has to be holding in mind before the question means anything.
  const scene = question.scene
    ? `\n        <p class="q-scene">${escapeHtml(question.scene)}</p>`
    : "";
  const intent = question.intent ? `\n        <p class="q-intent">${escapeHtml(question.intent)}</p>` : "";
  const example = question.example ? `\n        <p class="q-example">${escapeHtml(question.example)}</p>` : "";
  const why = question.whyItMatters
    ? `\n        <details class="q-why">
          <summary>${escapeHtml(SITE_COPY.whyLabel)}</summary>
          <p>${escapeHtml(question.whyItMatters)}</p>
        </details>`
    : "";
  return `      <article class="q" id="q-${escapeHtml(question.id)}" data-question="${escapeHtml(question.id)}">
        <h2><span class="q-number">${question.number}</span> ${escapeHtml(question.title)}</h2>${scene}${intent}${example}
        <ul class="q-choices">
${choices}
        </ul>
        <label class="q-undiscussed">
          <input type="checkbox" data-undiscussed="${escapeHtml(question.id)}">
          <span>${escapeHtml(SITE_COPY.notDiscussed)}</span>
        </label>${depthBlock(question)}${site?.debugFeedback ? feedbackBlock(question) : ""}${why}
      </article>`;
}

/**
 * The ad slot. Empty on purpose: ads are step 7, after there is enough content to pass review, and
 * a placeholder that already loads a network is how a site gets reviewed before it is ready. The
 * element exists so the position is fixed by the layout rather than chosen later under pressure —
 * after the questions, before the control that leaves the page.
 */
/**
 * Where an ad may go, and what goes there once the publisher ids are set.
 *
 * The box has always been on the page and empty; with `SITE.adsenseClient` and `SITE.adsenseSlot`
 * filled in it carries a real unit. Nothing is `aria-hidden` any more once it holds an ad — a
 * screen reader hiding an advertisement from its reader is not a courtesy, it is a surprise — but
 * an empty box stays hidden, because an empty box is nothing to announce.
 *
 * One unit per page, after the questions and before the control that leaves the page. That
 * position is the site's own rule, not the network's: an ad above the questions would sell the
 * reader's attention before the page has given them anything.
 */
function adSlot(model, site = SITE) {
  const name = escapeHtml(model.adSlot);
  if (!site?.adsenseClient || !site?.adsenseSlot) {
    return `      <div class="ad-slot" data-ad-slot="${name}" aria-hidden="true"></div>`;
  }
  return `      <div class="ad-slot" data-ad-slot="${name}">
        <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="${escapeHtml(site.adsenseClient)}"
          data-ad-slot="${escapeHtml(site.adsenseSlot)}"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
        <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
      </div>`;
}

/** The network's own script, once, in the head — and only when there is a publisher to name. */
function adsenseScript(site) {
  if (!site?.adsenseClient) return "";
  return `\n  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${escapeHtml(site.adsenseClient)}" crossorigin="anonymous"></script>`;
}

/**
 * The tab strip. One tab per Part, and the page is the Part — so a tab is a link to a real
 * document, not a control that hides and shows things. That is what lets a reader open Part 7 in a
 * new tab, land on it from a search result, or read the whole pack with scripting off.
 *
 * Every label here comes from the pack: `part.title` is the section's own title, carried through
 * `partsOf` in `site/content.js` untouched. Nothing about a Part is named in this file, so a pack
 * that renames a section renames its tab by being rebuilt.
 */
function partTabs(parts) {
  const tabs = parts
    .map((part) => `          <a class="part-tab${part.current ? " is-current" : ""}" href="${escapeHtml(part.path)}"${part.current ? ' aria-current="page"' : ""}>
            <span class="part-tab-n">${part.number}</span>
            <span class="part-tab-title">${escapeHtml(part.title)}</span>
          </a>`)
    .join("\n");
  return `        <nav class="parts" aria-label="${escapeHtml(SITE_COPY.partsLabel)}">
${tabs}
        </nav>`;
}

/**
 * How far through the pack's questions the reader has got, as a bar and nothing else.
 *
 * No text: a number beside it would be a second thing to read on a bar that is already the message,
 * and "12 / 100" so early reads as a rebuke. The value is still announced — `role="progressbar"`
 * with `aria-valuenow` says it to a screen reader without putting it on the screen.
 *
 * It starts empty and fills in as answers are recorded, which means it stays empty without
 * scripting. That is accurate rather than broken: answers live in `localStorage`, so with scripting
 * off nothing has been recorded and there is nothing to show.
 */
function progressBar(total) {
  const max = Number(total) || 0;
  if (!max) return "";
  return `        <div class="progress" role="progressbar" aria-label="${escapeHtml(SITE_COPY.progressLabel)}"
          aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="0" data-progress-total="${max}">
          <span class="progress-fill" data-progress-fill></span>
        </div>`;
}

/**
 * The chrome above the reading column: the pack's name, and its Parts.
 *
 * It lives in the shell rather than in the page renderer because it is the same on all ten Parts —
 * the only thing that changes between them is which tab is marked. Keeping it here means a page
 * renderer produces the pack's own content and nothing else, and that the day a second kind of
 * paginated content arrives it inherits the header instead of copying it.
 */
function stageHead(chrome) {
  if (!chrome) return "";
  // The strip is a sibling of the header, not a child of it. A sticky element can only stay while
  // its own parent is on screen, so nesting it in a header that scrolls away would take it along
  // after one screenful. Out here its parent is the whole stage, which is what "stays" means.
  const bar = chrome.parts?.length
    ? `\n      <div class="tabbar">
${partTabs(chrome.parts)}
${progressBar(chrome.total)}
      </div>`
    : "";
  // A page says its name, and under it what the page is for. The whole opening is the same on every
  // Part — it introduces the pack, not the Part — so it is shown on all of them rather than only on
  // the way in. Its lines are the author's: a description written as two sentences keeps the break
  // it was written with instead of letting the measure choose one.
  const tagline = chrome.tagline
    ? `\n        <p class="stage-tagline">${escapeHtml(chrome.tagline)}</p>`
    : "";
  const lines = descriptionLines(chrome.description);
  const blurb = lines.length
    ? `\n        <p class="stage-blurb">${lines.map(escapeHtml).join("<br>\n          ")}</p>`
    : "";
  return `      <header class="stage-head">
        <h1>${escapeHtml(chrome.title)}</h1>${tagline}${blurb}
      </header>${bar}
`;
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

/**
 * The invitation, and the only thing on the page that asks for anything.
 *
 * It used to be a link into the app. There is no app: this site is the product, and what a reader
 * hands the other person is a link to these same questions. So it is a button rather than an
 * anchor — `enhance.js` gives it the share sheet, and with no script it falls back to the pack's
 * own address, which is exactly what the invitation is anyway.
 */
function callToAction(model) {
  const href = model?.slug ? `/${escapeHtml(model.slug)}/` : "/";
  return `      <aside class="cta">
        <h2>${escapeHtml(SITE_COPY.ctaTitle)}</h2>
        <p>${escapeHtml(SITE_COPY.ctaBody)}</p>
        <a class="cta-action" href="${href}" data-invite>${escapeHtml(SITE_COPY.ctaAction)}</a>
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
      <span class="wordmark">
        <span class="wordmark-name">${escapeHtml(site.name)}</span>${site.nameSuffix ? `
        <span class="wordmark-sub">${escapeHtml(site.nameSuffix)}</span>` : ""}
      </span>
    </a>${nav}
    <p class="rail-foot">${escapeHtml(site.tagline)}</p>
  </aside>`;
}

/**
 * The footer's links, from the same list that decides which standing pages are built. A footer that
 * linked to a page the build does not emit is a 404 nobody notices until a reader finds it.
 */
function footerNav(site) {
  const links = footerLinks({ site });
  if (!links.length) return "";
  const items = links
    .map((link) => `<a href="${escapeHtml(link.path)}">${escapeHtml(link.title)}</a>`)
    .join("\n          ");
  return `        <nav class="foot-nav" aria-label="${escapeHtml(SITE_COPY.footerLabel)}">
          ${items}
        </nav>`;
}

/**
 * The shell every page is poured into: the rail, the header, the reading column, the footer.
 *
 * `chrome` is a model rather than markup — `{ title, parts }` — so what a page hands over is its
 * identity, not its layout. A page renderer below returns only its own content.
 */
function document_({ site, head, body, scripts = "", currentSlug = "", chrome = null }) {
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
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png">${adsenseScript(site)}
</head>
<body>
  <div class="shell">
${rail(site, currentSlug)}
    <div class="stage">
${stageHead(chrome)}${body}
      <footer class="foot">
        <p>${escapeHtml(site.name)} · ${escapeHtml(site.tagline)}</p>
${footerNav(site)}
      </footer>
    </div>
  </div>
${scripts}
</body>
</html>
`;
}

export function renderQuestionPage(model, site = SITE) {
  // Only the Part's own content. Its name and its siblings' tabs are the shell's, because they are
  // the same on every Part of the pack.
  const body = `      <main class="page">
        <h2 class="part-title"><span class="part-title-n">${escapeHtml(SITE_COPY.partOrdinal(model.part.number))}</span> ${escapeHtml(model.part.title)}</h2>
${model.part.blurb ? `        <p class="part-blurb">${escapeHtml(model.part.blurb)}</p>\n` : ""}${model.lead ? `        <p class="lead">${escapeHtml(model.lead)}</p>\n` : ""}        <section class="questions">
${model.questions.map((question) => questionArticle(question, site)).join("\n")}
        </section>
${site?.debugFeedback ? feedbackExport() : ""}${adSlot(model, site)}
${pager(model)}
${callToAction(model)}
      </main>`;
  return document_({
    site,
    head: `${headTags(model, site)}\n  ${structuredData(model, site)}`,
    body,
    scripts: enhancement(),
    currentSlug: model.slug,
    // The pack's title, and its Parts' own labels — both straight from the pack.
    chrome: {
      title: model.title,
      tagline: model.tagline,
      description: model.description,
      parts: model.parts,
      total: model.total
    }
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
  // The pack's own name travels with the index: the sheet's <title> is the sheet's, and a mail
  // about 결혼 100제 should say so rather than "내가 답한 것들".
  const packTitle = publishedBySlug(slug)?.title || site.name;
  const data = JSON.stringify({ slug, title: packTitle, questions: index }).replace(/</g, "\\u003c");
  return document_({
    site,
    head,
    chrome: { title: RESULT_COPY.title, description: RESULT_COPY.lead },
    body: `  <main class="page result" data-result-slug="${escapeHtml(slug)}">
    <div class="result-compare" data-compare hidden></div>
    <div class="result-body" data-result-body>
      <h2>${escapeHtml(RESULT_COPY.emptyTitle)}</h2>
      <p>${escapeHtml(RESULT_COPY.emptyBody)}</p>
    </div>
    <section class="result-share" data-share hidden>
      <h2>${escapeHtml(RESULT_COPY.ctaTitle)}</h2>
      <p>${escapeHtml(RESULT_COPY.shareNote)}</p>
      <button class="result-share-action" type="button" data-share-action>${escapeHtml(RESULT_COPY.shareAction)}</button>
      <p class="result-share-state" data-share-state hidden></p>
      <label class="result-share-link" data-share-link hidden>
        <span>${escapeHtml(RESULT_COPY.shareManual)}</span>
        <input type="text" readonly data-share-url>
      </label>
    </section>
    <section class="result-mail" data-mail hidden>
      <h2>${escapeHtml(RESULT_COPY.mailAction)}</h2>
      <p>${escapeHtml(RESULT_COPY.mailNote)}</p>
      <div class="result-mail-actions">
        <a class="result-mail-action" href="#" data-mail-open>${escapeHtml(RESULT_COPY.mailAction)}</a>
        <button class="result-mail-copy" type="button" data-mail-copy>${escapeHtml(RESULT_COPY.mailCopy)}</button>
      </div>
      <p class="result-mail-state" data-mail-state hidden></p>
    </section>
    <p class="result-clear-note">${escapeHtml(RESULT_COPY.clearNote)}</p>
    <button class="result-clear" type="button" data-result-clear hidden>${escapeHtml(RESULT_COPY.clearAction)}</button>
${callToAction({ slug })}
  </main>
  <script type="application/json" data-question-index>${data}</script>`,
    scripts: enhancement(),
    currentSlug: slug
  });
}

/**
 * A standing page: 소개, 문의. Prose, not questions, so it carries no answer machinery and no
 * enhancement script — there is nothing on it to remember.
 */
export function renderStandingPage(page, site = SITE) {
  const sections = page.sections
    .map((section) => `      <section class="prose">
        <h2>${escapeHtml(section.heading)}</h2>
${section.paragraphs.map((paragraph) => `        <p>${escapeHtml(paragraph)}</p>`).join("\n")}
      </section>`)
    .join("\n");
  const contact = page.email
    ? `      <p class="prose-contact"><a href="mailto:${escapeHtml(page.email)}">${escapeHtml(page.email)}</a></p>\n`
    : "";
  const head = [
    `  <title>${escapeHtml(page.title)} · ${escapeHtml(site.name)}</title>`,
    `  <meta name="description" content="${escapeHtml(page.description)}">`,
    site.origin ? `  <link rel="canonical" href="${escapeHtml(absoluteUrl(site.origin, page.path))}">` : ""
  ].filter(Boolean).join("\n");
  return document_({
    site,
    head,
    chrome: { title: page.title, description: page.description },
    body: `      <main class="page">
${sections}
${contact}${callToAction()}
      </main>`
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
    chrome: { title: site.name, tagline: site.tagline },
    body: `  <main class="page">
    <ul class="cards">
${cards}
    </ul>
${callToAction()}
  </main>`
  });
}
