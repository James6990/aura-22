# Apex Startup Protocol

Use this protocol at the beginning of a new development conversation or after a long break.

## Startup message

We are continuing development of Apex.

Repository:

`James6990/aura-22`

Active branch:

`apex-foundation-1.0`

Before proposing or making changes, read:

1. `VERSION.md`
2. `PROJECT_STATUS.md`
3. `docs/build-log/current.md`
4. `docs/build-log/future-enhancements.md`
5. `docs/canon/apex-canon.md`
6. `docs/canon/master-vision.md`
7. `docs/canon/design-philosophy.md`
8. `docs/canon/founding-principles.md`
9. `docs/canon/apex-values.md`
10. `docs/canon/non-negotiables.md`
11. `docs/canon/architecture-principles.md`
12. `docs/roadmap/master-roadmap.md`
13. `docs/roadmap/feature-stage-map.md`
14. relevant architecture documents for the active milestone
15. relevant game, coaching, accessibility, and release documents when
    those systems are affected

Review relevant architecture documents before coding.

The permanent product pillars are:

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

Pillars organise the vision but do not replace the staged roadmap.

Do not replace the complete product roadmap with a shortened AI-only roadmap.

Preserve all agreed product systems, including:

- Recovery Pause;
- Return Mode;
- Journey Protection;
- Injury and Movement Constraints;
- clinician instructions;
- accessibility;
- rehabilitation;
- equipment and exercise intelligence;
- fair PvP;
- Bloodlines;
- Bloodline vs Bloodline;
- Journey Map;
- social and community systems;
- devices and wearables;
- long-term autonomous learning.

Follow the Developer Handbook and checkpoint workflow.

Build only the next agreed milestone unless:

- a safety problem requires immediate correction;
- an existing architectural fault blocks reliable progress;
- the user explicitly changes the priority.

For each milestone:

1. inspect existing contracts;
2. build one focused capability;
3. add dedicated tests;
4. run the full Apex verification;
5. update relevant documentation;
6. run documentation and Git diff checks;
7. create a checkpoint;
8. push to `apex-foundation-1.0`.

When a useful idea emerges:

- explain its value and trade-offs;
- determine whether it belongs to the current milestone;
- otherwise add it to `docs/build-log/future-enhancements.md`;
- update the Canon when it changes Apex's enduring identity or principles.

Permanent rule:

> Capture inspiration immediately. Implement it deliberately.

Continue building Apex one stable, explainable, safe, and tested milestone at a time.

## Current continuity rule

At this checkpoint:

- Cloud Sync Contracts are complete;
- Cloud Sync Repository is complete;
- Cloud Sync Service is temporarily interrupted;
- Workout Lifecycle Stabilisation is active;
- development returns directly to Cloud Sync Service after the focused
  workout lifecycle, interface, AI-evidence, and stabilisation checkpoints.

Do not reinterpret this interruption as approval to replace the current
architecture roadmap with a new workout-only roadmap.

## Permanent implementation order

For each capability:

> Foundations → Features → Intelligence

Do not build advanced prediction, Training DNA, Digital Twin, or autonomous
adaptation before the required data and safeguards exist.

## Startup fallback command

Run:

    npm run apex:resume

When that command is unavailable, read the authoritative continuity files:

    echo "=== VERSION ==="
    sed -n '1,280p' VERSION.md

    echo
    echo "=== PROJECT STATUS ==="
    sed -n '1,460p' PROJECT_STATUS.md

    echo
    echo "=== CURRENT BUILD LOG ==="
    sed -n '1,520p' docs/build-log/current.md

    echo
    echo "=== MASTER ROADMAP ==="
    sed -n '1,900p' docs/roadmap/master-roadmap.md

    echo
    echo "=== FEATURE STAGE MAP ==="
    sed -n '1,760p' docs/roadmap/feature-stage-map.md

    echo
    echo "=== MASTER VISION ==="
    sed -n '1,620p' docs/canon/master-vision.md

    echo
    echo "=== APEX CANON ==="
    sed -n '1,760p' docs/canon/apex-canon.md

    echo
    echo "=== FUTURE ENHANCEMENTS ==="
    sed -n '1,980p' docs/build-log/future-enhancements.md

    echo
    echo "=== STARTUP PROTOCOL ==="
    sed -n '1,720p' docs/development/apex-startup-protocol.md
