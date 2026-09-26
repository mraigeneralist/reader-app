import { StyleSheet } from 'react-native';

import { border, colors, radius, shadow, themed } from '@/theme';

import { Surface } from './Surface';
import { Txt } from './Txt';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Filter/sort chip. Selected: yellow and pushed into its shadow. */
export function Chip({ label, selected, onPress }: Props) {
  return (
    <Surface
      shadow={shadow.sm}
      selected={selected}
      onPress={onPress ?? (() => {})}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.chip, { backgroundColor: selected ? colors.yellow : colors.white }]}>
      <Txt variant="label" style={styles.label} color={selected ? colors.textOnAccent : colors.black} numberOfLines={1}>
        {label}
      </Txt>
    </Surface>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    chip: {
      height: 36,
      paddingHorizontal: 14,
      justifyContent: 'center',
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.md,
    },
    label: { fontSize: 14, lineHeight: 16 },
  }),
);
