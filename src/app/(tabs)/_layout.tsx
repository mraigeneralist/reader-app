import { Tabs } from 'expo-router/tabs';

import { BottomNav } from '@/components';
import { colors } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.surfaceScreen },
      }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="categories" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
