# Apex Version

## Current version

`Apex Foundation 0.8.0-dev`

## Current branch

`apex-foundation-1.0`

## Current architectural stage

Decision Memory and Event-Driven Intelligence Foundations

## Latest stable capability

PostgreSQL Event Analytics Persistence

## Current build target

Event Analytics Application Service

The Event Analytics foundation and PostgreSQL persistence layer are complete.

Completed capabilities include:

- immutable, versioned Decision Memory Event Analytics snapshots;
- deterministic user- and time-window aggregation;
- replay-based lifecycle analysis;
- event-type, confidence, and evidence summaries;
- complete source-event and lifecycle provenance;
- explicit exclusion reasons;
- platform-neutral Analytics Snapshot Repository boundaries;
- immutable and idempotent snapshot persistence;
- PostgreSQL analytics snapshot schema;
- Drizzle migration `0010_add_event_analytics_snapshots`;
- PostgreSQL row mapping and consistency validation;
- ownership-scoped snapshot lookup;
- deterministic overlapping-window queries;
- provenance-preserving hydration;
- focused Event Analytics and PostgreSQL persistence verification.

The next checkpoint builds the Event Analytics application service, providing
one use-case boundary for aggregation, provenance generation, persistence, and
retrieval.

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

Build the Event Analytics application service.

The next checkpoint must:

- accept an explicit snapshot identity, user, time window, generation time,
  and source-event collection;
- call the existing deterministic aggregator;
- persist through the platform-neutral snapshot repository;
- return immutable persisted evidence;
- support safe idempotent retries;
- preserve analytics provenance without recomputation drift;
- keep PostgreSQL and other storage APIs outside the service;
- add focused orchestration and failure-boundary tests;
- avoid connecting analytics to coaching or dashboards until the service is
  verified.
