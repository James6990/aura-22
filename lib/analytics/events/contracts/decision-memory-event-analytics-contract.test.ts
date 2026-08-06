import assert from "node:assert/strict";

import {
  createDecisionMemoryEventAnalyticsSnapshot,
  createEmptyDecisionMemoryEventTypeCounts,
  eventAnalyticsSchemaVersion,
  validateDecisionMemoryEventAnalyticsSnapshot,
  type DecisionMemoryEventAnalyticsSnapshot,
} from "./decision-memory-event-analytics-contract";

function createSnapshot():
  DecisionMemoryEventAnalyticsSnapshot {
  return {
    id:
      "analytics-snapshot-1",

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
      2,

    uniqueMemoryCount:
      1,

    uniqueDecisionCount:
      1,

    eventTypeCounts: {
      ...createEmptyDecisionMemoryEventTypeCounts(),

      "decision-memory.created":
        1,

      "decision-memory.closed":
        1,
    },

    lifecycle: {
      createdCount:
        1,

      completedCount:
        1,

      incompleteCount:
        0,

      invalidLifecycleCount:
        0,
    },

    confidence: {
      sampleCount:
        2,

      minimum:
        0.7,

      maximum:
        0.9,

      average:
        0.8,
    },

    evidence: {
      sufficientCount:
        1,

      insufficientCount:
        1,

      requiresMoreEvidenceCount:
        1,
    },

    sourceEventIds: [
      "event-1",
      "event-2",
    ],

    sourceEventSchemaVersions: [
      1,
    ],

    sourceMemoryIds: [
      "memory-1",
    ],

    sourceDecisionIds: [
      "decision-1",
    ],
  };
}

function run() {
  const snapshot =
    createSnapshot();

  const created =
    createDecisionMemoryEventAnalyticsSnapshot(
      snapshot,
    );

  assert.deepEqual(
    created,
    snapshot,
  );

  created.sourceEventIds.push(
    "mutated",
  );

  assert.deepEqual(
    snapshot.sourceEventIds,
    [
      "event-1",
      "event-2",
    ],
  );

  const emptyCounts =
    createEmptyDecisionMemoryEventTypeCounts();

  assert.deepEqual(
    emptyCounts,
    {
      "decision-memory.created":
        0,

      "decision-memory.outcome-recorded":
        0,

      "decision-memory.reflection-recorded":
        0,

      "decision-memory.learning-created":
        0,

      "decision-memory.closed":
        0,
    },
  );

  assert.throws(
    () =>
      validateDecisionMemoryEventAnalyticsSnapshot({
        ...snapshot,

        totalEventCount:
          3,
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics event-type counts must equal the total event count.",
  );

  assert.throws(
    () =>
      validateDecisionMemoryEventAnalyticsSnapshot({
        ...snapshot,

        window: {
          startAt:
            "2026-08-09T00:00:00.000Z",

          endAt:
            "2026-08-08T00:00:00.000Z",
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics window startAt cannot be after endAt.",
  );

  assert.throws(
    () =>
      validateDecisionMemoryEventAnalyticsSnapshot({
        ...snapshot,

        confidence: {
          sampleCount:
            0,

          minimum:
            0.7,

          maximum:
            null,

          average:
            null,
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics confidence values must be null when no samples exist.",
  );

  assert.throws(
    () =>
      validateDecisionMemoryEventAnalyticsSnapshot({
        ...snapshot,

        sourceEventIds: [
          "event-1",
          "event-1",
        ],
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics source event id values must be unique.",
  );

  console.log(
    "Decision Memory Event Analytics contract tests passed.",
  );
}

run();
