import { StyleSheet, View } from 'react-native';

import { Button, Card, Cover, ProgressBar, Txt } from '@/components';
import type { SampleBook } from '@/data/sample';

type Props = {
  book: SampleBook;
  /** The large first card with a Continue button, or a compact row. */
  featured?: boolean;
  onPress?: () => void;
};

function Progress({ book }: { book: SampleBook }) {
  const value = book.page / book.pageCount;
  return (
    <View style={styles.progress}>
      <ProgressBar value={value} />
      <View style={styles.progressLabels}>
        <Txt variant="label">{Math.round(value * 100)}%</Txt>
        <Txt variant="caption">
          Page {book.page} of {book.pageCount}
        </Txt>
      </View>
    </View>
  );
}

/** A book on the Continue Reading shelf (screen 06). */
export function ContinueCard({ book, featured, onPress }: Props) {
  if (featured) {
    return (
      <Card padding={14} onPress={onPress} accessibilityLabel={`Continue ${book.title}`}>
        <View style={styles.featuredRow}>
          <Cover title={book.title} author={book.author} color={book.color} size="md" />
          <View style={styles.featuredInfo}>
            <View style={styles.names}>
              <Txt variant="title">{book.title}</Txt>
              <Txt variant="body" style={styles.authorLg}>
                {book.author}
              </Txt>
            </View>
            <Progress book={book} />
            <Button tone="primary" size="sm" onPress={onPress}>
              Continue
            </Button>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card padding={12} onPress={onPress} accessibilityLabel={`Continue ${book.title}`}>
      <View style={styles.compactRow}>
        <Cover title={book.title} author={book.author} color={book.color} size="sm" />
        <View style={styles.compactInfo}>
          <Txt variant="bookTitle">{book.title}</Txt>
          <Txt variant="author">{book.author}</Txt>
          <Progress book={book} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  featuredRow: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  featuredInfo: { flex: 1, minWidth: 0, justifyContent: 'space-between', gap: 14 },
  names: { gap: 4 },
  authorLg: { fontSize: 15 },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  compactInfo: { flex: 1, minWidth: 0, gap: 6 },
  progress: { gap: 6 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
});
