import type { LucideIcon } from 'lucide-react-native';

import { colors } from '@/theme';

type Props = {
  icon: LucideIcon;
  size?: number;
  color?: string;
};

/**
 * Lucide line icon. The design system uses Lucide (2px stroke, rounded joins)
 * as a stand-in for the source's icon set, always solid black.
 */
export function Icon({ icon: Glyph, size = 24, color = colors.black }: Props) {
  return <Glyph size={size} color={color} strokeWidth={2} absoluteStrokeWidth={false} />;
}
