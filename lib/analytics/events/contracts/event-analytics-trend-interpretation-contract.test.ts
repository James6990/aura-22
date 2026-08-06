import assert from "node:assert/strict";

import {
  createEventAnalyticsTrendInterpretation,
  eventAnalyticsTrendInterpretationAlgorithm,
  eventAnalyticsTrendInterpretationAlgorithmVersion,
  eventAnalyticsTrendInterpretationSchemaVersion,
  validateEventAnalyticsTrendInterpretation,
  type EventAnalyticsMetricTrend,
  type EventAnalyticsTrendInterpretation,
} from "./event-analytics-trend-interpretation-contract";

function stableTrend(
  comparisonCount:
    number,
): EventAnalyticsMetricTrend {
  return {
    direction:
      comparisonCount === 0
        ? "insufficient-evidence"
        : "stable",

    strength:
      comparisonCount === 0
        ? "none"
        : "strong",

    comparisonCount,

    supportedComparisonCount:
      comparisonCount,

    increasedCount:
      0,

    decreasedCount:
      0,

    stableCount:
      comparisonCount,

    insufficientEvidenceCount:
      0,

    evidenceCoverage:
      comparisonCount === 0
        ? 0
        : 1,

    netChange:
      comparisonCount === 0
        ? null
        : 0,
  };
}

function createInterpretation():
  EventAnalyticsTrendInterpretation {
  const trend =
    stableTrend(
      2,
    );

  return {
    id:
      "trend-1",

    userId:
      "user-1",

    generatedAt:
      "2026-08-22T00:00:00.000Z",

    schemaVersion:
      eventAnalyticsTrendInterpretationSchemaVersion,

    comparisonWindowCount:
      2,

    sourceComparisonCount:
      2,

    totalEventCount:
      structuredClone(
        trend,
      ),

    uniqueMemoryCount:
      structuredClone(
        trend,
      ),

    uniqueDecisionCount:
      structuredClone(
        trend,
      ),

    lifecycle: {
      createdCount:
        structuredClone(
          trend,
        ),

      completedCount:
        structuredClone(
          trend,
        ),

      incompleteCount:
        structuredClone(
          trend,
        ),

      invalidLifecycleCount:
        structuredClone(
          trend,
        ),
    },

    confidence: {
      sampleCount:
        structuredClone(
          trend,
        ),

      minimum:
        structuredClone(
          trend,
        ),

      maximum:
        structuredClone(
          trend,
        ),

      average:
        structuredClone(
          trend,
        ),
    },

    evidence: {
      sufficientCount:
        structuredClone(
          trend,
        ),

      insufficientCount:
        structuredClone(
          trend,
        ),

      requiresMoreEvidenceCount:
        structuredClone(
          trend,
        ),
    },

    provenance: {
      algorithm:
        eventAnalyticsTrendInterpretationAlgorithm,

      algorithmVersion:
        eventAnalyticsTrendInterpretationAlgorithmVersion,

      producedAt:
        "2026-08-22T00:00:00.000Z",

      sourceComparisonIds: [
        "comparison-1",
        "comparison-2",
      ],

      sourceSnapshotIds: [
        "snapshot-1",
        "snapshot-2",
        "snapshot-3",
      ],

      sourceComparisonSchemaVersions: [
        1,
      ],
    },
  };
}

function run() {
  const interpretation =
    createInterpretation();

  validateEventAnalyticsTrendInterpretation(
    interpretation,
  );

  const created =
    createEventAnalyticsTrendInterpretation(
      interpretation,
    );

  assert.deepEqual(
    created,
    interpretation,
  );

  created.provenance.sourceComparisonIds.push(
    "mutated",
  );

  assert.deepEqual(
    interpretation.provenance.sourceComparisonIds,
    [
      "comparison-1",
      "comparison-2",
    ],
  );

  assert.throws(
    () =>
      validateEventAnalyticsTrendInterpretation({
        ...interpretation,

        sourceComparisonCount:
          3,
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics trend comparison counts are inconsistent.",
  );

  assert.throws(
    () =>
      validateEventAnalyticsTrendInterpretation({
        ...interpretation,

        totalEventCount: {
          ...interpretation.totalEventCount,

          supportedComparisonCount:
            1,

          stableCount:
            2,
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics total event trend supported direction counts are inconsistent.",
  );

  assert.throws(
    () =>
      validateEventAnalyticsTrendInterpretation({
        ...interpretation,

        confidence: {
          ...interpretation.confidence,

          average: {
            direction:
              "stable",

            strength:
              "none",

            comparisonCount:
              2,

            supportedComparisonCount:
              2,

            increasedCount:
              0,

            decreasedCount:
              0,

            stableCount:
              2,

            insufficientEvidenceCount:
              0,

            evidenceCoverage:
              1,

            netChange:
              0,
          },
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics average confidence trend strength cannot be none when supported comparisons exist.",
  );

  assert.throws(
    () =>
      validateEventAnalyticsTrendInterpretation({
        ...interpretation,

        provenance: {
          ...interpretation.provenance,

          sourceComparisonIds: [
            "comparison-1",
            "comparison-1",
          ],
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics source comparison id values must be unique.",
  );

  console.log(
    "Event Analytics trend interpretation contract tests passed.",
  );
}

run();
