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
  eventAnalyticsSnapshotRowFromPostgres,
  eventAnalyticsSnapshotWriteToPostgres,
  type PostgresEventAnalyticsSnapshotRow,
} from "./event-analytics-snapshot-row";

function createSnapshot():
  DecisionMemoryEventAnalyticsSnapshot {
  return {
    id:
      "snapshot-1",

    userId:
      "user-1",

    window: {
      startAt:
        "2026-08-01T00:00:00.000Z",

      endAt:
        "2026-08-07T23:59:59.999Z",
    },

    generatedAt:
      "2026-08-08T00:00:00.000Z",

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
        "2026-08-08T00:00:00.000Z",

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

function run() {
  const snapshot =
    createSnapshot();

  const row:
    PostgresEventAnalyticsSnapshotRow = {
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

      snapshot,

      createdAt:
        new Date(
          "2026-08-08T00:00:01.000Z",
        ),

      updatedAt:
        new Date(
          "2026-08-08T00:00:02.000Z",
        ),
    };

  const mapped =
    eventAnalyticsSnapshotRowFromPostgres(
      row,
    );

  assert.deepEqual(
    mapped.snapshot,
    snapshot,
  );

  assert.equal(
    mapped.windowStartAt,
    snapshot.window.startAt,
  );

  assert.equal(
    mapped.generatedAt,
    snapshot.generatedAt,
  );

  mapped.snapshot.sourceEventIds.push(
    "mutated",
  );

  assert.deepEqual(
    snapshot.sourceEventIds,
    [],
  );

  const write =
    eventAnalyticsSnapshotWriteToPostgres({
      id:
        snapshot.id,

      userId:
        snapshot.userId,

      windowStartAt:
        snapshot.window.startAt,

      windowEndAt:
        snapshot.window.endAt,

      generatedAt:
        snapshot.generatedAt,

      schemaVersion:
        snapshot.schemaVersion,

      snapshot,

      updatedAt:
        "2026-08-08T00:00:03.000Z",
    });

  assert.equal(
    write.windowStartAt
      .toISOString(),
    snapshot.window.startAt,
  );

  assert.equal(
    write.updatedAt
      .toISOString(),
    "2026-08-08T00:00:03.000Z",
  );

  assert.throws(
    () =>
      eventAnalyticsSnapshotRowFromPostgres({
        ...row,

        userId:
          "other-user",
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "PostgreSQL Event Analytics row user does not match its snapshot.",
  );

  assert.throws(
    () =>
      eventAnalyticsSnapshotRowFromPostgres({
        ...row,

        generatedAt:
          new Date(
            "2026-08-09T00:00:00.000Z",
          ),
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "PostgreSQL Event Analytics row generatedAt does not match its snapshot.",
  );

  console.log(
    "PostgreSQL Event Analytics snapshot row tests passed.",
  );
}

run();
