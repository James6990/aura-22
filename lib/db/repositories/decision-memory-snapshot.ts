import type {
  ApexDecisionMemory,
  DecisionMemoryStatus,
} from "@/lib/apex-core/create-decision-memory";

export type SerializedDecisionMemorySnapshot = {
  id: string;
  userId: string;

  decision: Omit<
    ApexDecisionMemory["decision"],
    "issuedAt" | "validUntil"
  > & {
    issuedAt: string;
    validUntil: string | null;
  };

  reasoningTrace: Omit<
    ApexDecisionMemory["reasoningTrace"],
    "trace"
  > & {
    trace: Omit<
      ApexDecisionMemory["reasoningTrace"]["trace"],
      "createdAt"
    > & {
      createdAt: string;
    };
  };

  outcome:
    | (
        Omit<
          NonNullable<
            ApexDecisionMemory["outcome"]
          >,
          "occurredAt"
        > & {
          occurredAt: string;
        }
      )
    | null;

  reflection:
    ApexDecisionMemory["reflection"];

  learningEntries: Array<
    Omit<
      ApexDecisionMemory["learningEntries"][number],
      "firstObservedAt" | "lastUpdatedAt"
    > & {
      firstObservedAt: string;
      lastUpdatedAt: string;
    }
  >;

  status:
    DecisionMemoryStatus;

  openedAt: string;
  lastUpdatedAt: string;
  closedAt: string | null;

  schemaVersion: number;
};

function toIsoString(
  value: Date,
  label: string,
) {
  if (
    !(value instanceof Date) ||
    Number.isNaN(value.getTime())
  ) {
    throw new Error(
      `${label} must be a valid Date.`,
    );
  }

  return value.toISOString();
}

function fromIsoString(
  value: string,
  label: string,
) {
  const date = new Date(value);

  if (
    !value.trim() ||
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      `${label} must contain a valid ISO date.`,
    );
  }

  return date;
}

function fromNullableIsoString(
  value: string | null,
  label: string,
) {
  return value === null
    ? null
    : fromIsoString(
        value,
        label,
      );
}

export function serializeDecisionMemory(
  memory: ApexDecisionMemory,
): SerializedDecisionMemorySnapshot {
  if (
    memory.decision.userId !==
    memory.userId
  ) {
    throw new Error(
      "Decision Memory snapshot cannot serialize cross-user decision data.",
    );
  }

  if (
    memory.outcome &&
    memory.outcome.userId !==
      memory.userId
  ) {
    throw new Error(
      "Decision Memory snapshot cannot serialize a cross-user outcome.",
    );
  }

  if (
    memory.learningEntries.some(
      (entry) =>
        entry.userId !==
        memory.userId,
    )
  ) {
    throw new Error(
      "Decision Memory snapshot cannot serialize cross-user learning.",
    );
  }

  return {
    id:
      memory.id,

    userId:
      memory.userId,

    decision: {
      ...memory.decision,

      coreReasons: [
        ...memory.decision
          .coreReasons,
      ],

      personalisedReasons: [
        ...memory.decision
          .personalisedReasons,
      ],

      issuedAt:
        toIsoString(
          memory.decision.issuedAt,
          "Decision issuedAt",
        ),

      validUntil:
        memory.decision.validUntil
          ? toIsoString(
              memory.decision
                .validUntil,
              "Decision validUntil",
            )
          : null,
    },

    reasoningTrace: {
      ...memory.reasoningTrace,

      trace: {
        ...memory.reasoningTrace.trace,

        reasons:
          memory.reasoningTrace
            .trace.reasons.map(
              (reason) => ({
                ...reason,
              }),
            ),

        createdAt:
          toIsoString(
            memory.reasoningTrace
              .trace.createdAt,
            "Reasoning trace createdAt",
          ),
      },

      reasoning: {
        ...memory.reasoningTrace
          .reasoning,

        checkedPriorities: [
          ...memory.reasoningTrace
            .reasoning
            .checkedPriorities,
        ],
      },
    },

    outcome:
      memory.outcome
        ? {
            ...memory.outcome,

            evidence: {
              ...memory.outcome
                .evidence,
            },

            occurredAt:
              toIsoString(
                memory.outcome
                  .occurredAt,
                "Decision outcome occurredAt",
              ),
          }
        : null,

    reflection:
      memory.reflection
        ? {
            ...memory.reflection,
          }
        : null,

    learningEntries:
      memory.learningEntries.map(
        (entry) => ({
          ...entry,

          sources:
            entry.sources.map(
              (source) => ({
                ...source,
              }),
            ),

          firstObservedAt:
            toIsoString(
              entry.firstObservedAt,
              "Learning firstObservedAt",
            ),

          lastUpdatedAt:
            toIsoString(
              entry.lastUpdatedAt,
              "Learning lastUpdatedAt",
            ),
        }),
      ),

    status:
      memory.status,

    openedAt:
      toIsoString(
        memory.openedAt,
        "Decision Memory openedAt",
      ),

    lastUpdatedAt:
      toIsoString(
        memory.lastUpdatedAt,
        "Decision Memory lastUpdatedAt",
      ),

    closedAt:
      memory.closedAt
        ? toIsoString(
            memory.closedAt,
            "Decision Memory closedAt",
          )
        : null,

    schemaVersion:
      memory.schemaVersion,
  };
}

export function hydrateDecisionMemory(
  snapshot:
    SerializedDecisionMemorySnapshot,
): ApexDecisionMemory {
  if (
    snapshot.decision.userId !==
    snapshot.userId
  ) {
    throw new Error(
      "Stored Decision Memory contains cross-user decision data.",
    );
  }

  if (
    snapshot.outcome &&
    snapshot.outcome.userId !==
      snapshot.userId
  ) {
    throw new Error(
      "Stored Decision Memory contains a cross-user outcome.",
    );
  }

  if (
    snapshot.learningEntries.some(
      (entry) =>
        entry.userId !==
        snapshot.userId,
    )
  ) {
    throw new Error(
      "Stored Decision Memory contains cross-user learning.",
    );
  }

  const memory:
    ApexDecisionMemory = {
      id:
        snapshot.id,

      userId:
        snapshot.userId,

      decision: {
        ...snapshot.decision,

        coreReasons: [
          ...snapshot.decision
            .coreReasons,
        ],

        personalisedReasons: [
          ...snapshot.decision
            .personalisedReasons,
        ],

        issuedAt:
          fromIsoString(
            snapshot.decision
              .issuedAt,
            "Decision issuedAt",
          ),

        validUntil:
          fromNullableIsoString(
            snapshot.decision
              .validUntil,
            "Decision validUntil",
          ),
      },

      reasoningTrace: {
        ...snapshot.reasoningTrace,

        trace: {
          ...snapshot.reasoningTrace
            .trace,

          reasons:
            snapshot.reasoningTrace
              .trace.reasons.map(
                (reason) => ({
                  ...reason,
                }),
              ),

          createdAt:
            fromIsoString(
              snapshot.reasoningTrace
                .trace.createdAt,
              "Reasoning trace createdAt",
            ),
        },

        reasoning: {
          ...snapshot.reasoningTrace
            .reasoning,

          checkedPriorities: [
            ...snapshot
              .reasoningTrace
              .reasoning
              .checkedPriorities,
          ],
        },
      },

      outcome:
        snapshot.outcome
          ? {
              ...snapshot.outcome,

              evidence: {
                ...snapshot.outcome
                  .evidence,
              },

              occurredAt:
                fromIsoString(
                  snapshot.outcome
                    .occurredAt,
                  "Decision outcome occurredAt",
                ),
            }
          : null,

      reflection:
        snapshot.reflection
          ? {
              ...snapshot.reflection,
            }
          : null,

      learningEntries:
        snapshot.learningEntries.map(
          (entry) => ({
            ...entry,

            sources:
              entry.sources.map(
                (source) => ({
                  ...source,
                }),
              ),

            firstObservedAt:
              fromIsoString(
                entry.firstObservedAt,
                "Learning firstObservedAt",
              ),

            lastUpdatedAt:
              fromIsoString(
                entry.lastUpdatedAt,
                "Learning lastUpdatedAt",
              ),
          }),
        ),

      status:
        snapshot.status,

      openedAt:
        fromIsoString(
          snapshot.openedAt,
          "Decision Memory openedAt",
        ),

      lastUpdatedAt:
        fromIsoString(
          snapshot.lastUpdatedAt,
          "Decision Memory lastUpdatedAt",
        ),

      closedAt:
        fromNullableIsoString(
          snapshot.closedAt,
          "Decision Memory closedAt",
        ),

      schemaVersion:
        snapshot.schemaVersion,
    };

  if (
    memory.reasoningTrace
      .trace.decisionId !==
    memory.decision.id
  ) {
    throw new Error(
      "Stored Decision Memory reasoning trace does not match its decision.",
    );
  }

  if (
    memory.reasoningTrace
      .trace.outcome !==
    memory.decision.priority
  ) {
    throw new Error(
      "Stored Decision Memory reasoning priority does not match its decision.",
    );
  }

  if (
    memory.status === "closed" &&
    memory.closedAt === null
  ) {
    throw new Error(
      "Stored closed Decision Memory requires a closing timestamp.",
    );
  }

  return memory;
}
