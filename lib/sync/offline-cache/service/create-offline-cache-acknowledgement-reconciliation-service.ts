import type {
  ApexSyncAcknowledgement,
} from "@/lib/sync/contracts";

import {
  mapSyncRejectionToCacheResolution,
} from "@/lib/sync/offline-cache/contracts";

import type {
  OfflineCacheRepository,
} from "@/lib/sync/offline-cache/repository";

export type OfflineCacheAcknowledgementReconciliationResult = {
  appliedEnvelopeIds:
    string[];

  conflictedEnvelopeIds:
    string[];

  invalidEnvelopeIds:
    string[];
};

export type OfflineCacheAcknowledgementReconciliationService = {
  reconcile(
    acknowledgement:
      ApexSyncAcknowledgement,
  ): Promise<
    OfflineCacheAcknowledgementReconciliationResult
  >;
};

export function createOfflineCacheAcknowledgementReconciliationService({
  offlineCacheRepository,
}: {
  offlineCacheRepository:
    OfflineCacheRepository;
}): OfflineCacheAcknowledgementReconciliationService {
  return {
    async reconcile(
      acknowledgement,
    ) {
      const appliedEnvelopeIds:
        string[] = [];

      const conflictedEnvelopeIds:
        string[] = [];

      const invalidEnvelopeIds:
        string[] = [];

      for (
        const envelopeId of
        acknowledgement
          .acceptedEnvelopeIds
      ) {
        const entry =
          await offlineCacheRepository
            .getById({
              entryId:
                envelopeId,

              userId:
                acknowledgement.userId,

              deviceId:
                acknowledgement.deviceId,
            });

        if (!entry) {
          throw new Error(
            `Offline Cache acknowledgement entry "${envelopeId}" was not found.`,
          );
        }

        if (
          entry.status !==
          "applied"
        ) {
          await offlineCacheRepository
            .markApplied({
              entryId:
                envelopeId,

              userId:
                acknowledgement.userId,

              deviceId:
                acknowledgement.deviceId,

              updatedAt:
                acknowledgement.serverTime,
            });
        }

        appliedEnvelopeIds.push(
          envelopeId,
        );
      }

      for (
        const rejection of
        acknowledgement.rejected
      ) {
        const entry =
          await offlineCacheRepository
            .getById({
              entryId:
                rejection.envelopeId,

              userId:
                acknowledgement.userId,

              deviceId:
                acknowledgement.deviceId,
            });

        if (!entry) {
          throw new Error(
            `Offline Cache acknowledgement entry "${rejection.envelopeId}" was not found.`,
          );
        }

        const resolution =
          mapSyncRejectionToCacheResolution({
            rejection,

            detectedAt:
              acknowledgement.serverTime,
          });

        if (
          resolution.status ===
          "invalid"
        ) {
          if (
            entry.status !==
            "invalid"
          ) {
            await offlineCacheRepository
              .markInvalid({
                entryId:
                  rejection.envelopeId,

                userId:
                  acknowledgement.userId,

                deviceId:
                  acknowledgement.deviceId,

                updatedAt:
                  acknowledgement.serverTime,
              });
          }

          invalidEnvelopeIds.push(
            rejection.envelopeId,
          );

          continue;
        }

        if (!resolution.conflict) {
          throw new Error(
            "Conflicted Offline Cache resolution requires conflict details.",
          );
        }

        if (
          entry.status !==
            "conflicted" ||
          JSON.stringify(
            entry.conflict,
          ) !==
            JSON.stringify(
              resolution.conflict,
            )
        ) {
          await offlineCacheRepository
            .markConflicted({
              entryId:
                rejection.envelopeId,

              userId:
                acknowledgement.userId,

              deviceId:
                acknowledgement.deviceId,

              conflict:
                resolution.conflict,

              updatedAt:
                acknowledgement.serverTime,
            });
        }

        conflictedEnvelopeIds.push(
          rejection.envelopeId,
        );
      }

      return {
        appliedEnvelopeIds,
        conflictedEnvelopeIds,
        invalidEnvelopeIds,
      };
    },
  };
}
