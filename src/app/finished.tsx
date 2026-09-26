import { router } from 'expo-router';
import { ChevronLeft, CircleCheck, Search } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Badge, BookRow, Icon, IconButton, Screen, ScreenHeader, Txt } from '@/components';
import { useFinishedBooks } from '@/db/books';
import { formatDate, isToday } from '@/lib/dates';

/** Screen 13 · Finished Books */
export default function FinishedScreen() {
  const books = useFinishedBooks();
  const year = new Date().getFullYear();
  const thisYear = books.filter((b) => new Date(b.finishedAt!).getFullYear() === year).length;

  return (
    <Screen
      bottomInset
      contentStyle={styles.body}
      header={
        <ScreenHeader
          left={<IconButton icon={ChevronLeft} label="Back" onPress={() => router.back()} />}
          right={<IconButton icon={Search} label="Search" onPress={() => router.push('/search')} />}
        />
      }>
      <View style={styles.title}>
        <Txt variant="pageTitle">Finished</Txt>
        <Txt variant="subtitle">
          {books.length === 0
            ? 'Books you finish show up here.'
            : `${thisYear} ${thisYear === 1 ? 'book' : 'books'} finished in ${year}`}
        </Txt>
      </View>
      {books.map((book) => (
        <BookRow
          key={book.id}
          book={book}
          onPress={() => router.push({ pathname: '/book/[id]', params: { id: book.id } })}
          footer={
            <>
              <View style={styles.date}>
                <Icon icon={CircleCheck} size={20} />
                <Txt variant="caption">Finished {formatDate(book.finishedAt!)}</Txt>
              </View>
              {isToday(book.finishedAt!) && <Badge tone="new">TODAY</Badge>}
            </>
          }
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { gap: 12 },
  title: { gap: 4, marginBottom: 4 },
  date: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
