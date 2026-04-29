# Builder persistence template

This app has durable SQLite storage enabled. Prefer this contract:

- Use `process.env.SQLITE_PATH || "/data/app.sqlite"`.
- Keep migrations in `migrations/*.sql`.
- Run migrations idempotently on startup.
- Enable `PRAGMA foreign_keys=ON`, `busy_timeout=5000`, and WAL when possible.
- Never delete or reseed existing user data on deploy.
- Provide `/health`.
- Add `smoke-test.json` describing safe verification requests.
