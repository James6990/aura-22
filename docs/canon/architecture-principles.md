# Apex Architecture Principles

## Core rules

- Use small, focused modules.
- Keep domain logic independent of persistence.
- Use repository and service boundaries.
- Prefer pure functions for reasoning.
- Validate user and decision ownership.
- Preserve immutable event history.
- Version schemas and contracts.
- Make safety overrides explicit.
- Keep live coaching separate from long-term learning.
- Do not allow challenged or retired learning to influence decisions.

## Event-driven direction

AI decision memories should publish validated events before persistence and downstream processing.

The event system should eventually support:

- replay;
- audit;
- analytics;
- sync;
- memory consolidation;
- learning;
- debugging;
- user-facing history.

## Foundations, features, and intelligence

Architectural work follows:

1. **Foundations**
   - contracts;
   - ownership;
   - validation;
   - persistence;
   - events;
   - migrations;
   - deterministic domain rules.

2. **Features**
   - services;
   - actions;
   - user workflows;
   - accessibility;
   - error handling;
   - offline and interruption behaviour.

3. **Intelligence**
   - evidence extraction;
   - interpretation;
   - confidence;
   - memory;
   - learning;
   - explanations;
   - prediction.

The intelligence layer must not infer facts that the foundation did not
record reliably.

## Contextual workout evidence

Workout active time and paused time must remain separate.

Pause length, skipped exercises, substitutions, and early completion may be
used as evidence only with appropriate context and confidence.

Accessibility, discomfort, equipment availability, interruption, and
recovery context must remain distinguishable wherever practical.
