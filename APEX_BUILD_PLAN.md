# Apex Build Plan

## Project Direction

Apex is being built as an explainable, adaptive coaching platform rather than a static workout generator.

The build follows these principles:

- Build one stable layer at a time.
- Protect safety, accessibility and recovery before progression.
- Keep powerful intelligence behind a simple user experience.
- Prefer deterministic, testable coaching rules before generative explanations.
- Use curated evidence rather than unrestricted online content.
- Verify every milestone before committing.
- Introduce larger frameworks only when a clear need justifies them.

## Current Branch

`apex-foundation-1.0`

## Current Stable Checkpoint

`checkpoint-decision-reasoning-v1`

## Current Phase

Phase 2 — Explainable Coaching Intelligence

## Completed Foundations

### Platform

- [x] Performance Genome
- [x] Daily readiness and adaptive traits
- [x] Apex Core decision engine
- [x] Coach and companion briefing foundations
- [x] Equipment and environment intelligence
- [x] Programme structure
- [x] Training blocks

### Workout Engine

- [x] Personalised workout recommendations
- [x] Session blueprints
- [x] Exercise selection
- [x] Live workout execution
- [x] Workout persistence and resume behaviour
- [x] Duplicate active-session protection
- [x] Completion debrief
- [x] Persistent elapsed timer

### Coaching Intelligence

- [x] Progression history
- [x] Multi-session progression trends
- [x] Recent training-load analysis
- [x] Exercise rotation intelligence
- [x] Muscle fatigue analysis
- [x] Recovery Intelligence
- [x] Recovery-aware exercise selection
- [x] Adaptive periodisation
- [x] Recovery forecasting
- [x] Forecast-aware adaptive planning
- [x] Unified Apex Decision Context v1
- [x] Evidence and reasoning foundation

### Development Workflow

- [x] Stable checkpoint tags
- [x] `APEX_BUILD_STATE.md`
- [x] `PATCH_HISTORY.md`
- [x] Dedicated build-patch folder
- [x] Safe patch template
- [x] Tiered verification commands
- [x] Automatic GitHub verification
- [x] Non-paged Git output for Termux

## Current Milestone

### Decision Trace Integration v1

**Status:** In progress — integration patch applied

**Goal:** Connect structured reasoning to one live coaching path without changing the visible dashboard.

**First integration target:** Forecast-aware adaptive planning.

**Required behaviour:**

- Every planned day can carry a machine-readable decision trace.
- Postponed sessions record why they were postponed.
- Training days record why they remained suitable.
- Recovery days record the measured or forecast signals that caused the change.
- Confidence is calculated from data completeness, signal agreement, history depth and forecast certainty.
- Safety overrides remain explicit.
- Programme order remains preserved.
- Existing visible behaviour does not change yet.

**Tests:**

- Decision trace exists for every adaptive-plan day.
- Postponement traces contain a recovery reason.
- Safety overrides are preserved.
- Confidence remains between 0 and 100.
- Existing planning and forecasting tests continue to pass.
- `npm run apex:check` passes.

**Planned checkpoint:**

`checkpoint-decision-trace-integration-v1`

## Upcoming Milestones

### 1. Evidence Registry Integration

Connect curated evidence-rule IDs to live recovery, progression and planning decisions.

### 2. Explainable Coach v1

Allow user-facing coaching cards and future “Why?” actions to use stored decision traces rather than inventing explanations.

### 3. Unified ApexDecisionContext Migration

Gradually migrate one live engine at a time onto the shared context object.

### 4. Local Coaching Evaluation Suite

Create diverse fictional user scenarios covering:

- safety;
- accessibility;
- recovery;
- equipment limitations;
- fat loss;
- muscle gain;
- missed sessions;
- conflicting signals.

### 5. Controlled Critique Layer

Validate generated plans and explanations against deterministic safety, accessibility and programme rules.

### 6. Personal Coaching Memory

Learn what works for the individual without overwhelming them.

Potential areas:

- preferred exercises;
- recurring discomfort;
- useful coaching cues;
- preferred session length;
- motivational style;
- recovery patterns;
- schedule disruptions.

### 7. Body Composition Progress Intelligence

Optional weekly and monthly progress tracking for:

- body weight;
- body measurements;
- strength trends;
- adherence;
- recovery;
- user confidence.

### 8. Evidence-Informed Coaching Layer

Expand the curated evidence registry with:

- source;
- publication date;
- applicable population;
- evidence strength;
- limitations;
- review date;
- permitted coaching uses.

### 9. Generative Explanation Layer

Use generative AI mainly to communicate tested deterministic decisions clearly and naturally.

### 10. Advanced Integrations

Consider only when justified:

- wearables;
- health-platform permissions;
- calendars;
- nutrition records;
- MCP;
- LangGraph;
- DSPy.

## Deferred Product Work

- Workout pause and abandonment events
- Exact current set and exercise position persistence
- Offline and crash-recovery improvements
- Dashboard simplification
- Mobile navigation polish
- Exercise substitution intelligence
- Adaptive warm-ups and cool-downs
- Personal-record detection
- Adaptive rest timing
- Fair leaderboard grouping
- Family and Bloodline systems
- Nutrition intelligence
- Native app packaging and store release preparation

## Milestone Workflow

For every substantial milestone:

1. Confirm the working tree is clean.
2. Confirm the latest checkpoint.
3. Apply one versioned patch.
4. Review `git diff --stat`.
5. Review the relevant diff.
6. Run `npm run apex:quick`.
7. Run `npm run apex:check` before committing.
8. Commit with a milestone-specific message.
9. Push to `apex-foundation-1.0`.
10. Tag major stable checkpoints.
11. Update this plan, `APEX_BUILD_STATE.md`, and `PATCH_HISTORY.md`.

## Current Next Action

Build Decision Trace Integration v1 as a single versioned patch.
