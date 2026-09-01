import test from "node:test";
import assert from "node:assert/strict";
import { INVITE_COPY } from "../src/auth.js";
import { GIFT_COPY, RECOMMEND_COPY, giftErrorCopy } from "../src/growth.js";
import { renderGiftHome, renderGiftRedeem, renderRecommend } from "../src/growth-ui.js";

const has = (html, text) => html.includes(text);

test("the recommend screen shows the code, the link as text, and the share row", () => {
  const html = renderRecommend({
    code: "ABCD1234",
    url: "https://ab.example/r/ABCD1234",
    joined: 2,
    credited: 1,
    rewardEvery: 3
  });
  assert.ok(has(html, RECOMMEND_COPY.title));
  assert.ok(has(html, "ABCD1234"));
  assert.ok(has(html, "https://ab.example/r/ABCD1234"), "the link is readable, not buttons alone");
  assert.ok(has(html, "user-select:all"), "one long-press selects the whole link");
  for (const label of [INVITE_COPY.copyLink, INVITE_COPY.instagram, INVITE_COPY.kakao]) {
    assert.ok(has(html, label), `the invite share row is reused: ${label}`);
  }
  assert.ok(has(html, RECOMMEND_COPY.rewardRule));
  assert.ok(has(html, ">2<"), "the count of friends who started is shown");
});

test("a recommend link that failed to copy says so, and does not lose the link", () => {
  const url = "https://ab.example/r/ABCD1234";
  const failed = renderRecommend({ code: "ABCD1234", url, failed: true });
  assert.ok(has(failed, INVITE_COPY.copyFailed));
  assert.ok(has(failed, url), "the fallback the failure line points at is still on screen");

  const copied = renderRecommend({ code: "ABCD1234", url, copied: true });
  assert.ok(has(copied, INVITE_COPY.copied));
  assert.equal(has(copied, INVITE_COPY.copyFailed), false);
});

test("with no code yet, the recommend screen renders without an empty share row", () => {
  const html = renderRecommend({});
  assert.ok(has(html, RECOMMEND_COPY.title));
  assert.equal(has(html, INVITE_COPY.copyLink), false, "no link means no buttons that would do nothing");
});

test("the gift screen offers to make one, and lists what was sent", () => {
  const html = renderGiftHome({
    gifts: [
      { id: "gft_1", status: "ok", url: "https://ab.example/gift/redeem?token=t1" },
      { id: "gft_2", status: "used", url: "" }
    ]
  });
  assert.ok(has(html, GIFT_COPY.title));
  assert.ok(has(html, GIFT_COPY.body));
  assert.ok(has(html, GIFT_COPY.cta));
  assert.ok(has(html, GIFT_COPY.sentTitle));
  assert.ok(has(html, GIFT_COPY.statusWaiting));
  assert.ok(has(html, GIFT_COPY.statusUsed));
  assert.ok(has(html, "https://ab.example/gift/redeem?token=t1"));
});

test("a redeemed gift offers no link and cannot be withdrawn", () => {
  const html = renderGiftHome({ gifts: [{ id: "gft_2", status: "used", url: "" }] });
  assert.equal(has(html, INVITE_COPY.copyLink), false, "there is nothing left to send");
  assert.equal(has(html, GIFT_COPY.revoke), false, "you cannot take back what was opened");

  const live = renderGiftHome({ gifts: [{ id: "gft_1", status: "ok", url: "https://ab.example/gift/redeem?token=t1" }] });
  assert.ok(has(live, GIFT_COPY.revoke));
  assert.ok(has(live, 'data-action="revoke-gift"'));
});

test("the receiver is asked to sign in before being offered the present", () => {
  const out = renderGiftRedeem({ preview: { ok: true }, signedIn: false });
  assert.ok(has(out, GIFT_COPY.arrivedTitle));
  assert.ok(has(out, GIFT_COPY.loginRequired));
  assert.equal(has(out, 'data-action="redeem-gift"'), false, "no accept button before there is an account to accept into");

  const inSession = renderGiftRedeem({ preview: { ok: true }, signedIn: true });
  assert.ok(has(inSession, GIFT_COPY.accept));
  assert.ok(has(inSession, 'data-action="redeem-gift"'));
});

test("every refusal names itself instead of showing a button that does nothing", () => {
  for (const error of ["used", "expired", "revoked", "self", "already-entitled"]) {
    const html = renderGiftRedeem({ preview: { ok: false, error }, signedIn: true });
    assert.ok(has(html, giftErrorCopy(error)), `${error} is explained`);
    assert.equal(has(html, 'data-action="redeem-gift"'), false, `${error} does not still offer to accept`);
  }
  const unknown = renderGiftRedeem({ preview: { ok: false, error: "who-knows" }, signedIn: true });
  assert.ok(has(unknown, giftErrorCopy("invalid")), "an unfamiliar failure is not a blank screen");
});

test("an accepted gift hands the receiver straight into the pack", () => {
  const html = renderGiftRedeem({ accepted: true, signedIn: true });
  assert.ok(has(html, INVITE_COPY.startPack));
  assert.ok(has(html, 'data-action="start-pack"'));
  assert.equal(has(html, GIFT_COPY.accept), false, "it is already taken");
});

test("nothing rendered here escapes into markup", () => {
  const html = renderRecommend({ code: '"><script>x</script>', url: 'https://ab.example/r/"><img>' });
  assert.equal(has(html, "<script>"), false);
  assert.equal(has(html, '"><img>'), false);

  const gifts = renderGiftHome({ gifts: [{ id: '"><script>y</script>', status: "ok", url: "https://ab.example/g" }] });
  assert.equal(has(gifts, "<script>"), false);
});
