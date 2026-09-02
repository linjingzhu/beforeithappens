/**
 * The invitation's words, in a module the browser can load on its own.
 *
 * `SITE_COPY` lives in `site/render.js`, which imports the pack registry — fine for a build, far
 * too much for a page. `site/result-copy.js` and `site/dock-copy.js` exist for the same reason, and
 * this is their sibling: everything the invite panel says at runtime, with no imports behind it.
 */
export const INVITE_COPY = Object.freeze({
  /** The panel names itself with the control that opened it, so the two are obviously one thing. */
  title: "함께 풀기",
  lead: "초대 링크를 보내 주세요. 상대가 같은 질문에 답하면, 두 사람 다 답한 질문만 나란히 열립니다.",
  /**
   * What the reader is handing over, said where they are handing it over.
   *
   * There are three kinds of link on this site and only this one is empty — the answer link carries
   * a hundred choices and the comparison link carries two people's. Saying so here is what makes
   * the difference visible at the moment it matters.
   */
  note: "이 링크에는 답이 담기지 않아요. 질문집 주소일 뿐이에요.",

  /** The ways out. Each is a real address or a browser API — no third-party script is loaded. */
  device: "다른 앱으로",
  copy: "링크 복사",
  sms: "문자",
  mail: "메일",

  /** What the message says when a share sheet or a message app fills one in. */
  shareText: "같은 질문에 답해 볼래요? 두 사람 다 답한 질문만 서로에게 열려요.",
  mailSubject: "같은 질문에 답해 볼래요?",

  copied: "링크를 복사했어요. 상대에게 보내 주세요.",
  /** Clipboard access can be refused outright, and then the address itself is the fallback. */
  copyFailed: "복사가 안 됐어요. 아래 주소를 직접 보내 주세요.",
  urlLabel: "초대 링크",
  close: "닫기"
});
