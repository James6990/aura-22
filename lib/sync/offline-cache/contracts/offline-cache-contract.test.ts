import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import {
  compareOfflineCacheEntries,
  createOfflineCacheEntry,
  offlineCacheSchemaVersion,
  sameOfflineCacheEntry,
  validateOfflineCacheEntry,
  type OfflineCacheEntry,
} from "./offline-cache-contract";

function createEnvelope({
  id = "envelope-1",
  userId = "user-1",
  deviceId = "device-1",
  sequence = 1,
  occurredAt = "2026-08-05T20:00:00.000Z",
}: {
  id?: string;
  userId?: string;
  deviceId?: string;
  sequence?: number;
  occurredAt?: string;
} = {}): ApexSyncEnvelope {
  return {
    id,
    userId,
    deviceId,
    entityType:
      "decision-memory-event",
    entityId:
      "memory-1",
    operation:
      "append",
    sequence,
    payload: {
      eventType:
        "decision-memory.created",
    },
    schemaVersion:
      apexSyncSchemaVersion,
    occurredAt,
    createdAt:
      occurredAt,
  };
}

function cloneEntry(
  entry:
    OfflineCacheEntry,
): OfflineCacheEntry {
  return JSON.parse(
    JSON.stringify(entry),
  );
}

function expectError(
  action:
    () => unknown,
  message:
    string,
) {
  assert.throws(
    action,
    (error: unknown) =>
      error instanceof Error &&
      error.message === message,
  );
}

const cachedAt =
  "2026-08-05T20:05:00.000Z";

const localEntry =
  createOfflineCacheEntry({
    envelope:
      createEnvelope(),
    origin:
      "local",
    cachedAt,
  });

assert.equal(
  localEntry.id,
  "envelope-1",
);

assert.equal(
  localEntry.userId,
  "user-1",
);

assert.equal(
  localEntry.deviceId,
  "device-1",
);

assert.equal(
  localEntry.status,
  "staged",
);

assert.equal(
  localEntry.conflict,
  null,
);

assert.equal(
  localEntry.schemaVersion,
  offlineCacheSchemaVersion,
);

assert.equal(
  validateOfflineCacheEntry(
    localEntry,
  ),
  localEntry,
);

const remoteEntry =
  createOfflineCacheEntry({
    envelope:
      createEnvelope({
        id:
          "envelope-2",
        sequence:
          2,
      }),
    origin:
      "remote",
    status:
      "applied",
    cachedAt,
  });

assert.equal(
  remoteEntry.origin,
  "remote",
);

assert.equal(
  remoteEntry.status,
  "applied",
);

const conflictedEntry =
  createOfflineCacheEntry({
    envelope:
      createEnvelope({
        id:
          "envelope-3",
        sequence:
          3,
      }),
    origin:
      "remote",
    status:
      "conflicted",
    conflict: {
      code:
        "remote-divergence",
      message:
        "Remote state differs from the local cached state.",
      detectedAt:
        "2026-08-05T20:06:00.000Z",
      relatedEnvelopeId:
        "envelope-1",
    },
    cachedAt,
  });

assert.equal(
  conflictedEntry.conflict?.code,
  "remote-divergence",
);

const mismatchedUser =
  cloneEntry(localEntry);

mismatchedUser.userId =
  "user-2";

expectError(
  () =>
    validateOfflineCacheEntry(
      mismatchedUser,
    ),
  "Offline Cache entry user ownership does not match its sync envelope.",
);

const mismatchedDevice =
  cloneEntry(localEntry);

mismatchedDevice.deviceId =
  "device-2";

expectError(
  () =>
    validateOfflineCacheEntry(
      mismatchedDevice,
    ),
  "Offline Cache entry device ownership does not match its sync envelope.",
);

const mismatchedId =
  cloneEntry(localEntry);

mismatchedId.id =
  "different-entry";

expectError(
  () =>
    validateOfflineCacheEntry(
      mismatchedId,
    ),
  "Offline Cache entry id must match its sync envelope id.",
);

const unsupportedOrigin =
  cloneEntry(localEntry);

(
  unsupportedOrigin as {
    origin: string;
  }
).origin =
  "unknown";

expectError(
  () =>
    validateOfflineCacheEntry(
      unsupportedOrigin,
    ),
  "Offline Cache entry uses an unsupported origin.",
);

const unsupportedStatus =
  cloneEntry(localEntry);

(
  unsupportedStatus as {
    status: string;
  }
).status =
  "unknown";

expectError(
  () =>
    validateOfflineCacheEntry(
      unsupportedStatus,
    ),
  "Offline Cache entry uses an unsupported status.",
);

const unsupportedCacheSchema =
  cloneEntry(localEntry);

unsupportedCacheSchema.schemaVersion =
  offlineCacheSchemaVersion + 1;

expectError(
  () =>
    validateOfflineCacheEntry(
      unsupportedCacheSchema,
    ),
  "Offline Cache entry uses an unsupported schema version.",
);

const unsupportedSyncSchema =
  cloneEntry(localEntry);

unsupportedSyncSchema.envelope.schemaVersion =
  apexSyncSchemaVersion + 1;

expectError(
  () =>
    validateOfflineCacheEntry(
      unsupportedSyncSchema,
    ),
  "Offline Cache envelope uses an unsupported sync schema version.",
);

const conflictWithoutDetails =
  cloneEntry(localEntry);

conflictWithoutDetails.status =
  "conflicted";

expectError(
  () =>
    validateOfflineCacheEntry(
      conflictWithoutDetails,
    ),
  "A conflicted Offline Cache entry must include conflict details.",
);

const detailsWithoutConflict =
  cloneEntry(localEntry);

detailsWithoutConflict.conflict = {
  code:
    "entity-conflict",
  message:
    "Entity differs.",
  detectedAt:
    "2026-08-05T20:06:00.000Z",
  relatedEnvelopeId:
    null,
};

expectError(
  () =>
    validateOfflineCacheEntry(
      detailsWithoutConflict,
    ),
  "Only conflicted Offline Cache entries may include conflict details.",
);

const unsupportedConflictCode =
  cloneEntry(conflictedEntry);

(
  unsupportedConflictCode
    .conflict as {
      code: string;
    }
).code =
  "unknown";

expectError(
  () =>
    validateOfflineCacheEntry(
      unsupportedConflictCode,
    ),
  "Offline Cache conflict uses an unsupported code.",
);

const sequenceOneLaterTime =
  createOfflineCacheEntry({
    envelope:
      createEnvelope({
        id:
          "envelope-b",
        sequence:
          1,
        occurredAt:
          "2026-08-05T20:02:00.000Z",
      }),
    origin:
      "local",
    cachedAt,
  });

const sequenceOneEarlierTime =
  createOfflineCacheEntry({
    envelope:
      createEnvelope({
        id:
          "envelope-a",
        sequence:
          1,
        occurredAt:
          "2026-08-05T20:01:00.000Z",
      }),
    origin:
      "local",
    cachedAt,
  });

const sequenceTwo =
  createOfflineCacheEntry({
    envelope:
      createEnvelope({
        id:
          "envelope-c",
        sequence:
          2,
        occurredAt:
          "2026-08-05T19:00:00.000Z",
      }),
    origin:
      "local",
    cachedAt,
  });

const sorted = [
  sequenceTwo,
  sequenceOneLaterTime,
  sequenceOneEarlierTime,
].sort(
  compareOfflineCacheEntries,
);

assert.deepEqual(
  sorted.map(
    (entry) =>
      entry.id,
  ),
  [
    "envelope-a",
    "envelope-b",
    "envelope-c",
  ],
);

assert.equal(
  sameOfflineCacheEntry(
    localEntry,
    cloneEntry(localEntry),
  ),
  true,
);

const changedEntry =
  cloneEntry(localEntry);

changedEntry.updatedAt =
  "2026-08-05T20:10:00.000Z";

assert.equal(
  sameOfflineCacheEntry(
    localEntry,
    changedEntry,
  ),
  false,
);

console.log(
  "Offline Cache contract tests passed.",
);
