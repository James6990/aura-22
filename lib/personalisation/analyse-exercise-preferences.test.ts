import {
  analyseExercisePreferences,
} from "./analyse-exercise-preferences";

const profile =
  analyseExercisePreferences({
    recentPerformances: [
      {
        exerciseId: "dumbbell-bench",
        completedSets: 3,
        rpe: 7,
        discomfortLevel: 1,
        completedAt: new Date(
          "2026-08-01T10:00:00Z",
        ),
      },
      {
        exerciseId: "dumbbell-bench",
        completedSets: 3,
        rpe: 8,
        discomfortLevel: 2,
        completedAt: new Date(
          "2026-08-03T10:00:00Z",
        ),
      },
      {
        exerciseId: "barbell-squat",
        completedSets: 3,
        rpe: 9,
        discomfortLevel: 5,
        completedAt: new Date(
          "2026-08-02T10:00:00Z",
        ),
      },
    ],
    progressionHistory: {
      "dumbbell-bench": {
        exerciseId: "dumbbell-bench",
        exerciseName:
          "Dumbbell Bench Press",
        previousLoadKg: 20,
        recommendedNextLoadKg: 22,
        progressionDecision:
          "increase",
        previousRpe: 8,
        previousDiscomfortLevel: 2,
        previousTechniqueConfidence: 8,
        updatedAt: new Date(
          "2026-08-03T10:00:00Z",
        ),
      },
      "barbell-squat": {
        exerciseId: "barbell-squat",
        exerciseName: "Barbell Squat",
        previousLoadKg: 60,
        recommendedNextLoadKg: 55,
        progressionDecision:
          "review",
        previousRpe: 9,
        previousDiscomfortLevel: 5,
        previousTechniqueConfidence: 5,
        updatedAt: new Date(
          "2026-08-02T10:00:00Z",
        ),
      },
    },
  });

if (
  !profile.frequentlyCompletedExerciseIds.includes(
    "dumbbell-bench",
  )
) {
  throw new Error(
    "Expected repeated exercise completion to be learned.",
  );
}

if (
  !profile.progressionReadyExerciseIds.includes(
    "dumbbell-bench",
  )
) {
  throw new Error(
    "Expected progression-ready exercise to be identified.",
  );
}

if (
  !profile.reviewExerciseIds.includes(
    "barbell-squat",
  )
) {
  throw new Error(
    "Expected review exercise to be identified.",
  );
}

if (
  !profile.discomfortExerciseIds.includes(
    "barbell-squat",
  )
) {
  throw new Error(
    "Expected repeated discomfort signal to be identified.",
  );
}

if (
  profile.confidence <= 0 ||
  profile.confidence > 100
) {
  throw new Error(
    "Personalisation confidence must remain between 1 and 100.",
  );
}

console.log(
  "Exercise Personalisation Profile test passed.",
);
