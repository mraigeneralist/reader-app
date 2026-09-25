import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { border, colors, radius, shadow } from '@/theme';

import { Surface } from './Surface';

type Props = {
  children?: ReactNode;
  /** Colour of the folder lip drawn behind the top-left of the card (category tiles). */
  tab?: string;
  padding?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  accessibilityLabel?: string;
  /** Inner layout of the card body. */
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

const TAB_OFFSET = 22;

/** The base paper surface: white, 3px black border, 16px radius, hard shadow. */
export function Card({
  children,
  tab,
  padding = 16,
  onPress,
  onLongPress,
  accessibilityLabel,
  style,
  containerStyle,
}: Props) {
  return (
    <View style={[tab ? styles.withTab : null, containerStyle]}>
      {tab && (
        <Surface
          shadow={shadow.md}
          containerStyle={styles.tabPosition}
          style={[styles.tab, { backgroundColor: tab }]}
        />
      )}
      <Surface
        shadow={shadow.md}
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityLabel={accessibilityLabel}
        style={[styles.card, { padding }, style]}>
        {children}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  withTab: { paddingTop: TAB_OFFSET },
  tabPosition: { position: 'absolute', top: 0, left: 12, width: 152, maxWidth: '80%' },
  tab: {
    height: 42,
    borderWidth: border.width,
    borderColor: colors.borderInk,
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
  },
  card: {
    backgroundColor: colors.surfaceCard,
    borderWidth: border.width,
    borderColor: colors.borderInk,
    borderRadius: radius.lg,
  },
});
