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
} from "./create-indexeddb-offline-cache-database";

import {
  createIndexedDbOfflineCacheStorage,
} from "./create-indexeddb-offline-cache-storage";

function createEntry({
  id,
  userId,
  deviceId,
  sequence,
}: {
  id: string;
  userId: string;
  deviceId: string;
  sequence: number;
}) {
  return createOfflineCacheEntry({
    envelope: {
      id,
      userId,
      deviceId,

      entityType:
        "decision-memory-event",

      entityId:
        `memory-${id}`,

      operation:
        "append",

      sequence,

      payload: {
        id,
      },

      schemaVersion:
        apexSyncSchemaVersion,

      occurredAt:
        `2026-08-06T11:${String(
          sequence,
        ).padStart(2, "0")}:00.000Z`,

      createdAt:
        `2026-08-06T11:${String(
          sequence,
        ).padStart(2, "0")}:01.000Z`,
    },

    origin:
      "local",

    cachedAt:
      "2026-08-06T11:20:00.000Z",
  });
}

async function run() {
  const databaseName =
    "apex-indexeddb-storage-sequence-test";

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

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-1",
      deviceId:
        "device-1",
    }),
    0,
  );

  await storage.insert(
    createEntry({
      id:
        "entry-1",
      userId:
        "user-1",
      deviceId:
        "device-1",
      sequence:
        1,
    }),
  );

  await storage.insert(
    createEntry({
      id:
        "entry-3",
      userId:
        "user-1",
      deviceId:
        "device-1",
      sequence:
        3,
    }),
  );

  await storage.insert(
    createEntry({
      id:
        "other-device",
      userId:
        "user-1",
      deviceId:
        "device-2",
      sequence:
        9,
    }),
  );

  await storage.insert(
    createEntry({
      id:
        "other-user",
      userId:
        "user-2",
      deviceId:
        "device-1",
      sequence:
        7,
    }),
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-1",
      deviceId:
        "device-1",
    }),
    3,
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-1",
      deviceId:
        "device-2",
    }),
    9,
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-2",
      deviceId:
        "device-1",
    }),
    7,
  );

  database.close();

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  console.log(
    "IndexedDB Offline Cache sequence tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
