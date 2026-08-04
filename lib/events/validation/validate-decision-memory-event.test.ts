import type {
  DecisionMemoryDomainEvent,
} from "@/lib/events/contracts";
import {
  assertValidDecisionMemoryEvent,
  validateDecisionMemoryEvent,
} from "./validate-decision-memory-event";

function createValidEvent():
  DecisionMemoryDomainEvent {
  return {
    userId: "user-1",

    type:
      "decision-memory.created",

    category: "system",

    source:
      "apex-decision-memory",

    schemaVersion: 1,

    payload: {
      eventId:
        "event-1",

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
        "awaiting-response",

      decisionStatus:
        "issued",

      reasoningTone:
        "measured",

      reasoningConfidence:
        76,

      evidenceSufficient:
        true,

      requiresMoreEvidence:
        false,

      outcomeStatus: null,

      reflectionOutcome: null,

      learningEntryIds: [],

      learningCount: 0,

      memorySchemaVersion: 1,
    },

    occurredAt:
      new Date(
        "2026-08-04T18:00:00Z",
      ),
  };
}

const validEvent =
  createValidEvent();

const validResult =
  validateDecisionMemoryEvent(
    validEvent,
  );

if (
  !validResult.valid ||
  validResult.event !==
    validEvent ||
  validResult.issues.length !== 0
) {
  throw new Error(
    "A canonical Decision Memory event should pass validation.",
  );
}

assertValidDecisionMemoryEvent(
  validEvent,
);

const invalidObject =
  validateDecisionMemoryEvent(
    null,
  );

if (
  invalidObject.valid ||
  invalidObject.issues[0]
    ?.code !== "invalid-event"
) {
  throw new Error(
    "Non-object event input should be rejected.",
  );
}

const invalidMetadata =
  validateDecisionMemoryEvent({
    ...validEvent,
    type:
      "decision-memory.unknown",
    category: "workout",
    source: "unknown-source",
    schemaVersion: 99,
    occurredAt:
      new Date("invalid"),
  });

if (
  invalidMetadata.valid
) {
  throw new Error(
    "Invalid event metadata should be rejected.",
  );
}

const invalidCodes =
  new Set(
    invalidMetadata.issues.map(
      (issue) => issue.code,
    ),
  );

for (const code of [
  "unsupported-event-type",
  "invalid-category",
  "invalid-source",
  "unsupported-schema-version",
  "invalid-date",
]) {
  if (
    !invalidCodes.has(code)
  ) {
    throw new Error(
      `Expected validation issue ${code}.`,
    );
  }
}

const invalidPayload =
  validateDecisionMemoryEvent({
    ...validEvent,

    payload: {
      ...validEvent.payload,

      eventId: " ",

      reasoningConfidence:
        120,

      evidenceSufficient:
        "yes",

      learningEntryIds: [
        "learning-1",
        "learning-1",
      ],

      learningCount: 1,

      memorySchemaVersion: 0,
    },
  });

if (invalidPayload.valid) {
  throw new Error(
    "Malformed payload fields should be rejected.",
  );
}

const payloadCodes =
  new Set(
    invalidPayload.issues.map(
      (issue) => issue.code,
    ),
  );

for (const code of [
  "required-string",
  "invalid-confidence",
  "invalid-boolean",
  "learning-count-mismatch",
  "duplicate-learning-id",
  "invalid-schema-version",
]) {
  if (
    !payloadCodes.has(code)
  ) {
    throw new Error(
      `Expected payload validation issue ${code}.`,
    );
  }
}

const invalidCreated =
  validateDecisionMemoryEvent({
    ...validEvent,

    payload: {
      ...validEvent.payload,
      outcomeStatus:
        "positive",
      reflectionOutcome:
        "successful",
      learningEntryIds: [
        "learning-1",
      ],
      learningCount: 1,
    },
  });

if (invalidCreated.valid) {
  throw new Error(
    "Created events must reject later lifecycle data.",
  );
}

const outcomeEvent:
  DecisionMemoryDomainEvent = {
    ...validEvent,

    type:
      "decision-memory.outcome-recorded",

    payload: {
      ...validEvent.payload,
      memoryStatus:
        "ready-for-reflection",
      decisionStatus:
        "completed",
      outcomeStatus:
        "positive",
    },
  };

if (
  !validateDecisionMemoryEvent(
    outcomeEvent,
  ).valid
) {
  throw new Error(
    "Outcome-recorded event with an outcome should pass.",
  );
}

const missingOutcome =
  validateDecisionMemoryEvent({
    ...outcomeEvent,

    payload: {
      ...outcomeEvent.payload,
      outcomeStatus: null,
    },
  });

if (
  missingOutcome.valid ||
  !missingOutcome.issues.some(
    (issue) =>
      issue.code ===
      "missing-outcome",
  )
) {
  throw new Error(
    "Outcome-recorded event without an outcome should fail.",
  );
}

const reflectionEvent:
  DecisionMemoryDomainEvent = {
    ...outcomeEvent,

    type:
      "decision-memory.reflection-recorded",

    payload: {
      ...outcomeEvent.payload,
      memoryStatus:
        "reflected",
      reflectionOutcome:
        "successful",
    },
  };

if (
  !validateDecisionMemoryEvent(
    reflectionEvent,
  ).valid
) {
  throw new Error(
    "Reflection-recorded event with reflection data should pass.",
  );
}

const learningEvent:
  DecisionMemoryDomainEvent = {
    ...reflectionEvent,

    type:
      "decision-memory.learning-created",

    payload: {
      ...reflectionEvent.payload,
      memoryStatus:
        "learning-created",
      learningEntryIds: [
        "learning-1",
      ],
      learningCount: 1,
    },
  };

if (
  !validateDecisionMemoryEvent(
    learningEvent,
  ).valid
) {
  throw new Error(
    "Learning-created event with learning data should pass.",
  );
}

const closedEvent:
  DecisionMemoryDomainEvent = {
    ...learningEvent,

    type:
      "decision-memory.closed",

    payload: {
      ...learningEvent.payload,
      memoryStatus:
        "closed",
    },
  };

if (
  !validateDecisionMemoryEvent(
    closedEvent,
  ).valid
) {
  throw new Error(
    "Closed event with closed memory status should pass.",
  );
}

const invalidClosedEvent = {
  ...closedEvent,

  payload: {
    ...closedEvent.payload,
    memoryStatus:
      "learning-created",
  },
};

const invalidClose =
  validateDecisionMemoryEvent(
    invalidClosedEvent,
  );

if (
  invalidClose.valid ||
  !invalidClose.issues.some(
    (issue) =>
      issue.code ===
      "memory-not-closed",
  )
) {
  throw new Error(
    "Closed event with an open status should fail.",
  );
}

let assertionRejected = false;

try {
  assertValidDecisionMemoryEvent(
    invalidClosedEvent,
  );
} catch (error) {
  assertionRejected =
    error instanceof Error &&
    error.message.includes(
      "memoryStatus",
    );
}

if (!assertionRejected) {
  throw new Error(
    "Validation assertion should throw a useful error.",
  );
}

console.log(
  "Decision Memory Event Validation test passed.",
);
