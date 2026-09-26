import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { Card, IconTile, Txt } from '@/components';
import { font, layout, text } from '@/theme';

import { iconFor } from './icons';

type Props = {
  name: string;
  color: string;
  icon: string | null;
  count: number;
  onPress?: () => void;
  onLongPress?: () => void;
};

/** Folder-lipped category tile (screen 08). */
/** Average glyph width of Archivo Bold as a fraction of the font size. */
const CHAR_WIDTH = 0.6;
const TITLE = text.cardTitle.fontSize ?? 18;

export function CategoryCard({ name, color, icon, count, onPress, onLongPress }: Props) {
  // Two-up grid: card width minus padding and borders.
  const { width } = useWindowDimensions();
  const inner = (width - layout.gutter * 2 - layout.gridGap) / 2 - 16 * 2 - 3 * 2;
  // Shrink rather than split a word mid-way; allow breaks after hyphens ("Self-/improvement").
  const longest = Math.max(...name.split(/[s-]+/).map((w) => w.length));
  const size = Math.min(TITLE, Math.floor(inner / (longest * CHAR_WIDTH)));
  const breakable = name.replace(/-/g, '-​');
  return (
    <Card tab={color} padding={16} onPress={onPress} onLongPress={onLongPress} accessibilityLabel={name}>
      <View style={styles.body}>
        <View style={styles.top}>
          <IconTile icon={iconFor(icon)} color={color} size={52} iconSize={24} />
          <Txt style={font(14, 1, '600')}>
            {count} {count === 1 ? 'book' : 'books'}
          </Txt>
        </View>
        {/* Always two lines tall, so every card in the grid is the same size. */}
        <Txt variant="cardTitle" numberOfLines={2} textBreakStrategy="simple" style={[styles.name, { fontSize: size }]}>
          {breakable}
        </Txt>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { gap: 22 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { height: (text.cardTitle.lineHeight ?? 22) * 2 },
});
