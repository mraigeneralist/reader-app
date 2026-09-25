// Source: _ds/stashly-design-system/tokens/colors.css

export const palette = {
  // ink + paper
  black: '#0A0A0A',
  white: '#FFFFFF',
  cream: '#FAF6EF',
  creamDeep: '#F2EDE2',
  // accents
  yellow: '#FFC91E',
  pink: '#FF3B6B',
  purple: '#7C5CF0',
  green: '#3CC63C',
  lime: '#A9D92A',
  tan: '#F8DCA4',
  gray: '#9C9C9C',
  // neutral ramp
  gray100: '#EDEDED',
  gray200: '#D9D9D9',
  gray300: '#BDBDBD',
  gray400: '#9C9C9C',
  gray500: '#6E6E6E',
  gray600: '#4A4A4A',
} as const;

export const colors = {
  ...palette,
  surfaceApp: palette.yellow,
  surfaceScreen: palette.cream,
  surfaceCard: palette.white,
  surfaceSunken: palette.creamDeep,
  textStrong: palette.black,
  textBody: palette.black,
  textMuted: palette.gray400,
  textOnAccent: palette.black,
  borderInk: palette.black,
  shadowInk: palette.black,
  accentPrimary: palette.yellow,
  focusRing: palette.purple,
  /** Saved highlight fill in the reader and highlight list. */
  highlight: palette.yellow,
  /** Live text-selection fill in the reader. */
  selection: palette.lime,
} as const;

/** Colours a category (or a generated cover) can take, in the order the picker shows them. */
export const categoryColors = [
  palette.pink,
  palette.purple,
  palette.green,
  palette.lime,
  palette.tan,
  palette.yellow,
  palette.gray,
] as const;

export type CategoryColor = (typeof categoryColors)[number];

/** Reader page themes from the Reading Settings sheet. */
export const readerThemes = {
  light: { background: palette.white, ink: palette.black },
  sepia: { background: palette.tan, ink: palette.black },
  dark: { background: palette.black, ink: palette.white },
} as const;

export type ReaderThemeName = keyof typeof readerThemes;
