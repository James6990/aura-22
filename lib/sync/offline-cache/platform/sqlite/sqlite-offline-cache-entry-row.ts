import {
  validateOfflineCacheEntry,
  type OfflineCacheConflict,
  type OfflineCacheEntry,
  type OfflineCacheEntryOrigin,
  type OfflineCacheEntryStatus,
} from "@/lib/sync/offline-cache/contracts";

import type {
  ApexSyncEnvelope,
} from "@/lib/sync/contracts";

export type SQLiteOfflineCacheEntryRow = {
  id:
    string;

  user_id:
    string;

  device_id:
    string;

  sequence:
    number;

  status:
    OfflineCacheEntryStatus;

  origin:
    OfflineCacheEntryOrigin;

  cached_at:
    string;

  updated_at:
    string;

  schema_version:
    number;

  envelope_json:
    string;

  conflict_json:
    string | null;
};

function requireRowString(
  value: unknown,
  label: string,
) {
  if (
    typeof value !==
      "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${label} is invalid.`,
    );
  }

  return value;
}

function requireRowNumber(
  value: unknown,
  label: string,
) {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `${label} is invalid.`,
    );
  }

  return value;
}

function parseJson<T>(
  value: string,
  label: string,
): T {
  try {
    return JSON.parse(
      value,
    ) as T;
  } catch {
    throw new Error(
      `${label} contains invalid JSON.`,
    );
  }
}

export function sqliteRowFromOfflineCacheEntry(
  entry:
    OfflineCacheEntry,
): SQLiteOfflineCacheEntryRow {
  validateOfflineCacheEntry(
    entry,
  );

  return {
    id:
      entry.id,

    user_id:
      entry.userId,

    device_id:
      entry.deviceId,

    sequence:
      entry.envelope
        .sequence,

    status:
      entry.status,

    origin:
      entry.origin,

    cached_at:
      entry.cachedAt,

    updated_at:
      entry.updatedAt,

    schema_version:
      entry.schemaVersion,

    envelope_json:
      JSON.stringify(
        entry.envelope,
      ),

    conflict_json:
      entry.conflict
        ? JSON.stringify(
            entry.conflict,
          )
        : null,
  };
}

export function offlineCacheEntryFromSQLiteRow(
  value: unknown,
): OfflineCacheEntry {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    throw new Error(
      "SQLite Offline Cache row is invalid.",
    );
  }

  const row =
    value as Record<
      string,
      unknown
    >;

  const conflictJson =
    row.conflict_json;

  if (
    conflictJson !== null &&
    typeof conflictJson !==
      "string"
  ) {
    throw new Error(
      "SQLite Offline Cache conflict JSON is invalid.",
    );
  }

  const entry:
    OfflineCacheEntry = {
      id:
        requireRowString(
          row.id,
          "SQLite Offline Cache entry id",
        ),

      userId:
        requireRowString(
          row.user_id,
          "SQLite Offline Cache user id",
        ),

      deviceId:
        requireRowString(
          row.device_id,
          "SQLite Offline Cache device id",
        ),

      envelope:
        parseJson<
          ApexSyncEnvelope
        >(
          requireRowString(
            row.envelope_json,
            "SQLite Offline Cache envelope JSON",
          ),
          "SQLite Offline Cache envelope JSON",
        ),

      origin:
        requireRowString(
          row.origin,
          "SQLite Offline Cache origin",
        ) as OfflineCacheEntryOrigin,

      status:
        requireRowString(
          row.status,
          "SQLite Offline Cache status",
        ) as OfflineCacheEntryStatus,

      conflict:
        conflictJson ===
        null
          ? null
          : parseJson<
              OfflineCacheConflict
            >(
              conflictJson,
              "SQLite Offline Cache conflict JSON",
            ),

      cachedAt:
        requireRowString(
          row.cached_at,
          "SQLite Offline Cache cachedAt",
        ),

      updatedAt:
        requireRowString(
          row.updated_at,
          "SQLite Offline Cache updatedAt",
        ),

      schemaVersion:
        requireRowNumber(
          row.schema_version,
          "SQLite Offline Cache schema version",
        ),
    };

  if (
    entry.envelope.sequence !==
    requireRowNumber(
      row.sequence,
      "SQLite Offline Cache sequence",
    )
  ) {
    throw new Error(
      "SQLite Offline Cache row sequence does not match its envelope.",
    );
  }

  validateOfflineCacheEntry(
    entry,
  );

  return structuredClone(
    entry,
  );
}
