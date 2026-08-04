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
