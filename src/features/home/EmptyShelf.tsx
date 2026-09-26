import { FilePlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Badge, Button, Card, IconTile, Txt } from '@/components';
import { palette } from '@/theme';

/** Screen 05: no books yet. */
export function EmptyShelf({ onImport }: { onImport: () => void }) {
  return (
    <View style={styles.wrap}>
      <Txt variant="display">{'Your shelf\nis empty.'}</Txt>
      <Card padding={20} style={styles.card}>
        <IconTile icon={FilePlus} color={palette.yellow} size={64} iconSize={30} />
        <Txt variant="sheetTitle" style={styles.cardTitle}>
          Import your first book
        </Txt>
        <Txt variant="body">Pick a file from this phone, Google Drive, Dropbox or your Downloads.</Txt>
        <View style={styles.badges}>
          {['PDF', 'EPUB', 'MOBI', 'DOCX', 'TXT'].map((f) => (
            <Badge key={f} tone="paper">
              {f}
            </Badge>
          ))}
        </View>
        <Button size="lg" block onPress={onImport}>
          Import a book
        </Button>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 24 },
  card: { gap: 16 },
  cardTitle: { fontSize: 22 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
