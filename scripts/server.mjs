import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const server = createServer(async (request, response) => {
  try {
    const requested = new URL(request.url, "http://localhost").pathname;
    const relative = normalize(requested === "/" ? "index.html" : requested.slice(1));
    if (relative.startsWith("..")) throw new Error("Invalid path");
    const path = join(root, relative);
    if (!(await stat(path)).isFile()) throw new Error("Not found");
    response.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404); response.end("Not found");
  }
});
server.listen(4173, "0.0.0.0", () => console.log("AB running at http://localhost:4173"));
