// Source: _ds/stashly-design-system/tokens/colors.css

/** Raw brand colours. Fixed in both appearances (accents look the same in dark mode). */
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

export type Appearance = 'light' | 'dark';

/**
 * The neutral tones that change with the app's appearance. In dark mode the
 * design is inverted: near-black screens, dark paper, and cream "ink" for
 * text, borders and hard shadows. `black` means ink and `white` means paper.
 */
const neutrals = {
  light: {
    black: palette.black,
    white: palette.white,
    cream: palette.cream,
    creamDeep: palette.creamDeep,
    gray100: palette.gray100,
    gray200: palette.gray200,
    gray300: palette.gray300,
    gray400: palette.gray400,
    gray500: palette.gray500,
    gray600: palette.gray600,
  },
  dark: {
    black: '#F3EFE6',
    white: '#1D1D1D',
    cream: '#121212',
    creamDeep: '#262626',
    gray100: '#2A2A2A',
    gray200: '#3A3A3A',
    gray300: '#5A5A5A',
    gray400: '#8A8A8A',
    gray500: '#A8A8A8',
    gray600: '#C8C8C8',
  },
} as const;

let active: Appearance = 'light';

/** Switch the app's colours. The root layout calls this and remounts the tree. */
export const setAppearance = (a: Appearance) => {
  active = a;
};
export const getAppearance = () => active;

type Neutral = keyof (typeof neutrals)['light'];

const semantic = {
  surfaceScreen: 'cream',
  surfaceCard: 'white',
  surfaceSunken: 'creamDeep',
  textStrong: 'black',
  textBody: 'black',
  textMuted: 'gray400',
  borderInk: 'black',
  shadowInk: 'black',
} as const satisfies Record<string, Neutral>;

type Colors = { readonly [K in Neutral | keyof typeof semantic]: string } & {
  readonly yellow: string;
  readonly pink: string;
  readonly purple: string;
  readonly green: string;
  readonly lime: string;
  readonly tan: string;
  readonly gray: string;
  readonly surfaceApp: string;
  /** Text and glyphs on accent fills (yellow buttons, colour tiles): always black. */
  readonly textOnAccent: string;
  readonly accentPrimary: string;
  readonly focusRing: string;
  /** Default highlight colour. */
  readonly highlight: string;
  /** Live text-selection fill in the reader. */
  readonly selection: string;
};

/**
 * Theme-aware colour tokens. Neutral values are read at access time from the
 * active appearance, so styles built with `themed()` and inline styles pick
 * up the current theme.
 */
export const colors = {
  yellow: palette.yellow,
  pink: palette.pink,
  purple: palette.purple,
  green: palette.green,
  lime: palette.lime,
  tan: palette.tan,
  gray: palette.gray,
  surfaceApp: palette.yellow,
  textOnAccent: palette.black,
  accentPrimary: palette.yellow,
  focusRing: palette.purple,
  highlight: palette.yellow,
  selection: palette.lime,
} as Colors;
for (const key of Object.keys(neutrals.light) as Neutral[])
  Object.defineProperty(colors, key, { get: () => neutrals[active][key], enumerable: true });
for (const [key, neutral] of Object.entries(semantic))
  Object.defineProperty(colors, key, { get: () => neutrals[active][neutral], enumerable: true });

/**
 * Wraps a StyleSheet factory so each appearance gets its own styles, built
 * lazily with that appearance's colours. Use for any style that reads `colors`.
 */
export function themed<T extends object>(factory: () => T): T {
  const cache: Partial<Record<Appearance, T>> = {};
  return new Proxy({} as T, {
    get(_target, key) {
      cache[active] ??= factory();
      return cache[active]![key as keyof T];
    },
  });
}

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

/** Highlighter colours, lightened from the brand accents so black text stays readable. */
export const highlightColors = [
  { name: 'Yellow', value: '#FFC91E' },
  { name: 'Green', value: '#9DE39A' },
  { name: 'Pink', value: '#FF9DB6' },
  { name: 'Purple', value: '#C7B8FF' },
  { name: 'Blue', value: '#9FD4FF' },
] as const;

/** Reader page themes from the Reading Settings sheet. */
export const readerThemes = {
  light: { background: palette.white, ink: palette.black },
  sepia: { background: palette.tan, ink: palette.black },
  dark: { background: palette.black, ink: palette.white },
} as const;

export type ReaderThemeName = keyof typeof readerThemes;
