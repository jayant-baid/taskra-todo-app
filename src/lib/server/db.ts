import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

let dbInstance: DatabaseSync | null = null;

export function getDatabase(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath =
    process.env.DATABASE_PATH ||
    (process.env.VERCEL
      ? path.join("/tmp", "taskra", "app.db")
      : path.join(process.cwd(), "data", "app.db"));
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  dbInstance = new DatabaseSync(dbPath);

  // Enable WAL mode for better concurrency
  dbInstance.exec("PRAGMA journal_mode = WAL;");
  dbInstance.exec("PRAGMA foreign_keys = ON;");

  // Initialize schema
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      email TEXT,
      password_hash TEXT,
      salt TEXT,
      provider TEXT DEFAULT 'local',
      provider_id TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS task_definitions (
      id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      is_recurring INTEGER NOT NULL,
      recurrence_rule TEXT,
      start_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deleted_from TEXT,
      status TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (id, user_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS task_occurrences (
      id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      task_definition_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      completed_at TEXT,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (id, user_id),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_task_defs_user ON task_definitions(user_id);
    CREATE INDEX IF NOT EXISTS idx_task_occs_user ON task_occurrences(user_id);
  `);

  // Migrate columns if table already existed from earlier runs
  try {
    const columns = dbInstance
      .prepare("PRAGMA table_info(users)")
      .all() as Array<{ name: string }>;
    const columnNames = new Set(columns.map((c) => c.name));

    if (!columnNames.has("email")) {
      dbInstance.exec("ALTER TABLE users ADD COLUMN email TEXT;");
    }
    if (!columnNames.has("provider")) {
      dbInstance.exec(
        "ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'local';",
      );
    }
    if (!columnNames.has("provider_id")) {
      dbInstance.exec("ALTER TABLE users ADD COLUMN provider_id TEXT;");
    }
    if (!columnNames.has("avatar_url")) {
      dbInstance.exec("ALTER TABLE users ADD COLUMN avatar_url TEXT;");
    }

    dbInstance.exec(
      "CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(provider, provider_id);",
    );
    dbInstance.exec(
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
    );
  } catch (err) {
    console.warn("[DB Migration Warning]:", err);
  }

  return dbInstance;
}
