export function parseCookies(header = "") {
  const cookies = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  }
  return cookies;
}

export function sessionCookieHeader(name, value, { clear = false, secure = false, maxAge = 60 * 60 * 24 * 30 } = {}) {
  const parts = [
    `${name}=${clear ? "" : encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];
  parts.push(clear ? "Max-Age=0" : `Max-Age=${maxAge}`);
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function readJsonBody(request, limit = 8000) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error("Payload too large"), { statusCode: 413 }));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => {
      if (size === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        reject(Object.assign(new Error("Invalid JSON"), { statusCode: 400 }));
      }
    });
    request.on("error", reject);
  });
}

export function sendJson(response, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    ...headers
  });
  response.end(payload);
}

export function sendText(response, status, body, headers = {}) {
  response.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    ...headers
  });
  response.end(body);
}

export function requestOrigin(request, fallback = "http://localhost:4173") {
  if (process.env.AB_PUBLIC_ORIGIN) return process.env.AB_PUBLIC_ORIGIN.replace(/\/$/, "");
  const host = request.headers.host;
  if (!host) return fallback;
  const proto = String(request.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  return `${proto}://${host}`;
}
