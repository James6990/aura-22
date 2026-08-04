import type {
  DecisionReflection,
} from "./analyse-decision-reflection";
import type {
  ApexDecisionOutcome,
} from "./create-decision-outcome";
import type {
  LearningLedgerEntry,
} from "./create-learning-ledger-entry";
import type {
  ApexDecisionMemory,
  DecisionMemoryStatus,
} from "./create-decision-memory";

export type UpdateDecisionMemoryInput = {
  memory: ApexDecisionMemory;

  outcome?: ApexDecisionOutcome | null;

  reflection?: DecisionReflection | null;

  learningEntries?: LearningLedgerEntry[];

  closed?: boolean;

  updatedAt?: Date;
};

export function updateDecisionMemory({
  memory,
  outcome,
  reflection,
  learningEntries,
  closed = false,
  updatedAt = new Date(),
}: UpdateDecisionMemoryInput): ApexDecisionMemory {
  if (memory.status === "closed") {
    throw new Error(
      "Closed decision memory cannot be updated.",
    );
  }

  const nextOutcome =
    outcome ?? memory.outcome;

  const nextReflection =
    reflection ?? memory.reflection;

  const nextLearning =
    learningEntries ??
    memory.learningEntries;

  if (
    nextOutcome &&
    nextOutcome.decisionId !==
      memory.decision.id
  ) {
    throw new Error(
      "Decision memory outcome must reference the same decision.",
    );
  }

  if (
    nextOutcome &&
    nextOutcome.userId !==
      memory.userId
  ) {
    throw new Error(
      "Decision memory cannot contain an outcome belonging to another user.",
    );
  }

  if (
    nextLearning.some(
      (learning) =>
        learning.userId !==
        memory.userId,
    )
  ) {
    throw new Error(
      "Decision memory cannot contain learning entries belonging to another user.",
    );
  }

  let status: DecisionMemoryStatus =
    memory.status;

  if (nextLearning.length > 0) {
    status = "learning-created";
  } else if (nextReflection) {
    status = "reflected";
  } else if (
    nextOutcome &&
    nextOutcome.status !==
      "insufficient-data"
  ) {
    status =
      "ready-for-reflection";
  }

  return {
    ...memory,

    outcome:
      nextOutcome,

    reflection:
      nextReflection,

    learningEntries: [
      ...nextLearning,
    ],

    status:
      closed
        ? "closed"
        : status,

    lastUpdatedAt:
      updatedAt,

    closedAt:
      closed
        ? updatedAt
        : memory.closedAt,
  };
}
