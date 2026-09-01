import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { appHopHtml, consumeHopHtml, consumeUrl, webConsumeFallback, webConsumePath } from "../server/mail.mjs";

const OFF = {};
const ON = { AB_WEB_CONSUME_FALLBACK: "1" };

test("the mailed link stays the locked app scheme unless a deployment opts out", () => {
  assert.equal(webConsumeFallback(OFF), false);
  assert.equal(webConsumeFallback(ON), true);

  const locked = consumeUrl("https://ab.example.test", "tok123", OFF);
  assert.match(locked, /^loveme:\/\/\/auth\/consume\?token=tok123$/);
  assert.equal(consumeUrl("", "tok123", ON), "loveme:///auth/consume?token=tok123", "no origin means no https link to give");

  const opened = consumeUrl("https://ab.example.test/", "tok 123", ON);
  assert.equal(opened, "https://ab.example.test/auth/consume?token=tok%20123");
});

test("the hop hands off to the app first and only then falls back to the web", () => {
  const locked = consumeHopHtml("tok123", OFF);
  assert.match(locked, /loveme:\/\/\/auth\/consume\?token=tok123/);
  assert.equal(locked.includes("웹에서 열기"), false, "the locked hop never offers the web");

  const opened = consumeHopHtml("tok123", ON);
  assert.match(opened, /loveme:\/\/\/auth\/consume\?token=tok123/);
  assert.match(opened, /웹에서 열기/);
  assert.match(opened, /setTimeout/, "the web fallback waits for the app to answer");
  assert.ok(
    opened.indexOf("location.href") > opened.indexOf("setTimeout"),
    "the app hand-off is armed after the fallback timer so a returning app can cancel it"
  );
  assert.match(opened, /visibilitychange/, "leaving for the app cancels the fallback");
  assert.equal(webConsumePath("tok123"), "/?token=tok123");
});

test("the hop knocks on the app's door only where that door exists", () => {
  // `loveme://` on a desktop browser opens a modal asking which application to use, and the page
  // underneath takes no clicks until it is dismissed — the signed-in screen looked implemented and
  // dead. So the phone gets the hand-off and everything else goes straight to the web.
  const opened = consumeHopHtml("tok123", ON);
  assert.match(opened, /iPhone/);
  assert.match(opened, /navigator\.userAgent/);
  const script = opened.slice(opened.indexOf("<script"));
  assert.ok(
    script.indexOf("location.replace(w)") < script.indexOf("location.href"),
    "the web is the branch a desktop takes, before the app hand-off is even armed"
  );
  // And the app is still one tap away for anyone who wants it.
  assert.match(opened, /<a href="loveme:\/\/\/auth\/consume\?token=tok123">/);
});

test("a hop with no fallback keeps its original shape", () => {
  const plain = appHopHtml("loveme://invite");
  assert.match(plain, /http-equiv="refresh"/);
  assert.equal(plain.includes("setTimeout"), false);
});

test("a deployment can be watched and can keep its data somewhere writable", async () => {
  const app = await readFile("server/app.mjs", "utf8");
  assert.match(app, /url\.pathname === "\/healthz"/);
  assert.match(app, /service: "ab"/);

  const server = await readFile("scripts/server.mjs", "utf8");
  assert.match(server, /process\.env\.AB_STORE_PATH/, "a host needs the store off the repo checkout");
  assert.match(server, /Number\(process\.env\.PORT\)/);
});
