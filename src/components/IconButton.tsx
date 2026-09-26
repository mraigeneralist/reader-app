import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { border, colors, radius, shadow, themed } from '@/theme';

import { Icon } from './Icon';
import { Surface } from './Surface';

const SIZES = { sm: 40, md: 54, lg: 62 } as const;
const ICON_SIZES = { sm: 22, md: 26, lg: 28 } as const;
const TONES = {
  paper: 'paper',
  primary: colors.yellow,
  pink: colors.pink,
  purple: colors.purple,
} as const;

type Props = {
  icon: LucideIcon;
  /** Accessible name; the button has no visible text. */
  label: string;
  onPress?: () => void;
  size?: keyof typeof SIZES;
  tone?: keyof typeof TONES;
  iconSize?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Square glyph-only control used in header rows. */
export function IconButton({ icon, label, onPress, size = 'sm', tone = 'paper', iconSize, disabled, style }: Props) {
  const px = SIZES[size];
  return (
    <Surface
      shadow={shadow.md}
      onPress={onPress ?? (() => {})}
      disabled={disabled}
      accessibilityLabel={label}
      containerStyle={style}
      style={[styles.surface, { width: px, height: px, backgroundColor: disabled ? colors.gray200 : tone === 'paper' ? colors.white : TONES[tone] }]}>
      <Icon
        icon={icon}
        size={iconSize ?? ICON_SIZES[size]}
        color={tone === 'paper' || disabled ? colors.black : colors.textOnAccent}
      />
    </Surface>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    surface: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: border.width,
      borderColor: colors.borderInk,
      borderRadius: radius.md,
    },
  }),
);
