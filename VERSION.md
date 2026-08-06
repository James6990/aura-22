# Apex Version

## Current version

`Apex Foundation 0.7.6-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

Cross-Platform Offline Cache Adapters

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

The next checkpoint is Cross-Platform Offline Cache Stabilisation before Event
Analytics begins.

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

Complete Cross-Platform Offline Cache Stabilisation.

The next checkpoint must:

- cache and reuse adapter connections safely;
- replace method-binding-sensitive internal calls;
- connect the shared migration framework to both concrete adapters;
- document native device smoke-test requirements;
- review dependency warnings and install-script approvals;
- document SQLite encryption and recovery expectations;
- keep browser and native behaviour aligned;
- run the full checkpoint before Event Analytics begins.
