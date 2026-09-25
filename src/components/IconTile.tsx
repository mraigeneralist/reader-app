import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { border, colors, radius } from '@/theme';

import { Icon } from './Icon';

type Props = {
  icon: LucideIcon;
  color?: string;
  size?: number;
  iconSize?: number;
};

/** Colour-coded square with a black glyph. The colour identifies the category. */
export function IconTile({ icon, color = colors.gray, size = 52, iconSize }: Props) {
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: color }]}>
      <Icon icon={icon} size={iconSize ?? Math.round(size * 0.46)} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: border.width,
    borderColor: colors.borderInk,
    borderRadius: radius.md,
  },
});
