import type {
  ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import type {
  CloudSyncDownloadSink,
} from "@/lib/sync/service";

import {
  compareOfflineCacheEntries,
  createOfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import type {
  OfflineCacheRepository,
} from "@/lib/sync/offline-cache/repository";

function sameEnvelopeOrder({
  batchEnvelopes,
  suppliedEnvelopes,
}: {
  batchEnvelopes:
    readonly ApexSyncEnvelope[];

  suppliedEnvelopes:
    readonly ApexSyncEnvelope[];
}) {
  if (
    batchEnvelopes.length !==
    suppliedEnvelopes.length
  ) {
    return false;
  }

  return batchEnvelopes.every(
    (
      envelope,
      index,
    ) =>
      envelope.id ===
        suppliedEnvelopes[index]?.id,
  );
}

export function createRemoteEnvelopeCacheApplicationSink({
  offlineCacheRepository,
}: {
  offlineCacheRepository:
    OfflineCacheRepository;
}): CloudSyncDownloadSink {
  return {
    async apply({
      batch,
      envelopes,
    }) {
      if (
        !sameEnvelopeOrder({
          batchEnvelopes:
            batch.envelopes,

          suppliedEnvelopes:
            envelopes,
        })
      ) {
        throw new Error(
          "Remote Offline Cache application envelopes do not match the download batch.",
        );
      }

      const entries =
        envelopes
          .map(
            (envelope) =>
              createOfflineCacheEntry({
                envelope,
                origin:
                  "remote",
                status:
                  "staged",
                cachedAt:
                  batch.serverTime,
              }),
          )
          .sort(
            compareOfflineCacheEntries,
          );

      for (
        const entry of entries
      ) {
        await offlineCacheRepository
          .save(entry);
      }
    },
  };
}
