import assert from "node:assert/strict";

import {
  createEmptyDecisionMemoryEventTypeCounts,
  decisionMemoryEventAnalyticsAlgorithm,
  decisionMemoryEventAnalyticsAlgorithmVersion,
  decisionMemoryEventAnalyticsReplayEngine,
  eventAnalyticsSchemaVersion,
  type DecisionMemoryEventAnalyticsSnapshot,
} from "@/lib/analytics/events/contracts";

import type {
  EventAnalyticsSnapshotRepository,
} from "@/lib/analytics/events/repository";

import {
  createEventAnalyticsApplicationService,
} from "./create-event-analytics-application-service";

function createSnapshot({
  id =
    "snapshot-1",

  userId =
    "user-1",

  startAt =
    "2026-08-01T00:00:00.000Z",

  endAt =
    "2026-08-07T23:59:59.999Z",

  generatedAt =
    "2026-08-08T00:00:00.000Z",
}: {
  id?: string;
  userId?: string;
  startAt?: string;
  endAt?: string;
  generatedAt?: string;
} = {}):
  DecisionMemoryEventAnalyticsSnapshot {
  return {
    id,
    userId,

    window: {
      startAt,
      endAt,
    },

    generatedAt,

    schemaVersion:
      eventAnalyticsSchemaVersion,

    totalEventCount:
      0,

    uniqueMemoryCount:
      0,

    uniqueDecisionCount:
      0,

    eventTypeCounts:
      createEmptyDecisionMemoryEventTypeCounts(),

    lifecycle: {
      createdCount:
        0,

      completedCount:
        0,

      incompleteCount:
        0,

      invalidLifecycleCount:
        0,
    },

    confidence: {
      sampleCount:
        0,

      minimum:
        null,

      maximum:
        null,

      average:
        null,
    },

    evidence: {
      sufficientCount:
        0,

      insufficientCount:
        0,

      requiresMoreEvidenceCount:
        0,
    },

    provenance: {
      algorithm:
        decisionMemoryEventAnalyticsAlgorithm,

      algorithmVersion:
        decisionMemoryEventAnalyticsAlgorithmVersion,

      replayEngine:
        decisionMemoryEventAnalyticsReplayEngine,

      producedAt:
        generatedAt,

      inputEventCount:
        0,

      includedEventCount:
        0,

      excludedEventCount:
        0,

      excludedEvents:
        [],

      replayedMemoryIds:
        [],

      completedMemoryIds:
        [],

      incompleteMemoryIds:
        [],

      invalidMemoryIds:
        [],
    },

    sourceEventIds:
      [],

    sourceEventSchemaVersions:
      [],

    sourceMemoryIds:
      [],

    sourceDecisionIds:
      [],
  };
}

function createRepository():
  EventAnalyticsSnapshotRepository & {
    rows:
      Map<
        string,
        DecisionMemoryEventAnalyticsSnapshot
      >;

    saveCalls:
      number;
  } {
  const rows =
    new Map<
      string,
      DecisionMemoryEventAnalyticsSnapshot
    >();

  return {
    rows,

    saveCalls:
      0,

    async getById({
      snapshotId,
      userId,
    }) {
      const snapshot =
        rows.get(
          snapshotId,
        );

      if (
        !snapshot ||
        snapshot.userId !==
          userId
      ) {
        return null;
      }

      return structuredClone(
        snapshot,
      );
    },

    async save(
      snapshot,
    ) {
      this.saveCalls +=
        1;

      const existing =
        rows.get(
          snapshot.id,
        );

      if (
        existing &&
        JSON.stringify(
          existing,
        ) !==
          JSON.stringify(
            snapshot,
          )
      ) {
        throw new Error(
          "Conflicting analytics snapshot.",
        );
      }

      const cloned =
        structuredClone(
          snapshot,
        );

      rows.set(
        cloned.id,
        cloned,
      );

      return structuredClone(
        cloned,
      );
    },

    async listByWindow({
      userId,
      startAt,
      endAt,
      limit = 100,
    }) {
      return [
        ...rows.values(),
      ]
        .filter(
          (snapshot) =>
            snapshot.userId ===
              userId &&
            snapshot.window.endAt >=
              startAt &&
            snapshot.window.startAt <=
              endAt,
        )
        .sort(
          (
            first,
            second,
          ) =>
            new Date(
              second.window.endAt,
            ).getTime() -
              new Date(
                first.window.endAt,
              ).getTime() ||
            new Date(
              second.generatedAt,
            ).getTime() -
              new Date(
                first.generatedAt,
              ).getTime() ||
            first.id.localeCompare(
              second.id,
            ),
        )
        .slice(
          0,
          limit,
        )
        .map(
          (snapshot) =>
            structuredClone(
              snapshot,
            ),
        );
    },
  };
}

async function run() {
  const repository =
    createRepository();

  let builderCalls =
    0;

  const expected =
    createSnapshot();

  const service =
    createEventAnalyticsApplicationService({
      repository,

      buildSnapshot(
        input,
      ) {
        builderCalls +=
          1;

        assert.equal(
          input.snapshotId,
          expected.id,
        );

        assert.equal(
          input.userId,
          expected.userId,
        );

        return structuredClone(
          expected,
        );
      },
    });

  const generated =
    await service.generateAndSave({
      snapshotId:
        expected.id,

      userId:
        expected.userId,

      window:
        expected.window,

      generatedAt:
        expected.generatedAt,

      events:
        [],
    });

  assert.deepEqual(
    generated,
    expected,
  );

  assert.equal(
    builderCalls,
    1,
  );

  assert.equal(
    repository.saveCalls,
    1,
  );

  generated.sourceEventIds.push(
    "mutated",
  );

  const loaded =
    await service.get({
      snapshotId:
        expected.id,

      userId:
        expected.userId,
    });

  assert.deepEqual(
    loaded?.sourceEventIds,
    [],
  );

  const retried =
    await service.generateAndSave({
      snapshotId:
        expected.id,

      userId:
        expected.userId,

      window:
        expected.window,

      generatedAt:
        expected.generatedAt,

      events:
        [],
    });

  assert.deepEqual(
    retried,
    expected,
  );

  assert.equal(
    repository.saveCalls,
    2,
  );

  const second =
    createSnapshot({
      id:
        "snapshot-2",

      startAt:
        "2026-08-08T00:00:00.000Z",

      endAt:
        "2026-08-14T23:59:59.999Z",

      generatedAt:
        "2026-08-15T00:00:00.000Z",
    });

  repository.rows.set(
    second.id,
    structuredClone(
      second,
    ),
  );

  const history =
    await service.listHistory({
      userId:
        "user-1",

      startAt:
        "2026-08-01T00:00:00.000Z",

      endAt:
        "2026-08-31T23:59:59.999Z",
    });

  assert.deepEqual(
    history.map(
      (snapshot) =>
        snapshot.id,
    ),
    [
      "snapshot-2",
      "snapshot-1",
    ],
  );

  let failingSaveCalls =
    0;

  const failingAggregationService =
    createEventAnalyticsApplicationService({
      repository: {
        ...repository,

        async save(
          snapshot,
        ) {
          void snapshot;

          failingSaveCalls +=
            1;

          throw new Error(
            "Save should not execute.",
          );
        },
      },

      buildSnapshot() {
        throw new Error(
          "Analytics aggregation failed.",
        );
      },
    });

  await assert.rejects(
    () =>
      failingAggregationService
        .generateAndSave({
          snapshotId:
            "snapshot-failure",

          userId:
            "user-1",

          window: {
            startAt:
              "2026-08-01T00:00:00.000Z",

            endAt:
              "2026-08-07T23:59:59.999Z",
          },

          generatedAt:
            "2026-08-08T00:00:00.000Z",

          events:
            [],
        }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Analytics aggregation failed.",
  );

  assert.equal(
    failingSaveCalls,
    0,
  );

  const repositoryFailureService =
    createEventAnalyticsApplicationService({
      repository: {
        ...repository,

        async save() {
          throw new Error(
            "Analytics repository unavailable.",
          );
        },
      },

      buildSnapshot() {
        return createSnapshot({
          id:
            "snapshot-repository-failure",
        });
      },
    });

  await assert.rejects(
    () =>
      repositoryFailureService
        .generateAndSave({
          snapshotId:
            "snapshot-repository-failure",

          userId:
            "user-1",

          window:
            expected.window,

          generatedAt:
            expected.generatedAt,

          events:
            [],
        }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Analytics repository unavailable.",
  );

  const mismatchedBuilderService =
    createEventAnalyticsApplicationService({
      repository,

      buildSnapshot() {
        return createSnapshot({
          id:
            "wrong-snapshot",
        });
      },
    });

  await assert.rejects(
    () =>
      mismatchedBuilderService
        .generateAndSave({
          snapshotId:
            "expected-snapshot",

          userId:
            "user-1",

          window:
            expected.window,

          generatedAt:
            expected.generatedAt,

          events:
            [],
        }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics builder returned a snapshot with mismatched identity.",
  );

  console.log(
    "Event Analytics application service tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
