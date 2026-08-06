import assert from "node:assert/strict";

import {
  createOfflineCacheMigrationRunner,
  type OfflineCacheSchemaVersionStorage,
} from "./create-offline-cache-migration-runner";

import type {
  ExecutableOfflineCacheMigration,
} from "./execute-offline-cache-migrations";

async function run() {
  let persistedVersion =
    1;

  const calls:
    string[] = [];

  const versionStorage:
    OfflineCacheSchemaVersionStorage = {
      async getSchemaVersion() {
        calls.push(
          "read-version",
        );

        return persistedVersion;
      },

      async setSchemaVersion(
        version,
      ) {
        calls.push(
          `write-version:${version}`,
        );

        persistedVersion =
          version;
      },
    };

  const migrations:
    ExecutableOfflineCacheMigration[] = [
      {
        fromVersion:
          1,

        toVersion:
          2,

        description:
          "Add retry metadata.",

        async execute() {
          calls.push(
            "migrate:1-to-2",
          );
        },
      },
      {
        fromVersion:
          2,

        toVersion:
          3,

        description:
          "Add recovery metadata.",

        async execute() {
          calls.push(
            "migrate:2-to-3",
          );
        },
      },
    ];

  const runner =
    createOfflineCacheMigrationRunner({
      versionStorage,
      targetVersion:
        3,
      migrations,
    });

  const result =
    await runner.run();

  assert.deepEqual(
    calls,
    [
      "read-version",
      "migrate:1-to-2",
      "migrate:2-to-3",
      "write-version:3",
    ],
  );

  assert.equal(
    persistedVersion,
    3,
  );

  assert.equal(
    result.status,
    "migrated",
  );

  assert.equal(
    result.initialVersion,
    1,
  );

  assert.equal(
    result.finalVersion,
    3,
  );

  calls.length =
    0;

  const currentResult =
    await runner.run();

  assert.deepEqual(
    calls,
    [
      "read-version",
    ],
  );

  assert.equal(
    currentResult.status,
    "already-current",
  );

  assert.deepEqual(
    currentResult
      .appliedMigrations,
    [],
  );

  let failingVersion =
    1;

  let versionWriteCalled =
    false;

  const failingStorage:
    OfflineCacheSchemaVersionStorage = {
      async getSchemaVersion() {
        return failingVersion;
      },

      async setSchemaVersion(
        version,
      ) {
        versionWriteCalled =
          true;

        failingVersion =
          version;
      },
    };

  const failingRunner =
    createOfflineCacheMigrationRunner({
      versionStorage:
        failingStorage,

      targetVersion:
        3,

      migrations: [
        {
          fromVersion:
            1,

          toVersion:
            2,

          description:
            "First migration.",

          async execute() {
            return;
          },
        },
        {
          fromVersion:
            2,

          toVersion:
            3,

          description:
            "Failing migration.",

          async execute() {
            throw new Error(
              "Migration storage failure.",
            );
          },
        },
      ],
    });

  await assert.rejects(
    () =>
      failingRunner.run(),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Migration storage failure.",
  );

  assert.equal(
    versionWriteCalled,
    false,
  );

  assert.equal(
    failingVersion,
    1,
  );

  console.log(
    "Offline Cache migration runner tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
