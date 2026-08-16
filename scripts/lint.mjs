import { readFile } from "node:fs/promises";

const files = ["index.html", "src/app.js", "src/questions.js", "src/styles.css", "src/accessibility.css"];
for (const file of files) {
  const value = await readFile(file, "utf8");
  if (!value.trim()) throw new Error(`${file} is empty`);
  if (value.includes("\r\n")) throw new Error(`${file} uses CRLF line endings`);
}
console.log(`Checked ${files.length} source files`);
