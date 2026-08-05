import {
  compareOfflineCacheEntries,
  sameOfflineCacheEntry,
  validateOfflineCacheEntry,
  type OfflineCacheConflict,
  type OfflineCacheEntry,
  type OfflineCacheEntryStatus,
} from "@/lib/sync/offline-cache/contracts";

export type OfflineCacheStorage = {
  getById(
    entryId: string,
  ): Promise<
    OfflineCacheEntry | null
  >;

  getHighestSequence({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }): Promise<number>;

  insert(
    entry:
      OfflineCacheEntry,
  ): Promise<
    OfflineCacheEntry
  >;

  update(
    entry:
      OfflineCacheEntry,
  ): Promise<
    OfflineCacheEntry
  >;

  list({
    userId,
    deviceId,
    statuses,
    limit,
  }: {
    userId: string;
    deviceId: string;
    statuses:
      OfflineCacheEntryStatus[];
    limit: number;
  }): Promise<
    OfflineCacheEntry[]
  >;
};

export type OfflineCacheRepository = {
  save(
    entry:
      OfflineCacheEntry,
  ): Promise<
    OfflineCacheEntry
  >;

  getById({
    entryId,
    userId,
    deviceId,
  }: {
    entryId: string;
    userId: string;
    deviceId: string;
  }): Promise<
    OfflineCacheEntry | null
  >;

  list({
    userId,
    deviceId,
    statuses,
    limit,
  }: {
    userId: string;
    deviceId: string;
    statuses?:
      OfflineCacheEntryStatus[];
    limit?: number;
  }): Promise<
    OfflineCacheEntry[]
  >;

  markApplied({
    entryId,
    userId,
    deviceId,
    updatedAt,
  }: {
    entryId: string;
    userId: string;
    deviceId: string;
    updatedAt: string;
  }): Promise<
    OfflineCacheEntry
  >;

  markConflicted({
    entryId,
    userId,
    deviceId,
    conflict,
    updatedAt,
  }: {
    entryId: string;
    userId: string;
    deviceId: string;
    conflict:
      OfflineCacheConflict;
    updatedAt: string;
  }): Promise<
    OfflineCacheEntry
  >;

  markInvalid({
    entryId,
    userId,
    deviceId,
    updatedAt,
  }: {
    entryId: string;
    userId: string;
    deviceId: string;
    updatedAt: string;
  }): Promise<
    OfflineCacheEntry
  >;
};

function requireIdentifier(
  value: string,
  label: string,
) {
  const resolved =
    value.trim();

  if (!resolved) {
    throw new Error(
      `${label} is required.`,
    );
  }

  return resolved;
}

function requireIsoDate(
  value: string,
  label: string,
) {
  const resolved =
    value.trim();

  const parsed =
    new Date(resolved);

  if (
    !resolved ||
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    throw new Error(
      `${label} must be a valid ISO date.`,
    );
  }

  return resolved;
}

function assertOwnership({
  entry,
  userId,
  deviceId,
}: {
  entry:
    OfflineCacheEntry;
  userId: string;
  deviceId: string;
}) {
  if (
    entry.userId !== userId ||
    entry.deviceId !== deviceId
  ) {
    throw new Error(
      "Offline Cache entry belongs to another user or device.",
    );
  }
}

export function createOfflineCacheRepository(
  storage:
    OfflineCacheStorage,
): OfflineCacheRepository {
  async function requireOwnedEntry({
    entryId,
    userId,
    deviceId,
  }: {
    entryId: string;
    userId: string;
    deviceId: string;
  }) {
    const resolvedEntryId =
      requireIdentifier(
        entryId,
        "Offline Cache entry id",
      );

    const resolvedUserId =
      requireIdentifier(
        userId,
        "Offline Cache user id",
      );

    const resolvedDeviceId =
      requireIdentifier(
        deviceId,
        "Offline Cache device id",
      );

    const entry =
      await storage.getById(
        resolvedEntryId,
      );

    if (!entry) {
      throw new Error(
        `Offline Cache entry "${resolvedEntryId}" was not found.`,
      );
    }

    validateOfflineCacheEntry(
      entry,
    );

    assertOwnership({
      entry,
      userId:
        resolvedUserId,
      deviceId:
        resolvedDeviceId,
    });

    return entry;
  }

  return {
    async save(
      entry,
    ) {
      validateOfflineCacheEntry(
        entry,
      );

      const existing =
        await storage.getById(
          entry.id,
        );

      if (existing) {
        validateOfflineCacheEntry(
          existing,
        );

        if (
          sameOfflineCacheEntry(
            existing,
            entry,
          )
        ) {
          return existing;
        }

        throw new Error(
          "Offline Cache entry id already exists with different data.",
        );
      }

      const highestSequence =
        await storage
          .getHighestSequence({
            userId:
              entry.userId,
            deviceId:
              entry.deviceId,
          });

      if (
        entry.envelope.sequence <=
        highestSequence
      ) {
        throw new Error(
          `Offline Cache sequence must be greater than ${highestSequence}.`,
        );
      }

      const inserted =
        await storage.insert({
          ...entry,
          envelope: {
            ...entry.envelope,
          },
          conflict:
            entry.conflict
              ? {
                  ...entry.conflict,
                }
              : null,
        });

      validateOfflineCacheEntry(
        inserted,
      );

      assertOwnership({
        entry:
          inserted,
        userId:
          entry.userId,
        deviceId:
          entry.deviceId,
      });

      return inserted;
    },

    async getById({
      entryId,
      userId,
      deviceId,
    }) {
      const resolvedEntryId =
        requireIdentifier(
          entryId,
          "Offline Cache entry id",
        );

      const resolvedUserId =
        requireIdentifier(
          userId,
          "Offline Cache user id",
        );

      const resolvedDeviceId =
        requireIdentifier(
          deviceId,
          "Offline Cache device id",
        );

      const entry =
        await storage.getById(
          resolvedEntryId,
        );

      if (!entry) {
        return null;
      }

      validateOfflineCacheEntry(
        entry,
      );

      assertOwnership({
        entry,
        userId:
          resolvedUserId,
        deviceId:
          resolvedDeviceId,
      });

      return entry;
    },

    async list({
      userId,
      deviceId,
      statuses = [
        "staged",
        "applied",
        "conflicted",
        "invalid",
      ],
      limit = 100,
    }) {
      const resolvedUserId =
        requireIdentifier(
          userId,
          "Offline Cache user id",
        );

      const resolvedDeviceId =
        requireIdentifier(
          deviceId,
          "Offline Cache device id",
        );

      if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 500
      ) {
        throw new Error(
          "Offline Cache list limit must be between 1 and 500.",
        );
      }

      if (
        statuses.length < 1
      ) {
        throw new Error(
          "Offline Cache list requires at least one status.",
        );
      }

      const entries =
        await storage.list({
          userId:
            resolvedUserId,
          deviceId:
            resolvedDeviceId,
          statuses: [
            ...statuses,
          ],
          limit,
        });

      for (
        const entry of entries
      ) {
        validateOfflineCacheEntry(
          entry,
        );

        assertOwnership({
          entry,
          userId:
            resolvedUserId,
          deviceId:
            resolvedDeviceId,
        });

        if (
          !statuses.includes(
            entry.status,
          )
        ) {
          throw new Error(
            "Offline Cache storage returned an entry with an unrequested status.",
          );
        }
      }

      return [
        ...entries,
      ].sort(
        compareOfflineCacheEntries,
      );
    },

    async markApplied({
      entryId,
      userId,
      deviceId,
      updatedAt,
    }) {
      const entry =
        await requireOwnedEntry({
          entryId,
          userId,
          deviceId,
        });

      const updated:
        OfflineCacheEntry = {
          ...entry,
          status:
            "applied",
          conflict:
            null,
          updatedAt:
            requireIsoDate(
              updatedAt,
              "Offline Cache updatedAt",
            ),
        };

      validateOfflineCacheEntry(
        updated,
      );

      const stored =
        await storage.update(
          updated,
        );

      validateOfflineCacheEntry(
        stored,
      );

      assertOwnership({
        entry:
          stored,
        userId:
          entry.userId,
        deviceId:
          entry.deviceId,
      });

      if (
        stored.status !==
        updated.status
      ) {
        throw new Error(
          "Offline Cache storage returned an unexpected lifecycle status.",
        );
      }

      return stored;
    },

    async markConflicted({
      entryId,
      userId,
      deviceId,
      conflict,
      updatedAt,
    }) {
      const entry =
        await requireOwnedEntry({
          entryId,
          userId,
          deviceId,
        });

      const updated:
        OfflineCacheEntry = {
          ...entry,
          status:
            "conflicted",
          conflict: {
            ...conflict,
          },
          updatedAt:
            requireIsoDate(
              updatedAt,
              "Offline Cache updatedAt",
            ),
        };

      validateOfflineCacheEntry(
        updated,
      );

      const stored =
        await storage.update(
          updated,
        );

      validateOfflineCacheEntry(
        stored,
      );

      assertOwnership({
        entry:
          stored,
        userId:
          entry.userId,
        deviceId:
          entry.deviceId,
      });

      if (
        stored.status !==
        updated.status
      ) {
        throw new Error(
          "Offline Cache storage returned an unexpected lifecycle status.",
        );
      }

      return stored;
    },

    async markInvalid({
      entryId,
      userId,
      deviceId,
      updatedAt,
    }) {
      const entry =
        await requireOwnedEntry({
          entryId,
          userId,
          deviceId,
        });

      const updated:
        OfflineCacheEntry = {
          ...entry,
          status:
            "invalid",
          conflict:
            null,
          updatedAt:
            requireIsoDate(
              updatedAt,
              "Offline Cache updatedAt",
            ),
        };

      validateOfflineCacheEntry(
        updated,
      );

      const stored =
        await storage.update(
          updated,
        );

      validateOfflineCacheEntry(
        stored,
      );

      assertOwnership({
        entry:
          stored,
        userId:
          entry.userId,
        deviceId:
          entry.deviceId,
      });

      if (
        stored.status !==
        updated.status
      ) {
        throw new Error(
          "Offline Cache storage returned an unexpected lifecycle status.",
        );
      }

      return stored;
    },
  };
}
