import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
  type ApexSyncDownloadBatch,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import type {
  OfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import type {
  OfflineCacheRepository,
} from "@/lib/sync/offline-cache/repository";

import {
  createRemoteEnvelopeCacheApplicationSink,
} from "./create-remote-envelope-cache-application-sink";

function createEnvelope({
  id,
  deviceId,
  sequence,
  occurredAt,
}: {
  id: string;
  deviceId: string;
  sequence: number;
  occurredAt: string;
}): ApexSyncEnvelope {
  return {
    id,

    userId:
      "user-1",

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

    occurredAt,

    createdAt:
      occurredAt,
  };
}

async function run() {
  const later =
    createEnvelope({
      id:
        "envelope-2",

      deviceId:
        "source-device-2",

      sequence:
        2,

      occurredAt:
        "2026-08-05T22:02:00.000Z",
    });

  const earlier =
    createEnvelope({
      id:
        "envelope-1",

      deviceId:
        "source-device-1",

      sequence:
        1,

      occurredAt:
        "2026-08-05T22:01:00.000Z",
    });

  const batch:
    ApexSyncDownloadBatch = {
      userId:
        "user-1",

      deviceId:
        "receiving-device",

      previousCursor:
        null,

      nextCursor:
        "cursor-1",

      envelopes: [
        later,
        earlier,
      ],

      hasMore:
        false,

      serverTime:
        "2026-08-05T22:05:00.000Z",

      schemaVersion:
        apexSyncSchemaVersion,
    };

  const saved:
    OfflineCacheEntry[] = [];

  const offlineCacheRepository = {
    async save(
      entry:
        OfflineCacheEntry,
    ) {
      saved.push(
        entry,
      );

      return entry;
    },
  } as unknown as
    OfflineCacheRepository;

  const sink =
    createRemoteEnvelopeCacheApplicationSink({
      offlineCacheRepository,
    });

  await sink.apply({
    batch,
    envelopes:
      batch.envelopes,
  });

  assert.deepEqual(
    saved.map(
      (entry) =>
        entry.id,
    ),
    [
      "envelope-1",
      "envelope-2",
    ],
  );

  for (
    const entry of saved
  ) {
    assert.equal(
      entry.origin,
      "remote",
    );

    assert.equal(
      entry.status,
      "staged",
    );

    assert.equal(
      entry.cachedAt,
      batch.serverTime,
    );

    assert.equal(
      entry.updatedAt,
      batch.serverTime,
    );
  }

  assert.equal(
    saved[0]?.deviceId,
    "source-device-1",
  );

  await assert.rejects(
    () =>
      sink.apply({
        batch,

        envelopes: [
          earlier,
          later,
        ],
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Remote Offline Cache application envelopes do not match the download batch.",
  );

  console.log(
    "Remote Envelope Cache Application Sink tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
