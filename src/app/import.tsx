import { File, Paths } from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import {
  BookOpen,
  Box,
  FileX,
  FolderOpen,
  HardDrive,
  Smartphone,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  Check,
  BookCover,
  Icon,
  IconButton,
  IconTile,
  ProgressBar,
  Screen,
  ScreenHeader,
  Surface,
  Txt,
} from '@/components';
import type { Book } from '@/db/schema';
import { EngineView, type EngineHandle } from '@/engine/EngineView';
import { extensionOf, formatLabel, isSupported, SUPPORTED_BADGES } from '@/library/formats';
import { importFile, pickFiles, STAGE_LABELS, type ImportStage, type PickedFile } from '@/library/importBooks';
import { formatBytes } from '@/library/storage';
import { border, colors, font, palette, radius, shadow, themed } from '@/theme';

type Failure = { file: PickedFile; message: string };
type Phase =
  | { kind: 'choose' }
  | { kind: 'working'; file: PickedFile; index: number; total: number; stage: ImportStage; fraction: number }
  | { kind: 'done'; added: Book[]; failed: Failure[] };

// Android's file picker covers all of these, so every tile opens it.
const SOURCES: { label: string; icon: LucideIcon; color: string }[] = [
  { label: 'This phone', icon: Smartphone, color: palette.yellow },
  { label: 'Google Drive', icon: HardDrive, color: palette.green },
  { label: 'Dropbox', icon: Box, color: palette.pink },
  { label: 'Other apps', icon: FolderOpen, color: palette.purple },
];

function Header({ title, onClose }: { title?: string; onClose: () => void }) {
  return (
    <ScreenHeader
      left={<IconButton icon={X} label="Close" onPress={onClose} />}
      center={title ? <Txt variant="cardTitle">{title}</Txt> : undefined}
      right={<View style={styles.headerSpacer} />}
    />
  );
}

function SourceTile({ label, icon, color, onPress }: (typeof SOURCES)[number] & { onPress: () => void }) {
  return (
    <Surface
      shadow={shadow.md}
      onPress={onPress}
      accessibilityLabel={`Import from ${label}`}
      containerStyle={styles.tileBox}
      style={styles.tile}>
      <IconTile icon={icon} color={color} size={40} iconSize={22} />
      <Txt variant="bookTitle">{label}</Txt>
    </Surface>
  );
}

function FileRow({ file, checked, onToggle }: { file: PickedFile; checked: boolean; onToggle: () => void }) {
  const supported = isSupported(file.ext);
  return (
    <Pressable
      onPress={supported ? onToggle : undefined}
      style={styles.fileRow}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: !supported }}>
      <View style={styles.extTile}>
        <Txt variant="micro">{formatLabel(file.ext) || '?'}</Txt>
      </View>
      <View style={styles.fileInfo}>
        <Txt variant="mono">{file.name}</Txt>
        <Txt variant="captionRegular">
          {supported ? formatBytes(file.size) : `${formatBytes(file.size)} · Not a supported format`}
        </Txt>
      </View>
      {supported && <Check checked={checked} />}
    </Pressable>
  );
}

/**
 * Development-only test hook: `folio://import?devFiles=a.epub,b.pdf` pre-selects
 * files copied with `adb shell run-as` into the app's files/dev-samples/
 * folder, so every format can be tested
 * without driving the system picker. Compiled out of release builds.
 */
function devPicked(devFiles?: string): PickedFile[] {
  if (!__DEV__ || !devFiles) return [];
  return devFiles.split(',').map((name) => {
    const file = new File(Paths.document, 'dev-samples', name);
    return { uri: file.uri, name, size: file.exists ? file.size : 0, ext: extensionOf(name) };
  });
}

/** Screens 16–19 · Import: choose files, progress, success and errors. */
export default function ImportScreen() {
  const engine = useRef<EngineHandle>(null);
  const onEngineEventRef = useRef<(type: string, payload: any) => void>(() => {});
  // The engine stays mounted in the same place across phases so an import in progress is never torn down.
  return (
    <View style={styles.root}>
      <ImportContent engine={engine} onEngineEventRef={onEngineEventRef} />
      <View style={styles.hiddenEngine} pointerEvents="none">
        <EngineView ref={engine} onEvent={(t, p) => onEngineEventRef.current(t, p)} />
      </View>
    </View>
  );
}

function ImportContent({
  engine,
  onEngineEventRef,
}: {
  engine: RefObject<EngineHandle | null>;
  onEngineEventRef: RefObject<(type: string, payload: any) => void>;
}) {
  const stageListener = useRef<((stage: ImportStage, fraction: number) => void) | null>(null);
  const cancelled = useRef(false);
  const { devFiles } = useLocalSearchParams<{ devFiles?: string }>();
  const [picked, setPicked] = useState<PickedFile[]>(() => devPicked(devFiles));
  const [selected, setSelected] = useState<Set<string>>(() => new Set(picked.map((f) => f.uri)));
  const [phase, setPhase] = useState<Phase>({ kind: 'choose' });

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const choose = async () => {
    const files = await pickFiles();
    if (!files?.length) return;
    // Add to what's already picked; select the supported ones.
    setPicked((prev) => [...prev.filter((p) => !files.some((f) => f.uri === p.uri)), ...files]);
    setSelected((prev) => new Set([...prev, ...files.filter((f) => isSupported(f.ext)).map((f) => f.uri)]));
  };

  const toggle = (uri: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uri)) next.delete(uri);
      else next.add(uri);
      return next;
    });

  const run = async () => {
    const queue = picked.filter((f) => selected.has(f.uri));
    const added: Book[] = [];
    const failed: Failure[] = [];
    cancelled.current = false;
    for (const [index, file] of queue.entries()) {
      if (cancelled.current) break;
      const update = (stage: ImportStage, fraction: number) =>
        setPhase({ kind: 'working', file, index, total: queue.length, stage, fraction });
      stageListener.current = update;
      update('copying', 0.05);
      try {
        added.push(await importFile(engine.current!, file, update));
      } catch (e) {
        failed.push({ file, message: e instanceof Error ? e.message : String(e) });
      }
    }
    stageListener.current = null;
    // Unsupported files the user picked are reported too.
    for (const f of picked)
      if (!isSupported(f.ext))
        failed.push({ file: f, message: 'Unsupported format. Save it as PDF or DOCX and try again.' });
    setPicked([]);
    setSelected(new Set());
    setPhase({ kind: 'done', added, failed });
  };

  useEffect(() => {
    onEngineEventRef.current = (type, payload) => {
      if (type === 'import-progress') stageListener.current?.(payload.stage, payload.fraction);
    };
  }, [onEngineEventRef]);

  if (phase.kind === 'working') {
    const { file, index, total, stage, fraction } = phase;
    const pct = Math.round(fraction * 100);
    return (
      <Screen
        bottomInset
        scroll={false}
        header={<Header title="Import Book" onClose={() => (cancelled.current = true)} />}
        footer={
          <Button tone="paper" size="lg" block onPress={() => (cancelled.current = true)}>
            Cancel import
          </Button>
        }>
        <View style={styles.progressBody}>
          <View style={styles.placeholderCover}>
            <Icon icon={BookOpen} size={32} />
          </View>
          <View style={styles.center}>
            <Txt style={[font(15, 1.3, '600', 0, 'JetBrains Mono'), styles.textCenter]}>{file.name}</Txt>
            <Txt variant="captionRegular">
              {formatBytes(file.size)} · {formatLabel(file.ext)}
            </Txt>
          </View>
          <View style={styles.progressBlock}>
            <ProgressBar value={fraction} />
            <View style={styles.spread}>
              <Txt variant="label">
                {total > 1 ? `Book ${index + 1} of ${total} · ` : ''}
                {STAGE_LABELS[stage]}
              </Txt>
              <Txt variant="label">{pct}%</Txt>
            </View>
          </View>
        </View>
      </Screen>
    );
  }

  if (phase.kind === 'done') {
    const { added, failed } = phase;
    if (failed.length === 0 && added.length > 0) {
      const book = added[0];
      const single = added.length === 1;
      return (
        <Screen
          bottomInset
          scroll={false}
          header={<Header onClose={close} />}
          footer={
            <>
              <Button
                size="lg"
                block
                onPress={() => router.replace({ pathname: '/reader/[id]', params: { id: book.id } })}>
                {single ? 'Start reading' : `Start “${book.title.slice(0, 18)}${book.title.length > 18 ? '…' : ''}”`}
              </Button>
              <Button
                tone="paper"
                size="lg"
                block
                onPress={() =>
                  single
                    ? router.replace({ pathname: '/book/[id]', params: { id: book.id } })
                    : router.replace('/library')
                }>
                {single ? 'Choose category' : 'Go to Library'}
              </Button>
            </>
          }>
          <View style={styles.decorCircle} />
          <View style={styles.successBody}>
            <BookCover book={book} size="lg" />
            <Badge tone="new">NEW</Badge>
            <Txt variant="display">{single ? 'Added to\nyour library.' : `${added.length} books\nadded.`}</Txt>
            <Txt variant="body">
              {single
                ? [
                    book.author ? `${book.title} by ${book.author}` : book.title,
                    formatLabel(book.format),
                    book.pageCount ? `${book.pageCount} pages` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ')
                : added.map((b) => b.title).join(' · ')}
            </Txt>
          </View>
        </Screen>
      );
    }

    return (
      <Screen
        bottomInset
        header={<Header title="Import Book" onClose={close} />}
        contentStyle={styles.errorBody}
        footer={
          <>
            <Button size="lg" block onPress={() => setPhase({ kind: 'choose' })}>
              Choose another file
            </Button>
            <Button tone="paper" size="lg" block onPress={close}>
              Done
            </Button>
          </>
        }>
        <IconTile icon={TriangleAlert} color={palette.pink} size={64} iconSize={30} />
        <Txt variant="display">
          {failed.length === 1
            ? '1 file\nwon’t open.'
            : failed.length === 0
              ? 'Nothing\nimported.'
              : `${failed.length} files\nwon’t open.`}
        </Txt>
        {added.length > 0 && (
          <Txt variant="subtitle">
            {added.length === 1 ? `“${added[0].title}” was added.` : `${added.length} other books were added.`}
          </Txt>
        )}
        {failed.map(({ file, message }) => (
          <Card key={file.uri} padding={14}>
            <View style={styles.failRow}>
              <IconTile icon={FileX} color={palette.pink} size={44} iconSize={22} />
              <View style={styles.fileInfo}>
                <Txt variant="mono">{file.name}</Txt>
                <Txt variant="author">{message}</Txt>
              </View>
            </View>
          </Card>
        ))}
        <View style={styles.supported}>
          <Txt variant="overline">SUPPORTED</Txt>
          <View style={styles.badges}>
            {SUPPORTED_BADGES.map((b) => (
              <Badge key={b} tone="paper">
                {b}
              </Badge>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  const count = picked.filter((f) => selected.has(f.uri)).length;
  return (
    <Screen
      bottomInset
      header={<Header title="Import Book" onClose={close} />}
      contentStyle={styles.chooseBody}
      footer={
        <Button size="lg" block disabled={count === 0} onPress={run}>
          {count === 0 ? 'Import' : count === 1 ? 'Import 1 book' : `Import ${count} books`}
        </Button>
      }>
      <View style={styles.tiles}>
        {SOURCES.map((s) => (
          <SourceTile key={s.label} {...s} onPress={choose} />
        ))}
      </View>
      {picked.length > 0 ? (
        <View style={styles.section}>
          <Txt variant="overline">SELECTED</Txt>
          <View>
            {picked.map((f) => (
              <FileRow key={f.uri} file={f} checked={selected.has(f.uri)} onToggle={() => toggle(f.uri)} />
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <Txt variant="body">
            Pick one or more books. Android’s file picker lists this phone, Downloads, Google Drive, Dropbox and any
            other storage app you have.
          </Txt>
          <View style={styles.badges}>
            {SUPPORTED_BADGES.map((b) => (
              <Badge key={b} tone="paper">
                {b}
              </Badge>
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    headerSpacer: { width: 40 },
    root: { flex: 1 },
    hiddenEngine: { position: 'absolute', width: 1, height: 1, opacity: 0, left: 0, top: 0 },
    chooseBody: { gap: 22 },
    tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
    tileBox: { width: '47%', flexGrow: 1 },
    tile: {
      backgroundColor: colors.white,
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.lg,
      padding: 14,
      gap: 12,
    },
    section: { gap: 10 },
    fileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      borderBottomWidth: border.width,
      borderBottomColor: colors.black,
    },
    extTile: {
      width: 52,
      height: 52,
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.md,
      backgroundColor: colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileInfo: { flex: 1, minWidth: 0, gap: 4 },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    progressBody: { flex: 1, alignItems: 'center', gap: 26, paddingTop: 80 },
    placeholderCover: {
      width: 104,
      height: 152,
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.sm,
      backgroundColor: colors.creamDeep,
      alignItems: 'center',
      justifyContent: 'center',
    },
    center: { alignItems: 'center', gap: 6 },
    textCenter: { textAlign: 'center' },
    progressBlock: { alignSelf: 'stretch', gap: 8 },
    spread: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
    decorCircle: {
      position: 'absolute',
      right: -90,
      top: 10,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: palette.green,
    },
    successBody: { paddingTop: 40, gap: 22, alignItems: 'flex-start' },
    errorBody: { gap: 18 },
    failRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    supported: { gap: 8 },
  }),
);
