import type { TextStyle } from 'react-native';

// Source: _ds/stashly-design-system/tokens/typography.css + fonts.css.
// Fonts are embedded at build time by the expo-font config plugin (app.json),
// so a family name plus a numeric weight selects the right file.

export const fonts = {
  display: 'Archivo',
  body: 'Archivo',
  mono: 'JetBrains Mono',
} as const;

export const weights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
} as const satisfies Record<string, TextStyle['fontWeight']>;

export const tracking = {
  display: -0.035,
  title: -0.02,
  body: -0.01,
  micro: 0.04,
} as const;

type Weight = (typeof weights)[keyof typeof weights] | '900';

/**
 * Builds a text style from CSS-like values: size in px, line-height as a
 * multiplier, letter-spacing in em. RN wants absolute line-height and
 * letter-spacing, so both are converted here.
 */
export function font(
  size: number,
  lineHeight: number,
  weight: Weight,
  trackingEm = 0,
  family: string = fonts.display,
): TextStyle {
  return {
    fontFamily: family,
    fontSize: size,
    lineHeight: Math.round(size * lineHeight),
    fontWeight: weight,
    letterSpacing: +(size * trackingEm).toFixed(2),
  };
}

/** Named text styles used across the screens. */
export const text = {
  /** Screen headlines: "Keep reading.", "Your shelf is empty." */
  display: font(40, 1.02, '800', tracking.display),
  displayLg: font(44, 1.02, '800', tracking.display),
  /** Empty-state headlines: "No books match." */
  displaySm: font(32, 1.02, '800', tracking.display),
  /** Screen titles in the header row: "My Library", "Categories". */
  pageTitle: font(32, 1.2, '700', tracking.title),
  /** Section headers: "Continue Reading". */
  title: font(20, 1.2, '700', tracking.title),
  sheetTitle: font(24, 1.2, '700', tracking.title),
  cardTitle: font(18, 1.2, '700', tracking.title),
  bookTitle: font(16, 1.2, '700', tracking.title),
  body: font(16, 1.35, '500', tracking.body),
  bodyLg: font(17, 1.35, '500', tracking.body),
  subtitle: font(15, 1.35, '600', tracking.body),
  author: font(14, 1.35, '500', tracking.body),
  label: font(13, 1.25, '700'),
  caption: font(13, 1.25, '600'),
  captionRegular: font(13, 1.25, '500'),
  /** Uppercase section labels: "READING DEFAULTS", "TITLES · 2". */
  overline: font(13, 1.25, '800'),
  micro: font(11, 1, '800', tracking.micro),
  link: font(15, 1, '700'),
  navLabel: font(12, 1, '700'),
  mono: font(14, 1.2, '600', 0, fonts.mono),
} as const satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof text;
