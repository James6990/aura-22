# Apex Database Architecture

## Current conventions

- PostgreSQL
- Drizzle ORM
- Camel-case column names
- User-scoped foreign keys
- Cascade deletion where appropriate
- Typed JSONB for versioned snapshots
- Lifecycle state stored in searchable relational columns
- Created and updated timestamps

## Existing persistence systems

- `apex_events`
- `apex_memories`
- workout sessions
- workout exercise results
- Performance Genome
- daily readiness check-ins

## Decision Memory storage direction

Use a repository implementing the Decision Memory repository port.

The likely first persistent model should retain searchable lifecycle fields while storing versioned nested snapshots safely.

Persistence must follow event contracts and validation rather than bypassing the event layer.

## Decision Memory persistence

Apex now persists complete Decision Memory snapshots in `apex_decision_memories`.

The table stores searchable lifecycle fields alongside a versioned JSONB snapshot containing:

- decision record;
- reasoning trace;
- outcome;
- reflection;
- learning entries;
- lifecycle timestamps;
- schema version.

Dates are serialized as ISO strings and explicitly restored by the domain mapper.

The immutable lifecycle event history remains in `apex_events`. Snapshot storage supports complete, fast domain reads while event history supports validation, replay, audit, sync, and future analytics.

## Cloud Sync persistence

Apex stores Cloud Sync state in:

- `apex_sync_checkpoints`;
- `apex_sync_envelopes`.

Checkpoints are uniquely scoped by user and device.

Outbound envelopes use a unique user, device, and sequence constraint so device ordering cannot be duplicated.

Envelope status remains searchable as pending, accepted, or rejected. Structured rejection details remain attached to the affected envelope.
