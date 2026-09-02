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
 * is safe anywhere, a message or a feed alike. `navigator.share` opens the phone's
 * own sheet, which already has the messengers in it; a desktop copies instead. With no script at
 * all the control is still an anchor to the same address, which is the invitation anyway.
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
  let url = "";

  const say = (text, error = false) => {
    if (!state) return;
    state.hidden = !text;
    state.textContent = text || "";
    state.classList.toggle("is-error", Boolean(error));
  };

  // The clipboard can be refused outright. The address is on the screen either way, so the honest
  // thing is to say so and select it rather than to report a success that did not happen.
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
    // Addresses, not scripts. A text message is a URL scheme away, and LINE publishes a share URL
    // that opens the app on a phone and the web on a desktop. The text is the same sentence the
    // device's sheet would have carried.
    const body = `${INVITE_COPY.shareText}\n${url}`;
    ways.get("sms")?.setAttribute("href", `sms:?&body=${encodeURIComponent(body)}`);
    ways.get("line")?.setAttribute("href", `https://line.me/R/share?text=${encodeURIComponent(body)}`);
    say("");
    panel.showModal();
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

  // KakaoTalk and Instagram publish nothing a page can open with a link in it without loading their
  // script, and this site loads no third-party script. On a phone the device's own sheet has both
  // apps in it, so the button opens that. On a desktop, where there is no sheet, the button does
  // the two things that are possible: it puts the link on the clipboard, then opens the app — the
  // KakaoTalk client through the scheme it registers on Windows and macOS, Instagram through its
  // web inbox, which is where a desktop sends a message — and says the link is ready to paste.
  //
  // Copy first, then open. The clipboard needs this document focused, and opening the app takes
  // the focus with it; the other order copies nothing and reports a success that did not happen.
  // If the app is not installed the scheme opens nothing, and the copied link and the sentence
  // saying so are still on the screen — the button is named for where the link is going.
  for (const id of ["kakao", "instagram"]) {
    ways.get(id)?.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: document.title, text: INVITE_COPY.shareText, url });
          panel.close();
        } catch {
          /* dismissed, or refused; the other ways are still on the screen */
        }
        return;
      }
      await copy(INVITE_COPY.pasteInto(INVITE_COPY[id]));
      openDesktop(id);
    });
  }
}

/**
 * How a desktop reaches each app. A scheme is opened in a hidden frame so an unhandled one leaves
 * the page where it is rather than navigating it to an error; a web address is opened in a new tab.
 */
const DESKTOP_APPS = Object.freeze({
  kakao: { scheme: "kakaotalk://" },
  instagram: { url: "https://www.instagram.com/direct/inbox/" }
});

function openDesktop(id) {
  const target = DESKTOP_APPS[id];
  if (!target) return;
  if (target.url) {
    window.open(target.url, "_blank", "noopener");
    return;
  }
  const frame = document.createElement("iframe");
  frame.hidden = true;
  frame.src = target.scheme;
  document.body.append(frame);
  setTimeout(() => frame.remove(), 2000);
}

// Bound on import: every page that carries the control also carries this module, and the function
// above already does nothing where the control or the panel is absent.
if (typeof document !== "undefined") bindInvite();
