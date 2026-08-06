import assert from "node:assert/strict";

import {
  planOfflineCacheMigrations,
  type OfflineCacheMigration,
} from "./plan-offline-cache-migrations";

function expectError(
  action:
    () => unknown,
  message:
    string,
) {
  assert.throws(
    action,
    (error: unknown) =>
      error instanceof Error &&
      error.message === message,
  );
}

function run() {
  const bootstrapMigration:
    OfflineCacheMigration = {
      fromVersion:
        0,

      toVersion:
        1,

      description:
        "Create the initial Offline Cache schema.",
    };

  assert.deepEqual(
    planOfflineCacheMigrations({
      currentVersion:
        0,

      targetVersion:
        1,

      migrations: [
        bootstrapMigration,
      ],
    }),
    [
      bootstrapMigration,
    ],
  );

  const migrations:
    OfflineCacheMigration[] = [
      {
        fromVersion:
          1,
        toVersion:
          2,
        description:
          "Add retry metadata.",
      },
      {
        fromVersion:
          2,
        toVersion:
          3,
        description:
          "Add recovery state.",
      },
  ];

  assert.deepEqual(
    planOfflineCacheMigrations({
      currentVersion:
        1,
      targetVersion:
        3,
      migrations,
    }),
    migrations,
  );

  assert.deepEqual(
    planOfflineCacheMigrations({
      currentVersion:
        2,
      targetVersion:
        3,
      migrations,
    }),
    [
      migrations[1],
    ],
  );

  assert.deepEqual(
    planOfflineCacheMigrations({
      currentVersion:
        3,
      targetVersion:
        3,
      migrations,
    }),
    [],
  );

  expectError(
    () =>
      planOfflineCacheMigrations({
        currentVersion:
          3,
        targetVersion:
          2,
        migrations,
      }),
    "Offline Cache schema downgrades are not supported.",
  );

  expectError(
    () =>
      planOfflineCacheMigrations({
        currentVersion:
          1,
        targetVersion:
          3,
        migrations: [
          migrations[1],
        ],
      }),
    "Offline Cache migration from version 1 is missing.",
  );

  expectError(
    () =>
      planOfflineCacheMigrations({
        currentVersion:
          1,
        targetVersion:
          2,
        migrations: [
          migrations[0],
          {
            ...migrations[0],
            description:
              "Duplicate migration.",
          },
        ],
      }),
    "Offline Cache migration from version 1 is duplicated.",
  );

  expectError(
    () =>
      planOfflineCacheMigrations({
        currentVersion:
          1,
        targetVersion:
          3,
        migrations: [
          {
            fromVersion:
              1,
            toVersion:
              3,
            description:
              "Skip a version.",
          },
        ],
      }),
    "Offline Cache migrations must advance exactly one schema version.",
  );

  console.log(
    "Offline Cache migration planner tests passed.",
  );
}

run();
