import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';

import { insertBook, newId } from '@/db/books';
import type { Book } from '@/db/schema';
import type { EngineHandle } from '@/engine/EngineView';
import { palette } from '@/theme';

import { extensionOf, isConverted, isSupported } from './formats';
import { bookFile, deleteBookFile, deleteCoverFile, saveCover } from './storage';

export type PickedFile = {
  uri: string;
  name: string;
  size: number;
  ext: string;
};

export type ImportStage = 'copying' | 'reading' | 'converting' | 'chapters' | 'saving';

export const STAGE_LABELS: Record<ImportStage, string> = {
  copying: 'Copying file…',
  reading: 'Opening book…',
  converting: 'Converting to a readable format…',
  chapters: 'Reading chapters…',
  saving: 'Adding to your library…',
};

export class ImportError extends Error {}

type EngineResult = {
  title: string;
  author: string;
  language: string;
  pages: number;
  /** Base64 EPUB for formats converted on import. */
  converted: string | null;
  /** Base64 JPEG cover, when the book has one. */
  cover: string | null;
};

const COVER_COLORS = [palette.pink, palette.green, palette.purple, palette.tan, palette.lime];

/** Stable cover colour per title. */
export const coverColor = (title: string) => {
  let h = 0;
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return COVER_COLORS[Math.abs(h) % COVER_COLORS.length];
};

/** Opens the system file picker (device storage, Drive, Dropbox, Downloads…). */
export async function pickFiles(): Promise<PickedFile[] | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    multiple: true,
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  return result.assets.map((a) => ({
    uri: a.uri,
    name: a.name,
    size: a.size ?? 0,
    ext: extensionOf(a.name),
  }));
}

const friendlyError = (e: unknown, ext: string): string => {
  const msg = e instanceof Error ? e.message : String(e);
  if (e instanceof ImportError) return msg;
  if (/password|encrypt|drm/i.test(msg)) return 'This file is locked (DRM or a password), so it can’t be opened.';
  if (/not supported|unsupported|unrecognised/i.test(msg))
    return 'Unsupported format. Save it as PDF or DOCX and try again.';
  if (/no readable text/i.test(msg)) return 'This file has no readable text.';
  if (ext === 'pdf' && /invalid|corrupt|damaged/i.test(msg)) return 'This file is damaged or incomplete.';
  return 'This file is damaged or incomplete.';
};

/**
 * Imports one file: copy into app storage, read metadata (or convert to
 * EPUB) in the engine, and add the book to the library.
 */
export async function importFile(
  engine: EngineHandle,
  file: PickedFile,
  onStage: (stage: ImportStage, fraction: number) => void,
): Promise<Book> {
  const { ext } = file;
  if (!isSupported(ext)) throw new ImportError('Unsupported format. Save it as PDF or DOCX and try again.');

  const id = newId();
  const originalName = `${id}.${ext}`;
  let savedName = originalName;
  try {
    onStage('copying', 0.1);
    new File(file.uri).copy(bookFile(originalName));

    onStage(isConverted(ext) ? 'converting' : 'reading', 0.3);
    const result = await engine.request<EngineResult>(
      'import',
      { url: bookFile(originalName).uri, name: file.name, ext },
      180_000,
    );

    if (result.converted) {
      savedName = `${id}.epub`;
      bookFile(savedName).write(result.converted, { encoding: 'base64' });
      deleteBookFile(originalName);
    }

    onStage('saving', 0.92);
    const coverName = result.cover ? saveCover(id, result.cover) : null;
    const book: Book = {
      id,
      title: result.title,
      author: result.author,
      format: ext,
      sourceName: file.name,
      fileName: savedName,
      fileSize: file.size || bookFile(savedName).size || 0,
      color: coverColor(result.title),
      coverFile: coverName,
      coverChecked: true,
      categoryId: null,
      pageCount: result.pages,
      currentPage: 0,
      progress: 0,
      location: null,
      chapterLabel: null,
      addedAt: Date.now(),
      startedAt: null,
      lastReadAt: null,
      finishedAt: null,
    };
    await insertBook(book);
    onStage('saving', 1);
    return book;
  } catch (e) {
    deleteBookFile(originalName);
    if (savedName !== originalName) deleteBookFile(savedName);
    deleteCoverFile(`${id}.jpg`);
    throw new ImportError(friendlyError(e, ext));
  } finally {
    // The picker's cache copy is no longer needed.
    try {
      const cached = new File(file.uri);
      if (cached.exists) cached.delete();
    } catch {}
  }
}
