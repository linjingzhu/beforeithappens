import { answeredCount, createAnswerStore, NOTE_FIELDS, withAnswer, withDiscussionFlag, withNote } from "./answers.js";
// Debug only, and self-contained so that removing the block is removing this line and its uses.
import { createFeedbackStore, FEEDBACK_COPY, feedbackCount, withFeedback } from "./feedback.js";
import { RESULT_COPY } from "./result-copy.js";
import { reflect } from "./reflect.js";
import { compareAnswers, decodeShare, encodeShare } from "./share.js";
import { composeResultMail, mailtoHref } from "./mail.js";

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

/*
 * The review block sits *inside* the question's article, so its controls reach these handlers too.
 * Without this guard a star — a radio like any other — was recorded as the reader's answer: rating
 * a question four stars stored "4" as the chosen option and moved the progress bar. Caught in a
 * browser, not by a test, which is why the check lives here rather than in the store: the store
 * cannot tell one radio from another, and this is the layer that knows what the element is.
 */
function isFeedbackControl(target) {
  return Boolean(target?.closest?.("[data-feedback]"));
}

function restoreQuestionPage(root, store) {
  const answers = store.read();
  for (const article of root.querySelectorAll("[data-question]")) {
    const id = article.getAttribute("data-question");
    const item = answers.items[id];
    if (!item) continue;
    const radio = article.querySelector(`.q-choices input[value="${CSS.escape(item.choiceId)}"]`);
    if (radio) radio.checked = true;
    const flag = article.querySelector("[data-undiscussed]");
    if (flag) flag.checked = item.notDiscussed === true;
  }
  // Notes are restored for every question, answered or not: someone may have written before
  // choosing, and losing that on a page reload is losing the part that took thought.
  for (const article of root.querySelectorAll("[data-question]")) {
    const item = answers.items[article.getAttribute("data-question")];
    if (!item) continue;
    for (const field of NOTE_FIELDS) {
      const control = article.querySelector(`[data-note="${field}"]`);
      if (control && item[field]) control.value = item[field];
    }
  }
}

function bindQuestionPage(root, store) {
  // Typing is saved as it happens rather than on blur: a reader who closes the tab mid-sentence
  // should still find the sentence. `change` alone would drop it.
  root.addEventListener("input", (event) => {
    const target = event.target;
    if (isFeedbackControl(target)) return;
    const note = target?.getAttribute?.("data-note");
    const article = target?.closest?.("[data-question]");
    if (!note || !article) return;
    store.write(withNote(store.read(), article.getAttribute("data-question"), note, target.value));
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (!target || isFeedbackControl(target)) return;
    const article = target.closest?.("[data-question]");
    if (!article) return;
    const id = article.getAttribute("data-question");

    if (target.type === "radio") {
      store.write(withAnswer(store.read(), id, target.value));
      return;
    }
    const note = target.getAttribute?.("data-note");
    if (note) {
      store.write(withNote(store.read(), id, note, target.value));
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
      showShare(root, index, store);
    });
  }

  showShare(root, index, store);
  showComparison(root, index, store);
  showMail(root, index, store);
}

/**
 * The other person's link as it stands right now: absent, unreadable, or a comparison.
 *
 * One reader for both the panel and the letter. They used to compute it separately, and the letter
 * computed it once — so a link pasted into an open page updated the panel and left the mail saying
 * what the page had said a moment ago.
 */
function readComparison(index, store) {
  const match = /(?:^|[#&])c=([^&]+)/.exec(location.hash || "");
  if (!match) return { kind: "none" };
  const theirs = decodeShare(decodeURIComponent(match[1]), index.slug, index.questions);
  if (!theirs) return { kind: "unreadable" };
  return { kind: "ok", model: compareAnswers(index.questions, store.read(), theirs) };
}

/**
 * The letter, written from whatever the sheet is showing: the two people's differing answers when
 * a comparison is open, the reader's own answers when it is not.
 *
 * The link goes in only when there is more than the mail can hold or a second person is in it —
 * see `site/mail.js`. Rebuilt on every open, so it says what the page says.
 */
function showMail(root, index, store) {
  const panel = root.querySelector("[data-mail]");
  const open = root.querySelector("[data-mail-open]");
  const copy = root.querySelector("[data-mail-copy]");
  if (!panel || !open) return;

  const compose = () => {
    const answers = store.read();
    const read = readComparison(index, store);
    const comparison = read.kind === "ok" ? read.model : null;
    const compared = Boolean(comparison && !comparison.empty);
    const rows = compared
      ? comparison.differing.concat(comparison.shared)
      : index.questions
          .map((question) => {
            const choiceId = answers.items[question.id]?.choiceId;
            const choice = (question.o || []).find((option) => option.id === choiceId);
            return choice ? { number: question.n, title: question.t, choice: choice.l } : null;
          })
          .filter(Boolean);
    return {
      compared,
      rows,
      letter: composeResultMail({
        title: index.title || "",
        rows,
        link: location.href,
        compared
      })
    };
  };

  const state = root.querySelector("[data-mail-state]");
  const refresh = () => {
    const { rows, letter } = compose();
    panel.hidden = false;
    open.setAttribute("href", rows.length ? mailtoHref(letter) : "#");
    open.setAttribute("aria-disabled", rows.length ? "false" : "true");
    return { rows, letter };
  };
  refresh();
  // A link pasted into an open page changes the hash without reloading, and the letter has to
  // follow: otherwise the button still holds the mail the page had written a moment ago.
  addEventListener("hashchange", refresh);

  open.addEventListener("click", (event) => {
    const { rows } = refresh();
    if (rows.length) return;
    // Nothing to send is not a mail app's problem to explain.
    event.preventDefault();
    say(state, RESULT_COPY.mailEmpty);
  });

  copy?.addEventListener("click", async () => {
    const { rows, letter } = refresh();
    if (!rows.length) {
      say(state, RESULT_COPY.mailEmpty);
      return;
    }
    const text = `${letter.subject}\n\n${letter.body}`;
    try {
      await navigator.clipboard?.writeText(text);
      say(state, RESULT_COPY.mailCopied);
    } catch {
      say(state, RESULT_COPY.shareManual);
    }
  });
}

/** The link that carries this reader's choices to the other person, and nothing else. */
function showShare(root, index, store) {
  const panel = root.querySelector("[data-share]");
  const action = root.querySelector("[data-share-action]");
  if (!panel || !action) return;
  panel.hidden = false;

  const state = root.querySelector("[data-share-state]");
  const holder = root.querySelector("[data-share-link]");
  const field = root.querySelector("[data-share-url]");

  action.addEventListener("click", async () => {
    const payload = encodeShare(index.slug, index.questions, store.read());
    if (!payload) {
      say(state, RESULT_COPY.shareEmpty);
      if (holder) holder.hidden = true;
      return;
    }
    // Built from the page's own address, so a preview build shares a preview link. The payload
    // goes in the fragment: everything after `#` stays in the browser and reaches no server.
    const url = `${location.origin}${location.pathname}#c=${payload}`;
    if (field) field.value = url;
    if (holder) holder.hidden = false;

    // The clipboard needs permission and a secure context, and a reader who is denied either still
    // has the address in front of them.
    try {
      await navigator.clipboard?.writeText(url);
      say(state, RESULT_COPY.shareCopied);
    } catch {
      say(state, RESULT_COPY.shareManual);
    }
    field?.select?.();
  });
}

function say(node, text) {
  if (!node) return;
  node.textContent = text;
  node.hidden = false;
}

/**
 * The other person's link, read out of the fragment.
 *
 * Their answers are never written to storage. They belong to the person who sent them, they are in
 * this page for as long as the link is in the address bar, and closing the tab is the end of it.
 */
function showComparison(root, index, store) {
  const panel = root.querySelector("[data-compare]");
  if (!panel) return;
  // A second link pasted into the address bar of an open page is a same-document navigation: the
  // script does not run again, and without this the reader would be looking at the first link's
  // comparison under the second link's address.
  if (!showComparison.listening) {
    showComparison.listening = true;
    addEventListener("hashchange", () => showComparison(root, index, store));
  }

  const read = readComparison(index, store);
  if (read.kind === "none") {
    panel.hidden = true;
    panel.replaceChildren();
    return;
  }

  panel.hidden = false;
  if (read.kind === "unreadable") {
    panel.replaceChildren(element("p", "compare-note", RESULT_COPY.compareUnreadable));
    return;
  }
  renderComparison(panel, read.model);
}

function comparisonRows(rows, withAnswers) {
  const list = element("ul", "compare-list");
  for (const row of rows) {
    const item = element("li");
    item.append(element("p", "compare-q", `${row.number}. ${row.title}`));
    if (withAnswers) {
      item.append(
        element("p", "compare-a", `${RESULT_COPY.compareMine} · ${row.mine}`),
        element("p", "compare-a compare-theirs", `${RESULT_COPY.compareTheirs} · ${row.theirs}`)
      );
    }
    list.append(item);
  }
  return list;
}

function renderComparison(panel, model) {
  panel.replaceChildren();
  panel.append(
    element("h2", null, RESULT_COPY.compareTitle),
    element("p", "compare-note", RESULT_COPY.compareLead)
  );

  // Nothing of theirs is on the page until the reader has answered something of their own.
  if (model.empty) {
    panel.append(
      element("h3", null, RESULT_COPY.compareGateTitle),
      element("p", "compare-note", RESULT_COPY.compareGateBody)
    );
    return;
  }

  panel.append(element("p", "compare-count", RESULT_COPY.compareCount(model.compared, model.total)));

  if (model.differing.length) {
    const section = element("section", "compare-section");
    section.append(
      element("h3", null, `${RESULT_COPY.compareDifferentLabel} ${model.differing.length}`),
      element("p", "compare-note", RESULT_COPY.compareDifferentLead),
      comparisonRows(model.differing, true)
    );
    panel.append(section);
  }
  if (model.shared.length) {
    const section = element("section", "compare-section");
    section.append(
      element("h3", null, `${RESULT_COPY.compareSameLabel} ${model.shared.length}`),
      comparisonRows(model.shared, true)
    );
    panel.append(section);
  }
  if (model.waiting.length) {
    const section = element("section", "compare-section");
    section.append(
      element("h3", null, `${RESULT_COPY.compareWaitingLabel} ${model.waiting.length}`),
      element("p", "compare-note", RESULT_COPY.compareWaitingLead),
      comparisonRows(model.waiting, false)
    );
    panel.append(section);
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
  //
  // The last Parts ask for more scroll than there is and the browser clamps them, which is the
  // intent: the row ends with Part 10 against the right edge rather than running on into blank
  // space. So this pins left where it can and stops at the end of the row where it cannot.
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

/**
 * The invitation: the pack's own address, handed to the other person.
 *
 * It carries no answers — that is the whole difference between this and the link the result sheet
 * makes — so it is safe anywhere, a message or a feed alike. `navigator.share` opens the phone's
 * own sheet, which already has the messengers in it; a desktop copies instead. With no script at
 * all the control is still an anchor to the same address, which is the invitation anyway.
 */
function bindInvite() {
  for (const link of document.querySelectorAll("[data-invite]")) {
    link.addEventListener("click", async (event) => {
      const url = new URL(link.getAttribute("href"), location.origin).href;
      if (navigator.share) {
        event.preventDefault();
        try {
          await navigator.share({ title: document.title, url });
        } catch {
          /* dismissed; the anchor still works if they meant to open it */
        }
        return;
      }
      if (!navigator.clipboard) return;
      event.preventDefault();
      try {
        await navigator.clipboard.writeText(url);
        link.dataset.copied = "true";
        setTimeout(() => delete link.dataset.copied, 2000);
      } catch {
        location.href = url;
      }
    });
  }
}

/*
 * ---- the review block, debug only ------------------------------------------------------------
 * Everything from here to the end of this section goes when `SITE.debugFeedback` does. It is kept
 * in one place, reading and writing one store of its own, so that removing it cannot take a
 * reader's answers with it.
 */

/** Reads a saved rating and comment back onto the page, and records what the reviewer changes. */
function startFeedback(slug) {
  const blocks = [...document.querySelectorAll("[data-feedback]")];
  const exportButton = document.querySelector("[data-feedback-export]");
  if (!blocks.length && !exportButton) return;
  const store = createFeedbackStore(`${slug}`);

  const saved = store.read();
  for (const block of blocks) {
    const entry = saved.items[block.getAttribute("data-feedback")];
    if (!entry) continue;
    if (entry.rating) {
      const star = block.querySelector(`input[value="${entry.rating}"]`);
      if (star) star.checked = true;
    }
    const comment = block.querySelector("[data-feedback-comment]");
    if (comment && entry.comment) comment.value = entry.comment;
    showRating(block, entry.rating);
  }

  const record = (event, patch) => {
    const block = event.target?.closest?.("[data-feedback]");
    if (!block) return;
    const id = block.getAttribute("data-feedback");
    store.write(withFeedback(store.read(), id, patch(event.target)));
    const rated = block.querySelector("input:checked");
    showRating(block, rated ? Number(rated.value) : 0);
  };
  document.addEventListener("change", (event) => {
    if (event.target?.hasAttribute?.("data-feedback-score")) {
      record(event, (target) => ({ rating: Number(target.value) }));
    }
  });
  document.addEventListener("input", (event) => {
    if (event.target?.hasAttribute?.("data-feedback-comment")) {
      record(event, (target) => ({ comment: target.value }));
    }
  });

  if (exportButton) exportButton.addEventListener("click", () => exportFeedback(store, slug));
}

function showRating(block, rating) {
  const state = block.querySelector("[data-feedback-state]");
  if (state) {
    state.textContent = rating ? FEEDBACK_COPY.rated(rating) : FEEDBACK_COPY.unrated;
  }
  block.classList.toggle("is-rated", Boolean(rating));
}

/** Saves the whole pack's feedback as a file, since the site sends nothing anywhere. */
function exportFeedback(store, slug) {
  const feedback = store.read();
  if (!feedbackCount(feedback)) {
    globalThis.alert?.(FEEDBACK_COPY.exportEmpty);
    return;
  }
  const blob = new Blob([JSON.stringify(feedback, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slug}-feedback.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

/* ---- end of the review block ----------------------------------------------------------------- */

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
  bindInvite();
  // Every recorded answer moves the bar, including one made on this page a moment ago.
  questions.addEventListener("change", () => showProgress(store));
  startFeedback(slug);
}

if (typeof document !== "undefined") start();
