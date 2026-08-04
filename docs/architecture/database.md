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
