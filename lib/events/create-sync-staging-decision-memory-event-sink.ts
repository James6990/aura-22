import type {
  DecisionMemoryEventSink,
} from "@/lib/apex-core/create-decision-memory-event-publisher";

import {
  createDecisionMemorySyncEnvelope,
} from "@/lib/sync/contracts";

import type {
  LocalEnvelopeStagingService,
} from "@/lib/sync/offline-cache/service";

export type DecisionMemorySyncMetadata = {
  deviceId:
    string;

  sequence:
    number;

  createdAt:
    string;

  cachedAt:
    string;
};

export type DecisionMemorySyncMetadataProvider = {
  getMetadata({
    userId,
  }: {
    userId: string;
  }): Promise<
    DecisionMemorySyncMetadata
  >;
};

export function createSyncStagingDecisionMemoryEventSink({
  stagingService,
  metadataProvider,
}: {
  stagingService:
    LocalEnvelopeStagingService;

  metadataProvider:
    DecisionMemorySyncMetadataProvider;
}): DecisionMemoryEventSink {
  return {
    async publish(
      event,
    ) {
      const metadata =
        await metadataProvider
          .getMetadata({
            userId:
              event.userId,
          });

      const envelope =
        createDecisionMemorySyncEnvelope({
          event,

          deviceId:
            metadata.deviceId,

          sequence:
            metadata.sequence,

          createdAt:
            metadata.createdAt,
        });

      await stagingService.stage(
        envelope,
        metadata.cachedAt,
      );
    },
  };
}
