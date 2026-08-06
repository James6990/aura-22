import {
  assertOfflineCacheStorageConformance,
} from "@/lib/sync/offline-cache/repository";

import {
  createSQLiteOfflineCacheStorage,
} from "./create-sqlite-offline-cache-storage";

import type {
  SQLiteOfflineCacheConnection,
} from "./create-sqlite-offline-cache-database";

import type {
  SQLiteOfflineCacheEntryRow,
} from "./sqlite-offline-cache-entry-row";

function createTestSQLiteConnection():
  SQLiteOfflineCacheConnection {
  const rows =
    new Map<
      string,
      SQLiteOfflineCacheEntryRow
    >();

  return {
    async open() {
      return;
    },

    async close() {
      return;
    },

    async execute() {
      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async query(
      statement,
      values = [],
    ) {
      if (
        statement.includes(
          "MAX(sequence)",
        )
      ) {
        const userId =
          String(
            values[0] ??
            "",
          );

        const deviceId =
          String(
            values[1] ??
            "",
          );

        let highestSequence =
          0;

        for (
          const row of
          rows.values()
        ) {
          if (
            row.user_id ===
              userId &&
            row.device_id ===
              deviceId
          ) {
            highestSequence =
              Math.max(
                highestSequence,
                row.sequence,
              );
          }
        }

        return {
          values: [
            {
              highest_sequence:
                highestSequence ===
                0
                  ? null
                  : highestSequence,
            },
          ],
        };
      }

      if (
        statement.includes(
          "WHERE id = ?",
        )
      ) {
        const id =
          String(
            values[0] ??
            "",
          );

        const row =
          rows.get(id);

        return {
          values:
            row
              ? [
                  structuredClone(
                    row,
                  ),
                ]
              : [],
        };
      }

      if (
        statement.includes(
          "status IN",
        )
      ) {
        const userId =
          String(
            values[0] ??
            "",
          );

        const deviceId =
          String(
            values[1] ??
            "",
          );

        const limit =
          Number(
            values[
              values.length - 1
            ],
          );

        const statuses =
          values
            .slice(
              2,
              -1,
            )
            .map(
              String,
            );

        return {
          values: [
            ...rows.values(),
          ]
            .filter(
              (row) =>
                row.user_id ===
                  userId &&
                row.device_id ===
                  deviceId &&
                statuses.includes(
                  row.status,
                ),
            )
            .sort(
              (
                first,
                second,
              ) => {
                const firstEnvelope =
                  JSON.parse(
                    first.envelope_json,
                  ) as {
                    occurredAt:
                      string;
                  };

                const secondEnvelope =
                  JSON.parse(
                    second.envelope_json,
                  ) as {
                    occurredAt:
                      string;
                  };

                return (
                  first.sequence -
                    second.sequence ||
                  firstEnvelope
                    .occurredAt
                    .localeCompare(
                      secondEnvelope
                        .occurredAt,
                    ) ||
                  first.id.localeCompare(
                    second.id,
                  )
                );
              },
            )
            .slice(
              0,
              limit,
            )
            .map(
              (row) =>
                structuredClone(
                  row,
                ),
            ),
        };
      }

      throw new Error(
        "Unexpected SQLite conformance query.",
      );
    },

    async run(
      statement,
      values = [],
    ) {
      if (
        statement.includes(
          "INSERT INTO",
        )
      ) {
        const id =
          String(
            values[0],
          );

        if (rows.has(id)) {
          const error =
            new Error(
              "UNIQUE constraint failed.",
            );

          error.name =
            "SQLiteConstraintError";

          throw error;
        }

        rows.set(
          id,
          {
            id,

            user_id:
              String(
                values[1],
              ),

            device_id:
              String(
                values[2],
              ),

            sequence:
              Number(
                values[3],
              ),

            status:
              values[4] as
                SQLiteOfflineCacheEntryRow["status"],

            origin:
              values[5] as
                SQLiteOfflineCacheEntryRow["origin"],

            cached_at:
              String(
                values[6],
              ),

            updated_at:
              String(
                values[7],
              ),

            schema_version:
              Number(
                values[8],
              ),

            envelope_json:
              String(
                values[9],
              ),

            conflict_json:
              values[10] ===
              null
                ? null
                : String(
                    values[10],
                  ),
          },
        );

        return {
          changes: {
            changes:
              1,
          },
        };
      }

      if (
        statement.includes(
          "UPDATE",
        )
      ) {
        const id =
          String(
            values[10],
          );

        if (!rows.has(id)) {
          return {
            changes: {
              changes:
                0,
            },
          };
        }

        rows.set(
          id,
          {
            id,

            user_id:
              String(
                values[0],
              ),

            device_id:
              String(
                values[1],
              ),

            sequence:
              Number(
                values[2],
              ),

            status:
              values[3] as
                SQLiteOfflineCacheEntryRow["status"],

            origin:
              values[4] as
                SQLiteOfflineCacheEntryRow["origin"],

            cached_at:
              String(
                values[5],
              ),

            updated_at:
              String(
                values[6],
              ),

            schema_version:
              Number(
                values[7],
              ),

            envelope_json:
              String(
                values[8],
              ),

            conflict_json:
              values[9] ===
              null
                ? null
                : String(
                    values[9],
                  ),
          },
        );

        return {
          changes: {
            changes:
              1,
          },
        };
      }

      throw new Error(
        "Unexpected SQLite conformance write.",
      );
    },

    async beginTransaction() {
      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async commitTransaction() {
      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async rollbackTransaction() {
      return {
        changes: {
          changes:
            0,
        },
      };
    },
  };
}

async function run() {
  let connection =
    createTestSQLiteConnection();

  await assertOfflineCacheStorageConformance({
    async reset() {
      connection =
        createTestSQLiteConnection();
    },

    async createStorage() {
      return createSQLiteOfflineCacheStorage({
        connection,
      });
    },
  });

  console.log(
    "SQLite Offline Cache storage conformance tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
