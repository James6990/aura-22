import {
  planOfflineCacheMigrations,
  type OfflineCacheMigration,
} from "./plan-offline-cache-migrations";

export type ExecutableOfflineCacheMigration =
  OfflineCacheMigration & {
    execute():
      Promise<void>;
  };

export type ExecuteOfflineCacheMigrationsResult = {
  initialVersion:
    number;

  finalVersion:
    number;

  appliedMigrations:
    OfflineCacheMigration[];
};

export async function executeOfflineCacheMigrations({
  currentVersion,
  targetVersion,
  migrations,
}: {
  currentVersion:
    number;

  targetVersion:
    number;

  migrations:
    readonly ExecutableOfflineCacheMigration[];
}): Promise<
  ExecuteOfflineCacheMigrationsResult
> {
  const plan =
    planOfflineCacheMigrations({
      currentVersion,
      targetVersion,
      migrations,
    });

  const appliedMigrations:
    OfflineCacheMigration[] = [];

  let finalVersion =
    currentVersion;

  for (
    const migration of plan
  ) {
    const executable =
      migrations.find(
        (candidate) =>
          candidate.fromVersion ===
            migration.fromVersion &&
          candidate.toVersion ===
            migration.toVersion,
      );

    if (!executable) {
      throw new Error(
        `Offline Cache executable migration from version ${migration.fromVersion} is missing.`,
      );
    }

    await executable.execute();

    appliedMigrations.push({
      fromVersion:
        migration.fromVersion,

      toVersion:
        migration.toVersion,

      description:
        migration.description,
    });

    finalVersion =
      migration.toVersion;
  }

  return {
    initialVersion:
      currentVersion,

    finalVersion,

    appliedMigrations,
  };
}
