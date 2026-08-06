import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
  type ApexSyncAcknowledgement,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
  type OfflineCacheEntry,
  type OfflineCacheConflict,
} from "@/lib/sync/offline-cache/contracts";

import type {
  OfflineCacheRepository,
} from "@/lib/sync/offline-cache/repository";

import {
  createOfflineCacheAcknowledgementReconciliationService,
} from "./create-offline-cache-acknowledgement-reconciliation-service";

function createEntry({
  id,
  sequence,
}: {
  id: string;
  sequence: number;
}) {
  const envelope:
    ApexSyncEnvelope = {
      id,

      userId:
        "user-1",

      deviceId:
        "device-1",

      entityType:
        "decision-memory-event",

      entityId:
        `memory-${sequence}`,

      operation:
        "append",

      sequence,

      payload: {
        id,
      },

      schemaVersion:
        apexSyncSchemaVersion,

      occurredAt:
        `2026-08-06T10:0${sequence}:00.000Z`,

      createdAt:
        `2026-08-06T10:0${sequence}:01.000Z`,
    };

  return createOfflineCacheEntry({
    envelope,
    origin:
      "local",
    cachedAt:
      "2026-08-06T10:10:00.000Z",
  });
}

async function run() {
  const entries =
    new Map<
      string,
      OfflineCacheEntry
    >([
      [
        "accepted-1",
        createEntry({
          id:
            "accepted-1",
          sequence:
            1,
        }),
      ],
      [
        "conflicted-1",
        createEntry({
          id:
            "conflicted-1",
          sequence:
            2,
        }),
      ],
    ]);

  let appliedCalls =
    0;

  let conflictCalls =
    0;

  let failConflictOnce =
    true;

  const repository = {
    async getById({
      entryId,
    }: {
      entryId: string;
    }) {
      return entries.get(
        entryId,
      ) ?? null;
    },

    async markApplied({
      entryId,
      updatedAt,
    }: {
      entryId: string;
      updatedAt: string;
    }) {
      appliedCalls += 1;

      const current =
        entries.get(
          entryId,
        );

      assert.ok(current);

      const updated:
        OfflineCacheEntry = {
          ...current,
          status:
            "applied",
          conflict:
            null,
          updatedAt,
        };

      entries.set(
        entryId,
        updated,
      );

      return updated;
    },

    async markConflicted({
      entryId,
      conflict,
      updatedAt,
    }: {
      entryId: string;
      conflict:
        OfflineCacheConflict;
      updatedAt: string;
    }) {
      conflictCalls += 1;

      if (failConflictOnce) {
        failConflictOnce =
          false;

        throw new Error(
          "Temporary Offline Cache write failure.",
        );
      }

      const current =
        entries.get(
          entryId,
        );

      assert.ok(current);

      const updated:
        OfflineCacheEntry = {
          ...current,
          status:
            "conflicted",
          conflict,
          updatedAt,
        };

      entries.set(
        entryId,
        updated,
      );

      return updated;
    },
  } as unknown as
    OfflineCacheRepository;

  const acknowledgement:
    ApexSyncAcknowledgement = {
      batchId:
        "batch-1",

      userId:
        "user-1",

      deviceId:
        "device-1",

      acceptedEnvelopeIds: [
        "accepted-1",
      ],

      rejected: [
        {
          envelopeId:
            "conflicted-1",

          code:
            "sequence-conflict",

          message:
            "Sequence must be retried.",

          retryable:
            true,
        },
      ],

      nextCheckpoint: {
        userId:
          "user-1",

        deviceId:
          "device-1",

        cursor:
          null,

        lastUploadedSequence:
          2,

        lastDownloadedAt:
          null,

        updatedAt:
          "2026-08-06T10:20:00.000Z",

        schemaVersion:
          apexSyncSchemaVersion,
      },

      serverTime:
        "2026-08-06T10:20:00.000Z",

      schemaVersion:
        apexSyncSchemaVersion,
    };

  const service =
    createOfflineCacheAcknowledgementReconciliationService({
      offlineCacheRepository:
        repository,
    });

  await assert.rejects(
    () =>
      service.reconcile(
        acknowledgement,
      ),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Temporary Offline Cache write failure.",
  );

  assert.equal(
    entries.get(
      "accepted-1",
    )?.status,
    "applied",
  );

  assert.equal(
    entries.get(
      "conflicted-1",
    )?.status,
    "staged",
  );

  await service.reconcile(
    acknowledgement,
  );

  assert.equal(
    appliedCalls,
    1,
  );

  assert.equal(
    conflictCalls,
    2,
  );

  assert.equal(
    entries.get(
      "conflicted-1",
    )?.status,
    "conflicted",
  );

  assert.equal(
    entries.get(
      "conflicted-1",
    )?.conflict?.retryable,
    true,
  );

  console.log(
    "Offline Cache acknowledgement retry-boundary tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
