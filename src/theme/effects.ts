// Source: _ds/stashly-design-system/tokens/effects.css

export const border = {
  width: 3,
  thin: 2,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  sheet: 24,
  pill: 999,
} as const;

/**
 * Hard shadows: solid black, zero blur, offset down-right by this many px.
 * RN can't draw an offset-only shadow, so <HardShadow> paints a black copy of
 * the shape behind the element instead (pixel-identical to the CSS).
 */
export const shadow = {
  sm: 3,
  md: 5,
  lg: 8,
  device: 14,
} as const;

export const motion = {
  fast: 90,
  base: 160,
} as const;
