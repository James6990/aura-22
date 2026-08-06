import type {
  ApexSyncRejection,
} from "@/lib/sync/contracts";

import type {
  OfflineCacheConflict,
  OfflineCacheConflictCode,
  OfflineCacheEntryStatus,
} from "./offline-cache-contract";

export type OfflineCacheRejectionResolution = {
  status:
    Extract<
      OfflineCacheEntryStatus,
      "conflicted" | "invalid"
    >;

  conflict:
    OfflineCacheConflict | null;

  retryable:
    boolean;
};

function mapConflictCode(
  code:
    ApexSyncRejection["code"],
): OfflineCacheConflictCode {
  switch (code) {
    case "unsupported-schema":
      return "unsupported-schema";

    case "ownership-mismatch":
      return "ownership-mismatch";

    case "sequence-conflict":
      return "sequence-conflict";

    case "entity-conflict":
      return "entity-conflict";

    case "duplicate-envelope":
      return "remote-divergence";

    case "invalid-envelope":
      throw new Error(
        "Invalid envelopes do not map to an Offline Cache conflict.",
      );
  }
}

export function mapSyncRejectionToCacheResolution({
  rejection,
  detectedAt,
}: {
  rejection:
    ApexSyncRejection;

  detectedAt:
    string;
}): OfflineCacheRejectionResolution {
  if (
    rejection.code ===
    "invalid-envelope"
  ) {
    return {
      status:
        "invalid",

      conflict:
        null,

      retryable:
        false,
    };
  }

  return {
    status:
      "conflicted",

    conflict: {
      code:
        mapConflictCode(
          rejection.code,
        ),

      message:
        rejection.message,

      detectedAt,

      relatedEnvelopeId:
        rejection.envelopeId,

      retryable:
        rejection.retryable,
    },

    retryable:
      rejection.retryable,
  };
}
