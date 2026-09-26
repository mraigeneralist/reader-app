import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useSetting } from '@/db/settings';
import { takeReturnRoute } from '@/lib/themeReturn';
import { colors, setAppearance, themed } from '@/theme';

// Sheets that are their own routes: shown over the previous screen without a scrim.
const sheet = {
  presentation: 'transparentModal',
  animation: 'slide_from_bottom',
  contentStyle: { backgroundColor: 'transparent' },
} as const;

export default function RootLayout() {
  const appearance = useSetting('appearance');
  // Must run before any child renders: styles and inline colours read the active appearance.
  setAppearance(appearance);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.surfaceScreen).catch(() => {});
    const route = takeReturnRoute();
    if (route) router.navigate(route as never);
  }, [appearance]);

  // Keyed on the appearance: switching remounts the tree so every screen redraws in the new colours.
  return (
    <GestureHandlerRootView key={appearance} style={[styles.root, { backgroundColor: colors.surfaceScreen }]}>
      <StatusBar style={appearance === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surfaceScreen },
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="import" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="reader/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="end/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="assign/[id]" options={sheet} />
        <Stack.Screen name="category-editor" options={sheet} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    root: { flex: 1 },
  }),
);
