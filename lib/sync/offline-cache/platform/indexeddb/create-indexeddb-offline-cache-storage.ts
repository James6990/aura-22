import type {
  OfflineCacheStorage,
} from "@/lib/sync/offline-cache/repository";

import {
  createIndexedDbOfflineCacheDatabase,
  indexedDbOfflineCacheEntryStore,
  indexedDbOfflineCacheOwnershipSequenceIndex,
  indexedDbOfflineCacheOwnershipStatusSequenceIndex,
  type CreateIndexedDbOfflineCacheDatabaseOptions,
  type IndexedDbOfflineCacheDatabase,
} from "./create-indexeddb-offline-cache-database";

import {
  indexedDbRowFromOfflineCacheEntry,
  offlineCacheEntryFromIndexedDbRow,
} from "./indexeddb-offline-cache-entry-row";

export type CreateIndexedDbOfflineCacheStorageOptions =
  CreateIndexedDbOfflineCacheDatabaseOptions & {
    database?:
      IndexedDbOfflineCacheDatabase;
  };

export function createIndexedDbOfflineCacheStorage({
  database,
  databaseName,
}: CreateIndexedDbOfflineCacheStorageOptions = {}):
  OfflineCacheStorage {
  async function getDatabase() {
    return (
      database ??
      createIndexedDbOfflineCacheDatabase({
        databaseName,
      })
    );
  }

  return {
    async getById(
      entryId,
    ) {
      const resolvedDatabase =
        await getDatabase();

      const row =
        await resolvedDatabase.get(
          indexedDbOfflineCacheEntryStore,
          entryId,
        );

      return row
        ? offlineCacheEntryFromIndexedDbRow(
            row,
          )
        : null;
    },

    async getHighestSequence({
      userId,
      deviceId,
    }) {
      const resolvedDatabase =
        await getDatabase();

      const transaction =
        resolvedDatabase.transaction(
          indexedDbOfflineCacheEntryStore,
          "readonly",
        );

      const index =
        transaction
          .objectStore(
            indexedDbOfflineCacheEntryStore,
          )
          .index(
            indexedDbOfflineCacheOwnershipSequenceIndex,
          );

      const cursor =
        await index.openCursor(
          IDBKeyRange.bound(
            [
              userId,
              deviceId,
              0,
            ],
            [
              userId,
              deviceId,
              Number.MAX_SAFE_INTEGER,
            ],
          ),
          "prev",
        );

      await transaction.done;

      return cursor
        ?.value.sequence ??
        0;
    },

    async insert(
      entry,
    ) {
      const resolvedDatabase =
        await getDatabase();

      await resolvedDatabase.add(
        indexedDbOfflineCacheEntryStore,
        indexedDbRowFromOfflineCacheEntry(
          entry,
        ),
      );

      const stored =
        await resolvedDatabase.get(
          indexedDbOfflineCacheEntryStore,
          entry.id,
        );

      if (!stored) {
        throw new Error(
          "IndexedDB did not return the inserted Offline Cache entry.",
        );
      }

      return offlineCacheEntryFromIndexedDbRow(
        stored,
      );
    },

    async update(
      entry,
    ) {
      const resolvedDatabase =
        await getDatabase();

      const existing =
        await resolvedDatabase.get(
          indexedDbOfflineCacheEntryStore,
          entry.id,
        );

      if (!existing) {
        throw new Error(
          "IndexedDB cannot update a missing Offline Cache entry.",
        );
      }

      await resolvedDatabase.put(
        indexedDbOfflineCacheEntryStore,
        indexedDbRowFromOfflineCacheEntry(
          entry,
        ),
      );

      const stored =
        await resolvedDatabase.get(
          indexedDbOfflineCacheEntryStore,
          entry.id,
        );

      if (!stored) {
        throw new Error(
          "IndexedDB did not return the updated Offline Cache entry.",
        );
      }

      return offlineCacheEntryFromIndexedDbRow(
        stored,
      );
    },

    async list({
      userId,
      deviceId,
      statuses,
      limit,
    }) {
      const resolvedDatabase =
        await getDatabase();

      const results = [];

      for (
        const status of statuses
      ) {
        const transaction =
          resolvedDatabase.transaction(
            indexedDbOfflineCacheEntryStore,
            "readonly",
          );

        const index =
          transaction
            .objectStore(
              indexedDbOfflineCacheEntryStore,
            )
            .index(
              indexedDbOfflineCacheOwnershipStatusSequenceIndex,
            );

        let cursor =
          await index.openCursor(
            IDBKeyRange.bound(
              [
                userId,
                deviceId,
                status,
                0,
              ],
              [
                userId,
                deviceId,
                status,
                Number.MAX_SAFE_INTEGER,
              ],
            ),
          );

        while (cursor) {
          results.push(
            offlineCacheEntryFromIndexedDbRow(
              cursor.value,
            ),
          );

          cursor =
            await cursor.continue();
        }

        await transaction.done;
      }

      return results
        .sort(
          (
            first,
            second,
          ) =>
            first.envelope.sequence -
              second.envelope.sequence ||
            first.envelope.occurredAt.localeCompare(
              second.envelope.occurredAt,
            ) ||
            first.id.localeCompare(
              second.id,
            ),
        )
        .slice(
          0,
          limit,
        );
    },
  };
}
