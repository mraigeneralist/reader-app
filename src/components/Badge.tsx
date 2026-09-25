import { StyleSheet, View } from 'react-native';

import { border, colors, radius } from '@/theme';

import { Txt } from './Txt';

const TONES = {
  new: colors.pink,
  info: colors.purple,
  go: colors.green,
  paper: colors.white,
} as const;

type Props = {
  children: string | number;
  tone?: keyof typeof TONES;
};

/** Tiny uppercase status pill: NEW, DONE, NOUN, EPUB. */
export function Badge({ children, tone = 'new' }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: TONES[tone] }]}>
      <Txt variant="micro" color={tone === 'paper' ? colors.black : colors.white}>
        {String(children).toUpperCase()}
      </Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    height: 22,
    paddingHorizontal: 7,
    borderWidth: border.thin,
    borderColor: colors.borderInk,
    borderRadius: radius.sm,
  },
});
