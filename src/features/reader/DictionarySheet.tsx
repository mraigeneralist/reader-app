import * as Speech from 'expo-speech';
import { SearchX, Volume2, WifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';

import { Badge, Button, IconButton, IconTile, Sheet, Txt } from '@/components';
import { lookup, normalizeWord, type LookupResult } from '@/dictionary/lookup';
import { border, colors, font, palette, radius, themed } from '@/theme';

type Props = {
  /** The selected word, or null when the sheet is closed. */
  word: string | null;
  onClose: () => void;
  onHighlight: () => void;
};

function Actions({ left, onLeft, onDone }: { left: string; onLeft: () => void; onDone: () => void }) {
  return (
    <View style={styles.actions}>
      <Button tone="paper" block style={styles.flex} onPress={onLeft}>
        {left}
      </Button>
      <Button block style={styles.flex} onPress={onDone}>
        Done
      </Button>
    </View>
  );
}

/** Screens 26–27 · Dictionary sheet over the page. Closing it leaves the reader exactly where it was. */
export function DictionarySheet({ word, onClose, onHighlight }: Props) {
  const [attempt, setAttempt] = useState(0);
  // Tagged with the request it answers, so a new word or a retry shows the spinner again.
  const request = `${attempt}:${word}`;
  const [answer, setAnswer] = useState<{ request: string; result: LookupResult } | null>(null);
  const result = answer?.request === request ? answer.result : null;

  useEffect(() => {
    if (!word) return;
    let alive = true;
    lookup(word).then((r) => alive && setAnswer({ request, result: r }));
    return () => {
      alive = false;
    };
  }, [word, request]);

  const shown = word ? normalizeWord(word) : '';

  return (
    <Sheet open={!!word} onClose={onClose}>
      {!result ? (
        <View style={styles.loading}>
          <Txt style={font(30, 1.2, '700', -0.02)}>{shown}</Txt>
          <ActivityIndicator color={colors.black} />
        </View>
      ) : result.status === 'found' ? (
        <>
          <View style={styles.head}>
            <View style={styles.headWord}>
              <View style={styles.wordRow}>
                <Txt style={[font(30, 1.2, '700', -0.02), styles.flexShrink]}>{result.entry.word}</Txt>
                <IconButton
                  icon={Volume2}
                  label="Play pronunciation"
                  onPress={() => Speech.speak(result.entry.word, { language: 'en-GB' })}
                />
              </View>
              {!!result.entry.phonetic && (
                <Txt style={font(15, 1, '500', 0, 'JetBrains Mono')}>{result.entry.phonetic}</Txt>
              )}
            </View>
            <Txt style={font(13, 1, '700')}>English</Txt>
          </View>
          {result.lookedUp !== shown && (
            <Txt variant="captionRegular">
              Showing “{result.lookedUp}” for “{shown}”.
            </Txt>
          )}
          {!!result.entry.partOfSpeech && <Badge tone="info">{result.entry.partOfSpeech}</Badge>}
          <Txt style={font(17, 1.35, '600', -0.01)}>{result.entry.definition}</Txt>
          {!!result.entry.example && (
            <View style={styles.example}>
              <Txt style={font(15, 1.35, '500', -0.01)}>“{result.entry.example}”</Txt>
            </View>
          )}
          {result.entry.synonyms.length > 0 && (
            <View style={styles.similar}>
              <Txt variant="overline">SIMILAR</Txt>
              <Txt style={[font(15, 1.35, '500', -0.01), styles.flexShrink]}>{result.entry.synonyms.join(', ')}</Txt>
            </View>
          )}
          {result.entry.more.map((m) => (
            <View key={m.partOfSpeech} style={styles.more}>
              <Badge tone="paper">{m.partOfSpeech}</Badge>
              <Txt variant="body">{m.definition}</Txt>
            </View>
          ))}
          <Actions left="Highlight" onLeft={onHighlight} onDone={onClose} />
        </>
      ) : (
        <>
          <View style={styles.head}>
            <Txt style={[font(30, 1.2, '700', -0.02), styles.flexShrink]}>{shown}</Txt>
            <Txt style={font(13, 1, '700')}>English</Txt>
          </View>
          <View style={styles.notFound}>
            <IconTile
              icon={result.status === 'offline' ? WifiOff : SearchX}
              color={palette.gray}
              size={48}
              iconSize={24}
            />
            <View style={styles.flex}>
              <Txt variant="cardTitle">{result.status === 'offline' ? 'You’re offline.' : 'No definition found.'}</Txt>
              <Txt style={font(15, 1.35, '500', -0.01)}>
                {result.status === 'offline'
                  ? 'Words you’ve looked up before work offline. Connect to look up new ones.'
                  : 'It may be a name, a coined word, or spelled differently.'}
              </Txt>
            </View>
          </View>
          {result.status === 'offline' ? (
            <Actions left="Try again" onLeft={() => setAttempt((a) => a + 1)} onDone={onClose} />
          ) : (
            <Actions
              left="Search web"
              onLeft={() => Linking.openURL(`https://www.google.com/search?q=define+${encodeURIComponent(shown)}`)}
              onDone={onClose}
            />
          )}
        </>
      )}
    </Sheet>
  );
}

const styles = themed(() =>
  StyleSheet.create({
    flex: { flex: 1 },
    flexShrink: { flexShrink: 1 },
    loading: { gap: 18, paddingBottom: 24 },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    headWord: { flex: 1, gap: 8 },
    wordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    example: {
      backgroundColor: colors.cream,
      borderWidth: border.width,
      borderColor: colors.black,
      borderRadius: radius.md,
      padding: 14,
    },
    similar: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
    more: { gap: 6 },
    notFound: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
    actions: { flexDirection: 'row', gap: 12, paddingTop: 4 },
  }),
);
