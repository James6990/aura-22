import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
  type OfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import type {
  OfflineCacheStorage,
} from "./create-offline-cache-repository";

export type OfflineCacheStorageConformanceFactory = {
  createStorage():
    Promise<OfflineCacheStorage>;

  reset?():
    Promise<void>;
};

function createEnvelope({
  id,
  userId,
  deviceId,
  sequence,
}: {
  id: string;
  userId: string;
  deviceId: string;
  sequence: number;
}): ApexSyncEnvelope {
  return {
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
      sequence,
    },

    schemaVersion:
      apexSyncSchemaVersion,

    occurredAt:
      `2026-08-06T10:${String(
        sequence,
      ).padStart(2, "0")}:00.000Z`,

    createdAt:
      `2026-08-06T10:${String(
        sequence,
      ).padStart(2, "0")}:01.000Z`,
  };
}

function createEntry({
  id,
  userId = "user-1",
  deviceId = "device-1",
  sequence,
}: {
  id: string;
  userId?: string;
  deviceId?: string;
  sequence: number;
}) {
  return createOfflineCacheEntry({
    envelope:
      createEnvelope({
        id,
        userId,
        deviceId,
        sequence,
      }),

    origin:
      "local",

    cachedAt:
      "2026-08-06T10:20:00.000Z",
  });
}

export async function assertOfflineCacheStorageConformance({
  createStorage,
  reset,
}: OfflineCacheStorageConformanceFactory) {
  if (reset) {
    await reset();
  }

  const storage =
    await createStorage();

  const first =
    createEntry({
      id:
        "entry-1",
      sequence:
        1,
    });

  const second =
    createEntry({
      id:
        "entry-2",
      sequence:
        2,
    });

  const otherDevice =
    createEntry({
      id:
        "entry-other-device",
      deviceId:
        "device-2",
      sequence:
        1,
    });

  const otherUser =
    createEntry({
      id:
        "entry-other-user",
      userId:
        "user-2",
      sequence:
        1,
    });

  assert.equal(
    await storage.getById(
      first.id,
    ),
    null,
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-1",
      deviceId:
        "device-1",
    }),
    0,
  );

  const insertedFirst =
    await storage.insert(
      first,
    );

  assert.deepEqual(
    insertedFirst,
    first,
  );

  await storage.insert(
    second,
  );

  await storage.insert(
    otherDevice,
  );

  await storage.insert(
    otherUser,
  );

  assert.deepEqual(
    await storage.getById(
      first.id,
    ),
    first,
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-1",
      deviceId:
        "device-1",
    }),
    2,
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-1",
      deviceId:
        "device-2",
    }),
    1,
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-2",
      deviceId:
        "device-1",
    }),
    1,
  );

  const updatedFirst:
    OfflineCacheEntry = {
      ...first,

      status:
        "applied",

      updatedAt:
        "2026-08-06T10:21:00.000Z",
  };

  const storedUpdate =
    await storage.update(
      updatedFirst,
    );

  assert.deepEqual(
    storedUpdate,
    updatedFirst,
  );

  assert.deepEqual(
    await storage.getById(
      first.id,
    ),
    updatedFirst,
  );

  const staged =
    await storage.list({
      userId:
        "user-1",

      deviceId:
        "device-1",

      statuses: [
        "staged",
      ],

      limit:
        100,
  });

  assert.deepEqual(
    staged.map(
      (entry) =>
        entry.id,
    ),
    [
      second.id,
    ],
  );

  const allForDevice =
    await storage.list({
      userId:
        "user-1",

      deviceId:
        "device-1",

      statuses: [
        "staged",
        "applied",
        "conflicted",
        "invalid",
      ],

      limit:
        100,
  });

  assert.deepEqual(
    new Set(
      allForDevice.map(
        (entry) =>
          entry.id,
      ),
    ),
    new Set([
      first.id,
      second.id,
    ]),
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
      ],

      limit:
        1,
  });

  assert.equal(
    limited.length,
    1,
  );

  const fetched =
    await storage.getById(
      first.id,
    );

  assert.ok(fetched);

  fetched.envelope.payload = {
    mutated:
      true,
  };

  assert.notDeepEqual(
    (
      await storage.getById(
        first.id,
      )
    )?.envelope.payload,
    {
      mutated:
        true,
    },
  );

  if (reset) {
    await reset();
  }
}
