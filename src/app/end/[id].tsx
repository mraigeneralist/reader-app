import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, BookCover, TextLink, Txt } from '@/components';
import { markFinished, useBook } from '@/db/books';
import { formatDate } from '@/lib/dates';
import { colors, layout, palette, themed } from '@/theme';

/** Screen 30 · End of book */
export default function EndOfBookScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useBook(id);
  if (!book) return null;

  const undo = async () => {
    await markFinished(book.id, false);
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.circle} />
      <View style={styles.block} />
      <View style={styles.body}>
        <View style={styles.cover}>
          <BookCover book={book} size="lg" />
        </View>
        <Badge tone="go">FINISHED</Badge>
        <Txt variant="displayLg">{'The end.\nWell read.'}</Txt>
        <Txt variant="body">
          {book.author ? `${book.title} by ${book.author}` : book.title} is marked as finished and moved to Finished
          Books
          {book.finishedAt ? ` · ${formatDate(book.finishedAt)}` : ''}.
        </Txt>
        <View style={styles.actions}>
          <Button size="lg" block onPress={() => router.replace('/finished')}>
            Go to Finished Books
          </Button>
          <Button tone="paper" size="lg" block onPress={() => router.dismissTo('/library')}>
            Back to Library
          </Button>
          <View style={styles.undo}>
            <TextLink onPress={undo}>Not finished? Undo</TextLink>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.cream, overflow: 'hidden' },
    circle: {
      position: 'absolute',
      left: -120,
      top: 70,
      width: 340,
      height: 340,
      borderRadius: 170,
      backgroundColor: palette.pink,
    },
    block: { position: 'absolute', right: -60, top: 250, width: 200, height: 180, backgroundColor: palette.purple },
    body: { flex: 1, paddingHorizontal: layout.gutter, paddingTop: 40, paddingBottom: 20, gap: 22 },
    cover: { alignSelf: 'center' },
    actions: { marginTop: 'auto', gap: 14 },
    undo: { alignSelf: 'center', paddingTop: 4 },
  }),
);
