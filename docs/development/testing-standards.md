# Apex Testing Standards

## Required checks

- Dedicated module test
- Boundary and invalid-state tests
- Cross-user safety tests where relevant
- Confidence clamping
- Empty-state behaviour
- Immutability where expected
- Lifecycle transition tests
- Full TypeScript typecheck

## Standard commands

```bash
npm run apex:quick
npm run docs:check
git diff --check
```

A feature is not complete while tests or typecheck fail.
