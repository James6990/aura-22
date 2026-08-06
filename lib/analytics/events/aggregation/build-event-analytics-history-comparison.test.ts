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
  buildEventAnalyticsHistoryComparison,
} from "./build-event-analytics-history-comparison";

function createSnapshot({
  id,
  userId = "user-1",
  startAt,
  endAt,
  generatedAt,
  totalEventCount,
  completedCount,
  confidenceAverage,
  sufficientCount,
}: {
  id: string;
  userId?: string;
  startAt: string;
  endAt: string;
  generatedAt: string;
  totalEventCount: number;
  completedCount: number;
  confidenceAverage: number | null;
  sufficientCount: number;
}): DecisionMemoryEventAnalyticsSnapshot {
  const eventTypeCounts =
    createEmptyDecisionMemoryEventTypeCounts();

  eventTypeCounts[
    "decision-memory.created"
  ] =
    totalEventCount;

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

    totalEventCount,

    uniqueMemoryCount:
      totalEventCount,

    uniqueDecisionCount:
      totalEventCount,

    eventTypeCounts,

    lifecycle: {
      createdCount:
        totalEventCount,

      completedCount,

      incompleteCount:
        totalEventCount -
        completedCount,

      invalidLifecycleCount:
        0,
    },

    confidence: {
      sampleCount:
        confidenceAverage === null
          ? 0
          : totalEventCount,

      minimum:
        confidenceAverage,

      maximum:
        confidenceAverage,

      average:
        confidenceAverage,
    },

    evidence: {
      sufficientCount,

      insufficientCount:
        totalEventCount -
        sufficientCount,

      requiresMoreEvidenceCount:
        totalEventCount -
        sufficientCount,
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
        totalEventCount,

      includedEventCount:
        totalEventCount,

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
      Array.from(
        {
          length:
            totalEventCount,
        },
        (
          _,
          index,
        ) =>
          `${id}-event-${index + 1}`,
      ),

    sourceEventSchemaVersions: [
      1,
    ],

    sourceMemoryIds:
      Array.from(
        {
          length:
            totalEventCount,
        },
        (
          _,
          index,
        ) =>
          `${id}-memory-${index + 1}`,
      ),

    sourceDecisionIds:
      Array.from(
        {
          length:
            totalEventCount,
        },
        (
          _,
          index,
        ) =>
          `${id}-decision-${index + 1}`,
      ),
  };
}

function run() {
  const baseline =
    createSnapshot({
      id:
        "snapshot-baseline",

      startAt:
        "2026-08-01T00:00:00.000Z",

      endAt:
        "2026-08-07T23:59:59.999Z",

      generatedAt:
        "2026-08-08T00:00:00.000Z",

      totalEventCount:
        2,

      completedCount:
        1,

      confidenceAverage:
        0.7,

      sufficientCount:
        1,
    });

  const comparison =
    createSnapshot({
      id:
        "snapshot-comparison",

      startAt:
        "2026-08-08T00:00:00.000Z",

      endAt:
        "2026-08-14T23:59:59.999Z",

      generatedAt:
        "2026-08-15T00:00:00.000Z",

      totalEventCount:
        4,

      completedCount:
        3,

      confidenceAverage:
        0.85,

      sufficientCount:
        3,
    });

  const result =
    buildEventAnalyticsHistoryComparison({
      comparisonId:
        "comparison-1",

      generatedAt:
        "2026-08-16T00:00:00.000Z",

      baseline,

      comparison,
    });

  assert.equal(
    result.totalEventCount.absolute,
    2,
  );

  assert.equal(
    result.totalEventCount.direction,
    "increased",
  );

  assert.equal(
    result.lifecycle.completedCount.absolute,
    2,
  );

  assert.equal(
    result.confidence.average.absolute,
    0.15,
  );

  assert.equal(
    result.evidence.sufficientCount.absolute,
    2,
  );

  assert.equal(
    result.userId,
    "user-1",
  );

  assert.deepEqual(
    result.provenance,
    {
      algorithm:
        "event-analytics-history-comparison",

      algorithmVersion:
        1,

      producedAt:
        "2026-08-16T00:00:00.000Z",

      baselineSnapshotId:
        "snapshot-baseline",

      comparisonSnapshotId:
        "snapshot-comparison",

      baselineSchemaVersion:
        1,

      comparisonSchemaVersion:
        1,
    },
  );

  result.baselineWindow.startAt =
    "mutated";

  assert.equal(
    baseline.window.startAt,
    "2026-08-01T00:00:00.000Z",
  );

  const noConfidence =
    createSnapshot({
      id:
        "snapshot-empty",

      startAt:
        "2026-08-15T00:00:00.000Z",

      endAt:
        "2026-08-21T23:59:59.999Z",

      generatedAt:
        "2026-08-22T00:00:00.000Z",

      totalEventCount:
        0,

      completedCount:
        0,

      confidenceAverage:
        null,

      sufficientCount:
        0,
    });

  const insufficient =
    buildEventAnalyticsHistoryComparison({
      comparisonId:
        "comparison-2",

      generatedAt:
        "2026-08-23T00:00:00.000Z",

      baseline:
        comparison,

      comparison:
        noConfidence,
    });

  assert.equal(
    insufficient.confidence.average.direction,
    "insufficient-evidence",
  );

  assert.equal(
    insufficient.confidence.average.absolute,
    null,
  );

  assert.throws(
    () =>
      buildEventAnalyticsHistoryComparison({
        comparisonId:
          "comparison-cross-user",

        generatedAt:
          "2026-08-16T00:00:00.000Z",

        baseline,

        comparison:
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
              "2026-08-15T00:00:00.000Z",

            totalEventCount:
              1,

            completedCount:
              1,

            confidenceAverage:
              0.8,

            sufficientCount:
              1,
          }),
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics history comparison requires snapshots belonging to the same user.",
  );

  assert.throws(
    () =>
      buildEventAnalyticsHistoryComparison({
        comparisonId:
          "comparison-overlap",

        generatedAt:
          "2026-08-16T00:00:00.000Z",

        baseline,

        comparison:
          createSnapshot({
            id:
              "snapshot-overlap",

            startAt:
              "2026-08-07T00:00:00.000Z",

            endAt:
              "2026-08-14T23:59:59.999Z",

            generatedAt:
              "2026-08-15T00:00:00.000Z",

            totalEventCount:
              1,

            completedCount:
              1,

            confidenceAverage:
              0.8,

            sufficientCount:
              1,
          }),
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics comparison snapshot must begin after the baseline window ends.",
  );

  console.log(
    "Event Analytics history comparison aggregation tests passed.",
  );
}

run();
