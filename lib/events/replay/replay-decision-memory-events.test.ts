import type {
  DecisionMemoryDomainEvent,
  DecisionMemoryEventType,
} from "@/lib/events/contracts";
import {
  replayDecisionMemoryEvents,
} from "./replay-decision-memory-events";

function createEvent({
  type,
  eventId,
  occurredAt,
}: {
  type:
    DecisionMemoryEventType;
  eventId: string;
  occurredAt: string;
}): DecisionMemoryDomainEvent {
  const stages = {
    "decision-memory.created": {
      memoryStatus:
        "awaiting-response",
      decisionStatus:
        "issued",
      outcomeStatus: null,
      reflectionOutcome: null,
      learningEntryIds: [],
      learningCount: 0,
    },

    "decision-memory.outcome-recorded": {
      memoryStatus:
        "ready-for-reflection",
      decisionStatus:
        "completed",
      outcomeStatus:
        "positive",
      reflectionOutcome: null,
      learningEntryIds: [],
      learningCount: 0,
    },

    "decision-memory.reflection-recorded": {
      memoryStatus:
        "reflected",
      decisionStatus:
        "completed",
      outcomeStatus:
        "positive",
      reflectionOutcome:
        "successful",
      learningEntryIds: [],
      learningCount: 0,
    },

    "decision-memory.learning-created": {
      memoryStatus:
        "learning-created",
      decisionStatus:
        "completed",
      outcomeStatus:
        "positive",
      reflectionOutcome:
        "successful",
      learningEntryIds: [
        "learning-1",
      ],
      learningCount: 1,
    },

    "decision-memory.closed": {
      memoryStatus:
        "closed",
      decisionStatus:
        "completed",
      outcomeStatus:
        "positive",
      reflectionOutcome:
        "successful",
      learningEntryIds: [
        "learning-1",
      ],
      learningCount: 1,
    },
  } as const;

  const stage =
    stages[type];

  return {
    userId: "user-1",
    type,
    category: "system",
    source:
      "apex-decision-memory",
    schemaVersion: 1,

    payload: {
      eventId,
      correlationId:
        "memory-1",
      causationId: null,

      memoryId:
        "memory-1",
      decisionId:
        "decision-1",
      decisionType:
        "daily-coaching",
      priority: "train",

      memoryStatus:
        stage.memoryStatus,
      decisionStatus:
        stage.decisionStatus,

      reasoningTone:
        "measured",
      reasoningConfidence:
        76,
      evidenceSufficient:
        true,
      requiresMoreEvidence:
        false,

      outcomeStatus:
        stage.outcomeStatus,
      reflectionOutcome:
        stage.reflectionOutcome,

      learningEntryIds: [
        ...stage.learningEntryIds,
      ],
      learningCount:
        stage.learningCount,

      memorySchemaVersion: 1,
    },

    occurredAt:
      new Date(occurredAt),
  };
}

const created =
  createEvent({
    type:
      "decision-memory.created",
    eventId:
      "event-1",
    occurredAt:
      "2026-08-05T09:00:00Z",
  });

const outcome =
  createEvent({
    type:
      "decision-memory.outcome-recorded",
    eventId:
      "event-2",
    occurredAt:
      "2026-08-05T10:00:00Z",
  });

const reflection =
  createEvent({
    type:
      "decision-memory.reflection-recorded",
    eventId:
      "event-3",
    occurredAt:
      "2026-08-05T11:00:00Z",
  });

const learning =
  createEvent({
    type:
      "decision-memory.learning-created",
    eventId:
      "event-4",
    occurredAt:
      "2026-08-05T12:00:00Z",
  });

const closed =
  createEvent({
    type:
      "decision-memory.closed",
    eventId:
      "event-5",
    occurredAt:
      "2026-08-05T13:00:00Z",
  });

const complete =
  replayDecisionMemoryEvents([
    learning,
    created,
    closed,
    reflection,
    outcome,
  ]);

if (
  !complete.success ||
  !complete.completeLifecycle ||
  complete.state.stage !==
    "closed" ||
  complete.state.eventCount !==
    5
) {
  throw new Error(
    "Replay should sort and rebuild a complete Decision Memory lifecycle.",
  );
}

if (
  complete.state
    .appliedEventIds.join(",") !==
  "event-1,event-2,event-3,event-4,event-5"
) {
  throw new Error(
    "Replay should apply events in deterministic chronological order.",
  );
}

if (
  complete.state
    .learningEntryIds[0] !==
    "learning-1" ||
  complete.state
    .outcomeStatus !==
    "positive" ||
  complete.state
    .reflectionOutcome !==
    "successful"
) {
  throw new Error(
    "Replay should preserve the latest reliable lifecycle state.",
  );
}

const openReplay =
  replayDecisionMemoryEvents([
    created,
    outcome,
  ]);

if (
  !openReplay.success ||
  openReplay.completeLifecycle ||
  openReplay.state.stage !==
    "outcome-recorded"
) {
  throw new Error(
    "Open histories should replay successfully without being marked complete.",
  );
}

const emptyReplay =
  replayDecisionMemoryEvents(
    [],
  );

if (
  emptyReplay.success ||
  emptyReplay.issues[0]
    ?.code !== "empty-history"
) {
  throw new Error(
    "Empty event histories should be rejected.",
  );
}

const duplicateReplay =
  replayDecisionMemoryEvents([
    created,
    {
      ...outcome,
      payload: {
        ...outcome.payload,
        eventId:
          created.payload.eventId,
      },
    },
  ]);

if (
  duplicateReplay.success ||
  !duplicateReplay.issues.some(
    (issue) =>
      issue.code ===
      "duplicate-event-id",
  )
) {
  throw new Error(
    "Duplicate event identifiers should be rejected.",
  );
}

const missingCreated =
  replayDecisionMemoryEvents([
    outcome,
  ]);

if (
  missingCreated.success ||
  !missingCreated.issues.some(
    (issue) =>
      issue.code ===
      "missing-created-event",
  )
) {
  throw new Error(
    "Replay histories must begin with a created event.",
  );
}

const invalidOrder =
  replayDecisionMemoryEvents([
    created,
    learning,
  ]);

if (
  invalidOrder.success ||
  !invalidOrder.issues.some(
    (issue) =>
      issue.code ===
      "invalid-lifecycle-transition",
  )
) {
  throw new Error(
    "Replay should reject skipped lifecycle stages.",
  );
}

const afterClose =
  replayDecisionMemoryEvents([
    created,
    closed,
    {
      ...outcome,
      occurredAt:
        new Date(
          "2026-08-05T14:00:00Z",
        ),
    },
  ]);

if (
  afterClose.success ||
  !afterClose.issues.some(
    (issue) =>
      issue.code ===
      "event-after-close",
  )
) {
  throw new Error(
    "Replay should reject events after closure.",
  );
}

const mixedUser =
  replayDecisionMemoryEvents([
    created,
    {
      ...outcome,
      userId: "user-2",
    },
  ]);

if (
  mixedUser.success ||
  !mixedUser.issues.some(
    (issue) =>
      issue.code ===
      "mixed-user",
  )
) {
  throw new Error(
    "Replay should reject mixed-user histories.",
  );
}

const mixedMemory =
  replayDecisionMemoryEvents([
    created,
    {
      ...outcome,
      payload: {
        ...outcome.payload,
        memoryId:
          "memory-2",
      },
    },
  ]);

if (
  mixedMemory.success ||
  !mixedMemory.issues.some(
    (issue) =>
      issue.code ===
      "mixed-memory",
  )
) {
  throw new Error(
    "Replay should reject mixed-memory histories.",
  );
}

const changedPriority =
  replayDecisionMemoryEvents([
    created,
    {
      ...outcome,
      payload: {
        ...outcome.payload,
        priority:
          "recover",
      },
    },
  ]);

if (
  changedPriority.success ||
  !changedPriority.issues.some(
    (issue) =>
      issue.code ===
      "priority-changed",
  )
) {
  throw new Error(
    "Replay should reject immutable decision fields changing.",
  );
}

const malformed =
  replayDecisionMemoryEvents([
    {
      ...created,
      schemaVersion: 99,
    },
  ]);

if (
  malformed.success ||
  !malformed.issues.some(
    (issue) =>
      issue.code.includes(
        "unsupported-schema-version",
      ),
  )
) {
  throw new Error(
    "Replay should reject individually invalid events.",
  );
}

const sameTimestampCreated = {
  ...created,
  payload: {
    ...created.payload,
    eventId: "a-created",
  },
};

const sameTimestampOutcome = {
  ...outcome,
  occurredAt:
    sameTimestampCreated
      .occurredAt,
  payload: {
    ...outcome.payload,
    eventId: "b-outcome",
  },
};

const deterministic =
  replayDecisionMemoryEvents([
    sameTimestampOutcome,
    sameTimestampCreated,
  ]);

if (
  !deterministic.success ||
  deterministic.orderedEvents[0]
    ?.payload.eventId !==
    "a-created"
) {
  throw new Error(
    "Replay should use event ID as the deterministic timestamp tie-breaker.",
  );
}

console.log(
  "Decision Memory Event Replay Engine test passed.",
);
