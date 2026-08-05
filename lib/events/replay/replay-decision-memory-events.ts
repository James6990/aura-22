import type {
  DecisionMemoryDomainEvent,
  DecisionMemoryEventPayload,
  DecisionMemoryEventType,
} from "@/lib/events/contracts";
import {
  validateDecisionMemoryEvent,
  type EventValidationIssue,
} from "@/lib/events/validation";

export type DecisionMemoryReplayIssue = {
  eventId: string | null;
  eventIndex: number | null;
  code: string;
  message: string;
};

export type DecisionMemoryReplayStage =
  | "empty"
  | "created"
  | "outcome-recorded"
  | "reflection-recorded"
  | "learning-created"
  | "closed";

export type ReplayedDecisionMemoryState = {
  userId: string;
  memoryId: string;
  decisionId: string;
  correlationId: string;

  decisionType: string;
  priority: string;

  memoryStatus: string;
  decisionStatus: string;

  reasoningTone: string;
  reasoningConfidence: number;
  evidenceSufficient: boolean;
  requiresMoreEvidence: boolean;

  outcomeStatus: string | null;
  reflectionOutcome: string | null;

  learningEntryIds: string[];
  learningCount: number;

  memorySchemaVersion: number;
  eventSchemaVersion: number;

  stage: DecisionMemoryReplayStage;
  closed: boolean;

  firstOccurredAt: Date;
  lastOccurredAt: Date;

  appliedEventIds: string[];
  appliedEventTypes:
    DecisionMemoryEventType[];

  eventCount: number;
};

export type DecisionMemoryReplayResult =
  | {
      success: true;
      state:
        ReplayedDecisionMemoryState;
      orderedEvents:
        DecisionMemoryDomainEvent[];
      issues: [];
      completeLifecycle: boolean;
      summary: string;
    }
  | {
      success: false;
      state: null;
      orderedEvents:
        DecisionMemoryDomainEvent[];
      issues:
        DecisionMemoryReplayIssue[];
      completeLifecycle: false;
      summary: string;
    };

const allowedNextEvents:
  Record<
    DecisionMemoryReplayStage,
    readonly DecisionMemoryEventType[]
  > = {
    empty: [
      "decision-memory.created",
    ],

    created: [
      "decision-memory.outcome-recorded",
      "decision-memory.closed",
    ],

    "outcome-recorded": [
      "decision-memory.reflection-recorded",
      "decision-memory.closed",
    ],

    "reflection-recorded": [
      "decision-memory.learning-created",
      "decision-memory.closed",
    ],

    "learning-created": [
      "decision-memory.closed",
    ],

    closed: [],
  };

function getStageForEvent(
  type: DecisionMemoryEventType,
): DecisionMemoryReplayStage {
  switch (type) {
    case "decision-memory.created":
      return "created";

    case "decision-memory.outcome-recorded":
      return "outcome-recorded";

    case "decision-memory.reflection-recorded":
      return "reflection-recorded";

    case "decision-memory.learning-created":
      return "learning-created";

    case "decision-memory.closed":
      return "closed";
  }
}

function compareEvents(
  a: DecisionMemoryDomainEvent,
  b: DecisionMemoryDomainEvent,
) {
  const timeDifference =
    a.occurredAt.getTime() -
    b.occurredAt.getTime();

  if (timeDifference !== 0) {
    return timeDifference;
  }

  return a.payload.eventId.localeCompare(
    b.payload.eventId,
  );
}

function toReplayIssue({
  validationIssue,
  eventIndex,
  eventId,
}: {
  validationIssue:
    EventValidationIssue;
  eventIndex: number;
  eventId: string | null;
}): DecisionMemoryReplayIssue {
  return {
    eventId,
    eventIndex,
    code:
      `invalid-event:${validationIssue.code}`,
    message:
      `${validationIssue.path}: ${validationIssue.message}`,
  };
}

function createState(
  event: DecisionMemoryDomainEvent,
): ReplayedDecisionMemoryState {
  const payload = event.payload;

  return {
    userId:
      event.userId,

    memoryId:
      payload.memoryId,

    decisionId:
      payload.decisionId,

    correlationId:
      payload.correlationId,

    decisionType:
      payload.decisionType,

    priority:
      payload.priority,

    memoryStatus:
      payload.memoryStatus,

    decisionStatus:
      payload.decisionStatus,

    reasoningTone:
      payload.reasoningTone,

    reasoningConfidence:
      payload.reasoningConfidence,

    evidenceSufficient:
      payload.evidenceSufficient,

    requiresMoreEvidence:
      payload.requiresMoreEvidence,

    outcomeStatus:
      payload.outcomeStatus,

    reflectionOutcome:
      payload.reflectionOutcome,

    learningEntryIds: [
      ...payload.learningEntryIds,
    ],

    learningCount:
      payload.learningCount,

    memorySchemaVersion:
      payload.memorySchemaVersion,

    eventSchemaVersion:
      event.schemaVersion,

    stage:
      getStageForEvent(
        event.type,
      ),

    closed:
      event.type ===
      "decision-memory.closed",

    firstOccurredAt:
      event.occurredAt,

    lastOccurredAt:
      event.occurredAt,

    appliedEventIds: [
      payload.eventId,
    ],

    appliedEventTypes: [
      event.type,
    ],

    eventCount: 1,
  };
}

function applyEvent({
  state,
  event,
}: {
  state:
    ReplayedDecisionMemoryState;
  event:
    DecisionMemoryDomainEvent;
}): ReplayedDecisionMemoryState {
  const payload = event.payload;

  return {
    ...state,

    decisionType:
      payload.decisionType,

    priority:
      payload.priority,

    memoryStatus:
      payload.memoryStatus,

    decisionStatus:
      payload.decisionStatus,

    reasoningTone:
      payload.reasoningTone,

    reasoningConfidence:
      payload.reasoningConfidence,

    evidenceSufficient:
      payload.evidenceSufficient,

    requiresMoreEvidence:
      payload.requiresMoreEvidence,

    outcomeStatus:
      payload.outcomeStatus,

    reflectionOutcome:
      payload.reflectionOutcome,

    learningEntryIds: [
      ...payload.learningEntryIds,
    ],

    learningCount:
      payload.learningCount,

    memorySchemaVersion:
      payload.memorySchemaVersion,

    eventSchemaVersion:
      event.schemaVersion,

    stage:
      getStageForEvent(
        event.type,
      ),

    closed:
      event.type ===
      "decision-memory.closed",

    lastOccurredAt:
      event.occurredAt,

    appliedEventIds: [
      ...state.appliedEventIds,
      payload.eventId,
    ],

    appliedEventTypes: [
      ...state.appliedEventTypes,
      event.type,
    ],

    eventCount:
      state.eventCount + 1,
  };
}

function addIdentityIssues({
  state,
  event,
  eventIndex,
  issues,
}: {
  state:
    ReplayedDecisionMemoryState;
  event:
    DecisionMemoryDomainEvent;
  eventIndex: number;
  issues:
    DecisionMemoryReplayIssue[];
}) {
  const checks = [
    {
      actual:
        event.userId,
      expected:
        state.userId,
      code:
        "mixed-user",
      label:
        "userId",
    },
    {
      actual:
        event.payload.memoryId,
      expected:
        state.memoryId,
      code:
        "mixed-memory",
      label:
        "memoryId",
    },
    {
      actual:
        event.payload.decisionId,
      expected:
        state.decisionId,
      code:
        "mixed-decision",
      label:
        "decisionId",
    },
    {
      actual:
        event.payload.correlationId,
      expected:
        state.correlationId,
      code:
        "mixed-correlation",
      label:
        "correlationId",
    },
  ];

  for (const check of checks) {
    if (
      check.actual !==
      check.expected
    ) {
      issues.push({
        eventId:
          event.payload.eventId,
        eventIndex,
        code:
          check.code,
        message:
          `${check.label} "${check.actual}" does not match replay identity "${check.expected}".`,
      });
    }
  }
}

function addInvariantIssues({
  state,
  event,
  eventIndex,
  issues,
}: {
  state:
    ReplayedDecisionMemoryState;
  event:
    DecisionMemoryDomainEvent;
  eventIndex: number;
  issues:
    DecisionMemoryReplayIssue[];
}) {
  const payload = event.payload;

  const checks = [
    {
      actual:
        payload.decisionType,
      expected:
        state.decisionType,
      code:
        "decision-type-changed",
      label:
        "decisionType",
    },
    {
      actual:
        payload.priority,
      expected:
        state.priority,
      code:
        "priority-changed",
      label:
        "priority",
    },
    {
      actual:
        payload.memorySchemaVersion,
      expected:
        state.memorySchemaVersion,
      code:
        "memory-schema-changed",
      label:
        "memorySchemaVersion",
    },
  ];

  for (const check of checks) {
    if (
      check.actual !==
      check.expected
    ) {
      issues.push({
        eventId:
          payload.eventId,
        eventIndex,
        code:
          check.code,
        message:
          `${check.label} changed from "${check.expected}" to "${check.actual}" during replay.`,
      });
    }
  }
}

function validateLifecycleTransition({
  stage,
  event,
  eventIndex,
  issues,
}: {
  stage:
    DecisionMemoryReplayStage;
  event:
    DecisionMemoryDomainEvent;
  eventIndex: number;
  issues:
    DecisionMemoryReplayIssue[];
}) {
  const allowed =
    allowedNextEvents[stage];

  if (
    !allowed.includes(
      event.type,
    )
  ) {
    issues.push({
      eventId:
        event.payload.eventId,
      eventIndex,
      code:
        stage === "closed"
          ? "event-after-close"
          : "invalid-lifecycle-transition",
      message:
        `Event "${event.type}" cannot follow replay stage "${stage}".`,
    });
  }
}

export function replayDecisionMemoryEvents(
  values: readonly unknown[],
): DecisionMemoryReplayResult {
  if (values.length === 0) {
    return {
      success: false,
      state: null,
      orderedEvents: [],
      issues: [
        {
          eventId: null,
          eventIndex: null,
          code:
            "empty-history",
          message:
            "Decision Memory replay requires at least one event.",
        },
      ],
      completeLifecycle: false,
      summary:
        "No Decision Memory events were available to replay.",
    };
  }

  const validationIssues:
    DecisionMemoryReplayIssue[] = [];

  const validatedEvents:
    DecisionMemoryDomainEvent[] =
      [];

  for (
    let index = 0;
    index < values.length;
    index += 1
  ) {
    const value = values[index];

    const result =
      validateDecisionMemoryEvent(
        value,
      );

    if (!result.valid) {
      const eventId =
        typeof value === "object" &&
        value !== null &&
        "payload" in value &&
        typeof value.payload ===
          "object" &&
        value.payload !== null &&
        "eventId" in
          value.payload &&
        typeof value.payload
          .eventId === "string"
          ? value.payload.eventId
          : null;

      validationIssues.push(
        ...result.issues.map(
          (validationIssue) =>
            toReplayIssue({
              validationIssue,
              eventIndex: index,
              eventId,
            }),
        ),
      );

      continue;
    }

    validatedEvents.push(
      result.event,
    );
  }

  const orderedEvents = [
    ...validatedEvents,
  ].sort(compareEvents);

  if (
    validationIssues.length >
    0
  ) {
    return {
      success: false,
      state: null,
      orderedEvents,
      issues:
        validationIssues,
      completeLifecycle: false,
      summary:
        "Decision Memory replay stopped because one or more events were invalid.",
    };
  }

  const replayIssues:
    DecisionMemoryReplayIssue[] = [];

  const seenEventIds =
    new Set<string>();

  for (
    let index = 0;
    index <
    orderedEvents.length;
    index += 1
  ) {
    const event =
      orderedEvents[index];

    const eventId =
      event.payload.eventId;

    if (
      seenEventIds.has(
        eventId,
      )
    ) {
      replayIssues.push({
        eventId,
        eventIndex: index,
        code:
          "duplicate-event-id",
        message:
          `Event id "${eventId}" occurs more than once in the replay history.`,
      });
    }

    seenEventIds.add(
      eventId,
    );
  }

  const firstEvent =
    orderedEvents[0];

  if (
    firstEvent.type !==
    "decision-memory.created"
  ) {
    replayIssues.push({
      eventId:
        firstEvent.payload.eventId,
      eventIndex: 0,
      code:
        "missing-created-event",
      message:
        "Decision Memory replay must begin with a created event.",
    });
  }

  let state =
    createState(firstEvent);

  for (
    let index = 1;
    index <
    orderedEvents.length;
    index += 1
  ) {
    const event =
      orderedEvents[index];

    addIdentityIssues({
      state,
      event,
      eventIndex: index,
      issues:
        replayIssues,
    });

    addInvariantIssues({
      state,
      event,
      eventIndex: index,
      issues:
        replayIssues,
    });

    validateLifecycleTransition({
      stage:
        state.stage,
      event,
      eventIndex: index,
      issues:
        replayIssues,
    });

    state = applyEvent({
      state,
      event,
    });
  }

  if (
    replayIssues.length >
    0
  ) {
    return {
      success: false,
      state: null,
      orderedEvents,
      issues:
        replayIssues,
      completeLifecycle: false,
      summary:
        "Decision Memory replay failed because the event history was inconsistent.",
    };
  }

  const completeLifecycle =
    state.stage === "closed";

  return {
    success: true,
    state,
    orderedEvents,
    issues: [],
    completeLifecycle,

    summary:
      completeLifecycle
        ? `Replayed ${state.eventCount} Decision Memory events through a complete closed lifecycle.`
        : `Replayed ${state.eventCount} Decision Memory events through stage "${state.stage}". The lifecycle remains open.`,
  };
}
