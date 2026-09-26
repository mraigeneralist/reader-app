import { router } from 'expo-router';
import { BookOpen, File, FileText, FileType, Tablet, Text as TextIcon, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, Button, Card, IconTile, Surface, TextLink, Txt } from '@/components';
import { setSetting } from '@/db/settings';
import { border, colors, font, layout, palette, radius, shadow, themed } from '@/theme';

const finish = async () => {
  await setSetting('onboarded', true);
  router.replace('/');
};

function Dots({ index }: { index: number }) {
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={[styles.dot, i === index ? styles.dotOn : null]} />
      ))}
    </View>
  );
}

const FORMATS: { label: string; icon: LucideIcon; color: string }[] = [
  { label: 'PDF', icon: FileText, color: palette.pink },
  { label: 'EPUB', icon: BookOpen, color: palette.green },
  { label: 'MOBI', icon: Tablet, color: palette.tan },
  { label: 'DOCX', icon: FileType, color: palette.purple },
  { label: 'TXT', icon: TextIcon, color: palette.lime },
  { label: 'RTF', icon: File, color: palette.gray },
];

function ImportArt() {
  return (
    <>
      <View
        style={[
          styles.shape,
          { left: -80, top: 40, width: 220, height: 220, borderRadius: 110, backgroundColor: palette.purple },
        ]}
      />
      <View style={styles.formatGrid}>
        {FORMATS.map((f) => (
          <View key={f.label} style={styles.formatCell}>
            <Card padding={14} style={styles.formatCard}>
              <IconTile icon={f.icon} color={f.color} size={44} iconSize={22} />
              <Txt variant="cardTitle">{f.label}</Txt>
            </Card>
          </View>
        ))}
      </View>
    </>
  );
}

function HighlightArt() {
  return (
    <>
      <View style={[styles.shape, { right: -90, top: 10, width: 240, height: 180, backgroundColor: palette.pink }]} />
      <View style={styles.full}>
        <Card padding={20}>
          <Text style={font(17, 1.55, '500')}>
            He kept them in shoeboxes, dated in pencil.{' '}
            <Text style={{ backgroundColor: colors.yellow, color: colors.textOnAccent }}>
              The habit was the house he had built so the weather wouldn’t matter.
            </Text>{' '}
            He had never once reread them.
          </Text>
        </Card>
        <View style={styles.floatingButton}>
          <Button size="sm">Highlight</Button>
        </View>
      </View>
    </>
  );
}

function DictionaryArt() {
  return (
    <>
      <View
        style={[
          styles.shape,
          { left: -60, bottom: 0, width: 200, height: 200, borderRadius: 100, backgroundColor: palette.green },
        ]}
      />
      <View style={styles.full}>
        <Card padding={20} style={styles.defCard}>
          <View style={styles.defHead}>
            <Txt style={font(26, 1.2, '700', -0.02)}>equanimity</Txt>
            <Badge tone="info">NOUN</Badge>
          </View>
          <Txt style={font(14, 1, '500', 0, 'JetBrains Mono')}>/ˌek.wəˈnɪm.ɪ.ti/</Txt>
          <Txt variant="body">Mental calmness and evenness of temper, especially in a difficult situation.</Txt>
        </Card>
      </View>
    </>
  );
}

const STEPS: { title: string; body: string; art: () => ReactNode; action: string }[] = [
  {
    title: 'Bring any book.',
    body: 'Import PDF, EPUB, MOBI, DOCX and TXT files from your phone or cloud storage.',
    art: ImportArt,
    action: 'Next',
  },
  {
    title: 'Keep the good lines.',
    body: 'Press and hold a passage, then tap Highlight. Every book keeps its own list.',
    art: HighlightArt,
    action: 'Next',
  },
  {
    title: 'Look it up. Stay put.',
    body: 'Select any word and tap Define. The meaning opens over the page — your place never moves.',
    art: DictionaryArt,
    action: 'Get started',
  },
];

/** Screen 01 · Splash */
function Splash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <Pressable style={styles.splash} onPress={onDone} accessibilityLabel="Continue">
      <View
        style={[
          styles.shape,
          { left: -110, top: 160, width: 300, height: 300, borderRadius: 150, backgroundColor: palette.pink },
        ]}
      />
      <View
        style={[styles.shape, { right: -70, bottom: 160, width: 240, height: 220, backgroundColor: palette.purple }]}
      />
      <View style={styles.splashCenter}>
        <Surface shadow={shadow.lg} style={styles.wordmark}>
          <Txt style={font(64, 1, '800', -0.035)}>Shelf</Txt>
        </Surface>
      </View>
      <Txt style={[font(18, 1.2, '700'), styles.tagline]} color={colors.textOnAccent}>
        Import it. Read it. Keep it.
      </Txt>
    </Pressable>
  );
}

/** Screens 01–04 · Splash and introduction, shown on first launch. */
export default function OnboardingScreen() {
  const [step, setStep] = useState(-1);
  if (step < 0) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.yellow}>
        <Splash onDone={() => setStep(0)} />
      </SafeAreaView>
    );
  }
  const s = STEPS[step];
  const Art = s.art;
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.skipRow}>
        <TextLink size={16} onPress={finish}>
          Skip
        </TextLink>
      </View>
      <View style={styles.body}>
        <View style={styles.art}>
          <Art />
        </View>
        <View style={styles.copy}>
          <Dots index={step} />
          <Txt variant="display">{s.title}</Txt>
          <Txt variant="bodyLg">{s.body}</Txt>
        </View>
        <Button size="lg" block onPress={() => (step < STEPS.length - 1 ? setStep(step + 1) : finish())}>
          {s.action}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    yellow: { flex: 1, backgroundColor: colors.yellow },
    screen: { flex: 1, backgroundColor: colors.cream, overflow: 'hidden' },
    splash: { flex: 1, overflow: 'hidden' },
    splashCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    wordmark: {
      backgroundColor: colors.white,
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.lg,
      paddingVertical: 22,
      paddingHorizontal: 30,
    },
    tagline: { textAlign: 'center', paddingBottom: 56 },
    shape: { position: 'absolute' },
    skipRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: layout.gutter,
      paddingTop: 16,
      paddingBottom: 12,
    },
    body: { flex: 1, paddingHorizontal: layout.gutter, paddingTop: 4, paddingBottom: 20, gap: 28 },
    art: { flex: 1, minHeight: 0, alignItems: 'center', justifyContent: 'center' },
    full: { width: '100%' },
    formatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, width: '100%' },
    formatCell: { width: '30%', flexGrow: 1 },
    formatCard: { gap: 14 },
    floatingButton: { position: 'absolute', right: 16, bottom: -26 },
    defCard: { gap: 12 },
    defHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    copy: { gap: 16 },
    dots: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dot: {
      height: 12,
      width: 12,
      borderRadius: radius.pill,
      borderWidth: border.width,
      borderColor: colors.black,
      backgroundColor: colors.white,
    },
    dotOn: { width: 32, backgroundColor: colors.black },
  }),
);
