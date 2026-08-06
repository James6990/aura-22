import {
  executeOfflineCacheMigrations,
  type ExecutableOfflineCacheMigration,
  type ExecuteOfflineCacheMigrationsResult,
} from "./execute-offline-cache-migrations";

export type OfflineCacheSchemaVersionStorage = {
  getSchemaVersion():
    Promise<number>;

  setSchemaVersion(
    version: number,
  ): Promise<void>;
};

export type OfflineCacheMigrationRunnerResult =
  ExecuteOfflineCacheMigrationsResult & {
    status:
      | "already-current"
      | "migrated";
  };

export type OfflineCacheMigrationRunner = {
  run(): Promise<
    OfflineCacheMigrationRunnerResult
  >;
};

export function createOfflineCacheMigrationRunner({
  versionStorage,
  targetVersion,
  migrations,
}: {
  versionStorage:
    OfflineCacheSchemaVersionStorage;

  targetVersion:
    number;

  migrations:
    readonly ExecutableOfflineCacheMigration[];
}): OfflineCacheMigrationRunner {
  return {
    async run() {
      const currentVersion =
        await versionStorage
          .getSchemaVersion();

      const result =
        await executeOfflineCacheMigrations({
          currentVersion,
          targetVersion,
          migrations,
        });

      if (
        result.finalVersion !==
        currentVersion
      ) {
        await versionStorage
          .setSchemaVersion(
            result.finalVersion,
          );
      }

      return {
        ...result,

        status:
          result.appliedMigrations
            .length === 0
            ? "already-current"
            : "migrated",
      };
    },
  };
}
