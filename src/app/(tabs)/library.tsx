import { router } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip, BookCover, IconButton, ProgressBar, ScreenHeader, TextLink, Txt } from '@/components';
import { useAllBooks } from '@/db/books';
import { useCategories } from '@/db/categories';
import type { Book } from '@/db/schema';
import { SORTS, sortBooks, type SortKey } from '@/features/library/sortBooks';
import { EmptyShelf } from '@/features/home/EmptyShelf';
import { layout } from '@/theme';

const UNSORTED = '__unsorted';

function GridItem({ book }: { book: Book }) {
  return (
    <Pressable
      style={styles.item}
      onPress={() => router.push({ pathname: '/book/[id]', params: { id: book.id } })}
      accessibilityRole="button"
      accessibilityLabel={book.title}>
      <BookCover book={book} size="md" />
      {/* Fixed slots (two title lines, one author line) keep rows aligned whatever the title length. */}
      <View style={styles.titleSlot}>
        <Txt variant="label" style={styles.itemTitle} numberOfLines={2}>
          {book.title}
        </Txt>
      </View>
      <View style={styles.authorSlot}>
        <Txt variant="captionRegular" numberOfLines={1}>
          {book.author}
        </Txt>
      </View>
      <ProgressBar value={book.progress} size="sm" />
    </Pressable>
  );
}

/** Screen 07 · My Library */
export default function LibraryScreen() {
  const all = useAllBooks();
  const cats = useCategories();
  const { width } = useWindowDimensions();
  // Three 104px covers; a fixed gap keeps a short last row aligned left.
  const columnGap = Math.max(8, Math.floor((width - layout.gutter * 2 - 3 * 104) / 2));
  const [sort, setSort] = useState<SortKey>('recent');
  const [category, setCategory] = useState<string | null>(null);

  const filtered = all.filter((b) =>
    category == null ? true : category === UNSORTED ? b.categoryId == null : b.categoryId === category,
  );
  const shown = sortBooks(filtered, sort);

  const header = (
    <View style={styles.filters}>
      <View style={styles.group}>
        <Txt variant="label">Sort by</Txt>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.bleed}>
          {SORTS.map((s) => (
            <Chip key={s.value} label={s.label} selected={sort === s.value} onPress={() => setSort(s.value)} />
          ))}
        </ScrollView>
      </View>
      <View style={styles.group}>
        <Txt variant="label">Category</Txt>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.bleed}>
          <Chip label="All" selected={category == null} onPress={() => setCategory(null)} />
          {cats.map((c) => (
            <Chip key={c.id} label={c.name} selected={category === c.id} onPress={() => setCategory(c.id)} />
          ))}
          <Chip label="Unsorted" selected={category === UNSORTED} onPress={() => setCategory(UNSORTED)} />
        </ScrollView>
      </View>
      <View style={styles.countRow}>
        <Txt variant="label">
          {shown.length} {shown.length === 1 ? 'book' : 'books'}
        </Txt>
        <TextLink size={14} onPress={() => router.push('/finished')}>
          Finished books
        </TextLink>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader
        left={<Txt variant="pageTitle">My Library</Txt>}
        right={
          <>
            <IconButton icon={Search} label="Search" onPress={() => router.push('/search')} />
            <IconButton icon={Plus} label="Import book" tone="primary" onPress={() => router.push('/import')} />
          </>
        }
      />
      {all.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyBody}>
          <EmptyShelf onImport={() => router.push('/import')} />
        </ScrollView>
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(b) => b.id}
          numColumns={3}
          ListHeaderComponent={header}
          renderItem={({ item }) => <GridItem book={item} />}
          columnWrapperStyle={{ gap: columnGap }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.none}>
              <Txt variant="body">No books in this category yet.</Txt>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  filters: { gap: 16, paddingBottom: 16 },
  group: { gap: 8 },
  chips: { gap: 8, paddingHorizontal: layout.gutter, paddingBottom: 4 },
  bleed: { marginHorizontal: -layout.gutter },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  list: { paddingHorizontal: layout.gutter, paddingTop: 4, paddingBottom: 28, gap: 18 },
  item: { width: 104, gap: 6 },
  itemTitle: { fontSize: 14, lineHeight: 17 },
  titleSlot: { height: 34, justifyContent: 'flex-start' },
  authorSlot: { height: 17, justifyContent: 'center' },
  none: { paddingTop: 24 },
  emptyBody: { paddingHorizontal: layout.gutter, paddingTop: 8 },
});
