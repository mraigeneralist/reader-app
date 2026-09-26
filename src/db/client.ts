import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import { migrate } from './migrations';
import * as schema from './schema';

// One connection for the app. The change listener powers useLiveQuery, so
// screens update as soon as a book, category or highlight changes.
export const sqlite = openDatabaseSync('folio.db', { enableChangeListener: true });
migrate(sqlite);

export const db = drizzle(sqlite, { schema });
