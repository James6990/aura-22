import {
  planOfflineCacheMigrations,
  type OfflineCacheMigration,
} from "@/lib/sync/offline-cache/migrations";

import type {
  SQLiteOfflineCacheConnection,
} from "./create-sqlite-offline-cache-database";

export const sqliteOfflineCacheMetadataTableName =
  "offline_cache_metadata";

export type SQLiteOfflineCacheMigration =
  OfflineCacheMigration & {
    execute(
      connection:
        SQLiteOfflineCacheConnection,
    ): Promise<void>;
  };

export type RunSQLiteOfflineCacheMigrationsResult = {
  initialVersion:
    number;

  finalVersion:
    number;

  appliedMigrations:
    OfflineCacheMigration[];
};

const createMetadataTableSql = `
CREATE TABLE IF NOT EXISTS ${sqliteOfflineCacheMetadataTableName} (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  schema_version INTEGER NOT NULL
);

INSERT OR IGNORE INTO ${sqliteOfflineCacheMetadataTableName} (
  id,
  schema_version
)
VALUES (
  1,
  0
);
`;

async function readSchemaVersion(
  connection:
    SQLiteOfflineCacheConnection,
) {
  const result =
    await connection.query(
      `
SELECT schema_version
FROM ${sqliteOfflineCacheMetadataTableName}
WHERE id = 1
LIMIT 1;
`,
    );

  const value =
    result.values?.[0]
      ?.schema_version;

  const version =
    Number(value);

  if (
    !Number.isInteger(version) ||
    version < 0
  ) {
    throw new Error(
      "SQLite Offline Cache schema metadata is invalid.",
    );
  }

  return version;
}

async function writeSchemaVersion({
  connection,
  version,
}: {
  connection:
    SQLiteOfflineCacheConnection;

  version:
    number;
}) {
  const result =
    await connection.run(
      `
UPDATE ${sqliteOfflineCacheMetadataTableName}
SET schema_version = ?
WHERE id = 1;
`,
      [
        version,
      ],
      false,
    );

  if (
    (
      result.changes
        ?.changes ??
      0
    ) !== 1
  ) {
    throw new Error(
      "SQLite Offline Cache schema version was not persisted.",
    );
  }
}

export async function runSQLiteOfflineCacheMigrations({
  connection,
  targetVersion,
  migrations,
}: {
  connection:
    SQLiteOfflineCacheConnection;

  targetVersion:
    number;

  migrations:
    readonly SQLiteOfflineCacheMigration[];
}): Promise<
  RunSQLiteOfflineCacheMigrationsResult
> {
  await connection.execute(
    createMetadataTableSql,
    true,
  );

  const initialVersion =
    await readSchemaVersion(
      connection,
    );

  const plan =
    planOfflineCacheMigrations({
      currentVersion:
        initialVersion,

      targetVersion,

      migrations,
    });

  const appliedMigrations:
    OfflineCacheMigration[] = [];

  let finalVersion =
    initialVersion;

  for (
    const plannedMigration of
    plan
  ) {
    const migration =
      migrations.find(
        (candidate) =>
          candidate.fromVersion ===
            plannedMigration
              .fromVersion &&
          candidate.toVersion ===
            plannedMigration
              .toVersion,
      );

    if (!migration) {
      throw new Error(
        `SQLite Offline Cache executable migration from version ${plannedMigration.fromVersion} is missing.`,
      );
    }

    await connection
      .beginTransaction();

    try {
      await migration.execute(
        connection,
      );

      await writeSchemaVersion({
        connection,
        version:
          migration.toVersion,
      });

      await connection
        .commitTransaction();
    } catch (error) {
      try {
        await connection
          .rollbackTransaction();
      } catch {
        // Preserve the original migration failure.
      }

      throw error;
    }

    appliedMigrations.push({
      fromVersion:
        migration.fromVersion,

      toVersion:
        migration.toVersion,

      description:
        migration.description,
    });

    finalVersion =
      migration.toVersion;
  }

  return {
    initialVersion,
    finalVersion,
    appliedMigrations,
  };
}
