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


## PostgreSQL Event Analytics Persistence

### Added

- PostgreSQL `apex_event_analytics_snapshots` table.
- Drizzle migration `0010_add_event_analytics_snapshots`.
- User/window, user/generated-time, and combined analytics indexes.
- PostgreSQL Event Analytics row mapper.
- PostgreSQL Event Analytics storage adapter.
- PostgreSQL Event Analytics repository composition.
- Focused row-mapping and storage-adapter tests.

### Architecture

- Stores immutable, versioned analytics snapshots while source events remain
  authoritative.
- Preserves complete Analytics Provenance inside JSONB snapshots.
- Uses snapshot id as the immutable identity and conflict boundary.
- Allows legitimate rebuilds for the same time window.
- Uses insert conflict handling for safe concurrent retries.
- Keeps Drizzle and PostgreSQL APIs behind the platform-neutral repository.
- Enforces row and snapshot identity, ownership, window, generation-time, and
  schema-version consistency.
- Supports ownership-scoped retrieval and deterministic overlapping-window
  queries.
- Preserves defensive data boundaries during PostgreSQL hydration.

### Verification

- PostgreSQL Event Analytics row-mapping tests passing.
- PostgreSQL Event Analytics storage tests passing.
- Event Analytics quick verification passing.
- Full Apex checkpoint passing.
- TypeScript typecheck passing.
- Drizzle migration generated and inspected.
- Documentation check passing.
- Git diff check passing.

### Next

Event Analytics application service.

## Event Analytics Foundation

### Added

- Versioned immutable Decision Memory Event Analytics snapshot contract.
- Explicit analytics time-window contract.
- Event-type count summaries.
- Lifecycle completion, incompletion, and invalid-history summaries.
- Confidence minimum, maximum, average, and sample summaries.
- Evidence-sufficiency summaries.
- Source-event, memory, decision, and schema-version traceability.
- Deterministic Decision Memory Event Analytics aggregator.
- Platform-neutral Event Analytics Snapshot Repository.
- Dedicated `apex:event-analytics:quick` verification.

### Architecture

- Analytics reads event evidence without mutating event history.
- Decision Memory lifecycles are evaluated through the existing replay engine.
- Analytics remains independent of PostgreSQL, IndexedDB, and SQLite.
- Generated snapshots are immutable and versioned.
- Snapshot identifiers cannot be reused for different evidence.
- Identical persistence retries are idempotent.
- Repository reads and lists enforce user ownership.
- Snapshot lists use deterministic window and generation ordering.
- Source event identifiers preserve explainable analytics provenance.

### Verification

- Event Analytics contract tests passing.
- Event Analytics aggregation tests passing.
- Event Analytics repository tests passing.
- Dedicated Event Analytics quick verification passing.
- Full Apex checkpoint passing.
- TypeScript typecheck passing.
- Documentation check passing.
- Git diff check passing.

### Next

PostgreSQL Event Analytics snapshot persistence.

## Cross-Platform Offline Cache Stabilisation

### Added

- IndexedDB and SQLite lifecycle regression tests.
- IndexedDB native migration integration.
- SQLite transactional migration integration.
- Bootstrap migration support from schema version `0`.
- SQLite schema metadata persistence.

### Improved

- Cached one database connection promise per storage instance.
- Prevented duplicate concurrent adapter initialisation.
- Allowed retry after temporary initialisation failure.
- Removed SQLite reliance on `this.getById()`.
- Converted both initial platform schemas into explicit `0 → 1` migrations.
- Added already-current database no-op verification.

### Safety

- SQLite schema changes and version advancement now share one transaction.
- Failed SQLite migrations roll back without advancing the durable version.
- SQLite migrations resume from the last committed version.
- IndexedDB schema changes remain inside the native upgrade transaction.
- Executable migration callbacks remain internal and are not returned as
  migration evidence.

### Verification

- IndexedDB lifecycle tests passing.
- SQLite lifecycle tests passing.
- IndexedDB migration integration tests passing.
- SQLite migration integration tests passing.
- IndexedDB and SQLite database migration tests passing.
- Shared storage conformance tests passing for both adapters.
- Focused Offline Cache verification passing.
- TypeScript typecheck passing.
- Git diff check passing.

### Next

Event Analytics.

## Native SQLite Offline Cache Adapter

### Added

- `@capacitor-community/sqlite@7.0.3` for Capacitor 7 native persistence.
- Injectable SQLite connection-provider boundary.
- Production Capacitor SQLite connection provider.
- Native Offline Cache database and schema initialization.
- SQLite Offline Cache table and compound indexes.
- SQLite row serialization, JSON parsing, and validation.
- SQLite implementations of all `OfflineCacheStorage` operations.
- Focused database, read, write, sequence, list, and conformance tests.

### Architecture

- Keeps Capacitor SQLite APIs behind `OfflineCacheStorage`.
- Uses a dedicated `offline_cache_entries` table.
- Uses parameterized SQL for reads and writes.
- Preserves user and source-device ownership isolation.
- Enforces deterministic ordering before result limiting.
- Returns defensive copies of persisted evidence.
- Propagates duplicate constraints and storage failures.
- Closes failed database initialization safely.
- Leaves domain, event, synchronization, repository, and service contracts
  unchanged.
- Uses the same storage-conformance suite as IndexedDB.

### Verification

- SQLite database initialization tests passing.
- SQLite `getById` tests passing.
- SQLite insert and update tests passing.
- SQLite sequence tests passing.
- SQLite list and ordering tests passing.
- Shared Offline Cache storage-conformance suite passing against SQLite.
- Focused Offline Cache verification passing.
- Full Apex checkpoint passing.
- TypeScript typecheck passing.
- Documentation check passing.
- Git diff check passing.

### Next

Cross-Platform Offline Cache Stabilisation.

## IndexedDB Offline Cache Adapter

### Added

- `idb` as the browser and PWA IndexedDB boundary.
- `fake-indexeddb` for automated adapter verification.
- IndexedDB Offline Cache database factory and deletion helper.
- Offline Cache object store and compound indexes.
- IndexedDB row serialization and deserialization.
- IndexedDB implementations of all `OfflineCacheStorage` operations.
- Focused database, read, write, sequence, list, and conformance tests.

### Architecture

- Keeps IndexedDB-specific APIs behind `OfflineCacheStorage`.
- Uses entry id as the object-store primary key.
- Indexes ownership, status, and sequence for efficient scoped access.
- Preserves user and source-device isolation.
- Sorts globally before applying list limits.
- Returns defensive copies of persisted evidence.
- Leaves domain, synchronization, repository, and service contracts unchanged.

### Verification

- IndexedDB database tests passing.
- IndexedDB `getById` tests passing.
- IndexedDB insert and update tests passing.
- IndexedDB sequence tests passing.
- IndexedDB list and deterministic-limit tests passing.
- Shared Offline Cache storage-conformance suite passing against IndexedDB.
- Focused Offline Cache verification passing.
- TypeScript typecheck passing.
- Git diff check passing.

### Next

Native SQLite Offline Cache adapter.

## Offline Cache Platform Adapter and Migration Foundation

### Added

- Reusable `OfflineCacheStorage` conformance suite.
- Reference in-memory conformance verification.
- Offline Cache platform-adapter architecture for IndexedDB and SQLite.
- Deterministic Offline Cache migration planner.
- Ordered migration executor.
- Platform-neutral migration runner and schema-version storage boundary.
- Focused migration failure and resume tests.

### Architecture

- Keeps platform APIs behind the existing `OfflineCacheStorage` port.
- Requires future adapters to pass one shared behavioural standard.
- Defers concrete IndexedDB and SQLite library selection.
- Defines ownership, transaction, defensive-copy, migration, corruption, and
  recovery expectations.
- Rejects downgrades, missing migration steps, duplicate steps, and skipped
  schema versions.
- Persists a target schema version only after all planned migrations succeed.
- Allows migration recovery to resume from the last durable schema version.

### Verification

- Offline Cache storage-conformance tests passing.
- Migration planner tests passing.
- Migration executor tests passing.
- Migration runner tests passing.
- Focused Offline Cache verification passing.
- TypeScript typecheck passing.
- Documentation check passing.
- Git diff check passing.

### Next

First concrete Offline Cache platform adapter.

## Offline Cache Conflict Resolution and Retry Foundation

### Added

- Canonical synchronization-rejection to Offline Cache resolution mapping.
- Applied, conflicted, and invalid acknowledgement reconciliation.
- Backward-compatible retryability metadata on Offline Cache conflicts.
- Idempotent acknowledgement reconciliation.
- Focused partial-failure and safe-retry verification.

### Architecture

- Keeps Offline Cache reconciliation separate from Cloud Sync acknowledgement
  persistence.
- Allows reconciliation to be retried independently after a partial failure.
- Avoids introducing distributed transaction assumptions between repositories.
- Preserves accepted lifecycle transitions already completed during a retry.
- Distinguishes invalid envelopes from retryable and non-retryable conflicts.
- Maps duplicate divergence into an explicit remote-divergence conflict.

### Verification

- Offline Cache conflict-mapping tests passing.
- Offline Cache acknowledgement-reconciliation tests passing.
- Partial reconciliation retry-boundary tests passing.
- Full focused Offline Cache verification passing.
- TypeScript typecheck passing.
- Git diff check passing.

### Next

Platform adapter planning for IndexedDB and SQLite.

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
