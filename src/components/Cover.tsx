import { StyleSheet, View } from 'react-native';

import { border, colors, font } from '@/theme';

import { Surface } from './Surface';
import { Txt } from './Txt';

// [width, height, titleSize, authorSize, padding, shadow] from Cover.dc.html
const SIZES = {
  xs: [44, 64, 7, 0, 5, 2],
  sm: [56, 82, 9, 0, 6, 3],
  md: [104, 152, 14, 10, 10, 3],
  lg: [160, 234, 21, 13, 14, 5],
} as const;

export type CoverSize = keyof typeof SIZES;

/** Average advance of Archivo ExtraBold, as a fraction of the font size. */
const CHAR_WIDTH = 0.6;

/**
 * Android splits a word that is wider than the line mid-way ("Being U / nhurried"),
 * where the CSS original just clips it. Shrink the title until its longest word fits.
 */
function fitTitleSize(title: string, size: number, innerWidth: number) {
  const longest = Math.max(...title.split(/\s+/).map((word) => word.length));
  return Math.min(size, Math.floor(innerWidth / (longest * CHAR_WIDTH)));
}

type Props = {
  title: string;
  author?: string | null;
  color: string;
  size?: CoverSize;
};

/**
 * Typographic book cover: a flat colour block with the title set in heavy
 * type and the author under a short rule. The brand uses no imagery.
 */
export function Cover({ title, author, color, size = 'md' }: Props) {
  const [w, h, ts, as, pad, sh] = SIZES[size];
  return (
    <Surface
      shadow={sh}
      containerStyle={styles.container}
      style={[styles.cover, { width: w, height: h, padding: pad, backgroundColor: color }]}>
      <Txt style={font(fitTitleSize(title, ts, w - 2 * (pad + border.width)), 1.05, '800', -0.02)}>
        {title}
      </Txt>
      {as > 0 && !!author && (
        <View style={styles.authorBlock}>
          <View style={styles.rule} />
          <Txt style={font(as, 1.1, '700')} numberOfLines={2}>
            {author}
          </Txt>
        </View>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  // Never stretch to a parent row's height, or the shadow grows with it.
  container: { alignSelf: 'flex-start' },
  cover: {
    borderWidth: border.width,
    borderColor: colors.borderInk,
    borderRadius: 8,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  authorBlock: { gap: 6 },
  rule: { height: 3, width: 24, backgroundColor: colors.black },
});
