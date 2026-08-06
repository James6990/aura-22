import type {
  EventAnalyticsHistoryComparison,
} from "./event-analytics-history-comparison-contract";

export const eventAnalyticsTrendInterpretationSchemaVersion =
  1 as const;

export const eventAnalyticsTrendInterpretationAlgorithm =
  "event-analytics-trend-interpretation" as const;

export const eventAnalyticsTrendInterpretationAlgorithmVersion =
  1 as const;

export type EventAnalyticsTrendDirection =
  | "improving"
  | "declining"
  | "stable"
  | "mixed"
  | "insufficient-evidence";

export type EventAnalyticsTrendStrength =
  | "none"
  | "weak"
  | "moderate"
  | "strong";

export type EventAnalyticsMetricTrend = {
  direction:
    EventAnalyticsTrendDirection;

  strength:
    EventAnalyticsTrendStrength;

  comparisonCount:
    number;

  supportedComparisonCount:
    number;

  increasedCount:
    number;

  decreasedCount:
    number;

  stableCount:
    number;

  insufficientEvidenceCount:
    number;

  evidenceCoverage:
    number;

  netChange:
    number | null;
};

export type EventAnalyticsTrendInterpretationProvenance = {
  algorithm:
    typeof eventAnalyticsTrendInterpretationAlgorithm;

  algorithmVersion:
    typeof eventAnalyticsTrendInterpretationAlgorithmVersion;

  producedAt:
    string;

  sourceComparisonIds:
    string[];

  sourceSnapshotIds:
    string[];

  sourceComparisonSchemaVersions:
    number[];
};

export type InterpretEventAnalyticsTrendInput = {
  interpretationId:
    string;

  generatedAt:
    string;

  comparisons:
    readonly EventAnalyticsHistoryComparison[];
};

export type EventAnalyticsTrendInterpretation = {
  id:
    string;

  userId:
    string;

  generatedAt:
    string;

  schemaVersion:
    typeof eventAnalyticsTrendInterpretationSchemaVersion;

  comparisonWindowCount:
    number;

  sourceComparisonCount:
    number;

  totalEventCount:
    EventAnalyticsMetricTrend;

  uniqueMemoryCount:
    EventAnalyticsMetricTrend;

  uniqueDecisionCount:
    EventAnalyticsMetricTrend;

  lifecycle: {
    createdCount:
      EventAnalyticsMetricTrend;

    completedCount:
      EventAnalyticsMetricTrend;

    incompleteCount:
      EventAnalyticsMetricTrend;

    invalidLifecycleCount:
      EventAnalyticsMetricTrend;
  };

  confidence: {
    sampleCount:
      EventAnalyticsMetricTrend;

    minimum:
      EventAnalyticsMetricTrend;

    maximum:
      EventAnalyticsMetricTrend;

    average:
      EventAnalyticsMetricTrend;
  };

  evidence: {
    sufficientCount:
      EventAnalyticsMetricTrend;

    insufficientCount:
      EventAnalyticsMetricTrend;

    requiresMoreEvidenceCount:
      EventAnalyticsMetricTrend;
  };

  provenance:
    EventAnalyticsTrendInterpretationProvenance;
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

  return resolved;
}

function requireNonNegativeInteger(
  value: number,
  label: string,
) {
  if (
    !Number.isInteger(
      value,
    ) ||
    value < 0
  ) {
    throw new Error(
      `${label} must be a non-negative integer.`,
    );
  }

  return value;
}

function requireCoverage(
  value: number,
  label: string,
) {
  if (
    !Number.isFinite(
      value,
    ) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      `${label} must be between 0 and 1.`,
    );
  }

  return value;
}

function requireFiniteNumberOrNull(
  value: number | null,
  label: string,
) {
  if (value === null) {
    return null;
  }

  if (!Number.isFinite(value)) {
    throw new Error(
      `${label} must be finite or null.`,
    );
  }

  return value;
}

function validateMetricTrend(
  trend:
    EventAnalyticsMetricTrend,
  label: string,
) {
  const comparisonCount =
    requireNonNegativeInteger(
      trend.comparisonCount,
      `${label} comparison count`,
    );

  const supportedComparisonCount =
    requireNonNegativeInteger(
      trend.supportedComparisonCount,
      `${label} supported comparison count`,
    );

  const increasedCount =
    requireNonNegativeInteger(
      trend.increasedCount,
      `${label} increased count`,
    );

  const decreasedCount =
    requireNonNegativeInteger(
      trend.decreasedCount,
      `${label} decreased count`,
    );

  const stableCount =
    requireNonNegativeInteger(
      trend.stableCount,
      `${label} stable count`,
    );

  const insufficientEvidenceCount =
    requireNonNegativeInteger(
      trend.insufficientEvidenceCount,
      `${label} insufficient-evidence count`,
    );

  const evidenceCoverage =
    requireCoverage(
      trend.evidenceCoverage,
      `${label} evidence coverage`,
    );

  const netChange =
    requireFiniteNumberOrNull(
      trend.netChange,
      `${label} net change`,
    );

  if (
    supportedComparisonCount >
    comparisonCount
  ) {
    throw new Error(
      `${label} supported comparison count cannot exceed comparison count.`,
    );
  }

  if (
    increasedCount +
      decreasedCount +
      stableCount !==
    supportedComparisonCount
  ) {
    throw new Error(
      `${label} supported direction counts are inconsistent.`,
    );
  }

  if (
    supportedComparisonCount +
      insufficientEvidenceCount !==
    comparisonCount
  ) {
    throw new Error(
      `${label} evidence counts are inconsistent.`,
    );
  }

  const expectedCoverage =
    comparisonCount === 0
      ? 0
      : Number(
          (
            supportedComparisonCount /
            comparisonCount
          ).toFixed(
            6,
          ),
        );

  if (
    evidenceCoverage !==
    expectedCoverage
  ) {
    throw new Error(
      `${label} evidence coverage is inconsistent.`,
    );
  }

  if (
    supportedComparisonCount === 0
  ) {
    if (
      trend.direction !==
        "insufficient-evidence" ||
      trend.strength !==
        "none" ||
      netChange !==
        null
    ) {
      throw new Error(
        `${label} must represent insufficient evidence when no supported comparisons exist.`,
      );
    }

    return;
  }

  if (
    trend.direction ===
      "insufficient-evidence"
  ) {
    throw new Error(
      `${label} cannot use insufficient-evidence when supported comparisons exist.`,
    );
  }

  if (
    trend.strength ===
      "none"
  ) {
    throw new Error(
      `${label} strength cannot be none when supported comparisons exist.`,
    );
  }

  if (netChange === null) {
    throw new Error(
      `${label} net change is required when supported comparisons exist.`,
    );
  }
}

function validateUniqueIdentifiers(
  values:
    readonly string[],
  label:
    string,
) {
  const resolved =
    values.map(
      (value) =>
        requireIdentifier(
          value,
          label,
        ),
    );

  if (
    new Set(
      resolved,
    ).size !==
    resolved.length
  ) {
    throw new Error(
      `${label} values must be unique.`,
    );
  }
}

export function validateEventAnalyticsTrendInterpretation(
  interpretation:
    EventAnalyticsTrendInterpretation,
) {
  requireIdentifier(
    interpretation.id,
    "Event Analytics trend interpretation id",
  );

  requireIdentifier(
    interpretation.userId,
    "Event Analytics trend interpretation user id",
  );

  requireIsoDate(
    interpretation.generatedAt,
    "Event Analytics trend interpretation generatedAt",
  );

  if (
    interpretation.schemaVersion !==
    eventAnalyticsTrendInterpretationSchemaVersion
  ) {
    throw new Error(
      "Event Analytics trend interpretation uses an unsupported schema version.",
    );
  }

  requireNonNegativeInteger(
    interpretation.comparisonWindowCount,
    "Event Analytics trend comparison window count",
  );

  requireNonNegativeInteger(
    interpretation.sourceComparisonCount,
    "Event Analytics trend source comparison count",
  );

  if (
    interpretation.comparisonWindowCount !==
    interpretation.sourceComparisonCount
  ) {
    throw new Error(
      "Event Analytics trend comparison counts are inconsistent.",
    );
  }

  validateMetricTrend(
    interpretation.totalEventCount,
    "Event Analytics total event trend",
  );

  validateMetricTrend(
    interpretation.uniqueMemoryCount,
    "Event Analytics unique memory trend",
  );

  validateMetricTrend(
    interpretation.uniqueDecisionCount,
    "Event Analytics unique decision trend",
  );

  validateMetricTrend(
    interpretation.lifecycle.createdCount,
    "Event Analytics created lifecycle trend",
  );

  validateMetricTrend(
    interpretation.lifecycle.completedCount,
    "Event Analytics completed lifecycle trend",
  );

  validateMetricTrend(
    interpretation.lifecycle.incompleteCount,
    "Event Analytics incomplete lifecycle trend",
  );

  validateMetricTrend(
    interpretation.lifecycle.invalidLifecycleCount,
    "Event Analytics invalid lifecycle trend",
  );

  validateMetricTrend(
    interpretation.confidence.sampleCount,
    "Event Analytics confidence sample trend",
  );

  validateMetricTrend(
    interpretation.confidence.minimum,
    "Event Analytics minimum confidence trend",
  );

  validateMetricTrend(
    interpretation.confidence.maximum,
    "Event Analytics maximum confidence trend",
  );

  validateMetricTrend(
    interpretation.confidence.average,
    "Event Analytics average confidence trend",
  );

  validateMetricTrend(
    interpretation.evidence.sufficientCount,
    "Event Analytics sufficient evidence trend",
  );

  validateMetricTrend(
    interpretation.evidence.insufficientCount,
    "Event Analytics insufficient evidence trend",
  );

  validateMetricTrend(
    interpretation.evidence.requiresMoreEvidenceCount,
    "Event Analytics requires-more-evidence trend",
  );

  if (
    interpretation.provenance.algorithm !==
    eventAnalyticsTrendInterpretationAlgorithm
  ) {
    throw new Error(
      "Event Analytics trend provenance uses an unsupported algorithm.",
    );
  }

  if (
    interpretation.provenance.algorithmVersion !==
    eventAnalyticsTrendInterpretationAlgorithmVersion
  ) {
    throw new Error(
      "Event Analytics trend provenance uses an unsupported algorithm version.",
    );
  }

  requireIsoDate(
    interpretation.provenance.producedAt,
    "Event Analytics trend provenance producedAt",
  );

  validateUniqueIdentifiers(
    interpretation.provenance.sourceComparisonIds,
    "Event Analytics source comparison id",
  );

  validateUniqueIdentifiers(
    interpretation.provenance.sourceSnapshotIds,
    "Event Analytics source snapshot id",
  );

  if (
    interpretation.provenance.sourceComparisonIds.length !==
    interpretation.sourceComparisonCount
  ) {
    throw new Error(
      "Event Analytics trend provenance comparison count is inconsistent.",
    );
  }

  const schemaVersions =
    interpretation.provenance
      .sourceComparisonSchemaVersions;

  for (
    const version of
    schemaVersions
  ) {
    requireNonNegativeInteger(
      version,
      "Event Analytics source comparison schema version",
    );
  }

  if (
    new Set(
      schemaVersions,
    ).size !==
    schemaVersions.length
  ) {
    throw new Error(
      "Event Analytics source comparison schema versions must be unique.",
    );
  }
}

export function createEventAnalyticsTrendInterpretation(
  interpretation:
    EventAnalyticsTrendInterpretation,
): EventAnalyticsTrendInterpretation {
  validateEventAnalyticsTrendInterpretation(
    interpretation,
  );

  return structuredClone(
    interpretation,
  );
}
