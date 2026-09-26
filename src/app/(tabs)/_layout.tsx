import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';

import { BottomNav } from '@/components';
import { useSetting } from '@/db/settings';
import { CoverBackfill } from '@/features/library/CoverBackfill';
import { colors } from '@/theme';

export default function TabsLayout() {
  const onboarded = useSetting('onboarded');
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <>
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
      <CoverBackfill />
    </>
  );
}
