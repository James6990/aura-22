import {
  planOfflineCacheMigrations,
  type OfflineCacheMigration,
} from "@/lib/sync/offline-cache/migrations";

import type {
  IndexedDbOfflineCacheDatabase,
  IndexedDbOfflineCacheSchema,
} from "./create-indexeddb-offline-cache-database";

import type {
  IDBPTransaction,
  StoreNames,
} from "idb";

export type IndexedDbOfflineCacheUpgradeTransaction =
  IDBPTransaction<
    IndexedDbOfflineCacheSchema,
    StoreNames<
      IndexedDbOfflineCacheSchema
    >[],
    "versionchange"
  >;

export type IndexedDbOfflineCacheMigration =
  OfflineCacheMigration & {
    execute(input: {
      database:
        IndexedDbOfflineCacheDatabase;

      transaction:
        IndexedDbOfflineCacheUpgradeTransaction;
    }): void;
  };

export function runIndexedDbOfflineCacheMigrations({
  database,
  transaction,
  oldVersion,
  newVersion,
  migrations,
}: {
  database:
    IndexedDbOfflineCacheDatabase;

  transaction:
    IndexedDbOfflineCacheUpgradeTransaction;

  oldVersion:
    number;

  newVersion:
    number | null;

  migrations:
    readonly IndexedDbOfflineCacheMigration[];
}): OfflineCacheMigration[] {
  if (newVersion === null) {
    throw new Error(
      "IndexedDB Offline Cache upgrade target version is required.",
    );
  }

  const plan =
    planOfflineCacheMigrations({
      currentVersion:
        oldVersion,

      targetVersion:
        newVersion,

      migrations,
    });

  for (
    const plannedMigration of
    plan
  ) {
    const migration =
      migrations.find(
        (candidate) =>
          candidate.fromVersion ===
            plannedMigration
              .fromVersion &&
          candidate.toVersion ===
            plannedMigration
              .toVersion,
      );

    if (!migration) {
      throw new Error(
        `IndexedDB Offline Cache executable migration from version ${plannedMigration.fromVersion} is missing.`,
      );
    }

    migration.execute({
      database,
      transaction,
    });
  }

  return plan.map(
    (migration) => ({
      fromVersion:
        migration.fromVersion,

      toVersion:
        migration.toVersion,

      description:
        migration.description,
    }),
  );
}
