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

  let executedSql =
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
      calls.push(
        `execute:${String(
          transaction,
        )}`,
      );

      executedSql =
        statements;

      return {
        changes: {
          changes:
            0,
        },
      };
    },

    async query() {
      throw new Error(
        "query not expected",
      );
    },

    async run() {
      throw new Error(
        "run not expected",
      );
    },

    async beginTransaction() {
      throw new Error(
        "beginTransaction not expected",
      );
    },

    async commitTransaction() {
      throw new Error(
        "commitTransaction not expected",
      );
    },

    async rollbackTransaction() {
      throw new Error(
        "rollbackTransaction not expected",
      );
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

  assert.deepEqual(
    calls,
    [
      `create:apex-offline-cache-test:${sqliteOfflineCacheDatabaseVersion}`,
      "open",
      "execute:true",
    ],
  );

  assert.match(
    executedSql,
    new RegExp(
      `CREATE TABLE IF NOT EXISTS ${sqliteOfflineCacheTableName}`,
    ),
  );

  assert.match(
    executedSql,
    /idx_offline_cache_ownership_sequence/,
  );

  assert.match(
    executedSql,
    /idx_offline_cache_ownership_status_sequence/,
  );

  const failureCalls:
    string[] = [];

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

    async execute() {
      failureCalls.push(
        "execute",
      );

      throw new Error(
        "SQLite schema failure.",
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
        "SQLite schema failure.",
  );

  assert.deepEqual(
    failureCalls,
    [
      "open",
      "execute",
      "close",
    ],
  );

  console.log(
    "SQLite Offline Cache database tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
