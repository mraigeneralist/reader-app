import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Highlighter, Share as ShareIcon, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Chip, IconButton, IconTile, Screen, ScreenHeader, Txt } from '@/components';
import { useBook } from '@/db/books';
import { deleteHighlight, useHighlights } from '@/db/highlights';
import { formatDate } from '@/lib/dates';
import { colors, font, palette, themed } from '@/theme';

/** Screens 31–32 · All highlights for a book. */
export default function HighlightsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useBook(id);
  const [order, setOrder] = useState<'page' | 'newest'>('page');
  const list = useHighlights(id, order);

  const jumpTo = (location: string) => router.dismissTo({ pathname: '/reader/[id]', params: { id, target: location } });

  const exportAll = () =>
    Share.share({
      title: `Highlights · ${book?.title ?? ''}`,
      message: [
        `${book?.title ?? ''}${book?.author ? ` — ${book.author}` : ''}`,
        '',
        ...list.map((h) => `“${h.text}”\n(Page ${h.page} · ${formatDate(h.createdAt)})`),
      ].join('\n\n'),
    });

  return (
    <Screen
      bottomInset
      contentStyle={styles.body}
      header={
        <ScreenHeader
          left={<IconButton icon={ChevronLeft} label="Back to book" onPress={() => router.back()} />}
          right={list.length > 0 && <IconButton icon={ShareIcon} label="Export highlights" onPress={exportAll} />}
        />
      }>
      <View style={styles.title}>
        <Txt variant="pageTitle">Highlights</Txt>
        <Txt variant="subtitle" numberOfLines={1}>
          {book?.title ?? ''}
          {list.length ? ` · ${list.length} ${list.length === 1 ? 'highlight' : 'highlights'}` : ''}
        </Txt>
      </View>

      {list.length === 0 ? (
        <View style={styles.empty}>
          <IconTile icon={Highlighter} color={palette.yellow} size={72} iconSize={32} />
          <Txt variant="displaySm">No highlights yet.</Txt>
          <Txt variant="body">Press and hold any passage while reading, then tap Highlight. It will show up here.</Txt>
          <Button tone="paper" size="lg" block onPress={() => router.back()}>
            Back to book
          </Button>
        </View>
      ) : (
        <>
          <View style={styles.chips}>
            <Chip label="Page order" selected={order === 'page'} onPress={() => setOrder('page')} />
            <Chip label="Newest" selected={order === 'newest'} onPress={() => setOrder('newest')} />
          </View>
          {list.map((h) => (
            <Card
              key={h.id}
              padding={14}
              onPress={() => jumpTo(h.location)}
              accessibilityLabel={`Go to highlight on page ${h.page}`}>
              <View style={styles.card}>
                <Text style={font(16, 1.4, '600')}>
                  <Text style={{ backgroundColor: h.color || colors.highlight, color: colors.textOnAccent }}>{h.text}</Text>
                </Text>
                <View style={styles.meta}>
                  <Txt variant="label">
                    Page {h.page} · {formatDate(h.createdAt)}
                  </Txt>
                  <IconButton
                    icon={Trash2}
                    iconSize={20}
                    label="Delete highlight"
                    onPress={() => deleteHighlight(h.id)}
                  />
                </View>
              </View>
            </Card>
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    body: { gap: 14 },
    title: { gap: 4 },
    chips: { flexDirection: 'row', gap: 8 },
    card: { gap: 10 },
    meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    empty: { gap: 18, paddingTop: 70, alignItems: 'flex-start' },
  }),
);
