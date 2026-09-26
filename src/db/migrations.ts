import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Ordered schema migrations, tracked with PRAGMA user_version. Never edit a
 * shipped migration; append a new one instead.
 */
const MIGRATIONS: string[] = [
  // 1: initial schema
  `
  CREATE TABLE categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE books (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT '',
    format TEXT NOT NULL,
    source_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL DEFAULT 0,
    color TEXT NOT NULL,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    page_count INTEGER NOT NULL DEFAULT 0,
    current_page INTEGER NOT NULL DEFAULT 0,
    progress REAL NOT NULL DEFAULT 0,
    location TEXT,
    chapter_label TEXT,
    added_at INTEGER NOT NULL,
    started_at INTEGER,
    last_read_at INTEGER,
    finished_at INTEGER
  );
  CREATE INDEX books_category_idx ON books(category_id);
  CREATE INDEX books_last_read_idx ON books(last_read_at);
  CREATE TABLE highlights (
    id TEXT PRIMARY KEY NOT NULL,
    book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    location TEXT NOT NULL,
    page INTEGER NOT NULL DEFAULT 0,
    position REAL NOT NULL DEFAULT 0,
    color TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX highlights_book_idx ON highlights(book_id);
  CREATE TABLE dictionary_cache (
    word TEXT PRIMARY KEY NOT NULL,
    entry TEXT,
    fetched_at INTEGER NOT NULL
  );
  CREATE TABLE settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
  // 2: cover images extracted from the book file
  `
  ALTER TABLE books ADD COLUMN cover_file TEXT;
  ALTER TABLE books ADD COLUMN cover_checked INTEGER NOT NULL DEFAULT 0;
  `,
];

export function migrate(db: SQLiteDatabase) {
  db.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.withTransactionSync(() => {
      db.execSync(MIGRATIONS[v]);
      db.execSync(`PRAGMA user_version = ${v + 1}`);
    });
  }
}
