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

import {
  runIndexedDbOfflineCacheMigrations,
  type IndexedDbOfflineCacheMigration,
} from "./run-indexeddb-offline-cache-migrations";

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
        oldVersion,
        newVersion,
        transaction,
      ) {
        const migrations:
          IndexedDbOfflineCacheMigration[] = [
            {
              fromVersion:
                0,

              toVersion:
                indexedDbOfflineCacheDatabaseVersion,

              description:
                "Create the initial IndexedDB Offline Cache schema.",

              execute({
                database:
                  migrationDatabase,
              }) {
                if (
                  migrationDatabase
                    .objectStoreNames
                    .contains(
                      indexedDbOfflineCacheEntryStore,
                    )
                ) {
                  throw new Error(
                    "IndexedDB Offline Cache entry store already exists during initial migration.",
                  );
                }

                const store =
                  migrationDatabase
                    .createObjectStore(
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
              },
            },
          ];

        runIndexedDbOfflineCacheMigrations({
          database,
          transaction,
          oldVersion,
          newVersion,
          migrations,
        });
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
