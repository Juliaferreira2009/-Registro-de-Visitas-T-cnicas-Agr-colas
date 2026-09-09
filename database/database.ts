import * as SQLite from 'expo-sqlite';
import { contacts } from '../data/contacts';

const DATABASE_NAME = 'registro_visitas.db';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase() {
  if (!database) {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return database;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      farm TEXT NOT NULL,
      city TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_name
    ON contacts(name);
  `);

  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM contacts'
  );

  if (result && result.count > 0) {
    return;
  }

  const statement = await db.prepareAsync(
    'INSERT INTO contacts (id, name, farm, city) VALUES (?, ?, ?, ?)'
  );

  try {
    for (const contact of contacts) {
      await statement.executeAsync([
        contact.id,
        contact.name,
        contact.farm,
        contact.city,
      ]);
    }
  } finally {
    await statement.finalizeAsync();
  }
}

export async function searchContacts(
  search: string,
  pageSize: number,
  pageOffset: number
) {
  const db = await getDatabase();

  const normalizedSearch = search.trim();

  if (!normalizedSearch) {
    return await db.getAllAsync(
      `
        SELECT id, name, farm, city
        FROM contacts
        ORDER BY name COLLATE NOCASE, id
        LIMIT ? OFFSET ?
      `,
      pageSize,
      pageOffset
    );
  }

  return await db.getAllAsync(
    `
      SELECT id, name, farm, city
      FROM contacts
      WHERE name LIKE ?
      ORDER BY name COLLATE NOCASE, id
      LIMIT ? OFFSET ?
    `,
    `%${normalizedSearch}%`,
    pageSize,
    pageOffset
  );
}

export async function countContacts(search: string) {
  const db = await getDatabase();

  const normalizedSearch = search.trim();

  if (!normalizedSearch) {
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM contacts'
    );

    return result?.count ?? 0;
  }

  const result = await db.getFirstAsync<{ count: number }>(
    `
      SELECT COUNT(*) as count
      FROM contacts
      WHERE name LIKE ?
    `,
    `%${normalizedSearch}%`
  );

  return result?.count ?? 0;
}