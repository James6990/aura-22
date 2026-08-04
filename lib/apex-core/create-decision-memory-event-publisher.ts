import type {
  ApexDecisionMemory,
} from "./create-decision-memory";
import {
  decisionMemoryEventCategory,
  decisionMemoryEventSchemaVersion,
  decisionMemoryEventSource,
  type DecisionMemoryDomainEvent,
  type DecisionMemoryEventPayload,
  type DecisionMemoryEventType,
} from "@/lib/events/contracts";

export type {
  DecisionMemoryDomainEvent,
  DecisionMemoryEventPayload,
  DecisionMemoryEventType,
} from "@/lib/events/contracts";

export type DecisionMemoryEventSink = {
  publish(
    event: DecisionMemoryDomainEvent,
  ): Promise<void>;
};

export type DecisionMemoryEventMetadata = {
  eventId: string;
  correlationId?: string | null;
  causationId?: string | null;
  occurredAt?: Date;
};

export type DecisionMemoryEventPublisher = {
  publishCreated({
    memory,
    metadata,
  }: {
    memory: ApexDecisionMemory;
    metadata:
      DecisionMemoryEventMetadata;
  }): Promise<DecisionMemoryDomainEvent>;

  publishOutcomeRecorded({
    memory,
    metadata,
  }: {
    memory: ApexDecisionMemory;
    metadata:
      DecisionMemoryEventMetadata;
  }): Promise<DecisionMemoryDomainEvent>;

  publishReflectionRecorded({
    memory,
    metadata,
  }: {
    memory: ApexDecisionMemory;
    metadata:
      DecisionMemoryEventMetadata;
  }): Promise<DecisionMemoryDomainEvent>;

  publishLearningCreated({
    memory,
    metadata,
  }: {
    memory: ApexDecisionMemory;
    metadata:
      DecisionMemoryEventMetadata;
  }): Promise<DecisionMemoryDomainEvent>;

  publishClosed({
    memory,
    metadata,
  }: {
    memory: ApexDecisionMemory;
    metadata:
      DecisionMemoryEventMetadata;
  }): Promise<DecisionMemoryDomainEvent>;
};

function requireIdentifier(
  value: string,
  label: string,
) {
  const resolved = value.trim();

  if (!resolved) {
    throw new Error(
      `${label} is required.`,
    );
  }

  return resolved;
}

function validateMemory(
  memory: ApexDecisionMemory,
) {
  requireIdentifier(
    memory.id,
    "Decision memory id",
  );

  requireIdentifier(
    memory.userId,
    "Decision memory user id",
  );

  if (
    memory.decision.userId !==
    memory.userId
  ) {
    throw new Error(
      "Decision memory event cannot publish cross-user decision data.",
    );
  }

  if (
    memory.reasoningTrace.trace
      .decisionId !==
    memory.decision.id
  ) {
    throw new Error(
      "Decision memory event requires a reasoning trace linked to the same decision.",
    );
  }
}

function createPayload({
  memory,
  metadata,
}: {
  memory: ApexDecisionMemory;
  metadata:
    DecisionMemoryEventMetadata;
}): DecisionMemoryEventPayload {
  return {
    eventId:
      requireIdentifier(
        metadata.eventId,
        "Decision memory event id",
      ),

    correlationId:
      metadata.correlationId
        ?.trim() || memory.id,

    causationId:
      metadata.causationId
        ?.trim() || null,

    memoryId:
      memory.id,

    decisionId:
      memory.decision.id,

    decisionType:
      memory.decision.decisionType,

    priority:
      memory.decision.priority,

    memoryStatus:
      memory.status,

    decisionStatus:
      memory.decision.status,

    reasoningTone:
      memory.reasoningTrace
        .reasoning.tone,

    reasoningConfidence:
      memory.reasoningTrace
        .trace.confidence,

    evidenceSufficient:
      memory.reasoningTrace
        .reasoning
        .evidenceSufficient,

    requiresMoreEvidence:
      memory.reasoningTrace
        .reasoning
        .requiresMoreEvidence,

    outcomeStatus:
      memory.outcome?.status ??
      null,

    reflectionOutcome:
      memory.reflection?.outcome ??
      null,

    learningEntryIds:
      memory.learningEntries.map(
        (learning) => learning.id,
      ),

    learningCount:
      memory.learningEntries.length,

    memorySchemaVersion:
      memory.schemaVersion,
  };
}

export function createDecisionMemoryEventPublisher(
  sink: DecisionMemoryEventSink,
): DecisionMemoryEventPublisher {
  async function publish({
    type,
    memory,
    metadata,
  }: {
    type: DecisionMemoryEventType;
    memory: ApexDecisionMemory;
    metadata:
      DecisionMemoryEventMetadata;
  }) {
    validateMemory(memory);

    const event:
      DecisionMemoryDomainEvent = {
        userId:
          memory.userId,

        type,

        category:
          decisionMemoryEventCategory,

        source:
          decisionMemoryEventSource,

        schemaVersion:
          decisionMemoryEventSchemaVersion,

        payload:
          createPayload({
            memory,
            metadata,
          }),

        occurredAt:
          metadata.occurredAt ??
          new Date(),
      };

    await sink.publish(event);

    return event;
  }

  return {
    publishCreated({
      memory,
      metadata,
    }) {
      return publish({
        type:
          "decision-memory.created",
        memory,
        metadata,
      });
    },

    publishOutcomeRecorded({
      memory,
      metadata,
    }) {
      if (!memory.outcome) {
        throw new Error(
          "Outcome-recorded event requires a decision outcome.",
        );
      }

      return publish({
        type:
          "decision-memory.outcome-recorded",
        memory,
        metadata,
      });
    },

    publishReflectionRecorded({
      memory,
      metadata,
    }) {
      if (!memory.reflection) {
        throw new Error(
          "Reflection-recorded event requires a decision reflection.",
        );
      }

      return publish({
        type:
          "decision-memory.reflection-recorded",
        memory,
        metadata,
      });
    },

    publishLearningCreated({
      memory,
      metadata,
    }) {
      if (
        memory.learningEntries.length ===
        0
      ) {
        throw new Error(
          "Learning-created event requires at least one learning entry.",
        );
      }

      return publish({
        type:
          "decision-memory.learning-created",
        memory,
        metadata,
      });
    },

    publishClosed({
      memory,
      metadata,
    }) {
      if (
        memory.status !== "closed" ||
        memory.closedAt === null
      ) {
        throw new Error(
          "Closed event requires a closed decision memory.",
        );
      }

      return publish({
        type:
          "decision-memory.closed",
        memory,
        metadata,
      });
    },
  };
}
