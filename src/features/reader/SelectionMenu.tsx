import { BookA, Copy, Highlighter, Trash2, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View, type LayoutRectangle } from 'react-native';

import { Icon, Txt } from '@/components';
import { border, colors, font, radius, shadow, themed } from '@/theme';

export type MenuAction = 'highlight' | 'define' | 'copy' | 'remove';

type Item = { action: MenuAction; label: string; icon: LucideIcon };

const ITEMS: Record<MenuAction, Item> = {
  highlight: { action: 'highlight', label: 'Highlight', icon: Highlighter },
  define: { action: 'define', label: 'Define', icon: BookA },
  copy: { action: 'copy', label: 'Copy', icon: Copy },
  remove: { action: 'remove', label: 'Remove', icon: Trash2 },
};

type Props = {
  /** Selected text's rectangle, in the reader page's coordinates. */
  rect: { x: number; y: number; width: number; height: number };
  /** Where the page (WebView) sits on screen. */
  pageTop: number;
  actions: MenuAction[];
  /** Filled in yellow, like the design's suggested action. */
  primary: MenuAction;
  onAction: (action: MenuAction) => void;
};

const GAP = 14;
const EDGE = 12;

/** Screens 25 and 28 · The floating Highlight / Define / Copy menu above a selection. */
export function SelectionMenu({ rect, pageTop, actions, primary, onAction }: Props) {
  const { width: screenW } = useWindowDimensions();
  const [size, setSize] = useState<LayoutRectangle | null>(null);
  const w = size?.width ?? 0;
  const h = size?.height ?? 46;

  // Above the selection, or below when there's no room; centred and kept on screen.
  const above = pageTop + rect.y - h - GAP;
  const top = above > pageTop + 4 ? above : pageTop + rect.y + rect.height + GAP;
  const left = Math.min(Math.max(EDGE, rect.x + rect.width / 2 - w / 2), screenW - w - EDGE - shadow.md);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { top, left, opacity: size ? 1 : 0 }]}
      onLayout={(e) => setSize(e.nativeEvent.layout)}>
      <View style={styles.shadow} />
      <View style={styles.menu}>
        {actions.map((a, i) => {
          const item = ITEMS[a];
          return (
            <Pressable
              key={a}
              onPress={() => onAction(a)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [
                styles.item,
                i < actions.length - 1 && styles.divider,
                { backgroundColor: a === primary || pressed ? colors.yellow : colors.white },
              ]}>
              <Icon icon={item.icon} size={20} color={a === primary ? colors.textOnAccent : colors.black} />
              <Txt style={font(15, 1, '700')} color={a === primary ? colors.textOnAccent : colors.black}>
                {item.label}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    wrap: { position: 'absolute', zIndex: 30 },
    shadow: {
      ...StyleSheet.absoluteFill,
      left: shadow.md,
      top: shadow.md,
      right: -shadow.md,
      bottom: -shadow.md,
      borderRadius: radius.md,
      backgroundColor: colors.black,
    },
    menu: {
      flexDirection: 'row',
      backgroundColor: colors.white,
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    item: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 11, paddingHorizontal: 13 },
    divider: { borderRightWidth: border.width, borderRightColor: colors.black },
  }),
);
