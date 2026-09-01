import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { INVITE_COPY, shareInviteChannel } from "../src/auth.js";
import {
  GIFT_COPY,
  RECOMMEND_COPY,
  assertLockedGrowthCopy,
  canRevokeGift,
  giftErrorCopy,
  giftStatusLabel,
  isGiftSendable,
  toNextReward
} from "../src/growth.js";
import { giftRedeemUrl, referralCodeFromPath, referralUrl } from "../src/pair-code.js";

test("the contract and the copy module say the same thing", async () => {
  const contract = await readFile("docs/UX_CONTRACT.md", "utf8");
  const locked = [
    RECOMMEND_COPY.title, RECOMMEND_COPY.body, RECOMMEND_COPY.codeLabel, RECOMMEND_COPY.rewardRule,
    GIFT_COPY.title, GIFT_COPY.body, GIFT_COPY.cta, GIFT_COPY.sentTitle,
    GIFT_COPY.statusWaiting, GIFT_COPY.statusUsed, GIFT_COPY.statusExpired, GIFT_COPY.statusRevoked,
    GIFT_COPY.revoke, GIFT_COPY.arrivedTitle, GIFT_COPY.arrivedBody, GIFT_COPY.accept,
    giftErrorCopy("used"), giftErrorCopy("expired"), giftErrorCopy("revoked"),
    giftErrorCopy("self"), giftErrorCopy("already-entitled")
  ];
  for (const line of locked) {
    assert.ok(contract.includes(line), `the contract is missing: ${line}`);
  }
  assert.equal(assertLockedGrowthCopy(), true);
});

test("the share row is the invite's row, not a second one that can drift", () => {
  assert.equal(assertLockedGrowthCopy(), true);
  // If someone re-types these labels for the gift screen, this fails rather than shipping two
  // slightly different Korean words for the same button.
  assert.equal(INVITE_COPY.kakao, "카카오톡");
  assert.equal(INVITE_COPY.instagram, "인스타그램");
});

test("a present is only offered as a link while it can still be used", () => {
  assert.equal(isGiftSendable({ status: "ok", url: "https://ab.example/gift/redeem?token=t" }), true);
  assert.equal(isGiftSendable({ status: "ok", url: "" }), false, "no link means nothing to share");
  assert.equal(isGiftSendable({ status: "used", url: "https://x" }), false);
  assert.equal(isGiftSendable({ status: "revoked", url: "https://x" }), false);
  assert.equal(isGiftSendable(null), false);

  assert.equal(canRevokeGift({ status: "ok" }), true);
  assert.equal(canRevokeGift({ status: "expired" }), true, "withdrawing a dead link is harmless");
  assert.equal(canRevokeGift({ status: "used" }), false, "you cannot take back what was opened");
});

test("every gift failure has a line, and an unknown one does not render blank", () => {
  for (const error of ["used", "expired", "revoked", "self", "already-entitled", "invalid"]) {
    assert.ok(giftErrorCopy(error).length > 0, error);
  }
  assert.equal(giftErrorCopy("something-new"), giftErrorCopy("invalid"));
  assert.equal(giftErrorCopy(undefined), giftErrorCopy("invalid"));
  assert.equal(giftStatusLabel("nonsense"), GIFT_COPY.statusWaiting, "an unknown status reads as waiting");
});

test("the countdown to the next present matches the server's counting rule", () => {
  assert.equal(toNextReward({ credited: 0, rewardEvery: 3 }), 3);
  assert.equal(toNextReward({ credited: 1, rewardEvery: 3 }), 2);
  assert.equal(toNextReward({ credited: 2, rewardEvery: 3 }), 1);
  assert.equal(toNextReward({ credited: 3, rewardEvery: 3 }), 3, "a reward just landed; the next one restarts");
  assert.equal(toNextReward({ credited: 4, rewardEvery: 3 }), 2);
  assert.equal(toNextReward({ credited: 5, rewardEvery: 0 }), 1, "a nonsense threshold does not divide by zero");
  assert.equal(toNextReward({}), 3);
});

test("both links are absolute and survive a round trip", () => {
  const gift = giftRedeemUrl("https://ab.example/", "tok 1");
  assert.equal(gift, "https://ab.example/gift/redeem?token=tok%201");

  const recommend = referralUrl("https://ab.example", "abcd 1234");
  assert.equal(recommend, "https://ab.example/r/ABCD1234");
  assert.equal(referralCodeFromPath(new URL(recommend).pathname), "ABCD1234");
  assert.equal(referralCodeFromPath("/r/ABCD1234?from=kakao"), "ABCD1234", "a tracking param does not eat the code");
  assert.equal(referralCodeFromPath("/invite/accept?token=x"), "", "an invitation is never read as a recommendation");
  assert.equal(referralCodeFromPath("/"), "");
});

test("sharing a present uses the invite's path and carries the present's own line", async () => {
  const shared = [];
  const url = "https://ab.example/gift/redeem?token=t";
  const result = await shareInviteChannel(url, "kakao", { share: async (p) => shared.push(p) }, GIFT_COPY.body);
  assert.equal(result, "shared");
  assert.equal(shared[0].url, url);
  assert.equal(shared[0].text, GIFT_COPY.body, "the present explains itself, not the invitation");

  // No share sheet: it still falls back to the clipboard rather than doing nothing.
  const copied = [];
  const fallback = await shareInviteChannel(url, "copy", { clipboard: { writeText: async (v) => copied.push(v) } }, GIFT_COPY.body);
  assert.equal(fallback, "copied");
  assert.equal(copied[0], url);

  const failed = await shareInviteChannel(url, "copy", { clipboard: null }, GIFT_COPY.body);
  assert.equal(failed, "failed", "a silent clipboard failure is still reported");
  assert.equal(await shareInviteChannel("", "kakao", {}, GIFT_COPY.body), "failed");
});
