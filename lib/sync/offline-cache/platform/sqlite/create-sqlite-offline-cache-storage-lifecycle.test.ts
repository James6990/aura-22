import assert from "node:assert/strict";

import {
  createSQLiteOfflineCacheStorage,
} from "./create-sqlite-offline-cache-storage";

import type {
  SQLiteOfflineCacheConnection,
  SQLiteOfflineCacheConnectionProvider,
} from "./create-sqlite-offline-cache-database";

async function run() {
  let createCalls =
    0;

  let queryCalls =
    0;

  const connection = {
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
      statement:
        string,
    ) {
      if (
        statement.includes(
          "SELECT schema_version",
        )
      ) {
        return {
          values: [
            {
              schema_version:
                1,
            },
          ],
        };
      }

      queryCalls += 1;

      return {
        values:
          [],
      };
    },
  } as unknown as
    SQLiteOfflineCacheConnection;

  const provider:
    SQLiteOfflineCacheConnectionProvider = {
      async createConnection() {
        createCalls += 1;

        return connection;
      },
  };

  const storage =
    createSQLiteOfflineCacheStorage({
      connectionProvider:
        provider,
    });

  await Promise.all([
    storage.getById(
      "entry-1",
    ),

    storage.getById(
      "entry-2",
    ),

    storage.getById(
      "entry-3",
    ),
  ]);

  assert.equal(
    createCalls,
    1,
  );

  assert.equal(
    queryCalls,
    3,
  );

  let failingCreateCalls =
    0;

  const retryingStorage =
    createSQLiteOfflineCacheStorage({
      connectionProvider: {
        async createConnection() {
          failingCreateCalls += 1;

          if (
            failingCreateCalls ===
            1
          ) {
            throw new Error(
              "Temporary SQLite initialization failure.",
            );
          }

          return connection;
        },
      },
    });

  await assert.rejects(
    () =>
      retryingStorage.getById(
        "entry-1",
      ),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Temporary SQLite initialization failure.",
  );

  assert.equal(
    await retryingStorage.getById(
      "entry-1",
    ),
    null,
  );

  assert.equal(
    failingCreateCalls,
    2,
  );

  console.log(
    "SQLite Offline Cache lifecycle tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
