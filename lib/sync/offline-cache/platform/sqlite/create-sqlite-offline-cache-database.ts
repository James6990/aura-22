import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from "@capacitor-community/sqlite";

import {
  runSQLiteOfflineCacheMigrations,
  type SQLiteOfflineCacheMigration,
} from "./run-sqlite-offline-cache-migrations";

export const sqliteOfflineCacheDatabaseName =
  "apex_offline_cache";

export const sqliteOfflineCacheDatabaseVersion =
  1 as const;

export const sqliteOfflineCacheTableName =
  "offline_cache_entries";

export type SQLiteOfflineCacheConnection =
  Pick<
    SQLiteDBConnection,
    | "open"
    | "close"
    | "execute"
    | "query"
    | "run"
    | "beginTransaction"
    | "commitTransaction"
    | "rollbackTransaction"
  >;

export type SQLiteOfflineCacheConnectionProvider = {
  createConnection({
    databaseName,
    version,
  }: {
    databaseName: string;
    version: number;
  }): Promise<
    SQLiteOfflineCacheConnection
  >;
};

export function createCapacitorSQLiteOfflineCacheConnectionProvider():
  SQLiteOfflineCacheConnectionProvider {
  const sqlite =
    new SQLiteConnection(
      CapacitorSQLite,
    );

  return {
    async createConnection({
      databaseName,
      version,
    }) {
      const existing =
        await sqlite.isConnection(
          databaseName,
          false,
        );

      if (existing.result) {
        return sqlite
          .retrieveConnection(
            databaseName,
            false,
          );
      }

      return sqlite
        .createConnection(
          databaseName,
          false,
          "no-encryption",
          version,
          false,
        );
    },
  };
}

export type CreateSQLiteOfflineCacheDatabaseOptions = {
  connectionProvider?:
    SQLiteOfflineCacheConnectionProvider;

  databaseName?:
    string;
};

const createSchemaSql = `
CREATE TABLE IF NOT EXISTS ${sqliteOfflineCacheTableName} (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  status TEXT NOT NULL,
  origin TEXT NOT NULL,
  cached_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  envelope_json TEXT NOT NULL,
  conflict_json TEXT
);

CREATE INDEX IF NOT EXISTS
  idx_offline_cache_ownership_sequence
ON ${sqliteOfflineCacheTableName} (
  user_id,
  device_id,
  sequence
);

CREATE INDEX IF NOT EXISTS
  idx_offline_cache_ownership_status_sequence
ON ${sqliteOfflineCacheTableName} (
  user_id,
  device_id,
  status,
  sequence
);
`;

export async function createSQLiteOfflineCacheDatabase({
  connectionProvider =
    createCapacitorSQLiteOfflineCacheConnectionProvider(),
  databaseName =
    sqliteOfflineCacheDatabaseName,
}: CreateSQLiteOfflineCacheDatabaseOptions = {}):
  Promise<
    SQLiteOfflineCacheConnection
  > {
  const connection =
    await connectionProvider
      .createConnection({
        databaseName,
        version:
          sqliteOfflineCacheDatabaseVersion,
      });

  await connection.open();

  const migrations:
    SQLiteOfflineCacheMigration[] = [
      {
        fromVersion:
          0,

        toVersion:
          sqliteOfflineCacheDatabaseVersion,

        description:
          "Create the initial SQLite Offline Cache schema.",

        async execute(
          migrationConnection,
        ) {
          await migrationConnection.execute(
            createSchemaSql,
            false,
          );
        },
      },
    ];

  try {
    await runSQLiteOfflineCacheMigrations({
      connection,

      targetVersion:
        sqliteOfflineCacheDatabaseVersion,

      migrations,
    });
  } catch (error) {
    await connection.close();
    throw error;
  }

  return connection;
}
