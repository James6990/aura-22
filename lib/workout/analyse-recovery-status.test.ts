import {
  analyseRecentTrainingLoad,
} from "./analyse-recent-training-load";
import {
  analyseExerciseRotation,
} from "./analyse-exercise-rotation";
import {
  analyseRecoveryStatus,
} from "./analyse-recovery-status";

const now = new Date(
  "2026-08-04T10:00:00.000Z",
);

const performances = [
  {
    exerciseId:
      "machine-chest-press",
    completedAt: new Date(
      "2026-08-04T02:00:00.000Z",
    ),
    completedSets: 4,
    rpe: 9,
    discomfortLevel: 5,
  },
  {
    exerciseId:
      "dumbbell-bench-press",
    completedAt: new Date(
      "2026-08-03T22:00:00.000Z",
    ),
    completedSets: 4,
    rpe: 8,
    discomfortLevel: 1,
  },
];

const trainingLoad =
  analyseRecentTrainingLoad(
    performances,
    now,
  );

const rotation =
  analyseExerciseRotation(
    performances,
    now,
  );

const recovery =
  analyseRecoveryStatus({
    readinessScore: 70,
    adaptiveRecoveryScore: 65,
    recentTrainingLoad:
      trainingLoad,
    exerciseRotation: rotation,
  });

const pushStatus =
  recovery.movementSignals[
    "horizontal-push"
  ].status;

if (
  pushStatus !== "recovering" &&
  pushStatus !== "avoid-today"
) {
  throw new Error(
    "Recent high-effort pushing with discomfort should require recovery or avoidance.",
  );
}

if (
  recovery.preferredPatterns.includes(
    "horizontal-push",
  )
) {
  throw new Error(
    "A recovering push pattern must not be preferred.",
  );
}

const freshRecovery =
  analyseRecoveryStatus({
    readinessScore: 90,
    adaptiveRecoveryScore: 85,
    recentTrainingLoad:
      analyseRecentTrainingLoad(
        [],
        now,
      ),
    exerciseRotation:
      analyseExerciseRotation(
        [],
        now,
      ),
  });

if (
  freshRecovery.overallStatus !==
  "ready"
) {
  throw new Error(
    "High readiness and recovery with no recent load should be ready.",
  );
}

if (
  freshRecovery.preferredPatterns
    .length === 0
) {
  throw new Error(
    "Fresh recovery should provide preferred patterns.",
  );
}

const lowRecovery =
  analyseRecoveryStatus({
    readinessScore: 30,
    adaptiveRecoveryScore: 35,
    recentTrainingLoad:
      analyseRecentTrainingLoad(
        [],
        now,
      ),
    exerciseRotation:
      analyseExerciseRotation(
        [],
        now,
      ),
  });

if (
  lowRecovery.overallStatus !==
    "avoid-today" &&
  lowRecovery.overallStatus !==
    "recovering"
) {
  throw new Error(
    "Low overall recovery should not support normal training.",
  );
}

console.log(
  "Recovery Intelligence test passed.",
);
