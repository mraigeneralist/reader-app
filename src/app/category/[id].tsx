import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Pencil } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, BookRow, Chip, FitText, IconButton, IconTile, Screen, ScreenHeader, Txt } from '@/components';
import { useAllBooks } from '@/db/books';
import { useCategories } from '@/db/categories';
import type { Book } from '@/db/schema';
import { iconFor } from '@/features/categories/icons';
import { sortBooks, type SortKey } from '@/features/library/sortBooks';
import { formatDate } from '@/lib/dates';
import { palette } from '@/theme';

function StatusFooter({ book }: { book: Book }) {
  if (book.finishedAt)
    return (
      <View style={styles.status}>
        <Badge tone="go">DONE</Badge>
        <Txt variant="captionRegular">Finished {formatDate(book.finishedAt)}</Txt>
      </View>
    );
  if (!book.lastReadAt)
    return (
      <View style={styles.status}>
        <Badge tone="new">NEW</Badge>
        <Txt variant="captionRegular">Not started</Txt>
      </View>
    );
  return undefined;
}

/** Screen 09 · One category's books ("unsorted" for books without a category). */
export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const all = useAllBooks();
  const category = useCategories().find((c) => c.id === id);
  const [sort, setSort] = useState<SortKey>('recent');

  const isUnsorted = id === 'unsorted';
  const books = sortBooks(
    all.filter((b) => (isUnsorted ? b.categoryId == null : b.categoryId === id)),
    sort,
  );
  const finished = books.filter((b) => b.finishedAt).length;
  const name = isUnsorted ? 'Unsorted' : (category?.name ?? '');

  return (
    <Screen
      bottomInset
      contentStyle={styles.body}
      header={
        <ScreenHeader
          left={<IconButton icon={ChevronLeft} label="Back" onPress={() => router.back()} />}
          right={
            !isUnsorted && (
              <IconButton
                icon={Pencil}
                label="Edit category"
                onPress={() => router.push({ pathname: '/category-editor', params: { id } })}
              />
            )
          }
        />
      }>
      <View style={styles.title}>
        <IconTile
          icon={iconFor(isUnsorted ? 'inbox' : category?.icon)}
          color={isUnsorted ? palette.gray : (category?.color ?? palette.gray)}
          size={64}
          iconSize={30}
        />
        <View style={styles.titleText}>
          <FitText variant="pageTitle" numberOfLines={2}>
            {name}
          </FitText>
          <Txt variant="subtitle">
            {books.length} {books.length === 1 ? 'book' : 'books'}
            {finished ? ` · ${finished} finished` : ''}
          </Txt>
        </View>
      </View>
      <View style={styles.chips}>
        {(['recent', 'title', 'progress'] as const).map((k) => (
          <Chip key={k} label={k[0].toUpperCase() + k.slice(1)} selected={sort === k} onPress={() => setSort(k)} />
        ))}
      </View>
      {books.length === 0 && (
        <Txt variant="body">No books here yet. Open a book’s details and tap Change Category to add it.</Txt>
      )}
      {books.map((b) => (
        <BookRow
          key={b.id}
          book={b}
          onPress={() => router.push({ pathname: '/book/[id]', params: { id: b.id } })}
          footer={StatusFooter({ book: b })}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 14 },
  title: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  titleText: { flex: 1, gap: 4 },
  chips: { flexDirection: 'row', gap: 8 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
