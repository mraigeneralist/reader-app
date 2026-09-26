import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Keep in sync with the SQL in ./migrations.ts (the source of truth for the on-device schema).

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  createdAt: integer('created_at').notNull(),
});

export const books = sqliteTable(
  'books',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    author: text('author').notNull().default(''),
    /** Original file format: epub, pdf, mobi, docx… */
    format: text('format').notNull(),
    /** File name as picked by the user. */
    sourceName: text('source_name').notNull(),
    /** Path (relative to the books directory) of the file the reader opens. */
    fileName: text('file_name').notNull(),
    fileSize: integer('file_size').notNull().default(0),
    /** Cover colour for the typographic cover. */
    color: text('color').notNull(),
    /** Cover image file name in the covers directory, when the book has one. */
    coverFile: text('cover_file'),
    /** Set once cover extraction has been tried, so it isn't repeated. */
    coverChecked: integer('cover_checked', { mode: 'boolean' }).notNull().default(false),
    categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
    pageCount: integer('page_count').notNull().default(0),
    currentPage: integer('current_page').notNull().default(0),
    /** 0–1 */
    progress: real('progress').notNull().default(0),
    /** Reader position: an EPUB CFI (reflowable) or section CFI (PDF). */
    location: text('location'),
    chapterLabel: text('chapter_label'),
    addedAt: integer('added_at').notNull(),
    startedAt: integer('started_at'),
    lastReadAt: integer('last_read_at'),
    finishedAt: integer('finished_at'),
  },
  (t) => [index('books_category_idx').on(t.categoryId), index('books_last_read_idx').on(t.lastReadAt)],
);

export const highlights = sqliteTable(
  'highlights',
  {
    id: text('id').primaryKey(),
    bookId: text('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    /** CFI range of the highlighted text. */
    location: text('location').notNull(),
    page: integer('page').notNull().default(0),
    /** 0–1 position in the book, for page-order sorting. */
    position: real('position').notNull().default(0),
    color: text('color').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [index('highlights_book_idx').on(t.bookId)],
);

export const dictionaryCache = sqliteTable('dictionary_cache', {
  word: text('word').primaryKey(),
  /** JSON of the parsed entry, or null when the word was not found. */
  entry: text('entry'),
  fetchedAt: integer('fetched_at').notNull(),
});

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Highlight = typeof highlights.$inferSelect;
