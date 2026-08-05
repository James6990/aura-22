export const apexSyncSchemaVersion =
  1 as const;

export type ApexSyncEntityType =
  | "decision-memory-event"
  | "decision-memory-snapshot";

export type ApexSyncOperation =
  | "append"
  | "upsert";

export type ApexSyncCursor =
  string | null;

export type ApexSyncEnvelope<
  TPayload = unknown,
> = {
  id: string;
  userId: string;
  deviceId: string;

  entityType:
    ApexSyncEntityType;
  entityId: string;

  operation:
    ApexSyncOperation;

  sequence: number;

  payload:
    TPayload;

  schemaVersion:
    number;

  occurredAt:
    string;
  createdAt:
    string;
};

export type ApexSyncCheckpoint = {
  userId: string;
  deviceId: string;

  cursor:
    ApexSyncCursor;

  lastUploadedSequence:
    number;

  lastDownloadedAt:
    string | null;

  updatedAt:
    string;

  schemaVersion:
    number;
};

export type ApexSyncUploadBatch<
  TEnvelope =
    ApexSyncEnvelope,
> = {
  batchId: string;
  userId: string;
  deviceId: string;

  checkpoint:
    ApexSyncCheckpoint;

  envelopes:
    TEnvelope[];

  createdAt:
    string;

  schemaVersion:
    number;
};

export type ApexSyncDownloadBatch<
  TEnvelope =
    ApexSyncEnvelope,
> = {
  userId: string;

  previousCursor:
    ApexSyncCursor;

  nextCursor:
    ApexSyncCursor;

  envelopes:
    TEnvelope[];

  hasMore:
    boolean;

  serverTime:
    string;

  schemaVersion:
    number;
};

export type ApexSyncRejection = {
  envelopeId: string;

  code:
    | "invalid-envelope"
    | "unsupported-schema"
    | "ownership-mismatch"
    | "duplicate-envelope"
    | "sequence-conflict"
    | "entity-conflict";

  message: string;

  retryable:
    boolean;
};

export type ApexSyncAcknowledgement = {
  batchId: string;
  userId: string;
  deviceId: string;

  acceptedEnvelopeIds:
    string[];

  rejected:
    ApexSyncRejection[];

  nextCheckpoint:
    ApexSyncCheckpoint;

  serverTime:
    string;

  schemaVersion:
    number;
};
