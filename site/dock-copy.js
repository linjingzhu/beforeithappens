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
  /** What the press reports back: not "saved" as news, but how much is being held. */
  saved: (n) => `저장했어요 · 답 ${n}개`,
  /**
   * The case the button exists for. `createAnswerStore` swallows a storage failure and returns
   * `false`, which is right for a keystroke and wrong as the whole story: a private window, blocked
   * site data or a full quota means a reader can answer a hundred questions into a page that is
   * keeping none of them, and nothing else on the site would ever say so.
   */
  saveFailed: "저장할 수 없어요. 브라우저에서 이 사이트의 저장이 막혀 있는지 확인해 주세요.",
  /** On the button itself, because a control that claims to save should say what already saves. */
  saveAuto: "답은 고를 때마다 자동으로 저장돼요. 이 브라우저 안에만 남습니다."
});
