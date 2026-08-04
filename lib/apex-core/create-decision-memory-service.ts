import type {
  DecisionReflection,
} from "./analyse-decision-reflection";
import type {
  ApexDecisionMemory,
} from "./create-decision-memory";
import type {
  ApexDecisionOutcome,
} from "./create-decision-outcome";
import type {
  LearningLedgerEntry,
} from "./create-learning-ledger-entry";
import {
  updateDecisionMemory,
} from "./update-decision-memory";

export type DecisionMemoryRepository = {
  getById({
    memoryId,
    userId,
  }: {
    memoryId: string;
    userId: string;
  }): Promise<ApexDecisionMemory | null>;

  save(
    memory: ApexDecisionMemory,
  ): Promise<ApexDecisionMemory>;

  listOpenByUser(
    userId: string,
  ): Promise<ApexDecisionMemory[]>;
};

export type DecisionMemoryService = {
  create(
    memory: ApexDecisionMemory,
  ): Promise<ApexDecisionMemory>;

  get({
    memoryId,
    userId,
  }: {
    memoryId: string;
    userId: string;
  }): Promise<ApexDecisionMemory | null>;

  listOpen(
    userId: string,
  ): Promise<ApexDecisionMemory[]>;

  recordOutcome({
    memoryId,
    userId,
    outcome,
    updatedAt,
  }: {
    memoryId: string;
    userId: string;
    outcome: ApexDecisionOutcome;
    updatedAt?: Date;
  }): Promise<ApexDecisionMemory>;

  recordReflection({
    memoryId,
    userId,
    reflection,
    updatedAt,
  }: {
    memoryId: string;
    userId: string;
    reflection: DecisionReflection;
    updatedAt?: Date;
  }): Promise<ApexDecisionMemory>;

  recordLearning({
    memoryId,
    userId,
    learningEntries,
    updatedAt,
  }: {
    memoryId: string;
    userId: string;
    learningEntries: LearningLedgerEntry[];
    updatedAt?: Date;
  }): Promise<ApexDecisionMemory>;

  close({
    memoryId,
    userId,
    updatedAt,
  }: {
    memoryId: string;
    userId: string;
    updatedAt?: Date;
  }): Promise<ApexDecisionMemory>;
};

function normaliseIdentifier(
  value: string,
  label: string,
) {
  const normalised =
    value.trim();

  if (!normalised) {
    throw new Error(
      `${label} is required.`,
    );
  }

  return normalised;
}

export function createDecisionMemoryService(
  repository: DecisionMemoryRepository,
): DecisionMemoryService {
  async function requireMemory({
    memoryId,
    userId,
  }: {
    memoryId: string;
    userId: string;
  }) {
    const resolvedMemoryId =
      normaliseIdentifier(
        memoryId,
        "Decision memory id",
      );

    const resolvedUserId =
      normaliseIdentifier(
        userId,
        "User id",
      );

    const memory =
      await repository.getById({
        memoryId:
          resolvedMemoryId,
        userId:
          resolvedUserId,
      });

    if (!memory) {
      throw new Error(
        "Decision memory was not found.",
      );
    }

    if (
      memory.userId !==
      resolvedUserId
    ) {
      throw new Error(
        "Decision memory does not belong to this user.",
      );
    }

    return memory;
  }

  async function updateAndSave({
    memoryId,
    userId,
    outcome,
    reflection,
    learningEntries,
    closed,
    updatedAt,
  }: {
    memoryId: string;
    userId: string;
    outcome?:
      ApexDecisionOutcome;
    reflection?:
      DecisionReflection;
    learningEntries?:
      LearningLedgerEntry[];
    closed?: boolean;
    updatedAt?: Date;
  }) {
    const memory =
      await requireMemory({
        memoryId,
        userId,
      });

    const updated =
      updateDecisionMemory({
        memory,
        outcome,
        reflection,
        learningEntries,
        closed,
        updatedAt,
      });

    return repository.save(
      updated,
    );
  }

  return {
    async create(memory) {
      const existing =
        await repository.getById({
          memoryId: memory.id,
          userId: memory.userId,
        });

      if (existing) {
        throw new Error(
          "Decision memory already exists.",
        );
      }

      return repository.save({
        ...memory,
        learningEntries: [
          ...memory.learningEntries,
        ],
      });
    },

    async get({
      memoryId,
      userId,
    }) {
      const resolvedMemoryId =
        normaliseIdentifier(
          memoryId,
          "Decision memory id",
        );

      const resolvedUserId =
        normaliseIdentifier(
          userId,
          "User id",
        );

      return repository.getById({
        memoryId:
          resolvedMemoryId,
        userId:
          resolvedUserId,
      });
    },

    async listOpen(userId) {
      const resolvedUserId =
        normaliseIdentifier(
          userId,
          "User id",
        );

      const memories =
        await repository.listOpenByUser(
          resolvedUserId,
        );

      return [...memories].sort(
        (a, b) =>
          b.lastUpdatedAt.getTime() -
          a.lastUpdatedAt.getTime(),
      );
    },

    async recordOutcome({
      memoryId,
      userId,
      outcome,
      updatedAt,
    }) {
      return updateAndSave({
        memoryId,
        userId,
        outcome,
        updatedAt,
      });
    },

    async recordReflection({
      memoryId,
      userId,
      reflection,
      updatedAt,
    }) {
      return updateAndSave({
        memoryId,
        userId,
        reflection,
        updatedAt,
      });
    },

    async recordLearning({
      memoryId,
      userId,
      learningEntries,
      updatedAt,
    }) {
      return updateAndSave({
        memoryId,
        userId,
        learningEntries,
        updatedAt,
      });
    },

    async close({
      memoryId,
      userId,
      updatedAt,
    }) {
      return updateAndSave({
        memoryId,
        userId,
        closed: true,
        updatedAt,
      });
    },
  };
}
