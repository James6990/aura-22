import {
  createEventAnalyticsTrendInterpretation,
  eventAnalyticsTrendInterpretationAlgorithm,
  eventAnalyticsTrendInterpretationAlgorithmVersion,
  eventAnalyticsTrendInterpretationSchemaVersion,
  validateEventAnalyticsHistoryComparison,
  type EventAnalyticsHistoryComparison,
  type EventAnalyticsMetricTrend,
  type EventAnalyticsNumericDelta,
  type EventAnalyticsTrendDirection,
  type EventAnalyticsTrendInterpretation,
  type EventAnalyticsTrendStrength,
} from "@/lib/analytics/events/contracts";

export type BuildEventAnalyticsTrendInterpretationInput = {
  interpretationId:
    string;

  generatedAt:
    string;

  comparisons:
    readonly EventAnalyticsHistoryComparison[];
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

function classifyStrength({
  dominantCount,
  supportedCount,
}: {
  dominantCount: number;
  supportedCount: number;
}): EventAnalyticsTrendStrength {
  if (supportedCount === 0) {
    return "none";
  }

  const ratio =
    dominantCount /
    supportedCount;

  if (ratio === 1) {
    return "strong";
  }

  if (ratio >= 0.67) {
    return "moderate";
  }

  return "weak";
}

function classifyDirection({
  increasedCount,
  decreasedCount,
  stableCount,
  supportedCount,
}: {
  increasedCount: number;
  decreasedCount: number;
  stableCount: number;
  supportedCount: number;
}): EventAnalyticsTrendDirection {
  if (supportedCount === 0) {
    return "insufficient-evidence";
  }

  if (
    increasedCount > 0 &&
    decreasedCount > 0
  ) {
    return "mixed";
  }

  if (
    increasedCount >
      decreasedCount &&
    increasedCount >
      stableCount
  ) {
    return "improving";
  }

  if (
    decreasedCount >
      increasedCount &&
    decreasedCount >
      stableCount
  ) {
    return "declining";
  }

  return "stable";
}

function buildMetricTrend(
  deltas:
    readonly EventAnalyticsNumericDelta[],
): EventAnalyticsMetricTrend {
  let increasedCount =
    0;

  let decreasedCount =
    0;

  let stableCount =
    0;

  let insufficientEvidenceCount =
    0;

  let netChange =
    0;

  for (
    const delta of
    deltas
  ) {
    switch (
      delta.direction
    ) {
      case "increased":
        increasedCount +=
          1;

        netChange +=
          delta.absolute ?? 0;

        break;

      case "decreased":
        decreasedCount +=
          1;

        netChange +=
          delta.absolute ?? 0;

        break;

      case "stable":
        stableCount +=
          1;

        break;

      case "insufficient-evidence":
        insufficientEvidenceCount +=
          1;

        break;
    }
  }

  const comparisonCount =
    deltas.length;

  const supportedComparisonCount =
    comparisonCount -
    insufficientEvidenceCount;

  const direction =
    classifyDirection({
      increasedCount,
      decreasedCount,
      stableCount,
      supportedCount:
        supportedComparisonCount,
    });

  const dominantCount =
    Math.max(
      increasedCount,
      decreasedCount,
      stableCount,
    );

  return {
    direction,

    strength:
      classifyStrength({
        dominantCount,
        supportedCount:
          supportedComparisonCount,
      }),

    comparisonCount,

    supportedComparisonCount,

    increasedCount,

    decreasedCount,

    stableCount,

    insufficientEvidenceCount,

    evidenceCoverage:
      comparisonCount === 0
        ? 0
        : roundMetric(
            supportedComparisonCount /
              comparisonCount,
          ),

    netChange:
      supportedComparisonCount === 0
        ? null
        : roundMetric(
            netChange,
          ),
  };
}

function orderComparisons(
  comparisons:
    readonly EventAnalyticsHistoryComparison[],
) {
  return [
    ...comparisons,
  ].sort(
    (
      first,
      second,
    ) =>
      new Date(
        first.baselineWindow.startAt,
      ).getTime() -
        new Date(
          second.baselineWindow.startAt,
        ).getTime() ||
      first.id.localeCompare(
        second.id,
      ),
  );
}

function validateComparisonSequence(
  comparisons:
    readonly EventAnalyticsHistoryComparison[],
) {
  if (comparisons.length === 0) {
    throw new Error(
      "Event Analytics trend interpretation requires at least one comparison.",
    );
  }

  const ordered =
    orderComparisons(
      comparisons,
    );

  const userId =
    ordered[0]!.userId;

  const schemaVersion =
    ordered[0]!.schemaVersion;

  const comparisonIds =
    new Set<string>();

  for (
    let index = 0;
    index < ordered.length;
    index += 1
  ) {
    const comparison =
      ordered[index]!;

    validateEventAnalyticsHistoryComparison(
      comparison,
    );

    if (
      comparison.userId !==
      userId
    ) {
      throw new Error(
        "Event Analytics trend interpretation requires comparisons belonging to the same user.",
      );
    }

    if (
      comparison.schemaVersion !==
      schemaVersion
    ) {
      throw new Error(
        "Event Analytics trend interpretation requires compatible comparison schema versions.",
      );
    }

    if (
      comparisonIds.has(
        comparison.id,
      )
    ) {
      throw new Error(
        `Event Analytics trend comparison id "${comparison.id}" is duplicated.`,
      );
    }

    comparisonIds.add(
      comparison.id,
    );

    if (index === 0) {
      continue;
    }

    const previous =
      ordered[
        index - 1
      ]!;

    if (
      previous.comparisonSnapshotId !==
      comparison.baselineSnapshotId
    ) {
      throw new Error(
        "Event Analytics trend comparisons must form a continuous snapshot chain.",
      );
    }

    if (
      previous.comparisonWindow.startAt !==
        comparison.baselineWindow.startAt ||
      previous.comparisonWindow.endAt !==
        comparison.baselineWindow.endAt
    ) {
      throw new Error(
        "Event Analytics trend comparisons must preserve continuous snapshot windows.",
      );
    }
  }

  return ordered;
}

export function buildEventAnalyticsTrendInterpretation({
  interpretationId,
  generatedAt,
  comparisons,
}: BuildEventAnalyticsTrendInterpretationInput):
  EventAnalyticsTrendInterpretation {
  const resolvedInterpretationId =
    requireIdentifier(
      interpretationId,
      "Event Analytics trend interpretation id",
    );

  const resolvedGeneratedAt =
    requireIsoDate(
      generatedAt,
      "Event Analytics trend interpretation generatedAt",
    );

  const orderedComparisons =
    validateComparisonSequence(
      comparisons,
    );

  const sourceComparisonIds =
    orderedComparisons.map(
      (comparison) =>
        comparison.id,
    );

  const sourceSnapshotIds = [
    orderedComparisons[0]!
      .baselineSnapshotId,
    ...orderedComparisons.map(
      (comparison) =>
        comparison.comparisonSnapshotId,
    ),
  ];

  const sourceComparisonSchemaVersions = [
    ...new Set(
      orderedComparisons.map(
        (comparison) =>
          comparison.schemaVersion,
      ),
    ),
  ].sort(
    (
      first,
      second,
    ) =>
      first - second,
  );

  const metric = (
    select:
      (
        comparison:
          EventAnalyticsHistoryComparison,
      ) =>
        EventAnalyticsNumericDelta,
  ) =>
    buildMetricTrend(
      orderedComparisons.map(
        select,
      ),
    );

  return createEventAnalyticsTrendInterpretation({
    id:
      resolvedInterpretationId,

    userId:
      orderedComparisons[0]!
        .userId,

    generatedAt:
      resolvedGeneratedAt,

    schemaVersion:
      eventAnalyticsTrendInterpretationSchemaVersion,

    comparisonWindowCount:
      orderedComparisons.length,

    sourceComparisonCount:
      orderedComparisons.length,

    totalEventCount:
      metric(
        (comparison) =>
          comparison.totalEventCount,
      ),

    uniqueMemoryCount:
      metric(
        (comparison) =>
          comparison.uniqueMemoryCount,
      ),

    uniqueDecisionCount:
      metric(
        (comparison) =>
          comparison.uniqueDecisionCount,
      ),

    lifecycle: {
      createdCount:
        metric(
          (comparison) =>
            comparison.lifecycle
              .createdCount,
        ),

      completedCount:
        metric(
          (comparison) =>
            comparison.lifecycle
              .completedCount,
        ),

      incompleteCount:
        metric(
          (comparison) =>
            comparison.lifecycle
              .incompleteCount,
        ),

      invalidLifecycleCount:
        metric(
          (comparison) =>
            comparison.lifecycle
              .invalidLifecycleCount,
        ),
    },

    confidence: {
      sampleCount:
        metric(
          (comparison) =>
            comparison.confidence
              .sampleCount,
        ),

      minimum:
        metric(
          (comparison) =>
            comparison.confidence
              .minimum,
        ),

      maximum:
        metric(
          (comparison) =>
            comparison.confidence
              .maximum,
        ),

      average:
        metric(
          (comparison) =>
            comparison.confidence
              .average,
        ),
    },

    evidence: {
      sufficientCount:
        metric(
          (comparison) =>
            comparison.evidence
              .sufficientCount,
        ),

      insufficientCount:
        metric(
          (comparison) =>
            comparison.evidence
              .insufficientCount,
        ),

      requiresMoreEvidenceCount:
        metric(
          (comparison) =>
            comparison.evidence
              .requiresMoreEvidenceCount,
        ),
    },

    provenance: {
      algorithm:
        eventAnalyticsTrendInterpretationAlgorithm,

      algorithmVersion:
        eventAnalyticsTrendInterpretationAlgorithmVersion,

      producedAt:
        resolvedGeneratedAt,

      sourceComparisonIds,

      sourceSnapshotIds,

      sourceComparisonSchemaVersions,
    },
  });
}
