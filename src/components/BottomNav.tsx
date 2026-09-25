import type { BottomTabBarProps } from 'expo-router/tabs';
import { Folder, House, LibraryBig, Settings, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { border, colors, radius } from '@/theme';

import { Icon } from './Icon';
import { Txt } from './Txt';

const ITEMS: Record<string, { icon: LucideIcon; label: string }> = {
  index: { icon: House, label: 'Home' },
  library: { icon: LibraryBig, label: 'Library' },
  categories: { icon: Folder, label: 'Categories' },
  settings: { icon: Settings, label: 'Settings' },
};

/** Four-tab bar from BottomNav.dc.html, used as the Tabs navigator's tabBar. */
export function BottomNav({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) + 4 }]}>
      {state.routes.map((route, index) => {
        const item = ITEMS[route.name];
        if (!item) return null;
        const active = state.index === index;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item.label}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!active && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={styles.item}>
            <View
              style={[
                styles.pill,
                active
                  ? { backgroundColor: colors.yellow, borderColor: colors.black }
                  : { backgroundColor: 'transparent', borderColor: 'transparent' },
              ]}>
              <Icon icon={item.icon} size={22} />
            </View>
            <Txt variant="navLabel">{item.label}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    borderTopWidth: border.width,
    borderTopColor: colors.black,
  },
  item: { width: 76, alignItems: 'center', gap: 5 },
  pill: {
    width: 48,
    height: 36,
    borderRadius: radius.md,
    borderWidth: border.width,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
