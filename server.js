const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");
const dataDir = process.env.DATA_DIR || (process.env.NODE_ENV === "production" ? "/app/data" : path.join(__dirname, "data"));
const scoresFile = path.join(dataDir, "scores.json");
const maxBodyBytes = 4096;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, status, body, type = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": type,
    "cache-control": status === 200 ? "public, max-age=3600" : "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(body);
}

function sendJson(res, status, value) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  res.end(JSON.stringify(value));
}

function readScores() {
  try {
    const raw = fs.readFileSync(scoresFile, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(entry => entry && typeof entry.name === "string" && Number.isFinite(entry.score))
      .map(entry => ({
        name: entry.name.slice(0, 16),
        score: Math.max(0, Math.floor(entry.score)),
        character: typeof entry.character === "string" ? entry.character.slice(0, 16) : "unknown",
        location: typeof entry.location === "string" ? entry.location.slice(0, 24) : "",
        title: typeof entry.title === "string" ? entry.title.slice(0, 32) : "",
        titleDescription: typeof entry.titleDescription === "string" ? entry.titleDescription.slice(0, 240) : "",
        createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString()
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  } catch {
    return [];
  }
}

function writeScores(scores) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(scoresFile, JSON.stringify(scores, null, 2));
}

function cleanName(value) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16) || "무명펑크";
}

function cleanText(value, limit) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function handleScoresPost(req, res) {
  let body = "";
  req.on("data", chunk => {
    body += chunk;
    if (Buffer.byteLength(body) > maxBodyBytes) {
      req.destroy();
    }
  });
  req.on("end", () => {
    let payload;
    try {
      payload = JSON.parse(body || "{}");
    } catch {
      sendJson(res, 400, { error: "Invalid JSON" });
      return;
    }

    const scoreValue = Number(payload.score);
    if (!Number.isFinite(scoreValue) || scoreValue < 0) {
      sendJson(res, 400, { error: "Score must be zero or positive" });
      return;
    }
    const score = Math.max(0, Math.min(999999999, Math.floor(scoreValue)));

    const entry = {
      name: cleanName(payload.name),
      score,
      character: cleanName(payload.character || "unknown"),
      location: cleanName(payload.location || ""),
      title: cleanText(payload.title || "칭호 없음", 32) || "칭호 없음",
      titleDescription: cleanText(payload.titleDescription || "", 240),
      createdAt: new Date().toISOString()
    };
    const scores = [...readScores(), entry].sort((a, b) => b.score - a.score).slice(0, 20);
    writeScores(scores);
    sendJson(res, 201, { scores, entry });
  });
  req.on("error", () => sendJson(res, 400, { error: "Request failed" }));
}

function resolveStaticPath(urlPath) {
  let cleanPath = "/";
  try {
    cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  } catch {
    return null;
  }
  const safePath = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath === "/" ? "index.html" : safePath);
  const relative = path.relative(publicDir, filePath);
  return relative && !relative.startsWith("..") && !path.isAbsolute(relative) ? filePath : null;
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    send(res, 200, "OK");
    return;
  }

  if (req.url === "/api/scores" && req.method === "GET") {
    sendJson(res, 200, { scores: readScores() });
    return;
  }

  if (req.url === "/api/scores" && req.method === "POST") {
    handleScoresPost(req, res);
    return;
  }

  if (req.url === "/api/scores") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const filePath = resolveStaticPath(req.url || "/");
  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, "Not found");
      return;
    }
    send(res, 200, data, types[path.extname(filePath)] || "application/octet-stream");
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`오보로나 listening on 0.0.0.0:${port}`);
});
