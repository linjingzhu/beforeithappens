import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { SESSION_COOKIE } from "./auth.mjs";
import { inviteAcceptUrl } from "../src/auth.js";
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

function recordOutbox(outbox, allowDevOutbox, item) {
  if (!allowDevOutbox) return;
  outbox.unshift(item);
  outbox.splice(20);
  console.log(`${item.type} for ${item.email}: ${item.url}`);
}

function packErrorStatus(error) {
  if (error === "unauthenticated") return 401;
  if (error === "forbidden" || error === "locked") return 403;
  return 400;
}

export function createListener({ auth, couple, answers, root, allowDevOutbox = false, outbox = [] } = {}) {
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
        recordOutbox(outbox, allowDevOutbox, {
          type: "magic-link",
          email: result.email,
          url: `${origin}/auth/consume?token=${encodeURIComponent(result.token)}`,
          createdAt: new Date().toISOString(),
          expiresAt: result.expiresAt
        });
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

      if (request.method === "GET" && (url.pathname === "/auth/consume" || url.pathname === "/invite/accept")) {
        await serveStatic(response, "/");
        return;
      }

      if (couple && request.method === "POST" && url.pathname === "/api/invite") {
        const body = await readJsonBody(request);
        const result = couple.issueInvite(sessionId, body.email);
        if (!result.ok) {
          const status = result.error === "unauthenticated" ? 401 : result.error === "forbidden" ? 403 : 400;
          sendJson(response, status, result);
          return;
        }
        recordOutbox(outbox, allowDevOutbox, {
          type: "invite",
          email: result.email,
          url: `${requestOrigin(request)}/invite/accept?token=${encodeURIComponent(result.token)}`,
          createdAt: result.lastSentAt,
          expiresAt: result.expiresAt
        });
        sendJson(response, 200, {
          ok: true,
          email: result.email,
          expiresAt: result.expiresAt,
          lastSentAt: result.lastSentAt,
          url: inviteAcceptUrl(requestOrigin(request), result.token),
          workspace: auth.sessionFor(sessionId).workspace
        });
        return;
      }

      if (couple && request.method === "GET" && url.pathname === "/api/invite/preview") {
        sendJson(response, 200, couple.previewInvite(url.searchParams.get("token")));
        return;
      }

      if (couple && request.method === "POST" && url.pathname === "/api/invite/accept") {
        const body = await readJsonBody(request);
        const result = couple.acceptInvite(sessionId, body.token);
        if (!result.ok) {
          const status = result.error === "unauthenticated" ? 401 : 400;
          sendJson(response, status, result);
          return;
        }
        sendJson(response, 200, { ok: true, session: auth.sessionFor(sessionId) });
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

      if (answers && request.method === "GET" && url.pathname === "/api/pack/state") {
        const result = answers.stateFor(sessionId);
        if (!result.ok) {
          sendJson(response, packErrorStatus(result.error), result);
          return;
        }
        sendJson(response, 200, result);
        return;
      }

      if (answers && request.method === "PATCH" && url.pathname === "/api/pack/draft") {
        const body = await readJsonBody(request);
        const result = answers.saveDraft(sessionId, body);
        if (!result.ok) {
          sendJson(response, packErrorStatus(result.error), result);
          return;
        }
        sendJson(response, 200, result);
        return;
      }

      if (answers && request.method === "POST" && url.pathname === "/api/pack/submit") {
        const body = await readJsonBody(request);
        const result = answers.submit(sessionId, body);
        if (!result.ok) {
          sendJson(response, packErrorStatus(result.error), result);
          return;
        }
        sendJson(response, 200, result);
        return;
      }

      if (answers && request.method === "POST" && url.pathname === "/api/pack/agreement") {
        const body = await readJsonBody(request);
        const result = answers.saveAgreement(sessionId, body);
        if (!result.ok) {
          sendJson(response, packErrorStatus(result.error), result);
          return;
        }
        sendJson(response, 200, result);
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
