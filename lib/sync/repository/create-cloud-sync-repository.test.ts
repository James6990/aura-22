import {
  apexSyncSchemaVersion,
  type ApexSyncAcknowledgement,
  type ApexSyncCheckpoint,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";
import {
  createCloudSyncRepository,
  type CloudSyncStorage,
  type StoredSyncEnvelope,
} from "./create-cloud-sync-repository";

function createEnvelope({
  id,
  sequence,
  userId = "user-1",
  deviceId = "device-1",
}: {
  id: string;
  sequence: number;
  userId?: string;
  deviceId?: string;
}): ApexSyncEnvelope {
  return {
    id,
    userId,
    deviceId,

    entityType:
      "decision-memory-event",

    entityId:
      `event-${sequence}`,

    operation:
      "append",

    sequence,

    payload: {
      eventId:
        `event-${sequence}`,
    },

    schemaVersion:
      apexSyncSchemaVersion,

    occurredAt:
      `2026-08-05T15:${String(
        sequence,
      ).padStart(2, "0")}:00.000Z`,

    createdAt:
      `2026-08-05T15:${String(
        sequence,
      ).padStart(2, "0")}:01.000Z`,
  };
}

function createStorage():
  CloudSyncStorage & {
    envelopes:
      Map<
        string,
        StoredSyncEnvelope
      >;

    checkpoints:
      Map<
        string,
        ApexSyncCheckpoint
      >;
  } {
  const envelopes =
    new Map<
      string,
      StoredSyncEnvelope
    >();

  const checkpoints =
    new Map<
      string,
      ApexSyncCheckpoint
    >();

  const checkpointKey = (
    userId: string,
    deviceId: string,
  ) =>
    `${userId}:${deviceId}`;

  return {
    envelopes,
    checkpoints,

    async getCheckpoint({
      userId,
      deviceId,
    }) {
      return (
        checkpoints.get(
          checkpointKey(
            userId,
            deviceId,
          ),
        ) ?? null
      );
    },

    async upsertCheckpoint(
      checkpoint,
    ) {
      const clone = {
        ...checkpoint,
      };

      checkpoints.set(
        checkpointKey(
          checkpoint.userId,
          checkpoint.deviceId,
        ),
        clone,
      );

      return clone;
    },

    async getEnvelopeById(
      envelopeId,
    ) {
      return (
        envelopes.get(
          envelopeId,
        ) ?? null
      );
    },

    async getHighestSequence({
      userId,
      deviceId,
    }) {
      return Math.max(
        0,
        ...[
          ...envelopes.values(),
        ]
          .filter(
            (stored) =>
              stored.envelope
                .userId === userId &&
              stored.envelope
                .deviceId ===
                deviceId,
          )
          .map(
            (stored) =>
              stored.envelope
                .sequence,
          ),
      );
    },

    async insertEnvelope(
      envelope,
    ) {
      const stored:
        StoredSyncEnvelope = {
          envelope: {
            ...envelope,
          },

          status:
            "pending",

          rejection: null,

          acknowledgedAt: null,

          updatedAt:
            new Date(
              envelope.createdAt,
            ),
        };

      envelopes.set(
        envelope.id,
        stored,
      );

      return stored;
    },

    async listPending({
      userId,
      deviceId,
      limit,
    }) {
      return [
        ...envelopes.values(),
      ]
        .filter(
          (stored) =>
            stored.envelope
              .userId === userId &&
            stored.envelope
              .deviceId ===
              deviceId &&
            stored.status ===
              "pending",
        )
        .sort(
          (a, b) =>
            a.envelope.sequence -
            b.envelope.sequence,
        )
        .slice(0, limit);
    },

    async applyAcknowledgement({
      acknowledgement,
      acknowledgedAt,
    }) {
      for (
        const envelopeId of
        acknowledgement
          .acceptedEnvelopeIds
      ) {
        const stored =
          envelopes.get(
            envelopeId,
          );

        if (stored) {
          envelopes.set(
            envelopeId,
            {
              ...stored,
              status:
                "accepted",
              rejection: null,
              acknowledgedAt,
              updatedAt:
                acknowledgedAt,
            },
          );
        }
      }

      for (
        const rejection of
        acknowledgement
          .rejected
      ) {
        const stored =
          envelopes.get(
            rejection.envelopeId,
          );

        if (stored) {
          envelopes.set(
            rejection.envelopeId,
            {
              ...stored,
              status:
                "rejected",
              rejection: {
                ...rejection,
              },
              acknowledgedAt,
              updatedAt:
                acknowledgedAt,
            },
          );
        }
      }

      checkpoints.set(
        checkpointKey(
          acknowledgement
            .userId,
          acknowledgement
            .deviceId,
        ),
        {
          ...acknowledgement
            .nextCheckpoint,
        },
      );
    },
  };
}

async function main() {
  const storage =
    createStorage();

  const repository =
    createCloudSyncRepository(
      storage,
    );

  const first =
    createEnvelope({
      id: "envelope-1",
      sequence: 1,
    });

  const second =
    createEnvelope({
      id: "envelope-2",
      sequence: 2,
    });

  await repository.enqueue(
    first,
  );

  await repository.enqueue(
    second,
  );

  const idempotent =
    await repository.enqueue(
      first,
    );

  if (
    idempotent.envelope.id !==
    first.id ||
    storage.envelopes.size !==
    2
  ) {
    throw new Error(
      "Identical envelope retries should be idempotent.",
    );
  }

  let duplicateChangedRejected =
    false;

  try {
    await repository.enqueue({
      ...first,
      entityId:
        "different-event",
    });
  } catch {
    duplicateChangedRejected =
      true;
  }

  if (!duplicateChangedRejected) {
    throw new Error(
      "Envelope id reuse with different data should be rejected.",
    );
  }

  let backwardsSequenceRejected =
    false;

  try {
    await repository.enqueue(
      createEnvelope({
        id: "envelope-old",
        sequence: 1,
      }),
    );
  } catch {
    backwardsSequenceRejected =
      true;
  }

  if (!backwardsSequenceRejected) {
    throw new Error(
      "Device sequence numbers must increase monotonically.",
    );
  }

  const pending =
    await repository.listPending({
      userId: "user-1",
      deviceId:
        "device-1",
    });

  if (
    pending
      .map(
        (item) =>
          item.envelope.id,
      )
      .join(",") !==
    "envelope-1,envelope-2"
  ) {
    throw new Error(
      "Pending envelopes should be returned in device sequence order.",
    );
  }

  const checkpoint:
    ApexSyncCheckpoint = {
      userId: "user-1",
      deviceId:
        "device-1",
      cursor:
        "cursor-2",
      lastUploadedSequence:
        2,
      lastDownloadedAt:
        "2026-08-05T16:00:00.000Z",
      updatedAt:
        "2026-08-05T16:00:00.000Z",
      schemaVersion:
        apexSyncSchemaVersion,
    };

  const acknowledgement:
    ApexSyncAcknowledgement = {
      batchId: "batch-1",
      userId: "user-1",
      deviceId:
        "device-1",

      acceptedEnvelopeIds: [
        first.id,
      ],

      rejected: [
        {
          envelopeId:
            second.id,

          code:
            "entity-conflict",

          message:
            "Server state requires review.",

          retryable:
            false,
        },
      ],

      nextCheckpoint:
        checkpoint,

      serverTime:
        "2026-08-05T16:00:00.000Z",

      schemaVersion:
        apexSyncSchemaVersion,
    };

  await repository.acknowledge(
    acknowledgement,
  );

  if (
    storage.envelopes.get(
      first.id,
    )?.status !==
      "accepted" ||
    storage.envelopes.get(
      second.id,
    )?.status !==
      "rejected"
  ) {
    throw new Error(
      "Acknowledgements should persist accepted and rejected envelope states.",
    );
  }

  const savedCheckpoint =
    await repository
      .getCheckpoint({
        userId:
          "user-1",
        deviceId:
          "device-1",
      });

  if (
    savedCheckpoint
      ?.lastUploadedSequence !==
    2 ||
    savedCheckpoint.cursor !==
    "cursor-2"
  ) {
    throw new Error(
      "Acknowledgements should persist the next device checkpoint.",
    );
  }

  const remaining =
    await repository.listPending({
      userId:
        "user-1",
      deviceId:
        "device-1",
    });

  if (
    remaining.length !== 0
  ) {
    throw new Error(
      "Acknowledged envelopes should no longer be pending.",
    );
  }

  let rollbackRejected =
    false;

  try {
    await repository.saveCheckpoint({
      ...checkpoint,

      lastUploadedSequence:
        1,

      updatedAt:
        "2026-08-05T16:01:00.000Z",
    });
  } catch {
    rollbackRejected =
      true;
  }

  if (!rollbackRejected) {
    throw new Error(
      "Checkpoint sequence rollback should be rejected.",
    );
  }

  let ownershipRejected =
    false;

  try {
    await repository.acknowledge({
      ...acknowledgement,

      userId:
        "user-2",

      nextCheckpoint: {
        ...checkpoint,
        userId:
          "user-2",
      },
    });
  } catch {
    ownershipRejected =
      true;
  }

  if (!ownershipRejected) {
    throw new Error(
      "Acknowledgements must not update another user's envelopes.",
    );
  }

  console.log(
    "Cloud Sync Repository test passed.",
  );
}

main().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
