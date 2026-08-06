import assert from "node:assert/strict";

import type {
  DecisionMemoryDomainEvent,
} from "@/lib/events/contracts";

import {
  apexSyncSchemaVersion,
  createDecisionMemorySyncEnvelope,
} from "@/lib/sync/contracts";

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
        ["learning-1"],

      learningCount:
        1,

      memorySchemaVersion:
        1,
    },

    occurredAt:
      new Date(
        "2026-08-05T21:00:00.000Z",
      ),
  };
}

function expectError(
  action:
    () => unknown,
  message:
    string,
) {
  assert.throws(
    action,
    (error: unknown) =>
      error instanceof Error &&
      error.message === message,
  );
}

function run() {
  const event =
    createEvent();

  const envelope =
    createDecisionMemorySyncEnvelope({
      event,
      deviceId:
        "device-1",
      sequence:
        7,
      createdAt:
        "2026-08-05T21:01:00.000Z",
    });

  assert.equal(
    envelope.id,
    event.payload.eventId,
  );

  assert.equal(
    envelope.userId,
    event.userId,
  );

  assert.equal(
    envelope.deviceId,
    "device-1",
  );

  assert.equal(
    envelope.entityType,
    "decision-memory-event",
  );

  assert.equal(
    envelope.entityId,
    event.payload.memoryId,
  );

  assert.equal(
    envelope.operation,
    "append",
  );

  assert.equal(
    envelope.sequence,
    7,
  );

  assert.equal(
    envelope.schemaVersion,
    apexSyncSchemaVersion,
  );

  assert.equal(
    envelope.occurredAt,
    event.occurredAt.toISOString(),
  );

  assert.equal(
    envelope.createdAt,
    "2026-08-05T21:01:00.000Z",
  );

  assert.deepEqual(
    envelope.payload.payload.learningEntryIds,
    ["learning-1"],
  );

  assert.notEqual(
    envelope.payload.payload.learningEntryIds,
    event.payload.learningEntryIds,
  );

  expectError(
    () =>
      createDecisionMemorySyncEnvelope({
        event,
        deviceId:
          "device-1",
        sequence:
          0,
        createdAt:
          "2026-08-05T21:01:00.000Z",
      }),
    "Decision Memory sync sequence must be a positive integer.",
  );

  expectError(
    () =>
      createDecisionMemorySyncEnvelope({
        event,
        deviceId:
          " ",
        sequence:
          1,
        createdAt:
          "2026-08-05T21:01:00.000Z",
      }),
    "Decision Memory sync device id is required.",
  );

  expectError(
    () =>
      createDecisionMemorySyncEnvelope({
        event,
        deviceId:
          "device-1",
        sequence:
          1,
        createdAt:
          "invalid",
      }),
    "Decision Memory sync createdAt must be a valid ISO date.",
  );

  console.log(
    "Decision Memory Sync Envelope tests passed.",
  );
}

run();
