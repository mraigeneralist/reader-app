import { Inbox } from 'lucide-react-native';

import type { IconGlyph } from '@/components/Icon';

import * as G from './glyphs';

/** Icons a category can use, keyed by the id stored in the database, in picker order. */
export const CATEGORY_ICONS: Record<string, { name: string; glyph: IconGlyph }> = {
  bio: { name: 'Biography', glyph: G.Biography },
  memoir: { name: 'Memoir', glyph: G.Memoir },
  fiction: { name: 'Fiction', glyph: G.Fiction },
  self: { name: 'Self improvement', glyph: G.SelfImprovement },
  philo: { name: 'Philosophy', glyph: G.Philosophy },
  history: { name: 'History', glyph: G.History },
  science: { name: 'Science', glyph: G.Science },
  poetry: { name: 'Poetry', glyph: G.Poetry },
  mystery: { name: 'Mystery', glyph: G.Mystery },
  fantasy: { name: 'Fantasy', glyph: G.Fantasy },
  romance: { name: 'Romance', glyph: G.Romance },
  business: { name: 'Business', glyph: G.Business },
  psych: { name: 'Psychology', glyph: G.Psychology },
  scifi: { name: 'Sci-fi', glyph: G.SciFi },
  horror: { name: 'Horror', glyph: G.Horror },
  comics: { name: 'Comics', glyph: G.Comics },
  travel: { name: 'Travel', glyph: G.Travel },
  spirit: { name: 'Spirituality', glyph: G.Spirituality },
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

/** Categories saved before the custom set still hold Lucide names; show the nearest new icon. */
const LEGACY: Record<string, string> = {
  'pen-line': 'poetry',
  feather: 'poetry',
  sprout: 'self',
  brain: 'psych',
  globe: 'travel',
  heart: 'romance',
  'user-round': 'bio',
  'book-open': 'fiction',
  landmark: 'history',
  'flask-conical': 'science',
  coffee: 'memoir',
};

/** The current icon id for a stored name, or undefined if it isn't a category icon. */
export const canonicalIcon = (name: string | null | undefined): string | undefined => {
  if (!name) return undefined;
  if (CATEGORY_ICONS[name]) return name;
  return LEGACY[name];
};

export const iconFor = (name: string | null | undefined): IconGlyph => {
  const id = canonicalIcon(name);
  return id ? CATEGORY_ICONS[id].glyph : Inbox;
};
