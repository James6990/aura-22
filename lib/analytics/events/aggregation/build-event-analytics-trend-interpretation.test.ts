import assert from "node:assert/strict";

import {
  createEmptyEventAnalyticsEventTypeDeltas,
  eventAnalyticsHistoryComparisonAlgorithm,
  eventAnalyticsHistoryComparisonAlgorithmVersion,
  eventAnalyticsHistoryComparisonSchemaVersion,
  type EventAnalyticsHistoryComparison,
  type EventAnalyticsNumericDelta,
} from "@/lib/analytics/events/contracts";

import {
  buildEventAnalyticsTrendInterpretation,
} from "./build-event-analytics-trend-interpretation";

function delta(
  absolute:
    number | null,
): EventAnalyticsNumericDelta {
  if (absolute === null) {
    return {
      baseline:
        null,

      comparison:
        null,

      absolute:
        null,

      direction:
        "insufficient-evidence",
    };
  }

  return {
    baseline:
      0,

    comparison:
      absolute,

    absolute,

    direction:
      absolute > 0
        ? "increased"
        : absolute < 0
          ? "decreased"
          : "stable",
  };
}

function createComparison({
  id,
  baselineSnapshotId,
  comparisonSnapshotId,
  baselineStartAt,
  baselineEndAt,
  comparisonStartAt,
  comparisonEndAt,
  totalEventDelta,
}: {
  id: string;
  baselineSnapshotId: string;
  comparisonSnapshotId: string;
  baselineStartAt: string;
  baselineEndAt: string;
  comparisonStartAt: string;
  comparisonEndAt: string;
  totalEventDelta: number | null;
}): EventAnalyticsHistoryComparison {
  const stable =
    delta(
      0,
    );

  const eventTypeCounts =
    createEmptyEventAnalyticsEventTypeDeltas();

  return {
    id,

    userId:
      "user-1",

    generatedAt:
      comparisonEndAt,

    schemaVersion:
      eventAnalyticsHistoryComparisonSchemaVersion,

    baselineSnapshotId,

    comparisonSnapshotId,

    baselineWindow: {
      startAt:
        baselineStartAt,

      endAt:
        baselineEndAt,
    },

    comparisonWindow: {
      startAt:
        comparisonStartAt,

      endAt:
        comparisonEndAt,
    },

    totalEventCount:
      delta(
        totalEventDelta,
      ),

    uniqueMemoryCount:
      structuredClone(
        stable,
      ),

    uniqueDecisionCount:
      structuredClone(
        stable,
      ),

    eventTypeCounts,

    lifecycle: {
      createdCount:
        structuredClone(
          stable,
        ),

      completedCount:
        structuredClone(
          stable,
        ),

      incompleteCount:
        structuredClone(
          stable,
        ),

      invalidLifecycleCount:
        structuredClone(
          stable,
        ),
    },

    confidence: {
      sampleCount:
        structuredClone(
          stable,
        ),

      minimum:
        structuredClone(
          stable,
        ),

      maximum:
        structuredClone(
          stable,
        ),

      average:
        structuredClone(
          stable,
        ),
    },

    evidence: {
      sufficientCount:
        structuredClone(
          stable,
        ),

      insufficientCount:
        structuredClone(
          stable,
        ),

      requiresMoreEvidenceCount:
        structuredClone(
          stable,
        ),
    },

    provenance: {
      algorithm:
        eventAnalyticsHistoryComparisonAlgorithm,

      algorithmVersion:
        eventAnalyticsHistoryComparisonAlgorithmVersion,

      producedAt:
        comparisonEndAt,

      baselineSnapshotId,

      comparisonSnapshotId,

      baselineSchemaVersion:
        1,

      comparisonSchemaVersion:
        1,
    },
  };
}

function run() {
  const first =
    createComparison({
      id:
        "comparison-1",

      baselineSnapshotId:
        "snapshot-1",

      comparisonSnapshotId:
        "snapshot-2",

      baselineStartAt:
        "2026-08-01T00:00:00.000Z",

      baselineEndAt:
        "2026-08-07T23:59:59.999Z",

      comparisonStartAt:
        "2026-08-08T00:00:00.000Z",

      comparisonEndAt:
        "2026-08-14T23:59:59.999Z",

      totalEventDelta:
        2,
    });

  const second =
    createComparison({
      id:
        "comparison-2",

      baselineSnapshotId:
        "snapshot-2",

      comparisonSnapshotId:
        "snapshot-3",

      baselineStartAt:
        "2026-08-08T00:00:00.000Z",

      baselineEndAt:
        "2026-08-14T23:59:59.999Z",

      comparisonStartAt:
        "2026-08-15T00:00:00.000Z",

      comparisonEndAt:
        "2026-08-21T23:59:59.999Z",

      totalEventDelta:
        3,
    });

  const improving =
    buildEventAnalyticsTrendInterpretation({
      interpretationId:
        "trend-1",

      generatedAt:
        "2026-08-22T00:00:00.000Z",

      comparisons: [
        second,
        first,
      ],
    });

  assert.equal(
    improving.totalEventCount.direction,
    "improving",
  );

  assert.equal(
    improving.totalEventCount.strength,
    "strong",
  );

  assert.equal(
    improving.totalEventCount.netChange,
    5,
  );

  assert.deepEqual(
    improving.provenance.sourceComparisonIds,
    [
      "comparison-1",
      "comparison-2",
    ],
  );

  assert.deepEqual(
    improving.provenance.sourceSnapshotIds,
    [
      "snapshot-1",
      "snapshot-2",
      "snapshot-3",
    ],
  );

  improving.provenance.sourceSnapshotIds.push(
    "mutated",
  );

  assert.deepEqual(
    first.provenance.baselineSnapshotId,
    "snapshot-1",
  );

  const mixed =
    buildEventAnalyticsTrendInterpretation({
      interpretationId:
        "trend-mixed",

      generatedAt:
        "2026-08-22T00:00:00.000Z",

      comparisons: [
        first,
        {
          ...second,

          totalEventCount:
            delta(
              -1,
            ),
        },
      ],
    });

  assert.equal(
    mixed.totalEventCount.direction,
    "mixed",
  );

  assert.equal(
    mixed.totalEventCount.strength,
    "weak",
  );

  const insufficient =
    buildEventAnalyticsTrendInterpretation({
      interpretationId:
        "trend-insufficient",

      generatedAt:
        "2026-08-22T00:00:00.000Z",

      comparisons: [
        {
          ...first,

          totalEventCount:
            delta(
              null,
            ),
        },
      ],
    });

  assert.equal(
    insufficient.totalEventCount.direction,
    "insufficient-evidence",
  );

  assert.equal(
    insufficient.totalEventCount.strength,
    "none",
  );

  assert.equal(
    insufficient.totalEventCount.netChange,
    null,
  );

  assert.throws(
    () =>
      buildEventAnalyticsTrendInterpretation({
        interpretationId:
          "trend-gap",

        generatedAt:
          "2026-08-22T00:00:00.000Z",

        comparisons: [
          first,
          {
            ...second,

            baselineSnapshotId:
              "different-snapshot",

            provenance: {
              ...second.provenance,

              baselineSnapshotId:
                "different-snapshot",
            },
          },
        ],
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics trend comparisons must form a continuous snapshot chain.",
  );

  console.log(
    "Event Analytics trend interpretation aggregation tests passed.",
  );
}

run();
