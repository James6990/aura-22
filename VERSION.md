# Apex Version

## Current version

`Apex Foundation 0.8.0-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

Event Analytics Foundation

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

The initial Event Analytics foundation is complete.

Completed capabilities include:

- a versioned immutable Decision Memory Event Analytics snapshot contract;
- explicit analytics time windows;
- deterministic event-type counts;
- unique Decision Memory and decision totals;
- replay-based lifecycle completion analysis;
- confidence minimum, maximum, average, and sample totals;
- evidence-sufficiency summaries;
- source-event, memory, decision, and schema-version traceability;
- user and time-window filtering;
- deterministic event ordering;
- duplicate source-event protection;
- empty-window analytics support;
- a platform-neutral Analytics Snapshot Repository;
- immutable and defensively cloned repository results;
- idempotent identical snapshot saves;
- protection against reused snapshot identifiers with different evidence;
- ownership-scoped lookup and listing;
- deterministic snapshot window ordering;
- focused Event Analytics verification.

The next checkpoint builds the first concrete Event Analytics snapshot
persistence adapter.

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

Build PostgreSQL Event Analytics snapshot persistence.

The next checkpoint must:

- add a versioned Analytics Snapshot database schema;
- implement the existing platform-neutral storage contract;
- preserve immutable snapshot evidence;
- enforce snapshot identity and user ownership;
- support deterministic time-window queries;
- validate stored row and snapshot consistency;
- keep analytics aggregation independent of PostgreSQL;
- add focused repository-adapter tests;
- avoid connecting analytics to coaching decisions or dashboards until
  persistence is verified.
