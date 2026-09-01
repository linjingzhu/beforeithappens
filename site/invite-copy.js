/**
 * The invitation's words, in a module the browser can load on its own.
 *
 * `SITE_COPY` lives in `site/render.js`, which imports the pack registry — fine for a build, far
 * too much for a page. `site/result-copy.js` exists for the same reason, and this is its sibling:
 * the two strings the invite control needs at runtime, with no imports behind them.
 */
export const INVITE_COPY = Object.freeze({
  /** What the message says when the share sheet fills one in. */
  shareText: "같은 질문에 답해 볼래요? 두 사람 다 답한 질문만 서로에게 열려요.",
  /** A desktop has no share sheet, so the link goes on the clipboard — and the page says so. */
  copied: "초대 링크를 복사했어요. 상대에게 보내 주세요."
});
