import { asc, count, eq, isNull, sql } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { newId } from './books';
import { db } from './client';
import { books, categories, type Category } from './schema';

export type CategoryWithCounts = Category & { bookCount: number; finishedCount: number };

export function useCategories(): CategoryWithCounts[] {
  const { data } = useLiveQuery(
    db
      .select({
        id: categories.id,
        name: categories.name,
        color: categories.color,
        icon: categories.icon,
        createdAt: categories.createdAt,
        bookCount: sql<number>`count(${books.id})`,
        finishedCount: sql<number>`count(${books.finishedAt})`,
      })
      .from(categories)
      .leftJoin(books, eq(books.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(asc(categories.createdAt)),
  );
  return data ?? [];
}

/** Books without a category ("Unsorted"). */
export function useUnsortedCount() {
  const { data } = useLiveQuery(db.select({ n: count() }).from(books).where(isNull(books.categoryId)));
  return data?.[0]?.n ?? 0;
}

export function getCategory(id: string) {
  return db.select().from(categories).where(eq(categories.id, id)).get();
}

export async function createCategory(input: Pick<Category, 'name' | 'color' | 'icon'>) {
  const id = newId();
  await db.insert(categories).values({ ...input, id, createdAt: Date.now() });
  return id;
}

export async function updateCategory(id: string, input: Pick<Category, 'name' | 'color' | 'icon'>) {
  await db.update(categories).set(input).where(eq(categories.id, id));
}

/** Deletes the category; its books move to Unsorted (their files are untouched). */
export async function deleteCategory(id: string) {
  await db.update(books).set({ categoryId: null }).where(eq(books.categoryId, id));
  await db.delete(categories).where(eq(categories.id, id));
}
