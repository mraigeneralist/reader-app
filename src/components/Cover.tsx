import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { border, colors, font, themed } from '@/theme';

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
  /** The book's own cover image (file URI). Falls back to the typographic cover. */
  image?: string | null;
};

/**
 * Typographic book cover: a flat colour block with the title set in heavy
 * type and the author under a short rule. The brand uses no imagery.
 */
export function Cover({ title, author, color, size = 'md', image }: Props) {
  const [w, h, ts, as, pad, sh] = SIZES[size];
  if (image) {
    // Real cover art: no black frame, just slightly rounded corners and a soft
    // shadow so the artwork reads as a physical book (user preference over the
    // design's hard frame, which suits the typographic covers).
    const artRadius = size === 'xs' || size === 'sm' ? 3 : 5;
    return (
      <View style={[styles.container, styles.artShadow, { width: w, height: h, borderRadius: artRadius }]}>
        <Image
          source={{ uri: image }}
          style={[StyleSheet.absoluteFill, { borderRadius: artRadius }]}
          contentFit="cover"
          transition={120}
          accessibilityLabel={`Cover of ${title}`}
        />
        {/* Hairline edge on top of the art, so pale covers don't melt into a white card. */}
        <View pointerEvents="none" style={[styles.artEdge, { borderRadius: artRadius }]} />
      </View>
    );
  }
  return (
    <Surface
      shadow={sh}
      containerStyle={styles.container}
      style={[styles.cover, { width: w, height: h, padding: pad, backgroundColor: color }]}>
      <Txt
        style={font(fitTitleSize(title, ts, w - 2 * (pad + border.width)), 1.05, '800', -0.02)}
        color={colors.textOnAccent}>
        {title}
      </Txt>
      {as > 0 && !!author && (
        <View style={styles.authorBlock}>
          <View style={styles.rule} />
          <Txt style={font(as, 1.1, '700')} color={colors.textOnAccent} numberOfLines={2}>
            {author}
          </Txt>
        </View>
      )}
    </Surface>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    // Never stretch to a parent row's height, or the shadow grows with it.
    container: { alignSelf: 'flex-start' },
    // Android's native elevation shadow (CSS boxShadow crashed the Fabric renderer here).
    artShadow: { backgroundColor: colors.white, elevation: 4 },
    artEdge: { ...StyleSheet.absoluteFill, borderWidth: 1, borderColor: colors.gray200 },
    cover: {
      borderWidth: border.width,
      borderColor: colors.borderInk,
      borderRadius: 8,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    authorBlock: { gap: 6 },
    rule: { height: 3, width: 24, backgroundColor: colors.textOnAccent },
  }),
);
