import {
  apexSyncSchemaVersion,
  type ApexSyncCheckpoint,
  type ApexSyncDownloadBatch,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";
import {
  createCloudSyncDownloadService,
} from "./create-cloud-sync-download-service";
import type {
  CloudSyncRepository,
} from "@/lib/sync/repository";

function createEnvelope({
  id,
  sequence,
  deviceId = "source-device-1",
  userId = "user-1",
}: {
  id: string;
  sequence: number;
  deviceId?: string;
  userId?: string;
}): ApexSyncEnvelope {
  return {
    id,
    userId,
    deviceId,

    entityType:
      "decision-memory-event",

    entityId:
      `event-${id}`,

    operation:
      "append",

    sequence,

    payload: {
      eventId:
        `event-${id}`,
    },

    schemaVersion:
      apexSyncSchemaVersion,

    occurredAt:
      "2026-08-05T20:00:00.000Z",

    createdAt:
      "2026-08-05T20:00:01.000Z",
  };
}

function createCheckpoint():
  ApexSyncCheckpoint {
  return {
    userId:
      "user-1",

    deviceId:
      "device-1",

    cursor:
      "cursor-4",

    lastUploadedSequence:
      7,

    lastDownloadedAt:
      "2026-08-05T19:00:00.000Z",

    updatedAt:
      "2026-08-05T19:00:00.000Z",

    schemaVersion:
      apexSyncSchemaVersion,
  };
}

function createBatch({
  envelopes = [],
  previousCursor =
    "cursor-4",
  nextCursor =
    "cursor-5",
  hasMore = false,
  userId = "user-1",
  deviceId = "device-1",
}: {
  envelopes?:
    ApexSyncEnvelope[];

  previousCursor?:
    string | null;

  nextCursor?:
    string | null;

  hasMore?: boolean;
  userId?: string;
  deviceId?: string;
} = {}): ApexSyncDownloadBatch {
  return {
    userId,
    deviceId,

    previousCursor,
    nextCursor,

    envelopes,

    hasMore,

    serverTime:
      "2026-08-05T20:01:00.000Z",

    schemaVersion:
      apexSyncSchemaVersion,
  };
}

function createRepository({
  checkpoint =
    createCheckpoint(),
}: {
  checkpoint?:
    ApexSyncCheckpoint | null;
} = {}) {
  const saved:
    ApexSyncCheckpoint[] =
      [];

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
        saved.push({
          ...nextCheckpoint,
        });

        return {
          ...nextCheckpoint,
        };
      },

      async enqueue() {
        throw new Error(
          "Enqueue is outside download service scope.",
        );
      },

      async listPending() {
        return [];
      },

      async acknowledge() {
        throw new Error(
          "Acknowledgement is outside download service scope.",
        );
      },
    };

  return {
    repository,
    saved,
  };
}

async function main() {
  const first =
    createEnvelope({
      id: "envelope-8",
      sequence: 8,
    });

  const second =
    createEnvelope({
      id: "envelope-9",
      sequence: 9,
    });

  const repositoryState =
    createRepository();

  const applied:
    string[][] =
      [];

  const service =
    createCloudSyncDownloadService({
      repository:
        repositoryState.repository,

      transport: {
        async download(input) {
          if (
            input.cursor !==
              "cursor-4" ||
            input.deviceId !==
              "device-1"
          ) {
            throw new Error(
              "Download transport should receive the saved device cursor.",
            );
          }

          return createBatch({
            envelopes: [
              first,
              second,
            ],

            hasMore:
              true,
          });
        },
      },

      sink: {
        async apply({
          envelopes,
        }) {
          applied.push(
            envelopes.map(
              (envelope) =>
                envelope.id,
            ),
          );
        },
      },

      now:
        () =>
          new Date(
            "2026-08-05T20:02:00.000Z",
          ),
    });

  const result =
    await service
      .executeDownload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });

  if (
    result.status !==
      "downloaded" ||
    result.nextCursor !==
      "cursor-5" ||
    !result.hasMore
  ) {
    throw new Error(
      "Download service should return the applied cursor state.",
    );
  }

  if (
    applied[0]?.join(",") !==
    "envelope-8,envelope-9"
  ) {
    throw new Error(
      "Download service should apply envelopes in transport order.",
    );
  }

  const savedCheckpoint =
    repositoryState.saved[0];

  if (
    savedCheckpoint?.cursor !==
      "cursor-5" ||
    savedCheckpoint
      .lastUploadedSequence !==
      7 ||
    savedCheckpoint
      .lastDownloadedAt !==
      "2026-08-05T20:01:00.000Z"
  ) {
    throw new Error(
      "Download service should advance only the download checkpoint state.",
    );
  }

  const failureRepository =
    createRepository();

  const failingService =
    createCloudSyncDownloadService({
      repository:
        failureRepository
          .repository,

      transport: {
        async download() {
          return createBatch({
            envelopes: [
              first,
            ],
          });
        },
      },

      sink: {
        async apply() {
          throw new Error(
            "Application failed.",
          );
        },
      },

      now:
        () =>
          new Date(
            "2026-08-05T20:02:00.000Z",
          ),
    });

  let sinkFailurePropagated =
    false;

  try {
    await failingService
      .executeDownload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });
  } catch (error) {
    sinkFailurePropagated =
      error instanceof Error &&
      error.message ===
        "Application failed.";
  }

  if (
    !sinkFailurePropagated ||
    failureRepository
      .saved.length !== 0
  ) {
    throw new Error(
      "A failed download application must not advance the checkpoint.",
    );
  }

  const foreignService =
    createCloudSyncDownloadService({
      repository:
        createRepository()
          .repository,

      transport: {
        async download() {
          return createBatch({
            userId:
              "user-2",
          });
        },
      },

      sink: {
        async apply() {},
      },

      now:
        () =>
          new Date(),
    });

  let ownershipRejected =
    false;

  try {
    await foreignService
      .executeDownload({
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
      "Download service should reject foreign batch ownership.",
    );
  }

  const cursorService =
    createCloudSyncDownloadService({
      repository:
        createRepository()
          .repository,

      transport: {
        async download() {
          return createBatch({
            previousCursor:
              "wrong-cursor",
          });
        },
      },

      sink: {
        async apply() {},
      },

      now:
        () =>
          new Date(),
    });

  let cursorRejected =
    false;

  try {
    await cursorService
      .executeDownload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });
  } catch (error) {
    cursorRejected =
      error instanceof Error &&
      error.message.includes(
        "previous cursor",
      );
  }

  if (!cursorRejected) {
    throw new Error(
      "Download service should reject stale or mismatched cursors.",
    );
  }

  const duplicateService =
    createCloudSyncDownloadService({
      repository:
        createRepository()
          .repository,

      transport: {
        async download() {
          return createBatch({
            envelopes: [
              first,
              first,
            ],
          });
        },
      },

      sink: {
        async apply() {},
      },

      now:
        () =>
          new Date(),
    });

  let duplicateRejected =
    false;

  try {
    await duplicateService
      .executeDownload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });
  } catch (error) {
    duplicateRejected =
      error instanceof Error &&
      error.message.includes(
        "duplicate envelope ids",
      );
  }

  if (!duplicateRejected) {
    throw new Error(
      "Download service should reject duplicate envelopes.",
    );
  }

  const sequenceService =
    createCloudSyncDownloadService({
      repository:
        createRepository()
          .repository,

      transport: {
        async download() {
          return createBatch({
            envelopes: [
              createEnvelope({
                id:
                  "envelope-9",

                sequence:
                  9,
              }),

              createEnvelope({
                id:
                  "envelope-8",

                sequence:
                  8,
              }),
            ],
          });
        },
      },

      sink: {
        async apply() {},
      },

      now:
        () =>
          new Date(),
    });

  let sequenceRejected =
    false;

  try {
    await sequenceService
      .executeDownload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });
  } catch (error) {
    sequenceRejected =
      error instanceof Error &&
      error.message.includes(
        "increasing sequence order",
      );
  }

  if (!sequenceRejected) {
    throw new Error(
      "Download service should reject out-of-order source-device sequences.",
    );
  }

  const emptyRepository =
    createRepository();

  let emptySinkCalled =
    false;

  const emptyService =
    createCloudSyncDownloadService({
      repository:
        emptyRepository
          .repository,

      transport: {
        async download() {
          return createBatch({
            envelopes:
              [],

            nextCursor:
              "cursor-4",
          });
        },
      },

      sink: {
        async apply() {
          emptySinkCalled =
            true;
        },
      },

      now:
        () =>
          new Date(
            "2026-08-05T20:02:00.000Z",
          ),
    });

  const empty =
    await emptyService
      .executeDownload({
        userId:
          "user-1",

        deviceId:
          "device-1",
      });

  if (
    empty.status !==
      "nothing-downloaded" ||
    emptySinkCalled ||
    emptyRepository
      .saved.length !== 1
  ) {
    throw new Error(
      "An empty download should skip application but persist its confirmed cursor state.",
    );
  }

  console.log(
    "Cloud Sync Download Service test passed.",
  );
}

main().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
