import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { border, colors, radius, shadow, text, themed } from '@/theme';

type Props = TextInputProps & {
  leading?: ReactNode;
  trailing?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Text field: white paper, 3px black border, hard shadow, purple focus ring. */
export function Input({ leading, trailing, containerStyle, onFocus, onBlur, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.ring, focused && styles.ringOn, containerStyle]}>
      <View style={styles.shadow} />
      <View style={styles.field}>
        {leading}
        <TextInput
          {...rest}
          style={[styles.input, style]}
          placeholderTextColor={colors.gray500}
          selectionColor={colors.purple}
          cursorColor={colors.black}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {trailing}
      </View>
    </View>
  );
}

const RING = 2;
const OFFSET = 2;

const styles = themed(() =>
  StyleSheet.create({
    // The focus ring sits 2px outside the field (CSS outline-offset), so reserve its space always.
    ring: {
      padding: RING + OFFSET,
      margin: -(RING + OFFSET),
      borderRadius: radius.md + RING + OFFSET,
      borderWidth: RING,
      borderColor: 'transparent',
    },
    ringOn: { borderColor: colors.focusRing },
    shadow: {
      position: 'absolute',
      left: RING + OFFSET + shadow.md,
      top: RING + OFFSET + shadow.md,
      right: RING + OFFSET - shadow.md,
      bottom: RING + OFFSET - shadow.md,
      borderRadius: radius.md,
      backgroundColor: colors.shadowInk,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      height: 58,
      paddingHorizontal: 16,
      backgroundColor: colors.white,
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.md,
    },
    input: { ...text.body, lineHeight: undefined, flex: 1, minWidth: 0, color: colors.black, paddingVertical: 0 },
  }),
);
