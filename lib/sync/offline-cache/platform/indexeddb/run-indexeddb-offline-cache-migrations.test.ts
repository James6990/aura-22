import assert from "node:assert/strict";

import {
  runIndexedDbOfflineCacheMigrations,
  type IndexedDbOfflineCacheMigration,
} from "./run-indexeddb-offline-cache-migrations";

import type {
  IndexedDbOfflineCacheDatabase,
} from "./create-indexeddb-offline-cache-database";

import type {
  IndexedDbOfflineCacheUpgradeTransaction,
} from "./run-indexeddb-offline-cache-migrations";

function run() {
  const calls:
    string[] = [];

  const database =
    {} as
      IndexedDbOfflineCacheDatabase;

  const transaction =
    {} as
      IndexedDbOfflineCacheUpgradeTransaction;

  const migrations:
    IndexedDbOfflineCacheMigration[] = [
      {
        fromVersion:
          0,

        toVersion:
          1,

        description:
          "Create the initial IndexedDB Offline Cache schema.",

        execute({
          database:
            receivedDatabase,
          transaction:
            receivedTransaction,
        }) {
          assert.equal(
            receivedDatabase,
            database,
          );

          assert.equal(
            receivedTransaction,
            transaction,
          );

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

        execute() {
          calls.push(
            "migration:1-to-2",
          );
        },
      },
    ];

  const applied =
    runIndexedDbOfflineCacheMigrations({
      database,
      transaction,
      oldVersion:
        0,
      newVersion:
        2,
      migrations,
    });

  assert.deepEqual(
    calls,
    [
      "migration:0-to-1",
      "migration:1-to-2",
    ],
  );

  assert.deepEqual(
    applied,
    [
      {
        fromVersion:
          0,
        toVersion:
          1,
        description:
          "Create the initial IndexedDB Offline Cache schema.",
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
  );

  calls.length =
    0;

  assert.deepEqual(
    runIndexedDbOfflineCacheMigrations({
      database,
      transaction,
      oldVersion:
        2,
      newVersion:
        2,
      migrations,
    }),
    [],
  );

  assert.deepEqual(
    calls,
    [],
  );

  assert.throws(
    () =>
      runIndexedDbOfflineCacheMigrations({
        database,
        transaction,
        oldVersion:
          0,
        newVersion:
          null,
        migrations,
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "IndexedDB Offline Cache upgrade target version is required.",
  );

  console.log(
    "IndexedDB Offline Cache migration integration tests passed.",
  );
}

run();
