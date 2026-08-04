import {
  analyseRecoveryBehaviour,
} from "./analyse-recovery-behaviour";

const profile =
  analyseRecoveryBehaviour([
    {
      date: "2026-08-01",
      energy: 8,
      readinessScore: 82,
      readinessLevel: "high",
      workoutCompleted: true,
      recoveryCompleted: false,
      hydrationTargetReached: true,
    },
    {
      date: "2026-08-02",
      energy: 7,
      readinessScore: 78,
      readinessLevel: "moderate",
      workoutCompleted: false,
      recoveryCompleted: true,
      hydrationTargetReached: true,
    },
    {
      date: "2026-08-03",
      energy: 5,
      readinessScore: 60,
      readinessLevel: "moderate",
      workoutCompleted: true,
      recoveryCompleted: true,
      hydrationTargetReached: false,
    },
    {
      date: "2026-08-04",
      energy: 4,
      readinessScore: 54,
      readinessLevel: "low",
      workoutCompleted: false,
      recoveryCompleted: true,
      hydrationTargetReached: false,
    },
  ]);

if (profile.recordedDays !== 4) {
  throw new Error(
    "Expected four recorded recovery days.",
  );
}

if (profile.averageReadiness !== 68.5) {
  throw new Error(
    `Expected average readiness 68.5, received ${profile.averageReadiness}.`,
  );
}

if (profile.averageEnergy !== 6) {
  throw new Error(
    `Expected average energy 6, received ${profile.averageEnergy}.`,
  );
}

if (profile.hydrationAdherence !== 50) {
  throw new Error(
    "Expected hydration adherence of 50%.",
  );
}

if (profile.recoveryAdherence !== 75) {
  throw new Error(
    "Expected recovery adherence of 75%.",
  );
}

if (
  profile.hydratedReadinessAverage !== 80
) {
  throw new Error(
    "Expected hydrated readiness average of 80.",
  );
}

if (
  profile.nonHydratedReadinessAverage !== 57
) {
  throw new Error(
    "Expected non-hydrated readiness average of 57.",
  );
}

if (
  profile.hydrationReadinessDifference !== 23
) {
  throw new Error(
    "Expected hydration readiness difference of 23 points.",
  );
}

if (
  profile.readinessStability < 0 ||
  profile.readinessStability > 100
) {
  throw new Error(
    "Readiness stability must remain between 0 and 100.",
  );
}

if (
  profile.confidence !== 40
) {
  throw new Error(
    `Expected confidence 40, received ${profile.confidence}.`,
  );
}

console.log(
  "Recovery Behaviour Intelligence test passed.",
);
