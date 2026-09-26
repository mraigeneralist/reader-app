import type { Book } from '@/db/schema';

export type SortKey = 'recent' | 'title' | 'author' | 'progress';

export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'title', label: 'Title' },
  { value: 'author', label: 'Author' },
  { value: 'progress', label: 'Progress' },
];

const collator = new Intl.Collator(undefined, { sensitivity: 'base', numeric: true });
// Sort "The Stoic Morning" under S, as shelves do.
const sortTitle = (t: string) => t.replace(/^(the|a|an)\s+/i, '');

export function sortBooks(list: Book[], key: SortKey): Book[] {
  const books = [...list];
  switch (key) {
    case 'title':
      return books.sort((a, b) => collator.compare(sortTitle(a.title), sortTitle(b.title)));
    case 'author':
      return books.sort((a, b) => collator.compare(a.author || '~', b.author || '~') || collator.compare(a.title, b.title));
    case 'progress':
      return books.sort((a, b) => b.progress - a.progress);
    default:
      // Recently read first, then recently added.
      return books.sort((a, b) => (b.lastReadAt ?? b.addedAt) - (a.lastReadAt ?? a.addedAt));
  }
}
