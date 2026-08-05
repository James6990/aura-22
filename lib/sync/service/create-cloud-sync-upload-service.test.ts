import {
  apexSyncSchemaVersion,
  type ApexSyncAcknowledgement,
  type ApexSyncCheckpoint,
  type ApexSyncEnvelope,
  type ApexSyncUploadBatch,
} from "@/lib/sync/contracts";
import {
  createCloudSyncUploadService,
  type CloudSyncUploadTransport,
} from "./create-cloud-sync-upload-service";
import type {
  CloudSyncRepository,
  StoredSyncEnvelope,
} from "@/lib/sync/repository";

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
      `2026-08-05T18:${String(
        sequence,
      ).padStart(2, "0")}:00.000Z`,

    createdAt:
      `2026-08-05T18:${String(
        sequence,
      ).padStart(2, "0")}:01.000Z`,
  };
}

function storeEnvelope(
  envelope:
    ApexSyncEnvelope,
): StoredSyncEnvelope {
  return {
    envelope,

    status:
      "pending",

    rejection:
      null,

    acknowledgedAt:
      null,

    updatedAt:
      new Date(
        envelope.createdAt,
      ),
  };
}

function createCheckpoint({
  sequence = 0,
}: {
  sequence?: number;
} = {}): ApexSyncCheckpoint {
  return {
    userId:
      "user-1",

    deviceId:
      "device-1",

    cursor:
      null,

    lastUploadedSequence:
      sequence,

    lastDownloadedAt:
      null,

    updatedAt:
      "2026-08-05T19:00:00.000Z",

    schemaVersion:
      apexSyncSchemaVersion,
  };
}

function createAcknowledgement({
  batch,
}: {
  batch:
    ApexSyncUploadBatch;
}): ApexSyncAcknowledgement {
  const highestSequence =
    Math.max(
      ...batch.envelopes.map(
        (envelope) =>
          envelope.sequence,
      ),
    );

  return {
    batchId:
      batch.batchId,

    userId:
      batch.userId,

    deviceId:
      batch.deviceId,

    acceptedEnvelopeIds:
      batch.envelopes.map(
        (envelope) =>
          envelope.id,
      ),

    rejected:
      [],

    nextCheckpoint: {
      ...batch.checkpoint,

      lastUploadedSequence:
        highestSequence,

      updatedAt:
        "2026-08-05T19:01:00.000Z",
    },

    serverTime:
      "2026-08-05T19:01:00.000Z",

    schemaVersion:
      apexSyncSchemaVersion,
  };
}

function createRepository({
  checkpoint = null,
  pending = [],
}: {
  checkpoint?:
    ApexSyncCheckpoint | null;

  pending?:
    StoredSyncEnvelope[];
} = {}) {
  let acknowledged:
    ApexSyncAcknowledgement | null =
      null;

  const repository:
    CloudSyncRepository = {
      async getCheckpoint() {
        return checkpoint
          ? {
              ...checkpoint,
            }
          : null;
      },

      async saveCheckpoint(
        nextCheckpoint,
      ) {
        return {
          ...nextCheckpoint,
        };
      },

      async enqueue(
        envelope,
      ) {
        return storeEnvelope(
          envelope,
        );
      },

      async listPending() {
        return pending.map(
          (stored) => ({
            ...stored,

            envelope: {
              ...stored.envelope,
            },
          }),
        );
      },

      async acknowledge(
        nextAcknowledgement,
      ) {
        acknowledged = {
          ...nextAcknowledgement,

          acceptedEnvelopeIds: [
            ...nextAcknowledgement
              .acceptedEnvelopeIds,
          ],

          rejected:
            nextAcknowledgement
              .rejected.map(
                (rejection) => ({
                  ...rejection,
                }),
              ),

          nextCheckpoint: {
            ...nextAcknowledgement
              .nextCheckpoint,
          },
        };
      },
    };

  return {
    repository,

    getAcknowledged() {
      return acknowledged;
    },
  };
}

async function main() {
  const now =
    new Date(
      "2026-08-05T19:00:00.000Z",
    );

  const first =
    storeEnvelope(
      createEnvelope({
        id: "envelope-1",
        sequence: 1,
      }),
    );

  const second =
    storeEnvelope(
      createEnvelope({
        id: "envelope-2",
        sequence: 2,
      }),
    );

  const repositoryState =
    createRepository({
      pending: [
        first,
        second,
      ],
    });

  const uploadedBatches:
    ApexSyncUploadBatch[] =
      [];

  const transport:
    CloudSyncUploadTransport = {
      async upload(batch) {
        uploadedBatches.push(
          batch,
        );

        return createAcknowledgement({
          batch,
        });
      },
    };

  const service =
    createCloudSyncUploadService({
      repository:
        repositoryState.repository,

      transport,

      createBatchId:
        () => "batch-1",

      now:
        () => now,
    });

  const prepared =
    await service.prepareUpload({
      userId:
        "user-1",

      deviceId:
        "device-1",
    });

  if (
    prepared.batch
      ?.envelopes
      .map(
        (envelope) =>
          envelope.sequence,
      )
      .join(",") !==
    "1,2"
  ) {
    throw new Error(
      "Upload preparation should preserve contiguous sequence order.",
    );
  }

  const executed =
    await service.executeUpload({
      userId:
        "user-1",

      deviceId:
        "device-1",
    });

  if (
    executed.status !==
      "uploaded" ||
    executed.batchId !==
      "batch-1" ||
    executed.checkpoint
      .lastUploadedSequence !==
      2
  ) {
    throw new Error(
      "Upload execution should return the acknowledged checkpoint.",
    );
  }

  if (
    uploadedBatches[0]
      ?.batchId !==
      "batch-1"
  ) {
    throw new Error(
      "Upload execution should send the prepared batch through the transport.",
    );
  }

  if (
    repositoryState
      .getAcknowledged()
      ?.batchId !==
    "batch-1"
  ) {
    throw new Error(
      "Upload execution should persist a valid acknowledgement.",
    );
  }

  const emptyRepository =
    createRepository();

  let emptyTransportCalled =
    false;

  const emptyService =
    createCloudSyncUploadService({
      repository:
        emptyRepository
          .repository,

      transport: {
        async upload() {
          emptyTransportCalled =
            true;

          throw new Error(
            "Empty upload should not call transport.",
          );
        },
      },

      createBatchId:
        () =>
          "unused-batch",

      now:
        () => now,
    });

  const empty =
    await emptyService
      .executeUpload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });

  if (
    empty.status !==
      "nothing-to-upload" ||
    emptyTransportCalled
  ) {
    throw new Error(
      "A device with no pending envelopes should not call the transport.",
    );
  }

  const gapService =
    createCloudSyncUploadService({
      repository:
        createRepository({
          pending: [
            storeEnvelope(
              createEnvelope({
                id:
                  "envelope-2",

                sequence:
                  2,
              }),
            ),
          ],
        }).repository,

      transport,

      createBatchId:
        () =>
          "batch-gap",

      now:
        () => now,
    });

  let gapRejected =
    false;

  try {
    await gapService
      .prepareUpload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });
  } catch (error) {
    gapRejected =
      error instanceof Error &&
      error.message.includes(
        "expected 1 but received 2",
      );
  }

  if (!gapRejected) {
    throw new Error(
      "Upload preparation should reject sequence gaps.",
    );
  }

  const foreignAcknowledgementService =
    createCloudSyncUploadService({
      repository:
        createRepository({
          pending: [
            first,
          ],
        }).repository,

      transport: {
        async upload(batch) {
          return {
            ...createAcknowledgement({
              batch,
            }),

            userId:
              "user-2",

            nextCheckpoint: {
              ...createAcknowledgement({
                batch,
              }).nextCheckpoint,

              userId:
                "user-2",
            },
          };
        },
      },

      createBatchId:
        () =>
          "batch-owner",

      now:
        () => now,
    });

  let ownershipRejected =
    false;

  try {
    await foreignAcknowledgementService
      .executeUpload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });
  } catch (error) {
    ownershipRejected =
      error instanceof Error &&
      error.message.includes(
        "ownership does not match",
      );
  }

  if (!ownershipRejected) {
    throw new Error(
      "Upload execution should reject acknowledgement ownership mismatches.",
    );
  }

  const incompleteAcknowledgementService =
    createCloudSyncUploadService({
      repository:
        createRepository({
          pending: [
            first,
            second,
          ],
        }).repository,

      transport: {
        async upload(batch) {
          const acknowledgement =
            createAcknowledgement({
              batch,
            });

          return {
            ...acknowledgement,

            acceptedEnvelopeIds: [
              first.envelope.id,
            ],

            nextCheckpoint: {
              ...acknowledgement
                .nextCheckpoint,

              lastUploadedSequence:
                2,
            },
          };
        },
      },

      createBatchId:
        () =>
          "batch-incomplete",

      now:
        () => now,
    });

  let incompleteRejected =
    false;

  try {
    await incompleteAcknowledgementService
      .executeUpload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });
  } catch (error) {
    incompleteRejected =
      error instanceof Error &&
      error.message.includes(
        "resolve every envelope",
      );
  }

  if (!incompleteRejected) {
    throw new Error(
      "Upload execution should reject incomplete acknowledgements.",
    );
  }

  const unknownEnvelopeService =
    createCloudSyncUploadService({
      repository:
        createRepository({
          pending: [
            first,
          ],
        }).repository,

      transport: {
        async upload(batch) {
          const acknowledgement =
            createAcknowledgement({
              batch,
            });

          return {
            ...acknowledgement,

            acceptedEnvelopeIds: [
              "foreign-envelope",
            ],
          };
        },
      },

      createBatchId:
        () =>
          "batch-foreign",

      now:
        () => now,
    });

  let unknownEnvelopeRejected =
    false;

  try {
    await unknownEnvelopeService
      .executeUpload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });
  } catch (error) {
    unknownEnvelopeRejected =
      error instanceof Error &&
      error.message.includes(
        "outside the upload batch",
      );
  }

  if (!unknownEnvelopeRejected) {
    throw new Error(
      "Upload execution should reject acknowledgement ids outside the batch.",
    );
  }

  const continuation =
    createCloudSyncUploadService({
      repository:
        createRepository({
          checkpoint:
            createCheckpoint({
              sequence:
                4,
            }),

          pending: [
            storeEnvelope(
              createEnvelope({
                id:
                  "envelope-5",

                sequence:
                  5,
              }),
            ),
          ],
        }).repository,

      transport,

      createBatchId:
        () =>
          "batch-continuation",

      now:
        () => now,
    });

  const continuationBatch =
    await continuation
      .prepareUpload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });

  if (
    continuationBatch
      .batch
      ?.envelopes[0]
      ?.sequence !==
    5
  ) {
    throw new Error(
      "Upload preparation should continue from the saved checkpoint.",
    );
  }

  console.log(
    "Cloud Sync Upload Service test passed.",
  );
}

main().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
