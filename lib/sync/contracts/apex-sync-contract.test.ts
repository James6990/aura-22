import {
  apexSyncSchemaVersion,
  type ApexSyncAcknowledgement,
  type ApexSyncCheckpoint,
  type ApexSyncDownloadBatch,
  type ApexSyncEnvelope,
  type ApexSyncUploadBatch,
} from "./apex-sync-contract";

const checkpoint:
  ApexSyncCheckpoint = {
    userId: "user-1",
    deviceId: "device-1",
    cursor: null,
    lastUploadedSequence: 0,
    lastDownloadedAt: null,
    updatedAt:
      "2026-08-05T14:00:00.000Z",
    schemaVersion:
      apexSyncSchemaVersion,
  };

const envelope:
  ApexSyncEnvelope<{
    message: string;
  }> = {
    id: "sync-envelope-1",
    userId: "user-1",
    deviceId: "device-1",
    entityType:
      "decision-memory-event",
    entityId: "event-1",
    operation: "append",
    sequence: 1,
    payload: {
      message: "Created",
    },
    schemaVersion:
      apexSyncSchemaVersion,
    occurredAt:
      "2026-08-05T14:01:00.000Z",
    createdAt:
      "2026-08-05T14:01:01.000Z",
  };

const upload:
  ApexSyncUploadBatch<
    typeof envelope
  > = {
    batchId: "batch-1",
    userId: "user-1",
    deviceId: "device-1",
    checkpoint,
    envelopes: [
      envelope,
    ],
    createdAt:
      "2026-08-05T14:02:00.000Z",
    schemaVersion:
      apexSyncSchemaVersion,
  };

if (
  upload.envelopes[0]
    ?.sequence !== 1
) {
  throw new Error(
    "Sync upload batch should preserve device sequence numbers.",
  );
}

const download:
  ApexSyncDownloadBatch<
    typeof envelope
  > = {
    userId: "user-1",
    deviceId: "device-1",
    previousCursor: null,
    nextCursor: "cursor-1",
    envelopes: [
      envelope,
    ],
    hasMore: false,
    serverTime:
      "2026-08-05T14:03:00.000Z",
    schemaVersion:
      apexSyncSchemaVersion,
  };

if (
  download.nextCursor !==
    "cursor-1"
) {
  throw new Error(
    "Sync download batch should expose the next opaque cursor.",
  );
}

const acknowledgement:
  ApexSyncAcknowledgement = {
    batchId:
      upload.batchId,
    userId:
      upload.userId,
    deviceId:
      upload.deviceId,
    acceptedEnvelopeIds: [
      envelope.id,
    ],
    rejected: [],
    nextCheckpoint: {
      ...checkpoint,
      cursor:
        download.nextCursor,
      lastUploadedSequence:
        envelope.sequence,
      lastDownloadedAt:
        download.serverTime,
      updatedAt:
        download.serverTime,
    },
    serverTime:
      download.serverTime,
    schemaVersion:
      apexSyncSchemaVersion,
  };

if (
  acknowledgement
    .acceptedEnvelopeIds[0] !==
    envelope.id ||
  acknowledgement
    .nextCheckpoint
    .lastUploadedSequence !== 1
) {
  throw new Error(
    "Sync acknowledgement should preserve accepted envelopes and checkpoint progress.",
  );
}

console.log(
  "Apex Cloud Sync Contract test passed.",
);
