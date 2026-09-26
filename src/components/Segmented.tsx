import { Pressable, StyleSheet, View } from 'react-native';

import { border, colors, radius, themed } from '@/theme';

import { Txt } from './Txt';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** Joined option bar from Reading Settings: the selected segment is yellow. */
export function Segmented<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.bar} accessibilityRole="radiogroup">
      {options.map((o, i) => (
        <Pressable
          key={o.value}
          onPress={() => onChange(o.value)}
          accessibilityRole="radio"
          accessibilityState={{ selected: o.value === value }}
          style={[
            styles.segment,
            i < options.length - 1 && styles.divider,
            { backgroundColor: o.value === value ? colors.yellow : colors.white },
          ]}>
          <Txt variant="link" color={o.value === value ? colors.textOnAccent : colors.black}>
            {o.label}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.md,
      overflow: 'hidden',
      backgroundColor: colors.white,
    },
    segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 11 },
    divider: { borderRightWidth: border.width, borderRightColor: colors.black },
  }),
);
