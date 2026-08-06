import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import type {
  OfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import type {
  OfflineCacheRepository,
} from "@/lib/sync/offline-cache/repository";

import type {
  CloudSyncRepository,
  StoredSyncEnvelope,
} from "@/lib/sync/repository";

import {
  createLocalEnvelopeStagingService,
} from "./create-local-envelope-staging-service";

function createEnvelope():
  ApexSyncEnvelope {
  return {
    id:
      "envelope-1",

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
      decision:
        "maintain",
    },

    schemaVersion:
      apexSyncSchemaVersion,

    occurredAt:
      "2026-08-05T21:00:00.000Z",

    createdAt:
      "2026-08-05T21:00:01.000Z",
  };
}

function createStoredEnvelope(
  envelope:
    ApexSyncEnvelope,
): StoredSyncEnvelope {
  return {
    envelope,

    status:
      "pending",

    rejection:
      null,

    acknowledgedAt:
      null,

    updatedAt:
      new Date(
        envelope.createdAt,
      ),
  };
}

async function run() {
  const envelope =
    createEnvelope();

  const calls:
    string[] = [];

  let savedEntry:
    OfflineCacheEntry | null =
      null;

  let enqueuedEnvelope:
    ApexSyncEnvelope | null =
      null;

  const offlineCacheRepository = {
    async save(
      entry:
        OfflineCacheEntry,
    ) {
      calls.push(
        "cache-save",
      );

      savedEntry =
        entry;

      return entry;
    },
  } as OfflineCacheRepository;

  const cloudSyncRepository = {
    async enqueue(
      queuedEnvelope:
        ApexSyncEnvelope,
    ) {
      calls.push(
        "cloud-enqueue",
      );

      enqueuedEnvelope =
        queuedEnvelope;

      return createStoredEnvelope(
        queuedEnvelope,
      );
    },
  } as CloudSyncRepository;

  const service =
    createLocalEnvelopeStagingService({
      offlineCacheRepository,
      cloudSyncRepository,
    });

  const staged =
    await service.stage(
      envelope,
      "2026-08-05T21:01:00.000Z",
    );

  assert.deepEqual(
    calls,
    [
      "cache-save",
      "cloud-enqueue",
    ],
  );

  assert.equal(
    staged.id,
    envelope.id,
  );

  assert.equal(
    staged.origin,
    "local",
  );

  assert.equal(
    staged.status,
    "staged",
  );

  assert.equal(
    staged.cachedAt,
    "2026-08-05T21:01:00.000Z",
  );

  assert.ok(
    savedEntry,
  );

  assert.deepEqual(
    (
      savedEntry as OfflineCacheEntry
    ).envelope,
    envelope,
  );

  assert.deepEqual(
    enqueuedEnvelope,
    envelope,
  );

  let enqueueCalled =
    false;

  const failingCacheRepository: OfflineCacheRepository = {
    ...offlineCacheRepository,

    async save() {
      throw new Error(
        "Offline Cache unavailable.",
      );
    },
  };

  const guardedCloudRepository = {
    async enqueue(
      queuedEnvelope:
        ApexSyncEnvelope,
    ) {
      enqueueCalled =
        true;

      return createStoredEnvelope(
        queuedEnvelope,
      );
    },
  } as CloudSyncRepository;

  const failingService =
    createLocalEnvelopeStagingService({
      offlineCacheRepository:
        failingCacheRepository,

      cloudSyncRepository:
        guardedCloudRepository,
    });

  await assert.rejects(
    () =>
      failingService.stage(
        envelope,
        "2026-08-05T21:02:00.000Z",
      ),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Offline Cache unavailable.",
  );

  assert.equal(
    enqueueCalled,
    false,
  );

  console.log(
    "Local Envelope Staging Service tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
