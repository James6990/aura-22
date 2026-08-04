# Apex Event System

## Direction

Apex uses an event-driven architecture.

Decision memories should publish domain events before persistence adapters and downstream systems act on them.

## Planned decision-memory events

- decision-created
- decision-accepted
- decision-partially-followed
- decision-outcome-recorded
- decision-reflected
- decision-learning-created
- decision-closed

## Future event uses

- replay;
- analytics;
- debugging;
- audit history;
- cloud sync;
- offline reconciliation;
- memory consolidation;
- autonomous learning;
- user journey timelines.

## Implemented publisher boundary

The Decision Memory Event Publisher now:

- creates flat versioned event payloads compatible with `apex_events`;
- validates memory, decision, and user ownership;
- publishes created, outcome, reflection, learning, and closed lifecycle events;
- remains independent of PostgreSQL;
- connects to the existing database event writer through an adapter.

The Decision Memory Service is not yet emitting these events automatically. That integration should occur after Event Contracts and Event Validation are complete.

## Versioned event contracts

Decision Memory events now use a shared contract containing:

- canonical event type;
- canonical category;
- canonical source;
- schema version;
- payload shape;
- human-readable contract description.

The publisher imports these contracts instead of maintaining its own duplicate event definitions.

Event validation remains the next build and will enforce these contracts at runtime before events reach persistence.

## Runtime event validation

Decision Memory events are now validated before persistence or downstream delivery.

Validation enforces:

- registered event types;
- canonical source and category;
- supported schema versions;
- valid timestamps;
- required payload fields;
- confidence ranges;
- learning-count consistency;
- duplicate learning-ID rejection;
- lifecycle-specific payload requirements.

The existing PostgreSQL event-writer adapter now validates every Decision Memory event before writing to `apex_events`.

A reusable validating sink decorator is also available for replay, sync, analytics, and future subscribers.
