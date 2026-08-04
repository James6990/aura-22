# Decision Memory Architecture

## Lifecycle

awaiting-response
→ awaiting-outcome
→ ready-for-reflection
→ reflected
→ learning-created
→ closed

## Components

- Decision Record
- Apex Reasoning Trace
- Decision Outcome
- Decision Reflection
- Learning Ledger Entries
- Decision Memory Contract
- Decision Memory Manager
- Decision Memory Service
- Repository Port

## Safety rules

- Trace decision ID must match the decision.
- Trace priority must match the decision.
- Outcome must reference the same decision.
- Outcome must belong to the same user.
- Learning entries must belong to the same user.
- Closed memories cannot be reopened.
