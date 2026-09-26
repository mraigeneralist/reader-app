import { StyleSheet, View } from 'react-native';

import { border, colors, radius, themed } from '@/theme';

type Props = {
  /** 0–1 */
  value: number;
  /** md: 14px / 3px border (cards). sm: 10px / 2px border (library grid). */
  size?: 'sm' | 'md';
};

export function ProgressBar({ value, size = 'md' }: Props) {
  const pct = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` as const;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={[
        styles.track,
        size === 'sm' ? { height: 10, borderWidth: border.thin } : { height: 14, borderWidth: border.width },
      ]}>
      <View style={[styles.fill, { width: pct }]} />
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    track: {
      borderColor: colors.borderInk,
      borderRadius: radius.pill,
      backgroundColor: colors.white,
      overflow: 'hidden',
    },
    fill: { height: '100%', backgroundColor: colors.black },
  }),
);
