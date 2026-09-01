/**
 * A string as a JavaScript source literal, for the pack generators.
 *
 * `JSON.stringify` is almost enough. The gap is U+2028 and U+2029, which are legal inside a JSON
 * string and were illegal inside a JavaScript string literal before ES2019 — escaping them costs
 * nothing and keeps the generated files readable by older tooling.
 */
export function literal(value) {
  return JSON.stringify(value).replace(/[\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16)}`);
}
