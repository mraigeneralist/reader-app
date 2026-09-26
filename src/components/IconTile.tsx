import { StyleSheet, View } from 'react-native';

import { border, colors, radius, themed } from '@/theme';

import { Icon, type IconGlyph } from './Icon';

type Props = {
  icon: IconGlyph;
  color?: string;
  size?: number;
  iconSize?: number;
};

/** Colour-coded square with a black glyph. The colour identifies the category. */
export function IconTile({ icon, color = colors.gray, size = 52, iconSize }: Props) {
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: color }]}>
      {/* Glyphs are black on colour tiles; on paper tiles they follow the ink colour. */}
      <Icon
        icon={icon}
        size={iconSize ?? Math.round(size * 0.46)}
        color={color === colors.white ? colors.black : colors.textOnAccent}
      />
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    tile: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: border.width,
      borderColor: colors.borderInk,
      borderRadius: radius.md,
    },
  }),
);
