import "fake-indexeddb/auto";

import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import {
  createIndexedDbOfflineCacheDatabase,
  deleteIndexedDbOfflineCacheDatabase,
  indexedDbOfflineCacheEntryStore,
} from "./create-indexeddb-offline-cache-database";

import {
  createIndexedDbOfflineCacheStorage,
} from "./create-indexeddb-offline-cache-storage";

import {
  indexedDbRowFromOfflineCacheEntry,
} from "./indexeddb-offline-cache-entry-row";

async function run() {
  const databaseName =
    "apex-indexeddb-storage-get-by-id-test";

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  const database =
    await createIndexedDbOfflineCacheDatabase({
      databaseName,
    });

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
          "2026-08-06T10:30:00.000Z",

        createdAt:
          "2026-08-06T10:30:01.000Z",
      },

      origin:
        "local",

      cachedAt:
        "2026-08-06T10:31:00.000Z",
    });

  await database.put(
    indexedDbOfflineCacheEntryStore,
    indexedDbRowFromOfflineCacheEntry(
      entry,
    ),
  );

  const storage =
    createIndexedDbOfflineCacheStorage({
      database,
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

  database.close();

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  console.log(
    "IndexedDB Offline Cache getById tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
