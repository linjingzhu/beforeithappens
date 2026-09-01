import { INVITE_COPY } from "./auth.js";
import { inviteLinkBlock } from "./auth-ui.js";
import { GIFT_COPY, RECOMMEND_COPY, giftErrorCopy, giftStatusLabel, isGiftSendable, toNextReward } from "./growth.js";
import { escapeHtml } from "./html.js";

/**
 * The recommend and gift screens.
 *
 * They borrow the invite screen's share row rather than growing one of their own: the same three
 * buttons, the same copy-failure line, and the link shown as a selectable string. Someone who has
 * sent one of these links already knows how to send the other two.
 */
function shareRow(url, { copied = false, failed = false, action = "gift" } = {}) {
  if (!url) return "";
  return `
      <div class="invite-share">
        <div class="invite-share-actions" role="group" aria-label="${escapeHtml(INVITE_COPY.copyLink)}">
          <button class="secondary invite-share-button" type="button" data-action="copy-${action}-link">${escapeHtml(INVITE_COPY.copyLink)}</button>
          <button class="secondary invite-share-button" type="button" data-action="share-${action}-instagram">${escapeHtml(INVITE_COPY.instagram)}</button>
          <button class="secondary invite-share-button" type="button" data-action="share-${action}-kakao">${escapeHtml(INVITE_COPY.kakao)}</button>
        </div>
        ${failed ? `<p class="invite-copy-failed" role="alert">${escapeHtml(INVITE_COPY.copyFailed)}</p>` : ""}
        ${inviteLinkBlock(url)}
        ${copied ? `<p class="invite-copied" role="status">${escapeHtml(INVITE_COPY.copied)}</p>` : ""}
      </div>`;
}

export function renderRecommend({ code = "", url = "", joined = 0, credited = 0, rewardEvery = 3, copied = false, failed = false } = {}) {
  const remaining = toNextReward({ credited, rewardEvery });
  return `
    <section class="auth-card growth-card" data-screen="recommend">
      <span class="eyebrow">AB · RECOMMEND</span>
      <h1>${escapeHtml(RECOMMEND_COPY.title)}</h1>
      <p>${escapeHtml(RECOMMEND_COPY.body)}</p>
      ${code ? `<p class="growth-code"><small>${escapeHtml(RECOMMEND_COPY.codeLabel)}</small> <strong data-referral-code>${escapeHtml(code)}</strong></p>` : ""}
      ${shareRow(url, { copied, failed, action: "recommend" })}
      <p class="growth-counts"><small>${escapeHtml(RECOMMEND_COPY.countsLabel)}</small> <strong data-referral-joined>${joined}</strong></p>
      <p>${escapeHtml(RECOMMEND_COPY.rewardRule)}</p>
      <p class="growth-next" data-referral-next>${remaining}</p>
    </section>`;
}

export function renderGiftHome({ gifts = [], busy = false, error = "", copied = false, failed = false, activeUrl = "" } = {}) {
  const list = gifts.map((gift) => `
        <li class="growth-gift" data-gift-id="${escapeHtml(gift.id)}">
          <span class="growth-gift-status">${escapeHtml(giftStatusLabel(gift.status))}</span>
          ${isGiftSendable(gift) ? shareRow(gift.url, { copied: copied && activeUrl === gift.url, failed: failed && activeUrl === gift.url, action: "gift" }) : ""}
          ${gift.status !== "used" ? `<button class="secondary" type="button" data-action="revoke-gift" data-gift-id="${escapeHtml(gift.id)}">${escapeHtml(GIFT_COPY.revoke)}</button>` : ""}
        </li>`).join("");
  return `
    <section class="auth-card growth-card" data-screen="gift">
      <span class="eyebrow">AB · GIFT</span>
      <h1>${escapeHtml(GIFT_COPY.title)}</h1>
      <p>${escapeHtml(GIFT_COPY.body)}</p>
      ${error ? `<p class="auth-error" role="alert">${escapeHtml(error)}</p>` : ""}
      <button class="primary auth-submit" type="button" data-action="create-gift"${busy ? " disabled" : ""}>${escapeHtml(GIFT_COPY.cta)}</button>
      ${gifts.length ? `<h2>${escapeHtml(GIFT_COPY.sentTitle)}</h2><ul class="growth-gifts">${list}</ul>` : ""}
    </section>`;
}

/**
 * What the receiver sees. Every refusal names itself: a present that cannot be opened says why,
 * because "선물 받기" that silently does nothing is the worst version of this screen.
 */
export function renderGiftRedeem({ preview = null, error = "", signedIn = false, busy = false, accepted = false } = {}) {
  if (accepted) {
    return `
    <section class="auth-card growth-card" data-screen="gift-accepted">
      <span class="eyebrow">AB · GIFT</span>
      <h1>${escapeHtml(GIFT_COPY.arrivedTitle)}</h1>
      <p>${escapeHtml(INVITE_COPY.startPack)}</p>
      <button class="primary auth-submit" type="button" data-action="start-pack">${escapeHtml(INVITE_COPY.startPack)}</button>
    </section>`;
  }
  const failure = error || (preview && preview.ok === false ? giftErrorCopy(preview.error) : "");
  return `
    <section class="auth-card growth-card" data-screen="gift-redeem">
      <span class="eyebrow">AB · GIFT</span>
      <h1>${escapeHtml(GIFT_COPY.arrivedTitle)}</h1>
      <p>${escapeHtml(GIFT_COPY.arrivedBody)}</p>
      ${failure ? `<p class="auth-error" role="alert">${escapeHtml(failure)}</p>` : ""}
      ${failure ? "" : signedIn
        ? `<button class="primary auth-submit" type="button" data-action="redeem-gift"${busy ? " disabled" : ""}>${escapeHtml(GIFT_COPY.accept)}</button>`
        : `<p>${escapeHtml(GIFT_COPY.loginRequired)}</p><button class="primary auth-submit" type="button" data-action="gift-login">${escapeHtml(GIFT_COPY.loginRequired)}</button>`}
    </section>`;
}
