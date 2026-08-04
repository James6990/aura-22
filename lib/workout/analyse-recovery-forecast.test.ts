import {
  analyseRecentTrainingLoad,
} from "./analyse-recent-training-load";
import {
  analyseExerciseRotation,
} from "./analyse-exercise-rotation";
import {
  analyseRecoveryStatus,
} from "./analyse-recovery-status";
import {
  analyseRecoveryForecast,
} from "./analyse-recovery-forecast";

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
];

const recentTrainingLoad =
  analyseRecentTrainingLoad(
    performances,
    now,
  );

const exerciseRotation =
  analyseExerciseRotation(
    performances,
    now,
  );

const recoveryIntelligence =
  analyseRecoveryStatus({
    readinessScore: 62,
    adaptiveRecoveryScore: 58,
    recentTrainingLoad,
    exerciseRotation,
  });

const forecast =
  analyseRecoveryForecast({
    recoveryIntelligence,
    recentTrainingLoad,
  });

if (forecast.days.length !== 7) {
  throw new Error(
    "Recovery forecast must contain seven days.",
  );
}

if (
  forecast.days[0]
    .expectedRecoveryScore !==
  recoveryIntelligence.overallScore
) {
  throw new Error(
    "Day zero must use the current recovery score.",
  );
}

if (
  forecast.days[0].status !==
  recoveryIntelligence.overallStatus
) {
  throw new Error(
    "Day zero must preserve the current recovery status.",
  );
}

for (
  let index = 1;
  index < forecast.days.length;
  index += 1
) {
  const previous = forecast.days[index - 1];
  const current = forecast.days[index];

  if (
    current.expectedRecoveryScore <
    previous.expectedRecoveryScore
  ) {
    throw new Error(
      "Recovery should not decline when no future training load has been added.",
    );
  }

  if (
    current.expectedRecoveryScore -
      previous.expectedRecoveryScore >
    12
  ) {
    throw new Error(
      "Forecast recovery must not make unrealistic daily jumps.",
    );
  }

  if (
    current.confidence >=
    previous.confidence
  ) {
    throw new Error(
      "Forecast confidence should reduce on later days.",
    );
  }
}

const progressionForecast =
  analyseRecoveryForecast({
    recoveryIntelligence,
    recentTrainingLoad,
    blockWeek: {
      weekNumber: 3,
      phase: "progression",
      title: "Progress with control",
      objective: "Progress gradually.",
      trainingDaysTarget: 3,
      volumeMultiplier: 1,
      intensityBias: "progressive",
      conditioningSessionsTarget: 1,
      progressionAllowed: true,
      optional: false,
      reasons: [],
    },
  });

const deloadForecast =
  analyseRecoveryForecast({
    recoveryIntelligence,
    recentTrainingLoad,
    blockWeek: {
      weekNumber: 8,
      phase: "deload",
      title: "Recover",
      objective: "Reduce fatigue.",
      trainingDaysTarget: 2,
      volumeMultiplier: 0.6,
      intensityBias: "recovery",
      conditioningSessionsTarget: 1,
      progressionAllowed: false,
      optional: true,
      reasons: [],
    },
  });

if (
  deloadForecast.days[3]
    .expectedRecoveryScore <=
  progressionForecast.days[3]
    .expectedRecoveryScore
) {
  throw new Error(
    "A deload week should forecast faster recovery than a progression week.",
  );
}

console.log(
  "Fatigue and Recovery Forecasting test passed.",
);
