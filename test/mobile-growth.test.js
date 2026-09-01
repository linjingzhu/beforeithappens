import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { INVITE_COPY } from "../src/auth.js";
import { GIFT_COPY, RECOMMEND_COPY } from "../src/growth.js";
import { APP_GIFT_COPY, APP_RECOMMEND_COPY, APP_SHARE_COPY, assertLockedGrowthAppCopy } from "../mobile/growth/copy.js";
import {
  APP_GIFT_SCREEN,
  APP_RECOMMEND_SCREEN,
  giftRedeemViewModel,
  giftRowModel,
  giftViewModel,
  recommendViewModel,
  shareGrowthLink,
  shareRowModel
} from "../mobile/growth/flow.js";
import {
  closeGrowth,
  growthGiftUrl,
  growthRecommendUrl,
  readGrowthOpenParams
} from "../mobile/growth/host-mount.js";
import {
  backToAccount,
  openGiftScreen,
  openRecommendScreen,
  resolveNativeScreen
} from "../mobile/s0-s2-s3-flow.js";

const signedIn = { splashDone: true, session: { user: { id: "usr_1", email: "me@example.com" } } };

test("the app copy is the web copy, not a second hand-typed table", () => {
  assert.equal(assertLockedGrowthAppCopy(), true);
  assert.equal(APP_RECOMMEND_COPY.title, RECOMMEND_COPY.title);
  assert.equal(APP_GIFT_COPY.creditRestored, GIFT_COPY.creditRestored);
  assert.equal(APP_SHARE_COPY.kakao, INVITE_COPY.kakao);
  assert.equal(APP_SHARE_COPY.copyFailed, INVITE_COPY.copyFailed);
});

test("the Swift and Kotlin surfaces carry the same Korean as the JS module", async () => {
  const [swift, kotlin] = await Promise.all([
    readFile("mobile/growth/ios/GrowthCopy.swift", "utf8"),
    readFile("mobile/growth/android/GrowthCopy.kt", "utf8")
  ]);
  const locked = [
    RECOMMEND_COPY.title, RECOMMEND_COPY.body, RECOMMEND_COPY.codeLabel,
    RECOMMEND_COPY.countsLabel, RECOMMEND_COPY.rewardRule,
    GIFT_COPY.title, GIFT_COPY.body, GIFT_COPY.cta, GIFT_COPY.sentTitle,
    GIFT_COPY.statusWaiting, GIFT_COPY.statusUsed, GIFT_COPY.statusExpired, GIFT_COPY.statusRevoked,
    GIFT_COPY.revoke, GIFT_COPY.creditLabel, GIFT_COPY.creditRestored, GIFT_COPY.freeCta,
    GIFT_COPY.arrivedTitle, GIFT_COPY.arrivedBody, GIFT_COPY.accept, GIFT_COPY.loginRequired,
    INVITE_COPY.copyLink, INVITE_COPY.instagram, INVITE_COPY.kakao, INVITE_COPY.copied, INVITE_COPY.copyFailed
  ];
  for (const line of locked) {
    assert.ok(swift.includes(line), `Swift is missing: ${line}`);
    assert.ok(kotlin.includes(line), `Kotlin is missing: ${line}`);
  }
});

test("recommending and gifting are one tap from 계정, and going back returns there", () => {
  const recommend = openRecommendScreen(signedIn);
  assert.equal(recommend.screen, APP_RECOMMEND_SCREEN);
  assert.equal(resolveNativeScreen(recommend), "recommend");

  const gift = openGiftScreen(signedIn);
  assert.equal(gift.screen, APP_GIFT_SCREEN);

  // Leaving one lands on 계정, which is what makes trying the other cheap.
  assert.equal(backToAccount(gift).screen, "account");
  assert.equal(backToAccount(recommend).screen, "account");

  // Opening one closes the other, so the two never resolve at the same time.
  assert.equal(openGiftScreen(recommend).recommendOpen, false);
  assert.equal(openRecommendScreen(gift).giftOpen, false);
});

test("leaving the account does not resolve straight back into recommend", () => {
  const recommend = openRecommendScreen(signedIn);
  const home = closeGrowth(recommend);
  assert.equal(home.recommendOpen, false);
  assert.equal(home.giftOpen, false);

  // clearJourney must drop both, or the pack list bounces the person back.
  const { backFromAccount } = { backFromAccount: (state) => ({ ...state, accountOpen: false }) };
  const left = resolveNativeScreen({ ...backFromAccount(recommend), recommendOpen: false, giftOpen: false });
  assert.equal(left, "pack-list");
});

test("a signed-out tap asks for login instead of opening an empty screen", () => {
  const guest = { splashDone: true, session: null };
  assert.notEqual(openRecommendScreen(guest).screen, APP_RECOMMEND_SCREEN);
  assert.notEqual(openGiftScreen(guest).screen, APP_GIFT_SCREEN);
});

test("the share row is one shape, and it disappears when there is nothing to send", () => {
  const row = shareRowModel({ url: "https://ab.example/r/ABCD1234" });
  assert.equal(row.visible, true);
  assert.deepEqual(row.buttons, [INVITE_COPY.copyLink, INVITE_COPY.instagram, INVITE_COPY.kakao]);

  const empty = shareRowModel({ url: "" });
  assert.equal(empty.visible, false);
  assert.deepEqual(empty.buttons, [], "no link means no buttons that would do nothing");

  const failed = shareRowModel({ url: "https://x", failed: true });
  assert.equal(failed.copyFailed, INVITE_COPY.copyFailed);
  assert.equal(failed.url, "https://x", "the link the failure line points at is still there");
});

test("the recommend model counts down to the next present", () => {
  const model = recommendViewModel({ code: "ABCD1234", url: "https://ab.example/r/ABCD1234", joined: 4, credited: 1, rewardEvery: 3 });
  assert.equal(model.code, "ABCD1234");
  assert.equal(model.joined, 4);
  assert.equal(model.toNextReward, 2);
  assert.equal(model.share.visible, true);

  const bare = recommendViewModel({});
  assert.equal(bare.codeLabel, "", "no code, no label hanging over an empty box");
  assert.equal(bare.share.visible, false);
});

test("a returned slot changes the button, so a free present never reads as a second payment", () => {
  const free = giftViewModel({ credits: 1, gifts: [] });
  assert.equal(free.cta, GIFT_COPY.freeCta);
  assert.equal(free.creditNote, GIFT_COPY.creditRestored);
  assert.equal(free.credits, 1);

  const paid = giftViewModel({ credits: 0, gifts: [] });
  assert.equal(paid.cta, GIFT_COPY.cta);
  assert.equal(paid.creditNote, "", "nothing to restore, nothing to claim");
  assert.equal(paid.sentTitle, "", "no heading over an empty list");
});

test("a spent present keeps its place but offers no link and no way back", () => {
  const used = giftRowModel({ id: "g1", status: "used", url: "" });
  assert.equal(used.statusLabel, GIFT_COPY.statusUsed);
  assert.equal(used.share.visible, false);
  assert.equal(used.revoke, "", "you cannot take back what was opened");

  const live = giftRowModel({ id: "g2", status: "ok", url: "https://ab.example/gift/redeem?token=t" });
  assert.equal(live.share.visible, true);
  assert.equal(live.revoke, GIFT_COPY.revoke);

  const cancelled = giftRowModel({ id: "g3", status: "revoked", url: "" });
  assert.equal(cancelled.statusLabel, GIFT_COPY.statusRevoked);
  assert.equal(cancelled.share.visible, false, "a withdrawn link is not handed out again");
});

test("only the row the person shared shows the copied line", () => {
  const url = "https://ab.example/gift/redeem?token=t1";
  const mine = giftRowModel({ id: "g1", status: "ok", url }, { copied: true, activeUrl: url });
  const other = giftRowModel({ id: "g2", status: "ok", url: "https://ab.example/gift/redeem?token=t2" }, { copied: true, activeUrl: url });
  assert.equal(mine.share.copied, INVITE_COPY.copied);
  assert.equal(other.share.copied, "", "a second present does not claim it was copied");
});

test("the receiver's model refuses out loud and offers no button while it does", () => {
  for (const error of ["used", "expired", "revoked", "self", "already-entitled"]) {
    const model = giftRedeemViewModel({ preview: { ok: false, error }, signedIn: true });
    assert.ok(model.error.length > 0, error);
    assert.equal(model.accept, "", `${error} does not still offer to accept`);
  }
  const anonymous = giftRedeemViewModel({ preview: { ok: true }, signedIn: false });
  assert.equal(anonymous.accept, "");
  assert.equal(anonymous.loginRequired, GIFT_COPY.loginRequired);

  const ready = giftRedeemViewModel({ preview: { ok: true }, signedIn: true });
  assert.equal(ready.accept, GIFT_COPY.accept);
  assert.equal(ready.error, "");
});

test("links leave the host absolute or not at all", () => {
  const state = { io: { origin: "https://loveme.example" } };
  assert.equal(growthRecommendUrl(state, "ABCD1234"), "https://loveme.example/r/ABCD1234");
  assert.equal(growthGiftUrl(state, "tok-1"), "https://loveme.example/gift/redeem?token=tok-1");

  // The app is not a page, so a missing origin must share nothing rather than a bare path.
  assert.equal(growthRecommendUrl({ io: { origin: "" } }, "ABCD1234"), "");
  assert.equal(growthGiftUrl({ io: { origin: "" } }, "tok-1"), "");
  assert.equal(growthRecommendUrl(state, ""), "");
});

test("the host reads a recommendation or a present out of the opening link, and nothing else", () => {
  assert.deepEqual(readGrowthOpenParams({ pathname: "/r/ABCD1234", search: "" }), { referralCode: "ABCD1234", giftToken: "" });
  assert.deepEqual(readGrowthOpenParams({ pathname: "/gift/redeem", search: "?token=tok-1" }), { referralCode: "", giftToken: "tok-1" });
  assert.deepEqual(
    readGrowthOpenParams({ pathname: "/invite/accept", search: "?token=inv-1" }),
    { referralCode: "", giftToken: "" },
    "an invitation is never read as a present"
  );
  assert.deepEqual(readGrowthOpenParams({ pathname: "/", search: "" }), { referralCode: "", giftToken: "" });
  assert.deepEqual(readGrowthOpenParams(null), { referralCode: "", giftToken: "" });
});

test("sharing carries the screen's own line and still falls back to the clipboard", async () => {
  const shared = [];
  const url = "https://ab.example/r/ABCD1234";
  assert.equal(await shareGrowthLink(url, "kakao", { share: async (p) => shared.push(p) }, RECOMMEND_COPY.body), "shared");
  assert.equal(shared[0].text, RECOMMEND_COPY.body);

  const copied = [];
  assert.equal(
    await shareGrowthLink(url, "copy", { clipboard: { writeText: async (v) => copied.push(v) } }, RECOMMEND_COPY.body),
    "copied"
  );
  assert.equal(copied[0], url);
  assert.equal(await shareGrowthLink(url, "copy", { clipboard: null }, RECOMMEND_COPY.body), "failed");
});

test("App.js actually reaches both screens, and 계정 actually reaches App.js", async () => {
  const app = await readFile("mobile/App.js", "utf8");
  // S4 was unreachable for a whole release because the resolver never returned its screen and
  // nothing asserted the route. These pin the chain: account button → transition → mounted screen.
  assert.match(app, /state\.screen === "recommend"/, "the recommend screen is mounted");
  assert.match(app, /state\.screen === "gift"/, "the gift screen is mounted");
  assert.match(app, /<RecommendScreen/);
  assert.match(app, /<GiftScreen/);
  assert.match(app, /onRecommend=\{/, "the account screen is handed a way in");
  assert.match(app, /onGift=\{/);
  assert.match(app, /openRecommendScreen\(state\)/);
  assert.match(app, /openGiftScreen\(state\)/);
  assert.match(app, /backToAccount\(state\)/, "and a way back out");

  const account = await readFile("mobile/src/screens.js", "utf8");
  assert.match(account, /testID="account-recommend"/);
  assert.match(account, /testID="account-gift"/);
  assert.match(account, /onRecommend/);
  assert.match(account, /onGift/);
});

test("the screens lay out from the shared tokens rather than hardcoded sizes", async () => {
  const screens = await readFile("mobile/growth/screens.js", "utf8");
  assert.match(screens, /createStyles\(\(\{/, "one sheet, built from the token tools");
  assert.match(screens, /maxContentWidth/, "a single column that stops stretching on a tablet");
  assert.match(screens, /minHeight: hit/, "every target reaches the touch floor");

  // A bare number where a token belongs is how the design system quietly stops being one.
  const sheet = screens.slice(screens.indexOf("createStyles"), screens.indexOf("function pressed"));
  const hardcoded = sheet.match(/(?:padding|margin|fontSize|borderRadius|minHeight)[A-Za-z]*:\s*\d+/g) || [];
  assert.deepEqual(hardcoded, [], `hardcoded sizes: ${hardcoded.join(", ")}`);
});
