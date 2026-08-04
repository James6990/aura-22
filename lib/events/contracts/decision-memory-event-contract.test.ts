import {
  decisionMemoryEventCategory,
  decisionMemoryEventContracts,
  decisionMemoryEventSchemaVersion,
  decisionMemoryEventSource,
  decisionMemoryEventTypes,
  getDecisionMemoryEventContract,
  isDecisionMemoryEventType,
} from "./decision-memory-event-contract";

if (
  decisionMemoryEventSchemaVersion !==
  1
) {
  throw new Error(
    "Decision Memory event schema should begin at version one.",
  );
}

if (
  decisionMemoryEventCategory !==
  "system"
) {
  throw new Error(
    "Decision Memory events should use the system category.",
  );
}

if (
  decisionMemoryEventSource !==
  "apex-decision-memory"
) {
  throw new Error(
    "Decision Memory events should use the canonical source.",
  );
}

if (
  decisionMemoryEventTypes.length !==
  5
) {
  throw new Error(
    "Expected five Decision Memory lifecycle event types.",
  );
}

for (
  const type of
  decisionMemoryEventTypes
) {
  const contract =
    getDecisionMemoryEventContract(
      type,
    );

  if (
    contract.type !== type ||
    contract.category !==
      decisionMemoryEventCategory ||
    contract.source !==
      decisionMemoryEventSource ||
    contract.schemaVersion !==
      decisionMemoryEventSchemaVersion
  ) {
    throw new Error(
      `Event contract for ${type} is inconsistent.`,
    );
  }

  if (
    !contract.description.trim()
  ) {
    throw new Error(
      `Event contract for ${type} requires a description.`,
    );
  }

  if (
    !isDecisionMemoryEventType(
      type,
    )
  ) {
    throw new Error(
      `${type} should be recognised as a Decision Memory event type.`,
    );
  }
}

if (
  isDecisionMemoryEventType(
    "decision-memory.unknown",
  )
) {
  throw new Error(
    "Unknown event types must not be accepted by the contract registry.",
  );
}

if (
  Object.keys(
    decisionMemoryEventContracts,
  ).length !==
  decisionMemoryEventTypes.length
) {
  throw new Error(
    "Every Decision Memory event type should have exactly one contract.",
  );
}

console.log(
  "Decision Memory Event Contract test passed.",
);
