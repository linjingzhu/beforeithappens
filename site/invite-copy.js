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

  /**
   * The apps, by name, at the owner's word. Each is one button with the app's mark on it.
   *
   * Every button copies the link and opens that app — the app, not the device's share sheet.
   * A text message is a `sms:` URL and LINE publishes a share address, so those two carry the
   * link in. KakaoTalk carries it in through its own picker once the owner has registered the
   * site with Kakao (`site/config.js`, `kakaoJsKey`); until then the app opens and the link is on
   * the clipboard. Instagram takes text on a phone and opens its new-message screen on a desktop.
   */
  kakao: "카카오톡",
  line: "라인",
  instagram: "인스타그램",
  sms: "문자",

  /** The copy control beside the address. An icon on the screen; this is its name. */
  copy: "링크 복사",
  urlLabel: "초대 링크",

  /** What the message says when a share sheet or a message app fills one in. */
  shareText: "같은 질문에 답해 볼래요? 두 사람 다 답한 질문만 서로에게 열려요.",

  copied: "링크를 복사했어요. 상대에게 보내 주세요.",
  /** Copied on the way to an app that takes the link itself; the reader chooses who gets it there. */
  opening: (app) => `링크를 복사했어요. ${app}에서 보낼 상대를 고르세요.`,
  /** Copied on the way to an app that cannot be handed a link directly; the app is opened next. */
  pasteInto: (app) => `링크를 복사했어요. ${app}이 열리면 붙여 넣어 보내 주세요.`,
  /** Clipboard access can be refused outright, and then the address itself is the fallback. */
  copyFailed: "복사가 안 됐어요. 위 주소를 직접 보내 주세요.",
  close: "닫기"
});
