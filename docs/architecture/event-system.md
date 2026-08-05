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

## Event replay

Decision Memory event histories can now be replayed deterministically.

The replay engine:

- validates each event before applying it;
- sorts by occurrence time and event ID;
- rejects duplicate event IDs;
- rejects mixed users, memories, decisions, and correlations;
- preserves immutable decision identity;
- enforces valid lifecycle transitions;
- rejects events after closure;
- reports open and complete histories separately.

The current events contain summary payloads rather than complete nested Decision Memory snapshots. Replay therefore reconstructs the reliable event-derived lifecycle state without inventing missing decision, outcome, reflection, or learning objects.

## Product philosophy events

Future events may record meaningful user-journey changes, but event collection must remain proportionate, purposeful, privacy-aware, and understandable.

Apex must not turn compassionate coaching, recovery, community interaction, or accessibility needs into manipulative engagement metrics.

Event analytics should measure whether the platform improves sustainable wellbeing, not merely how often users open the application.
