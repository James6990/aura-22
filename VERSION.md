# Apex Version

## Current version

`Apex Foundation 0.7.5-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

IndexedDB Offline Cache Adapter

## Current build target

Offline Cache Synchronization Integration

The first concrete Offline Cache platform adapter is complete.

The IndexedDB adapter now provides:

- an `idb`-based database boundary;
- an Offline Cache entry object store;
- ownership, status, and sequence indexes;
- defensive row serialization and deserialization;
- identity lookup;
- atomic inserts and updates;
- duplicate-key protection;
- missing-entry update protection;
- highest-sequence lookup by user and source device;
- ownership- and status-scoped listing;
- deterministic ordering before applying result limits;
- defensive-copy guarantees;
- full shared storage-conformance verification.

`fake-indexeddb` provides automated adapter verification outside the browser.

The next checkpoint prepares the native SQLite adapter without changing the
existing Offline Cache storage, repository, migration, or service contracts.

## Latest known test state

- Apex module tests passing
- TypeScript typecheck passing
- Documentation check passing
- Git diff check passing

## Documentation state

The repository is the authoritative source of truth for:

- product vision;
- roadmap;
- architecture;
- current build status;
- future enhancements;
- development workflow.

## Versioning guidance

Until Apex Foundation 1.0:

- increment the development version for meaningful architectural milestones;
- record major milestones in `docs/releases/changelog.md`;
- update this file at stable checkpoints;
- do not treat experimental or untested work as a stable version.

## Next planned milestone

Prepare and implement the native SQLite Offline Cache adapter.

The next checkpoint must:

- verify the current Capacitor-compatible SQLite options;
- record the library decision and tradeoffs;
- implement the existing `OfflineCacheStorage` contract;
- use explicit tables, indexes, and transactions;
- pass the shared storage-conformance suite;
- integrate the shared migration framework;
- preserve ownership, deterministic ordering, retry metadata, and defensive
  data boundaries;
- define native corruption, lock, interruption, and low-storage recovery;
- keep SQLite-specific APIs outside domain and synchronization services.
