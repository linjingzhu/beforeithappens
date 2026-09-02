import { answeredCount, createAnswerStore, NOTE_FIELDS, serializeAnswers, withAnswer, withNote } from "./answers.js";
// Debug only, and self-contained so that removing the block is removing this line and its uses.
import { createFeedbackStore, FEEDBACK_COPY, feedbackCount, withFeedback } from "./feedback.js";
import { RESULT_COPY } from "./result-copy.js";
import { DOCK_COPY } from "./dock-copy.js";
// Imported for its own sake: it binds the invitation on load, on every page that has one.
import "./invite.js";
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

/**
 * The draft: the answers being made now, held in memory and written only when asked.
 *
 * Nothing on this page writes to storage on its own any more. Answering used to save as it
 * happened — every choice, every keystroke — which is the usual thing to build and was the wrong
 * thing here: it stored a person's answers about their marriage in their browser without ever being
 * told to. The owner's rule is that saving is something the reader does, and this is the shape that
 * makes it true rather than merely says it.
 *
 * So there are two states, not one. The draft is what is on the screen; the store is what the
 * reader chose to keep. `dirty()` is the difference between them, and it is what the leave warning
 * and the dock's line are both read from. Comparing the serialized forms rather than the objects
 * means a note typed and then deleted again correctly reads as no change at all.
 */
function createDraft(store) {
  let answers = store.read();
  let kept = serializeAnswers(answers);
  return {
    read: () => answers,
    set(next) {
      answers = next;
    },
    dirty: () => serializeAnswers(answers) !== kept,
    /** Returns false when the browser refuses to store — the one thing the button exists to say. */
    commit() {
      const written = store.write(answers);
      if (written) kept = serializeAnswers(answers);
      return written;
    }
  };
}

function restoreQuestionPage(root, draft) {
  const answers = draft.read();
  for (const article of root.querySelectorAll("[data-question]")) {
    const id = article.getAttribute("data-question");
    const item = answers.items[id];
    if (!item) continue;
    const radio = article.querySelector(`.q-choices input[value="${CSS.escape(item.choiceId)}"]`);
    if (radio) radio.checked = true;
  }
  // Notes are restored for every question, answered or not: someone may have written before
  // choosing. Only what was saved comes back — a note typed and never saved is gone, which is the
  // point of the rule rather than a gap in it.
  for (const article of root.querySelectorAll("[data-question]")) {
    const item = answers.items[article.getAttribute("data-question")];
    if (!item) continue;
    for (const field of NOTE_FIELDS) {
      const control = article.querySelector(`[data-note="${field}"]`);
      if (control && item[field]) control.value = item[field];
    }
  }
}

/**
 * Choices and notes go into the draft, and no further. `input` still fires on every keystroke so
 * that the draft is always what is on the screen — that is what makes the leave warning accurate —
 * but nothing here touches storage.
 */
function bindQuestionPage(root, draft) {
  root.addEventListener("input", (event) => {
    const target = event.target;
    if (isFeedbackControl(target)) return;
    const note = target?.getAttribute?.("data-note");
    const article = target?.closest?.("[data-question]");
    if (!note || !article) return;
    draft.set(withNote(draft.read(), article.getAttribute("data-question"), note, target.value));
  });

  root.addEventListener("change", (event) => {
    const target = event.target;
    if (!target || isFeedbackControl(target)) return;
    const article = target.closest?.("[data-question]");
    if (!article) return;
    const id = article.getAttribute("data-question");

    if (target.type === "radio") {
      draft.set(withAnswer(draft.read(), id, target.value));
      return;
    }
    const note = target.getAttribute?.("data-note");
    if (note) draft.set(withNote(draft.read(), id, note, target.value));
  });
}

/**
 * 이어서 — back to the last question that was answered.
 *
 * "Last" is the last one in reading order that carries a choice, not the most recently touched:
 * someone who answers 1 to 40, then goes back and changes 12, is still at 40. Answers are a map
 * with no order in them, so the order comes from the pack index the page embeds.
 *
 * It reads the draft rather than storage, so a question answered a moment ago and not yet saved is
 * where it takes you. The link is a real URL with an anchor — `scroll-padding-top` already keeps a
 * question from landing under the sticky strip — so it works as a page load, opens in a new tab,
 * and needs nothing clever. With nothing answered there is nowhere to carry on from, and the key
 * says so by going quiet rather than by disappearing and shortening the row.
 */
function bindResume(draft) {
  const key = document.querySelector("[data-resume]");
  const node = document.querySelector("[data-pack-index]");
  if (!key || !node) return;
  let index;
  try {
    index = JSON.parse(node.textContent);
  } catch {
    return;
  }

  const update = () => {
    const items = draft.read().items || {};
    let at = -1;
    for (let i = index.ids.length - 1; i >= 0; i -= 1) {
      if (items[index.ids[i]]?.choiceId) {
        at = i;
        break;
      }
    }
    if (at < 0) {
      key.removeAttribute("href");
      key.setAttribute("aria-disabled", "true");
      key.classList.add("is-off");
      return;
    }
    const part = index.parts[at];
    const page = part === 1 ? `/${index.slug}/` : `/${index.slug}/${part}/`;
    key.setAttribute("href", `${page}#q-${index.ids[at]}`);
    key.removeAttribute("aria-disabled");
    key.classList.remove("is-off");
  };

  update();
  document.querySelector(".questions")?.addEventListener("change", update);
}

/**
 * Saving on the way out of a page.
 *
 * Ten Parts are ten documents, so turning a Part is a real navigation and used to lose whatever had
 * not been saved. The owner's rule is that saving is an act the reader takes — and pressing 다음 is
 * an act the reader takes. So every control that leaves this page for another page of this site
 * writes the draft first, and the forward key says so on its face.
 *
 * This is not the automatic saving that was removed. That one wrote on every keystroke, unasked;
 * this one runs because a person pressed something, and the thing they pressed says what it does.
 *
 * Every in-site link, not just 다음: 이전 loses the same work, 결과 reads from storage and would
 * have shown an empty sheet, and the Part tabs at the top are navigations too. A rule that held for
 * one control and not its neighbours would be a worse trap than no rule.
 *
 * `localStorage` is synchronous, so the write completes before the browser leaves. A failed write
 * leaves the draft dirty, which is exactly right: `beforeunload` then asks, and the reader finds out
 * rather than losing the answers quietly.
 */
function bindSaveOnNavigation(draft) {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = event.target?.closest?.("a[href]");
    // The invitation is a share sheet rather than a navigation, and `bindInvite` owns it.
    if (!link || link.hasAttribute("data-invite") || link.target === "_blank") return;
    if (link.getAttribute("aria-disabled") === "true") return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    // A jump within this same document takes nothing with it.
    if (url.pathname === location.pathname && url.search === location.search) return;
    draft.commit();
  });
}

/**
 * The warning before answers are lost.
 *
 * With nothing saving on its own, a reload or a closed tab takes the unsaved answers with it — so
 * the reader is asked first. The words are the browser's own and cannot be set: every current
 * browser ignores a custom string here and shows its own "leave site?" dialog, which is why none is
 * written. Calling `preventDefault` is what asks for it; `returnValue` is the older spelling that
 * some browsers still require.
 *
 * It no longer fires on a page turn: `bindSaveOnNavigation` above saves before those, so by the
 * time the browser leaves there is nothing unsaved to warn about. What is left is what it was
 * always for — a reload, a closed tab, a link off the site.
 */
function bindLeaveWarning(draft) {
  addEventListener("beforeunload", (event) => {
    if (!draft.dirty()) return;
    event.preventDefault();
    event.returnValue = "";
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

/**
 * The question map: the line down the right edge, one mark per question.
 *
 * The markup spaces the marks evenly; this replaces that with where each question actually sits —
 * the centre of its card as a fraction of the section's height — and marks the question being
 * read. "Being read" is the last card whose top has passed a reading line a third of the way down
 * the viewport, which is where a heading sits once the reader has scrolled to it; before the first
 * card that is the first, and at the end of the page it is the last.
 *
 * A press is the anchor's own jump — nothing here scrolls the page, which is a rule of this file
 * (see the note on `restorePinned` below) — and the mark is moved at once rather than after the
 * scroll settles. `bindSaveOnNavigation` already ignores same-document links, and the sheet's
 * `scroll-behavior` decides whether the jump glides, honouring the reduced-motion setting there.
 */
function startQuestionMap(questions) {
  const map = document.querySelector("[data-qmap]");
  if (!map) return;
  const marks = [...map.querySelectorAll("[data-qmap-for]")];
  const cards = marks.map((mark) => document.getElementById(mark.getAttribute("data-qmap-for")));
  if (!marks.length || cards.some((card) => !card)) return;

  const top = (node) => node.getBoundingClientRect().top + scrollY;

  const place = () => {
    const start = top(questions);
    const height = questions.offsetHeight || 1;
    cards.forEach((card, i) => {
      const centre = top(card) + card.offsetHeight / 2 - start;
      // The list item is the placed element; the anchor inside it is only the target.
      marks[i].parentElement.style.top = `${Math.min(100, Math.max(0, (centre / height) * 100))}%`;
    });
  };

  let current = -1;
  const mark = (index) => {
    if (index === current) return;
    current = index;
    marks.forEach((node, i) => {
      node.classList.toggle("is-current", i === index);
      if (i === index) node.setAttribute("aria-current", "true");
      else node.removeAttribute("aria-current");
    });
  };

  const reading = () => {
    const line = scrollY + innerHeight / 3;
    const atEnd = Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1;
    if (atEnd) return cards.length - 1;
    let index = 0;
    cards.forEach((card, i) => {
      if (top(card) <= line) index = i;
    });
    return index;
  };

  let ticking = false;
  const follow = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      mark(reading());
    });
  };

  marks.forEach((node, i) => node.addEventListener("click", () => mark(i)));

  place();
  mark(reading());
  addEventListener("scroll", follow, { passive: true });
  addEventListener("resize", () => { place(); follow(); });
  // A card changes height when a note is opened or an answer's field appears; re-measure then.
  questions.addEventListener("toggle", place, true);
  document.fonts?.ready?.then(place).catch(() => {});
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

/**
 * The dock's progress: answers recorded across the whole pack, as a width, a number and an aria
 * value. The number is new — the bar used to carry none — and it is the same figure in all three
 * places, read from the one store.
 */
function showProgress(draft) {
  const bar = document.querySelector("[data-progress-total]");
  const fill = bar?.querySelector("[data-progress-fill]");
  if (!bar || !fill) return;
  const total = Number(bar.getAttribute("data-progress-total")) || 0;
  if (!total) return;
  // The draft, not the store: the bar is about how far through the questions the reader is, which
  // is true the moment they choose, not the moment they save.
  const answered = Math.min(answeredCount(draft.read()), total);
  fill.style.width = `${(answered / total) * 100}%`;
  bar.setAttribute("aria-valuenow", String(answered));
  const count = document.querySelector("[data-progress-count]");
  if (count) count.textContent = String(answered);
}

/**
 * The save button, and what it is honestly for.
 *
 * Every choice and every keystroke is already written as it happens, so this cannot be the thing
 * that saves — it would be a control that changes nothing. What it does is make the page say so,
 * and, in the one case that matters, say the opposite: `createAnswerStore` swallows a storage
 * failure and returns `false`, which is right for a keystroke and wrong as the whole story. A
 * private window, blocked site data or a full quota means a reader can answer a hundred questions
 * into a page keeping none of them, and until now nothing on the site would have told them.
 *
 * So the button writes what is held and reports the result: how many answers are stored, or that
 * they are not being stored at all.
 */
function bindSave(draft, root) {
  const button = document.querySelector("[data-save]");
  const state = document.querySelector("[data-save-state]");
  if (!button || !state) return;

  // The line says which of the two states the page is in, so that "saved" is something the reader
  // can see rather than assume. Unsaved is stated as soon as there is something unsaved, because
  // being told at the leave dialog is being told too late.
  const show = (text, error = false) => {
    state.hidden = !text;
    state.textContent = text || "";
    state.classList.toggle("is-error", Boolean(error));
  };
  const showPending = () => {
    if (draft.dirty()) show(DOCK_COPY.unsaved);
    else show("");
  };

  button.addEventListener("click", () => {
    const answers = draft.read();
    if (!draft.dirty()) {
      show(DOCK_COPY.alreadySaved(answeredCount(answers)));
      return;
    }
    const written = draft.commit();
    show(written ? DOCK_COPY.saved(answeredCount(answers)) : DOCK_COPY.saveFailed, !written);
  });

  for (const type of ["change", "input"]) {
    root.addEventListener(type, (event) => {
      if (isFeedbackControl(event.target)) return;
      showPending();
    });
  }
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
  const draft = createDraft(store);
  restoreQuestionPage(questions, draft);
  bindQuestionPage(questions, draft);
  showProgress(draft);
  bindSave(draft, questions);
  bindResume(draft);
  bindSaveOnNavigation(draft);
  bindLeaveWarning(draft);
  startQuestionMap(questions);
  // Every answer moves the bar, including one made on this page a moment ago and not yet saved.
  questions.addEventListener("change", () => showProgress(draft));
  startFeedback(slug);
}

if (typeof document !== "undefined") start();
