# Apex Version

## Current version

`Apex Foundation 0.8.0-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

Event Analytics Application Service

## Current build target

Event Analytics History and Comparison

The Event Analytics application service is complete.

Completed capabilities include:

- one platform-neutral analytics use-case boundary;
- validated snapshot identity, ownership, window, and generation time;
- deterministic aggregation and provenance coordination;
- persistence through the platform-neutral snapshot repository;
- immutable persisted returns;
- safe idempotent retries;
- analytics lookup and history retrieval;
- prevention of persistence after aggregation failure;
- repository failure propagation;
- builder and repository response identity validation;
- no PostgreSQL or Drizzle dependency in application logic;
- focused orchestration and failure-boundary verification.

The next checkpoint builds Event Analytics history and comparison contracts,
allowing Apex to compare immutable analytics windows without mutating their
source evidence.

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

Build Event Analytics history and comparison.

The next checkpoint must:

- compare two immutable analytics snapshots for the same user;
- validate compatible ownership and schema boundaries;
- calculate deterministic count and confidence deltas;
- distinguish improvement, decline, stability, and insufficient evidence;
- preserve both source snapshot identifiers and provenance;
- avoid treating correlation as causation;
- remain independent of PostgreSQL and presentation code;
- add focused comparison and failure-boundary tests.
