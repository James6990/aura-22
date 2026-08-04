import type {
  DecisionMemoryEventSink,
} from "@/lib/apex-core/create-decision-memory-event-publisher";
import type {
  DecisionMemoryDomainEvent,
} from "@/lib/events/contracts";
import {
  createValidatingDecisionMemoryEventSink,
} from "./create-validating-decision-memory-event-sink";

const validEvent:
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
      memoryId: "memory-1",
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

    occurredAt:
      new Date(
        "2026-08-04T18:00:00Z",
      ),
  };

async function main() {
  const received:
    DecisionMemoryDomainEvent[] =
      [];

  const innerSink:
    DecisionMemoryEventSink = {
      async publish(event) {
        received.push(event);
      },
    };

  const validatingSink =
    createValidatingDecisionMemoryEventSink(
      innerSink,
    );

  await validatingSink.publish(
    validEvent,
  );

  if (
    received.length !== 1 ||
    received[0] !== validEvent
  ) {
    throw new Error(
      "Validating sink should forward valid events unchanged.",
    );
  }

  let invalidRejected = false;

  try {
    await validatingSink.publish({
      ...validEvent,
      schemaVersion: 99,
    } as DecisionMemoryDomainEvent);
  } catch {
    invalidRejected = true;
  }

  if (!invalidRejected) {
    throw new Error(
      "Validating sink should reject malformed events.",
    );
  }

  if (received.length !== 1) {
    throw new Error(
      "Invalid events must not reach the wrapped sink.",
    );
  }

  console.log(
    "Validating Decision Memory Event Sink test passed.",
  );
}

main().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
