import {
  decisionMemoryEventTypes,
  type DecisionMemoryEventType,
} from "@/lib/events/contracts";

export const eventAnalyticsSchemaVersion =
  1 as const;

export type EventAnalyticsTimeWindow = {
  startAt:
    string;

  endAt:
    string;
};

export type DecisionMemoryEventTypeCounts =
  Record<
    DecisionMemoryEventType,
    number
  >;

export type DecisionMemoryConfidenceSummary = {
  sampleCount:
    number;

  minimum:
    number | null;

  maximum:
    number | null;

  average:
    number | null;
};

export type DecisionMemoryEvidenceSummary = {
  sufficientCount:
    number;

  insufficientCount:
    number;

  requiresMoreEvidenceCount:
    number;
};

export type DecisionMemoryLifecycleSummary = {
  createdCount:
    number;

  completedCount:
    number;

  incompleteCount:
    number;

  invalidLifecycleCount:
    number;
};

export type DecisionMemoryEventAnalyticsSnapshot = {
  id:
    string;

  userId:
    string;

  window:
    EventAnalyticsTimeWindow;

  generatedAt:
    string;

  schemaVersion:
    typeof eventAnalyticsSchemaVersion;

  totalEventCount:
    number;

  uniqueMemoryCount:
    number;

  uniqueDecisionCount:
    number;

  eventTypeCounts:
    DecisionMemoryEventTypeCounts;

  lifecycle:
    DecisionMemoryLifecycleSummary;

  confidence:
    DecisionMemoryConfidenceSummary;

  evidence:
    DecisionMemoryEvidenceSummary;

  sourceEventIds:
    string[];

  sourceEventSchemaVersions:
    number[];

  sourceMemoryIds:
    string[];

  sourceDecisionIds:
    string[];
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
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${label} must be a non-negative integer.`,
    );
  }

  return value;
}

function requireConfidenceValue(
  value: number | null,
  label: string,
) {
  if (value === null) {
    return null;
  }

  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 1
  ) {
    throw new Error(
      `${label} must be between 0 and 1.`,
    );
  }

  return value;
}

function validateUniqueIdentifiers(
  values: readonly string[],
  label: string,
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

export function createEmptyDecisionMemoryEventTypeCounts():
  DecisionMemoryEventTypeCounts {
  return Object.fromEntries(
    decisionMemoryEventTypes.map(
      (type) => [
        type,
        0,
      ],
    ),
  ) as
    DecisionMemoryEventTypeCounts;
}

export function validateDecisionMemoryEventAnalyticsSnapshot(
  snapshot:
    DecisionMemoryEventAnalyticsSnapshot,
) {
  requireIdentifier(
    snapshot.id,
    "Event Analytics snapshot id",
  );

  requireIdentifier(
    snapshot.userId,
    "Event Analytics user id",
  );

  const startAt =
    requireIsoDate(
      snapshot.window.startAt,
      "Event Analytics window startAt",
    );

  const endAt =
    requireIsoDate(
      snapshot.window.endAt,
      "Event Analytics window endAt",
    );

  if (
    new Date(startAt).getTime() >
    new Date(endAt).getTime()
  ) {
    throw new Error(
      "Event Analytics window startAt cannot be after endAt.",
    );
  }

  requireIsoDate(
    snapshot.generatedAt,
    "Event Analytics generatedAt",
  );

  if (
    snapshot.schemaVersion !==
    eventAnalyticsSchemaVersion
  ) {
    throw new Error(
      "Event Analytics snapshot uses an unsupported schema version.",
    );
  }

  requireNonNegativeInteger(
    snapshot.totalEventCount,
    "Event Analytics total event count",
  );

  requireNonNegativeInteger(
    snapshot.uniqueMemoryCount,
    "Event Analytics unique memory count",
  );

  requireNonNegativeInteger(
    snapshot.uniqueDecisionCount,
    "Event Analytics unique decision count",
  );

  for (
    const type of
    decisionMemoryEventTypes
  ) {
    requireNonNegativeInteger(
      snapshot
        .eventTypeCounts[
          type
        ],
      `Event Analytics ${type} count`,
    );
  }

  const countedEvents =
    decisionMemoryEventTypes.reduce(
      (
        total,
        type,
      ) =>
        total +
        snapshot
          .eventTypeCounts[
            type
          ],
      0,
    );

  if (
    countedEvents !==
    snapshot.totalEventCount
  ) {
    throw new Error(
      "Event Analytics event-type counts must equal the total event count.",
    );
  }

  requireNonNegativeInteger(
    snapshot.lifecycle
      .createdCount,
    "Event Analytics created lifecycle count",
  );

  requireNonNegativeInteger(
    snapshot.lifecycle
      .completedCount,
    "Event Analytics completed lifecycle count",
  );

  requireNonNegativeInteger(
    snapshot.lifecycle
      .incompleteCount,
    "Event Analytics incomplete lifecycle count",
  );

  requireNonNegativeInteger(
    snapshot.lifecycle
      .invalidLifecycleCount,
    "Event Analytics invalid lifecycle count",
  );

  requireNonNegativeInteger(
    snapshot.confidence
      .sampleCount,
    "Event Analytics confidence sample count",
  );

  const minimum =
    requireConfidenceValue(
      snapshot.confidence.minimum,
      "Event Analytics minimum confidence",
    );

  const maximum =
    requireConfidenceValue(
      snapshot.confidence.maximum,
      "Event Analytics maximum confidence",
    );

  const average =
    requireConfidenceValue(
      snapshot.confidence.average,
      "Event Analytics average confidence",
    );

  if (
    snapshot.confidence
      .sampleCount === 0
  ) {
    if (
      minimum !== null ||
      maximum !== null ||
      average !== null
    ) {
      throw new Error(
        "Event Analytics confidence values must be null when no samples exist.",
      );
    }
  } else if (
    minimum === null ||
    maximum === null ||
    average === null
  ) {
    throw new Error(
      "Event Analytics confidence values are required when samples exist.",
    );
  } else if (
    minimum > maximum ||
    average < minimum ||
    average > maximum
  ) {
    throw new Error(
      "Event Analytics confidence summary is inconsistent.",
    );
  }

  requireNonNegativeInteger(
    snapshot.evidence
      .sufficientCount,
    "Event Analytics sufficient evidence count",
  );

  requireNonNegativeInteger(
    snapshot.evidence
      .insufficientCount,
    "Event Analytics insufficient evidence count",
  );

  requireNonNegativeInteger(
    snapshot.evidence
      .requiresMoreEvidenceCount,
    "Event Analytics requires-more-evidence count",
  );

  validateUniqueIdentifiers(
    snapshot.sourceEventIds,
    "Event Analytics source event id",
  );

  validateUniqueIdentifiers(
    snapshot.sourceMemoryIds,
    "Event Analytics source memory id",
  );

  validateUniqueIdentifiers(
    snapshot.sourceDecisionIds,
    "Event Analytics source decision id",
  );

  if (
    snapshot.sourceEventIds
      .length !==
    snapshot.totalEventCount
  ) {
    throw new Error(
      "Event Analytics source event ids must match the total event count.",
    );
  }

  if (
    snapshot.sourceMemoryIds
      .length !==
    snapshot.uniqueMemoryCount
  ) {
    throw new Error(
      "Event Analytics source memory ids must match the unique memory count.",
    );
  }

  if (
    snapshot.sourceDecisionIds
      .length !==
    snapshot.uniqueDecisionCount
  ) {
    throw new Error(
      "Event Analytics source decision ids must match the unique decision count.",
    );
  }

  if (
    snapshot.sourceEventSchemaVersions
      .some(
        (version) =>
          !Number.isInteger(
            version,
          ) ||
          version < 1,
      )
  ) {
    throw new Error(
      "Event Analytics source event schema versions must be positive integers.",
    );
  }
}

export function createDecisionMemoryEventAnalyticsSnapshot(
  snapshot:
    DecisionMemoryEventAnalyticsSnapshot,
): DecisionMemoryEventAnalyticsSnapshot {
  const cloned =
    structuredClone(
      snapshot,
    );

  validateDecisionMemoryEventAnalyticsSnapshot(
    cloned,
  );

  return cloned;
}
