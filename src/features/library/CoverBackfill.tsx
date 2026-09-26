import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { booksNeedingCover, setBookCover } from '@/db/books';
import { EngineView, type EngineHandle } from '@/engine/EngineView';
import { bookFile, saveCover } from '@/library/storage';

/**
 * Finds cover images for books imported before covers were extracted.
 * Runs once per app session in a hidden engine, one book at a time; each book
 * is marked as checked, so books without a cover aren't retried.
 */
export function CoverBackfill() {
  const engine = useRef<EngineHandle>(null);
  const started = useRef(false);

  const run = async () => {
    if (started.current) return;
    started.current = true;
    for (const book of booksNeedingCover()) {
      let name: string | null = null;
      try {
        const file = bookFile(book.fileName);
        if (file.exists) {
          const { cover } = await engine.current!.request<{ cover: string | null }>(
            'cover',
            { url: file.uri, name: book.fileName },
            120_000,
          );
          if (cover) name = saveCover(book.id, cover);
        }
      } catch (e) {
        console.warn(`Cover lookup failed for "${book.title}": ${e instanceof Error ? e.message : e}`);
      }
      await setBookCover(book.id, name);
    }
  };

  // Nothing to do: don't even start a WebView.
  const [needed] = useState(() => booksNeedingCover().length > 0);
  useEffect(() => () => void (started.current = true), []);
  if (!needed) return null;

  return (
    <View style={styles.hidden} pointerEvents="none">
      <EngineView ref={engine} onReady={run} />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0, left: 0, top: 0 },
});
