import "fake-indexeddb/auto";

import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
  type OfflineCacheEntryStatus,
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
  userId = "user-1",
  deviceId = "device-1",
  sequence,
  status,
}: {
  id: string;
  userId?: string;
  deviceId?: string;
  sequence: number;
  status: OfflineCacheEntryStatus;
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

    status,

    conflict:
      status ===
      "conflicted"
        ? {
            code:
              "sequence-conflict",

            message:
              "Sequence conflicts with stored evidence.",

            detectedAt:
              "2026-08-06T11:19:00.000Z",

            relatedEnvelopeId:
              id,

            retryable:
              true,
          }
        : null,

    cachedAt:
      "2026-08-06T11:20:00.000Z",
  });
}

async function run() {
  const databaseName =
    "apex-indexeddb-storage-list-test";

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

  await storage.insert(
    createEntry({
      id:
        "staged-3",
      sequence:
        3,
      status:
        "staged",
    }),
  );

  await storage.insert(
    createEntry({
      id:
        "applied-1",
      sequence:
        1,
      status:
        "applied",
    }),
  );

  await storage.insert(
    createEntry({
      id:
        "conflicted-2",
      sequence:
        2,
      status:
        "conflicted",
    }),
  );

  await storage.insert(
    createEntry({
      id:
        "other-device",
      deviceId:
        "device-2",
      sequence:
        1,
      status:
        "staged",
    }),
  );

  await storage.insert(
    createEntry({
      id:
        "other-user",
      userId:
        "user-2",
      sequence:
        1,
      status:
        "staged",
    }),
  );

  const selected =
    await storage.list({
      userId:
        "user-1",

      deviceId:
        "device-1",

      statuses: [
        "staged",
        "applied",
        "conflicted",
      ],

      limit:
        10,
    });

  assert.deepEqual(
    selected.map(
      (entry) =>
        entry.id,
    ),
    [
      "applied-1",
      "conflicted-2",
      "staged-3",
    ],
  );

  const stagedOnly =
    await storage.list({
      userId:
        "user-1",

      deviceId:
        "device-1",

      statuses: [
        "staged",
      ],

      limit:
        10,
    });

  assert.deepEqual(
    stagedOnly.map(
      (entry) =>
        entry.id,
    ),
    [
      "staged-3",
    ],
  );

  const limited =
    await storage.list({
      userId:
        "user-1",

      deviceId:
        "device-1",

      statuses: [
        "staged",
        "applied",
        "conflicted",
      ],

      limit:
        2,
    });

  assert.deepEqual(
    limited.map(
      (entry) =>
        entry.id,
    ),
    [
      "applied-1",
      "conflicted-2",
    ],
  );

  selected[0]!.envelope.payload = {
    mutated:
      true,
  };

  assert.notDeepEqual(
    (
      await storage.getById(
        "applied-1",
      )
    )?.envelope.payload,
    {
      mutated:
        true,
    },
  );

  database.close();

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  console.log(
    "IndexedDB Offline Cache list tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
