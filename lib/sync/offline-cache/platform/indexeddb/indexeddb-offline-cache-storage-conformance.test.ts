import "fake-indexeddb/auto";

import {
  assertOfflineCacheStorageConformance,
} from "@/lib/sync/offline-cache/repository";

import {
  createIndexedDbOfflineCacheDatabase,
  deleteIndexedDbOfflineCacheDatabase,
} from "./create-indexeddb-offline-cache-database";

import {
  createIndexedDbOfflineCacheStorage,
} from "./create-indexeddb-offline-cache-storage";

async function run() {
  const databaseName =
    "apex-indexeddb-storage-conformance-test";

  let database:
    Awaited<
      ReturnType<
        typeof createIndexedDbOfflineCacheDatabase
      >
    > | null =
      null;

  await assertOfflineCacheStorageConformance({
    async reset() {
      if (database) {
        database.close();
        database =
          null;
      }

      await deleteIndexedDbOfflineCacheDatabase({
        databaseName,
      });
    },

    async createStorage() {
      database =
        await createIndexedDbOfflineCacheDatabase({
          databaseName,
        });

      return createIndexedDbOfflineCacheStorage({
        database,
      });
    },
  });

  console.log(
    "IndexedDB Offline Cache storage conformance tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
