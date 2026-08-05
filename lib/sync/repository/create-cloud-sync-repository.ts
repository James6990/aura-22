import {
  apexSyncSchemaVersion,
  type ApexSyncAcknowledgement,
  type ApexSyncCheckpoint,
  type ApexSyncEnvelope,
  type ApexSyncRejection,
} from "@/lib/sync/contracts";

export type SyncEnvelopeStatus =
  | "pending"
  | "accepted"
  | "rejected";

export type StoredSyncEnvelope = {
  envelope:
    ApexSyncEnvelope;

  status:
    SyncEnvelopeStatus;

  rejection:
    ApexSyncRejection | null;

  acknowledgedAt:
    Date | null;

  updatedAt:
    Date;
};

export type CloudSyncStorage = {
  getCheckpoint({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }): Promise<
    ApexSyncCheckpoint | null
  >;

  upsertCheckpoint(
    checkpoint:
      ApexSyncCheckpoint,
  ): Promise<
    ApexSyncCheckpoint
  >;

  getEnvelopeById(
    envelopeId: string,
  ): Promise<
    StoredSyncEnvelope | null
  >;

  getHighestSequence({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }): Promise<number>;

  insertEnvelope(
    envelope:
      ApexSyncEnvelope,
  ): Promise<
    StoredSyncEnvelope
  >;

  listPending({
    userId,
    deviceId,
    limit,
  }: {
    userId: string;
    deviceId: string;
    limit: number;
  }): Promise<
    StoredSyncEnvelope[]
  >;

  applyAcknowledgement({
    acknowledgement,
    acknowledgedAt,
  }: {
    acknowledgement:
      ApexSyncAcknowledgement;
    acknowledgedAt: Date;
  }): Promise<void>;
};

export type CloudSyncRepository = {
  getCheckpoint({
    userId,
    deviceId,
  }: {
    userId: string;
    deviceId: string;
  }): Promise<
    ApexSyncCheckpoint | null
  >;

  saveCheckpoint(
    checkpoint:
      ApexSyncCheckpoint,
  ): Promise<
    ApexSyncCheckpoint
  >;

  enqueue(
    envelope:
      ApexSyncEnvelope,
  ): Promise<
    StoredSyncEnvelope
  >;

  listPending({
    userId,
    deviceId,
    limit,
  }: {
    userId: string;
    deviceId: string;
    limit?: number;
  }): Promise<
    StoredSyncEnvelope[]
  >;

  acknowledge(
    acknowledgement:
      ApexSyncAcknowledgement,
  ): Promise<void>;
};

function requireIdentifier(
  value: string,
  label: string,
) {
  const resolved = value.trim();

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
  const date =
    new Date(value);

  if (
    !value.trim() ||
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      `${label} must be a valid ISO date.`,
    );
  }

  return value;
}

function validateCheckpoint(
  checkpoint:
    ApexSyncCheckpoint,
) {
  requireIdentifier(
    checkpoint.userId,
    "Sync checkpoint user id",
  );

  requireIdentifier(
    checkpoint.deviceId,
    "Sync checkpoint device id",
  );

  if (
    checkpoint.cursor !== null
  ) {
    requireIdentifier(
      checkpoint.cursor,
      "Sync checkpoint cursor",
    );
  }

  if (
    !Number.isInteger(
      checkpoint
        .lastUploadedSequence,
    ) ||
    checkpoint
      .lastUploadedSequence < 0
  ) {
    throw new Error(
      "Sync checkpoint sequence must be a non-negative integer.",
    );
  }

  if (
    checkpoint.lastDownloadedAt !==
    null
  ) {
    requireIsoDate(
      checkpoint
        .lastDownloadedAt,
      "Sync checkpoint lastDownloadedAt",
    );
  }

  requireIsoDate(
    checkpoint.updatedAt,
    "Sync checkpoint updatedAt",
  );

  if (
    checkpoint.schemaVersion !==
    apexSyncSchemaVersion
  ) {
    throw new Error(
      "Sync checkpoint uses an unsupported schema version.",
    );
  }
}

function validateEnvelope(
  envelope:
    ApexSyncEnvelope,
) {
  requireIdentifier(
    envelope.id,
    "Sync envelope id",
  );

  requireIdentifier(
    envelope.userId,
    "Sync envelope user id",
  );

  requireIdentifier(
    envelope.deviceId,
    "Sync envelope device id",
  );

  requireIdentifier(
    envelope.entityId,
    "Sync envelope entity id",
  );

  if (
    !Number.isInteger(
      envelope.sequence,
    ) ||
    envelope.sequence < 1
  ) {
    throw new Error(
      "Sync envelope sequence must be a positive integer.",
    );
  }

  if (
    envelope.schemaVersion !==
    apexSyncSchemaVersion
  ) {
    throw new Error(
      "Sync envelope uses an unsupported schema version.",
    );
  }

  requireIsoDate(
    envelope.occurredAt,
    "Sync envelope occurredAt",
  );

  requireIsoDate(
    envelope.createdAt,
    "Sync envelope createdAt",
  );
}

function sameEnvelope(
  a: ApexSyncEnvelope,
  b: ApexSyncEnvelope,
) {
  return (
    a.id === b.id &&
    a.userId === b.userId &&
    a.deviceId === b.deviceId &&
    a.entityType ===
      b.entityType &&
    a.entityId === b.entityId &&
    a.operation ===
      b.operation &&
    a.sequence ===
      b.sequence &&
    a.schemaVersion ===
      b.schemaVersion &&
    a.occurredAt ===
      b.occurredAt &&
    a.createdAt ===
      b.createdAt &&
    JSON.stringify(
      a.payload,
    ) ===
      JSON.stringify(
        b.payload,
      )
  );
}

export function createCloudSyncRepository(
  storage:
    CloudSyncStorage,
): CloudSyncRepository {
  return {
    async getCheckpoint({
      userId,
      deviceId,
    }) {
      const resolvedUserId =
        requireIdentifier(
          userId,
          "User id",
        );

      const resolvedDeviceId =
        requireIdentifier(
          deviceId,
          "Device id",
        );

      const checkpoint =
        await storage
          .getCheckpoint({
            userId:
              resolvedUserId,
            deviceId:
              resolvedDeviceId,
          });

      if (!checkpoint) {
        return null;
      }

      validateCheckpoint(
        checkpoint,
      );

      if (
        checkpoint.userId !==
          resolvedUserId ||
        checkpoint.deviceId !==
          resolvedDeviceId
      ) {
        throw new Error(
          "Cloud Sync storage returned a checkpoint with mismatched ownership.",
        );
      }

      return {
        ...checkpoint,
      };
    },

    async saveCheckpoint(
      checkpoint,
    ) {
      validateCheckpoint(
        checkpoint,
      );

      const existing =
        await storage
          .getCheckpoint({
            userId:
              checkpoint.userId,
            deviceId:
              checkpoint.deviceId,
          });

      if (
        existing &&
        checkpoint
          .lastUploadedSequence <
          existing
            .lastUploadedSequence
      ) {
        throw new Error(
          "Cloud Sync checkpoint cannot move its uploaded sequence backwards.",
        );
      }

      return storage
        .upsertCheckpoint({
          ...checkpoint,
        });
    },

    async enqueue(
      envelope,
    ) {
      validateEnvelope(
        envelope,
      );

      const existing =
        await storage
          .getEnvelopeById(
            envelope.id,
          );

      if (existing) {
        if (
          !sameEnvelope(
            existing.envelope,
            envelope,
          )
        ) {
          throw new Error(
            "Cloud Sync envelope id already exists with different data.",
          );
        }

        return existing;
      }

      const highestSequence =
        await storage
          .getHighestSequence({
            userId:
              envelope.userId,
            deviceId:
              envelope.deviceId,
          });

      if (
        envelope.sequence <=
        highestSequence
      ) {
        throw new Error(
          `Cloud Sync envelope sequence must be greater than ${highestSequence}.`,
        );
      }

      return storage
        .insertEnvelope({
          ...envelope,
        });
    },

    async listPending({
      userId,
      deviceId,
      limit = 100,
    }) {
      const resolvedUserId =
        requireIdentifier(
          userId,
          "User id",
        );

      const resolvedDeviceId =
        requireIdentifier(
          deviceId,
          "Device id",
        );

      if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 500
      ) {
        throw new Error(
          "Cloud Sync pending limit must be between 1 and 500.",
        );
      }

      const stored =
        await storage
          .listPending({
            userId:
              resolvedUserId,
            deviceId:
              resolvedDeviceId,
            limit,
          });

      for (
        const item of stored
      ) {
        if (
          item.envelope.userId !==
            resolvedUserId ||
          item.envelope.deviceId !==
            resolvedDeviceId
        ) {
          throw new Error(
            "Cloud Sync storage returned a pending envelope with mismatched ownership.",
          );
        }

        if (
          item.status !==
          "pending"
        ) {
          throw new Error(
            "Cloud Sync pending query returned a non-pending envelope.",
          );
        }
      }

      return [
        ...stored,
      ].sort(
        (a, b) =>
          a.envelope.sequence -
          b.envelope.sequence,
      );
    },

    async acknowledge(
      acknowledgement,
    ) {
      requireIdentifier(
        acknowledgement.batchId,
        "Sync acknowledgement batch id",
      );

      requireIdentifier(
        acknowledgement.userId,
        "Sync acknowledgement user id",
      );

      requireIdentifier(
        acknowledgement.deviceId,
        "Sync acknowledgement device id",
      );

      requireIsoDate(
        acknowledgement.serverTime,
        "Sync acknowledgement serverTime",
      );

      if (
        acknowledgement
          .schemaVersion !==
        apexSyncSchemaVersion
      ) {
        throw new Error(
          "Sync acknowledgement uses an unsupported schema version.",
        );
      }

      validateCheckpoint(
        acknowledgement
          .nextCheckpoint,
      );

      if (
        acknowledgement
          .nextCheckpoint.userId !==
          acknowledgement.userId ||
        acknowledgement
          .nextCheckpoint.deviceId !==
          acknowledgement.deviceId
      ) {
        throw new Error(
          "Sync acknowledgement checkpoint ownership does not match the batch.",
        );
      }

      const accepted =
        new Set(
          acknowledgement
            .acceptedEnvelopeIds,
        );

      if (
        accepted.size !==
        acknowledgement
          .acceptedEnvelopeIds
          .length
      ) {
        throw new Error(
          "Sync acknowledgement contains duplicate accepted envelope ids.",
        );
      }

      const rejectedIds =
        new Set(
          acknowledgement
            .rejected.map(
              (rejection) =>
                rejection.envelopeId,
            ),
        );

      if (
        rejectedIds.size !==
        acknowledgement
          .rejected.length
      ) {
        throw new Error(
          "Sync acknowledgement contains duplicate rejected envelope ids.",
        );
      }

      for (
        const envelopeId of
        accepted
      ) {
        if (
          rejectedIds.has(
            envelopeId,
          )
        ) {
          throw new Error(
            "Sync acknowledgement cannot both accept and reject the same envelope.",
          );
        }
      }

      const allIds = [
        ...accepted,
        ...rejectedIds,
      ];

      for (
        const envelopeId of
        allIds
      ) {
        const stored =
          await storage
            .getEnvelopeById(
              envelopeId,
            );

        if (!stored) {
          throw new Error(
            `Sync acknowledgement references unknown envelope "${envelopeId}".`,
          );
        }

        if (
          stored.envelope
            .userId !==
              acknowledgement
                .userId ||
          stored.envelope
            .deviceId !==
              acknowledgement
                .deviceId
        ) {
          throw new Error(
            "Sync acknowledgement cannot update an envelope belonging to another user or device.",
          );
        }
      }

      await storage
        .applyAcknowledgement({
          acknowledgement: {
            ...acknowledgement,

            acceptedEnvelopeIds: [
              ...acknowledgement
                .acceptedEnvelopeIds,
            ],

            rejected:
              acknowledgement
                .rejected.map(
                  (rejection) => ({
                    ...rejection,
                  }),
                ),

            nextCheckpoint: {
              ...acknowledgement
                .nextCheckpoint,
            },
          },

          acknowledgedAt:
            new Date(
              acknowledgement
                .serverTime,
            ),
        });
    },
  };
}
