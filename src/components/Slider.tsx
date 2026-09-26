import { useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';

import { border, colors, radius, themed } from '@/theme';

type Props = {
  /** 0â€“1 */
  value: number;
  /** Called continuously while dragging. */
  onChange?: (value: number) => void;
  /** Called once when the finger lifts. */
  onCommit?: (value: number) => void;
  /** The reading-position slider's thumb has a hard shadow; the brightness one doesn't. */
  thumbShadow?: boolean;
  accessibilityLabel?: string;
};

const THUMB = 28;

/** Pill track with a black fill and a yellow round thumb (screens 22 and 24). */
export function Slider({ value, onChange, onCommit, thumbShadow, accessibilityLabel }: Props) {
  const track = useRef<View>(null);
  const geometry = useRef({ x: 0, width: 1 });
  const [drag, setDrag] = useState<number | null>(null);

  const fractionAt = (pageX: number) => {
    const { x, width } = geometry.current;
    return Math.max(0, Math.min(1, (pageX - x) / width));
  };

  const responder = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (e: GestureResponderEvent) => {
      const { pageX } = e.nativeEvent;
      track.current?.measureInWindow((x, _y, width) => {
        geometry.current = { x, width: Math.max(1, width) };
        const f = fractionAt(pageX);
        setDrag(f);
        onChange?.(f);
      });
    },
    onResponderMove: (e: GestureResponderEvent) => {
      const f = fractionAt(e.nativeEvent.pageX);
      setDrag(f);
      onChange?.(f);
    },
    onResponderRelease: (e: GestureResponderEvent) => {
      const f = fractionAt(e.nativeEvent.pageX);
      setDrag(null);
      onCommit?.(f);
    },
    onResponderTerminate: () => setDrag(null),
  };

  const shown = drag ?? value;
  const pct = `${Math.round(shown * 1000) / 10}%` as const;

  return (
    <View
      style={styles.hit}
      {...responder}
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(shown * 100) }}>
      <View ref={track} style={styles.track}>
        <View style={[styles.fill, { width: pct }]} />
      </View>
      <View style={[styles.thumbBox, { left: pct }]} pointerEvents="none">
        {thumbShadow && <View style={[styles.thumb, styles.thumbShadow]} />}
        <View style={styles.thumb} />
      </View>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    // Tall hit area around the 14px track.
    hit: { height: 36, justifyContent: 'center' },
    track: {
      height: 14,
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.pill,
      backgroundColor: colors.white,
      overflow: 'hidden',
    },
    fill: { height: '100%', backgroundColor: colors.black },
    thumbBox: { position: 'absolute', top: 4, marginLeft: -THUMB / 2, width: THUMB, height: THUMB },
    thumb: {
      position: 'absolute',
      width: THUMB,
      height: THUMB,
      borderRadius: THUMB / 2,
      backgroundColor: colors.yellow,
      borderWidth: border.width,
      borderColor: colors.black,
    },
    thumbShadow: { left: 3, top: 3, backgroundColor: colors.black },
  }),
);
