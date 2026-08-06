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

Event Analytics Trend Interpretation

Event Analytics History and Comparison is complete and verified.

Completed capabilities include:

- immutable, versioned history-comparison contracts;
- deterministic comparison of two analytics snapshots;
- same-user and compatible-schema validation;
- chronological, non-overlapping window enforcement;
- total-event, memory, and decision-count deltas;
- per-event-type deltas;
- lifecycle, confidence, and evidence deltas;
- increased, decreased, stable, and insufficient-evidence directions;
- six-decimal deterministic metric rounding;
- comparison algorithm and source-snapshot provenance;
- defensive cloning and immutable results;
- platform-neutral `compareHistory` application-service orchestration;
- missing-snapshot and identity-boundary protection;
- permanent comparison verification in the Apex test suites.

The next checkpoint builds Event Analytics Trend Interpretation over ordered,
immutable history comparisons. It must identify patterns without claiming
unsupported causation.

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

Build Event Analytics Trend Interpretation.

The next checkpoint must:

- accept an ordered collection of immutable history comparisons;
- validate user, schema, chronology, and comparison continuity;
- distinguish improving, declining, stable, mixed, and
  insufficient-evidence trends;
- calculate deterministic trend strength and evidence coverage;
- preserve all source comparison and snapshot identifiers;
- separate factual trend detection from coaching interpretation;
- avoid causal claims;
- remain independent of PostgreSQL and presentation code;
- add focused chronology, mixed-pattern, and failure-boundary tests.
