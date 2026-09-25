import { Text, type TextProps } from 'react-native';

import { colors, text, type TextVariant } from '@/theme';

type Props = TextProps & {
  variant?: TextVariant;
  color?: string;
};

/** Text in one of the design system's named styles. Always full-strength ink. */
export function Txt({ variant = 'body', color = colors.textBody, style, ...rest }: Props) {
  return <Text style={[text[variant], { color }, style]} {...rest} />;
}
