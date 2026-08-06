import assert from "node:assert/strict";

import type {
  DecisionMemoryDomainEvent,
} from "@/lib/events/contracts";

import type {
  ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import type {
  LocalEnvelopeStagingService,
} from "@/lib/sync/offline-cache/service";

import {
  createSyncStagingDecisionMemoryEventSink,
  type DecisionMemorySyncMetadataProvider,
} from "./create-sync-staging-decision-memory-event-sink";

function createEvent():
  DecisionMemoryDomainEvent {
  return {
    userId:
      "user-1",

    type:
      "decision-memory.created",

    category:
      "system",

    source:
      "apex-decision-memory",

    schemaVersion:
      1,

    payload: {
      eventId:
        "event-1",

      correlationId:
        "correlation-1",

      causationId:
        null,

      memoryId:
        "memory-1",

      decisionId:
        "decision-1",

      decisionType:
        "workout-adjustment",

      priority:
        "normal",

      memoryStatus:
        "open",

      decisionStatus:
        "active",

      reasoningTone:
        "supportive",

      reasoningConfidence:
        0.8,

      evidenceSufficient:
        true,

      requiresMoreEvidence:
        false,

      outcomeStatus:
        null,

      reflectionOutcome:
        null,

      learningEntryIds:
        [],

      learningCount:
        0,

      memorySchemaVersion:
        1,
    },

    occurredAt:
      new Date(
        "2026-08-05T22:00:00.000Z",
      ),
  };
}

async function run() {
  const event =
    createEvent();

  let requestedUserId:
    string | null =
      null;

  let stagedEnvelope:
    ApexSyncEnvelope | null =
      null;

  let stagedCachedAt:
    string | null =
      null;

  const metadataProvider:
    DecisionMemorySyncMetadataProvider = {
      async getMetadata({
        userId,
      }) {
        requestedUserId =
          userId;

        return {
          deviceId:
            "device-1",

          sequence:
            4,

          createdAt:
            "2026-08-05T22:01:00.000Z",

          cachedAt:
            "2026-08-05T22:01:01.000Z",
        };
      },
    };

  const stagingService = {
    async stage(
      envelope:
        ApexSyncEnvelope,
      cachedAt:
        string,
    ) {
      stagedEnvelope =
        envelope;

      stagedCachedAt =
        cachedAt;

      return {
        id:
          envelope.id,

        userId:
          envelope.userId,

        deviceId:
          envelope.deviceId,

        envelope,

        origin:
          "local" as const,

        status:
          "staged" as const,

        conflict:
          null,

        cachedAt,

        updatedAt:
          cachedAt,

        schemaVersion:
          1,
      };
    },
  } as LocalEnvelopeStagingService;

  const sink =
    createSyncStagingDecisionMemoryEventSink({
      stagingService,
      metadataProvider,
    });

  await sink.publish(
    event,
  );

  assert.equal(
    requestedUserId,
    event.userId,
  );

  assert.ok(
    stagedEnvelope,
  );

  assert.equal(
    (
      stagedEnvelope as ApexSyncEnvelope
    ).id,
    event.payload.eventId,
  );

  assert.equal(
    (
      stagedEnvelope as ApexSyncEnvelope
    ).entityId,
    event.payload.memoryId,
  );

  assert.equal(
    (
      stagedEnvelope as ApexSyncEnvelope
    ).deviceId,
    "device-1",
  );

  assert.equal(
    (
      stagedEnvelope as ApexSyncEnvelope
    ).sequence,
    4,
  );

  assert.equal(
    stagedCachedAt,
    "2026-08-05T22:01:01.000Z",
  );

  console.log(
    "Decision Memory Sync Staging Sink tests passed.",
  );
}

run().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
