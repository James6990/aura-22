import {
  apexSyncSchemaVersion,
  type ApexSyncAcknowledgement,
  type ApexSyncCheckpoint,
  type ApexSyncUploadBatch,
} from "@/lib/sync/contracts";
import type {
  CloudSyncRepository,
  StoredSyncEnvelope,
} from "@/lib/sync/repository";

export type PrepareCloudSyncUploadInput = {
  userId: string;
  deviceId: string;
  limit?: number;
};

export type PrepareCloudSyncUploadResult = {
  checkpoint:
    ApexSyncCheckpoint;

  batch:
    ApexSyncUploadBatch | null;
};

export type ExecuteCloudSyncUploadResult = {
  status:
    | "nothing-to-upload"
    | "uploaded";

  batchId:
    string | null;

  acceptedEnvelopeIds:
    string[];

  rejectedEnvelopeIds:
    string[];

  checkpoint:
    ApexSyncCheckpoint;
};

export type CloudSyncUploadTransport = {
  upload(
    batch:
      ApexSyncUploadBatch,
  ): Promise<
    ApexSyncAcknowledgement
  >;
};

export type CloudSyncUploadService = {
  prepareUpload(
    input:
      PrepareCloudSyncUploadInput,
  ): Promise<
    PrepareCloudSyncUploadResult
  >;

  executeUpload(
    input:
      PrepareCloudSyncUploadInput,
  ): Promise<
    ExecuteCloudSyncUploadResult
  >;
};

export type CloudSyncUploadServiceDependencies = {
  repository:
    CloudSyncRepository;

  transport:
    CloudSyncUploadTransport;

  createBatchId:
    () => string;

  now:
    () => Date;
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

function requireValidDate(
  value: Date,
  label: string,
) {
  if (
    !(value instanceof Date) ||
    Number.isNaN(
      value.getTime(),
    )
  ) {
    throw new Error(
      `${label} must be a valid date.`,
    );
  }

  return value;
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

function requireLimit(
  value: number,
) {
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 500
  ) {
    throw new Error(
      "Cloud Sync upload limit must be between 1 and 500.",
    );
  }

  return value;
}

function createInitialCheckpoint({
  userId,
  deviceId,
  now,
}: {
  userId: string;
  deviceId: string;
  now: Date;
}): ApexSyncCheckpoint {
  return {
    userId,
    deviceId,

    cursor:
      null,

    lastUploadedSequence:
      0,

    lastDownloadedAt:
      null,

    updatedAt:
      now.toISOString(),

    schemaVersion:
      apexSyncSchemaVersion,
  };
}

function validatePendingEnvelopeOwnership({
  stored,
  userId,
  deviceId,
}: {
  stored:
    StoredSyncEnvelope;
  userId: string;
  deviceId: string;
}) {
  if (
    stored.status !==
    "pending"
  ) {
    throw new Error(
      "Cloud Sync upload preparation received a non-pending envelope.",
    );
  }

  if (
    stored.envelope.userId !==
      userId ||
    stored.envelope.deviceId !==
      deviceId
  ) {
    throw new Error(
      "Cloud Sync upload preparation received an envelope with mismatched ownership.",
    );
  }
}

function validateContiguousSequences({
  pending,
  checkpoint,
}: {
  pending:
    readonly StoredSyncEnvelope[];
  checkpoint:
    ApexSyncCheckpoint;
}) {
  let expectedSequence =
    checkpoint
      .lastUploadedSequence +
    1;

  for (
    const stored of pending
  ) {
    if (
      stored.envelope.sequence !==
      expectedSequence
    ) {
      throw new Error(
        `Cloud Sync upload sequence gap: expected ${expectedSequence} but received ${stored.envelope.sequence}.`,
      );
    }

    expectedSequence += 1;
  }
}

function validateAcknowledgement({
  batch,
  acknowledgement,
}: {
  batch:
    ApexSyncUploadBatch;

  acknowledgement:
    ApexSyncAcknowledgement;
}) {
  requireIdentifier(
    acknowledgement.batchId,
    "Cloud Sync acknowledgement batch id",
  );

  requireIdentifier(
    acknowledgement.userId,
    "Cloud Sync acknowledgement user id",
  );

  requireIdentifier(
    acknowledgement.deviceId,
    "Cloud Sync acknowledgement device id",
  );

  requireIsoDate(
    acknowledgement.serverTime,
    "Cloud Sync acknowledgement server time",
  );

  if (
    acknowledgement.schemaVersion !==
    apexSyncSchemaVersion
  ) {
    throw new Error(
      "Cloud Sync acknowledgement uses an unsupported schema version.",
    );
  }

  if (
    acknowledgement.batchId !==
    batch.batchId
  ) {
    throw new Error(
      "Cloud Sync acknowledgement batch id does not match the upload batch.",
    );
  }

  if (
    acknowledgement.userId !==
      batch.userId ||
    acknowledgement.deviceId !==
      batch.deviceId
  ) {
    throw new Error(
      "Cloud Sync acknowledgement ownership does not match the upload batch.",
    );
  }

  if (
    acknowledgement
      .nextCheckpoint.userId !==
      batch.userId ||
    acknowledgement
      .nextCheckpoint.deviceId !==
      batch.deviceId
  ) {
    throw new Error(
      "Cloud Sync acknowledgement checkpoint ownership does not match the upload batch.",
    );
  }

  if (
    acknowledgement
      .nextCheckpoint.schemaVersion !==
    apexSyncSchemaVersion
  ) {
    throw new Error(
      "Cloud Sync acknowledgement checkpoint uses an unsupported schema version.",
    );
  }

  const batchEnvelopeIds =
    new Set(
      batch.envelopes.map(
        (envelope) =>
          envelope.id,
      ),
    );

  const acceptedIds =
    new Set(
      acknowledgement
        .acceptedEnvelopeIds,
    );

  const rejectedIds =
    new Set(
      acknowledgement
        .rejected.map(
          (rejection) =>
            rejection.envelopeId,
        ),
    );

  if (
    acceptedIds.size !==
    acknowledgement
      .acceptedEnvelopeIds.length
  ) {
    throw new Error(
      "Cloud Sync acknowledgement contains duplicate accepted envelope ids.",
    );
  }

  if (
    rejectedIds.size !==
    acknowledgement
      .rejected.length
  ) {
    throw new Error(
      "Cloud Sync acknowledgement contains duplicate rejected envelope ids.",
    );
  }

  for (
    const envelopeId of
    acceptedIds
  ) {
    if (
      !batchEnvelopeIds.has(
        envelopeId,
      )
    ) {
      throw new Error(
        "Cloud Sync acknowledgement accepted an envelope outside the upload batch.",
      );
    }

    if (
      rejectedIds.has(
        envelopeId,
      )
    ) {
      throw new Error(
        "Cloud Sync acknowledgement cannot both accept and reject the same envelope.",
      );
    }
  }

  for (
    const envelopeId of
    rejectedIds
  ) {
    if (
      !batchEnvelopeIds.has(
        envelopeId,
      )
    ) {
      throw new Error(
        "Cloud Sync acknowledgement rejected an envelope outside the upload batch.",
      );
    }
  }

  const acknowledgedIds =
    new Set([
      ...acceptedIds,
      ...rejectedIds,
    ]);

  if (
    acknowledgedIds.size !==
    batchEnvelopeIds.size
  ) {
    throw new Error(
      "Cloud Sync acknowledgement must resolve every envelope in the upload batch.",
    );
  }

  const highestSequence =
    Math.max(
      ...batch.envelopes.map(
        (envelope) =>
          envelope.sequence,
      ),
    );

  if (
    acknowledgement
      .nextCheckpoint
      .lastUploadedSequence !==
    highestSequence
  ) {
    throw new Error(
      "Cloud Sync acknowledgement checkpoint does not match the highest uploaded sequence.",
    );
  }

  if (
    acknowledgement
      .nextCheckpoint
      .lastUploadedSequence <
    batch.checkpoint
      .lastUploadedSequence
  ) {
    throw new Error(
      "Cloud Sync acknowledgement checkpoint cannot move backwards.",
    );
  }
}

export function createCloudSyncUploadService({
  repository,
  transport,
  createBatchId,
  now,
}: CloudSyncUploadServiceDependencies):
  CloudSyncUploadService {
  async function prepareUpload({
    userId,
    deviceId,
    limit = 100,
  }: PrepareCloudSyncUploadInput):
    Promise<
      PrepareCloudSyncUploadResult
    > {
    const resolvedUserId =
      requireIdentifier(
        userId,
        "Cloud Sync user id",
      );

    const resolvedDeviceId =
      requireIdentifier(
        deviceId,
        "Cloud Sync device id",
      );

    const resolvedLimit =
      requireLimit(limit);

    const currentTime =
      requireValidDate(
        now(),
        "Cloud Sync preparation time",
      );

    const existingCheckpoint =
      await repository
        .getCheckpoint({
          userId:
            resolvedUserId,

          deviceId:
            resolvedDeviceId,
        });

    const checkpoint =
      existingCheckpoint ??
      createInitialCheckpoint({
        userId:
          resolvedUserId,

        deviceId:
          resolvedDeviceId,

        now:
          currentTime,
      });

    if (
      checkpoint.userId !==
        resolvedUserId ||
      checkpoint.deviceId !==
        resolvedDeviceId
    ) {
      throw new Error(
        "Cloud Sync checkpoint ownership does not match the requested device.",
      );
    }

    if (
      checkpoint.schemaVersion !==
      apexSyncSchemaVersion
    ) {
      throw new Error(
        "Cloud Sync checkpoint uses an unsupported schema version.",
      );
    }

    const pending =
      await repository
        .listPending({
          userId:
            resolvedUserId,

          deviceId:
            resolvedDeviceId,

          limit:
            resolvedLimit,
        });

    for (
      const stored of pending
    ) {
      validatePendingEnvelopeOwnership({
        stored,
        userId:
          resolvedUserId,
        deviceId:
          resolvedDeviceId,
      });
    }

    validateContiguousSequences({
      pending,
      checkpoint,
    });

    if (
      pending.length === 0
    ) {
      return {
        checkpoint: {
          ...checkpoint,
        },

        batch:
          null,
      };
    }

    const batchId =
      requireIdentifier(
        createBatchId(),
        "Cloud Sync batch id",
      );

    return {
      checkpoint: {
        ...checkpoint,
      },

      batch: {
        batchId,

        userId:
          resolvedUserId,

        deviceId:
          resolvedDeviceId,

        checkpoint: {
          ...checkpoint,
        },

        envelopes:
          pending.map(
            (stored) => ({
              ...stored.envelope,
            }),
          ),

        createdAt:
          currentTime
            .toISOString(),

        schemaVersion:
          apexSyncSchemaVersion,
      },
    };
  }

  return {
    prepareUpload,

    async executeUpload(
      input,
    ) {
      const prepared =
        await prepareUpload(
          input,
        );

      if (
        prepared.batch === null
      ) {
        return {
          status:
            "nothing-to-upload",

          batchId:
            null,

          acceptedEnvelopeIds:
            [],

          rejectedEnvelopeIds:
            [],

          checkpoint: {
            ...prepared.checkpoint,
          },
        };
      }

      const acknowledgement =
        await transport.upload(
          prepared.batch,
        );

      validateAcknowledgement({
        batch:
          prepared.batch,

        acknowledgement,
      });

      await repository
        .acknowledge(
          acknowledgement,
        );

      return {
        status:
          "uploaded",

        batchId:
          prepared.batch.batchId,

        acceptedEnvelopeIds: [
          ...acknowledgement
            .acceptedEnvelopeIds,
        ],

        rejectedEnvelopeIds:
          acknowledgement
            .rejected.map(
              (rejection) =>
                rejection.envelopeId,
            ),

        checkpoint: {
          ...acknowledgement
            .nextCheckpoint,
        },
      };
    },
  };
}
