# Apex Version

## Current version

`Apex Foundation 0.7.4-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

Offline Cache Platform Adapter and Migration Foundation

## Current build target

Offline Cache Synchronization Integration

The Offline Cache platform-adapter and migration foundation is complete.

Completed capabilities include:

- the platform-neutral `OfflineCacheStorage` boundary;
- a reusable storage-adapter conformance suite;
- ownership, filtering, limits, sequence, update, and defensive-copy checks;
- IndexedDB and SQLite architecture requirements;
- shared transaction, migration, corruption, and recovery expectations;
- a deterministic migration planner;
- ordered migration execution;
- persisted schema-version coordination;
- no version advancement after failed migrations;
- no-op handling when storage is already current;
- platform-independent repository and service boundaries.

No concrete IndexedDB or SQLite library has been selected yet.

The next checkpoint builds the first real platform adapter against the shared
storage conformance and migration foundations.

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

Build the first concrete Offline Cache platform adapter.

The next checkpoint must:

- select the first target platform deliberately;
- verify any library choice against current Capacitor and browser requirements;
- implement the existing `OfflineCacheStorage` contract;
- pass the shared storage conformance suite;
- use the shared migration framework;
- preserve ownership, deterministic ordering, retry metadata, and defensive
  data boundaries;
- keep platform-specific APIs outside domain and synchronization services;
- document the library choice, tradeoffs, and recovery behaviour.
