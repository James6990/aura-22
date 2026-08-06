import {
  apexSyncSchemaVersion,
  type ApexSyncEnvelope,
} from "@/lib/sync/contracts";

export const offlineCacheSchemaVersion =
  1 as const;

export type OfflineCacheEntryOrigin =
  | "local"
  | "remote";

export type OfflineCacheEntryStatus =
  | "staged"
  | "applied"
  | "conflicted"
  | "invalid";

export type OfflineCacheConflictCode =
  | "ownership-mismatch"
  | "sequence-conflict"
  | "entity-conflict"
  | "remote-divergence"
  | "unsupported-schema";

export type OfflineCacheConflict = {
  code:
    OfflineCacheConflictCode;

  message:
    string;

  detectedAt:
    string;

  relatedEnvelopeId:
    string | null;

  retryable?:
    boolean;
};

export type OfflineCacheEntry<
  TPayload = unknown,
> = {
  id:
    string;

  userId:
    string;

  deviceId:
    string;

  envelope:
    ApexSyncEnvelope<TPayload>;

  origin:
    OfflineCacheEntryOrigin;

  status:
    OfflineCacheEntryStatus;

  conflict:
    OfflineCacheConflict | null;

  cachedAt:
    string;

  updatedAt:
    string;

  schemaVersion:
    number;
};

export type CreateOfflineCacheEntryInput<
  TPayload = unknown,
> = {
  envelope:
    ApexSyncEnvelope<TPayload>;

  origin:
    OfflineCacheEntryOrigin;

  status?:
    OfflineCacheEntryStatus;

  conflict?:
    OfflineCacheConflict | null;

  cachedAt:
    string;

  updatedAt?:
    string;
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

const offlineCacheOrigins:
  OfflineCacheEntryOrigin[] = [
    "local",
    "remote",
  ];

const offlineCacheStatuses:
  OfflineCacheEntryStatus[] = [
    "staged",
    "applied",
    "conflicted",
    "invalid",
  ];

const offlineCacheConflictCodes:
  OfflineCacheConflictCode[] = [
    "ownership-mismatch",
    "sequence-conflict",
    "entity-conflict",
    "remote-divergence",
    "unsupported-schema",
  ];

function validateConflict(
  conflict:
    OfflineCacheConflict,
) {
  if (
    !offlineCacheConflictCodes.includes(
      conflict.code,
    )
  ) {
    throw new Error(
      "Offline Cache conflict uses an unsupported code.",
    );
  }

  requireIdentifier(
    conflict.message,
    "Offline Cache conflict message",
  );

  requireIsoDate(
    conflict.detectedAt,
    "Offline Cache conflict detectedAt",
  );

  if (
    conflict.relatedEnvelopeId !==
    null
  ) {
    requireIdentifier(
      conflict.relatedEnvelopeId,
      "Offline Cache conflict related envelope id",
    );
  }

  if (
    conflict.retryable !==
      undefined &&
    typeof conflict.retryable !==
      "boolean"
  ) {
    throw new Error(
      "Offline Cache conflict retryable must be a boolean when provided.",
    );
  }
}

export function validateOfflineCacheEntry(
  entry:
    OfflineCacheEntry,
) {
  requireIdentifier(
    entry.id,
    "Offline Cache entry id",
  );

  requireIdentifier(
    entry.userId,
    "Offline Cache user id",
  );

  requireIdentifier(
    entry.deviceId,
    "Offline Cache device id",
  );

  if (
    !offlineCacheOrigins.includes(
      entry.origin,
    )
  ) {
    throw new Error(
      "Offline Cache entry uses an unsupported origin.",
    );
  }

  if (
    !offlineCacheStatuses.includes(
      entry.status,
    )
  ) {
    throw new Error(
      "Offline Cache entry uses an unsupported status.",
    );
  }

  if (
    entry.schemaVersion !==
    offlineCacheSchemaVersion
  ) {
    throw new Error(
      "Offline Cache entry uses an unsupported schema version.",
    );
  }

  if (
    entry.envelope.schemaVersion !==
    apexSyncSchemaVersion
  ) {
    throw new Error(
      "Offline Cache envelope uses an unsupported sync schema version.",
    );
  }

  if (
    entry.userId !==
    entry.envelope.userId
  ) {
    throw new Error(
      "Offline Cache entry user ownership does not match its sync envelope.",
    );
  }

  if (
    entry.deviceId !==
    entry.envelope.deviceId
  ) {
    throw new Error(
      "Offline Cache entry device ownership does not match its sync envelope.",
    );
  }

  if (
    entry.id !==
    entry.envelope.id
  ) {
    throw new Error(
      "Offline Cache entry id must match its sync envelope id.",
    );
  }

  requireIsoDate(
    entry.cachedAt,
    "Offline Cache cachedAt",
  );

  requireIsoDate(
    entry.updatedAt,
    "Offline Cache updatedAt",
  );

  if (
    entry.status ===
    "conflicted"
  ) {
    if (!entry.conflict) {
      throw new Error(
        "A conflicted Offline Cache entry must include conflict details.",
      );
    }

    validateConflict(
      entry.conflict,
    );
  } else if (
    entry.conflict !==
    null
  ) {
    throw new Error(
      "Only conflicted Offline Cache entries may include conflict details.",
    );
  }

  return entry;
}

export function createOfflineCacheEntry<
  TPayload = unknown,
>({
  envelope,
  origin,
  status = "staged",
  conflict = null,
  cachedAt,
  updatedAt = cachedAt,
}: CreateOfflineCacheEntryInput<TPayload>): OfflineCacheEntry<TPayload> {
  const entry:
    OfflineCacheEntry<TPayload> = {
      id:
        envelope.id,

      userId:
        envelope.userId,

      deviceId:
        envelope.deviceId,

      envelope: {
        ...envelope,
      },

      origin,
      status,
      conflict:
        conflict
          ? {
              ...conflict,
            }
          : null,

      cachedAt,
      updatedAt,

      schemaVersion:
        offlineCacheSchemaVersion,
    };

  validateOfflineCacheEntry(
    entry,
  );

  return entry;
}

export function compareOfflineCacheEntries(
  a:
    OfflineCacheEntry,
  b:
    OfflineCacheEntry,
) {
  const sequenceDifference =
    a.envelope.sequence -
    b.envelope.sequence;

  if (
    sequenceDifference !== 0
  ) {
    return sequenceDifference;
  }

  const occurredAtDifference =
    new Date(
      a.envelope.occurredAt,
    ).getTime() -
    new Date(
      b.envelope.occurredAt,
    ).getTime();

  if (
    occurredAtDifference !== 0
  ) {
    return occurredAtDifference;
  }

  return a.id.localeCompare(
    b.id,
  );
}

export function sameOfflineCacheEntry(
  a:
    OfflineCacheEntry,
  b:
    OfflineCacheEntry,
) {
  return (
    a.id === b.id &&
    a.userId === b.userId &&
    a.deviceId === b.deviceId &&
    a.origin === b.origin &&
    a.status === b.status &&
    a.cachedAt === b.cachedAt &&
    a.updatedAt === b.updatedAt &&
    a.schemaVersion ===
      b.schemaVersion &&
    JSON.stringify(
      a.conflict,
    ) ===
      JSON.stringify(
        b.conflict,
      ) &&
    JSON.stringify(
      a.envelope,
    ) ===
      JSON.stringify(
        b.envelope,
      )
  );
}
