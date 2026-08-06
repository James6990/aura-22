# Apex Version

## Current version

`Apex Foundation 0.7.7-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

Cross-Platform Offline Cache Stabilisation

## Current build target

Offline Cache Synchronization Integration

The browser and native Offline Cache platform adapters are complete.

Completed cross-platform persistence includes:

- an `idb`-based IndexedDB adapter for browser and PWA environments;
- a Capacitor 7-compatible SQLite adapter for Android and iOS environments;
- one shared `OfflineCacheStorage` contract;
- one shared storage-conformance suite;
- database, table, object-store, and index initialization;
- defensive row serialization and deserialization;
- identity lookup;
- atomic inserts and updates;
- duplicate-key and missing-update protection;
- highest-sequence lookup by user and source device;
- ownership- and status-scoped listing;
- deterministic ordering before result limits;
- parameterized SQLite queries and writes;
- defensive-copy guarantees;
- platform-neutral migration planning, execution, and version coordination;
- full shared conformance verification for IndexedDB and SQLite.

Cross-Platform Offline Cache Stabilisation is complete.

Completed stabilisation includes:

- cached IndexedDB and SQLite connection promises;
- prevention of duplicate concurrent initialisation;
- retry after failed database initialisation;
- removal of method-binding-sensitive SQLite internal reads;
- migration planning from uninitialised schema version `0`;
- SQLite metadata-backed schema versioning;
- transactional SQLite migration execution and rollback;
- durable migration resume from the last committed version;
- IndexedDB native upgrade-transaction migration execution;
- explicit `0 → 1` schema migrations on both platforms;
- no-op reopening for already-current databases;
- focused lifecycle and migration integration tests.

The next checkpoint begins Event Analytics on top of the completed
cross-platform persistence foundation.

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

Build the Event Analytics foundation.

The next checkpoint must:

- inspect the existing event contracts and replay boundaries;
- define versioned, platform-neutral analytics contracts;
- preserve user ownership and source evidence;
- aggregate without mutating or replacing event history;
- support deterministic time-window and event-type summaries;
- expose explainable metrics suitable for dashboards and coaching;
- remain independent of IndexedDB, SQLite, and PostgreSQL adapters;
- add focused tests before analytics influences coaching decisions.
