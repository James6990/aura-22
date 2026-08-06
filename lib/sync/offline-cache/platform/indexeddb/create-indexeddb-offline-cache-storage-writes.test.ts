import "fake-indexeddb/auto";

import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
  type OfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import {
  createIndexedDbOfflineCacheDatabase,
  deleteIndexedDbOfflineCacheDatabase,
} from "./create-indexeddb-offline-cache-database";

import {
  createIndexedDbOfflineCacheStorage,
} from "./create-indexeddb-offline-cache-storage";

function createEntry():
  OfflineCacheEntry {
  return createOfflineCacheEntry({
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
        "2026-08-06T10:40:00.000Z",

      createdAt:
        "2026-08-06T10:40:01.000Z",
    },

    origin:
      "local",

    cachedAt:
      "2026-08-06T10:41:00.000Z",
  });
}

async function run() {
  const databaseName =
    "apex-indexeddb-storage-writes-test";

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  const database =
    await createIndexedDbOfflineCacheDatabase({
      databaseName,
    });

  const storage =
    createIndexedDbOfflineCacheStorage({
      database,
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
        "ConstraintError",
  );

  const updated:
    OfflineCacheEntry = {
      ...entry,

      status:
        "applied",

      updatedAt:
        "2026-08-06T10:42:00.000Z",
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

  const missing:
    OfflineCacheEntry = {
      ...updated,

      id:
        "missing-entry",

      envelope: {
        ...updated.envelope,

        id:
          "missing-entry",
      },
  };

  await assert.rejects(
    () =>
      storage.update(
        missing,
      ),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "IndexedDB cannot update a missing Offline Cache entry.",
  );

  database.close();

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  console.log(
    "IndexedDB Offline Cache write tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
