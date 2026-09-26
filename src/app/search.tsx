import { router } from 'expo-router';
import { Search, SearchX, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookRow, Button, Icon, IconTile, Screen, Txt } from '@/components';
import { Input } from '@/components/Input';
import { useAllBooks } from '@/db/books';
import { useCategories } from '@/db/categories';
import type { Book } from '@/db/schema';
import { colors, font, layout, palette, text, themed } from '@/theme';

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Renders text with the matched part on a yellow highlight, like the design. */
function Marked({ value, query, style }: { value: string; query: string; style: object }) {
  const i = fold(value).indexOf(fold(query));
  if (i < 0 || !query) return <Text style={style}>{value}</Text>;
  return (
    <Text style={style}>
      {value.slice(0, i)}
      <Text style={styles.mark}>{value.slice(i, i + query.length)}</Text>
      {value.slice(i + query.length)}
    </Text>
  );
}

/** Screens 14–15 · Search titles and authors. */
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const books = useAllBooks();
  const categories = useCategories();
  const q = query.trim();
  const categoryName = (b: Book) => categories.find((c) => c.id === b.categoryId)?.name ?? 'Unsorted';

  const titles = q ? books.filter((b) => fold(b.title).includes(fold(q))) : [];
  const authors = q ? books.filter((b) => !titles.includes(b) && fold(b.author).includes(fold(q))) : [];

  const result = (b: Book) => (
    <BookRow
      key={b.id}
      book={b}
      onPress={() => router.push({ pathname: '/book/[id]', params: { id: b.id } })}
      title={<Marked value={b.title} query={q} style={font(16, 1.2, '700', -0.02)} />}
      author={b.author ? <Marked value={b.author} query={q} style={text.author} /> : undefined}
      footer={<Txt variant="label">{categoryName(b)}</Txt>}
    />
  );

  return (
    <Screen
      bottomInset
      contentStyle={styles.body}
      header={
        <View style={styles.header}>
          <Input
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Search titles and authors"
            returnKeyType="search"
            containerStyle={styles.input}
            leading={<Icon icon={Search} size={22} />}
            trailing={
              query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
                  <Icon icon={X} size={20} />
                </Pressable>
              ) : undefined
            }
          />
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
            <Txt variant="link" style={styles.cancel}>
              Cancel
            </Txt>
          </Pressable>
        </View>
      }>
      {q && titles.length + authors.length === 0 ? (
        <View style={styles.none}>
          <IconTile icon={SearchX} color={palette.gray} size={72} iconSize={32} />
          <Txt variant="displaySm">No books match.</Txt>
          <Txt variant="body">
            Nothing in your library has “{q}” in its title or author. Check the spelling, or import the book.
          </Txt>
          <Button tone="paper" size="lg" block onPress={() => router.replace('/import')}>
            Import a book
          </Button>
        </View>
      ) : (
        <>
          {titles.length > 0 && (
            <View style={styles.group}>
              <Txt variant="overline">TITLES · {titles.length}</Txt>
              {titles.map(result)}
            </View>
          )}
          {authors.length > 0 && (
            <View style={styles.group}>
              <Txt variant="overline">AUTHORS · {authors.length}</Txt>
              {authors.map(result)}
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: layout.gutter,
      paddingTop: 14,
      paddingBottom: 18,
    },
    input: { flex: 1 },
    cancel: { fontSize: 16 },
    body: { gap: 20 },
    group: { gap: 12 },
    mark: { backgroundColor: colors.yellow, color: colors.textOnAccent },
    none: { gap: 18, paddingTop: 80, alignItems: 'flex-start' },
  }),
);
