import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
  type ApexSyncAcknowledgement,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
  type OfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import type {
  OfflineCacheRepository,
} from "@/lib/sync/offline-cache/repository";

import {
  createOfflineCacheAcknowledgementReconciliationService,
} from "./create-offline-cache-acknowledgement-reconciliation-service";

function createEnvelope({
  id,
  sequence,
}: {
  id: string;
  sequence: number;
}): ApexSyncEnvelope {
  return {
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
      `2026-08-06T09:0${sequence}:00.000Z`,

    createdAt:
      `2026-08-06T09:0${sequence}:01.000Z`,
  };
}

function createEntry({
  id,
  sequence,
}: {
  id: string;
  sequence: number;
}) {
  return createOfflineCacheEntry({
    envelope:
      createEnvelope({
        id,
        sequence,
      }),

    origin:
      "local",

    cachedAt:
      "2026-08-06T09:10:00.000Z",
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
        "rejected-conflict",
        createEntry({
          id:
            "rejected-conflict",
          sequence:
            2,
        }),
      ],
      [
        "rejected-invalid",
        createEntry({
          id:
            "rejected-invalid",
          sequence:
            3,
        }),
      ],
    ]);

  const calls:
    string[] = [];

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
      calls.push(
        `applied:${entryId}`,
      );

      const current =
        entries.get(
          entryId,
        );

      assert.ok(current);

      const updated: OfflineCacheEntry = {
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
        NonNullable<
          OfflineCacheEntry["conflict"]
        >;
      updatedAt: string;
    }) {
      calls.push(
        `conflicted:${entryId}`,
      );

      const current =
        entries.get(
          entryId,
        );

      assert.ok(current);

      const updated: OfflineCacheEntry = {
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

    async markInvalid({
      entryId,
      updatedAt,
    }: {
      entryId: string;
      updatedAt: string;
    }) {
      calls.push(
        `invalid:${entryId}`,
      );

      const current =
        entries.get(
          entryId,
        );

      assert.ok(current);

      const updated: OfflineCacheEntry = {
        ...current,
        status:
          "invalid",
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
            "rejected-conflict",

          code:
            "sequence-conflict",

          message:
            "Sequence already exists.",

          retryable:
            true,
        },
        {
          envelopeId:
            "rejected-invalid",

          code:
            "invalid-envelope",

          message:
            "Envelope is invalid.",

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
          3,

        lastDownloadedAt:
          null,

        updatedAt:
          "2026-08-06T09:20:00.000Z",

        schemaVersion:
          apexSyncSchemaVersion,
      },

      serverTime:
        "2026-08-06T09:20:00.000Z",

      schemaVersion:
        apexSyncSchemaVersion,
    };

  const service =
    createOfflineCacheAcknowledgementReconciliationService({
      offlineCacheRepository:
        repository,
    });

  const result =
    await service.reconcile(
      acknowledgement,
    );

  assert.deepEqual(
    result,
    {
      appliedEnvelopeIds: [
        "accepted-1",
      ],

      conflictedEnvelopeIds: [
        "rejected-conflict",
      ],

      invalidEnvelopeIds: [
        "rejected-invalid",
      ],
    },
  );

  assert.deepEqual(
    calls,
    [
      "applied:accepted-1",
      "conflicted:rejected-conflict",
      "invalid:rejected-invalid",
    ],
  );

  assert.equal(
    entries.get(
      "rejected-conflict",
    )?.conflict?.retryable,
    true,
  );

  calls.length =
    0;

  await service.reconcile(
    acknowledgement,
  );

  assert.deepEqual(
    calls,
    [],
  );

  await assert.rejects(
    () =>
      service.reconcile({
        ...acknowledgement,

        acceptedEnvelopeIds: [
          "missing-entry",
        ],

        rejected:
          [],
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        'Offline Cache acknowledgement entry "missing-entry" was not found.',
  );

  console.log(
    "Offline Cache acknowledgement reconciliation tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
