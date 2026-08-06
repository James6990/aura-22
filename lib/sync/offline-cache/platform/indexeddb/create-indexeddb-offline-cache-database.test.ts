import "fake-indexeddb/auto";

import assert from "node:assert/strict";

import {
  createIndexedDbOfflineCacheDatabase,
  deleteIndexedDbOfflineCacheDatabase,
  indexedDbOfflineCacheDatabaseVersion,
  indexedDbOfflineCacheEntryStore,
  indexedDbOfflineCacheOwnershipSequenceIndex,
  indexedDbOfflineCacheOwnershipStatusSequenceIndex,
} from "./create-indexeddb-offline-cache-database";

async function run() {
  const databaseName =
    "apex-offline-cache-database-migration-test";

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  const database =
    await createIndexedDbOfflineCacheDatabase({
      databaseName,
    });

  assert.equal(
    database.version,
    indexedDbOfflineCacheDatabaseVersion,
  );

  assert.equal(
    database.objectStoreNames.contains(
      indexedDbOfflineCacheEntryStore,
    ),
    true,
  );

  const transaction =
    database.transaction(
      indexedDbOfflineCacheEntryStore,
      "readonly",
    );

  const store =
    transaction.objectStore(
      indexedDbOfflineCacheEntryStore,
    );

  assert.equal(
    store.indexNames.contains(
      indexedDbOfflineCacheOwnershipSequenceIndex,
    ),
    true,
  );

  assert.equal(
    store.indexNames.contains(
      indexedDbOfflineCacheOwnershipStatusSequenceIndex,
    ),
    true,
  );

  await transaction.done;

  database.close();

  const reopened =
    await createIndexedDbOfflineCacheDatabase({
      databaseName,
    });

  assert.equal(
    reopened.version,
    indexedDbOfflineCacheDatabaseVersion,
  );

  assert.equal(
    reopened.objectStoreNames.contains(
      indexedDbOfflineCacheEntryStore,
    ),
    true,
  );

  reopened.close();

  await deleteIndexedDbOfflineCacheDatabase({
    databaseName,
  });

  console.log(
    "IndexedDB Offline Cache database migration tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
