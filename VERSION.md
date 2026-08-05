# Apex Version

## Current version

`Apex Foundation 0.7.0-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

Cloud Sync Service

## Current build target

Offline Cache

Cloud Sync contracts, repository, upload orchestration, acknowledgement
validation, cursor-safe downloads, application boundaries, and checkpoint
advancement are complete.

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

Build the Offline Cache foundation on top of the completed Cloud Sync Service.

The cache must preserve reliable local operation, deterministic replay,
ownership boundaries, conflict visibility, and safe synchronization without
silently inventing or overwriting evidence.
