import assert from "node:assert/strict";

import {
  createSQLiteOfflineCacheStorage,
} from "./create-sqlite-offline-cache-storage";

import type {
  SQLiteOfflineCacheConnection,
} from "./create-sqlite-offline-cache-database";

async function run() {
  const sequences =
    new Map<
      string,
      number
    >([
      [
        "user-1:device-1",
        3,
      ],
      [
        "user-1:device-2",
        9,
      ],
      [
        "user-2:device-1",
        7,
      ],
    ]);

  const calls:
    string[] = [];

  const connection = {
    async query(
      statement:
        string,
      values?:
        unknown[],
    ) {
      assert.match(
        statement,
        /MAX\(sequence\)/,
      );

      const userId =
        String(
          values?.[0] ??
          "",
        );

      const deviceId =
        String(
          values?.[1] ??
          "",
        );

      calls.push(
        `${userId}:${deviceId}`,
      );

      const highestSequence =
        sequences.get(
          `${userId}:${deviceId}`,
        );

      return {
        values: [
          {
            highest_sequence:
              highestSequence ??
              null,
          },
        ],
      };
    },
  } as SQLiteOfflineCacheConnection;

  const storage =
    createSQLiteOfflineCacheStorage({
      connection,
    });

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-1",

      deviceId:
        "device-1",
    }),
    3,
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-1",

      deviceId:
        "device-2",
    }),
    9,
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "user-2",

      deviceId:
        "device-1",
    }),
    7,
  );

  assert.equal(
    await storage.getHighestSequence({
      userId:
        "missing-user",

      deviceId:
        "missing-device",
    }),
    0,
  );

  assert.deepEqual(
    calls,
    [
      "user-1:device-1",
      "user-1:device-2",
      "user-2:device-1",
      "missing-user:missing-device",
    ],
  );

  const invalidStorage =
    createSQLiteOfflineCacheStorage({
      connection: {
        async query() {
          return {
            values: [
              {
                highest_sequence:
                  "not-a-number",
              },
            ],
          };
        },
      } as unknown as
        SQLiteOfflineCacheConnection,
    });

  await assert.rejects(
    () =>
      invalidStorage
        .getHighestSequence({
          userId:
            "user-1",

          deviceId:
            "device-1",
        }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "SQLite returned an invalid Offline Cache highest sequence.",
  );

  console.log(
    "SQLite Offline Cache sequence tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
