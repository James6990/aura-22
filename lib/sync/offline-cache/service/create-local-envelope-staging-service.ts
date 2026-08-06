import type {
  ApexSyncEnvelope,
} from "@/lib/sync/contracts";

import {
  createOfflineCacheEntry,
  type OfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import type {
  OfflineCacheRepository,
} from "@/lib/sync/offline-cache/repository";

import type {
  CloudSyncRepository,
} from "@/lib/sync/repository";

export type LocalEnvelopeStagingService = {
  stage(
    envelope: ApexSyncEnvelope,
    cachedAt: string,
  ): Promise<OfflineCacheEntry>;
};

export function createLocalEnvelopeStagingService({
  offlineCacheRepository,
  cloudSyncRepository,
}: {
  offlineCacheRepository:
    OfflineCacheRepository;
  cloudSyncRepository:
    CloudSyncRepository;
}): LocalEnvelopeStagingService {
  return {
    async stage(
      envelope,
      cachedAt,
    ) {
      const entry =
        createOfflineCacheEntry({
          envelope,
          origin: "local",
          status: "staged",
          cachedAt,
        });

      const stagedEntry =
        await offlineCacheRepository
          .save(entry);

      await cloudSyncRepository
        .enqueue(envelope);

      return stagedEntry;
    },
  };
}
