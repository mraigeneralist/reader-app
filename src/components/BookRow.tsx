import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import type { Book } from '@/db/schema';

import { Card } from './Card';
import { BookCover } from './BookCover';
import { ProgressBar } from './ProgressBar';
import { Txt } from './Txt';

type Props = {
  book: Book;
  onPress?: () => void;
  onLongPress?: () => void;
  /** Replaces the progress block (badges, finished date…). */
  footer?: ReactNode;
  title?: ReactNode;
  author?: ReactNode;
};

/** Page position as the design writes it: "Page 204 of 305". */
export const pageLabel = (book: Pick<Book, 'currentPage' | 'pageCount'>) =>
  book.pageCount > 0 ? `Page ${Math.max(1, book.currentPage)} of ${book.pageCount}` : '';

export function BookProgress({ book }: { book: Book }) {
  return (
    <View style={styles.progress}>
      <ProgressBar value={book.progress} />
      <View style={styles.progressLabels}>
        <Txt variant="label">{Math.round(book.progress * 100)}%</Txt>
        <Txt variant="caption">{pageLabel(book)}</Txt>
      </View>
    </View>
  );
}

/**
 * Compact book card: small cover, title, author and progress (screens 06, 09, 13, 14).
 * Titles stop at two lines, and every row is as tall as a two-line title needs, so a
 * long title doesn't make its card bigger than its neighbours.
 */
export function BookRow({ book, onPress, onLongPress, footer, title, author }: Props) {
  const progress = footer ?? <BookProgress book={book} />;
  return (
    <Card padding={12} onPress={onPress} onLongPress={onLongPress} accessibilityLabel={book.title}>
      <View style={styles.row}>
        <BookCover book={book} size="sm" />
        <View style={styles.info}>
          {/* Invisible two-line layout that sets the row height (tracks the system font size). */}
          <View style={styles.ghost} pointerEvents="none" importantForAccessibility="no-hide-descendants">
            <Txt variant="bookTitle" numberOfLines={2}>
              {'W\nW'}
            </Txt>
            <Txt variant="author">W</Txt>
            {progress}
          </View>
          <View style={styles.content}>
            {title ?? (
              <Txt variant="bookTitle" numberOfLines={2}>
                {book.title}
              </Txt>
            )}
            {author ??
              (!!book.author && (
                <Txt variant="author" numberOfLines={1}>
                  {book.author}
                </Txt>
              ))}
            {progress}
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  info: { flex: 1, minWidth: 0 },
  ghost: { gap: 6, opacity: 0 },
  content: { ...StyleSheet.absoluteFill, justifyContent: 'center', gap: 6 },
  progress: { gap: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
});
