import assert from "node:assert/strict";

import {
  runSQLiteOfflineCacheMigrations,
  type SQLiteOfflineCacheMigration,
} from "./run-sqlite-offline-cache-migrations";

import type {
  SQLiteOfflineCacheConnection,
} from "./create-sqlite-offline-cache-database";

async function run() {
  let durableVersion =
    0;

  let pendingVersion:
    number | null =
      null;

  const calls:
    string[] = [];

  const connection = {
    async execute() {
      calls.push(
        "metadata:init",
      );

      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async query() {
      calls.push(
        "metadata:read",
      );

      return {
        values: [
          {
            schema_version:
              durableVersion,
          },
        ],
      };
    },

    async run(
      statement:
        string,
      values?:
        unknown[],
    ) {
      assert.match(
        statement,
        /UPDATE offline_cache_metadata/,
      );

      pendingVersion =
        Number(
          values?.[0],
        );

      calls.push(
        `metadata:write:${pendingVersion}`,
      );

      return {
        changes: {
          changes:
            1,
        },
      };
    },

    async beginTransaction() {
      calls.push(
        "transaction:begin",
      );

      pendingVersion =
        durableVersion;

      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async commitTransaction() {
      calls.push(
        "transaction:commit",
      );

      if (
        pendingVersion !==
        null
      ) {
        durableVersion =
          pendingVersion;
      }

      pendingVersion =
        null;

      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async rollbackTransaction() {
      calls.push(
        "transaction:rollback",
      );

      pendingVersion =
        null;

      return {
        changes: {
          changes:
            0,
        },
      };
    },
  } as unknown as
    SQLiteOfflineCacheConnection;

  const migrations:
    SQLiteOfflineCacheMigration[] = [
      {
        fromVersion:
          0,

        toVersion:
          1,

        description:
          "Create initial Offline Cache schema.",

        async execute() {
          calls.push(
            "migration:0-to-1",
          );
        },
      },
      {
        fromVersion:
          1,

        toVersion:
          2,

        description:
          "Add recovery metadata.",

        async execute() {
          calls.push(
            "migration:1-to-2",
          );
        },
      },
    ];

  const result =
    await runSQLiteOfflineCacheMigrations({
      connection,
      targetVersion:
        2,
      migrations,
    });

  assert.equal(
    durableVersion,
    2,
  );

  assert.deepEqual(
    result,
    {
      initialVersion:
        0,

      finalVersion:
        2,

      appliedMigrations: [
        {
          fromVersion:
            0,

          toVersion:
            1,

          description:
            "Create initial Offline Cache schema.",
        },
        {
          fromVersion:
            1,

          toVersion:
            2,

          description:
            "Add recovery metadata.",
        },
      ],
    },
  );

  assert.deepEqual(
    calls,
    [
      "metadata:init",
      "metadata:read",
      "transaction:begin",
      "migration:0-to-1",
      "metadata:write:1",
      "transaction:commit",
      "transaction:begin",
      "migration:1-to-2",
      "metadata:write:2",
      "transaction:commit",
    ],
  );

  calls.length =
    0;

  durableVersion =
    0;

  let failOnce =
    true;

  const failingMigrations:
    SQLiteOfflineCacheMigration[] = [
      migrations[0],

      {
        ...migrations[1],

        async execute() {
          calls.push(
            "migration:1-to-2",
          );

          if (failOnce) {
            failOnce =
              false;

            throw new Error(
              "Temporary SQLite migration failure.",
            );
          }
        },
      },
    ];

  await assert.rejects(
    () =>
      runSQLiteOfflineCacheMigrations({
        connection,
        targetVersion:
          2,
        migrations:
          failingMigrations,
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Temporary SQLite migration failure.",
  );

  assert.equal(
    durableVersion,
    1,
  );

  assert.equal(
    calls.at(-1),
    "transaction:rollback",
  );

  calls.length =
    0;

  const resumed =
    await runSQLiteOfflineCacheMigrations({
      connection,
      targetVersion:
        2,
      migrations:
        failingMigrations,
    });

  assert.equal(
    resumed.initialVersion,
    1,
  );

  assert.equal(
    resumed.finalVersion,
    2,
  );

  assert.equal(
    durableVersion,
    2,
  );

  assert.equal(
    calls.includes(
      "migration:0-to-1",
    ),
    false,
  );

  console.log(
    "SQLite Offline Cache migration integration tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
