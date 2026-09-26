import { useEffect, type ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { border, colors, layout, radius, themed } from '@/theme';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

// Drag further than this (px) or flick faster than this (px/s) to dismiss.
const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 800;

/**
 * White sheet with a 3px black top edge and a black grabber, sized to its
 * content (screens 10, 11, 12, 24, 26, 27). Built on RN's Modal so it always
 * draws above the page. There is no scrim, per the design ("no translucency");
 * tapping above the sheet or dragging it down closes it.
 */
export function Sheet({ open, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const height = useSharedValue(0);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    if (!open) return;
    translateY.set(0);
    scrollY.set(0);
  }, [open, translateY, scrollY]);

  const scroll = Gesture.Native();
  // Vertical drags only (sideways ones stay with sliders), and only while the
  // content is scrolled to the top; otherwise the drag scrolls the content.
  const drag = Gesture.Pan()
    .activeOffsetY([-12, 12])
    .failOffsetX([-16, 16])
    .simultaneousWithExternalGesture(scroll)
    .onUpdate((e) => {
      if (scrollY.get() > 0) return;
      translateY.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (translateY.get() > DISMISS_DISTANCE || (translateY.get() > 0 && e.velocityY > DISMISS_VELOCITY)) {
        translateY.set(
          withTiming(Math.max(height.get(), 400), { duration: 180 }, (done) => {
            if (done) scheduleOnRN(onClose);
          }),
        );
      } else {
        translateY.set(withSpring(0, { dampingRatio: 1 }));
      }
    });

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
  });
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.get() }] }));

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}>
      {/* Modals render outside the app's root view, so gestures need their own root here. */}
      <GestureHandlerRootView style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <GestureDetector gesture={drag}>
          <Animated.View
            onLayout={(e) => height.set(e.nativeEvent.layout.height)}
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) + 14 }, sheetStyle]}>
            <View style={styles.handle} />
            <GestureDetector gesture={scroll}>
              <Animated.ScrollView
                bounces={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={onScroll}>
                {children}
              </Animated.ScrollView>
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
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
    content: { paddingHorizontal: layout.gutter, gap: 14, paddingBottom: 12 },
  }),
);
