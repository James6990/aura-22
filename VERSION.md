# Apex Version

## Current version

`Apex Foundation 0.7.3-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

Offline Cache Conflict Resolution and Retry Foundation

## Current build target

Offline Cache Synchronization Integration

The Offline Cache foundation, synchronization pipeline, conflict mapping, and
safe acknowledgement-reconciliation boundaries are complete.

Completed integration includes:

- canonical Decision Memory sync-envelope creation;
- local envelope staging before Cloud Sync enqueue;
- reuse of the existing Cloud Sync outbox;
- sync-aware Decision Memory event-sink composition;
- deterministic remote-envelope cache application;
- checkpoint advancement only after successful application;
- canonical synchronization-rejection mapping;
- applied, conflicted, and invalid acknowledgement reconciliation;
- persisted retryability metadata;
- idempotent reconciliation;
- safe continuation after partial reconciliation failure;
- platform-neutral repository and service boundaries.

The next checkpoint plans the IndexedDB and SQLite adapter boundaries without
coupling domain, synchronization, or cache services to a specific platform.

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

Plan the platform-specific Offline Cache adapters for IndexedDB and SQLite.

The next checkpoint must:

- define shared adapter responsibilities and transaction boundaries;
- preserve deterministic ordering and idempotent persistence;
- support per-user and per-device ownership queries;
- protect lifecycle transitions and retry metadata;
- avoid leaking platform details into domain or synchronization services;
- document migration, recovery, and corruption-handling expectations;
- defer concrete platform implementation until the adapter contracts are
  reviewed and verified.
