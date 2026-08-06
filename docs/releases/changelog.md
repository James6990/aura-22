# Apex Changelog

## Unreleased — Foundation Intelligence

### Added

- Evidence Weighting
- Adaptive Confidence
- Coaching Confidence
- Personalisation profiles
- Memory reasoning
- Learning Ledger
- Knowledge Relationships
- Learning Validation
- Contradiction Detection
- Knowledge Resolution
- Learning Integration
- Apex Reasoning State
- Apex Reasoning Trace
- Decision Records
- Decision Outcomes
- Decision Reflection
- Decision History
- Decision Memory Contract
- Decision Memory Manager
- Decision Memory Service
- Decision Memory Event Publisher
- Apex event-writer adapter
- Versioned Decision Memory Event Contracts
- Canonical event-type registry
- Runtime Decision Memory Event Validation
- Validating event-sink boundary
- Validation before PostgreSQL event persistence
- Decision Memory Event Replay Engine
- Deterministic lifecycle reconstruction
- Replay identity and ordering safeguards
- PostgreSQL Decision Memory Repository
- Versioned Decision Memory snapshot serialization
- User-scoped lifecycle persistence
- Cloud Sync Contracts
- Serializable Decision Memory event envelopes
- Sync checkpoint and acknowledgement contracts
- Cloud Sync Repository
- Persistent device checkpoints and outbound envelope queue
- Transactional sync acknowledgement persistence

- Apex Design Philosophy
- Apex Founding Principles
- Apex Values
- Future Enhancements idea vault
- Apex Startup Protocol
- Foundation version reference

### Architecture

- Event-driven direction adopted
- Domain logic separated from persistence
- Repository port introduced
- Repository documentation added as a version-controlled source of truth

### Next

Cloud Sync Service

## Workout Lifecycle Stabilisation — In Progress

- Added a pure workout-session lifecycle contract.
- Added ready, active, paused, ready-to-complete, completed, and skipped
  states.
- Added accurate active-time and pause-duration calculations.
- Added exercise-resolution summaries.
- Added workout timing, pause-history, skip-context, and completion-context
  database fields.
- Generated migration `0009_flawless_mathemanic.sql`.
- Recorded the temporary interruption before Cloud Sync Service.
- Added permanent product pillars and the staged-development rule.
- Captured Training DNA, Digital Twin, predictive coaching, memory graph,
  workout timeline, and adaptive-rest concepts for later stages.

### Companion vision documentation

- Added the Apex Philosophy North Star.
- Defined Apex as an intelligent lifestyle companion.
- Added future Adaptive Coach, Lifestyle, Companion, and Long-Term Life
  Intelligence arcs.
- Added durable efficient-milestone and Hard Save workflow rules.
- Added future Life Timeline, seasonal-pattern, reflection, conversation, and
  lifestyle-planning concepts.
- Preserved Cloud Sync Service as the active implementation milestone.


## Offline Cache Synchronization Pipeline Foundation

### Added

- Canonical Decision Memory sync-envelope factory.
- Local Envelope Staging Service.
- Decision Memory sync-staging event-sink adapter.
- Deterministic remote-envelope Offline Cache application sink.
- Focused tests for envelope creation, local staging, event-sink composition,
  and remote cache application.
- Chat ↔ Termux workflow guidance in the Developer Handbook.

### Architecture

- Persists local envelopes in the Offline Cache before enqueueing them through
  the existing Cloud Sync repository.
- Reuses the existing Cloud Sync outbox rather than creating another queue.
- Keeps device identity and sequence allocation outside the domain publisher.
- Applies downloaded envelopes before advancing the Cloud Sync checkpoint.
- Uses deterministic cache ordering for remote envelopes.
- Preserves platform-neutral service and repository boundaries.

### Verification

- Offline Cache contract tests passing.
- Offline Cache repository tests passing.
- Local Envelope Staging Service tests passing.
- Decision Memory sync-envelope tests passing.
- Decision Memory sync-staging sink tests passing.
- Remote-envelope cache application tests passing.
- TypeScript typecheck passing.
- Git diff check passing.

### Next

Conflict mapping and safe retry boundaries.

## Offline Cache Foundation

### Added

- Versioned Offline Cache entry contracts.
- Local and remote cache-entry origin.
- Staged, applied, conflicted, and invalid lifecycle states.
- Structured conflict codes and related-envelope references.
- Runtime cache schema, sync schema, identity, and ownership validation.
- Deterministic ordering by sequence, occurrence time, and envelope id.
- Platform-neutral Offline Cache storage and repository boundaries.
- Idempotent cache persistence.
- Safe applied, conflicted, and invalid lifecycle transitions.
- Validation of storage-adapter responses.
- Dedicated Offline Cache contract and repository tests.
- `apex:offline-cache:quick` and `apex:offline-cache` verification commands.

### Architecture

- Reuses the existing `ApexSyncEnvelope` contract.
- Does not introduce a second Cloud Sync outbox.
- Does not introduce a competing checkpoint model.
- Keeps persistence independent from IndexedDB, SQLite, or another platform
  adapter.
- Makes conflicts visible rather than silently overwriting evidence.

### Verification

- Offline Cache contract tests passing.
- Offline Cache repository tests passing.
- Full Apex module suite passing.
- TypeScript typecheck passing.
- Documentation check passing.
- Git diff check passing.

### Next

Offline Cache Synchronization Integration.
