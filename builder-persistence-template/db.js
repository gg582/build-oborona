// Optional reference for Node apps. Copy/adapt if useful.
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
const sqlitePath = process.env.SQLITE_PATH || '/data/app.sqlite';
fs.mkdirSync(path.dirname(sqlitePath), { recursive: true });
export const db = new Database(sqlitePath);
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');
try { db.pragma('journal_mode = WAL'); } catch {}
