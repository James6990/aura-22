import type {
  ApexDecisionMemory,
  DecisionMemoryStatus,
} from "@/lib/apex-core/create-decision-memory";
import type {
  DecisionMemoryRepository,
} from "@/lib/apex-core/create-decision-memory-service";
import {
  hydrateDecisionMemory,
  serializeDecisionMemory,
  type SerializedDecisionMemorySnapshot,
} from "./decision-memory-snapshot";

export type DecisionMemorySnapshotRow = {
  id: string;
  userId: string;
  decisionId: string;
  status:
    DecisionMemoryStatus;
  snapshot:
    SerializedDecisionMemorySnapshot;
  schemaVersion: number;
  openedAt: Date;
  lastUpdatedAt: Date;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DecisionMemorySnapshotWrite = {
  id: string;
  userId: string;
  decisionId: string;
  status:
    DecisionMemoryStatus;
  snapshot:
    SerializedDecisionMemorySnapshot;
  schemaVersion: number;
  openedAt: Date;
  lastUpdatedAt: Date;
  closedAt: Date | null;
  updatedAt: Date;
};

export type DecisionMemorySnapshotStorage = {
  getById({
    memoryId,
    userId,
  }: {
    memoryId: string;
    userId: string;
  }): Promise<
    DecisionMemorySnapshotRow | null
  >;

  upsert(
    value:
      DecisionMemorySnapshotWrite,
  ): Promise<
    DecisionMemorySnapshotRow
  >;

  listOpenByUser(
    userId: string,
  ): Promise<
    DecisionMemorySnapshotRow[]
  >;
};

function normaliseIdentifier(
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

function assertRowConsistency(
  row:
    DecisionMemorySnapshotRow,
) {
  if (
    row.id !==
    row.snapshot.id
  ) {
    throw new Error(
      "Decision Memory row id does not match its snapshot.",
    );
  }

  if (
    row.userId !==
    row.snapshot.userId
  ) {
    throw new Error(
      "Decision Memory row user does not match its snapshot.",
    );
  }

  if (
    row.decisionId !==
    row.snapshot.decision.id
  ) {
    throw new Error(
      "Decision Memory row decision does not match its snapshot.",
    );
  }

  if (
    row.status !==
    row.snapshot.status
  ) {
    throw new Error(
      "Decision Memory row status does not match its snapshot.",
    );
  }

  if (
    row.schemaVersion !==
    row.snapshot.schemaVersion
  ) {
    throw new Error(
      "Decision Memory row schema version does not match its snapshot.",
    );
  }
}

function hydrateRow(
  row:
    DecisionMemorySnapshotRow,
) {
  assertRowConsistency(row);

  const memory =
    hydrateDecisionMemory(
      row.snapshot,
    );

  if (
    memory.openedAt.getTime() !==
      row.openedAt.getTime() ||
    memory.lastUpdatedAt.getTime() !==
      row.lastUpdatedAt.getTime() ||
    (
      memory.closedAt?.getTime() ??
      null
    ) !==
      (
        row.closedAt?.getTime() ??
        null
      )
  ) {
    throw new Error(
      "Decision Memory row timestamps do not match its snapshot.",
    );
  }

  return memory;
}

export function createDecisionMemoryRepository(
  storage:
    DecisionMemorySnapshotStorage,
): DecisionMemoryRepository {
  return {
    async getById({
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

      const row =
        await storage.getById({
          memoryId:
            resolvedMemoryId,

          userId:
            resolvedUserId,
        });

      if (!row) {
        return null;
      }

      if (
        row.userId !==
        resolvedUserId
      ) {
        throw new Error(
          "Decision Memory storage returned data belonging to another user.",
        );
      }

      return hydrateRow(row);
    },

    async save(memory) {
      if (
        memory.userId !==
        memory.decision.userId
      ) {
        throw new Error(
          "Decision Memory repository cannot save cross-user decision data.",
        );
      }

      const snapshot =
        serializeDecisionMemory(
          memory,
        );

      const row =
        await storage.upsert({
          id:
            memory.id,

          userId:
            memory.userId,

          decisionId:
            memory.decision.id,

          status:
            memory.status,

          snapshot,

          schemaVersion:
            memory.schemaVersion,

          openedAt:
            memory.openedAt,

          lastUpdatedAt:
            memory.lastUpdatedAt,

          closedAt:
            memory.closedAt,

          updatedAt:
            new Date(),
        });

      return hydrateRow(row);
    },

    async listOpenByUser(
      userId,
    ) {
      const resolvedUserId =
        normaliseIdentifier(
          userId,
          "User id",
        );

      const rows =
        await storage.listOpenByUser(
          resolvedUserId,
        );

      const memories =
        rows.map((row) => {
          if (
            row.userId !==
            resolvedUserId
          ) {
            throw new Error(
              "Decision Memory storage returned cross-user list data.",
            );
          }

          if (
            row.status === "closed"
          ) {
            throw new Error(
              "Open Decision Memory query returned a closed memory.",
            );
          }

          return hydrateRow(row);
        });

      return memories.sort(
        (a, b) =>
          b.lastUpdatedAt.getTime() -
          a.lastUpdatedAt.getTime(),
      );
    },
  };
}
