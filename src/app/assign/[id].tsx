import { router, useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button, Check, IconTile, Txt } from '@/components';
import { RouteSheet } from '@/components/RouteSheet';
import { setBookCategory, useBook } from '@/db/books';
import { useCategories, useUnsortedCount } from '@/db/categories';
import { iconFor } from '@/features/categories/icons';
import { border, colors, font, palette, themed } from '@/theme';

function Row({
  name,
  color,
  icon,
  count,
  checked,
  onPress,
}: {
  name: string;
  color: string;
  icon: string;
  count: number;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row} accessibilityRole="radio" accessibilityState={{ checked }}>
      <IconTile icon={iconFor(icon)} color={color} size={40} iconSize={22} />
      <View style={styles.rowText}>
        <Txt style={font(17, 1.2, '700', -0.02)}>{name}</Txt>
        <Txt variant="captionRegular">
          {count} {count === 1 ? 'book' : 'books'}
        </Txt>
      </View>
      <Check checked={checked} shape="round" />
    </Pressable>
  );
}

/** Screen 12 · Move to Category */
export default function AssignCategory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useBook(id);
  const categories = useCategories();
  const unsorted = useUnsortedCount();
  if (!book) return null;

  const choose = (categoryId: string | null) => setBookCategory(book.id, categoryId);

  return (
    <RouteSheet>
      <View style={styles.title}>
        <Txt variant="sheetTitle">Move to Category</Txt>
        <Txt variant="subtitle" numberOfLines={1}>
          {book.title}
        </Txt>
      </View>
      <View>
        {categories.map((c) => (
          <Row
            key={c.id}
            name={c.name}
            color={c.color}
            icon={c.icon}
            count={c.bookCount}
            checked={book.categoryId === c.id}
            onPress={() => choose(c.id)}
          />
        ))}
        <Row
          name="Unsorted"
          color={palette.gray}
          icon="inbox"
          count={unsorted}
          checked={book.categoryId == null}
          onPress={() => choose(null)}
        />
      </View>
      <Pressable
        style={styles.newRow}
        accessibilityRole="button"
        onPress={() => router.push({ pathname: '/category-editor', params: { assign: book.id } })}>
        <IconTile icon={Plus} color={colors.white} size={40} iconSize={22} />
        <Txt style={font(17, 1.2, '700', -0.02)}>New category</Txt>
      </Pressable>
      <Button block onPress={() => router.back()}>
        Done
      </Button>
    </RouteSheet>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    title: { gap: 4 },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
      borderBottomWidth: border.width,
      borderBottomColor: colors.black,
    },
    rowText: { flex: 1, gap: 2 },
    newRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  }),
);
