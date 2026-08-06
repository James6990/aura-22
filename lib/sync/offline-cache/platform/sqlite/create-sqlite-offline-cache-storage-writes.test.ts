import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
  type OfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import {
  createSQLiteOfflineCacheStorage,
} from "./create-sqlite-offline-cache-storage";

import {
  sqliteRowFromOfflineCacheEntry,
  type SQLiteOfflineCacheEntryRow,
} from "./sqlite-offline-cache-entry-row";

import type {
  SQLiteOfflineCacheConnection,
} from "./create-sqlite-offline-cache-database";

function createEntry({
  id = "entry-1",
}: {
  id?: string;
} = {}): OfflineCacheEntry {
  return createOfflineCacheEntry({
    envelope: {
      id,

      userId:
        "user-1",

      deviceId:
        "device-1",

      entityType:
        "decision-memory-event",

      entityId:
        "memory-1",

      operation:
        "append",

      sequence:
        1,

      payload: {
        value:
          "original",
      },

      schemaVersion:
        apexSyncSchemaVersion,

      occurredAt:
        "2026-08-06T11:10:00.000Z",

      createdAt:
        "2026-08-06T11:10:01.000Z",
    },

    origin:
      "local",

    cachedAt:
      "2026-08-06T11:11:00.000Z",
  });
}

async function run() {
  const rows =
    new Map<
      string,
      SQLiteOfflineCacheEntryRow
    >();

  const connection = {
    async query(
      _statement:
        string,
      values?:
        unknown[],
    ) {
      const id =
        String(
          values?.[0] ??
          "",
        );

      const row =
        rows.get(id);

      return {
        values:
          row
            ? [
                structuredClone(
                  row,
                ),
              ]
            : [],
      };
    },

    async run(
      statement:
        string,
      values?:
        unknown[],
    ) {
      if (
        statement.includes(
          "INSERT INTO",
        )
      ) {
        const id =
          String(
            values?.[0],
          );

        if (rows.has(id)) {
          const error =
            new Error(
              "UNIQUE constraint failed.",
            );

          error.name =
            "SQLiteConstraintError";

          throw error;
        }

        rows.set(
          id,
          {
            id,

            user_id:
              String(
                values?.[1],
              ),

            device_id:
              String(
                values?.[2],
              ),

            sequence:
              Number(
                values?.[3],
              ),

            status:
              values?.[4] as
                SQLiteOfflineCacheEntryRow["status"],

            origin:
              values?.[5] as
                SQLiteOfflineCacheEntryRow["origin"],

            cached_at:
              String(
                values?.[6],
              ),

            updated_at:
              String(
                values?.[7],
              ),

            schema_version:
              Number(
                values?.[8],
              ),

            envelope_json:
              String(
                values?.[9],
              ),

            conflict_json:
              values?.[10] ===
              null
                ? null
                : String(
                    values?.[10],
                  ),
          },
        );

        return {
          changes: {
            changes:
              1,
          },
        };
      }

      if (
        statement.includes(
          "UPDATE",
        )
      ) {
        const id =
          String(
            values?.[10],
          );

        if (!rows.has(id)) {
          return {
            changes: {
              changes:
                0,
            },
          };
        }

        rows.set(
          id,
          {
            id,

            user_id:
              String(
                values?.[0],
              ),

            device_id:
              String(
                values?.[1],
              ),

            sequence:
              Number(
                values?.[2],
              ),

            status:
              values?.[3] as
                SQLiteOfflineCacheEntryRow["status"],

            origin:
              values?.[4] as
                SQLiteOfflineCacheEntryRow["origin"],

            cached_at:
              String(
                values?.[5],
              ),

            updated_at:
              String(
                values?.[6],
              ),

            schema_version:
              Number(
                values?.[7],
              ),

            envelope_json:
              String(
                values?.[8],
              ),

            conflict_json:
              values?.[9] ===
              null
                ? null
                : String(
                    values?.[9],
                  ),
          },
        );

        return {
          changes: {
            changes:
              1,
          },
        };
      }

      throw new Error(
        "Unexpected SQLite statement.",
      );
    },
  } as SQLiteOfflineCacheConnection;

  const storage =
    createSQLiteOfflineCacheStorage({
      connection,
    });

  const entry =
    createEntry();

  const inserted =
    await storage.insert(
      entry,
    );

  assert.deepEqual(
    inserted,
    entry,
  );

  assert.deepEqual(
    rows.get(
      entry.id,
    ),
    sqliteRowFromOfflineCacheEntry(
      entry,
    ),
  );

  inserted.envelope.payload = {
    value:
      "mutated",
  };

  assert.notDeepEqual(
    (
      await storage.getById(
        entry.id,
      )
    )?.envelope.payload,
    {
      value:
        "mutated",
    },
  );

  await assert.rejects(
    () =>
      storage.insert(
        entry,
      ),

    (error: unknown) =>
      error instanceof Error &&
      error.name ===
        "SQLiteConstraintError",
  );

  const updated:
    OfflineCacheEntry = {
      ...entry,

      status:
        "applied",

      updatedAt:
        "2026-08-06T11:12:00.000Z",
  };

  const storedUpdate =
    await storage.update(
      updated,
    );

  assert.deepEqual(
    storedUpdate,
    updated,
  );

  assert.deepEqual(
    await storage.getById(
      entry.id,
    ),
    updated,
  );

  const missing =
    createEntry({
      id:
        "missing-entry",
    });

  await assert.rejects(
    () =>
      storage.update(
        missing,
      ),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "SQLite cannot update a missing Offline Cache entry.",
  );

  console.log(
    "SQLite Offline Cache write tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
