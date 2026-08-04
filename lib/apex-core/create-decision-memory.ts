import type {
  DecisionReflection,
} from "./analyse-decision-reflection";
import type {
  ApexDecisionOutcome,
} from "./create-decision-outcome";
import type {
  ApexDecisionRecord,
} from "./create-decision-record";
import type {
  LearningLedgerEntry,
} from "./create-learning-ledger-entry";
import type {
  ApexReasoningDecisionTrace,
} from "./build-apex-reasoning-trace";

export type DecisionMemoryStatus =
  | "awaiting-response"
  | "awaiting-outcome"
  | "ready-for-reflection"
  | "reflected"
  | "learning-created"
  | "closed";

export type ApexDecisionMemory = {
  id: string;
  userId: string;

  decision: ApexDecisionRecord;
  reasoningTrace:
    ApexReasoningDecisionTrace;

  outcome:
    ApexDecisionOutcome | null;

  reflection:
    DecisionReflection | null;

  learningEntries:
    LearningLedgerEntry[];

  status:
    DecisionMemoryStatus;

  openedAt: Date;
  lastUpdatedAt: Date;
  closedAt: Date | null;

  schemaVersion: number;
};

export type CreateDecisionMemoryInput = {
  id: string;

  decision:
    ApexDecisionRecord;

  reasoningTrace:
    ApexReasoningDecisionTrace;

  outcome?:
    ApexDecisionOutcome | null;

  reflection?:
    DecisionReflection | null;

  learningEntries?:
    LearningLedgerEntry[];

  status?:
    DecisionMemoryStatus;

  openedAt?: Date;
  lastUpdatedAt?: Date;
  closedAt?: Date | null;

  schemaVersion?: number;
};

function getDefaultStatus({
  outcome,
  reflection,
  learningEntries,
  decision,
}: {
  outcome:
    ApexDecisionOutcome | null;
  reflection:
    DecisionReflection | null;
  learningEntries:
    LearningLedgerEntry[];
  decision:
    ApexDecisionRecord;
}): DecisionMemoryStatus {
  if (learningEntries.length > 0) {
    return "learning-created";
  }

  if (reflection) {
    return "reflected";
  }

  if (
    outcome &&
    outcome.status !==
      "insufficient-data"
  ) {
    return "ready-for-reflection";
  }

  if (
    decision.status === "accepted" ||
    decision.status ===
      "partially-followed" ||
    decision.status === "completed"
  ) {
    return "awaiting-outcome";
  }

  return "awaiting-response";
}

export function createDecisionMemory({
  id,
  decision,
  reasoningTrace,
  outcome = null,
  reflection = null,
  learningEntries = [],
  status,
  openedAt = decision.issuedAt,
  lastUpdatedAt = openedAt,
  closedAt = null,
  schemaVersion = 1,
}: CreateDecisionMemoryInput): ApexDecisionMemory {
  if (
    reasoningTrace.trace.decisionId !==
    decision.id
  ) {
    throw new Error(
      "Decision memory requires a reasoning trace linked to the same decision.",
    );
  }

  if (
    reasoningTrace.trace.outcome !==
    decision.priority
  ) {
    throw new Error(
      "Decision memory requires matching decision and reasoning priorities.",
    );
  }

  if (
    outcome &&
    outcome.decisionId !==
      decision.id
  ) {
    throw new Error(
      "Decision memory outcome must reference the same decision.",
    );
  }

  if (
    outcome &&
    outcome.userId !==
      decision.userId
  ) {
    throw new Error(
      "Decision memory cannot contain an outcome belonging to another user.",
    );
  }

  if (
    learningEntries.some(
      (learning) =>
        learning.userId !==
        decision.userId,
    )
  ) {
    throw new Error(
      "Decision memory cannot contain learning entries belonging to another user.",
    );
  }

  const resolvedStatus =
    status ??
    getDefaultStatus({
      outcome,
      reflection,
      learningEntries,
      decision,
    });

  if (
    resolvedStatus === "closed" &&
    closedAt === null
  ) {
    throw new Error(
      "Closed decision memory requires a closing timestamp.",
    );
  }

  return {
    id:
      id.trim() ||
      "unidentified-decision-memory",

    userId:
      decision.userId,

    decision,

    reasoningTrace,

    outcome,

    reflection,

    learningEntries: [
      ...learningEntries,
    ],

    status:
      resolvedStatus,

    openedAt,
    lastUpdatedAt,
    closedAt,

    schemaVersion:
      Math.max(
        1,
        Math.floor(
          schemaVersion,
        ),
      ),
  };
}
