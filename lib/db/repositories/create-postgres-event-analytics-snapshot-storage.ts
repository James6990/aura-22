import {
  and,
  asc,
  desc,
  eq,
  gte,
  lte,
} from "drizzle-orm";

import {
  db,
} from "@/lib/db";

import {
  apexEventAnalyticsSnapshots,
} from "@/lib/db/schema";

import type {
  EventAnalyticsSnapshotStorage,
  EventAnalyticsSnapshotWrite,
} from "@/lib/analytics/events/repository";

import {
  eventAnalyticsSnapshotRowFromPostgres,
  eventAnalyticsSnapshotWriteToPostgres,
} from "./event-analytics-snapshot-row";

export type PostgresEventAnalyticsDatabase =
  Pick<
    typeof db,
    | "select"
    | "insert"
  >;

function toStorageRow(
  row:
    typeof apexEventAnalyticsSnapshots.$inferSelect,
) {
  return eventAnalyticsSnapshotRowFromPostgres(
    row,
  );
}

export function createPostgresEventAnalyticsSnapshotStorage(
  database:
    PostgresEventAnalyticsDatabase =
      db,
): EventAnalyticsSnapshotStorage {
  async function getUnscopedById(
    snapshotId: string,
  ) {
    const rows =
      await database
        .select()
        .from(
          apexEventAnalyticsSnapshots,
        )
        .where(
          eq(
            apexEventAnalyticsSnapshots
              .id,
            snapshotId,
          ),
        )
        .limit(
          1,
        );

    return rows[0]
      ? toStorageRow(
          rows[0],
        )
      : null;
  }

  return {
    async getById({
      snapshotId,
      userId,
    }) {
      const rows =
        await database
          .select()
          .from(
            apexEventAnalyticsSnapshots,
          )
          .where(
            and(
              eq(
                apexEventAnalyticsSnapshots
                  .id,
                snapshotId,
              ),

              eq(
                apexEventAnalyticsSnapshots
                  .userId,
                userId,
              ),
            ),
          )
          .limit(
            1,
          );

      return rows[0]
        ? toStorageRow(
            rows[0],
          )
        : null;
    },

    async upsert(
      value:
        EventAnalyticsSnapshotWrite,
    ) {
      const postgresWrite =
        eventAnalyticsSnapshotWriteToPostgres(
          value,
        );

      const insertedRows =
        await database
          .insert(
            apexEventAnalyticsSnapshots,
          )
          .values(
            postgresWrite,
          )
          .onConflictDoNothing({
            target:
              apexEventAnalyticsSnapshots
                .id,
          })
          .returning();

      const inserted =
        insertedRows[0];

      if (inserted) {
        return toStorageRow(
          inserted,
        );
      }

      const existing =
        await getUnscopedById(
          value.id,
        );

      if (!existing) {
        throw new Error(
          "PostgreSQL did not return the saved Event Analytics snapshot.",
        );
      }

      return existing;
    },

    async listByWindow({
      userId,
      startAt,
      endAt,
      limit,
    }) {
      const rows =
        await database
          .select()
          .from(
            apexEventAnalyticsSnapshots,
          )
          .where(
            and(
              eq(
                apexEventAnalyticsSnapshots
                  .userId,
                userId,
              ),

              gte(
                apexEventAnalyticsSnapshots
                  .windowEndAt,
                new Date(
                  startAt,
                ),
              ),

              lte(
                apexEventAnalyticsSnapshots
                  .windowStartAt,
                new Date(
                  endAt,
                ),
              ),
            ),
          )
          .orderBy(
            desc(
              apexEventAnalyticsSnapshots
                .windowEndAt,
            ),

            desc(
              apexEventAnalyticsSnapshots
                .generatedAt,
            ),

            asc(
              apexEventAnalyticsSnapshots
                .id,
            ),
          )
          .limit(
            limit,
          );

      return rows.map(
        toStorageRow,
      );
    },
  };
}
