import { INVITE_COPY } from "./invite-copy.js";

/**
 * The invitation panel, on its own so that a page which needs nothing else does not load
 * everything else.
 *
 * It used to live in `enhance.js`, and the home page and the prose pages therefore had the button
 * without the panel: `둘이 함께 해보기` was an anchor to the pack, so pressing it on the home page
 * reloaded the home page. Giving those pages `enhance.js` would have fixed it and cost them the
 * answer store, the reflection, the share codec, the mail composer and the review block — about
 * 63KB of module graph to bind one button, on the page most likely to be a first visit.
 *
 * So this is the whole invitation and nothing else, and `enhance.js` imports it. A module runs once
 * however many times it is imported, so the pages that load both bind exactly once.
 *
 * What the invitation is: the pack's own address, handed to the other person. It carries no
 * answers — that is the whole difference between this and the link the result sheet makes — so it
 * is safe anywhere, a message or a feed alike.
 *
 * Every app button does the same two things, at the owner's word: it puts the link on the
 * clipboard, then opens that app — the app itself, never the operating system's share sheet, which
 * on a desktop is a list of Microsoft services and on a phone is one more screen before the app.
 * Where the app can be handed the link it is handed the link, and the reader picks who gets it
 * there; where it cannot, the app opens and the sentence on the panel says the link is ready to
 * paste. With no script at all the control is still an anchor to the same address, which is the
 * invitation anyway.
 */
export function bindInvite() {
  const panel = document.querySelector("[data-invite-panel]");
  const controls = [...document.querySelectorAll("[data-invite]")];
  if (!controls.length) return;

  // No panel on this page — the control is still a link to the questions, which is the invitation.
  if (!panel || typeof panel.showModal !== "function") return;

  const field = panel.querySelector("[data-invite-url]");
  const state = panel.querySelector("[data-invite-state]");
  const ways = new Map([...panel.querySelectorAll("[data-invite-way]")].map((el) => [el.getAttribute("data-invite-way"), el]));
  const kakaoKey = panel.getAttribute("data-kakao-key") || "";
  let url = "";
  let body = "";

  const say = (text, error = false) => {
    if (!state) return;
    state.hidden = !text;
    state.textContent = text || "";
    state.classList.toggle("is-error", Boolean(error));
  };

  // The clipboard can be refused outright. The address is on the screen either way, so the honest
  // thing is to say so and select it rather than to report a success that did not happen.
  //
  // Not awaited before the app is opened: the write starts inside the click, which is what the
  // clipboard needs, and opening the app takes the focus with it. Awaiting first would open the
  // app outside the click, and a desktop browser blocks a window opened that way.
  const copy = async (done = INVITE_COPY.copied) => {
    try {
      await navigator.clipboard.writeText(url);
      say(done);
      return true;
    } catch {
      say(INVITE_COPY.copyFailed, true);
      field?.select();
      return false;
    }
  };

  const open = (href) => {
    url = new URL(href, location.href).href;
    if (field) field.value = url;
    // The message the apps that take one are handed: the same sentence, then the address.
    body = `${INVITE_COPY.shareText}\n${url}`;
    ways.get("sms")?.setAttribute("href", `sms:?&body=${encodeURIComponent(body)}`);
    ways.get("line")?.setAttribute("href", `https://line.me/R/share?text=${encodeURIComponent(body)}`);
    say("");
    panel.showModal();
    // KakaoTalk's own picker needs its script, and the script needs to be here before the button
    // is pressed — a window opened after a download is opened outside the click and blocked. So
    // it is fetched when the panel opens, and only when the owner has named a key.
    if (kakaoKey) loadKakao(kakaoKey).catch(() => {});
  };

  for (const control of controls) {
    control.addEventListener("click", (event) => {
      event.preventDefault();
      open(control.getAttribute("href"));
    });
  }

  panel.querySelector("[data-invite-close]")?.addEventListener("click", () => panel.close());

  // A click on the backdrop lands on the dialog itself, since the backdrop is not an element of its
  // own. Anything inside the panel hits a child, so this closes only when the panel is what was hit.
  panel.addEventListener("click", (event) => {
    if (event.target === panel) panel.close();
  });

  panel.querySelector("[data-invite-copy]")?.addEventListener("click", () => copy());

  // The two that are addresses: a text message is a URL scheme, and LINE publishes a share address
  // that opens the app on a phone and, on a desktop, LINE's own page with the reader's friends on
  // it. The anchor does the opening; this only puts the link on the clipboard on the way.
  for (const id of ["sms", "line"]) {
    ways.get(id)?.addEventListener("click", () => {
      copy(INVITE_COPY.opening(INVITE_COPY[id]));
    });
  }

  // KakaoTalk. With the owner's key its own picker opens — the app on a phone, Kakao's page on a
  // desktop — with the link already in the message, and the reader chooses who gets it. Without
  // a key there is nothing a page can hand the app but the clipboard, so the app is opened and
  // the sentence says the link is ready to paste.
  ways.get("kakao")?.addEventListener("click", () => {
    if (kakaoKey && window.Kakao?.Share) {
      copy(INVITE_COPY.opening(INVITE_COPY.kakao));
      try {
        sendKakao(kakaoKey, body, url);
        return;
      } catch {
        /* the picker refused; the app itself is still there */
      }
    }
    copy(INVITE_COPY.pasteInto(INVITE_COPY.kakao));
    openApp({ scheme: "kakaotalk://" });
  });

  // Instagram publishes no address that carries a link. On a phone its app takes text through a
  // share sheet of its own — the reader picks who gets it there; on a desktop the web inbox's new
  // message screen is where a message starts, and the link is on the clipboard for it.
  ways.get("instagram")?.addEventListener("click", () => {
    if (isPhone()) {
      copy(INVITE_COPY.opening(INVITE_COPY.instagram));
      openApp({ scheme: `instagram://sharesheet?text=${encodeURIComponent(body)}` });
      return;
    }
    copy(INVITE_COPY.pasteInto(INVITE_COPY.instagram));
    openApp({ url: "https://www.instagram.com/direct/new/" });
  });
}

/** A phone is where the app schemes land in an app; anywhere else, the web address is the way. */
function isPhone() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/**
 * How an app is reached. A web address opens in a new tab. A scheme is navigated to on a phone,
 * where that is what opens the app (a hidden frame is ignored there); on a desktop it is opened in
 * a hidden frame instead, so an unhandled one leaves the page where it is rather than navigating
 * it to an error.
 */
function openApp(target) {
  if (target.url) {
    window.open(target.url, "_blank", "noopener");
    return;
  }
  if (isPhone()) {
    location.href = target.scheme;
    return;
  }
  const frame = document.createElement("iframe");
  frame.hidden = true;
  frame.src = target.scheme;
  document.body.append(frame);
  setTimeout(() => frame.remove(), 2000);
}

/**
 * Kakao's script, fetched once and only when the owner has registered the site with Kakao and put
 * the JavaScript key in `site/config.js` — it is the one way KakaoTalk can be handed a link, and
 * it is the one third-party script this site will load on a press rather than on a page.
 */
const KAKAO_SDK = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js";
let kakaoLoading = null;

function loadKakao(key) {
  if (window.Kakao?.Share) return Promise.resolve();
  if (!kakaoLoading) {
    kakaoLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = KAKAO_SDK;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => {
        try {
          if (!window.Kakao.isInitialized()) window.Kakao.init(key);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = () => reject(new Error("kakao sdk"));
      document.head.append(script);
    });
  }
  return kakaoLoading;
}

function sendKakao(key, text, url) {
  if (!window.Kakao.isInitialized()) window.Kakao.init(key);
  window.Kakao.Share.sendDefault({
    objectType: "text",
    text,
    link: { mobileWebUrl: url, webUrl: url }
  });
}

// Bound on import: every page that carries the control also carries this module, and the function
// above already does nothing where the control or the panel is absent.
if (typeof document !== "undefined") bindInvite();
