import { Pressable, StyleSheet } from 'react-native';

import { font } from '@/theme';

import { Txt } from './Txt';

type Props = {
  children: string;
  onPress?: () => void;
  size?: number;
};

/** Underlined text action: "See all", "Skip", "Not finished? Undo". */
export function TextLink({ children, onPress, size = 15 }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="link">
      <Txt style={[font(size, 1.25, '700'), styles.underline]}>{children}</Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // RN can't set underline thickness/offset; Android draws the font's default underline.
  underline: { textDecorationLine: 'underline' },
});
