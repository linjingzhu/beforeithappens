/**
 * The dock's words, in a module the browser can load on its own.
 *
 * Third of its kind, for the reason the other two exist: `SITE_COPY` lives in `site/render.js`,
 * which imports the pack registry — fine for a build, far too much for a page. `result-copy.js` and
 * `invite-copy.js` are the siblings. Everything the dock says at runtime is here, with no imports
 * behind it, and `render.js` reads the same constants so the markup and the script cannot drift.
 */
export const DOCK_COPY = Object.freeze({
  /** The widget names itself for a screen reader; on the screen it is a bar and two buttons. */
  label: "진행 상황",
  /** Spelled out at the owner's word. The bar used to carry no number at all. */
  countLabel: "답한 질문",
  together: "함께 풀기",
  save: "임시 저장",
  /** What the press reports back: not "saved" as news, but how much is now being held. */
  saved: (n) => `저장했어요 · 답 ${n}개`,
  /** Pressed again with nothing new to keep. Saying "저장했어요" again would be a lie about work. */
  alreadySaved: (n) => `이미 저장돼 있어요 · 답 ${n}개`,
  /**
   * Shown the moment there is something unsaved, rather than at the leave dialog. Being told at the
   * dialog is being told too late: by then the reader has already decided to go.
   */
  unsaved: "저장하지 않은 답이 있어요. 새로고침하면 사라집니다.",
  /**
   * The case the button exists for. `createAnswerStore` swallows a storage failure and returns
   * `false`, which is right for a keystroke and wrong as the whole story: a private window, blocked
   * site data or a full quota means a reader can answer a hundred questions into a page that is
   * keeping none of them, and nothing else on the site would ever say so.
   */
  saveFailed: "저장할 수 없어요. 브라우저에서 이 사이트의 저장이 막혀 있는지 확인해 주세요.",
  /**
   * On the button itself. It used to say the opposite — that answers save as they are made — which
   * was true of the old behaviour and is now exactly the thing that is not done.
   */
  saveAuto: "이 버튼을 누를 때만 저장돼요. 저장한 답은 이 브라우저 안에만 남습니다.",
  /**
   * The way to leave without a trace, on the page where the answers are made rather than only on
   * the sheet at the end. It asks once, in the browser's own dialog, because one press wipes a
   * hundred answers; then it clears the store, the page and the draft, so nothing is left to warn
   * about on the way out.
   */
  clear: "지우기",
  clearTitle: "이 브라우저에 저장된 답과 지금 화면의 답을 모두 지웁니다.",
  clearConfirm: "이 브라우저에 저장된 답을 모두 지울까요? 되돌릴 수 없어요.",
  cleared: "지웠어요 · 답 0개",
  clearFailed: "지울 수 없어요. 브라우저에서 이 사이트의 저장이 막혀 있는지 확인해 주세요."
});
