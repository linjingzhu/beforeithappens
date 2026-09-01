import { readFile } from "node:fs/promises";

const files = [
  "index.html",
  "src/app.js",
  "src/auth.js",
  "src/auth-ui.js",
  "src/auth.css",
  "src/install.js",
  "src/state.js",
  "src/questions.js",
  "src/styles.css",
  "src/accessibility.css",
  "server/auth.mjs",
  "server/oauth.mjs",
  "server/app.mjs",
  "server/store.mjs",
  "server/http.mjs",
  "server/mail.mjs",
  "server/workspace.mjs",
  "server/answers.mjs",
  "server/entitlement.mjs",
  "server/audit.mjs",
  "server/report.mjs",
  "mobile/App.js",
  "mobile/src/copy.js",
  "mobile/src/session.js",
  "mobile/src/screens.js",
  "mobile/src/theme.js",
  "mobile/src/host.js",
  "mobile/src/s9-mount.js",
  "mobile/paywall/screens.js",
  "mobile/paywall/host-mount.js",
  "mobile/paywall/contract/paywall-copy.js",
  "mobile/paywall/contract/paywall-gate.js"
];
for (const file of files) {
  const value = await readFile(file, "utf8");
  if (!value.trim()) throw new Error(`${file} is empty`);
  if (value.includes("\r\n")) throw new Error(`${file} uses CRLF line endings`);
}
console.log(`Checked ${files.length} source files`);
