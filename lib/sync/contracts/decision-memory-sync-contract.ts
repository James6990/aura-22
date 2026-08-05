import type {
  DecisionMemoryDomainEvent,
} from "@/lib/events/contracts";
import type {
  ApexSyncEnvelope,
} from "./apex-sync-contract";

export type SerializedDecisionMemoryDomainEvent =
  Omit<
    DecisionMemoryDomainEvent,
    "occurredAt"
  > & {
    occurredAt: string;
  };

export type DecisionMemoryEventSyncEnvelope =
  ApexSyncEnvelope<
    SerializedDecisionMemoryDomainEvent
  > & {
    entityType:
      "decision-memory-event";

    operation:
      "append";
  };

export function serializeDecisionMemoryEventForSync(
  event:
    DecisionMemoryDomainEvent,
): SerializedDecisionMemoryDomainEvent {
  if (
    !(event.occurredAt instanceof Date) ||
    Number.isNaN(
      event.occurredAt.getTime(),
    )
  ) {
    throw new Error(
      "Decision Memory sync event requires a valid occurrence date.",
    );
  }

  return {
    ...event,

    payload: {
      ...event.payload,

      learningEntryIds: [
        ...event.payload
          .learningEntryIds,
      ],
    },

    occurredAt:
      event.occurredAt
        .toISOString(),
  };
}

export function hydrateDecisionMemoryEventFromSync(
  event:
    SerializedDecisionMemoryDomainEvent,
): DecisionMemoryDomainEvent {
  const occurredAt =
    new Date(
      event.occurredAt,
    );

  if (
    !event.occurredAt.trim() ||
    Number.isNaN(
      occurredAt.getTime(),
    )
  ) {
    throw new Error(
      "Synchronized Decision Memory event contains an invalid occurrence date.",
    );
  }

  return {
    ...event,

    payload: {
      ...event.payload,

      learningEntryIds: [
        ...event.payload
          .learningEntryIds,
      ],
    },

    occurredAt,
  };
}
