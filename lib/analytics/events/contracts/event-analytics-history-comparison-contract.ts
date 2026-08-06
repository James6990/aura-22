import {
  decisionMemoryEventTypes,
  type DecisionMemoryEventType,
} from "@/lib/events/contracts";

import type {
  DecisionMemoryEventAnalyticsSnapshot,
  EventAnalyticsTimeWindow,
} from "./decision-memory-event-analytics-contract";

export const eventAnalyticsHistoryComparisonSchemaVersion =
  1 as const;

export const eventAnalyticsHistoryComparisonAlgorithm =
  "event-analytics-history-comparison" as const;

export const eventAnalyticsHistoryComparisonAlgorithmVersion =
  1 as const;

export type EventAnalyticsComparisonDirection =
  | "increased"
  | "decreased"
  | "stable"
  | "insufficient-evidence";

export type EventAnalyticsNumericDelta = {
  baseline:
    number | null;

  comparison:
    number | null;

  absolute:
    number | null;

  direction:
    EventAnalyticsComparisonDirection;
};

export type EventAnalyticsEventTypeDeltas =
  Record<
    DecisionMemoryEventType,
    EventAnalyticsNumericDelta
  >;

export type EventAnalyticsHistoryComparisonProvenance = {
  algorithm:
    typeof eventAnalyticsHistoryComparisonAlgorithm;

  algorithmVersion:
    typeof eventAnalyticsHistoryComparisonAlgorithmVersion;

  producedAt:
    string;

  baselineSnapshotId:
    string;

  comparisonSnapshotId:
    string;

  baselineSchemaVersion:
    number;

  comparisonSchemaVersion:
    number;
};

export type EventAnalyticsHistoryComparison = {
  id:
    string;

  userId:
    string;

  generatedAt:
    string;

  schemaVersion:
    typeof eventAnalyticsHistoryComparisonSchemaVersion;

  baselineSnapshotId:
    string;

  comparisonSnapshotId:
    string;

  baselineWindow:
    EventAnalyticsTimeWindow;

  comparisonWindow:
    EventAnalyticsTimeWindow;

  totalEventCount:
    EventAnalyticsNumericDelta;

  uniqueMemoryCount:
    EventAnalyticsNumericDelta;

  uniqueDecisionCount:
    EventAnalyticsNumericDelta;

  eventTypeCounts:
    EventAnalyticsEventTypeDeltas;

  lifecycle: {
    createdCount:
      EventAnalyticsNumericDelta;

    completedCount:
      EventAnalyticsNumericDelta;

    incompleteCount:
      EventAnalyticsNumericDelta;

    invalidLifecycleCount:
      EventAnalyticsNumericDelta;
  };

  confidence: {
    sampleCount:
      EventAnalyticsNumericDelta;

    minimum:
      EventAnalyticsNumericDelta;

    maximum:
      EventAnalyticsNumericDelta;

    average:
      EventAnalyticsNumericDelta;
  };

  evidence: {
    sufficientCount:
      EventAnalyticsNumericDelta;

    insufficientCount:
      EventAnalyticsNumericDelta;

    requiresMoreEvidenceCount:
      EventAnalyticsNumericDelta;
  };

  provenance:
    EventAnalyticsHistoryComparisonProvenance;
};

export type CreateEventAnalyticsHistoryComparisonInput = {
  id:
    string;

  generatedAt:
    string;

  baseline:
    DecisionMemoryEventAnalyticsSnapshot;

  comparison:
    DecisionMemoryEventAnalyticsSnapshot;
};

export function createEmptyEventAnalyticsEventTypeDeltas():
  EventAnalyticsEventTypeDeltas {
  return Object.fromEntries(
    decisionMemoryEventTypes.map(
      (type) => [
        type,
        {
          baseline:
            0,

          comparison:
            0,

          absolute:
            0,

          direction:
            "stable",
        },
      ],
    ),
  ) as
    EventAnalyticsEventTypeDeltas;
}

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

function validateWindow(
  window:
    EventAnalyticsTimeWindow,
  label: string,
) {
  const startAt =
    requireIsoDate(
      window.startAt,
      `${label} startAt`,
    );

  const endAt =
    requireIsoDate(
      window.endAt,
      `${label} endAt`,
    );

  if (
    new Date(
      startAt,
    ).getTime() >
    new Date(
      endAt,
    ).getTime()
  ) {
    throw new Error(
      `${label} startAt cannot be after endAt.`,
    );
  }
}

function validateNumericDelta(
  delta:
    EventAnalyticsNumericDelta,
  label: string,
) {
  const baseline =
    requireFiniteNumberOrNull(
      delta.baseline,
      `${label} baseline`,
    );

  const comparison =
    requireFiniteNumberOrNull(
      delta.comparison,
      `${label} comparison`,
    );

  const absolute =
    requireFiniteNumberOrNull(
      delta.absolute,
      `${label} absolute`,
    );

  if (
    baseline === null ||
    comparison === null
  ) {
    if (
      absolute !== null ||
      delta.direction !==
        "insufficient-evidence"
    ) {
      throw new Error(
        `${label} must use insufficient-evidence when either value is null.`,
      );
    }

    return;
  }

  const expectedAbsolute =
    Number(
      (
        comparison -
        baseline
      ).toFixed(
        6,
      ),
    );

  if (
    absolute !==
    expectedAbsolute
  ) {
    throw new Error(
      `${label} absolute delta is inconsistent.`,
    );
  }

  const expectedDirection:
    EventAnalyticsComparisonDirection =
      expectedAbsolute > 0
        ? "increased"
        : expectedAbsolute < 0
          ? "decreased"
          : "stable";

  if (
    delta.direction !==
    expectedDirection
  ) {
    throw new Error(
      `${label} direction is inconsistent.`,
    );
  }
}

export function validateEventAnalyticsHistoryComparison(
  comparison:
    EventAnalyticsHistoryComparison,
) {
  requireIdentifier(
    comparison.id,
    "Event Analytics comparison id",
  );

  requireIdentifier(
    comparison.userId,
    "Event Analytics comparison user id",
  );

  requireIdentifier(
    comparison.baselineSnapshotId,
    "Event Analytics baseline snapshot id",
  );

  requireIdentifier(
    comparison.comparisonSnapshotId,
    "Event Analytics comparison snapshot id",
  );

  requireIsoDate(
    comparison.generatedAt,
    "Event Analytics comparison generatedAt",
  );

  if (
    comparison.schemaVersion !==
    eventAnalyticsHistoryComparisonSchemaVersion
  ) {
    throw new Error(
      "Event Analytics comparison uses an unsupported schema version.",
    );
  }

  validateWindow(
    comparison.baselineWindow,
    "Event Analytics baseline window",
  );

  validateWindow(
    comparison.comparisonWindow,
    "Event Analytics comparison window",
  );

  if (
    new Date(
      comparison.baselineWindow.endAt,
    ).getTime() >
    new Date(
      comparison.comparisonWindow.startAt,
    ).getTime()
  ) {
    throw new Error(
      "Event Analytics comparison window must not begin before the baseline window ends.",
    );
  }

  validateNumericDelta(
    comparison.totalEventCount,
    "Event Analytics total event count",
  );

  validateNumericDelta(
    comparison.uniqueMemoryCount,
    "Event Analytics unique memory count",
  );

  validateNumericDelta(
    comparison.uniqueDecisionCount,
    "Event Analytics unique decision count",
  );

  for (
    const type of
    decisionMemoryEventTypes
  ) {
    validateNumericDelta(
      comparison.eventTypeCounts[
        type
      ],
      `Event Analytics ${type} count`,
    );
  }

  validateNumericDelta(
    comparison.lifecycle.createdCount,
    "Event Analytics created lifecycle count",
  );

  validateNumericDelta(
    comparison.lifecycle.completedCount,
    "Event Analytics completed lifecycle count",
  );

  validateNumericDelta(
    comparison.lifecycle.incompleteCount,
    "Event Analytics incomplete lifecycle count",
  );

  validateNumericDelta(
    comparison.lifecycle.invalidLifecycleCount,
    "Event Analytics invalid lifecycle count",
  );

  validateNumericDelta(
    comparison.confidence.sampleCount,
    "Event Analytics confidence sample count",
  );

  validateNumericDelta(
    comparison.confidence.minimum,
    "Event Analytics minimum confidence",
  );

  validateNumericDelta(
    comparison.confidence.maximum,
    "Event Analytics maximum confidence",
  );

  validateNumericDelta(
    comparison.confidence.average,
    "Event Analytics average confidence",
  );

  validateNumericDelta(
    comparison.evidence.sufficientCount,
    "Event Analytics sufficient evidence count",
  );

  validateNumericDelta(
    comparison.evidence.insufficientCount,
    "Event Analytics insufficient evidence count",
  );

  validateNumericDelta(
    comparison.evidence.requiresMoreEvidenceCount,
    "Event Analytics requires-more-evidence count",
  );

  if (
    comparison.provenance.algorithm !==
    eventAnalyticsHistoryComparisonAlgorithm
  ) {
    throw new Error(
      "Event Analytics comparison provenance uses an unsupported algorithm.",
    );
  }

  if (
    comparison.provenance.algorithmVersion !==
    eventAnalyticsHistoryComparisonAlgorithmVersion
  ) {
    throw new Error(
      "Event Analytics comparison provenance uses an unsupported algorithm version.",
    );
  }

  if (
    comparison.provenance.baselineSnapshotId !==
      comparison.baselineSnapshotId ||
    comparison.provenance.comparisonSnapshotId !==
      comparison.comparisonSnapshotId
  ) {
    throw new Error(
      "Event Analytics comparison provenance snapshot ids are inconsistent.",
    );
  }

  requireIsoDate(
    comparison.provenance.producedAt,
    "Event Analytics comparison provenance producedAt",
  );
}

export function createEventAnalyticsHistoryComparison(
  comparison:
    EventAnalyticsHistoryComparison,
): EventAnalyticsHistoryComparison {
  validateEventAnalyticsHistoryComparison(
    comparison,
  );

  return structuredClone(
    comparison,
  );
}
