import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';

let prepared: Promise<string> | null = null;

/**
 * Copies the engine page and its script next to each other in app storage and
 * returns the page's file:// URI. Loading from file:// lets the page read
 * imported book files. Each bundle version gets its own folder.
 */
export function prepareEngine(): Promise<string> {
  prepared ??= (async () => {
    const [html, js] = await Promise.all([
      Asset.fromModule(require('../../assets/web/engine.html')).downloadAsync(),
      Asset.fromModule(require('../../assets/web/engine.js.txt')).downloadAsync(),
    ]);
    const version = `${html.hash ?? 'dev'}-${js.hash ?? 'dev'}`.slice(0, 40);
    const root = new Directory(Paths.document, 'engine');
    if (!root.exists) root.create({ intermediates: true, idempotent: true });
    const dir = new Directory(root, version);
    const page = new File(dir, 'engine.html');
    if (!page.exists) {
      // Remove older bundle versions.
      for (const item of root.list()) if (item instanceof Directory) item.delete();
      dir.create({ intermediates: true, idempotent: true });
      new File(js.localUri!).copy(new File(dir, 'engine.js'));
      new File(html.localUri!).copy(page);
    }
    return page.uri;
  })().catch((e) => {
    prepared = null;
    throw e;
  });
  return prepared;
}
