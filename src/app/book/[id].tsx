import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Alert, StyleSheet, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  BookCover,
  IconButton,
  IconTile,
  ProgressBar,
  Screen,
  ScreenHeader,
  Txt,
  pageLabel,
} from '@/components';
import { deleteBook, markFinished, useBook } from '@/db/books';
import { getCategory } from '@/db/categories';
import { iconFor } from '@/features/categories/icons';
import { formatDate, relativeDay } from '@/lib/dates';
import { formatLabel } from '@/library/formats';
import { font } from '@/theme';

/** Screen 20 · Book detail */
export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useBook(id);

  if (!book)
    return (
      <Screen
        header={<ScreenHeader left={<IconButton icon={ChevronLeft} label="Back" onPress={() => router.back()} />} />}>
        {null}
      </Screen>
    );

  const category = book.categoryId ? getCategory(book.categoryId) : undefined;
  const started = book.progress > 0 || !!book.lastReadAt;
  const read = () => router.push({ pathname: '/reader/[id]', params: { id: book.id } });

  const confirmDelete = () =>
    Alert.alert('Delete this book?', `“${book.title}” and its highlights will be removed from this phone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          router.back();
          await deleteBook(book);
        },
      },
    ]);

  const history = [
    book.lastReadAt ? `Last read ${relativeDay(book.lastReadAt)}` : null,
    book.finishedAt
      ? `Finished ${formatDate(book.finishedAt)}`
      : book.startedAt
        ? `Started ${formatDate(book.startedAt)}`
        : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Screen
      bottomInset
      contentStyle={styles.body}
      header={<ScreenHeader left={<IconButton icon={ChevronLeft} label="Back" onPress={() => router.back()} />} />}>
      <View style={styles.top}>
        <BookCover book={book} size="lg" />
        <View style={styles.meta}>
          <Txt style={font(26, 1.2, '700', -0.02)} numberOfLines={4}>
            {book.title}
          </Txt>
          {!!book.author && <Txt variant="body">{book.author}</Txt>}
          <View style={styles.badges}>
            <Badge tone="paper">{formatLabel(book.format)}</Badge>
            {book.pageCount > 0 && <Badge tone="paper">{`${book.pageCount} PAGES`}</Badge>}
            {book.finishedAt && <Badge tone="go">DONE</Badge>}
          </View>
          {category && (
            <View style={styles.category}>
              <IconTile icon={iconFor(category.icon)} color={category.color} size={32} iconSize={18} />
              <Txt variant="label">{category.name}</Txt>
            </View>
          )}
        </View>
      </View>

      <Card padding={16} style={styles.progressCard}>
        <View style={styles.progressTop}>
          <Txt style={font(36, 1, '800', -0.035)}>{Math.round(book.progress * 100)}%</Txt>
          <Txt variant="label">{pageLabel(book)}</Txt>
        </View>
        <ProgressBar value={book.progress} />
        <Txt variant="captionRegular">{history || 'Not started yet'}</Txt>
      </Card>

      <Button size="lg" block onPress={read}>
        {book.finishedAt ? 'Read Again' : started ? 'Continue Reading' : 'Start Reading'}
      </Button>

      <View style={styles.grid}>
        <View style={styles.row}>
          <Button
            tone="paper"
            block
            style={styles.half}
            onPress={() => router.push({ pathname: '/highlights/[id]', params: { id: book.id } })}>
            View Highlights
          </Button>
          <Button
            tone="paper"
            block
            style={styles.half}
            onPress={() => router.push({ pathname: '/assign/[id]', params: { id: book.id } })}>
            Change Category
          </Button>
        </View>
        <View style={styles.row}>
          <Button tone="paper" block style={styles.half} onPress={() => markFinished(book.id, !book.finishedAt)}>
            {book.finishedAt ? 'Mark as Unread' : 'Mark as Finished'}
          </Button>
          <Button tone="paper" block style={styles.half} onPress={confirmDelete}>
            Delete
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 18 },
  top: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  meta: { flex: 1, minWidth: 0, gap: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  category: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressCard: { gap: 12 },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  grid: { gap: 14 },
  row: { flexDirection: 'row', gap: 14 },
  half: { flex: 1 },
});
