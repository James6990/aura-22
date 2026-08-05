import type {
  ApexDecisionMemory,
} from "@/lib/apex-core/create-decision-memory";
import {
  createDecisionMemoryRepository,
  type DecisionMemorySnapshotRow,
  type DecisionMemorySnapshotStorage,
  type DecisionMemorySnapshotWrite,
} from "./create-decision-memory-repository";

function createMemory({
  id = "memory-1",
  userId = "user-1",
  status = "awaiting-response",
  lastUpdatedAt = new Date(
    "2026-08-05T10:00:00Z",
  ),
}: {
  id?: string;
  userId?: string;
  status?:
    ApexDecisionMemory["status"];
  lastUpdatedAt?: Date;
} = {}): ApexDecisionMemory {
  const issuedAt = new Date(
    "2026-08-05T09:00:00Z",
  );

  const closedAt =
    status === "closed"
      ? lastUpdatedAt
      : null;

  return {
    id,
    userId,

    decision: {
      id:
        `decision-${id}`,

      userId,

      decisionType:
        "daily-coaching",

      priority: "train",

      recommendation:
        "Complete a moderate session.",

      explanation:
        "Current evidence supports training.",

      confidence: 76,

      rulesetVersion:
        "apex-rules-v1",

      coreReasons: [
        "Readiness supports training.",
      ],

      personalisedReasons: [],

      status:
        status ===
          "awaiting-response"
          ? "issued"
          : "completed",

      issuedAt,
      validUntil: null,
      schemaVersion: 1,
    },

    reasoningTrace: {
      trace: {
        decisionId:
          `decision-${id}`,

        decisionType:
          "apex-coaching",

        outcome: "train",

        confidence: 76,

        reasons: [
          {
            code:
              "reasoning-support-1",

            label:
              "Supporting evidence",

            detail:
              "Readiness supports training.",

            influence:
              "positive",

            evidenceRuleId: null,
            evidenceStrength: null,
          },
        ],

        overriddenBy: null,

        evidenceRegistryVersion:
          "apex-evidence-v1",

        createdAt: issuedAt,
      },

      reasoning: {
        tone: "measured",
        evidenceSufficient: true,
        requiresMoreEvidence:
          false,
        strongestDomain:
          "recovery",
        weakestDomain:
          "progression",
        prioritiesAligned: true,
        checkedPriorities: [
          "train",
        ],
        summary:
          "Evidence supports careful guidance.",
      },
    },

    outcome: null,
    reflection: null,
    learningEntries: [],

    status,

    openedAt: issuedAt,
    lastUpdatedAt,
    closedAt,

    schemaVersion: 1,
  };
}

function createStorage():
  DecisionMemorySnapshotStorage & {
    rows:
      Map<
        string,
        DecisionMemorySnapshotRow
      >;
  } {
  const rows =
    new Map<
      string,
      DecisionMemorySnapshotRow
    >();

  return {
    rows,

    async getById({
      memoryId,
      userId,
    }) {
      const row =
        rows.get(memoryId);

      return (
        row &&
        row.userId === userId
      )
        ? row
        : null;
    },

    async upsert(
      value:
        DecisionMemorySnapshotWrite,
    ) {
      const existing =
        rows.get(value.id);

      const row:
        DecisionMemorySnapshotRow = {
          ...value,

          createdAt:
            existing?.createdAt ??
            new Date(
              "2026-08-05T08:00:00Z",
            ),
        };

      rows.set(
        value.id,
        row,
      );

      return row;
    },

    async listOpenByUser(
      userId,
    ) {
      return [
        ...rows.values(),
      ].filter(
        (row) =>
          row.userId === userId &&
          row.status !== "closed",
      );
    },
  };
}

async function main() {
  const storage =
    createStorage();

  const repository =
    createDecisionMemoryRepository(
      storage,
    );

  const memory =
    createMemory();

  const saved =
    await repository.save(
      memory,
    );

  if (
    saved.id !== memory.id ||
    saved.userId !==
      memory.userId ||
    !(
      saved.openedAt
      instanceof Date
    )
  ) {
    throw new Error(
      "Repository should persist and hydrate a Decision Memory.",
    );
  }

  if (
    saved === memory ||
    saved.decision ===
      memory.decision
  ) {
    throw new Error(
      "Repository hydration should create an independent domain object.",
    );
  }

  const loaded =
    await repository.getById({
      memoryId:
        memory.id,
      userId:
        memory.userId,
    });

  if (
    !loaded ||
    loaded.id !== memory.id
  ) {
    throw new Error(
      "Repository should load a user-scoped Decision Memory.",
    );
  }

  const crossUser =
    await repository.getById({
      memoryId:
        memory.id,
      userId:
        "user-2",
    });

  if (crossUser !== null) {
    throw new Error(
      "Repository must not return another user's Decision Memory.",
    );
  }

  await repository.save(
    createMemory({
      id: "memory-older",
      lastUpdatedAt:
        new Date(
          "2026-08-05T08:00:00Z",
        ),
    }),
  );

  await repository.save(
    createMemory({
      id: "memory-newer",
      lastUpdatedAt:
        new Date(
          "2026-08-05T12:00:00Z",
        ),
    }),
  );

  await repository.save(
    createMemory({
      id: "memory-closed",
      status: "closed",
      lastUpdatedAt:
        new Date(
          "2026-08-05T13:00:00Z",
        ),
    }),
  );

  const open =
    await repository
      .listOpenByUser(
        "user-1",
      );

  if (
    open.some(
      (item) =>
        item.status === "closed",
    )
  ) {
    throw new Error(
      "Open query must exclude closed Decision Memories.",
    );
  }

  if (
    open[0]?.id !==
    "memory-newer"
  ) {
    throw new Error(
      "Open Decision Memories should be sorted by latest update.",
    );
  }

  const corrupted =
    storage.rows.get(
      "memory-1",
    );

  if (!corrupted) {
    throw new Error(
      "Expected stored Decision Memory fixture.",
    );
  }

  storage.rows.set(
    "memory-1",
    {
      ...corrupted,
      decisionId:
        "wrong-decision",
    },
  );

  let corruptionRejected =
    false;

  try {
    await repository.getById({
      memoryId:
        "memory-1",
      userId:
        "user-1",
    });
  } catch {
    corruptionRejected = true;
  }

  if (!corruptionRejected) {
    throw new Error(
      "Repository should reject inconsistent database rows.",
    );
  }

  console.log(
    "PostgreSQL Decision Memory Repository test passed.",
  );
}

main().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
