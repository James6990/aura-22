import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import {
  createSQLiteOfflineCacheStorage,
} from "./create-sqlite-offline-cache-storage";

import {
  sqliteRowFromOfflineCacheEntry,
} from "./sqlite-offline-cache-entry-row";

import type {
  SQLiteOfflineCacheConnection,
} from "./create-sqlite-offline-cache-database";

async function run() {
  const entry =
    createOfflineCacheEntry({
      envelope: {
        id:
          "entry-1",

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
          "2026-08-06T11:00:00.000Z",

        createdAt:
          "2026-08-06T11:00:01.000Z",
      },

      origin:
        "local",

      cachedAt:
        "2026-08-06T11:01:00.000Z",
    });

  let requestedId:
    unknown =
      null;

  const connection = {
    async query(
      _statement:
        string,
      values?:
        unknown[],
    ) {
      requestedId =
        values?.[0];

      return {
        values:
          requestedId ===
          entry.id
            ? [
                sqliteRowFromOfflineCacheEntry(
                  entry,
                ),
              ]
            : [],
      };
    },
  } as SQLiteOfflineCacheConnection;

  const storage =
    createSQLiteOfflineCacheStorage({
      connection,
    });

  assert.equal(
    await storage.getById(
      "missing",
    ),
    null,
  );

  const fetched =
    await storage.getById(
      entry.id,
    );

  assert.equal(
    requestedId,
    entry.id,
  );

  assert.deepEqual(
    fetched,
    entry,
  );

  assert.ok(
    fetched,
  );

  fetched.envelope.payload = {
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

  console.log(
    "SQLite Offline Cache getById tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
