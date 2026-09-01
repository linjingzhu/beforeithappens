import { answeredCount, createAnswerStore, withAnswer, withDiscussionFlag } from "./answers.js";
import { RESULT_COPY } from "./result-copy.js";
import { reflect } from "./reflect.js";

/**
 * The only script the site ships, and it is enhancement.
 *
 * Everything it does is optional: without it every question, choice and explanation is still on the
 * page and readable. What it adds is memory — and that memory lives in this browser and is sent
 * nowhere. There is no request in this file, deliberately. The site collects nothing until someone
 * opts into delivery, which is a later step that has to earn its own consent screen.
 *
 * It is kept small and DOM-shaped on purpose: the parts worth testing (the answer model, the
 * reflection) are pure modules with their own tests, and this is the thin layer that moves values
 * between them and the page.
 */
function slugFromPath(pathname = globalThis.location?.pathname || "") {
  const match = String(pathname).match(/^\/([^/]+)\//);
  return match ? match[1] : "";
}

function restoreQuestionPage(root, store) {
  const answers = store.read();
  for (const article of root.querySelectorAll("[data-question]")) {
    const id = article.getAttribute("data-question");
    const item = answers.items[id];
    if (!item) continue;
    const radio = article.querySelector(`input[type="radio"][value="${CSS.escape(item.choiceId)}"]`);
    if (radio) radio.checked = true;
    const flag = article.querySelector("[data-undiscussed]");
    if (flag) flag.checked = item.notDiscussed === true;
  }
}

function bindQuestionPage(root, store) {
  root.addEventListener("change", (event) => {
    const target = event.target;
    if (!target) return;
    const article = target.closest?.("[data-question]");
    if (!article) return;
    const id = article.getAttribute("data-question");

    if (target.type === "radio") {
      store.write(withAnswer(store.read(), id, target.value));
      return;
    }
    if (target.hasAttribute?.("data-undiscussed")) {
      // Marking a question undiscussed before answering it is meaningless; the model refuses it,
      // so reflect that refusal back rather than leaving a checkbox that silently did nothing.
      const next = withDiscussionFlag(store.read(), id, target.checked);
      const accepted = Boolean(next.items[id]) && next.items[id].notDiscussed === target.checked;
      if (!accepted) target.checked = false;
      else store.write(next);
    }
  });
}

function escapeText(value) {
  return String(value ?? "");
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = escapeText(text);
  return node;
}

/**
 * Builds the sheet with DOM nodes rather than markup strings, so a question title can never be
 * read as HTML on the one page that shows a person their own words back.
 */
function renderResult(body, model, copy = RESULT_COPY) {
  body.replaceChildren();
  if (model.empty) {
    body.append(element("h2", null, copy.emptyTitle), element("p", null, copy.emptyBody));
    return;
  }

  const summary = element("p", "result-count", `${copy.answeredLabel} ${model.answered} / ${model.total}`);
  body.append(summary);
  if (!model.complete) body.append(element("p", "result-note", copy.incompleteNote));

  if (model.notDiscussed.length) {
    const section = element("section", "result-undiscussed");
    section.append(
      element("h2", null, `${copy.notDiscussedLabel} ${model.notDiscussed.length}`),
      element("p", null, copy.notDiscussedLead)
    );
    const list = element("ul");
    for (const row of model.notDiscussed) {
      list.append(element("li", null, `${row.number}. ${row.title}`));
    }
    section.append(list);
    body.append(section);
  }

  for (const bucket of model.chapters) {
    const section = element("section", "result-chapter");
    section.append(element("h2", null, bucket.chapter));
    const list = element("ul");
    for (const row of bucket.answers) {
      const item = element("li");
      item.append(
        element("p", "result-q", `${row.number}. ${row.title}`),
        element("p", "result-a", row.choice)
      );
      list.append(item);
    }
    section.append(list);
    body.append(section);
  }
}

function startResultPage(root, store) {
  const holder = root.querySelector("[data-question-index]") || document.querySelector("[data-question-index]");
  const body = root.querySelector("[data-result-body]");
  if (!holder || !body) return;

  let index;
  try {
    index = JSON.parse(holder.textContent);
  } catch {
    return;
  }
  const model = reflect(index.questions, store.read());
  renderResult(body, model);

  const clear = root.querySelector("[data-result-clear]");
  if (clear) {
    clear.hidden = model.empty;
    clear.addEventListener("click", () => {
      store.clear();
      renderResult(body, reflect(index.questions, store.read()));
      clear.hidden = true;
    });
  }
}

/**
 * Pin the current Part's tab to the left edge of the strip.
 *
 * On a phone the strip is one scrolling row and ten tabs do not fit, so without this the tab that
 * says where you are can be off-screen. Left rather than centred because left is the one position
 * that is the same on every Part — the highlighted tab lands in the same place each time, which is
 * what stops the bar looking reshuffled on every page turn.
 *
 * `scrollLeft` rather than `scrollIntoView`: the latter can scroll the page as well as the strip,
 * and the page is exactly where the reader already is.
 *
 * Run twice, once now and once when the webfonts have loaded. The first pass uses fallback metrics
 * and every tab changes width when MaruBuri and Pretendard arrive, so a single early pass leaves the
 * tab a little further off with each Part — which is exactly the drift this is here to remove.
 */
function pinCurrentTab() {
  const strip = document.querySelector(".parts");
  const current = strip?.querySelector(".part-tab.is-current");
  if (!strip || !current) return;
  if (strip.scrollWidth <= strip.clientWidth) {
    strip.scrollLeft = 0;
    return;
  }
  // Measured against the strip itself rather than an offsetParent that may be an ancestor, and
  // past its own left padding, so the tab's edge lands on the strip's visible edge.
  const left = current.getBoundingClientRect().left - strip.getBoundingClientRect().left;
  const padding = parseFloat(getComputedStyle(strip).paddingLeft) || 0;
  strip.scrollLeft += left - padding;
}

/*
 * There was a `rememberPinned` / `restorePinned` pair here that scrolled a newly opened Part to
 * where the tab bar pins, so turning a Part while scrolled kept the bar in place. It is gone,
 * because it cannot coexist with the opening being visible on every Part: the name, the question
 * and the description sit *above* the bar, so scrolling far enough to pin the bar is exactly far
 * enough to push them off the top. Measured before removing it — after a tab click the description
 * sat at -81px, off screen.
 *
 * So a Part now opens where the browser puts it, at the top, with the whole opening, the tabs and
 * the first question all in view. Keeping both would mean moving the opening below the bar, which
 * is a layout decision rather than a scripting one.
 */

/** The bar under the tabs: answers recorded across the whole pack, as a width and an aria value. */
function showProgress(store) {
  const bar = document.querySelector("[data-progress-total]");
  const fill = bar?.querySelector("[data-progress-fill]");
  if (!bar || !fill) return;
  const total = Number(bar.getAttribute("data-progress-total")) || 0;
  if (!total) return;
  const answered = Math.min(answeredCount(store.read()), total);
  fill.style.width = `${(answered / total) * 100}%`;
  bar.setAttribute("aria-valuenow", String(answered));
}

function start() {
  pinCurrentTab();
  document.fonts?.ready?.then(pinCurrentTab).catch(() => {});

  const slug = slugFromPath();
  if (!slug) return;
  const store = createAnswerStore(slug);

  const result = document.querySelector("[data-result-slug]");
  if (result) {
    startResultPage(result, createAnswerStore(result.getAttribute("data-result-slug")));
    return;
  }

  const questions = document.querySelector(".questions");
  if (!questions) return;
  restoreQuestionPage(questions, store);
  bindQuestionPage(questions, store);
  showProgress(store);
  // Every recorded answer moves the bar, including one made on this page a moment ago.
  questions.addEventListener("change", () => showProgress(store));
}

if (typeof document !== "undefined") start();
