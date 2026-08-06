import type {
  OfflineCacheStorage,
} from "@/lib/sync/offline-cache/repository";

import {
  createSQLiteOfflineCacheDatabase,
  sqliteOfflineCacheTableName,
  type CreateSQLiteOfflineCacheDatabaseOptions,
  type SQLiteOfflineCacheConnection,
} from "./create-sqlite-offline-cache-database";

import {
  offlineCacheEntryFromSQLiteRow,
  sqliteRowFromOfflineCacheEntry,
} from "./sqlite-offline-cache-entry-row";

export type CreateSQLiteOfflineCacheStorageOptions =
  CreateSQLiteOfflineCacheDatabaseOptions & {
    connection?:
      SQLiteOfflineCacheConnection;
  };

export function createSQLiteOfflineCacheStorage({
  connection,
  connectionProvider,
  databaseName,
}: CreateSQLiteOfflineCacheStorageOptions = {}):
  OfflineCacheStorage {
  async function getConnection() {
    return (
      connection ??
      createSQLiteOfflineCacheDatabase({
        connectionProvider,
        databaseName,
      })
    );
  }

  return {
    async getById(
      entryId,
    ) {
      const resolvedConnection =
        await getConnection();

      const result =
        await resolvedConnection.query(
          `
SELECT
  id,
  user_id,
  device_id,
  sequence,
  status,
  origin,
  cached_at,
  updated_at,
  schema_version,
  envelope_json,
  conflict_json
FROM ${sqliteOfflineCacheTableName}
WHERE id = ?
LIMIT 1;
`,
          [
            entryId,
          ],
        );

      const row =
        result.values?.[0];

      return row
        ? offlineCacheEntryFromSQLiteRow(
            row,
          )
        : null;
    },

    async getHighestSequence({
      userId,
      deviceId,
    }) {
      const resolvedConnection =
        await getConnection();

      const result =
        await resolvedConnection.query(
          `
SELECT
  MAX(sequence) AS highest_sequence
FROM ${sqliteOfflineCacheTableName}
WHERE user_id = ?
  AND device_id = ?;
`,
          [
            userId,
            deviceId,
          ],
        );

      const value =
        result.values?.[0]
          ?.highest_sequence;

      if (
        value === null ||
        value === undefined
      ) {
        return 0;
      }

      const highestSequence =
        Number(value);

      if (
        !Number.isInteger(
          highestSequence,
        ) ||
        highestSequence < 0
      ) {
        throw new Error(
          "SQLite returned an invalid Offline Cache highest sequence.",
        );
      }

      return highestSequence;
    },

    async insert(
      entry,
    ) {
      const resolvedConnection =
        await getConnection();

      const row =
        sqliteRowFromOfflineCacheEntry(
          entry,
        );

      await resolvedConnection.run(
        `
INSERT INTO ${sqliteOfflineCacheTableName} (
  id,
  user_id,
  device_id,
  sequence,
  status,
  origin,
  cached_at,
  updated_at,
  schema_version,
  envelope_json,
  conflict_json
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
`,
        [
          row.id,
          row.user_id,
          row.device_id,
          row.sequence,
          row.status,
          row.origin,
          row.cached_at,
          row.updated_at,
          row.schema_version,
          row.envelope_json,
          row.conflict_json,
        ],
        true,
      );

      const stored =
        await this.getById(
          entry.id,
        );

      if (!stored) {
        throw new Error(
          "SQLite did not return the inserted Offline Cache entry.",
        );
      }

      return stored;
    },

    async update(
      entry,
    ) {
      const resolvedConnection =
        await getConnection();

      const row =
        sqliteRowFromOfflineCacheEntry(
          entry,
        );

      const result =
        await resolvedConnection.run(
          `
UPDATE ${sqliteOfflineCacheTableName}
SET
  user_id = ?,
  device_id = ?,
  sequence = ?,
  status = ?,
  origin = ?,
  cached_at = ?,
  updated_at = ?,
  schema_version = ?,
  envelope_json = ?,
  conflict_json = ?
WHERE id = ?;
`,
          [
            row.user_id,
            row.device_id,
            row.sequence,
            row.status,
            row.origin,
            row.cached_at,
            row.updated_at,
            row.schema_version,
            row.envelope_json,
            row.conflict_json,
            row.id,
          ],
          true,
        );

      if (
        (
          result.changes
            ?.changes ??
          0
        ) < 1
      ) {
        throw new Error(
          "SQLite cannot update a missing Offline Cache entry.",
        );
      }

      const stored =
        await this.getById(
          entry.id,
        );

      if (!stored) {
        throw new Error(
          "SQLite did not return the updated Offline Cache entry.",
        );
      }

      return stored;
    },

    async list({
      userId,
      deviceId,
      statuses,
      limit,
    }) {
      const resolvedConnection =
        await getConnection();

      if (statuses.length === 0) {
        return [];
      }

      const statusPlaceholders =
        statuses
          .map(
            () =>
              "?",
          )
          .join(
            ", ",
          );

      const result =
        await resolvedConnection.query(
          `
SELECT
  id,
  user_id,
  device_id,
  sequence,
  status,
  origin,
  cached_at,
  updated_at,
  schema_version,
  envelope_json,
  conflict_json
FROM ${sqliteOfflineCacheTableName}
WHERE user_id = ?
  AND device_id = ?
  AND status IN (${statusPlaceholders})
ORDER BY
  sequence ASC,
  json_extract(
    envelope_json,
    '$.occurredAt'
  ) ASC,
  id ASC
LIMIT ?;
`,
          [
            userId,
            deviceId,
            ...statuses,
            limit,
          ],
        );

      return (
        result.values ??
        []
      ).map(
        offlineCacheEntryFromSQLiteRow,
      );
    },
  };
}
