import { and, desc, eq, gt, isNotNull, isNull, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { deleteBookFile, deleteCoverFile } from '@/library/storage';

import { db } from './client';
import { books, type Book, type NewBook } from './schema';

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export async function insertBook(book: NewBook) {
  await db.insert(books).values(book);
}

export function getBook(id: string): Book | undefined {
  return db.select().from(books).where(eq(books.id, id)).get();
}

export function useBook(id: string) {
  const { data } = useLiveQuery(db.select().from(books).where(eq(books.id, id)), [id]);
  return data?.[0];
}

export function useAllBooks() {
  return useLiveQuery(db.select().from(books).orderBy(desc(books.addedAt))).data ?? [];
}

/** Books opened but not finished, most recently read first. */
export function useContinueReading() {
  return (
    useLiveQuery(
      db
        .select()
        .from(books)
        .where(and(isNotNull(books.lastReadAt), isNull(books.finishedAt), gt(books.progress, 0)))
        .orderBy(desc(books.lastReadAt)),
    ).data ?? []
  );
}

export function useFinishedBooks() {
  return (
    useLiveQuery(db.select().from(books).where(isNotNull(books.finishedAt)).orderBy(desc(books.finishedAt)))
      .data ?? []
  );
}

export type ReadingPosition = {
  location: string;
  progress: number;
  currentPage: number;
  pageCount: number;
  chapterLabel: string | null;
};

/** Saves where the reader is. Called (debounced) as the reader turns pages. */
export async function saveReadingPosition(id: string, raw: ReadingPosition) {
  const now = Date.now();
  // NaN from the page engine arrives as null over the bridge; never write it.
  const num = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);
  if (!raw.location) return;
  const pos = {
    ...raw,
    progress: Math.min(1, Math.max(0, num(raw.progress))),
    currentPage: Math.max(0, Math.round(num(raw.currentPage))),
    pageCount: Math.max(0, Math.round(num(raw.pageCount))),
  };
  await db
    .update(books)
    .set({
      location: pos.location,
      progress: pos.progress,
      currentPage: pos.currentPage,
      ...(pos.pageCount > 0 ? { pageCount: pos.pageCount } : {}),
      chapterLabel: pos.chapterLabel,
      lastReadAt: now,
      startedAt: sql`coalesce(${books.startedAt}, ${now})`,
    })
    .where(eq(books.id, id));
}

export async function markFinished(id: string, finished: boolean) {
  await db
    .update(books)
    .set({ finishedAt: finished ? Date.now() : null })
    .where(eq(books.id, id));
}

export async function setBookCategory(id: string, categoryId: string | null) {
  await db.update(books).set({ categoryId }).where(eq(books.id, id));
}

export async function deleteBook(book: Book) {
  await db.delete(books).where(eq(books.id, book.id));
  deleteBookFile(book.fileName);
  deleteCoverFile(book.coverFile);
}

export async function setBookCover(id: string, coverFile: string | null) {
  await db.update(books).set({ coverFile, coverChecked: true }).where(eq(books.id, id));
}

/** Books whose cover extraction hasn't been tried yet (imported before covers existed). */
export function booksNeedingCover(): Book[] {
  return db.select().from(books).where(eq(books.coverChecked, false)).all();
}
