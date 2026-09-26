import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout, themed } from '@/theme';

type Props = {
  header?: ReactNode;
  children: ReactNode;
  /** Scrolls by default; pass false for screens that lay out their own list or footer. */
  scroll?: boolean;
  /** Content pinned under the scroll area (e.g. a primary action). */
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Include the bottom safe area (screens without the tab bar). */
  bottomInset?: boolean;
  background?: string;
};

/** Cream screen with the status-bar inset, an optional header row and a padded body. */
export function Screen({
  header,
  children,
  scroll = true,
  footer,
  contentStyle,
  bottomInset = false,
  background = colors.surfaceScreen,
}: Props) {
  return (
    <SafeAreaView
      edges={bottomInset ? ['top', 'bottom'] : ['top']}
      style={[styles.screen, { backgroundColor: background }]}>
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.body, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, styles.body, contentStyle]}>{children}</View>
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    screen: { flex: 1 },
    flex: { flex: 1 },
    body: { paddingHorizontal: layout.gutter, paddingTop: 8, paddingBottom: 28, gap: 14 },
    footer: { paddingHorizontal: layout.gutter, paddingTop: 8, paddingBottom: 20, gap: 14 },
  }),
);
