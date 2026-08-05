import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
  type OfflineCacheEntry,
  type OfflineCacheEntryStatus,
} from "@/lib/sync/offline-cache/contracts";

import {
  createOfflineCacheRepository,
  type OfflineCacheStorage,
} from "./create-offline-cache-repository";

function cloneEntry(
  entry:
    OfflineCacheEntry,
): OfflineCacheEntry {
  return JSON.parse(
    JSON.stringify(entry),
  );
}

function createEnvelope({
  id,
  sequence,
  userId = "user-1",
  deviceId = "device-1",
}: {
  id: string;
  sequence: number;
  userId?: string;
  deviceId?: string;
}): ApexSyncEnvelope {
  return {
    id,
    userId,
    deviceId,
    entityType:
      "decision-memory-event",
    entityId:
      `memory-${sequence}`,
    operation:
      "append",
    sequence,
    payload: {
      sequence,
    },
    schemaVersion:
      apexSyncSchemaVersion,
    occurredAt:
      `2026-08-05T20:0${sequence}:00.000Z`,
    createdAt:
      `2026-08-05T20:0${sequence}:00.000Z`,
  };
}

function createEntry({
  id,
  sequence,
  userId = "user-1",
  deviceId = "device-1",
}: {
  id: string;
  sequence: number;
  userId?: string;
  deviceId?: string;
}) {
  return createOfflineCacheEntry({
    envelope:
      createEnvelope({
        id,
        sequence,
        userId,
        deviceId,
      }),
    origin:
      "local",
    cachedAt:
      "2026-08-05T20:10:00.000Z",
  });
}

function createMemoryStorage():
  OfflineCacheStorage & {
    entries:
      Map<string, OfflineCacheEntry>;
  } {
  const entries =
    new Map<
      string,
      OfflineCacheEntry
    >();

  return {
    entries,

    async getById(
      entryId,
    ) {
      const entry =
        entries.get(
          entryId,
        );

      return entry
        ? cloneEntry(entry)
        : null;
    },

    async getHighestSequence({
      userId,
      deviceId,
    }) {
      let highest = 0;

      for (
        const entry of
        entries.values()
      ) {
        if (
          entry.userId === userId &&
          entry.deviceId ===
            deviceId
        ) {
          highest =
            Math.max(
              highest,
              entry.envelope
                .sequence,
            );
        }
      }

      return highest;
    },

    async insert(
      entry,
    ) {
      const stored =
        cloneEntry(entry);

      entries.set(
        stored.id,
        stored,
      );

      return cloneEntry(
        stored,
      );
    },

    async update(
      entry,
    ) {
      const stored =
        cloneEntry(entry);

      entries.set(
        stored.id,
        stored,
      );

      return cloneEntry(
        stored,
      );
    },

    async list({
      userId,
      deviceId,
      statuses,
      limit,
    }) {
      return [
        ...entries.values(),
      ]
        .filter(
          (entry) =>
            entry.userId ===
              userId &&
            entry.deviceId ===
              deviceId &&
            statuses.includes(
              entry.status,
            ),
        )
        .slice(
          0,
          limit,
        )
        .map(
          cloneEntry,
        );
    },
  };
}

function expectError(
  action:
    () => Promise<unknown>,
  message:
    string,
) {
  return assert.rejects(
    action,
    (error: unknown) =>
      error instanceof Error &&
      error.message === message,
  );
}

async function run() {
  const storage =
    createMemoryStorage();

  const repository =
    createOfflineCacheRepository(
      storage,
    );

  const entryOne =
    createEntry({
      id:
        "entry-1",
      sequence:
        1,
    });

  const savedOne =
    await repository.save(
      entryOne,
    );

  assert.equal(
    savedOne.id,
    "entry-1",
  );

  const savedAgain =
    await repository.save(
      cloneEntry(entryOne),
    );

  assert.deepEqual(
    savedAgain,
    savedOne,
  );

  const changedDuplicate =
    cloneEntry(entryOne);

  changedDuplicate.updatedAt =
    "2026-08-05T20:11:00.000Z";

  await expectError(
    () =>
      repository.save(
        changedDuplicate,
      ),
    "Offline Cache entry id already exists with different data.",
  );

  const sequenceConflict =
    createEntry({
      id:
        "entry-sequence-conflict",
      sequence:
        1,
    });

  await expectError(
    () =>
      repository.save(
        sequenceConflict,
      ),
    "Offline Cache sequence must be greater than 1.",
  );

  const entryThree =
    createEntry({
      id:
        "entry-3",
      sequence:
        3,
    });

  const entryTwo =
    createEntry({
      id:
        "entry-2",
      sequence:
        2,
    });

  await repository.save(
    entryThree,
  );

  storage.entries.set(
    entryTwo.id,
    cloneEntry(entryTwo),
  );

  const listed =
    await repository.list({
      userId:
        "user-1",
      deviceId:
        "device-1",
    });

  assert.deepEqual(
    listed.map(
      (entry) =>
        entry.id,
    ),
    [
      "entry-1",
      "entry-2",
      "entry-3",
    ],
  );

  const fetched =
    await repository.getById({
      entryId:
        "entry-1",
      userId:
        "user-1",
      deviceId:
        "device-1",
    });

  assert.equal(
    fetched?.id,
    "entry-1",
  );

  await expectError(
    () =>
      repository.getById({
        entryId:
          "entry-1",
        userId:
          "user-2",
        deviceId:
          "device-1",
      }),
    "Offline Cache entry belongs to another user or device.",
  );

  const applied =
    await repository.markApplied({
      entryId:
        "entry-1",
      userId:
        "user-1",
      deviceId:
        "device-1",
      updatedAt:
        "2026-08-05T20:20:00.000Z",
    });

  assert.equal(
    applied.status,
    "applied",
  );

  assert.equal(
    applied.conflict,
    null,
  );

  const conflicted =
    await repository.markConflicted({
      entryId:
        "entry-2",
      userId:
        "user-1",
      deviceId:
        "device-1",
      conflict: {
        code:
          "remote-divergence",
        message:
          "Remote envelope diverges from local cached state.",
        detectedAt:
          "2026-08-05T20:21:00.000Z",
        relatedEnvelopeId:
          "remote-entry-2",
      },
      updatedAt:
        "2026-08-05T20:21:00.000Z",
    });

  assert.equal(
    conflicted.status,
    "conflicted",
  );

  assert.equal(
    conflicted.conflict
      ?.code,
    "remote-divergence",
  );

  const invalid =
    await repository.markInvalid({
      entryId:
        "entry-3",
      userId:
        "user-1",
      deviceId:
        "device-1",
      updatedAt:
        "2026-08-05T20:22:00.000Z",
    });

  assert.equal(
    invalid.status,
    "invalid",
  );

  const filtered =
    await repository.list({
      userId:
        "user-1",
      deviceId:
        "device-1",
      statuses: [
        "conflicted",
      ],
    });

  assert.deepEqual(
    filtered.map(
      (entry) =>
        entry.id,
    ),
    [
      "entry-2",
    ],
  );

  await expectError(
    () =>
      repository.list({
        userId:
          "user-1",
        deviceId:
          "device-1",
        statuses:
          [] as OfflineCacheEntryStatus[],
      }),
    "Offline Cache list requires at least one status.",
  );

  await expectError(
    () =>
      repository.list({
        userId:
          "user-1",
        deviceId:
          "device-1",
        limit:
          0,
      }),
    "Offline Cache list limit must be between 1 and 500.",
  );

  await expectError(
    () =>
      repository.markApplied({
        entryId:
          "missing",
        userId:
          "user-1",
        deviceId:
          "device-1",
        updatedAt:
          "2026-08-05T20:30:00.000Z",
      }),
    'Offline Cache entry "missing" was not found.',
  );

  console.log(
    "Offline Cache repository tests passed.",
  );
}

run().catch(
  (error) => {
    console.error(
      error,
    );

    process.exitCode = 1;
  },
);
