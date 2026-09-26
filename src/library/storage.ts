import { Directory, File, Paths } from 'expo-file-system';

/** Imported books live in app-private storage, so they survive the source file being moved or deleted. */
export const booksDir = () => {
  const dir = new Directory(Paths.document, 'books');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
};

export const bookFile = (fileName: string) => new File(booksDir(), fileName);

export function deleteBookFile(fileName: string) {
  try {
    const file = bookFile(fileName);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('Could not delete book file', e);
  }
}

/** Cover thumbnails extracted on import. */
export const coversDir = () => {
  const dir = new Directory(Paths.document, 'covers');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
};

export const coverFile = (fileName: string) => new File(coversDir(), fileName);

/** Saves a base64 JPEG cover and returns its file name. */
export function saveCover(bookId: string, base64: string) {
  const name = `${bookId}.jpg`;
  coverFile(name).write(base64, { encoding: 'base64' });
  return name;
}

export function deleteCoverFile(fileName: string | null) {
  if (!fileName) return;
  try {
    const file = coverFile(fileName);
    if (file.exists) file.delete();
  } catch {}
}

/** Total size of imported books in bytes. */
export const libraryBytes = () => booksDir().size ?? 0;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
