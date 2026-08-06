import assert from "node:assert/strict";

import {
  createEmptyEventAnalyticsEventTypeDeltas,
  createEventAnalyticsHistoryComparison,
  eventAnalyticsHistoryComparisonAlgorithm,
  eventAnalyticsHistoryComparisonAlgorithmVersion,
  eventAnalyticsHistoryComparisonSchemaVersion,
  validateEventAnalyticsHistoryComparison,
  type EventAnalyticsHistoryComparison,
} from "./event-analytics-history-comparison-contract";

function stable(
  value:
    number,
) {
  return {
    baseline:
      value,

    comparison:
      value,

    absolute:
      0,

    direction:
      "stable" as const,
  };
}

function createComparison():
  EventAnalyticsHistoryComparison {
  return {
    id:
      "comparison-1",

    userId:
      "user-1",

    generatedAt:
      "2026-08-15T00:00:00.000Z",

    schemaVersion:
      eventAnalyticsHistoryComparisonSchemaVersion,

    baselineSnapshotId:
      "snapshot-1",

    comparisonSnapshotId:
      "snapshot-2",

    baselineWindow: {
      startAt:
        "2026-08-01T00:00:00.000Z",

      endAt:
        "2026-08-07T23:59:59.999Z",
    },

    comparisonWindow: {
      startAt:
        "2026-08-08T00:00:00.000Z",

      endAt:
        "2026-08-14T23:59:59.999Z",
    },

    totalEventCount:
      stable(3),

    uniqueMemoryCount:
      stable(2),

    uniqueDecisionCount:
      stable(2),

    eventTypeCounts:
      createEmptyEventAnalyticsEventTypeDeltas(),

    lifecycle: {
      createdCount:
        stable(2),

      completedCount:
        stable(1),

      incompleteCount:
        stable(1),

      invalidLifecycleCount:
        stable(0),
    },

    confidence: {
      sampleCount:
        stable(3),

      minimum:
        stable(0.7),

      maximum:
        stable(0.9),

      average:
        stable(0.8),
    },

    evidence: {
      sufficientCount:
        stable(2),

      insufficientCount:
        stable(1),

      requiresMoreEvidenceCount:
        stable(1),
    },

    provenance: {
      algorithm:
        eventAnalyticsHistoryComparisonAlgorithm,

      algorithmVersion:
        eventAnalyticsHistoryComparisonAlgorithmVersion,

      producedAt:
        "2026-08-15T00:00:00.000Z",

      baselineSnapshotId:
        "snapshot-1",

      comparisonSnapshotId:
        "snapshot-2",

      baselineSchemaVersion:
        1,

      comparisonSchemaVersion:
        1,
    },
  };
}

function run() {
  const comparison =
    createComparison();

  validateEventAnalyticsHistoryComparison(
    comparison,
  );

  const created =
    createEventAnalyticsHistoryComparison(
      comparison,
    );

  assert.deepEqual(
    created,
    comparison,
  );

  created.baselineWindow.startAt =
    "mutated";

  assert.equal(
    comparison.baselineWindow.startAt,
    "2026-08-01T00:00:00.000Z",
  );

  assert.throws(
    () =>
      validateEventAnalyticsHistoryComparison({
        ...comparison,

        comparisonWindow: {
          startAt:
            "2026-08-07T00:00:00.000Z",

          endAt:
            "2026-08-14T23:59:59.999Z",
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics comparison window must not begin before the baseline window ends.",
  );

  assert.throws(
    () =>
      validateEventAnalyticsHistoryComparison({
        ...comparison,

        totalEventCount: {
          baseline:
            3,

          comparison:
            5,

          absolute:
            1,

          direction:
            "increased",
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics total event count absolute delta is inconsistent.",
  );

  assert.throws(
    () =>
      validateEventAnalyticsHistoryComparison({
        ...comparison,

        confidence: {
          ...comparison.confidence,

          average: {
            baseline:
              null,

            comparison:
              0.8,

            absolute:
              null,

            direction:
              "stable",
          },
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics average confidence must use insufficient-evidence when either value is null.",
  );

  assert.throws(
    () =>
      validateEventAnalyticsHistoryComparison({
        ...comparison,

        provenance: {
          ...comparison.provenance,

          baselineSnapshotId:
            "wrong-snapshot",
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics comparison provenance snapshot ids are inconsistent.",
  );

  console.log(
    "Event Analytics history comparison contract tests passed.",
  );
}

run();
