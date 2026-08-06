import {
  createDecisionMemoryEventAnalyticsSnapshot,
  createEmptyDecisionMemoryEventTypeCounts,
  decisionMemoryEventAnalyticsAlgorithm,
  decisionMemoryEventAnalyticsAlgorithmVersion,
  decisionMemoryEventAnalyticsReplayEngine,
  eventAnalyticsSchemaVersion,
  type DecisionMemoryEventAnalyticsSnapshot,
  type EventAnalyticsTimeWindow,
} from "@/lib/analytics/events/contracts";

import {
  type DecisionMemoryDomainEvent,
} from "@/lib/events/contracts";

import {
  replayDecisionMemoryEvents,
} from "@/lib/events/replay";

import {
  validateDecisionMemoryEvent,
} from "@/lib/events/validation";

export type BuildDecisionMemoryEventAnalyticsSnapshotInput = {
  snapshotId:
    string;

  userId:
    string;

  window:
    EventAnalyticsTimeWindow;

  generatedAt:
    string;

  events:
    readonly unknown[];
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

function requireDate(
  value: string,
  label: string,
) {
  const resolved =
    value.trim();

  const date =
    new Date(
      resolved,
    );

  if (
    !resolved ||
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      `${label} must be a valid date.`,
    );
  }

  return date;
}

function compareEvents(
  first:
    DecisionMemoryDomainEvent,
  second:
    DecisionMemoryDomainEvent,
) {
  return (
    first.occurredAt.getTime() -
      second.occurredAt.getTime() ||
    first.payload.eventId.localeCompare(
      second.payload.eventId,
    )
  );
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

export function buildDecisionMemoryEventAnalyticsSnapshot({
  snapshotId,
  userId,
  window,
  generatedAt,
  events,
}: BuildDecisionMemoryEventAnalyticsSnapshotInput):
  DecisionMemoryEventAnalyticsSnapshot {
  const resolvedSnapshotId =
    requireIdentifier(
      snapshotId,
      "Event Analytics snapshot id",
    );

  const resolvedUserId =
    requireIdentifier(
      userId,
      "Event Analytics user id",
    );

  const startAt =
    requireDate(
      window.startAt,
      "Event Analytics window startAt",
    );

  const endAt =
    requireDate(
      window.endAt,
      "Event Analytics window endAt",
    );

  if (
    startAt.getTime() >
    endAt.getTime()
  ) {
    throw new Error(
      "Event Analytics window startAt cannot be after endAt.",
    );
  }

  requireDate(
    generatedAt,
    "Event Analytics generatedAt",
  );

  const validatedEvents:
    DecisionMemoryDomainEvent[] =
      [];

  const excludedEvents: {
    eventId:
      string;

    eventIndex:
      number;

    reason:
      "different-user" |
      "outside-window";

    message:
      string;
  }[] = [];

  for (
    let index = 0;
    index < events.length;
    index += 1
  ) {
    const result =
      validateDecisionMemoryEvent(
        events[index],
      );

    if (!result.valid) {
      throw new Error(
        `Event Analytics source event at index ${index} is invalid.`,
      );
    }

    if (
      result.event.userId !==
      resolvedUserId
    ) {
      excludedEvents.push({
        eventId:
          result.event.payload
            .eventId,

        eventIndex:
          index,

        reason:
          "different-user",

        message:
          `Event belongs to user "${result.event.userId}" rather than analytics owner "${resolvedUserId}".`,
      });

      continue;
    }

    const occurredAt =
      result.event.occurredAt
        .getTime();

    if (
      occurredAt <
        startAt.getTime() ||
      occurredAt >
        endAt.getTime()
    ) {
      excludedEvents.push({
        eventId:
          result.event.payload
            .eventId,

        eventIndex:
          index,

        reason:
          "outside-window",

        message:
          `Event occurred at "${result.event.occurredAt.toISOString()}" outside the analytics window.`,
      });

      continue;
    }

    validatedEvents.push(
      result.event,
    );
  }

  const orderedEvents = [
    ...validatedEvents,
  ].sort(
    compareEvents,
  );

  const eventTypeCounts =
    createEmptyDecisionMemoryEventTypeCounts();

  const memoryIds =
    new Set<string>();

  const decisionIds =
    new Set<string>();

  const schemaVersions =
    new Set<number>();

  const eventIds =
    new Set<string>();

  const eventsByMemory =
    new Map<
      string,
      DecisionMemoryDomainEvent[]
    >();

  const confidenceValues:
    number[] = [];

  let sufficientCount =
    0;

  let insufficientCount =
    0;

  let requiresMoreEvidenceCount =
    0;

  for (
    const event of
    orderedEvents
  ) {
    const {
      payload,
    } = event;

    if (
      eventIds.has(
        payload.eventId,
      )
    ) {
      throw new Error(
        `Event Analytics source event id "${payload.eventId}" is duplicated.`,
      );
    }

    eventIds.add(
      payload.eventId,
    );

    memoryIds.add(
      payload.memoryId,
    );

    decisionIds.add(
      payload.decisionId,
    );

    schemaVersions.add(
      event.schemaVersion,
    );

    eventTypeCounts[
      event.type
    ] += 1;

    confidenceValues.push(
      payload.reasoningConfidence,
    );

    if (
      payload.evidenceSufficient
    ) {
      sufficientCount += 1;
    } else {
      insufficientCount += 1;
    }

    if (
      payload.requiresMoreEvidence
    ) {
      requiresMoreEvidenceCount +=
        1;
    }

    const memoryEvents =
      eventsByMemory.get(
        payload.memoryId,
      ) ?? [];

    memoryEvents.push(
      event,
    );

    eventsByMemory.set(
      payload.memoryId,
      memoryEvents,
    );
  }

  let completedCount =
    0;

  let incompleteCount =
    0;

  let invalidLifecycleCount =
    0;

  const replayedMemoryIds:
    string[] = [];

  const completedMemoryIds:
    string[] = [];

  const incompleteMemoryIds:
    string[] = [];

  const invalidMemoryIds:
    string[] = [];

  for (
    const [
      memoryId,
      memoryEvents,
    ] of
    eventsByMemory.entries()
  ) {
    replayedMemoryIds.push(
      memoryId,
    );
    const replay =
      replayDecisionMemoryEvents(
        memoryEvents,
      );

    if (!replay.success) {
      invalidLifecycleCount +=
        1;

      invalidMemoryIds.push(
        memoryId,
      );

      continue;
    }

    if (
      replay.completeLifecycle
    ) {
      completedCount +=
        1;

      completedMemoryIds.push(
        memoryId,
      );
    } else {
      incompleteCount +=
        1;

      incompleteMemoryIds.push(
        memoryId,
      );
    }
  }

  const confidenceMinimum =
    confidenceValues.length > 0
      ? Math.min(
          ...confidenceValues,
        )
      : null;

  const confidenceMaximum =
    confidenceValues.length > 0
      ? Math.max(
          ...confidenceValues,
        )
      : null;

  const confidenceAverage =
    confidenceValues.length > 0
      ? roundMetric(
          confidenceValues.reduce(
            (
              total,
              value,
            ) =>
              total + value,
            0,
          ) /
            confidenceValues.length,
        )
      : null;

  return createDecisionMemoryEventAnalyticsSnapshot({
    id:
      resolvedSnapshotId,

    userId:
      resolvedUserId,

    window: {
      startAt:
        startAt.toISOString(),

      endAt:
        endAt.toISOString(),
    },

    generatedAt:
      new Date(
        generatedAt,
      ).toISOString(),

    schemaVersion:
      eventAnalyticsSchemaVersion,

    totalEventCount:
      orderedEvents.length,

    uniqueMemoryCount:
      memoryIds.size,

    uniqueDecisionCount:
      decisionIds.size,

    eventTypeCounts,

    lifecycle: {
      createdCount:
        eventTypeCounts[
          "decision-memory.created"
        ],

      completedCount,

      incompleteCount,

      invalidLifecycleCount,
    },

    confidence: {
      sampleCount:
        confidenceValues.length,

      minimum:
        confidenceMinimum,

      maximum:
        confidenceMaximum,

      average:
        confidenceAverage,
    },

    evidence: {
      sufficientCount,

      insufficientCount,

      requiresMoreEvidenceCount,
    },

    provenance: {
      algorithm:
        decisionMemoryEventAnalyticsAlgorithm,

      algorithmVersion:
        decisionMemoryEventAnalyticsAlgorithmVersion,

      replayEngine:
        decisionMemoryEventAnalyticsReplayEngine,

      producedAt:
        new Date(
          generatedAt,
        ).toISOString(),

      inputEventCount:
        events.length,

      includedEventCount:
        orderedEvents.length,

      excludedEventCount:
        excludedEvents.length,

      excludedEvents:
        excludedEvents
          .sort(
            (
              first,
              second,
            ) =>
              first.eventIndex -
              second.eventIndex,
          ),

      replayedMemoryIds:
        replayedMemoryIds
          .sort(),

      completedMemoryIds:
        completedMemoryIds
          .sort(),

      incompleteMemoryIds:
        incompleteMemoryIds
          .sort(),

      invalidMemoryIds:
        invalidMemoryIds
          .sort(),
    },

    sourceEventIds:
      orderedEvents.map(
        (event) =>
          event.payload.eventId,
      ),

    sourceEventSchemaVersions: [
      ...schemaVersions,
    ].sort(
      (
        first,
        second,
      ) =>
        first - second,
    ),

    sourceMemoryIds: [
      ...memoryIds,
    ].sort(),

    sourceDecisionIds: [
      ...decisionIds,
    ].sort(),
  });
}
