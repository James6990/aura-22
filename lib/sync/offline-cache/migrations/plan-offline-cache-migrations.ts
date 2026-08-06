export type OfflineCacheMigration = {
  fromVersion:
    number;

  toVersion:
    number;

  description:
    string;
};

function requireSchemaVersion(
  value: number,
  label: string,
  allowUninitialised = false,
) {
  const minimum =
    allowUninitialised
      ? 0
      : 1;

  if (
    !Number.isInteger(value) ||
    value < minimum
  ) {
    throw new Error(
      allowUninitialised
        ? `${label} must be a non-negative integer.`
        : `${label} must be a positive integer.`,
    );
  }

  return value;
}

function requireDescription(
  value: string,
) {
  const resolved =
    value.trim();

  if (!resolved) {
    throw new Error(
      "Offline Cache migration description is required.",
    );
  }

  return resolved;
}

export function planOfflineCacheMigrations({
  currentVersion,
  targetVersion,
  migrations,
}: {
  currentVersion:
    number;

  targetVersion:
    number;

  migrations:
    readonly OfflineCacheMigration[];
}): OfflineCacheMigration[] {
  const resolvedCurrentVersion =
    requireSchemaVersion(
      currentVersion,
      "Offline Cache current schema version",
      true,
    );

  const resolvedTargetVersion =
    requireSchemaVersion(
      targetVersion,
      "Offline Cache target schema version",
    );

  if (
    resolvedCurrentVersion >
    resolvedTargetVersion
  ) {
    throw new Error(
      "Offline Cache schema downgrades are not supported.",
    );
  }

  if (
    resolvedCurrentVersion ===
    resolvedTargetVersion
  ) {
    return [];
  }

  const migrationsByVersion =
    new Map<
      number,
      OfflineCacheMigration
    >();

  for (
    const migration of migrations
  ) {
    const fromVersion =
      requireSchemaVersion(
        migration.fromVersion,
        "Offline Cache migration fromVersion",
        true,
      );

    const toVersion =
      requireSchemaVersion(
        migration.toVersion,
        "Offline Cache migration toVersion",
      );

    requireDescription(
      migration.description,
    );

    if (
      toVersion !==
      fromVersion + 1
    ) {
      throw new Error(
        "Offline Cache migrations must advance exactly one schema version.",
      );
    }

    if (
      migrationsByVersion.has(
        fromVersion,
      )
    ) {
      throw new Error(
        `Offline Cache migration from version ${fromVersion} is duplicated.`,
      );
    }

    migrationsByVersion.set(
      fromVersion,
      {
        ...migration,
        description:
          migration.description.trim(),
      },
    );
  }

  const plan:
    OfflineCacheMigration[] = [];

  let version =
    resolvedCurrentVersion;

  while (
    version <
    resolvedTargetVersion
  ) {
    const migration =
      migrationsByVersion.get(
        version,
      );

    if (!migration) {
      throw new Error(
        `Offline Cache migration from version ${version} is missing.`,
      );
    }

    plan.push({
      ...migration,
    });

    version =
      migration.toVersion;
  }

  return plan;
}
