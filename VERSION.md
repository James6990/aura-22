# Apex Version

## Current version

`Apex Foundation 0.7.2-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

Offline Cache Synchronization Pipeline Foundation

## Current build target

Offline Cache Synchronization Integration

The Offline Cache foundation is now connected to the existing Cloud Sync
architecture through verified outbound and inbound synchronization paths.

Completed integration includes:

- canonical Decision Memory sync-envelope creation;
- local envelope staging before Cloud Sync enqueue;
- reuse of the existing Cloud Sync outbox;
- sync-aware Decision Memory event-sink composition;
- deterministic remote-envelope cache application;
- checkpoint advancement only after successful application;
- platform-neutral repository and service boundaries.

The next checkpoint adds explicit conflict mapping and safe retry boundaries
without introducing another queue, checkpoint model, or source of truth.

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

Build Offline Cache conflict mapping and safe retry boundaries on top of the
verified synchronization pipeline.

The next checkpoint must:

- map repository and synchronization failures to explicit cache conflicts;
- preserve retryable evidence without advancing download checkpoints;
- distinguish invalid data from retryable conflicts;
- preserve per-user and per-device ownership;
- avoid silently overwriting divergent evidence;
- remain independent of any specific IndexedDB or SQLite adapter.
