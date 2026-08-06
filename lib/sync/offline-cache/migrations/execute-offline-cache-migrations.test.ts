import assert from "node:assert/strict";

import {
  executeOfflineCacheMigrations,
  type ExecutableOfflineCacheMigration,
} from "./execute-offline-cache-migrations";

async function run() {
  const calls:
    string[] = [];

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
            "1-to-2",
          );
        },
      },
      {
        fromVersion:
          2,

        toVersion:
          3,

        description:
          "Add recovery state.",

        async execute() {
          calls.push(
            "2-to-3",
          );
        },
      },
    ];

  const result =
    await executeOfflineCacheMigrations({
      currentVersion:
        1,

      targetVersion:
        3,

      migrations,
    });

  assert.deepEqual(
    calls,
    [
      "1-to-2",
      "2-to-3",
    ],
  );

  assert.deepEqual(
    result,
    {
      initialVersion:
        1,

      finalVersion:
        3,

      appliedMigrations: [
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
      ],
    },
  );

  calls.length =
    0;

  const noChange =
    await executeOfflineCacheMigrations({
      currentVersion:
        3,

      targetVersion:
        3,

      migrations,
    });

  assert.deepEqual(
    calls,
    [],
  );

  assert.deepEqual(
    noChange,
    {
      initialVersion:
        3,

      finalVersion:
        3,

      appliedMigrations:
        [],
    },
  );

  const retryCalls:
    string[] = [];

  let failOnce =
    true;

  const retryable:
    ExecutableOfflineCacheMigration[] = [
      {
        fromVersion:
          1,

        toVersion:
          2,

        description:
          "First step.",

        async execute() {
          retryCalls.push(
            "first",
          );
        },
      },
      {
        fromVersion:
          2,

        toVersion:
          3,

        description:
          "Second step.",

        async execute() {
          retryCalls.push(
            "second",
          );

          if (failOnce) {
            failOnce =
              false;

            throw new Error(
              "Temporary migration failure.",
            );
          }
        },
      },
    ];

  await assert.rejects(
    () =>
      executeOfflineCacheMigrations({
        currentVersion:
          1,

        targetVersion:
          3,

        migrations:
          retryable,
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Temporary migration failure.",
  );

  assert.deepEqual(
    retryCalls,
    [
      "first",
      "second",
    ],
  );

  retryCalls.length =
    0;

  const resumed =
    await executeOfflineCacheMigrations({
      currentVersion:
        2,

      targetVersion:
        3,

      migrations:
        retryable,
    });

  assert.deepEqual(
    retryCalls,
    [
      "second",
    ],
  );

  assert.equal(
    resumed.finalVersion,
    3,
  );

  console.log(
    "Offline Cache migration executor tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
