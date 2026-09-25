import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { layout } from '@/theme';

import { ScreenHeader } from './ScreenHeader';
import { Txt } from './Txt';

/** TEMPORARY placeholder for tabs whose screens aren't built yet. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScreenHeader left={<Txt variant="pageTitle">{title}</Txt>} />
      <View style={styles.body}>
        <Txt variant="body">This screen is built in a later step.</Txt>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: { paddingHorizontal: layout.gutter, paddingTop: 8 },
});
