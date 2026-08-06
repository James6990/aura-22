import type {
  DecisionMemoryDomainEvent,
} from "@/lib/events/contracts";

import {
  apexSyncSchemaVersion,
  type DecisionMemoryEventSyncEnvelope,
  serializeDecisionMemoryEventForSync,
} from "@/lib/sync/contracts";

export type CreateDecisionMemorySyncEnvelopeInput = {
  event:
    DecisionMemoryDomainEvent;

  deviceId:
    string;

  sequence:
    number;

  createdAt:
    string;
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

function requireIsoDate(
  value: string,
  label: string,
) {
  const resolved =
    value.trim();

  const parsed =
    new Date(resolved);

  if (
    !resolved ||
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    throw new Error(
      `${label} must be a valid ISO date.`,
    );
  }

  return resolved;
}

export function createDecisionMemorySyncEnvelope({
  event,
  deviceId,
  sequence,
  createdAt,
}: CreateDecisionMemorySyncEnvelopeInput):
  DecisionMemoryEventSyncEnvelope {
  if (
    !Number.isInteger(sequence) ||
    sequence < 1
  ) {
    throw new Error(
      "Decision Memory sync sequence must be a positive integer.",
    );
  }

  const payload =
    serializeDecisionMemoryEventForSync(
      event,
    );

  return {
    id:
      requireIdentifier(
        event.payload.eventId,
        "Decision Memory sync envelope id",
      ),

    userId:
      requireIdentifier(
        event.userId,
        "Decision Memory sync user id",
      ),

    deviceId:
      requireIdentifier(
        deviceId,
        "Decision Memory sync device id",
      ),

    entityType:
      "decision-memory-event",

    entityId:
      requireIdentifier(
        event.payload.memoryId,
        "Decision Memory sync entity id",
      ),

    operation:
      "append",

    sequence,

    payload,

    schemaVersion:
      apexSyncSchemaVersion,

    occurredAt:
      payload.occurredAt,

    createdAt:
      requireIsoDate(
        createdAt,
        "Decision Memory sync createdAt",
      ),
  };
}
