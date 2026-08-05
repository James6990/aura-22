import {
  apexSyncSchemaVersion,
  type ApexSyncCursor,
  type ApexSyncDownloadBatch,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";
import type {
  CloudSyncRepository,
} from "@/lib/sync/repository";

export type ExecuteCloudSyncDownloadInput = {
  userId: string;
  deviceId: string;
  limit?: number;
};

export type ExecuteCloudSyncDownloadResult = {
  status:
    | "nothing-downloaded"
    | "downloaded";

  appliedEnvelopeIds:
    string[];

  previousCursor:
    ApexSyncCursor;

  nextCursor:
    ApexSyncCursor;

  hasMore:
    boolean;
};

export type CloudSyncDownloadTransport = {
  download(input: {
    userId: string;
    deviceId: string;
    cursor:
      ApexSyncCursor;
    limit: number;
  }): Promise<
    ApexSyncDownloadBatch
  >;
};

export type CloudSyncDownloadSink = {
  apply(input: {
    batch:
      ApexSyncDownloadBatch;

    envelopes:
      readonly ApexSyncEnvelope[];
  }): Promise<void>;
};

export type CloudSyncDownloadService = {
  executeDownload(
    input:
      ExecuteCloudSyncDownloadInput,
  ): Promise<
    ExecuteCloudSyncDownloadResult
  >;
};

export type CloudSyncDownloadServiceDependencies = {
  repository:
    CloudSyncRepository;

  transport:
    CloudSyncDownloadTransport;

  sink:
    CloudSyncDownloadSink;

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

function requireLimit(
  value: number,
) {
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 500
  ) {
    throw new Error(
      "Cloud Sync download limit must be between 1 and 500.",
    );
  }

  return value;
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

function validateEnvelope({
  envelope,
  userId,
}: {
  envelope:
    ApexSyncEnvelope;

  userId: string;
}) {
  requireIdentifier(
    envelope.id,
    "Downloaded envelope id",
  );

  requireIdentifier(
    envelope.userId,
    "Downloaded envelope user id",
  );

  requireIdentifier(
    envelope.deviceId,
    "Downloaded envelope source device id",
  );

  requireIdentifier(
    envelope.entityId,
    "Downloaded envelope entity id",
  );

  if (
    envelope.userId !==
    userId
  ) {
    throw new Error(
      "Cloud Sync download contains an envelope belonging to another user.",
    );
  }

  if (
    !Number.isInteger(
      envelope.sequence,
    ) ||
    envelope.sequence < 1
  ) {
    throw new Error(
      "Downloaded envelope sequence must be a positive integer.",
    );
  }

  if (
    envelope.schemaVersion !==
    apexSyncSchemaVersion
  ) {
    throw new Error(
      "Downloaded envelope uses an unsupported schema version.",
    );
  }

  requireIsoDate(
    envelope.occurredAt,
    "Downloaded envelope occurredAt",
  );

  requireIsoDate(
    envelope.createdAt,
    "Downloaded envelope createdAt",
  );
}

function validateDownloadBatch({
  batch,
  userId,
  deviceId,
  cursor,
}: {
  batch:
    ApexSyncDownloadBatch;

  userId: string;
  deviceId: string;
  cursor:
    ApexSyncCursor;
}) {
  requireIdentifier(
    batch.userId,
    "Cloud Sync download user id",
  );

  requireIdentifier(
    batch.deviceId,
    "Cloud Sync download device id",
  );

  requireIsoDate(
    batch.serverTime,
    "Cloud Sync download server time",
  );

  if (
    batch.schemaVersion !==
    apexSyncSchemaVersion
  ) {
    throw new Error(
      "Cloud Sync download uses an unsupported schema version.",
    );
  }

  if (
    batch.userId !==
      userId ||
    batch.deviceId !==
      deviceId
  ) {
    throw new Error(
      "Cloud Sync download ownership does not match the requested device.",
    );
  }

  if (
    batch.previousCursor !==
    cursor
  ) {
    throw new Error(
      "Cloud Sync download previous cursor does not match the saved checkpoint.",
    );
  }

  if (
    batch.hasMore &&
    batch.nextCursor === null
  ) {
    throw new Error(
      "Cloud Sync download with more data must provide a next cursor.",
    );
  }

  if (
    (
      batch.hasMore ||
      batch.envelopes.length > 0
    ) &&
    batch.nextCursor ===
      batch.previousCursor
  ) {
    throw new Error(
      "Cloud Sync download cursor must advance when data is returned.",
    );
  }

  const envelopeIds =
    new Set<string>();

  const latestSequenceByDevice =
    new Map<
      string,
      number
    >();

  for (
    const envelope of
    batch.envelopes
  ) {
    validateEnvelope({
      envelope,
      userId,
    });

    if (
      envelopeIds.has(
        envelope.id,
      )
    ) {
      throw new Error(
        "Cloud Sync download contains duplicate envelope ids.",
      );
    }

    envelopeIds.add(
      envelope.id,
    );

    const previousSequence =
      latestSequenceByDevice.get(
        envelope.deviceId,
      );

    if (
      previousSequence !==
        undefined &&
      envelope.sequence <=
        previousSequence
    ) {
      throw new Error(
        "Cloud Sync download envelopes must preserve increasing sequence order per source device.",
      );
    }

    latestSequenceByDevice.set(
      envelope.deviceId,
      envelope.sequence,
    );
  }
}

export function createCloudSyncDownloadService({
  repository,
  transport,
  sink,
  now,
}: CloudSyncDownloadServiceDependencies):
  CloudSyncDownloadService {
  return {
    async executeDownload({
      userId,
      deviceId,
      limit = 100,
    }) {
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

      const checkpoint =
        await repository
          .getCheckpoint({
            userId:
              resolvedUserId,

            deviceId:
              resolvedDeviceId,
          });

      const cursor =
        checkpoint?.cursor ??
        null;

      const batch =
        await transport
          .download({
            userId:
              resolvedUserId,

            deviceId:
              resolvedDeviceId,

            cursor,

            limit:
              resolvedLimit,
          });

      validateDownloadBatch({
        batch,
        userId:
          resolvedUserId,
        deviceId:
          resolvedDeviceId,
        cursor,
      });

      /*
       * Application happens before checkpoint advancement.
       * A failed sink therefore leaves the saved cursor unchanged
       * and allows the same batch to be retried safely.
       */
      if (
        batch.envelopes.length > 0
      ) {
        await sink.apply({
          batch: {
            ...batch,

            envelopes:
              batch.envelopes.map(
                (envelope) => ({
                  ...envelope,
                }),
              ),
          },

          envelopes:
            batch.envelopes.map(
              (envelope) => ({
                ...envelope,
              }),
            ),
        });
      }

      const checkpointTime =
        requireValidDate(
          now(),
          "Cloud Sync checkpoint time",
        );

      await repository
        .saveCheckpoint({
          userId:
            resolvedUserId,

          deviceId:
            resolvedDeviceId,

          cursor:
            batch.nextCursor,

          lastUploadedSequence:
            checkpoint
              ?.lastUploadedSequence ??
            0,

          lastDownloadedAt:
            batch.serverTime,

          updatedAt:
            checkpointTime
              .toISOString(),

          schemaVersion:
            apexSyncSchemaVersion,
        });

      return {
        status:
          batch.envelopes.length ===
          0
            ? "nothing-downloaded"
            : "downloaded",

        appliedEnvelopeIds:
          batch.envelopes.map(
            (envelope) =>
              envelope.id,
          ),

        previousCursor:
          batch.previousCursor,

        nextCursor:
          batch.nextCursor,

        hasMore:
          batch.hasMore,
      };
    },
  };
}
