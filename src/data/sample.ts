import { palette } from '@/theme';

// TEMPORARY: the sample shelf from the design (screen 06). Replaced by the
// SQLite library once importing is built.

export type SampleBook = {
  id: string;
  title: string;
  author: string;
  color: string;
  page: number;
  pageCount: number;
};

export const continueReading: SampleBook[] = [
  { id: '1', title: 'The Slow Discipline', author: 'Arjun Mehta', color: palette.pink, page: 118, pageCount: 290 },
  { id: '2', title: 'Letters from a Stone Harbor', author: 'Helena Voss', color: palette.green, page: 204, pageCount: 305 },
  { id: '3', title: 'On Being Unhurried', author: 'Tomás Reyes', color: palette.purple, page: 31, pageCount: 176 },
];

export const recentlyAdded: SampleBook[] = [
  { id: '4', title: "The Cartographer's Daughter", author: 'Imogen Hart', color: palette.green, page: 0, pageCount: 384 },
  { id: '5', title: 'Attention, Reclaimed', author: 'Priya Raman', color: palette.pink, page: 0, pageCount: 212 },
  { id: '6', title: 'Field Notes on Patience', author: 'Wen Liu', color: palette.purple, page: 0, pageCount: 198 },
];
