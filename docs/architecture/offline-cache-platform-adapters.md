# Apex Offline Cache Platform Adapter Architecture

## Purpose

Apex Offline Cache must support browser and mobile persistence without
changing domain logic, synchronization services, or repository behaviour.

The platform-neutral boundary is:

- Offline Cache services
- Offline Cache repository
- `OfflineCacheStorage`
- platform adapter

Initial target platforms:

- IndexedDB for browser and Progressive Web App environments;
- SQLite for native Capacitor environments.

Apex must not select a concrete IndexedDB or SQLite library until the adapter
contracts, transaction requirements, migration approach, and recovery rules
are reviewed.

## Shared adapter contract

Every platform adapter must implement `OfflineCacheStorage`.

Required operations:

- retrieve an entry by envelope identifier;
- retrieve the highest sequence for one user and source device;
- insert an entry;
- update an entry;
- list entries by user, source device, lifecycle status, and limit.

Every adapter must pass `assertOfflineCacheStorageConformance` before it can be
used in production.

## Shared behavioural requirements

### Ownership isolation

Queries must preserve both:

- `userId`;
- `deviceId`.

An adapter must never return another user's or device's entries for an
ownership-scoped query.

### Deterministic ordering

Adapters should return list results in the repository's expected deterministic
order whenever possible:

1. envelope sequence;
2. envelope occurrence time;
3. envelope identifier.

The repository remains responsible for final deterministic sorting.

### Defensive data boundaries

Returned entries must not expose mutable references to persisted values.

Adapters must clone or deserialize:

- envelopes;
- payloads;
- conflict details;
- arrays;
- nested objects.

### Idempotency and uniqueness

The envelope identifier is the primary cache-entry identity.

Platform storage should enforce uniqueness where possible.

The repository remains responsible for distinguishing:

- identical retries;
- reused identifiers with different data.

### Transactions

A single insert or update must be atomic.

Platform adapters should use transactions for multi-step operations where a
partial write could expose inconsistent cache state.

The current storage port intentionally exposes single-entry writes. Future
batch or migration operations must define their own explicit transaction
boundary rather than silently changing repository semantics.

### Schema versioning

Persist:

- Offline Cache schema version;
- Apex Sync envelope schema version;
- lifecycle status;
- conflict and retry metadata.

Adapters must reject or quarantine unsupported schema versions rather than
silently transforming evidence.

### Migration

Every adapter must define:

- current database schema version;
- ordered migrations;
- upgrade preconditions;
- rollback or recovery behaviour;
- treatment of unsupported old data;
- migration test fixtures.

Migrations must preserve user evidence whenever safe.

### Corruption and recovery

Adapters must distinguish:

- missing data;
- unsupported schema;
- malformed data;
- inaccessible storage;
- transaction failure;
- database corruption.

Malformed or unsupported entries must not be silently discarded.

Recovery may include:

- quarantining invalid records;
- rebuilding indexes;
- recreating empty storage only after evidence-preservation options are
  exhausted;
- resynchronizing recoverable remote evidence;
- surfacing an explainable recovery state to higher layers.

## IndexedDB adapter plan

### Storage model

Use one object store for Offline Cache entries unless measured performance
requires separation.

Recommended primary key:

- `id`.

Required compound indexes:

- `[userId, deviceId, sequence]`;
- `[userId, deviceId, status, sequence]`.

Additional ordering fields may be stored at the top level if the selected
IndexedDB library cannot index nested envelope properties reliably.

### Transactions

- reads use readonly transactions;
- inserts and updates use readwrite transactions;
- migrations run through IndexedDB version upgrades;
- failed transactions must reject without reporting success.

### Browser lifecycle

The adapter must handle:

- blocked upgrades;
- database version changes in another tab;
- unexpected connection closure;
- private-browsing storage restrictions;
- quota errors;
- eviction risk.

Apex must not assume browser storage is permanent backup. Cloud Sync remains
the durable multi-device recovery path where available.

## SQLite adapter plan

### Storage model

Recommended table fields:

- `id` primary key;
- `user_id`;
- `device_id`;
- `sequence`;
- `status`;
- `origin`;
- `cached_at`;
- `updated_at`;
- `schema_version`;
- serialized envelope;
- serialized conflict.

Required indexes:

- `(user_id, device_id, sequence)`;
- `(user_id, device_id, status, sequence)`.

### Transactions

- inserts and lifecycle updates must be atomic;
- migrations run in explicit transactions where supported;
- migration failure must leave the last valid schema usable or surface a
  recoverable startup error;
- write errors must not be converted into successful repository responses.

### Native lifecycle

The adapter must handle:

- interrupted app execution;
- database locks;
- failed migrations;
- low-storage conditions;
- damaged database files;
- application upgrades and downgrades.

## Library-selection criteria

A future library decision must evaluate:

- Capacitor compatibility;
- maintained release history;
- transaction support;
- migration support;
- TypeScript quality;
- browser and native runtime behaviour;
- testability in CI;
- bundle and binary impact;
- encryption options;
- data export and recovery options;
- long-term project viability.

The selected library must adapt to Apex's storage port. Apex must not redesign
its domain or repository contracts around a library-specific API.

## Verification standard

Before enabling an adapter:

1. pass the shared storage conformance suite;
2. pass adapter-specific migration tests;
3. pass interruption and partial-write tests;
4. pass ownership-isolation tests;
5. pass corrupted-record handling tests;
6. pass the full Apex checkpoint;
7. document the chosen library and rationale;
8. complete a Hard Save.

## Deferred decisions

This checkpoint does not choose:

- a specific IndexedDB wrapper;
- a specific Capacitor SQLite plugin;
- encryption implementation;
- background synchronization scheduling;
- storage quotas or retention policy.

Those decisions must be made deliberately with current platform research and
must not derail the active milestone.
