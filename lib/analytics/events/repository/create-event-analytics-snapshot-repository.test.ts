import assert from "node:assert/strict";

import {
  createEmptyDecisionMemoryEventTypeCounts,
  eventAnalyticsSchemaVersion,
  type DecisionMemoryEventAnalyticsSnapshot,
} from "@/lib/analytics/events/contracts";

import {
  createEventAnalyticsSnapshotRepository,
  type EventAnalyticsSnapshotRow,
  type EventAnalyticsSnapshotStorage,
} from "./create-event-analytics-snapshot-repository";

function createSnapshot({
  id,
  userId = "user-1",
  startAt,
  endAt,
  generatedAt,
}: {
  id: string;
  userId?: string;
  startAt: string;
  endAt: string;
  generatedAt: string;
}): DecisionMemoryEventAnalyticsSnapshot {
  return {
    id,
    userId,

    window: {
      startAt,
      endAt,
    },

    generatedAt,

    schemaVersion:
      eventAnalyticsSchemaVersion,

    totalEventCount:
      0,

    uniqueMemoryCount:
      0,

    uniqueDecisionCount:
      0,

    eventTypeCounts:
      createEmptyDecisionMemoryEventTypeCounts(),

    lifecycle: {
      createdCount:
        0,

      completedCount:
        0,

      incompleteCount:
        0,

      invalidLifecycleCount:
        0,
    },

    confidence: {
      sampleCount:
        0,

      minimum:
        null,

      maximum:
        null,

      average:
        null,
    },

    evidence: {
      sufficientCount:
        0,

      insufficientCount:
        0,

      requiresMoreEvidenceCount:
        0,
    },

    sourceEventIds:
      [],

    sourceEventSchemaVersions:
      [],

    sourceMemoryIds:
      [],

    sourceDecisionIds:
      [],
  };
}

function cloneRow(
  row:
    EventAnalyticsSnapshotRow,
): EventAnalyticsSnapshotRow {
  return structuredClone(
    row,
  );
}

function createMemoryStorage():
  EventAnalyticsSnapshotStorage {
  const rows =
    new Map<
      string,
      EventAnalyticsSnapshotRow
    >();

  return {
    async getById({
      snapshotId,
      userId,
    }) {
      const row =
        rows.get(
          snapshotId,
        );

      if (
        !row ||
        row.userId !==
          userId
      ) {
        return null;
      }

      return cloneRow(
        row,
      );
    },

    async upsert(
      value,
    ) {
      const existing =
        rows.get(
          value.id,
        );

      const row:
        EventAnalyticsSnapshotRow = {
          ...value,

          snapshot:
            structuredClone(
              value.snapshot,
            ),

          createdAt:
            existing
              ?.createdAt ??
            value.updatedAt,
        };

      rows.set(
        row.id,
        cloneRow(
          row,
        ),
      );

      return cloneRow(
        row,
      );
    },

    async listByWindow({
      userId,
      startAt,
      endAt,
      limit,
    }) {
      return [
        ...rows.values(),
      ]
        .filter(
          (row) =>
            row.userId ===
              userId &&
            row.windowEndAt >=
              startAt &&
            row.windowStartAt <=
              endAt,
        )
        .sort(
          (
            first,
            second,
          ) =>
            new Date(
              second.windowEndAt,
            ).getTime() -
              new Date(
                first.windowEndAt,
              ).getTime() ||
            new Date(
              second.generatedAt,
            ).getTime() -
              new Date(
                first.generatedAt,
              ).getTime() ||
            first.id.localeCompare(
              second.id,
            ),
        )
        .slice(
          0,
          limit,
        )
        .map(
          cloneRow,
        );
    },
  };
}

async function run() {
  const storage =
    createMemoryStorage();

  const repository =
    createEventAnalyticsSnapshotRepository(
      storage,
    );

  const first =
    createSnapshot({
      id:
        "snapshot-1",

      startAt:
        "2026-08-01T00:00:00.000Z",

      endAt:
        "2026-08-07T23:59:59.999Z",

      generatedAt:
        "2026-08-08T00:00:00.000Z",
    });

  assert.equal(
    await repository.getById({
      snapshotId:
        first.id,

      userId:
        first.userId,
    }),
    null,
  );

  const saved =
    await repository.save(
      first,
    );

  assert.deepEqual(
    saved,
    first,
  );

  saved.sourceEventIds.push(
    "mutated",
  );

  assert.deepEqual(
    (
      await repository.getById({
        snapshotId:
          first.id,

        userId:
          first.userId,
      })
    )?.sourceEventIds,
    [],
  );

  const identicalRetry =
    await repository.save(
      first,
    );

  assert.deepEqual(
    identicalRetry,
    first,
  );

  await assert.rejects(
    () =>
      repository.save({
        ...first,

        generatedAt:
          "2026-08-09T00:00:00.000Z",
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics snapshot id is already used for different analytics evidence.",
  );

  const second =
    createSnapshot({
      id:
        "snapshot-2",

      startAt:
        "2026-08-08T00:00:00.000Z",

      endAt:
        "2026-08-14T23:59:59.999Z",

      generatedAt:
        "2026-08-15T00:00:00.000Z",
    });

  const third =
    createSnapshot({
      id:
        "snapshot-3",

      startAt:
        "2026-08-08T00:00:00.000Z",

      endAt:
        "2026-08-14T23:59:59.999Z",

      generatedAt:
        "2026-08-16T00:00:00.000Z",
    });

  const otherUser =
    createSnapshot({
      id:
        "snapshot-other-user",

      userId:
        "user-2",

      startAt:
        "2026-08-08T00:00:00.000Z",

      endAt:
        "2026-08-14T23:59:59.999Z",

      generatedAt:
        "2026-08-17T00:00:00.000Z",
    });

  await repository.save(
    second,
  );

  await repository.save(
    third,
  );

  await repository.save(
    otherUser,
  );

  const listed =
    await repository.listByWindow({
      userId:
        "user-1",

      startAt:
        "2026-08-01T00:00:00.000Z",

      endAt:
        "2026-08-31T23:59:59.999Z",

      limit:
        2,
    });

  assert.deepEqual(
    listed.map(
      (snapshot) =>
        snapshot.id,
    ),
    [
      "snapshot-3",
      "snapshot-2",
    ],
  );

  assert.equal(
    listed.some(
      (snapshot) =>
        snapshot.userId ===
        "user-2",
    ),
    false,
  );

  await assert.rejects(
    () =>
      repository.listByWindow({
        userId:
          "user-1",

        startAt:
          "2026-09-01T00:00:00.000Z",

        endAt:
          "2026-08-01T00:00:00.000Z",
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics list startAt cannot be after endAt.",
  );

  console.log(
    "Event Analytics snapshot repository tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
