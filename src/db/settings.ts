import { eq } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from './client';
import { settings } from './schema';

export type ReaderPrefs = {
  fontSize: number;
  font: 'archivo' | 'mono';
  lineSpacing: 'tight' | 'normal' | 'relaxed';
  theme: 'light' | 'sepia' | 'dark';
  movement: 'page' | 'scroll';
  /** 0–1 screen brightness while reading, or null to follow the system. */
  brightness: number | null;
};

type SettingsShape = {
  onboarded: boolean;
  /** App-wide colour scheme (the book page has its own theme in Reading Settings). */
  appearance: 'light' | 'dark';
  /** Last highlighter colour used, so the next highlight defaults to it. */
  highlightColor: string;
  readerPrefs: ReaderPrefs;
  dictionaryLanguage: 'en';
};

export const DEFAULTS: SettingsShape = {
  onboarded: false,
  appearance: 'light',
  highlightColor: '#FFC91E',
  readerPrefs: {
    fontSize: 18,
    font: 'archivo',
    lineSpacing: 'normal',
    theme: 'light',
    movement: 'page',
    brightness: null,
  },
  dictionaryLanguage: 'en',
};

export type SettingKey = keyof SettingsShape;

const parse = <K extends SettingKey>(key: K, raw: string | undefined): SettingsShape[K] => {
  if (raw == null) return DEFAULTS[key];
  try {
    const value = JSON.parse(raw);
    // Merge objects so settings added in later versions get their defaults.
    return typeof DEFAULTS[key] === 'object' ? { ...(DEFAULTS[key] as object), ...value } : value;
  } catch {
    return DEFAULTS[key];
  }
};

export function getSetting<K extends SettingKey>(key: K): SettingsShape[K] {
  const row = db.select().from(settings).where(eq(settings.key, key)).get();
  return parse(key, row?.value);
}

export async function setSetting<K extends SettingKey>(key: K, value: SettingsShape[K]) {
  const json = JSON.stringify(value);
  await db
    .insert(settings)
    .values({ key, value: json })
    .onConflictDoUpdate({ target: settings.key, set: { value: json } });
}

/** Live value of a setting; re-renders when it changes. */
export function useSetting<K extends SettingKey>(key: K): SettingsShape[K] {
  const { data, updatedAt } = useLiveQuery(db.select().from(settings).where(eq(settings.key, key)), [key]);
  // The live query is empty until its first run; read synchronously until then
  // so screens never see a default in place of a saved value.
  if (!updatedAt) return getSetting(key);
  return parse(key, data?.[0]?.value);
}
