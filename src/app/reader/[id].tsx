import * as Brightness from 'expo-brightness';
import * as Clipboard from 'expo-clipboard';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Highlighter, List, Type } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, IconButton, Slider, Txt } from '@/components';
import { getBook, markFinished, saveReadingPosition, type ReadingPosition } from '@/db/books';
import { addHighlight, deleteHighlight, useHighlights } from '@/db/highlights';
import { useSetting } from '@/db/settings';
import { EngineView, type EngineHandle } from '@/engine/EngineView';
import { ContentsPanel, type TocItem } from '@/features/reader/ContentsPanel';
import { DictionarySheet } from '@/features/reader/DictionarySheet';
import { SelectionMenu, type MenuAction } from '@/features/reader/SelectionMenu';
import { ReadingSettingsSheet } from '@/features/reader/ReadingSettingsSheet';
import { bookFile } from '@/library/storage';
import { border, colors, font, readerThemes, themed } from '@/theme';

type Position = {
  cfi: string;
  fraction: number;
  page: number;
  pages: number;
  tocLabel: string;
  tocHref: string | null;
  atEnd: boolean;
};

const SAVE_DELAY = 400;

type Rect = { x: number; y: number; width: number; height: number };
type Selection = { text: string; word: boolean; cfi: string; rect: Rect };
type HighlightTap = { cfi: string; rect: Rect };

/** Screens 21–22 · Reader, with Contents (23) and Reading Settings (24). */
export default function ReaderScreen() {
  const { id, target } = useLocalSearchParams<{ id: string; target?: string }>();
  // Read once: the reader owns the position while it's open.
  const [book] = useState(() => getBook(id));
  const prefs = useSetting('readerPrefs');
  const insets = useSafeAreaInsets();
  const engine = useRef<EngineHandle>(null);

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const [pos, setPos] = useState<Position | null>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const [controls, setControls] = useState(false);
  const [panel, setPanel] = useState<'toc' | 'settings' | null>(null);
  const [toc, setToc] = useState<TocItem[] | null>(null);
  const [systemBrightness, setSystemBrightness] = useState(0.6);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [tappedHighlight, setTappedHighlight] = useState<HighlightTap | null>(null);
  const [defineWord, setDefineWord] = useState<string | null>(null);
  const [pageTop, setPageTop] = useState(0);
  const highlights = useHighlights(id);

  const pendingSave = useRef<ReadingPosition | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedHandled = useRef(!!book?.finishedAt);

  const theme = readerThemes[prefs.theme];

  const flushSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    const p = pendingSave.current;
    pendingSave.current = null;
    if (p && book) saveReadingPosition(book.id, p);
  }, [book]);

  // Save on leaving the reader.
  useEffect(() => flushSave, [flushSave]);

  // Screen brightness while reading; the system level comes back on exit.
  useEffect(() => {
    Brightness.getBrightnessAsync()
      .then(setSystemBrightness)
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (prefs.brightness != null) Brightness.setBrightnessAsync(prefs.brightness).catch(() => {});
  }, [prefs.brightness]);
  useEffect(() => () => void Brightness.restoreSystemBrightnessAsync().catch(() => {}), []);

  // Apply reading settings to the open book as they change.
  const opened = status === 'ready';
  useEffect(() => {
    if (opened) engine.current?.request('prefs', prefs).catch(() => {});
  }, [opened, prefs]);

  const clearSelection = () => {
    setSelection(null);
    setTappedHighlight(null);
    engine.current?.request('clearSelection').catch(() => {});
  };

  // Android back closes overlays before leaving the book.
  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (panel) {
          setPanel(null);
          return true;
        }
        if (selection || tappedHighlight) {
          clearSelection();
          return true;
        }
        if (controls) {
          setControls(false);
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, [panel, controls, selection, tappedHighlight]),
  );

  const open = async () => {
    if (!book) return;
    try {
      const file = bookFile(book.fileName);
      if (!file.exists) throw new Error('The book file is missing. Try importing it again.');
      await engine.current!.request(
        'open',
        {
          url: file.uri,
          name: book.fileName,
          location: target || book.location,
          prefs,
          highlights: highlights.map((h) => ({ cfi: h.location, color: h.color })),
        },
        120_000,
      );
      setStatus('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus('error');
    }
  };

  const onEvent = (type: string, payload: any) => {
    if (type === 'relocate') {
      const p = payload as Position;
      setPos(p);
      pendingSave.current = {
        location: p.cfi,
        progress: p.fraction,
        currentPage: p.page,
        pageCount: p.pages,
        chapterLabel: p.tocLabel || null,
      };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flushSave, SAVE_DELAY);
      if (p.atEnd && !finishedHandled.current && book) {
        finishedHandled.current = true;
        flushSave();
        markFinished(book.id, true).then(() => router.push({ pathname: '/end/[id]', params: { id: book.id } }));
      }
    } else if (type === 'tap') {
      setTappedHighlight(null);
      if (payload.zone === 'center') setControls((c) => !c);
      else setControls(false);
    } else if (type === 'selection') {
      setSelection(payload);
      setTappedHighlight(null);
      if (payload) setControls(false);
    } else if (type === 'highlight-tap') {
      setTappedHighlight(payload);
      setControls(false);
    }
  };

  const openContents = async () => {
    setPanel('toc');
    if (!toc) setToc(await engine.current!.request<TocItem[]>('toc').catch(() => []));
  };

  const goTo = (target: string) => {
    setPanel(null);
    setControls(false);
    engine.current?.request('goTo', { target }).catch(() => {});
  };

  // --- selection, highlights, dictionary (screens 25–29) ---

  // The database is the source of truth: whenever highlights change (added
  // here, deleted in the list), the page is redrawn to match.
  const highlightKey = highlights.map((h) => h.id).join(',');
  useEffect(() => {
    if (!opened) return;
    engine.current
      ?.request('highlights', { items: highlights.map((h) => ({ cfi: h.location, color: h.color })) })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, highlightKey]);

  const saveHighlight = async (sel: Selection) => {
    if (!book) return;
    await addHighlight({
      bookId: book.id,
      text: sel.text,
      location: sel.cfi,
      page: pos?.page ?? book.currentPage,
      position: pos?.fraction ?? book.progress,
      color: colors.highlight,
    });
  };

  const onMenu = async (action: MenuAction) => {
    if (tappedHighlight) {
      const h = highlights.find((x) => x.location === tappedHighlight.cfi);
      if (action === 'remove' && h) await deleteHighlight(h.id);
      if (action === 'copy' && h) await Clipboard.setStringAsync(h.text);
      clearSelection();
      return;
    }
    if (!selection) return;
    if (action === 'highlight') {
      await saveHighlight(selection);
      clearSelection();
    } else if (action === 'copy') {
      await Clipboard.setStringAsync(selection.text);
      clearSelection();
    } else if (action === 'define') {
      // Keep the word selected under the sheet, as in the design.
      setDefineWord(selection.text);
    }
  };

  const closeDictionary = () => {
    setDefineWord(null);
    clearSelection();
  };

  const highlightFromDictionary = async () => {
    if (selection) await saveHighlight(selection);
    closeDictionary();
  };

  // Tapping a highlight in the list returns here with a new target.
  const appliedTarget = useRef(target);
  useEffect(() => {
    if (!opened || !target || target === appliedTarget.current) return;
    appliedTarget.current = target;
    setControls(false);
    engine.current?.request('goTo', { target }).catch(() => {});
  }, [opened, target]);

  if (!book) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Txt variant="title">This book is no longer in your library.</Txt>
        <Button onPress={() => router.back()}>Back</Button>
      </View>
    );
  }

  const page = pos?.page ?? Math.max(1, book.currentPage);
  const pages = pos?.pages || book.pageCount;
  const fraction = pos?.fraction ?? book.progress;
  const chapter = pos?.tocLabel ?? book.chapterLabel ?? '';
  const scrubPage = scrub != null && pages ? Math.max(1, Math.round(scrub * pages)) : null;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar style={prefs.theme === 'dark' ? 'light' : 'dark'} />
      <View style={{ height: insets.top, backgroundColor: theme.background }} />

      {/* Running head (screen 21) */}
      <Txt style={styles.head} color={theme.ink} numberOfLines={1}>
        {chapter}
      </Txt>

      <View style={styles.page} onLayout={(e) => setPageTop(e.nativeEvent.layout.y)}>
        <EngineView
          ref={engine}
          onReady={open}
          onEvent={onEvent}
          backgroundColor={theme.background}
          suppressSelectionMenu
        />
        {status === 'loading' && (
          <View style={[styles.overlay, { backgroundColor: theme.background }]}>
            <ActivityIndicator color={theme.ink} />
            <Txt variant="label" color={theme.ink}>
              Opening book…
            </Txt>
          </View>
        )}
        {status === 'error' && (
          <View style={[styles.overlay, styles.errorBox, { backgroundColor: colors.cream }]}>
            <Txt variant="title">This book won’t open.</Txt>
            <Txt variant="body">{error}</Txt>
            <Button tone="paper" onPress={() => router.back()}>
              Back
            </Button>
          </View>
        )}
      </View>

      <View style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 16) + 14 }]}>
        <Txt style={styles.footText} color={theme.ink}>
          {pages ? `Page ${page} of ${pages}` : ''}
        </Txt>
        <Txt style={styles.footText} color={theme.ink}>
          {Math.round(fraction * 100)}%
        </Txt>
      </View>

      {/* Controls (screen 22) */}
      {controls && (
        <>
          <View style={[styles.topBar, { top: insets.top }]}>
            <IconButton icon={ChevronLeft} label="Back to library" onPress={() => router.back()} />
            <Txt style={styles.topTitle} numberOfLines={2}>
              {book.title}
            </Txt>
            <View style={styles.topActions}>
              <IconButton icon={List} label="Contents" onPress={openContents} />
              <View>
                <IconButton
                  icon={Highlighter}
                  label={`Highlights (${highlights.length})`}
                  tone={highlights.length ? 'primary' : 'paper'}
                  onPress={() => router.push({ pathname: '/highlights/[id]', params: { id: book.id } })}
                />
                {highlights.length > 0 && (
                  <View style={styles.countBadge} pointerEvents="none">
                    <Badge tone="new">{highlights.length}</Badge>
                  </View>
                )}
              </View>
              <IconButton icon={Type} label="Reading settings" onPress={() => setPanel('settings')} />
            </View>
          </View>
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
            <View style={styles.spread}>
              <Txt variant="label" style={styles.flex} numberOfLines={1}>
                {chapter ? (/^(ch\.?|chapter)\s/i.test(chapter) ? chapter : `Ch. ${chapter}`) : book.title}
              </Txt>
              <Txt variant="label">{Math.round((scrub ?? fraction) * 100)}%</Txt>
            </View>
            <Slider
              value={fraction}
              thumbShadow
              accessibilityLabel="Reading position"
              onChange={setScrub}
              onCommit={(f) => {
                setScrub(null);
                engine.current?.request('goToFraction', { fraction: f }).catch(() => {});
              }}
            />
            <View style={styles.spread}>
              <Txt variant="caption">{pages ? `Page ${scrubPage ?? page} of ${pages}` : ''}</Txt>
              <Txt variant="caption">{pages ? `${Math.max(0, pages - (scrubPage ?? page))} pages left` : ''}</Txt>
            </View>
          </View>
        </>
      )}

      {panel === 'toc' && (
        <ContentsPanel
          items={toc}
          currentHref={pos?.tocHref ?? null}
          currentPage={page}
          onSelect={(item) => goTo(item.href)}
          onClose={() => setPanel(null)}
        />
      )}

      {selection && !defineWord && (
        <SelectionMenu
          rect={selection.rect}
          pageTop={pageTop}
          actions={selection.word ? ['highlight', 'define', 'copy'] : ['highlight', 'copy']}
          primary={selection.word ? 'define' : 'highlight'}
          onAction={onMenu}
        />
      )}
      {tappedHighlight && !selection && (
        <SelectionMenu
          rect={tappedHighlight.rect}
          pageTop={pageTop}
          actions={['remove', 'copy']}
          primary="remove"
          onAction={onMenu}
        />
      )}

      <DictionarySheet word={defineWord} onClose={closeDictionary} onHighlight={highlightFromDictionary} />

      <ReadingSettingsSheet
        open={panel === 'settings'}
        onClose={() => setPanel((p) => (p === 'settings' ? null : p))}
        prefs={prefs}
        systemBrightness={systemBrightness}
      />
    </View>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    screen: { flex: 1 },
    flex: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
    head: { ...font(13, 1.2, '600'), textAlign: 'center', paddingTop: 10, paddingBottom: 4, paddingHorizontal: 28 },
    page: { flex: 1 },
    overlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 12 },
    errorBox: { padding: 24, alignItems: 'flex-start', gap: 14 },
    foot: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingHorizontal: 28 },
    footText: font(13, 1, '600'),
    topBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingTop: 6,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.white,
      borderBottomWidth: border.width,
      borderBottomColor: colors.black,
    },
    topTitle: { ...font(15, 1.1, '700'), flex: 1, textAlign: 'center' },
    topActions: { flexDirection: 'row', gap: 8 },
    countBadge: { position: 'absolute', right: -8, top: -8 },
    bottomBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      gap: 14,
      paddingTop: 16,
      paddingHorizontal: 20,
      backgroundColor: colors.white,
      borderTopWidth: border.width,
      borderTopColor: colors.black,
    },
    spread: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  }),
);
