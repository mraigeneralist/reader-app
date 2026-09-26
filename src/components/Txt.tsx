import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, text, type TextVariant } from '@/theme';

type Props = TextProps & {
  variant?: TextVariant;
  color?: string;
};

/** Room a glyph needs, as a multiple of the font size ("g", "y" descenders; accents). */
const GLYPH_BOX = 1.3;

/**
 * The design uses tight line-heights (1.0–1.05) that CSS lets glyphs overflow,
 * but Android clips text to its box, cutting off descenders like "g". Give the
 * box extra padding for the overflow and cancel it with negative margins, so
 * layout stays exactly as designed.
 */
function glyphRoom(style: TextStyle): TextStyle | null {
  const { fontSize, lineHeight } = style;
  if (!fontSize || !lineHeight || lineHeight >= fontSize * GLYPH_BOX) return null;
  const pad = Math.ceil((fontSize * GLYPH_BOX - lineHeight) / 2);
  const num = (v: unknown) => (typeof v === 'number' ? v : 0);
  return {
    paddingTop: num(style.paddingTop ?? style.paddingVertical ?? style.padding) + pad,
    paddingBottom: num(style.paddingBottom ?? style.paddingVertical ?? style.padding) + pad,
    marginTop: num(style.marginTop ?? style.marginVertical ?? style.margin) - pad,
    marginBottom: num(style.marginBottom ?? style.marginVertical ?? style.margin) - pad,
  };
}

/** Text in one of the design system's named styles. Always full-strength ink. */
export function Txt({ variant = 'body', color = colors.textBody, style, ...rest }: Props) {
  const flat = StyleSheet.flatten([text[variant], { color }, style]);
  return <Text style={[flat, glyphRoom(flat)]} {...rest} />;
}
