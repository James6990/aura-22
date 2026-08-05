import type {
  DecisionMemoryDomainEvent,
} from "@/lib/events/contracts";
import {
  hydrateDecisionMemoryEventFromSync,
  serializeDecisionMemoryEventForSync,
  type DecisionMemoryEventSyncEnvelope,
} from "./decision-memory-sync-contract";
import {
  apexSyncSchemaVersion,
} from "./apex-sync-contract";

const occurredAt =
  new Date(
    "2026-08-05T14:00:00Z",
  );

const event:
  DecisionMemoryDomainEvent = {
    userId: "user-1",

    type:
      "decision-memory.created",

    category: "system",

    source:
      "apex-decision-memory",

    schemaVersion: 1,

    payload: {
      eventId: "event-1",
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
      reasoningConfidence: 76,
      evidenceSufficient: true,
      requiresMoreEvidence:
        false,

      outcomeStatus: null,
      reflectionOutcome: null,

      learningEntryIds: [],
      learningCount: 0,

      memorySchemaVersion: 1,
    },

    occurredAt,
  };

const serialized =
  serializeDecisionMemoryEventForSync(
    event,
  );

if (
  typeof serialized
    .occurredAt !== "string" ||
  serialized.occurredAt !==
    occurredAt.toISOString()
) {
  throw new Error(
    "Cloud Sync should serialize Decision Memory event dates.",
  );
}

const hydrated =
  hydrateDecisionMemoryEventFromSync(
    serialized,
  );

if (
  !(
    hydrated.occurredAt
    instanceof Date
  ) ||
  hydrated.occurredAt
    .getTime() !==
    occurredAt.getTime()
) {
  throw new Error(
    "Cloud Sync should hydrate Decision Memory event dates.",
  );
}

const envelope:
  DecisionMemoryEventSyncEnvelope = {
    id:
      "sync-envelope-1",

    userId:
      event.userId,

    deviceId:
      "device-1",

    entityType:
      "decision-memory-event",

    entityId:
      event.payload.eventId,

    operation:
      "append",

    sequence: 1,

    payload:
      serialized,

    schemaVersion:
      apexSyncSchemaVersion,

    occurredAt:
      serialized.occurredAt,

    createdAt:
      "2026-08-05T14:00:01.000Z",
  };

if (
  envelope.operation !==
    "append" ||
  envelope.entityId !==
    event.payload.eventId
) {
  throw new Error(
    "Decision Memory events should use append-only sync envelopes.",
  );
}

let invalidDateRejected =
  false;

try {
  hydrateDecisionMemoryEventFromSync({
    ...serialized,
    occurredAt:
      "not-a-date",
  });
} catch {
  invalidDateRejected = true;
}

if (!invalidDateRejected) {
  throw new Error(
    "Cloud Sync should reject invalid synchronized event dates.",
  );
}

console.log(
  "Decision Memory Cloud Sync Contract test passed.",
);
