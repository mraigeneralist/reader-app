import type { ComponentType } from 'react';

import { colors } from '@/theme';

/** Anything drawn like a Lucide icon: Lucide itself, or the app's own glyphs (category icons). */
export type IconGlyph = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
  absoluteStrokeWidth?: boolean;
}>;

type Props = {
  icon: IconGlyph;
  size?: number;
  color?: string;
};

/**
 * Line icon (Lucide, or a custom glyph on the same grid). The design system uses Lucide (2px stroke, rounded joins)
 * as a stand-in for the source's icon set, always solid black.
 */
export function Icon({ icon: Glyph, size = 24, color = colors.black }: Props) {
  return <Glyph size={size} color={color} strokeWidth={2} absoluteStrokeWidth={false} />;
}
