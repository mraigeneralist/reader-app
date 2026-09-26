import { Directory, Paths } from 'expo-file-system';

import { db } from '@/db/client';
import { books, categories, dictionaryCache, highlights, settings } from '@/db/schema';

/** Removes a folder in app storage, if it exists. */
const removeDir = (dir: Directory) => {
  try {
    if (dir.exists) dir.delete();
  } catch (e) {
    console.warn(`Could not delete ${dir.uri}`, e);
  }
};

/**
 * Returns Shelf to a fresh install: deletes every imported book and cover,
 * all reading progress, highlights, categories, saved dictionary lookups and
 * settings (including "onboarded", so the introduction shows again).
 */
export async function resetApp() {
  await db.transaction(async (tx) => {
    await tx.delete(highlights);
    await tx.delete(books);
    await tx.delete(categories);
    await tx.delete(dictionaryCache);
    await tx.delete(settings);
  });
  removeDir(new Directory(Paths.document, 'books'));
  removeDir(new Directory(Paths.document, 'covers'));
  removeDir(new Directory(Paths.document, 'dev-samples'));
  removeDir(new Directory(Paths.cache, 'DocumentPicker'));
}
