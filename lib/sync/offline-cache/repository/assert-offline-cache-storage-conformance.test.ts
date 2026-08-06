import type {
  OfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import {
  assertOfflineCacheStorageConformance,
} from "./assert-offline-cache-storage-conformance";

import type {
  OfflineCacheStorage,
} from "./create-offline-cache-repository";

function cloneEntry(
  entry:
    OfflineCacheEntry,
): OfflineCacheEntry {
  return JSON.parse(
    JSON.stringify(entry),
  );
}

function createMemoryStorage():
  OfflineCacheStorage {
  const entries =
    new Map<
      string,
      OfflineCacheEntry
    >();

  return {
    async getById(
      entryId,
    ) {
      const entry =
        entries.get(
          entryId,
        );

      return entry
        ? cloneEntry(entry)
        : null;
    },

    async getHighestSequence({
      userId,
      deviceId,
    }) {
      let highest =
        0;

      for (
        const entry of
        entries.values()
      ) {
        if (
          entry.userId === userId &&
          entry.deviceId ===
            deviceId
        ) {
          highest =
            Math.max(
              highest,
              entry.envelope
                .sequence,
            );
        }
      }

      return highest;
    },

    async insert(
      entry,
    ) {
      const stored =
        cloneEntry(entry);

      entries.set(
        stored.id,
        stored,
      );

      return cloneEntry(
        stored,
      );
    },

    async update(
      entry,
    ) {
      const stored =
        cloneEntry(entry);

      entries.set(
        stored.id,
        stored,
      );

      return cloneEntry(
        stored,
      );
    },

    async list({
      userId,
      deviceId,
      statuses,
      limit,
    }) {
      return [
        ...entries.values(),
      ]
        .filter(
          (entry) =>
            entry.userId ===
              userId &&
            entry.deviceId ===
              deviceId &&
            statuses.includes(
              entry.status,
            ),
        )
        .slice(
          0,
          limit,
        )
        .map(
          cloneEntry,
        );
    },
  };
}

async function run() {
  await assertOfflineCacheStorageConformance({
    async createStorage() {
      return createMemoryStorage();
    },
  });

  console.log(
    "Offline Cache storage conformance tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
