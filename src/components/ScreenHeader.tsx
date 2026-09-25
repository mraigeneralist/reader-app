import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { layout } from '@/theme';

type Props = {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
};

/** The fixed row under the status bar: icon buttons or a page title on either side. */
export function ScreenHeader({ left, center, right }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.side}>{left}</View>
      {center}
      <View style={styles.side}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: layout.gutter,
  },
  side: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
