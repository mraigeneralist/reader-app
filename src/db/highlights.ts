import { asc, desc, eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { newId } from './books';
import { db } from './client';
import { highlights, type Highlight } from './schema';

export function useHighlights(bookId: string, order: 'page' | 'newest' = 'page') {
  const { data } = useLiveQuery(
    db
      .select()
      .from(highlights)
      .where(eq(highlights.bookId, bookId))
      .orderBy(order === 'page' ? asc(highlights.position) : desc(highlights.createdAt)),
    [bookId, order],
  );
  return data ?? [];
}

export function getHighlights(bookId: string): Highlight[] {
  return db.select().from(highlights).where(eq(highlights.bookId, bookId)).all();
}

export async function addHighlight(input: Omit<Highlight, 'id' | 'createdAt'>) {
  const row = { ...input, id: newId(), createdAt: Date.now() };
  await db.insert(highlights).values(row);
  return row;
}

export async function deleteHighlight(id: string) {
  await db.delete(highlights).where(eq(highlights.id, id));
}
