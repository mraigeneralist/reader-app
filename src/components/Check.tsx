import { Check as CheckIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { border, colors, radius, themed } from '@/theme';

import { Icon } from './Icon';

type Props = {
  checked: boolean;
  /** round: category picker radio. square: file list checkbox. */
  shape?: 'round' | 'square';
};

export function Check({ checked, shape = 'square' }: Props) {
  return (
    <View
      style={[
        styles.box,
        { borderRadius: shape === 'round' ? radius.pill : radius.sm },
        { backgroundColor: checked ? colors.yellow : colors.white },
      ]}>
      {checked && <Icon icon={CheckIcon} size={18} color={colors.textOnAccent} />}
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    box: {
      width: 28,
      height: 28,
      borderWidth: border.width,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);
