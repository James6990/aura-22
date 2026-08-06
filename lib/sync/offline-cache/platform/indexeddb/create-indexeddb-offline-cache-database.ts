import {
  deleteDB,
  openDB,
  type DBSchema,
  type IDBPDatabase,
} from "idb";

import type {
  OfflineCacheEntry,
  OfflineCacheEntryStatus,
} from "@/lib/sync/offline-cache/contracts";

export const indexedDbOfflineCacheDatabaseVersion =
  1 as const;

export const indexedDbOfflineCacheEntryStore =
  "offline-cache-entries" as const;

export const indexedDbOfflineCacheOwnershipSequenceIndex =
  "by-ownership-sequence" as const;

export const indexedDbOfflineCacheOwnershipStatusSequenceIndex =
  "by-ownership-status-sequence" as const;

export type IndexedDbOfflineCacheEntryRow = {
  id:
    string;

  userId:
    string;

  deviceId:
    string;

  sequence:
    number;

  status:
    OfflineCacheEntryStatus;

  entry:
    OfflineCacheEntry;
};

export interface IndexedDbOfflineCacheSchema
  extends DBSchema {
  "offline-cache-entries": {
    key:
      string;

    value:
      IndexedDbOfflineCacheEntryRow;

    indexes: {
      "by-ownership-sequence": [
        string,
        string,
        number,
      ];

      "by-ownership-status-sequence": [
        string,
        string,
        OfflineCacheEntryStatus,
        number,
      ];
    };
  };
}

export type IndexedDbOfflineCacheDatabase =
  IDBPDatabase<
    IndexedDbOfflineCacheSchema
  >;

export type CreateIndexedDbOfflineCacheDatabaseOptions = {
  databaseName?:
    string;
};

export const defaultIndexedDbOfflineCacheDatabaseName =
  "apex-offline-cache";

export async function createIndexedDbOfflineCacheDatabase({
  databaseName =
    defaultIndexedDbOfflineCacheDatabaseName,
}: CreateIndexedDbOfflineCacheDatabaseOptions = {}):
  Promise<
    IndexedDbOfflineCacheDatabase
  > {
  return openDB<
    IndexedDbOfflineCacheSchema
  >(
    databaseName,
    indexedDbOfflineCacheDatabaseVersion,
    {
      upgrade(
        database,
      ) {
        if (
          !database.objectStoreNames
            .contains(
              indexedDbOfflineCacheEntryStore,
            )
        ) {
          const store =
            database.createObjectStore(
              indexedDbOfflineCacheEntryStore,
              {
                keyPath:
                  "id",
              },
            );

          store.createIndex(
            indexedDbOfflineCacheOwnershipSequenceIndex,
            [
              "userId",
              "deviceId",
              "sequence",
            ],
          );

          store.createIndex(
            indexedDbOfflineCacheOwnershipStatusSequenceIndex,
            [
              "userId",
              "deviceId",
              "status",
              "sequence",
            ],
          );
        }
      },
    },
  );
}

export async function deleteIndexedDbOfflineCacheDatabase({
  databaseName =
    defaultIndexedDbOfflineCacheDatabaseName,
}: CreateIndexedDbOfflineCacheDatabaseOptions = {}):
  Promise<void> {
  await deleteDB(
    databaseName,
  );
}
