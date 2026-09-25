import { Plus, Search, Settings } from 'lucide-react-native';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Cover, IconButton, ScreenHeader, TextLink, Txt } from '@/components';
import { continueReading, recentlyAdded } from '@/data/sample';
import { ContinueCard } from '@/features/home/ContinueCard';
import { layout } from '@/theme';

/** Screen 06 · Home */
export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader
        left={<IconButton icon={Settings} label="Settings" onPress={() => router.navigate('/settings')} />}
        right={
          <>
            <IconButton icon={Search} label="Search" />
            <IconButton icon={Plus} label="Import book" tone="primary" />
          </>
        }
      />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Txt variant="display">Keep reading.</Txt>

        <View style={styles.section}>
          <Txt variant="title">Continue Reading</Txt>
          {continueReading.map((book, i) => (
            <ContinueCard key={book.id} book={book} featured={i === 0} />
          ))}
        </View>

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
            {recentlyAdded.map((book) => (
              <Cover key={book.id} title={book.title} author={book.author} color={book.color} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: {
    paddingHorizontal: layout.gutter,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 22,
  },
  section: { gap: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  // Bleed the horizontal shelf to the screen edge; the padding keeps hard shadows visible.
  coverScroller: { marginHorizontal: -layout.gutter },
  coverRow: { gap: 14, paddingHorizontal: layout.gutter, paddingBottom: 6 },
});
