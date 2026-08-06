import type {
  OfflineCacheEntry,
} from "@/lib/sync/offline-cache/contracts";

import type {
  IndexedDbOfflineCacheEntryRow,
} from "./create-indexeddb-offline-cache-database";

function cloneEntry(
  entry:
    OfflineCacheEntry,
): OfflineCacheEntry {
  return structuredClone(
    entry,
  );
}

export function indexedDbRowFromOfflineCacheEntry(
  entry:
    OfflineCacheEntry,
): IndexedDbOfflineCacheEntryRow {
  const clonedEntry =
    cloneEntry(entry);

  return {
    id:
      clonedEntry.id,

    userId:
      clonedEntry.userId,

    deviceId:
      clonedEntry.deviceId,

    sequence:
      clonedEntry.envelope
        .sequence,

    status:
      clonedEntry.status,

    entry:
      clonedEntry,
  };
}

export function offlineCacheEntryFromIndexedDbRow(
  row:
    IndexedDbOfflineCacheEntryRow,
): OfflineCacheEntry {
  return cloneEntry(
    row.entry,
  );
}
