import "server-only";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH = process.env.DB_PATH ?? "./data/portfolio.db";

let db: Database.Database | null = null;

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function initSchema(database: Database.Database) {
  // 1. Create tables (no-op if they already exist with old shape)
  database.exec(`
    CREATE TABLE IF NOT EXISTS showcase (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('app','website','tool','library','experiment','workflow')),
      description TEXT NOT NULL,
      image TEXT,
      repo_url TEXT,
      live_url TEXT,
      play_store_url TEXT,
      app_store_url TEXT,
      other_links TEXT,
      tags TEXT NOT NULL DEFAULT '[]',
      stack TEXT NOT NULL DEFAULT '[]',
      year INTEGER NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live','archived','wip','sunset')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      edition TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('attendee','speaker','organizer','mentor')),
      month TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      event_url TEXT,
      photos TEXT NOT NULL DEFAULT '[]',
      cover_photo TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // 2. Migrations — must run BEFORE indexes that reference new columns.

  // Event: old shape used `date_label` + `year`. Drop & recreate if empty.
  const eventCols0 = database
    .prepare("PRAGMA table_info(event)")
    .all() as { name: string }[];
  const hasMonth = eventCols0.some((c) => c.name === "month");
  const hasDateLabel = eventCols0.some((c) => c.name === "date_label");
  if (hasDateLabel && !hasMonth) {
    const row = database
      .prepare("SELECT COUNT(*) AS n FROM event")
      .get() as { n: number };
    if (row.n === 0) {
      database.exec(`
        DROP TABLE event;
        CREATE TABLE event (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          edition TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('attendee','speaker','organizer','mentor')),
          month TEXT NOT NULL,
          location TEXT NOT NULL,
          description TEXT NOT NULL,
          event_url TEXT,
          photos TEXT NOT NULL DEFAULT '[]',
          cover_photo TEXT,
          featured INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    } else {
      throw new Error(
        "[db migration] event table has legacy shape (date_label) with existing rows. " +
          "Backup data/portfolio.db and either re-export events or delete the file to start fresh.",
      );
    }
  }

  // Event: add cover_photo column if missing (tables created between the
  // month migration and the cover-picker feature).
  const eventCols1 = database
    .prepare("PRAGMA table_info(event)")
    .all() as { name: string }[];
  if (!eventCols1.some((c) => c.name === "cover_photo")) {
    database.exec("ALTER TABLE event ADD COLUMN cover_photo TEXT");
  }

  // 3. Indexes — run AFTER migrations so referenced columns exist.
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_showcase_year
      ON showcase(year DESC);
    CREATE INDEX IF NOT EXISTS idx_showcase_featured
      ON showcase(featured DESC, year DESC);
    CREATE INDEX IF NOT EXISTS idx_event_month
      ON event(month DESC);
    CREATE INDEX IF NOT EXISTS idx_event_featured
      ON event(featured DESC, month DESC);
  `);
}

/**
 * Returns a singleton SQLite connection. Auto-creates the data/ directory
 * + schema on first call. WAL mode for better concurrent reads.
 */
export function getDb(): Database.Database {
  if (db) return db;
  ensureDir(DB_PATH);
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}
