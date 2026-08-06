import assert from "node:assert/strict";

import {
  createEmptyDecisionMemoryEventTypeCounts,
  decisionMemoryEventAnalyticsAlgorithm,
  decisionMemoryEventAnalyticsAlgorithmVersion,
  decisionMemoryEventAnalyticsReplayEngine,
  eventAnalyticsSchemaVersion,
  type DecisionMemoryEventAnalyticsSnapshot,
} from "@/lib/analytics/events/contracts";

import {
  createPostgresEventAnalyticsSnapshotStorage,
  type PostgresEventAnalyticsDatabase,
} from "./create-postgres-event-analytics-snapshot-storage";

import type {
  PostgresEventAnalyticsSnapshotRow,
} from "./event-analytics-snapshot-row";

function createSnapshot({
  id,
  userId = "user-1",
  startAt =
    "2026-08-01T00:00:00.000Z",
  endAt =
    "2026-08-07T23:59:59.999Z",
  generatedAt =
    "2026-08-08T00:00:00.000Z",
}: {
  id: string;
  userId?: string;
  startAt?: string;
  endAt?: string;
  generatedAt?: string;
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

    provenance: {
      algorithm:
        decisionMemoryEventAnalyticsAlgorithm,

      algorithmVersion:
        decisionMemoryEventAnalyticsAlgorithmVersion,

      replayEngine:
        decisionMemoryEventAnalyticsReplayEngine,

      producedAt:
        generatedAt,

      inputEventCount:
        0,

      includedEventCount:
        0,

      excludedEventCount:
        0,

      excludedEvents:
        [],

      replayedMemoryIds:
        [],

      completedMemoryIds:
        [],

      incompleteMemoryIds:
        [],

      invalidMemoryIds:
        [],
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

function postgresRowFromSnapshot(
  snapshot:
    DecisionMemoryEventAnalyticsSnapshot,
): PostgresEventAnalyticsSnapshotRow {
  return {
    id:
      snapshot.id,

    userId:
      snapshot.userId,

    windowStartAt:
      new Date(
        snapshot.window.startAt,
      ),

    windowEndAt:
      new Date(
        snapshot.window.endAt,
      ),

    generatedAt:
      new Date(
        snapshot.generatedAt,
      ),

    schemaVersion:
      snapshot.schemaVersion,

    snapshot:
      structuredClone(
        snapshot,
      ),

    createdAt:
      new Date(
        "2026-08-08T00:00:01.000Z",
      ),

    updatedAt:
      new Date(
        "2026-08-08T00:00:02.000Z",
      ),
  };
}

function createFakeDatabase() {
  const rows =
    new Map<
      string,
      PostgresEventAnalyticsSnapshotRow
    >();

  let pendingSelectMode:
    "scoped" |
    "unscoped" |
    "window" =
      "scoped";

  const database = {
    select() {
      return {
        from() {
          return {
            where(
              condition:
                unknown,
            ) {
              void condition;

              const selected = {
                orderBy(
                  ...ordering:
                    unknown[]
                ) {
                  void ordering;

                  pendingSelectMode =
                    "window";

                  return {
                    limit(
                      limit:
                        number,
                    ) {
                      return [
                        ...rows.values(),
                      ]
                        .sort(
                          (
                            first,
                            second,
                          ) =>
                            second.windowEndAt
                              .getTime() -
                              first.windowEndAt
                                .getTime() ||
                            second.generatedAt
                              .getTime() -
                              first.generatedAt
                                .getTime() ||
                            first.id.localeCompare(
                              second.id,
                            ),
                        )
                        .slice(
                          0,
                          limit,
                        );
                    },
                  };
                },

                limit(
                  limit:
                    number,
                ) {
                  void limit;

                  const values = [
                    ...rows.values(),
                  ];

                  if (
                    pendingSelectMode ===
                    "unscoped"
                  ) {
                    pendingSelectMode =
                      "scoped";
                  }

                  return values.slice(
                    0,
                    1,
                  );
                },
              };

              return selected;
            },
          };
        },
      };
    },

    insert() {
      return {
        values(
          value:
            Omit<
              PostgresEventAnalyticsSnapshotRow,
              | "createdAt"
            >,
        ) {
          return {
            onConflictDoNothing() {
              return {
                returning() {
                  if (
                    rows.has(
                      value.id,
                    )
                  ) {
                    pendingSelectMode =
                      "unscoped";

                    return [];
                  }

                  const row:
                    PostgresEventAnalyticsSnapshotRow = {
                    ...value,

                    snapshot:
                      structuredClone(
                        value.snapshot,
                      ),

                    createdAt:
                      new Date(
                        "2026-08-08T00:00:01.000Z",
                      ),
                  };

                  rows.set(
                    row.id,
                    row,
                  );

                  return [
                    row,
                  ];
                },
              };
            },
          };
        },
      };
    },
  } as unknown as
    PostgresEventAnalyticsDatabase;

  return {
    database,
    rows,
  };
}

async function run() {
  const {
    database,
    rows,
  } =
    createFakeDatabase();

  const storage =
    createPostgresEventAnalyticsSnapshotStorage(
      database,
    );

  const first =
    createSnapshot({
      id:
        "snapshot-1",
    });

  assert.equal(
    await storage.getById({
      snapshotId:
        first.id,

      userId:
        first.userId,
    }),
    null,
  );

  const inserted =
    await storage.upsert({
      id:
        first.id,

      userId:
        first.userId,

      windowStartAt:
        first.window.startAt,

      windowEndAt:
        first.window.endAt,

      generatedAt:
        first.generatedAt,

      schemaVersion:
        first.schemaVersion,

      snapshot:
        first,

      updatedAt:
        "2026-08-08T00:00:02.000Z",
    });

  assert.deepEqual(
    inserted.snapshot,
    first,
  );

  const retry =
    await storage.upsert({
      id:
        first.id,

      userId:
        first.userId,

      windowStartAt:
        first.window.startAt,

      windowEndAt:
        first.window.endAt,

      generatedAt:
        first.generatedAt,

      schemaVersion:
        first.schemaVersion,

      snapshot:
        first,

      updatedAt:
        "2026-08-08T00:00:03.000Z",
    });

  assert.deepEqual(
    retry.snapshot,
    first,
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

  rows.set(
    second.id,
    postgresRowFromSnapshot(
      second,
    ),
  );

  const listed =
    await storage.listByWindow({
      userId:
        "user-1",

      startAt:
        "2026-08-01T00:00:00.000Z",

      endAt:
        "2026-08-31T23:59:59.999Z",

      limit:
        10,
    });

  assert.deepEqual(
    listed.map(
      (row) =>
        row.id,
    ),
    [
      "snapshot-2",
      "snapshot-1",
    ],
  );

  assert.equal(
    listed[0]
      ?.snapshot
      .provenance
      .algorithm,
    decisionMemoryEventAnalyticsAlgorithm,
  );

  console.log(
    "PostgreSQL Event Analytics snapshot storage tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
