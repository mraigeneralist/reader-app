import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { border, colors, layout, radius, themed } from '@/theme';

/**
 * A bottom sheet that is its own route (presented as a transparent modal), so
 * it can be opened from any screen. Tapping above it closes it.
 */
export function RouteSheet({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView behavior="padding" style={styles.root}>
      <Pressable style={styles.backdrop} onPress={() => router.back()} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) + 14 }]}>
        <View style={styles.handle} />
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { flex: 1 },
    sheet: {
      maxHeight: '88%',
      backgroundColor: colors.white,
      borderTopWidth: border.width,
      borderLeftWidth: border.width,
      borderRightWidth: border.width,
      borderColor: colors.black,
      borderTopLeftRadius: radius.sheet,
      borderTopRightRadius: radius.sheet,
      paddingTop: 12,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 6,
      borderRadius: radius.pill,
      backgroundColor: colors.black,
      marginBottom: 12,
    },
    // Bottom room so the last button's hard shadow isn't clipped by the scroll view.
    content: { paddingHorizontal: layout.gutter, gap: 18, paddingBottom: 12 },
  }),
);
