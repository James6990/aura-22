import {
  createDecisionMemoryEventAnalyticsSnapshot,
  validateDecisionMemoryEventAnalyticsSnapshot,
  type DecisionMemoryEventAnalyticsSnapshot,
} from "@/lib/analytics/events/contracts";

export type EventAnalyticsSnapshotRow = {
  id:
    string;

  userId:
    string;

  windowStartAt:
    string;

  windowEndAt:
    string;

  generatedAt:
    string;

  schemaVersion:
    number;

  snapshot:
    DecisionMemoryEventAnalyticsSnapshot;

  createdAt:
    string;

  updatedAt:
    string;
};

export type EventAnalyticsSnapshotWrite = {
  id:
    string;

  userId:
    string;

  windowStartAt:
    string;

  windowEndAt:
    string;

  generatedAt:
    string;

  schemaVersion:
    number;

  snapshot:
    DecisionMemoryEventAnalyticsSnapshot;

  updatedAt:
    string;
};

export type EventAnalyticsSnapshotStorage = {
  getById({
    snapshotId,
    userId,
  }: {
    snapshotId: string;
    userId: string;
  }): Promise<
    EventAnalyticsSnapshotRow | null
  >;

  upsert(
    value:
      EventAnalyticsSnapshotWrite,
  ): Promise<
    EventAnalyticsSnapshotRow
  >;

  listByWindow({
    userId,
    startAt,
    endAt,
    limit,
  }: {
    userId: string;
    startAt: string;
    endAt: string;
    limit: number;
  }): Promise<
    EventAnalyticsSnapshotRow[]
  >;
};

export type EventAnalyticsSnapshotRepository = {
  getById({
    snapshotId,
    userId,
  }: {
    snapshotId: string;
    userId: string;
  }): Promise<
    DecisionMemoryEventAnalyticsSnapshot | null
  >;

  save(
    snapshot:
      DecisionMemoryEventAnalyticsSnapshot,
  ): Promise<
    DecisionMemoryEventAnalyticsSnapshot
  >;

  listByWindow({
    userId,
    startAt,
    endAt,
    limit,
  }: {
    userId: string;
    startAt: string;
    endAt: string;
    limit?: number;
  }): Promise<
    DecisionMemoryEventAnalyticsSnapshot[]
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
    new Date(
      resolved,
    );

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

function requireLimit(
  value: number,
) {
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 500
  ) {
    throw new Error(
      "Event Analytics repository limit must be an integer between 1 and 500.",
    );
  }

  return value;
}

function sameSnapshot(
  first:
    DecisionMemoryEventAnalyticsSnapshot,
  second:
    DecisionMemoryEventAnalyticsSnapshot,
) {
  return (
    JSON.stringify(first) ===
    JSON.stringify(second)
  );
}

function assertRowConsistency(
  row:
    EventAnalyticsSnapshotRow,
) {
  validateDecisionMemoryEventAnalyticsSnapshot(
    row.snapshot,
  );

  if (
    row.id !==
    row.snapshot.id
  ) {
    throw new Error(
      "Event Analytics row id does not match its snapshot.",
    );
  }

  if (
    row.userId !==
    row.snapshot.userId
  ) {
    throw new Error(
      "Event Analytics row user does not match its snapshot.",
    );
  }

  if (
    row.windowStartAt !==
    row.snapshot.window.startAt ||
    row.windowEndAt !==
    row.snapshot.window.endAt
  ) {
    throw new Error(
      "Event Analytics row window does not match its snapshot.",
    );
  }

  if (
    row.generatedAt !==
    row.snapshot.generatedAt
  ) {
    throw new Error(
      "Event Analytics row generatedAt does not match its snapshot.",
    );
  }

  if (
    row.schemaVersion !==
    row.snapshot.schemaVersion
  ) {
    throw new Error(
      "Event Analytics row schema version does not match its snapshot.",
    );
  }

  requireIsoDate(
    row.createdAt,
    "Event Analytics row createdAt",
  );

  requireIsoDate(
    row.updatedAt,
    "Event Analytics row updatedAt",
  );
}

function hydrateRow(
  row:
    EventAnalyticsSnapshotRow,
) {
  assertRowConsistency(
    row,
  );

  return createDecisionMemoryEventAnalyticsSnapshot(
    row.snapshot,
  );
}

function compareRows(
  first:
    EventAnalyticsSnapshotRow,
  second:
    EventAnalyticsSnapshotRow,
) {
  return (
    new Date(
      second.windowEndAt,
    ).getTime() -
      new Date(
        first.windowEndAt,
      ).getTime() ||
    new Date(
      second.generatedAt,
    ).getTime() -
      new Date(
        first.generatedAt,
      ).getTime() ||
    first.id.localeCompare(
      second.id,
    )
  );
}

export function createEventAnalyticsSnapshotRepository(
  storage:
    EventAnalyticsSnapshotStorage,
): EventAnalyticsSnapshotRepository {
  return {
    async getById({
      snapshotId,
      userId,
    }) {
      const resolvedSnapshotId =
        requireIdentifier(
          snapshotId,
          "Event Analytics snapshot id",
        );

      const resolvedUserId =
        requireIdentifier(
          userId,
          "Event Analytics user id",
        );

      const row =
        await storage.getById({
          snapshotId:
            resolvedSnapshotId,

          userId:
            resolvedUserId,
        });

      if (!row) {
        return null;
      }

      if (
        row.userId !==
        resolvedUserId
      ) {
        throw new Error(
          "Event Analytics storage returned data belonging to another user.",
        );
      }

      return hydrateRow(
        row,
      );
    },

    async save(
      snapshot,
    ) {
      validateDecisionMemoryEventAnalyticsSnapshot(
        snapshot,
      );

      const resolved =
        createDecisionMemoryEventAnalyticsSnapshot(
          snapshot,
        );

      const existing =
        await storage.getById({
          snapshotId:
            resolved.id,

          userId:
            resolved.userId,
        });

      if (existing) {
        const hydratedExisting =
          hydrateRow(
            existing,
          );

        if (
          sameSnapshot(
            hydratedExisting,
            resolved,
          )
        ) {
          return hydratedExisting;
        }

        throw new Error(
          "Event Analytics snapshot id is already used for different analytics evidence.",
        );
      }

      const now =
        new Date().toISOString();

      const row =
        await storage.upsert({
          id:
            resolved.id,

          userId:
            resolved.userId,

          windowStartAt:
            resolved.window.startAt,

          windowEndAt:
            resolved.window.endAt,

          generatedAt:
            resolved.generatedAt,

          schemaVersion:
            resolved.schemaVersion,

          snapshot:
            resolved,

          updatedAt:
            now,
        });

      if (
        row.userId !==
        resolved.userId
      ) {
        throw new Error(
          "Event Analytics storage returned a saved snapshot for another user.",
        );
      }

      const saved =
        hydrateRow(
          row,
        );

      if (
        !sameSnapshot(
          saved,
          resolved,
        )
      ) {
        throw new Error(
          "Event Analytics storage returned different snapshot evidence after save.",
        );
      }

      return saved;
    },

    async listByWindow({
      userId,
      startAt,
      endAt,
      limit = 100,
    }) {
      const resolvedUserId =
        requireIdentifier(
          userId,
          "Event Analytics user id",
        );

      const resolvedStartAt =
        requireIsoDate(
          startAt,
          "Event Analytics list startAt",
        );

      const resolvedEndAt =
        requireIsoDate(
          endAt,
          "Event Analytics list endAt",
        );

      if (
        new Date(
          resolvedStartAt,
        ).getTime() >
        new Date(
          resolvedEndAt,
        ).getTime()
      ) {
        throw new Error(
          "Event Analytics list startAt cannot be after endAt.",
        );
      }

      const resolvedLimit =
        requireLimit(
          limit,
        );

      const rows =
        await storage.listByWindow({
          userId:
            resolvedUserId,

          startAt:
            resolvedStartAt,

          endAt:
            resolvedEndAt,

          limit:
            resolvedLimit,
        });

      for (
        const row of rows
      ) {
        if (
          row.userId !==
          resolvedUserId
        ) {
          throw new Error(
            "Event Analytics storage returned list data belonging to another user.",
          );
        }
      }

      return [
        ...rows,
      ]
        .sort(
          compareRows,
        )
        .slice(
          0,
          resolvedLimit,
        )
        .map(
          hydrateRow,
        );
    },
  };
}
