import { Plus, Search, Settings } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BookCover, IconButton, Screen, ScreenHeader, TextLink, Txt } from '@/components';
import { useAllBooks, useContinueReading } from '@/db/books';
import { ContinueCard } from '@/features/home/ContinueCard';
import { EmptyShelf } from '@/features/home/EmptyShelf';
import { layout } from '@/theme';

const openReader = (id: string) => router.push({ pathname: '/reader/[id]', params: { id } });
const openBook = (id: string) => router.push({ pathname: '/book/[id]', params: { id } });
const openImport = () => router.push('/import');

/** Screen 06 · Home (05 when the library is empty). */
export default function HomeScreen() {
  const all = useAllBooks();
  const reading = useContinueReading().slice(0, 3);
  const recent = all.slice(0, 8);
  const empty = all.length === 0;

  return (
    <Screen
      contentStyle={styles.body}
      header={
        <ScreenHeader
          left={<IconButton icon={Settings} label="Settings" onPress={() => router.navigate('/settings')} />}
          right={
            <>
              <IconButton icon={Search} label="Search" onPress={() => router.push('/search')} />
              {!empty && <IconButton icon={Plus} label="Import book" tone="primary" onPress={openImport} />}
            </>
          }
        />
      }>
      {empty ? (
        <EmptyShelf onImport={openImport} />
      ) : (
        <>
          <Txt variant="display">Keep reading.</Txt>

          {reading.length > 0 && (
            <View style={styles.section}>
              <Txt variant="title">Continue Reading</Txt>
              {reading.map((book, i) => (
                <ContinueCard
                  key={book.id}
                  book={book}
                  featured={i === 0}
                  onPress={() => openReader(book.id)}
                  onOpenDetails={() => openBook(book.id)}
                />
              ))}
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Txt variant="title">Recently Added</Txt>
              <TextLink onPress={() => router.navigate('/library')}>See all</TextLink>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.coverRow}
              style={styles.coverScroller}>
              {recent.map((book) => (
                <Pressable
                  key={book.id}
                  onPress={() => openBook(book.id)}
                  accessibilityRole="button"
                  accessibilityLabel={book.title}>
                  <BookCover book={book} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 22 },
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  // Bleed the horizontal shelf to the screen edge; the padding keeps hard shadows visible.
  coverScroller: { marginHorizontal: -layout.gutter },
  coverRow: { gap: 14, paddingHorizontal: layout.gutter, paddingBottom: 6 },
});
