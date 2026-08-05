# Apex Version

## Current version

`Apex Foundation 0.7.1-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

Offline Cache Foundation

## Current build target

Offline Cache Synchronization Integration

Versioned Offline Cache contracts, runtime validation, deterministic ordering,
conflict visibility, lifecycle transitions, idempotent persistence, and the
platform-neutral repository boundary are complete.

The next checkpoint connects this cache foundation to the existing Cloud Sync
services without creating a second outbox, competing checkpoint model, or
alternative source of truth.

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

Build Offline Cache synchronization integration on top of the completed cache
foundation and Cloud Sync Service.

The integration must:

- stage valid local sync envelopes safely;
- apply remote envelopes deterministically;
- preserve per-user and per-device ownership;
- expose conflicts rather than silently overwriting evidence;
- reuse the existing Cloud Sync outbox and checkpoint lifecycle;
- remain independent of any specific IndexedDB or SQLite adapter.
