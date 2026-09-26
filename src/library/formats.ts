/** Formats the reader engine opens directly. */
const NATIVE = ['epub', 'pdf', 'mobi', 'azw3', 'azw', 'prc', 'fb2', 'fbz', 'cbz'] as const;
/** Formats converted to EPUB on import. */
const CONVERTED = ['docx', 'doc', 'txt', 'md', 'markdown', 'rtf', 'html', 'htm'] as const;

export type BookFormat = (typeof NATIVE)[number] | (typeof CONVERTED)[number];

/** Shown as badges on the error screen and the empty state. */
export const SUPPORTED_BADGES = ['PDF', 'EPUB', 'MOBI', 'AZW3', 'DOC', 'DOCX', 'TXT', 'RTF', 'FB2'];

export const extensionOf = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.endsWith('.fb2.zip')) return 'fbz';
  const m = /\.([a-z0-9]+)$/.exec(lower);
  return m?.[1] ?? '';
};

export const isSupported = (ext: string): ext is BookFormat =>
  (NATIVE as readonly string[]).includes(ext) || (CONVERTED as readonly string[]).includes(ext);

export const isConverted = (ext: string) => (CONVERTED as readonly string[]).includes(ext);

export const formatLabel = (ext: string) => (ext === 'fbz' ? 'FB2' : ext === 'markdown' ? 'MD' : ext.toUpperCase());
