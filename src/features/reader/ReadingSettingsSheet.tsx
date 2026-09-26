import { AArrowDown, AArrowUp, Sun, SunDim } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Icon, IconButton, Segmented, Sheet, Slider, Surface, Txt } from '@/components';
import { setSetting, type ReaderPrefs } from '@/db/settings';
import { border, colors, font, radius, readerThemes, shadow, themed } from '@/theme';

type Props = {
  open: boolean;
  onClose: () => void;
  prefs: ReaderPrefs;
  /** Current screen brightness (0–1) to show when the user hasn't set one. */
  systemBrightness: number;
};

const MIN_SIZE = 12;
const MAX_SIZE = 32;

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Txt variant="overline">{label}</Txt>
      {children}
    </View>
  );
}

const THEMES: { value: ReaderPrefs['theme']; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'dark', label: 'Dark' },
];

/** Screen 24 · Reading settings. Changes apply to the open page immediately and become the default. */
export function ReadingSettingsSheet({ open, onClose, prefs, systemBrightness }: Props) {
  const update = (patch: Partial<ReaderPrefs>) => setSetting('readerPrefs', { ...prefs, ...patch });

  return (
    <Sheet open={open} onClose={onClose}>
      <Txt style={font(22, 1.2, '700', -0.02)}>Reading Settings</Txt>

      <Section label="FONT SIZE">
        <View style={styles.sizeRow}>
          <IconButton
            icon={AArrowDown}
            label="Smaller text"
            disabled={prefs.fontSize <= MIN_SIZE}
            onPress={() => update({ fontSize: Math.max(MIN_SIZE, prefs.fontSize - 1) })}
          />
          <Txt style={[font(24, 1, '800'), styles.size]}>{prefs.fontSize}</Txt>
          <IconButton
            icon={AArrowUp}
            label="Larger text"
            disabled={prefs.fontSize >= MAX_SIZE}
            onPress={() => update({ fontSize: Math.min(MAX_SIZE, prefs.fontSize + 1) })}
          />
        </View>
      </Section>

      <Section label="FONT">
        <Segmented
          options={[
            { value: 'archivo', label: 'Archivo' },
            { value: 'mono', label: 'Mono' },
          ]}
          value={prefs.font}
          onChange={(font) => update({ font })}
        />
      </Section>

      <Section label="LINE SPACING">
        <Segmented
          options={[
            { value: 'tight', label: 'Tight' },
            { value: 'normal', label: 'Normal' },
            { value: 'relaxed', label: 'Relaxed' },
          ]}
          value={prefs.lineSpacing}
          onChange={(lineSpacing) => update({ lineSpacing })}
        />
      </Section>

      <Section label="BRIGHTNESS">
        <View style={styles.brightness}>
          <Icon icon={SunDim} size={22} />
          <View style={styles.flex}>
            <Slider
              value={prefs.brightness ?? systemBrightness}
              onCommit={(brightness) => update({ brightness: Math.max(0.05, brightness) })}
              accessibilityLabel="Brightness"
            />
          </View>
          <Icon icon={Sun} size={22} />
        </View>
      </Section>

      <Section label="THEME">
        <View style={styles.themes}>
          {THEMES.map((t) => {
            const selected = prefs.theme === t.value;
            const c = readerThemes[t.value];
            return (
              <View key={t.value} style={styles.theme}>
                <Surface
                  shadow={shadow.sm}
                  selected={selected}
                  onPress={() => update({ theme: t.value })}
                  accessibilityLabel={`${t.label} theme`}
                  style={[styles.themeSwatch, { backgroundColor: c.background }]}>
                  <Txt style={font(20, 1, '800')} color={c.ink}>
                    Aa
                  </Txt>
                </Surface>
                <Txt style={[font(13, 1, '700'), styles.center]}>{t.label}</Txt>
              </View>
            );
          })}
        </View>
      </Section>

      <Section label="MOVEMENT">
        <Segmented
          options={[
            { value: 'page', label: 'Page turn' },
            { value: 'scroll', label: 'Scroll' },
          ]}
          value={prefs.movement}
          onChange={(movement) => update({ movement })}
        />
      </Section>
    </Sheet>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    section: { gap: 10 },
    sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    size: { flex: 1, textAlign: 'center' },
    brightness: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    flex: { flex: 1 },
    themes: { flexDirection: 'row', gap: 12 },
    theme: { flex: 1, gap: 8 },
    themeSwatch: {
      height: 52,
      borderRadius: radius.md,
      borderWidth: border.width,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
    },
    center: { textAlign: 'center' },
  }),
);
