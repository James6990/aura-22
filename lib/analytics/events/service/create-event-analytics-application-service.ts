import {
  buildDecisionMemoryEventAnalyticsSnapshot,
  buildEventAnalyticsHistoryComparison,
  type BuildDecisionMemoryEventAnalyticsSnapshotInput,
  type BuildEventAnalyticsHistoryComparisonInput,
} from "@/lib/analytics/events/aggregation";

import {
  createDecisionMemoryEventAnalyticsSnapshot,
  createEventAnalyticsHistoryComparison,
  type DecisionMemoryEventAnalyticsSnapshot,
  type EventAnalyticsHistoryComparison,
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

export type CompareEventAnalyticsHistoryInput = {
  comparisonId:
    string;

  userId:
    string;

  baselineSnapshotId:
    string;

  comparisonSnapshotId:
    string;

  generatedAt:
    string;
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

  compareHistory(
    input:
      CompareEventAnalyticsHistoryInput,
  ): Promise<
    EventAnalyticsHistoryComparison
  >;
};

export type EventAnalyticsSnapshotBuilder = (
  input:
    BuildDecisionMemoryEventAnalyticsSnapshotInput,
) =>
  DecisionMemoryEventAnalyticsSnapshot;

export type EventAnalyticsHistoryComparisonBuilder = (
  input:
    BuildEventAnalyticsHistoryComparisonInput,
) =>
  EventAnalyticsHistoryComparison;

export type EventAnalyticsApplicationServiceDependencies = {
  repository:
    EventAnalyticsSnapshotRepository;

  buildSnapshot?:
    EventAnalyticsSnapshotBuilder;

  buildComparison?:
    EventAnalyticsHistoryComparisonBuilder;
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

function cloneComparison(
  comparison:
    EventAnalyticsHistoryComparison,
) {
  return createEventAnalyticsHistoryComparison(
    comparison,
  );
}

export function createEventAnalyticsApplicationService({
  repository,
  buildSnapshot =
    buildDecisionMemoryEventAnalyticsSnapshot,
  buildComparison =
    buildEventAnalyticsHistoryComparison,
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

    async compareHistory({
      comparisonId,
      userId,
      baselineSnapshotId,
      comparisonSnapshotId,
      generatedAt,
    }) {
      const resolvedComparisonId =
        requireIdentifier(
          comparisonId,
          "Event Analytics comparison id",
        );

      const resolvedUserId =
        requireIdentifier(
          userId,
          "Event Analytics user id",
        );

      const resolvedBaselineSnapshotId =
        requireIdentifier(
          baselineSnapshotId,
          "Event Analytics baseline snapshot id",
        );

      const resolvedComparisonSnapshotId =
        requireIdentifier(
          comparisonSnapshotId,
          "Event Analytics comparison snapshot id",
        );

      const resolvedGeneratedAt =
        requireIsoDate(
          generatedAt,
          "Event Analytics comparison generatedAt",
        );

      const baseline =
        await repository.getById({
          snapshotId:
            resolvedBaselineSnapshotId,

          userId:
            resolvedUserId,
        });

      if (!baseline) {
        throw new Error(
          "Event Analytics baseline snapshot was not found.",
        );
      }

      const comparison =
        await repository.getById({
          snapshotId:
            resolvedComparisonSnapshotId,

          userId:
            resolvedUserId,
        });

      if (!comparison) {
        throw new Error(
          "Event Analytics comparison snapshot was not found.",
        );
      }

      if (
        baseline.userId !==
          resolvedUserId ||
        comparison.userId !==
          resolvedUserId
      ) {
        throw new Error(
          "Event Analytics comparison snapshots do not belong to this user.",
        );
      }

      const result =
        buildComparison({
          comparisonId:
            resolvedComparisonId,

          generatedAt:
            resolvedGeneratedAt,

          baseline:
            cloneSnapshot(
              baseline,
            ),

          comparison:
            cloneSnapshot(
              comparison,
            ),
        });

      if (
        result.id !==
          resolvedComparisonId ||
        result.userId !==
          resolvedUserId ||
        result.baselineSnapshotId !==
          resolvedBaselineSnapshotId ||
        result.comparisonSnapshotId !==
          resolvedComparisonSnapshotId
      ) {
        throw new Error(
          "Event Analytics comparison builder returned mismatched identity.",
        );
      }

      return cloneComparison(
        result,
      );
    },
  };
}
