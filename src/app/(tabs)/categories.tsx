import { router } from 'expo-router';
import { FolderPlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { IconButton, Screen, ScreenHeader, Txt } from '@/components';
import { useAllBooks } from '@/db/books';
import { useCategories, useUnsortedCount } from '@/db/categories';
import { CategoryCard } from '@/features/categories/CategoryCard';
import { palette } from '@/theme';

/** Screen 08 · Categories */
export default function CategoriesScreen() {
  const categories = useCategories();
  const unsorted = useUnsortedCount();
  const total = useAllBooks().length;

  const tiles = [
    ...categories.map((c) => ({
      key: c.id,
      name: c.name,
      color: c.color,
      icon: c.icon,
      count: c.bookCount,
      onPress: () => router.push({ pathname: '/category/[id]', params: { id: c.id } }),
      onLongPress: () => router.push({ pathname: '/category-editor', params: { id: c.id } }),
    })),
    {
      key: 'unsorted',
      name: 'Unsorted',
      color: palette.gray,
      icon: 'inbox',
      count: unsorted,
      onPress: () => router.push({ pathname: '/category/[id]', params: { id: 'unsorted' } }),
      onLongPress: undefined,
    },
  ];

  // Two-up grid, as in the design.
  const rows: (typeof tiles)[] = [];
  for (let i = 0; i < tiles.length; i += 2) rows.push(tiles.slice(i, i + 2));

  return (
    <Screen
      contentStyle={styles.body}
      header={
        <ScreenHeader
          left={<Txt variant="pageTitle">Categories</Txt>}
          right={
            <IconButton
              icon={FolderPlus}
              label="New category"
              tone="primary"
              onPress={() => router.push('/category-editor')}
            />
          }
        />
      }>
      <Txt variant="subtitle">
        {total} {total === 1 ? 'book' : 'books'} in {categories.length}{' '}
        {categories.length === 1 ? 'category' : 'categories'}
        {categories.length === 0 ? ' · tap + to make one' : ''}
      </Txt>
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={row[0].key} style={styles.row}>
            {row.map(({ key, ...t }) => (
              <View key={key} style={styles.cell}>
                <CategoryCard {...t} />
              </View>
            ))}
            {row.length === 1 && <View style={styles.cell} />}
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 12 },
  grid: { gap: 14, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 14 },
  cell: { flex: 1 },
});
