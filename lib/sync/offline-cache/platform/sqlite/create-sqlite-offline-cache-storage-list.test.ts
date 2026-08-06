import assert from "node:assert/strict";

import {
  apexSyncSchemaVersion,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
  type OfflineCacheEntryStatus,
} from "@/lib/sync/offline-cache/contracts";

import {
  createSQLiteOfflineCacheStorage,
} from "./create-sqlite-offline-cache-storage";

import {
  sqliteRowFromOfflineCacheEntry,
} from "./sqlite-offline-cache-entry-row";

import type {
  SQLiteOfflineCacheConnection,
} from "./create-sqlite-offline-cache-database";

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
        `2026-08-06T12:${String(
          sequence,
        ).padStart(2, "0")}:00.000Z`,

      createdAt:
        `2026-08-06T12:${String(
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
              "Sequence conflict.",

            detectedAt:
              "2026-08-06T12:10:00.000Z",

            relatedEnvelopeId:
              id,

            retryable:
              true,
          }
        : null,

    cachedAt:
      "2026-08-06T12:20:00.000Z",
  });
}

async function run() {
  const entries = [
    createEntry({
      id:
        "staged-3",
      sequence:
        3,
      status:
        "staged",
    }),

    createEntry({
      id:
        "applied-1",
      sequence:
        1,
      status:
        "applied",
    }),

    createEntry({
      id:
        "conflicted-2",
      sequence:
        2,
      status:
        "conflicted",
    }),

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
  ];

  let capturedStatement =
    "";

  let capturedValues:
    unknown[] = [];

  const connection = {
    async query(
      statement:
        string,
      values?:
        unknown[],
    ) {
      capturedStatement =
        statement;

      capturedValues =
        values ?? [];

      const userId =
        String(
          values?.[0],
        );

      const deviceId =
        String(
          values?.[1],
        );

      const limit =
        Number(
          values?.[
            values.length - 1
          ],
        );

      const statuses =
        (
          values ??
          []
        )
          .slice(
            2,
            -1,
          )
          .map(
            String,
          );

      return {
        values:
          entries
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
            .sort(
              (
                first,
                second,
              ) =>
                first.envelope
                  .sequence -
                  second.envelope
                    .sequence ||
                first.envelope
                  .occurredAt
                  .localeCompare(
                    second.envelope
                      .occurredAt,
                  ) ||
                first.id.localeCompare(
                  second.id,
                ),
            )
            .slice(
              0,
              limit,
            )
            .map(
              sqliteRowFromOfflineCacheEntry,
            ),
      };
    },
  } as unknown as
    SQLiteOfflineCacheConnection;

  const storage =
    createSQLiteOfflineCacheStorage({
      connection,
    });

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
        2,
    });

  assert.deepEqual(
    selected.map(
      (entry) =>
        entry.id,
    ),
    [
      "applied-1",
      "conflicted-2",
    ],
  );

  assert.match(
    capturedStatement,
    /status IN \(\?, \?, \?\)/,
  );

  assert.match(
    capturedStatement,
    /ORDER BY/,
  );

  assert.match(
    capturedStatement,
    /LIMIT \?/,
  );

  assert.deepEqual(
    capturedValues,
    [
      "user-1",
      "device-1",
      "staged",
      "applied",
      "conflicted",
      2,
    ],
  );

  const empty =
    await storage.list({
      userId:
        "user-1",

      deviceId:
        "device-1",

      statuses:
        [],

      limit:
        10,
    });

  assert.deepEqual(
    empty,
    [],
  );

  selected[0]!.envelope.payload = {
    mutated:
      true,
  };

  assert.notDeepEqual(
    entries[1]
      ?.envelope.payload,
    {
      mutated:
        true,
    },
  );

  console.log(
    "SQLite Offline Cache list tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
