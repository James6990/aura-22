# Apex Master Roadmap

This roadmap includes the full product vision. It must not be reduced to only the AI architecture.

## Permanent product pillars

The complete Apex product is organised through these enduring pillars:

1. Core Platform
2. Workout Engine
3. Recovery Engine
4. Nutrition Engine
5. Performance Genome
6. Apex Intelligence
7. Gamification and Fair PvP
8. Social, Community, and Bloodlines
9. Analytics and Explainability
10. Cloud, Sync, and Offline Reliability
11. Accessibility and Rehabilitation
12. Devices, Wearables, and Environmental Intelligence
13. Production Readiness
14. Innovation and Research

Pillars describe product responsibility. The numbered stages below describe
implementation order and dependency maturity.

A feature may belong to several pillars, but it must be implemented only
when its current roadmap stage and dependencies permit it.

## Development sequence

Apex uses the permanent sequence:

> Foundations → Features → Intelligence

This means:

- contracts, ownership, persistence, and events come first;
- reliable user workflows come second;
- learning, prediction, and adaptation come third;
- polish follows correct, safe, and accessible behaviour.

Interesting ideas are captured immediately but never used to bypass the
active milestone.

## Stage 1 — Product and Engineering Foundation

- Repository and branching workflow
- Authentication
- Database foundation
- Dashboard foundation
- Core shared types
- Testing and typecheck commands
- Event timeline foundation
- Performance Genome

## Stage 2 — Core Fitness and Health Platform

- Workout planning
- Workout sessions
- Exercise results
- Progression tracking
- Nutrition
- Hydration
- Recovery
- Readiness
- Dashboard views
- Progress tracking
- Equipment inventory
- Training environment

## Stage 3 — Workout Intelligence

- Recent training-load analysis
- Exercise rotation intelligence
- Recovery status
- Recovery forecasting
- Progression analysis
- Adaptive plan generation
- Adaptive periodisation
- Forecast-aware periodisation
- Exercise selection
- Injury-aware exercise filtering
- Indirect movement-demand checks
- Session rebuilding around unaffected capabilities

## Stage 4 — Decision Intelligence and Explainability

- Apex Core
- Decision Context
- Decision Orchestration
- Coaching State
- Evidence Registry
- Evidence Weighting
- Adaptive Confidence
- Coaching Confidence
- Reasoning State
- Reasoning Trace
- Decision Records
- Decision History
- Decision Outcomes
- Decision Reflection

## Stage 5 — Personalisation, Memory, and Learning

- Exercise preference analysis
- Training behaviour analysis
- Recovery behaviour analysis
- Memory pattern analysis
- Learning Ledger
- Knowledge Relationships
- Learning Validation
- Contradiction Detection
- Knowledge Resolution
- Learning Integration
- Decision Memory
- Decision Memory Manager
- Decision Memory Service

## Stage 6 — Event-Driven Intelligence

Build in this agreed order:

1. Decision Memory Event Publisher
2. Event Contracts
3. Event Validation
4. Event Replay Engine
5. PostgreSQL Repository
6. Cloud Sync
7. Offline Cache
8. Event Analytics
9. Memory Consolidation Engine
10. Autonomous Learning Engine

### Focused workout lifecycle stabilisation

After the Cloud Sync Repository checkpoint, development temporarily returns
to the Workout Engine because the existing session timer starts too early
and cannot represent pauses, skipped exercises, or early completion
accurately.

The focused checkpoint includes:

1. persisted workout lifecycle and timing;
2. pause and resume with optional context;
3. explicit exercise completion and skipping;
4. automatic ready-to-complete transition;
5. normal and early completion;
6. lifecycle events and timeline evidence;
7. dashboard and execution-interface integration;
8. fair AI evidence interpretation;
9. accessibility and stabilisation review.

This is an architectural correction, not a new replacement roadmap.

After it is stable, development returns directly to Cloud Sync Service and
continues the Stage 6 order above.

## Stage 7 — Recovery, Safety, and Return-to-Training

### Recovery Pause

A one-button mode for temporary illness, exhaustion, or life interruption.

It should:

- pause normal prompts;
- pause workout recommendations;
- protect progress;
- protect streaks;
- remove guilt and missed-session pressure;
- silence or reduce notifications;
- remain active until the user turns it off.

### Return Mode

When Recovery Pause or a temporary restriction ends, offer:

- Ease me back in
- Continue where I left off
- Check how I’m feeling first

Return Mode should:

- reduce initial volume and intensity;
- prevent automatic progression temporarily;
- collect post-session feedback;
- gradually restore the programme.

### Journey Protection

Responsible recovery remains part of the user’s journey.

## Stage 8 — Injury, Accessibility, and Rehabilitation

- Injury & Movement Constraints
- Affected body area and side
- Restricted movements
- Safe movements
- Clinician instructions
- Review dates
- Temporary, recurring, and permanent status
- Adaptive substitutions
- Disability-aware training
- Rehabilitation movements and equipment
- Vision, hearing, cognitive, and movement accessibility
- Assisted and adaptive exercise modes

## Stage 9 — Equipment and Exercise Intelligence

- Worldwide equipment catalogue
- Exercise catalogue
- Cardio equipment
- Strength equipment
- Home equipment
- Rehabilitation equipment
- Yoga, mobility, and adaptive movements
- Unknown equipment submission
- User-submitted exercise review
- Moderated catalogue expansion
- Versioned catalogue updates
- Future trusted external discovery process

## Stage 10 — Gamification and Fair PvP

- Healthy-behaviour XP
- Adaptive scoring
- Fairness across ability and experience
- Leagues and seasons
- PvP modes
- Anti-cheat and evidence validation
- Recovery-aware competition
- No pay-to-win

## Stage 11 — Bloodlines and Bloodline vs Bloodline

- Long-term Bloodline communities
- Family and community groups
- Team roles and support
- Bloodline progression
- Bloodline vs Bloodline seasons
- Contribution from training, nutrition, recovery, hydration, improvement, consistency, and encouragement
- Fair adaptive contribution scoring

## Stage 12 — Social, Community, and Journey Systems

- Social feed
- Squad messaging
- Community support
- Journey Map
- Milestones
- Shared challenges
- Seasonal events
- World or community events

## Stage 13 — Devices, Wearables, and Environmental Intelligence

- Wearables
- Biometrics
- Sleep intelligence
- Device integrations
- Environmental conditions
- Travel Mode
- Holiday Mode
- Voice coaching
- Future AR experiences

## Stage 14 — Product Polish and Release Readiness

- Calm recovery visuals
- Welcome-back experience
- Notification refinement
- Animations
- Design consistency
- Performance
- Security and privacy review
- Accessibility audit
- App-store readiness
- Release operations

## Innovation maturity rule

Advanced capabilities include:

- Training DNA;
- Digital Twin simulation;
- predictive coaching;
- adaptive coaching communication;
- confidence timelines;
- long-term performance forecasting;
- gym crowd and equipment-availability intelligence;
- voice and wearable-assisted coaching.

These remain Innovation and Research work until Apex has sufficient:

- reliable longitudinal evidence;
- privacy and consent controls;
- explainability;
- confidence calibration;
- contradiction handling;
- rollback and correction;
- accessibility safeguards;
- clinical and safety boundaries.

They must not be presented as established personal truth when evidence is
limited.

## Future companion-intelligence arc

The following intelligence arc preserves Apex's long-term evolution without
replacing or reordering the numbered implementation stages.

### Adaptive Coach Intelligence

Built after the required event, sync, analytics, memory-consolidation, and
learning foundations are sufficiently reliable.

Includes:

- post-workout analysis;
- fatigue and recovery interpretation;
- progress, maintain, deload, and substitution decisions;
- programme adaptation;
- natural-language explanations;
- Decision Memory and outcome integration.

### Lifestyle Intelligence

Extends personalisation across:

- habits and routines;
- sleep;
- nutrition and hydration;
- recovery and stress context;
- schedule and time constraints;
- sustainable daily planning.

### Companion Intelligence

Develops:

- natural multi-turn conversation;
- remembered discussions and preferences;
- reflection;
- goal planning;
- supportive communication;
- recognition of genuine progress;
- non-judgemental setback support.

### Long-Term Life Intelligence

Explores:

- patterns across months and years;
- seasonal relationships;
- recurring lifestyle challenges;
- preparation before predictable disruption;
- long-term balance across health, work, family, community, and interests.

These capabilities are cross-stage product outcomes, not permission to skip
the active roadmap sequence.

They require strong:

- longitudinal evidence;
- privacy and consent;
- user correction;
- uncertainty communication;
- contradiction handling;
- accessibility;
- safety boundaries;
- auditability.
