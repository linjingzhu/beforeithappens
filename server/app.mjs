import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { SESSION_COOKIE } from "./auth.mjs";
import { parseCookies, readJsonBody, requestOrigin, sendJson, sendText, sessionCookieHeader } from "./http.mjs";

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function cookieOptions(request) {
  const proto = String(request.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  return { secure: proto === "https" };
}

export function createListener({ auth, root, allowDevOutbox = false, outbox = [] } = {}) {
  if (!auth) throw new Error("auth is required");
  if (!root) throw new Error("root is required");

  async function serveStatic(response, requestedPath) {
    const relative = normalize(requestedPath === "/" ? "index.html" : requestedPath.slice(1));
    if (relative.startsWith("..")) {
      sendText(response, 404, "Not found");
      return;
    }
    const filePath = join(root, relative);
    if (!(await stat(filePath)).isFile()) {
      sendText(response, 404, "Not found");
      return;
    }
    response.writeHead(200, { "content-type": types[extname(filePath)] ?? "application/octet-stream" });
    response.end(await readFile(filePath));
  }

  return async function listener(request, response) {
    try {
      const url = new URL(request.url, "http://localhost");
      const cookies = parseCookies(request.headers.cookie);
      const sessionId = cookies[SESSION_COOKIE];

      if (request.method === "POST" && url.pathname === "/api/auth/magic-link") {
        const body = await readJsonBody(request);
        const result = auth.requestMagicLink(body.email);
        if (!result.ok) {
          sendJson(response, 400, { ok: false, error: result.error });
          return;
        }
        const origin = requestOrigin(request);
        const item = {
          email: result.email,
          url: `${origin}/auth/consume?token=${encodeURIComponent(result.token)}`,
          createdAt: new Date().toISOString(),
          expiresAt: result.expiresAt
        };
        outbox.unshift(item);
        outbox.splice(20);
        console.log(`Magic link for ${result.email}: ${item.url}`);
        sendJson(response, 200, { ok: true });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/consume") {
        const body = await readJsonBody(request);
        const result = auth.consumeMagicLink(body.token);
        if (!result.ok) {
          sendJson(response, 400, { ok: false, error: result.error });
          return;
        }
        sendJson(response, 200, { ok: true, session: auth.sessionFor(result.sessionId) }, {
          "set-cookie": sessionCookieHeader(SESSION_COOKIE, result.sessionId, cookieOptions(request))
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/auth/consume") {
        await serveStatic(response, "/");
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/auth/session") {
        sendJson(response, 200, auth.sessionFor(sessionId));
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/ack-notice") {
        const result = auth.acknowledgeNotice(sessionId);
        if (!result.ok) {
          sendJson(response, 401, result);
          return;
        }
        sendJson(response, 200, result.session);
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/logout") {
        auth.logout(sessionId);
        sendJson(response, 200, { ok: true }, {
          "set-cookie": sessionCookieHeader(SESSION_COOKIE, "", { ...cookieOptions(request), clear: true })
        });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/auth/force-logout") {
        const result = auth.forceLogout(sessionId);
        if (!result.ok) {
          sendJson(response, 401, result, {
            "set-cookie": sessionCookieHeader(SESSION_COOKIE, "", { ...cookieOptions(request), clear: true })
          });
          return;
        }
        sendJson(response, 200, { ok: true }, {
          "set-cookie": sessionCookieHeader(SESSION_COOKIE, "", { ...cookieOptions(request), clear: true })
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/dev/outbox") {
        if (!allowDevOutbox) {
          sendJson(response, 404, { error: "not-found" });
          return;
        }
        sendJson(response, 200, { items: outbox });
        return;
      }

      if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
        sendJson(response, 404, { error: "not-found" });
        return;
      }

      await serveStatic(response, url.pathname);
    } catch (error) {
      const status = error.statusCode || 500;
      if (request.url?.startsWith("/api/")) {
        sendJson(response, status, { ok: false, error: status === 400 ? "invalid-json" : "server-error" });
        return;
      }
      sendText(response, status === 404 ? 404 : 500, status === 404 ? "Not found" : "Server error");
    }
  };
}
