import assert from "node:assert/strict";

import {
  createSQLiteOfflineCacheDatabase,
  sqliteOfflineCacheDatabaseVersion,
  sqliteOfflineCacheTableName,
  type SQLiteOfflineCacheConnection,
  type SQLiteOfflineCacheConnectionProvider,
} from "./create-sqlite-offline-cache-database";

async function run() {
  const calls:
    string[] = [];

  let durableVersion =
    0;

  let pendingVersion:
    number | null =
      null;

  let schemaSql =
    "";

  const connection: SQLiteOfflineCacheConnection = {
    async open() {
      calls.push(
        "open",
      );
    },

    async close() {
      calls.push(
        "close",
      );
    },

    async execute(
      statements,
      transaction,
    ) {
      if (
        statements.includes(
          "offline_cache_metadata",
        )
      ) {
        calls.push(
          `metadata:init:${String(
            transaction,
          )}`,
        );
      } else {
        calls.push(
          `schema:execute:${String(
            transaction,
          )}`,
        );

        schemaSql =
          statements;
      }

      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async query(
      statement,
    ) {
      assert.match(
        statement,
        /SELECT schema_version/,
      );

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
      statement,
      values,
      transaction,
    ) {
      assert.match(
        statement,
        /UPDATE offline_cache_metadata/,
      );

      calls.push(
        `metadata:write:${String(
          values?.[0],
        )}:${String(
          transaction,
        )}`,
      );

      pendingVersion =
        Number(
          values?.[0],
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
  };

  const provider:
    SQLiteOfflineCacheConnectionProvider = {
      async createConnection({
        databaseName,
        version,
      }) {
        calls.push(
          `create:${databaseName}:${version}`,
        );

        return connection;
      },
    };

  const result =
    await createSQLiteOfflineCacheDatabase({
      connectionProvider:
        provider,

      databaseName:
        "apex-offline-cache-test",
    });

  assert.equal(
    result,
    connection,
  );

  assert.equal(
    durableVersion,
    sqliteOfflineCacheDatabaseVersion,
  );

  assert.deepEqual(
    calls,
    [
      `create:apex-offline-cache-test:${sqliteOfflineCacheDatabaseVersion}`,
      "open",
      "metadata:init:true",
      "metadata:read",
      "transaction:begin",
      "schema:execute:false",
      `metadata:write:${sqliteOfflineCacheDatabaseVersion}:false`,
      "transaction:commit",
    ],
  );

  assert.match(
    schemaSql,
    new RegExp(
      `CREATE TABLE IF NOT EXISTS ${sqliteOfflineCacheTableName}`,
    ),
  );

  assert.match(
    schemaSql,
    /idx_offline_cache_ownership_sequence/,
  );

  assert.match(
    schemaSql,
    /idx_offline_cache_ownership_status_sequence/,
  );

  calls.length =
    0;

  const reopened =
    await createSQLiteOfflineCacheDatabase({
      connectionProvider:
        provider,

      databaseName:
        "apex-offline-cache-test",
    });

  assert.equal(
    reopened,
    connection,
  );

  assert.deepEqual(
    calls,
    [
      `create:apex-offline-cache-test:${sqliteOfflineCacheDatabaseVersion}`,
      "open",
      "metadata:init:true",
      "metadata:read",
    ],
  );

  const failureCalls:
    string[] = [];

  let failurePendingVersion:
    number | null =
      null;

  const failingConnection: SQLiteOfflineCacheConnection = {
    ...connection,

    async open() {
      failureCalls.push(
        "open",
      );
    },

    async close() {
      failureCalls.push(
        "close",
      );
    },

    async execute(
      statements,
    ) {
      if (
        statements.includes(
          "offline_cache_metadata",
        )
      ) {
        failureCalls.push(
          "metadata:init",
        );

        return {
          changes: {
            changes:
              0,
          },
        };
      }

      failureCalls.push(
        "schema:execute",
      );

      throw new Error(
        "SQLite schema migration failure.",
      );
    },

    async query() {
      failureCalls.push(
        "metadata:read",
      );

      return {
        values: [
          {
            schema_version:
              0,
          },
        ],
      };
    },

    async beginTransaction() {
      failureCalls.push(
        "transaction:begin",
      );

      failurePendingVersion =
        0;

      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async commitTransaction() {
      failureCalls.push(
        "transaction:commit",
      );

      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async rollbackTransaction() {
      failureCalls.push(
        "transaction:rollback",
      );

      failurePendingVersion =
        null;

      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async run() {
      throw new Error(
        "Schema version must not be written after migration failure.",
      );
    },
  };

  await assert.rejects(
    () =>
      createSQLiteOfflineCacheDatabase({
        connectionProvider: {
          async createConnection() {
            return failingConnection;
          },
        },
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "SQLite schema migration failure.",
  );

  assert.equal(
    failurePendingVersion,
    null,
  );

  assert.deepEqual(
    failureCalls,
    [
      "open",
      "metadata:init",
      "metadata:read",
      "transaction:begin",
      "schema:execute",
      "transaction:rollback",
      "close",
    ],
  );

  console.log(
    "SQLite Offline Cache database migration tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
