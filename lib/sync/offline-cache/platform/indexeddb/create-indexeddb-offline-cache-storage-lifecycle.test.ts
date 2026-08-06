import "fake-indexeddb/auto";

import assert from "node:assert/strict";

import {
  createIndexedDbOfflineCacheDatabase,
  deleteIndexedDbOfflineCacheDatabase,
} from "./create-indexeddb-offline-cache-database";

import {
  createIndexedDbOfflineCacheStorage,
} from "./create-indexeddb-offline-cache-storage";

async function run() {
  const databaseName =
    "apex-indexeddb-storage-lifecycle-test";

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  let createCalls =
    0;

  let createdDatabase:
    Awaited<
      ReturnType<
        typeof createIndexedDbOfflineCacheDatabase
      >
    > | null =
      null;

  const storage =
    createIndexedDbOfflineCacheStorage({
      databaseName,

      async createDatabase(
        options,
      ) {
        createCalls += 1;

        createdDatabase =
          await createIndexedDbOfflineCacheDatabase(
            options,
          );

        return createdDatabase;
      },
    });

  await Promise.all([
    storage.getById(
      "entry-1",
    ),

    storage.getById(
      "entry-2",
    ),

    storage.getHighestSequence({
      userId:
        "user-1",

      deviceId:
        "device-1",
    }),
  ]);

  assert.equal(
    createCalls,
    1,
  );

  let retryCreateCalls =
    0;

  let retryDatabase:
    Awaited<
      ReturnType<
        typeof createIndexedDbOfflineCacheDatabase
      >
    > | null =
      null;

  const retryDatabaseName =
    "apex-indexeddb-storage-lifecycle-retry-test";

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName:
      retryDatabaseName,
  });

  const retryingStorage =
    createIndexedDbOfflineCacheStorage({
      databaseName:
        retryDatabaseName,

      async createDatabase(
        options,
      ) {
        retryCreateCalls += 1;

        if (
          retryCreateCalls ===
          1
        ) {
          throw new Error(
            "Temporary IndexedDB initialization failure.",
          );
        }

        retryDatabase =
          await createIndexedDbOfflineCacheDatabase(
            options,
          );

        return retryDatabase;
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
        "Temporary IndexedDB initialization failure.",
  );

  assert.equal(
    await retryingStorage.getById(
      "entry-1",
    ),
    null,
  );

  assert.equal(
    retryCreateCalls,
    2,
  );

  const databaseToClose =
    createdDatabase as
      Awaited<
        ReturnType<
          typeof createIndexedDbOfflineCacheDatabase
        >
      > | null;

  const retryDatabaseToClose =
    retryDatabase as
      Awaited<
        ReturnType<
          typeof createIndexedDbOfflineCacheDatabase
        >
      > | null;

  databaseToClose?.close();
  retryDatabaseToClose?.close();

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName:
      retryDatabaseName,
  });

  console.log(
    "IndexedDB Offline Cache lifecycle tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
