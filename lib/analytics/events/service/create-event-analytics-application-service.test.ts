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

async function runComparisonTests() {
  const repository =
    createRepository();

  const baseline =
    createSnapshot({
      id:
        "snapshot-baseline",

      startAt:
        "2026-08-01T00:00:00.000Z",

      endAt:
        "2026-08-07T23:59:59.999Z",

      generatedAt:
        "2026-08-08T00:00:00.000Z",
    });

  const comparison =
    createSnapshot({
      id:
        "snapshot-comparison",

      startAt:
        "2026-08-08T00:00:00.000Z",

      endAt:
        "2026-08-14T23:59:59.999Z",

      generatedAt:
        "2026-08-15T00:00:00.000Z",
    });

  repository.rows.set(
    baseline.id,
    structuredClone(
      baseline,
    ),
  );

  repository.rows.set(
    comparison.id,
    structuredClone(
      comparison,
    ),
  );

  let comparisonBuilderCalls =
    0;

  const service =
    createEventAnalyticsApplicationService({
      repository,

      buildComparison(
        input,
      ) {
        comparisonBuilderCalls +=
          1;

        assert.equal(
          input.comparisonId,
          "comparison-1",
        );

        assert.equal(
          input.baseline.id,
          baseline.id,
        );

        assert.equal(
          input.comparison.id,
          comparison.id,
        );

        return {
          id:
            "comparison-1",

          userId:
            "user-1",

          generatedAt:
            "2026-08-16T00:00:00.000Z",

          schemaVersion:
            1,

          baselineSnapshotId:
            baseline.id,

          comparisonSnapshotId:
            comparison.id,

          baselineWindow:
            structuredClone(
              baseline.window,
            ),

          comparisonWindow:
            structuredClone(
              comparison.window,
            ),

          totalEventCount: {
            baseline:
              0,

            comparison:
              0,

            absolute:
              0,

            direction:
              "stable",
          },

          uniqueMemoryCount: {
            baseline:
              0,

            comparison:
              0,

            absolute:
              0,

            direction:
              "stable",
          },

          uniqueDecisionCount: {
            baseline:
              0,

            comparison:
              0,

            absolute:
              0,

            direction:
              "stable",
          },

          eventTypeCounts:
            Object.fromEntries(
              Object.keys(
                baseline.eventTypeCounts,
              ).map(
                (type) => [
                  type,
                  {
                    baseline:
                      0,

                    comparison:
                      0,

                    absolute:
                      0,

                    direction:
                      "stable",
                  },
                ],
              ),
            ) as never,

          lifecycle: {
            createdCount: {
              baseline:
                0,

              comparison:
                0,

              absolute:
                0,

              direction:
                "stable",
            },

            completedCount: {
              baseline:
                0,

              comparison:
                0,

              absolute:
                0,

              direction:
                "stable",
            },

            incompleteCount: {
              baseline:
                0,

              comparison:
                0,

              absolute:
                0,

              direction:
                "stable",
            },

            invalidLifecycleCount: {
              baseline:
                0,

              comparison:
                0,

              absolute:
                0,

              direction:
                "stable",
            },
          },

          confidence: {
            sampleCount: {
              baseline:
                0,

              comparison:
                0,

              absolute:
                0,

              direction:
                "stable",
            },

            minimum: {
              baseline:
                null,

              comparison:
                null,

              absolute:
                null,

              direction:
                "insufficient-evidence",
            },

            maximum: {
              baseline:
                null,

              comparison:
                null,

              absolute:
                null,

              direction:
                "insufficient-evidence",
            },

            average: {
              baseline:
                null,

              comparison:
                null,

              absolute:
                null,

              direction:
                "insufficient-evidence",
            },
          },

          evidence: {
            sufficientCount: {
              baseline:
                0,

              comparison:
                0,

              absolute:
                0,

              direction:
                "stable",
            },

            insufficientCount: {
              baseline:
                0,

              comparison:
                0,

              absolute:
                0,

              direction:
                "stable",
            },

            requiresMoreEvidenceCount: {
              baseline:
                0,

              comparison:
                0,

              absolute:
                0,

              direction:
                "stable",
            },
          },

          provenance: {
            algorithm:
              "event-analytics-history-comparison",

            algorithmVersion:
              1,

            producedAt:
              "2026-08-16T00:00:00.000Z",

            baselineSnapshotId:
              baseline.id,

            comparisonSnapshotId:
              comparison.id,

            baselineSchemaVersion:
              1,

            comparisonSchemaVersion:
              1,
          },
        };
      },
    });

  const result =
    await service.compareHistory({
      comparisonId:
        "comparison-1",

      userId:
        "user-1",

      baselineSnapshotId:
        baseline.id,

      comparisonSnapshotId:
        comparison.id,

      generatedAt:
        "2026-08-16T00:00:00.000Z",
    });

  assert.equal(
    comparisonBuilderCalls,
    1,
  );

  assert.equal(
    result.baselineSnapshotId,
    baseline.id,
  );

  result.baselineWindow.startAt =
    "mutated";

  assert.equal(
    baseline.window.startAt,
    "2026-08-01T00:00:00.000Z",
  );

  await assert.rejects(
    () =>
      service.compareHistory({
        comparisonId:
          "missing-baseline",

        userId:
          "user-1",

        baselineSnapshotId:
          "not-found",

        comparisonSnapshotId:
          comparison.id,

        generatedAt:
          "2026-08-16T00:00:00.000Z",
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics baseline snapshot was not found.",
  );

  await assert.rejects(
    () =>
      service.compareHistory({
        comparisonId:
          "missing-comparison",

        userId:
          "user-1",

        baselineSnapshotId:
          baseline.id,

        comparisonSnapshotId:
          "not-found",

        generatedAt:
          "2026-08-16T00:00:00.000Z",
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics comparison snapshot was not found.",
  );
}

runComparisonTests().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);

async function runTrendInterpretationTests() {
  const repository =
    createRepository();

  const baseline =
    createSnapshot({
      id:
        "trend-snapshot-1",

      startAt:
        "2026-08-01T00:00:00.000Z",

      endAt:
        "2026-08-07T23:59:59.999Z",
    });

  const comparisonSnapshot =
    createSnapshot({
      id:
        "trend-snapshot-2",

      startAt:
        "2026-08-08T00:00:00.000Z",

      endAt:
        "2026-08-14T23:59:59.999Z",

      generatedAt:
        "2026-08-15T00:00:00.000Z",
    });

  repository.rows.set(
    baseline.id,
    structuredClone(
      baseline,
    ),
  );

  repository.rows.set(
    comparisonSnapshot.id,
    structuredClone(
      comparisonSnapshot,
    ),
  );

  const service =
    createEventAnalyticsApplicationService({
      repository,
    });

  const comparison =
    await service.compareHistory({
      comparisonId:
        "trend-comparison-1",

      userId:
        "user-1",

      baselineSnapshotId:
        baseline.id,

      comparisonSnapshotId:
        comparisonSnapshot.id,

      generatedAt:
        "2026-08-16T00:00:00.000Z",
    });

  const interpretation =
    await service.interpretTrend({
      interpretationId:
        "trend-interpretation-1",

      userId:
        "user-1",

      generatedAt:
        "2026-08-17T00:00:00.000Z",

      comparisons: [
        comparison,
      ],
    });

  assert.equal(
    interpretation.id,
    "trend-interpretation-1",
  );

  assert.equal(
    interpretation.userId,
    "user-1",
  );

  assert.equal(
    interpretation.totalEventCount.direction,
    "stable",
  );

  assert.deepEqual(
    interpretation.provenance.sourceComparisonIds,
    [
      "trend-comparison-1",
    ],
  );

  interpretation.provenance.sourceSnapshotIds.push(
    "mutated",
  );

  assert.deepEqual(
    comparison.provenance.baselineSnapshotId,
    baseline.id,
  );

  await assert.rejects(
    () =>
      service.interpretTrend({
        interpretationId:
          "cross-user-trend",

        userId:
          "user-1",

        generatedAt:
          "2026-08-17T00:00:00.000Z",

        comparisons: [
          {
            ...comparison,

            userId:
              "user-2",
          },
        ],
      }),

    (error: unknown) =>
      error instanceof Error &&
      error.message ===
        "Event Analytics trend comparisons do not belong to this user.",
  );

  console.log(
    "Event Analytics trend interpretation service tests passed.",
  );
}

runTrendInterpretationTests().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
