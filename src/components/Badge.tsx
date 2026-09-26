import { StyleSheet, View } from 'react-native';

import { border, colors, radius, themed } from '@/theme';

import { Txt } from './Txt';

const TONES = {
  new: colors.pink,
  info: colors.purple,
  go: colors.green,
  paper: 'paper',
} as const;

type Props = {
  children: string | number;
  tone?: keyof typeof TONES;
};

/** Tiny uppercase status pill: NEW, DONE, NOUN, EPUB. */
export function Badge({ children, tone = 'new' }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: tone === 'paper' ? colors.white : TONES[tone] }]}>
      <Txt variant="micro" color={tone === 'paper' ? colors.black : '#FFFFFF'}>
        {String(children).toUpperCase()}
      </Txt>
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
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
  }),
);
