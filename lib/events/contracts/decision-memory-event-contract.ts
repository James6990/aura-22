import type {
  ApexDomainEvent,
  ApexDomainEventPayload,
  ApexEventContract,
} from "./apex-domain-event";

export const decisionMemoryEventSchemaVersion =
  1 as const;

export const decisionMemoryEventSource =
  "apex-decision-memory" as const;

export const decisionMemoryEventCategory =
  "system" as const;

export const decisionMemoryEventTypes = [
  "decision-memory.created",
  "decision-memory.outcome-recorded",
  "decision-memory.reflection-recorded",
  "decision-memory.learning-created",
  "decision-memory.closed",
] as const;

export type DecisionMemoryEventType =
  typeof decisionMemoryEventTypes[number];

export type DecisionMemoryEventPayload = {
  eventId: string;
  correlationId: string;
  causationId: string | null;

  memoryId: string;
  decisionId: string;
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
} & ApexDomainEventPayload;

export type DecisionMemoryDomainEvent =
  ApexDomainEvent<
    DecisionMemoryEventType,
    typeof decisionMemoryEventCategory,
    typeof decisionMemoryEventSource,
    DecisionMemoryEventPayload
  >;

export const decisionMemoryEventContracts:
  Record<
    DecisionMemoryEventType,
    ApexEventContract<
      DecisionMemoryEventType,
      typeof decisionMemoryEventCategory,
      typeof decisionMemoryEventSource
    >
  > = {
    "decision-memory.created": {
      type:
        "decision-memory.created",
      category:
        decisionMemoryEventCategory,
      source:
        decisionMemoryEventSource,
      schemaVersion:
        decisionMemoryEventSchemaVersion,
      description:
        "A new Apex decision memory was created.",
    },

    "decision-memory.outcome-recorded": {
      type:
        "decision-memory.outcome-recorded",
      category:
        decisionMemoryEventCategory,
      source:
        decisionMemoryEventSource,
      schemaVersion:
        decisionMemoryEventSchemaVersion,
      description:
        "Outcome evidence was recorded for an Apex decision memory.",
    },

    "decision-memory.reflection-recorded": {
      type:
        "decision-memory.reflection-recorded",
      category:
        decisionMemoryEventCategory,
      source:
        decisionMemoryEventSource,
      schemaVersion:
        decisionMemoryEventSchemaVersion,
      description:
        "A reflection was recorded for an Apex decision memory.",
    },

    "decision-memory.learning-created": {
      type:
        "decision-memory.learning-created",
      category:
        decisionMemoryEventCategory,
      source:
        decisionMemoryEventSource,
      schemaVersion:
        decisionMemoryEventSchemaVersion,
      description:
        "Learning entries were created from an Apex decision memory.",
    },

    "decision-memory.closed": {
      type:
        "decision-memory.closed",
      category:
        decisionMemoryEventCategory,
      source:
        decisionMemoryEventSource,
      schemaVersion:
        decisionMemoryEventSchemaVersion,
      description:
        "An Apex decision memory completed its lifecycle and was closed.",
    },
  };

export function isDecisionMemoryEventType(
  value: string,
): value is DecisionMemoryEventType {
  return (
    decisionMemoryEventTypes as readonly string[]
  ).includes(value);
}

export function getDecisionMemoryEventContract(
  type: DecisionMemoryEventType,
) {
  return decisionMemoryEventContracts[
    type
  ];
}
