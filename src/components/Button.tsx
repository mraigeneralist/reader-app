import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { border, colors, layout, radius, shadow, font, tracking, themed } from '@/theme';

import { Surface } from './Surface';
import { Txt } from './Txt';

const TONES = {
  primary: colors.yellow,
  pink: colors.pink,
  purple: colors.purple,
  green: colors.green,
  paper: 'paper',
} as const;

const SIZES = {
  sm: { height: layout.controlSm, paddingHorizontal: 14, fontSize: 13 },
  // Design: 20px. 12px lets two-up labels ("Change Category") fit on 360dp-wide phones at full size.
  md: { height: layout.controlMd, paddingHorizontal: 12, fontSize: 15 },
  lg: { height: layout.controlLg, paddingHorizontal: 26, fontSize: 20 },
} as const;

export type ButtonTone = keyof typeof TONES;

type Props = {
  children: string;
  onPress?: () => void;
  tone?: ButtonTone;
  size?: keyof typeof SIZES;
  /** Stretch to the parent's width. */
  block?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Hard-bordered, hard-shadowed action. Press shifts it into its own shadow. */
export function Button({ children, onPress, tone = 'primary', size = 'md', block, disabled, iconLeft, style }: Props) {
  const s = SIZES[size];
  return (
    <Surface
      shadow={shadow.md}
      onPress={onPress ?? (() => {})}
      disabled={disabled}
      accessibilityLabel={children}
      containerStyle={[block ? styles.block : styles.inline, style]}
      style={[
        styles.surface,
        {
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          backgroundColor: disabled ? colors.gray200 : tone === 'paper' ? colors.white : TONES[tone],
          opacity: disabled ? 0.6 : 1,
        },
      ]}>
      {iconLeft}
      <Txt
        style={font(s.fontSize, 1, '700', tracking.title)}
        color={tone === 'paper' || disabled ? colors.black : colors.textOnAccent}
        numberOfLines={1}>
        {children}
      </Txt>
    </Surface>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    block: { alignSelf: 'stretch' },
    inline: { alignSelf: 'flex-start' },
    surface: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderWidth: border.width,
      borderColor: colors.borderInk,
      borderRadius: radius.md,
    },
  }),
);
