# Apex Cloud Sync Architecture

## Purpose

Cloud Sync keeps Apex Decision Memory events and future snapshots consistent across devices while preserving ownership, ordering, versioning, and auditability.

## Implemented contracts

The initial Cloud Sync contract defines:

- sync envelopes;
- user and device ownership;
- entity identity;
- append and upsert operations;
- monotonic device sequence numbers;
- opaque server cursors;
- upload batches;
- download batches;
- acknowledgements;
- structured rejections;
- contract schema versions.

Decision Memory events are serialized into transport-safe envelopes with ISO timestamps.

## Design rules

- Events remain append-only.
- Server cursors are opaque to clients.
- Device sequence numbers are monotonic.
- Duplicate uploads must be idempotent.
- Ownership must be validated.
- Unsupported schema versions must be rejected safely.
- Conflict handling must remain deterministic and explainable.
- Network transport remains separate from domain logic.

## Next build

Cloud Sync Repository:

- persist device checkpoints;
- persist outbound sync envelopes;
- retrieve pending uploads;
- acknowledge accepted envelopes;
- retain structured rejection information.
