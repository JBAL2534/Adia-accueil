import { createReadStream, existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname;
const host = process.env.HOST || "0.0.0.0";
const preferredPort = Number(process.env.PORT || 4173);
const stateFile = join(root, ".demo-state.json");
let sharedState = loadSharedState();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

function loadSharedState() {
  try {
    if (!existsSync(stateFile)) return null;
    return JSON.parse(readFileSync(stateFile, "utf8"));
  } catch {
    return null;
  }
}

function saveSharedState(state) {
  sharedState = {
    ...state,
    syncedAt: new Date().toISOString(),
  };
  writeFileSync(stateFile, JSON.stringify(sharedState, null, 2));
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    "cache-control": "no-store",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 5_000_000) {
        reject(new Error("Payload trop volumineux."));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const requested = normalize(join(root, pathname === "/" ? "index.html" : pathname));
  if (!requested.startsWith(root)) return null;
  if (!existsSync(requested)) return null;
  const stats = statSync(requested);
  if (stats.isDirectory()) return join(requested, "index.html");
  return requested;
}

const server = createServer(async (request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (pathname === "/api/state" && request.method === "GET") {
    sendJson(response, 200, { state: sharedState });
    return;
  }

  if (pathname === "/api/state" && request.method === "POST") {
    try {
      const state = await readJsonBody(request);
      if (!Array.isArray(state.appointments) || !Array.isArray(state.patients)) {
        sendJson(response, 400, { error: "Etat invalide." });
        return;
      }
      saveSharedState(state);
      sendJson(response, 200, { ok: true, syncedAt: sharedState.syncedAt });
    } catch {
      sendJson(response, 400, { error: "JSON invalide." });
    }
    return;
  }

  if (pathname === "/api/status") {
    sendJson(response, 200, {
      ok: true,
      hasState: Boolean(sharedState),
      syncedAt: sharedState?.syncedAt || null,
    });
    return;
  }

  const filePath = resolvePath(request.url || "/");
  if (!filePath) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Fichier introuvable.");
    return;
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": mimeTypes[extname(filePath)] || "application/octet-stream",
  });
  createReadStream(filePath).pipe(response);
});

function listen(port, retries = 10) {
  server.once("error", (error) => {
    if (["EADDRINUSE", "EPERM"].includes(error.code) && retries > 0) {
      listen(port + 1, retries - 1);
      return;
    }
    throw error;
  });

  server.listen(port, host, () => {
    console.log(`ADIA Présence disponible sur http://localhost:${port}`);
    console.log("Pour iPad: utilisez l'adresse IP du Mac sur le même Wi-Fi.");
    console.log("Synchronisation multi-écrans active via /api/state.");
  });
}

listen(preferredPort);
