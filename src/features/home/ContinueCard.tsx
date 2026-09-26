import { StyleSheet, View } from 'react-native';

import { BookProgress, BookRow, Button, Card, BookCover, Txt } from '@/components';
import type { Book } from '@/db/schema';

type Props = {
  book: Book;
  /** The large first card with a Continue button, or a compact row. */
  featured?: boolean;
  onPress?: () => void;
  onOpenDetails?: () => void;
};

/** A book on the Continue Reading shelf (screen 06). */
export function ContinueCard({ book, featured, onPress, onOpenDetails }: Props) {
  if (!featured) return <BookRow book={book} onPress={onPress} onLongPress={onOpenDetails} />;

  return (
    <Card padding={14} onPress={onPress} onLongPress={onOpenDetails} accessibilityLabel={`Continue ${book.title}`}>
      <View style={styles.row}>
        <BookCover book={book} size="md" />
        <View style={styles.info}>
          <View style={styles.names}>
            <Txt variant="title" numberOfLines={3}>
              {book.title}
            </Txt>
            {!!book.author && (
              <Txt variant="body" style={styles.author} numberOfLines={2}>
                {book.author}
              </Txt>
            )}
          </View>
          <BookProgress book={book} />
          <Button tone="primary" size="sm" onPress={onPress}>
            Continue
          </Button>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  info: { flex: 1, minWidth: 0, justifyContent: 'space-between', gap: 14 },
  names: { gap: 4 },
  author: { fontSize: 15 },
});
