import {
  buildDecisionMemoryEventAnalyticsSnapshot,
  type BuildDecisionMemoryEventAnalyticsSnapshotInput,
} from "@/lib/analytics/events/aggregation";

import {
  createDecisionMemoryEventAnalyticsSnapshot,
  type DecisionMemoryEventAnalyticsSnapshot,
  type EventAnalyticsTimeWindow,
} from "@/lib/analytics/events/contracts";

import type {
  EventAnalyticsSnapshotRepository,
} from "@/lib/analytics/events/repository";

export type GenerateEventAnalyticsSnapshotInput = {
  snapshotId:
    string;

  userId:
    string;

  window:
    EventAnalyticsTimeWindow;

  generatedAt:
    string;

  events:
    readonly unknown[];
};

export type GetEventAnalyticsSnapshotInput = {
  snapshotId:
    string;

  userId:
    string;
};

export type ListEventAnalyticsHistoryInput = {
  userId:
    string;

  startAt:
    string;

  endAt:
    string;

  limit?:
    number;
};

export type EventAnalyticsApplicationService = {
  generateAndSave(
    input:
      GenerateEventAnalyticsSnapshotInput,
  ): Promise<
    DecisionMemoryEventAnalyticsSnapshot
  >;

  get(
    input:
      GetEventAnalyticsSnapshotInput,
  ): Promise<
    DecisionMemoryEventAnalyticsSnapshot | null
  >;

  listHistory(
    input:
      ListEventAnalyticsHistoryInput,
  ): Promise<
    DecisionMemoryEventAnalyticsSnapshot[]
  >;
};

export type EventAnalyticsSnapshotBuilder = (
  input:
    BuildDecisionMemoryEventAnalyticsSnapshotInput,
) =>
  DecisionMemoryEventAnalyticsSnapshot;

export type EventAnalyticsApplicationServiceDependencies = {
  repository:
    EventAnalyticsSnapshotRepository;

  buildSnapshot?:
    EventAnalyticsSnapshotBuilder;
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

  return parsed.toISOString();
}

function requireWindow({
  startAt,
  endAt,
}: EventAnalyticsTimeWindow):
  EventAnalyticsTimeWindow {
  const resolvedStartAt =
    requireIsoDate(
      startAt,
      "Event Analytics window startAt",
    );

  const resolvedEndAt =
    requireIsoDate(
      endAt,
      "Event Analytics window endAt",
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
      "Event Analytics window startAt cannot be after endAt.",
    );
  }

  return {
    startAt:
      resolvedStartAt,

    endAt:
      resolvedEndAt,
  };
}

function cloneSnapshot(
  snapshot:
    DecisionMemoryEventAnalyticsSnapshot,
) {
  return createDecisionMemoryEventAnalyticsSnapshot(
    snapshot,
  );
}

export function createEventAnalyticsApplicationService({
  repository,
  buildSnapshot =
    buildDecisionMemoryEventAnalyticsSnapshot,
}: EventAnalyticsApplicationServiceDependencies):
  EventAnalyticsApplicationService {
  return {
    async generateAndSave({
      snapshotId,
      userId,
      window,
      generatedAt,
      events,
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

      const resolvedWindow =
        requireWindow(
          window,
        );

      const resolvedGeneratedAt =
        requireIsoDate(
          generatedAt,
          "Event Analytics generatedAt",
        );

      const snapshot =
        buildSnapshot({
          snapshotId:
            resolvedSnapshotId,

          userId:
            resolvedUserId,

          window:
            resolvedWindow,

          generatedAt:
            resolvedGeneratedAt,

          events: [
            ...events,
          ],
        });

      if (
        snapshot.id !==
          resolvedSnapshotId ||
        snapshot.userId !==
          resolvedUserId
      ) {
        throw new Error(
          "Event Analytics builder returned a snapshot with mismatched identity.",
        );
      }

      const saved =
        await repository.save(
          snapshot,
        );

      if (
        saved.id !==
          resolvedSnapshotId ||
        saved.userId !==
          resolvedUserId
      ) {
        throw new Error(
          "Event Analytics repository returned a snapshot with mismatched identity.",
        );
      }

      return cloneSnapshot(
        saved,
      );
    },

    async get({
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

      const snapshot =
        await repository.getById({
          snapshotId:
            resolvedSnapshotId,

          userId:
            resolvedUserId,
        });

      if (!snapshot) {
        return null;
      }

      if (
        snapshot.id !==
          resolvedSnapshotId ||
        snapshot.userId !==
          resolvedUserId
      ) {
        throw new Error(
          "Event Analytics repository returned lookup data with mismatched identity.",
        );
      }

      return cloneSnapshot(
        snapshot,
      );
    },

    async listHistory({
      userId,
      startAt,
      endAt,
      limit,
    }) {
      const resolvedUserId =
        requireIdentifier(
          userId,
          "Event Analytics user id",
        );

      const resolvedWindow =
        requireWindow({
          startAt,
          endAt,
        });

      const snapshots =
        await repository.listByWindow({
          userId:
            resolvedUserId,

          startAt:
            resolvedWindow.startAt,

          endAt:
            resolvedWindow.endAt,

          limit,
        });

      for (
        const snapshot of
        snapshots
      ) {
        if (
          snapshot.userId !==
          resolvedUserId
        ) {
          throw new Error(
            "Event Analytics repository returned history belonging to another user.",
          );
        }
      }

      return snapshots.map(
        cloneSnapshot,
      );
    },
  };
}
