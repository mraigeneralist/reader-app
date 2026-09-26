import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { dictionaryCache } from '@/db/schema';

export type DictionaryEntry = {
  word: string;
  phonetic: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string | null;
  synonyms: string[];
  /** Other senses, shown under the main one. */
  more: { partOfSpeech: string; definition: string }[];
};

export type LookupResult =
  | { status: 'found'; entry: DictionaryEntry; /** set when a base form was used ("reading" → "read") */ lookedUp: string }
  | { status: 'not-found' }
  | { status: 'offline' };

const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

/** "Motivation," → "motivation"; "author’s" → "author" */
export const normalizeWord = (raw: string) =>
  raw
    .toLowerCase()
    .replace(/[’']s$/, '')
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')
    .trim();

/** Likely base forms to try when the exact word has no entry. */
const baseForms = (w: string): string[] => {
  const out: string[] = [];
  const add = (s: string) => s.length > 2 && s !== w && !out.includes(s) && out.push(s);
  if (w.endsWith('ies')) add(`${w.slice(0, -3)}y`);
  if (w.endsWith('es')) add(w.slice(0, -2));
  if (w.endsWith('s')) add(w.slice(0, -1));
  if (w.endsWith('ied')) add(`${w.slice(0, -3)}y`);
  if (w.endsWith('ed')) {
    add(w.slice(0, -2));
    add(w.slice(0, -1));
  }
  if (w.endsWith('ing')) {
    add(w.slice(0, -3));
    add(`${w.slice(0, -3)}e`);
  }
  if (w.endsWith('ly')) add(w.slice(0, -2));
  // Doubled consonant: "stopped" → "stop", "running" → "run"
  const doubled = /(.)\1(ed|ing)$/.exec(w);
  if (doubled) add(w.slice(0, -(doubled[2].length + 1)));
  return out;
};

type ApiEntry = {
  word: string;
  phonetic?: string;
  phonetics?: { text?: string }[];
  meanings?: {
    partOfSpeech: string;
    synonyms?: string[];
    definitions: { definition: string; example?: string; synonyms?: string[] }[];
  }[];
};

const parse = (entries: ApiEntry[]): DictionaryEntry | null => {
  const first = entries[0];
  const meanings = entries.flatMap((e) => e.meanings ?? []);
  if (!first || meanings.length === 0) return null;
  const main = meanings[0];
  const example =
    meanings.flatMap((m) => m.definitions).find((d) => d.example)?.example ?? null;
  const synonyms = [
    ...new Set([...(main.synonyms ?? []), ...main.definitions.flatMap((d) => d.synonyms ?? [])]),
  ].slice(0, 4);
  return {
    word: first.word,
    phonetic: first.phonetic ?? entries.flatMap((e) => e.phonetics ?? []).find((p) => p.text)?.text ?? null,
    partOfSpeech: main.partOfSpeech ?? null,
    definition: main.definitions[0]?.definition ?? '',
    example,
    synonyms,
    more: meanings
      .slice(1, 3)
      .map((m) => ({ partOfSpeech: m.partOfSpeech, definition: m.definitions[0]?.definition ?? '' }))
      .filter((m) => m.definition),
  };
};

const fromCache = (word: string) => db.select().from(dictionaryCache).where(eq(dictionaryCache.word, word)).get();

const toCache = (word: string, entry: DictionaryEntry | null) =>
  db
    .insert(dictionaryCache)
    .values({ word, entry: entry ? JSON.stringify(entry) : null, fetchedAt: Date.now() })
    .onConflictDoUpdate({
      target: dictionaryCache.word,
      set: { entry: entry ? JSON.stringify(entry) : null, fetchedAt: Date.now() },
    });

const WIKTIONARY = 'https://en.wiktionary.org/api/rest_v1/page/definition/';

type WiktionaryResponse = Record<
  string,
  { partOfSpeech: string; definitions: { definition: string; examples?: string[] }[] }[]
>;

const stripHTML = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();

/** Wiktionary has no pronunciation or synonyms in this API, but is reliable and broad. */
const parseWiktionary = (word: string, data: WiktionaryResponse): DictionaryEntry | null => {
  const senses = (data.en ?? [])
    .map((e) => ({
      partOfSpeech: e.partOfSpeech.toLowerCase(),
      defs: e.definitions
        .map((d) => ({ text: stripHTML(d.definition), example: d.examples?.map(stripHTML).find(Boolean) }))
        .filter((d) => d.text),
    }))
    .filter((e) => e.defs.length);
  if (!senses.length) return null;
  const main = senses[0];
  return {
    word,
    phonetic: null,
    partOfSpeech: main.partOfSpeech,
    definition: main.defs[0].text,
    example: senses.flatMap((s) => s.defs).find((d) => d.example)?.example ?? null,
    synonyms: [],
    more: senses.slice(1, 3).map((s) => ({ partOfSpeech: s.partOfSpeech, definition: s.defs[0].text })),
  };
};

class Offline extends Error {}

/** GET JSON with a timeout. Resolves null on 404; throws Offline when unreachable. */
async function getJSON<T>(url: string, timeoutMs: number): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      // Wikimedia rejects requests without an identifying User-Agent (HTTP 403).
      headers: {
        'User-Agent': 'ShelfReader/1.0 (https://github.com/mraigeneralist/reader-app)',
        'Api-User-Agent': 'ShelfReader/1.0 (https://github.com/mraigeneralist/reader-app)',
        Accept: 'application/json',
      },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Offline(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (e) {
    console.warn(`Dictionary request failed: ${url} → ${e instanceof Error ? e.message : String(e)}`);
    throw e instanceof Offline ? e : new Offline(String(e));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * One word: cache first, then both online sources in parallel. The Free
 * Dictionary API is preferred (pronunciation, synonyms) when it answers in
 * time; Wiktionary covers it when it's slow, down or missing the word.
 * Throws Offline only when neither source could be reached.
 */
async function lookupOne(word: string): Promise<DictionaryEntry | null> {
  const cached = fromCache(word);
  if (cached) return cached.entry ? (JSON.parse(cached.entry) as DictionaryEntry) : null;

  const [primary, fallback] = await Promise.allSettled([
    getJSON<ApiEntry[]>(API + encodeURIComponent(word), 4000),
    getJSON<WiktionaryResponse>(WIKTIONARY + encodeURIComponent(word), 8000),
  ]);
  const fromPrimary = primary.status === 'fulfilled' && primary.value ? parse(primary.value) : null;
  const fromFallback =
    fallback.status === 'fulfilled' && fallback.value ? parseWiktionary(word, fallback.value) : null;
  const entry = fromPrimary ?? fromFallback;

  if (!entry && primary.status === 'rejected' && fallback.status === 'rejected') throw new Offline();
  // Remember a miss only when both sources answered, so an outage isn't cached.
  if (entry || (primary.status === 'fulfilled' && fallback.status === 'fulfilled')) await toCache(word, entry);
  return entry;
}

/**
 * Looks a word up in the English dictionary (dictionaryapi.dev). Results,
 * including "not found", are cached on the device so repeat lookups work offline.
 */
export async function lookup(raw: string): Promise<LookupResult> {
  const word = normalizeWord(raw);
  if (!word) return { status: 'not-found' };
  try {
    for (const candidate of [word, ...baseForms(word)]) {
      const entry = await lookupOne(candidate);
      if (entry) return { status: 'found', entry, lookedUp: candidate };
    }
    return { status: 'not-found' };
  } catch {
    return { status: 'offline' };
  }
}
