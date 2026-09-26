import { X } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, IconButton, ScreenHeader, Txt } from '@/components';
import { border, colors, font, layout, radius, themed } from '@/theme';

export type TocItem = { label: string; href: string; depth: number; page: number | null };

type Props = {
  items: TocItem[] | null;
  currentHref: string | null;
  currentPage: number;
  onSelect: (item: TocItem) => void;
  onClose: () => void;
};

/** Index of the chapter being read: exact href match, else the last entry that starts at or before this page. */
const currentIndex = (items: TocItem[], href: string | null, page: number) => {
  const exact = href ? items.findIndex((i) => i.href === href) : -1;
  if (exact >= 0) return exact;
  let best = -1;
  items.forEach((item, i) => {
    if (item.page != null && item.page <= page) best = i;
  });
  return best;
};

/** Screen 23 · Table of contents (shown over the reader so the book stays open underneath). */
export function ContentsPanel({ items, currentHref, currentPage, onSelect, onClose }: Props) {
  const list = items ?? [];
  const active = currentIndex(list, currentHref, currentPage);
  let chapter = 0;
  const numbered = list.map((item) => ({ ...item, number: item.depth === 0 ? ++chapter : null }));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.panel}>
      <ScreenHeader
        left={<IconButton icon={X} label="Close contents" onPress={onClose} />}
        center={<Txt variant="cardTitle">Contents</Txt>}
        right={<View style={styles.spacer} />}
      />
      {items && list.length === 0 ? (
        <Txt variant="body" style={styles.empty}>
          This book has no table of contents.
        </Txt>
      ) : (
        <FlatList
          data={numbered}
          keyExtractor={(item, i) => `${i}-${item.href}`}
          contentContainerStyle={styles.list}
          initialScrollIndex={active > 3 ? active - 2 : undefined}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item, index }) => {
            const isActive = index === active;
            return (
              <Pressable
                onPress={() => onSelect(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.row,
                  isActive ? styles.rowActive : styles.rowIdle,
                  { paddingLeft: 14 + item.depth * 18 },
                ]}>
                <Txt style={[font(15, 1, '800'), styles.number]}>{item.number ?? ''}</Txt>
                <Txt style={[font(16, 1.25, isActive ? '700' : '500'), styles.label]}>{item.label || 'Untitled'}</Txt>
                {isActive && <Badge tone="paper">READING</Badge>}
                {item.page != null && <Txt style={font(14, 1, '600')}>{item.page}</Txt>}
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    panel: { ...StyleSheet.absoluteFill, backgroundColor: colors.cream, zIndex: 20 },
    spacer: { width: 40 },
    list: { paddingHorizontal: layout.gutter, paddingBottom: 24, gap: 6 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingRight: 14 },
    rowIdle: { borderBottomWidth: border.width, borderBottomColor: colors.black },
    rowActive: {
      backgroundColor: colors.yellow,
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.md,
    },
    number: { width: 24 },
    label: { flex: 1 },
    empty: { paddingHorizontal: layout.gutter, paddingTop: 12 },
  }),
);
