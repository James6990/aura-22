# Apex Build State

## Current Branch

`apex-foundation-1.0`

## Latest Stable Checkpoint

`checkpoint-adaptive-coaching-v1`

## Current Milestone

Adaptive Coaching Foundation v1

## Completed Systems

### Core Platform

- Performance Genome
- Daily readiness and check-ins
- Apex Core decision engine
- Apex Coach decision and briefing system
- Equipment and training-environment intelligence
- Programme structure
- Training blocks
- Adaptive seven-day planning

### Workout Engine

- Personalised workout recommendations
- Session blueprints
- Exercise selection
- Live workout execution
- Exercise logging
- Workout persistence
- Active workout detection
- Resume workout
- Duplicate-session protection
- Workout completion and debrief
- Persistent elapsed workout timer

### Workout Intelligence

- Exercise progression history
- Immediate progression safety decisions
- Multi-session progression trends
- Recent training-load analysis
- Exercise rotation intelligence
- Muscle fatigue analysis
- Recovery Intelligence
- Recovery-aware exercise selection
- Programme-aware adaptive periodisation

## Current Stable Behaviour

- Only one active workout can exist per user.
- An unfinished workout is resumed instead of duplicated.
- Exercise progress is saved to the database.
- Completed workouts generate progression decisions.
- Workout history influences future exercise selection.
- Recovery signals influence movement-pattern ranking.
- Programme roles are scheduled without stacking demanding days.
- Skipped sessions are redistributed rather than compressed.

## Deferred Roadmap Items

- Workout pause and abandonment events
- Exact current set and exercise position persistence
- Crash and offline recovery improvements
- Dashboard simplification and mobile navigation polish
- Optional muscle-group focus for muscle-gain goals
- Fair leaderboards grouped by training circumstances
- Body Composition Progress Intelligence
- Optional weekly progress check-ins
- Monthly progression reports
- Evidence-Informed Coaching Layer
- Fatigue and recovery forecasting
- Exercise substitution intelligence
- Personal-record detection
- Warm-up and cool-down generation
- Adaptive rest timing

## Product Principles

- Build and test one stable layer at a time.
- Create checkpoints before major changes.
- Improve existing systems while adding new ones.
- Keep internal intelligence powerful while keeping the interface simple.
- Do not overwhelm users with optional tracking.
- Explain important coaching decisions.
- Treat medical and safety boundaries conservatively.
- Prefer curated professional evidence over unrestricted web content.
- Design toward a clean mobile app, even when features temporarily appear on the dashboard during development.

## Current Next Step

Build Fatigue and Recovery Forecasting v1.

This should predict likely recovery over upcoming days and feed those predictions into adaptive periodisation without replacing the current same-day Recovery Intelligence engine.

## Verification

Before committing a milestone, run:

    npx tsc --noEmit
    npm run build

Run the relevant isolated and integration tests for any changed intelligence engines before the full build.
