import type { Book } from '@/db/schema';
import { coverFile } from '@/library/storage';

import { Cover, type CoverSize } from './Cover';

type Props = {
  book: Pick<Book, 'title' | 'author' | 'color' | 'coverFile'>;
  size?: CoverSize;
};

/** A book's cover: its own artwork when it has one, else the typographic cover. */
export function BookCover({ book, size = 'md' }: Props) {
  return (
    <Cover
      title={book.title}
      author={book.author}
      color={book.color}
      size={size}
      image={book.coverFile ? coverFile(book.coverFile).uri : null}
    />
  );
}
