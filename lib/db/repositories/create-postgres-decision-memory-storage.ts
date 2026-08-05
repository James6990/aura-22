import {
  and,
  desc,
  eq,
  ne,
} from "drizzle-orm";

import {
  db,
} from "@/lib/db";
import {
  apexDecisionMemories,
} from "@/lib/db/schema";
import type {
  DecisionMemorySnapshotRow,
  DecisionMemorySnapshotStorage,
  DecisionMemorySnapshotWrite,
} from "./create-decision-memory-repository";

function toRow(
  row:
    typeof apexDecisionMemories.$inferSelect,
): DecisionMemorySnapshotRow {
  return {
    ...row,
  };
}

export function createPostgresDecisionMemoryStorage():
  DecisionMemorySnapshotStorage {
  return {
    async getById({
      memoryId,
      userId,
    }) {
      const rows =
        await db
          .select()
          .from(
            apexDecisionMemories,
          )
          .where(
            and(
              eq(
                apexDecisionMemories
                  .id,
                memoryId,
              ),

              eq(
                apexDecisionMemories
                  .userId,
                userId,
              ),
            ),
          )
          .limit(1);

      return rows[0]
        ? toRow(rows[0])
        : null;
    },

    async upsert(
      value:
        DecisionMemorySnapshotWrite,
    ) {
      const rows =
        await db
          .insert(
            apexDecisionMemories,
          )
          .values({
            ...value,
          })
          .onConflictDoUpdate({
            target:
              apexDecisionMemories.id,

            set: {
              userId:
                value.userId,

              decisionId:
                value.decisionId,

              status:
                value.status,

              snapshot:
                value.snapshot,

              schemaVersion:
                value.schemaVersion,

              openedAt:
                value.openedAt,

              lastUpdatedAt:
                value.lastUpdatedAt,

              closedAt:
                value.closedAt,

              updatedAt:
                value.updatedAt,
            },
          })
          .returning();

      const row = rows[0];

      if (!row) {
        throw new Error(
          "PostgreSQL did not return the saved Decision Memory.",
        );
      }

      return toRow(row);
    },

    async listOpenByUser(
      userId,
    ) {
      const rows =
        await db
          .select()
          .from(
            apexDecisionMemories,
          )
          .where(
            and(
              eq(
                apexDecisionMemories
                  .userId,
                userId,
              ),

              ne(
                apexDecisionMemories
                  .status,
                "closed",
              ),
            ),
          )
          .orderBy(
            desc(
              apexDecisionMemories
                .lastUpdatedAt,
            ),
          );

      return rows.map(toRow);
    },
  };
}
