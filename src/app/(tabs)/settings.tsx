import Constants from 'expo-constants';
import { Directory, Paths } from 'expo-file-system';
import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Screen, ScreenHeader, Segmented, Txt } from '@/components';
import { useAllBooks } from '@/db/books';
import { setSetting, useSetting } from '@/db/settings';
import { ReadingSettingsSheet } from '@/features/reader/ReadingSettingsSheet';
import { resetApp } from '@/library/resetApp';
import { returnAfterThemeChange } from '@/lib/themeReturn';
import { formatBytes, libraryBytes } from '@/library/storage';
import { border, colors, font, themed } from '@/theme';

type Row = { label: string; value?: string; onPress?: () => void };

function Group({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <View style={styles.group}>
      <Txt variant="overline">{title}</Txt>
      <Card padding={0}>
        {rows.map((r, i) => (
          <Fragment key={r.label}>
            <Pressable
              onPress={r.onPress}
              accessibilityRole="button"
              style={[styles.row, i < rows.length - 1 && styles.divider]}>
              <Txt style={[font(16, 1.2, '600'), styles.flex]}>{r.label}</Txt>
              {!!r.value && <Txt style={font(15, 1.2, '500')}>{r.value}</Txt>}
              <Icon icon={ChevronRight} size={20} />
            </Pressable>
          </Fragment>
        ))}
      </Card>
    </View>
  );
}

const pickerCache = () => new Directory(Paths.cache, 'DocumentPicker');

const LINE_LABELS = { tight: 'Tight', normal: 'Normal', relaxed: 'Relaxed' } as const;
const THEME_LABELS = { light: 'Light', sepia: 'Sepia', dark: 'Dark' } as const;

/** Screen 33 · App settings */
export default function SettingsScreen() {
  const prefs = useSetting('readerPrefs');
  const appearance = useSetting('appearance');
  const books = useAllBooks();
  const [sheet, setSheet] = useState(false);
  const [cacheBytes, setCacheBytes] = useState(() => (pickerCache().exists ? (pickerCache().size ?? 0) : 0));
  const openSheet = () => setSheet(true);

  const clearCache = () => {
    try {
      const dir = pickerCache();
      if (dir.exists) dir.delete();
    } catch {}
    setCacheBytes(0);
    Alert.alert('Import cache cleared', 'Temporary copies of picked files were removed. Your books are untouched.');
  };

  const version = `${Constants.expoConfig?.version ?? '1.0.0'}`;

  const confirmRestart = () =>
    Alert.alert(
      'Restart Shelf?',
      'All your reading progress and imported books will be gone, along with your highlights, categories and settings. You’ll start again from the introduction. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          style: 'destructive',
          onPress: async () => {
            await resetApp();
            router.replace('/onboarding');
          },
        },
      ],
    );

  return (
    <Screen contentStyle={styles.body} header={<ScreenHeader left={<Txt variant="pageTitle">Settings</Txt>} />}>
      <View style={styles.group}>
        <Txt variant="overline">APPEARANCE</Txt>
        <Segmented
          options={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
          value={appearance}
          onChange={(value) => {
            returnAfterThemeChange('/settings');
            setSetting('appearance', value);
          }}
        />
      </View>
      <Group
        title="READING DEFAULTS"
        rows={[
          {
            label: 'Font & size',
            value: `${prefs.font === 'mono' ? 'Mono' : 'Archivo'}, ${prefs.fontSize}`,
            onPress: openSheet,
          },
          { label: 'Line spacing', value: LINE_LABELS[prefs.lineSpacing], onPress: openSheet },
          { label: 'Page theme', value: THEME_LABELS[prefs.theme], onPress: openSheet },
          { label: 'Page movement', value: prefs.movement === 'scroll' ? 'Scroll' : 'Page turn', onPress: openSheet },
        ]}
      />
      <Group
        title="DICTIONARY"
        rows={[
          {
            label: 'Language',
            value: 'English',
            onPress: () =>
              Alert.alert(
                'Dictionary language',
                'Definitions come from an English dictionary. Words you look up are saved on this phone, so they work offline next time.',
              ),
          },
        ]}
      />
      <Group
        title="STORAGE"
        rows={[
          {
            label: 'Manage files',
            value: `${books.length} ${books.length === 1 ? 'book' : 'books'} · ${formatBytes(libraryBytes())}`,
            onPress: () => router.navigate('/library'),
          },
          { label: 'Clear import cache', value: formatBytes(cacheBytes), onPress: clearCache },
        ]}
      />
      <Group
        title="ABOUT"
        rows={[
          {
            label: 'Help & feedback',
            onPress: () => Linking.openURL('https://github.com/mraigeneralist/reader-app/issues'),
          },
          {
            label: 'Show introduction',
            onPress: async () => {
              await setSetting('onboarded', false);
              router.replace('/onboarding');
            },
          },
          { label: 'Version', value: version },
        ]}
      />
      <View style={styles.group}>
        <Txt variant="overline">RESET</Txt>
        <Button tone="pink" block onPress={confirmRestart}>
          Restart App
        </Button>
        <Txt variant="captionRegular">
          Deletes every imported book, your reading progress, highlights and categories from this phone, then starts
          again from the introduction.
        </Txt>
      </View>
      <ReadingSettingsSheet open={sheet} onClose={() => setSheet(false)} prefs={prefs} systemBrightness={0.6} />
    </Screen>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    body: { gap: 18 },
    group: { gap: 10 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, paddingHorizontal: 16 },
    divider: { borderBottomWidth: border.width, borderBottomColor: colors.black },
    flex: { flex: 1 },
  }),
);
