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
