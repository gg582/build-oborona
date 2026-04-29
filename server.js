const express = require("express");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT) || 8080;
const host = "0.0.0.0";
const publicDir = path.join(__dirname, "public");
const migrationsDir = path.join(__dirname, "migrations");
const sqlitePath = process.env.SQLITE_PATH || "/data/app.sqlite";
const maxBodyBytes = "4kb";

let db;
let dbReadyPromise;

function runMigrations() {
  runSql(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  const applied = new Set(
    allRows("SELECT version FROM schema_migrations").map(row => row.version)
  );
  const files = fs
    .readdirSync(migrationsDir)
    .filter(file => /^\d+_.+\.sql$/.test(file))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    runSql("BEGIN");
    try {
      runSql(sql);
      runSql("INSERT INTO schema_migrations (version) VALUES (?)", [file]);
      runSql("COMMIT");
      saveDatabase();
    } catch (error) {
      runSql("ROLLBACK");
      throw error;
    }
  }
}

const app = express();
app.disable("x-powered-by");

app.get("/health", (req, res) => {
  res.type("text/plain").status(200).send("OK");
});

app.use(express.json({ limit: maxBodyBytes }));
app.use(express.static(publicDir, {
  index: "index.html",
  setHeaders(res) {
    res.setHeader("x-content-type-options", "nosniff");
  }
}));

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

function scoreRow(row) {
  return {
    id: row.id,
    name: row.name,
    score: row.score,
    character: row.character,
    location: row.location,
    title: row.title,
    titleDescription: row.title_description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function readScores(limit = 20) {
  return allRows(`
    SELECT id, name, score, character, location, title, title_description, created_at, updated_at
    FROM scores
    ORDER BY score DESC, created_at ASC
    LIMIT ?
  `, [limit]).map(scoreRow);
}

function scorePayload(body) {
  const scoreValue = Number(body.score);
  if (!Number.isFinite(scoreValue) || scoreValue < 0) {
    const error = new Error("Score must be zero or positive");
    error.status = 400;
    throw error;
  }

  return {
    name: cleanName(body.name),
    score: Math.max(0, Math.min(999999999, Math.floor(scoreValue))),
    character: cleanName(body.character || "unknown"),
    location: cleanName(body.location || ""),
    title: cleanText(body.title || "칭호 없음", 32) || "칭호 없음",
    titleDescription: cleanText(body.titleDescription || "", 240)
  };
}

app.use("/api", async (req, res, next) => {
  if (!dbReadyPromise) {
    res.status(503).json({ error: "Database is starting" });
    return;
  }
  try {
    await dbReadyPromise;
    next();
  } catch (error) {
    res.status(503).json({ error: "Database is not ready" });
  }
});

app.get("/api/scores", (req, res) => {
  res.json({ scores: readScores() });
});

app.post("/api/scores", (req, res, next) => {
  try {
    const entry = scorePayload(req.body || {});
    runSql(`
      INSERT INTO scores (name, score, character, location, title, title_description)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [entry.name, entry.score, entry.character, entry.location, entry.title, entry.titleDescription]);
    const idRow = getRow("SELECT last_insert_rowid() AS id");
    saveDatabase();
    const saved = getRow(`
      SELECT id, name, score, character, location, title, title_description, created_at, updated_at
      FROM scores
      WHERE id = ?
    `, [idRow.id]);
    res.status(201).json({ scores: readScores(), entry: scoreRow(saved) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/scores/:id", (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid score id" });
      return;
    }
    const name = cleanName(req.body && req.body.name);
    runSql(`
      UPDATE scores
      SET name = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?
    `, [name, id]);
    const changes = getRow("SELECT changes() AS changes").changes;
    if (!changes) {
      res.status(404).json({ error: "Score not found" });
      return;
    }
    saveDatabase();
    res.json({ scores: readScores() });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/scores/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid score id" });
    return;
  }
  runSql("DELETE FROM scores WHERE id = ?", [id]);
  const changes = getRow("SELECT changes() AS changes").changes;
  if (!changes) {
    res.status(404).json({ error: "Score not found" });
    return;
  }
  saveDatabase();
  res.json({ scores: readScores() });
});

app.use((error, req, res, next) => {
  if (error.type === "entity.too.large") {
    res.status(413).json({ error: "Request body too large" });
    return;
  }
  res.status(error.status || 500).json({ error: error.message || "Server error" });
});

function runSql(sql, params = []) {
  db.run(sql, params);
}

function allRows(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  try {
    if (params.length) stmt.bind(params);
    while (stmt.step()) rows.push(stmt.getAsObject());
    return rows;
  } finally {
    stmt.free();
  }
}

function getRow(sql, params = []) {
  return allRows(sql, params)[0] || null;
}

function saveDatabase() {
  const tmpPath = `${sqlitePath}.tmp`;
  fs.writeFileSync(tmpPath, Buffer.from(db.export()));
  fs.renameSync(tmpPath, sqlitePath);
}

async function initDatabase() {
  const initSqlJs = require("sql.js");
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
  const wasmDir = path.dirname(require.resolve("sql.js/dist/sql-wasm.wasm"));
  const SQL = await initSqlJs({ locateFile: file => path.join(wasmDir, file) });
  const existing = fs.existsSync(sqlitePath) ? fs.readFileSync(sqlitePath) : null;
  db = existing ? new SQL.Database(existing) : new SQL.Database();
  runSql("PRAGMA foreign_keys=ON");
  runSql("PRAGMA busy_timeout=5000");
  try {
    runSql("PRAGMA journal_mode=WAL");
  } catch {}
  runMigrations();
  saveDatabase();
}

function startDatabaseSoon() {
  dbReadyPromise = initDatabase();
  dbReadyPromise.catch(error => {
    console.error("Database initialization failed:", error);
  });
}

app.listen(port, host, () => {
  console.log(`오보로나 listening on ${host}:${port}`);
  startDatabaseSoon();
});
