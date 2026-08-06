import assert from "node:assert/strict";

import {
  decisionMemoryEventCategory,
  decisionMemoryEventSchemaVersion,
  decisionMemoryEventSource,
  type DecisionMemoryDomainEvent,
  type DecisionMemoryEventType,
} from "@/lib/events/contracts";

import {
  buildDecisionMemoryEventAnalyticsSnapshot,
} from "./build-decision-memory-event-analytics-snapshot";

function createEvent({
  eventId,
  type,
  memoryId,
  decisionId,
  occurredAt,
  confidence,
  evidenceSufficient,
  requiresMoreEvidence,
}: {
  eventId: string;
  type: DecisionMemoryEventType;
  memoryId: string;
  decisionId: string;
  occurredAt: string;
  confidence: number;
  evidenceSufficient: boolean;
  requiresMoreEvidence: boolean;
}): DecisionMemoryDomainEvent {
  return {
    userId:
      "user-1",

    type,

    category:
      decisionMemoryEventCategory,

    source:
      decisionMemoryEventSource,

    schemaVersion:
      decisionMemoryEventSchemaVersion,

    occurredAt:
      new Date(
        occurredAt,
      ),

    payload: {
      eventId,

      correlationId:
        `correlation-${memoryId}`,

      causationId:
        null,

      memoryId,

      decisionId,

      decisionType:
        "workout-plan",

      priority:
        "normal",

      memoryStatus:
        type ===
        "decision-memory.closed"
          ? "closed"
          : "active",

      decisionStatus:
        type ===
        "decision-memory.closed"
          ? "completed"
          : "active",

      reasoningTone:
        "supportive",

      reasoningConfidence:
        confidence,

      evidenceSufficient,

      requiresMoreEvidence,

      outcomeStatus:
        type ===
        "decision-memory.created"
          ? null
          : "successful",

      reflectionOutcome:
        null,

      learningEntryIds:
        [],

      learningCount:
        0,

      memorySchemaVersion:
        1,
    },
  };
}

function run() {
  const events = [
    createEvent({
      eventId:
        "event-2",

      type:
        "decision-memory.closed",

      memoryId:
        "memory-1",

      decisionId:
        "decision-1",

      occurredAt:
        "2026-08-02T10:00:00.000Z",

      confidence:
        0.9,

      evidenceSufficient:
        true,

      requiresMoreEvidence:
        false,
    }),

    createEvent({
      eventId:
        "event-1",

      type:
        "decision-memory.created",

      memoryId:
        "memory-1",

      decisionId:
        "decision-1",

      occurredAt:
        "2026-08-01T10:00:00.000Z",

      confidence:
        0.7,

      evidenceSufficient:
        false,

      requiresMoreEvidence:
        true,
    }),

    createEvent({
      eventId:
        "event-3",

      type:
        "decision-memory.created",

      memoryId:
        "memory-2",

      decisionId:
        "decision-2",

      occurredAt:
        "2026-08-03T10:00:00.000Z",

      confidence:
        0.8,

      evidenceSufficient:
        true,

      requiresMoreEvidence:
        false,
    }),

    createEvent({
      eventId:
        "outside-window",

      type:
        "decision-memory.created",

      memoryId:
        "memory-3",

      decisionId:
        "decision-3",

      occurredAt:
        "2026-07-01T10:00:00.000Z",

      confidence:
        0.5,

      evidenceSufficient:
        false,

      requiresMoreEvidence:
        true,
    }),
  ];

  const snapshot =
    buildDecisionMemoryEventAnalyticsSnapshot({
      snapshotId:
        "snapshot-1",

      userId:
        "user-1",

      window: {
        startAt:
          "2026-08-01T00:00:00.000Z",

        endAt:
          "2026-08-07T23:59:59.999Z",
      },

      generatedAt:
        "2026-08-08T00:00:00.000Z",

      events,
    });

  assert.equal(
    snapshot.totalEventCount,
    3,
  );

  assert.equal(
    snapshot.uniqueMemoryCount,
    2,
  );

  assert.equal(
    snapshot.uniqueDecisionCount,
    2,
  );

  assert.deepEqual(
    snapshot.sourceEventIds,
    [
      "event-1",
      "event-2",
      "event-3",
    ],
  );

  assert.deepEqual(
    snapshot.eventTypeCounts,
    {
      "decision-memory.created":
        2,

      "decision-memory.outcome-recorded":
        0,

      "decision-memory.reflection-recorded":
        0,

      "decision-memory.learning-created":
        0,

      "decision-memory.closed":
        1,
    },
  );

  assert.deepEqual(
    snapshot.lifecycle,
    {
      createdCount:
        2,

      completedCount:
        1,

      incompleteCount:
        1,

      invalidLifecycleCount:
        0,
    },
  );

  assert.deepEqual(
    snapshot.confidence,
    {
      sampleCount:
        3,

      minimum:
        0.7,

      maximum:
        0.9,

      average:
        0.8,
    },
  );

  assert.deepEqual(
    snapshot.evidence,
    {
      sufficientCount:
        2,

      insufficientCount:
        1,

      requiresMoreEvidenceCount:
        1,
    },
  );

  assert.deepEqual(
    snapshot.provenance,
    {
      algorithm:
        "decision-memory-event-analytics",

      algorithmVersion:
        1,

      replayEngine:
        "replay-decision-memory-events",

      producedAt:
        "2026-08-08T00:00:00.000Z",

      inputEventCount:
        4,

      includedEventCount:
        3,

      excludedEventCount:
        1,

      excludedEvents: [
        {
          eventId:
            "outside-window",

          eventIndex:
            3,

          reason:
            "outside-window",

          message:
            'Event occurred at "2026-07-01T10:00:00.000Z" outside the analytics window.',
        },
      ],

      replayedMemoryIds: [
        "memory-1",
        "memory-2",
      ],

      completedMemoryIds: [
        "memory-1",
      ],

      incompleteMemoryIds: [
        "memory-2",
      ],

      invalidMemoryIds:
        [],
    },
  );

  const empty =
    buildDecisionMemoryEventAnalyticsSnapshot({
      snapshotId:
        "snapshot-empty",

      userId:
        "user-1",

      window: {
        startAt:
          "2026-09-01T00:00:00.000Z",

        endAt:
          "2026-09-02T00:00:00.000Z",
      },

      generatedAt:
        "2026-09-03T00:00:00.000Z",

      events,
    });

  assert.equal(
    empty.totalEventCount,
    0,
  );

  assert.deepEqual(
    empty.confidence,
    {
      sampleCount:
        0,

      minimum:
        null,

      maximum:
        null,

      average:
        null,
    },
  );

  assert.throws(
    () =>
      buildDecisionMemoryEventAnalyticsSnapshot({
        snapshotId:
          "snapshot-duplicate",

        userId:
          "user-1",

        window: {
          startAt:
            "2026-08-01T00:00:00.000Z",

          endAt:
            "2026-08-07T23:59:59.999Z",
        },

        generatedAt:
          "2026-08-08T00:00:00.000Z",

        events: [
          events[0],
          events[0],
        ],
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        'Event Analytics source event id "event-2" is duplicated.',
  );

  console.log(
    "Decision Memory Event Analytics aggregation tests passed.",
  );
}

run();
