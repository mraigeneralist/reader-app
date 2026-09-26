import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type AccessibilityRole, type StyleProp, type ViewStyle } from 'react-native';

import { colors, themed } from '@/theme';

type Props = {
  /** Hard-shadow offset in px (0 = no shadow). Also the distance the surface moves when pressed. */
  shadow?: number;
  /** Visual style of the surface itself: fill, border, radius, padding, inner layout. */
  style?: StyleProp<ViewStyle>;
  /** Layout of the outer box: flex, width, alignSelf, absolute position. */
  containerStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  /** Keep the surface pushed into its shadow, e.g. a selected chip. */
  selected?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  children?: ReactNode;
};

const RADIUS_KEYS = [
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
] as const;

/**
 * The core "paper cut-out" of the design system: a bordered shape casting a
 * solid black, zero-blur shadow. React Native has no offset-only shadow, so
 * the shadow is a black copy of the shape painted behind it. Pressing moves
 * the surface into its shadow and hides it, as the CSS does.
 */
export function Surface({
  shadow = 5,
  style,
  containerStyle,
  onPress,
  onLongPress,
  disabled,
  selected,
  accessibilityLabel,
  accessibilityRole,
  children,
}: Props) {
  const [down, setDown] = useState(false);
  const interactive = !!(onPress || onLongPress);
  const shifted = !!selected || (down && !disabled);

  const flat = StyleSheet.flatten(style) ?? {};
  const radii: ViewStyle = {};
  for (const key of RADIUS_KEYS) if (flat[key] != null) radii[key] = flat[key] as number;

  const body = (
    <>
      {shadow > 0 && !shifted && !disabled && (
        <View
          pointerEvents="none"
          style={[styles.shadow, radii, { top: shadow, left: shadow, right: -shadow, bottom: -shadow }]}
        />
      )}
      <View style={[style, shifted && shadow > 0 && { transform: [{ translateX: shadow }, { translateY: shadow }] }]}>
        {children}
      </View>
    </>
  );

  if (!interactive) return <View style={containerStyle}>{body}</View>;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      onPressIn={() => setDown(true)}
      onPressOut={() => setDown(false)}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityState={{ disabled: !!disabled, selected: !!selected }}
      style={containerStyle}>
      {body}
    </Pressable>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    shadow: {
      position: 'absolute',
      backgroundColor: colors.shadowInk,
    },
  }),
);
