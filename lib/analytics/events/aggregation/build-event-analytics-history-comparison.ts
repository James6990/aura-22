import {
  createEventAnalyticsHistoryComparison,
  eventAnalyticsHistoryComparisonAlgorithm,
  eventAnalyticsHistoryComparisonAlgorithmVersion,
  eventAnalyticsHistoryComparisonSchemaVersion,
  validateDecisionMemoryEventAnalyticsSnapshot,
  type DecisionMemoryEventAnalyticsSnapshot,
  type EventAnalyticsHistoryComparison,
  type EventAnalyticsNumericDelta,
} from "@/lib/analytics/events/contracts";

import {
  decisionMemoryEventTypes,
} from "@/lib/events/contracts";

export type BuildEventAnalyticsHistoryComparisonInput = {
  comparisonId:
    string;

  generatedAt:
    string;

  baseline:
    DecisionMemoryEventAnalyticsSnapshot;

  comparison:
    DecisionMemoryEventAnalyticsSnapshot;
};

function requireIdentifier(
  value: string,
  label: string,
) {
  const resolved =
    value.trim();

  if (!resolved) {
    throw new Error(
      `${label} is required.`,
    );
  }

  return resolved;
}

function requireIsoDate(
  value: string,
  label: string,
) {
  const resolved =
    value.trim();

  const parsed =
    new Date(
      resolved,
    );

  if (
    !resolved ||
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    throw new Error(
      `${label} must be a valid ISO date.`,
    );
  }

  return parsed.toISOString();
}

function roundMetric(
  value: number,
) {
  return Number(
    value.toFixed(
      6,
    ),
  );
}

function createNumericDelta(
  baseline:
    number | null,
  comparison:
    number | null,
): EventAnalyticsNumericDelta {
  if (
    baseline === null ||
    comparison === null
  ) {
    return {
      baseline,

      comparison,

      absolute:
        null,

      direction:
        "insufficient-evidence",
    };
  }

  const absolute =
    roundMetric(
      comparison -
      baseline,
    );

  return {
    baseline,

    comparison,

    absolute,

    direction:
      absolute > 0
        ? "increased"
        : absolute < 0
          ? "decreased"
          : "stable",
  };
}

function validateSnapshotCompatibility({
  baseline,
  comparison,
}: {
  baseline:
    DecisionMemoryEventAnalyticsSnapshot;

  comparison:
    DecisionMemoryEventAnalyticsSnapshot;
}) {
  validateDecisionMemoryEventAnalyticsSnapshot(
    baseline,
  );

  validateDecisionMemoryEventAnalyticsSnapshot(
    comparison,
  );

  if (
    baseline.userId !==
    comparison.userId
  ) {
    throw new Error(
      "Event Analytics history comparison requires snapshots belonging to the same user.",
    );
  }

  if (
    baseline.schemaVersion !==
    comparison.schemaVersion
  ) {
    throw new Error(
      "Event Analytics history comparison requires compatible snapshot schema versions.",
    );
  }

  if (
    baseline.id ===
    comparison.id
  ) {
    throw new Error(
      "Event Analytics history comparison requires two different snapshot ids.",
    );
  }

  if (
    new Date(
      baseline.window.endAt,
    ).getTime() >
    new Date(
      comparison.window.startAt,
    ).getTime()
  ) {
    throw new Error(
      "Event Analytics comparison snapshot must begin after the baseline window ends.",
    );
  }
}

export function buildEventAnalyticsHistoryComparison({
  comparisonId,
  generatedAt,
  baseline,
  comparison,
}: BuildEventAnalyticsHistoryComparisonInput):
  EventAnalyticsHistoryComparison {
  const resolvedComparisonId =
    requireIdentifier(
      comparisonId,
      "Event Analytics comparison id",
    );

  const resolvedGeneratedAt =
    requireIsoDate(
      generatedAt,
      "Event Analytics comparison generatedAt",
    );

  validateSnapshotCompatibility({
    baseline,
    comparison,
  });

  const eventTypeCounts =
    Object.fromEntries(
      decisionMemoryEventTypes.map(
        (type) => [
          type,
          createNumericDelta(
            baseline.eventTypeCounts[
              type
            ],
            comparison.eventTypeCounts[
              type
            ],
          ),
        ],
      ),
    ) as
      EventAnalyticsHistoryComparison[
        "eventTypeCounts"
      ];

  return createEventAnalyticsHistoryComparison({
    id:
      resolvedComparisonId,

    userId:
      baseline.userId,

    generatedAt:
      resolvedGeneratedAt,

    schemaVersion:
      eventAnalyticsHistoryComparisonSchemaVersion,

    baselineSnapshotId:
      baseline.id,

    comparisonSnapshotId:
      comparison.id,

    baselineWindow:
      structuredClone(
        baseline.window,
      ),

    comparisonWindow:
      structuredClone(
        comparison.window,
      ),

    totalEventCount:
      createNumericDelta(
        baseline.totalEventCount,
        comparison.totalEventCount,
      ),

    uniqueMemoryCount:
      createNumericDelta(
        baseline.uniqueMemoryCount,
        comparison.uniqueMemoryCount,
      ),

    uniqueDecisionCount:
      createNumericDelta(
        baseline.uniqueDecisionCount,
        comparison.uniqueDecisionCount,
      ),

    eventTypeCounts,

    lifecycle: {
      createdCount:
        createNumericDelta(
          baseline.lifecycle
            .createdCount,
          comparison.lifecycle
            .createdCount,
        ),

      completedCount:
        createNumericDelta(
          baseline.lifecycle
            .completedCount,
          comparison.lifecycle
            .completedCount,
        ),

      incompleteCount:
        createNumericDelta(
          baseline.lifecycle
            .incompleteCount,
          comparison.lifecycle
            .incompleteCount,
        ),

      invalidLifecycleCount:
        createNumericDelta(
          baseline.lifecycle
            .invalidLifecycleCount,
          comparison.lifecycle
            .invalidLifecycleCount,
        ),
    },

    confidence: {
      sampleCount:
        createNumericDelta(
          baseline.confidence
            .sampleCount,
          comparison.confidence
            .sampleCount,
        ),

      minimum:
        createNumericDelta(
          baseline.confidence.minimum,
          comparison.confidence.minimum,
        ),

      maximum:
        createNumericDelta(
          baseline.confidence.maximum,
          comparison.confidence.maximum,
        ),

      average:
        createNumericDelta(
          baseline.confidence.average,
          comparison.confidence.average,
        ),
    },

    evidence: {
      sufficientCount:
        createNumericDelta(
          baseline.evidence
            .sufficientCount,
          comparison.evidence
            .sufficientCount,
        ),

      insufficientCount:
        createNumericDelta(
          baseline.evidence
            .insufficientCount,
          comparison.evidence
            .insufficientCount,
        ),

      requiresMoreEvidenceCount:
        createNumericDelta(
          baseline.evidence
            .requiresMoreEvidenceCount,
          comparison.evidence
            .requiresMoreEvidenceCount,
        ),
    },

    provenance: {
      algorithm:
        eventAnalyticsHistoryComparisonAlgorithm,

      algorithmVersion:
        eventAnalyticsHistoryComparisonAlgorithmVersion,

      producedAt:
        resolvedGeneratedAt,

      baselineSnapshotId:
        baseline.id,

      comparisonSnapshotId:
        comparison.id,

      baselineSchemaVersion:
        baseline.schemaVersion,

      comparisonSchemaVersion:
        comparison.schemaVersion,
    },
  });
}
