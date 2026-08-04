import { analyseExerciseRotation } from "./analyse-exercise-rotation";

const now = new Date(
  "2026-08-04T10:00:00.000Z",
);

const analysis =
  analyseExerciseRotation(
    [
      {
        exerciseId:
          "machine-chest-press",
        completedAt: new Date(
          "2026-08-04T02:00:00.000Z",
        ),
        completedSets: 4,
        rpe: 9,
        discomfortLevel: 1,
      },
      {
        exerciseId:
          "machine-chest-press",
        completedAt: new Date(
          "2026-08-03T02:00:00.000Z",
        ),
        completedSets: 4,
        rpe: 8,
        discomfortLevel: 0,
      },
      {
        exerciseId:
          "dumbbell-bench-press",
        completedAt: new Date(
          "2026-08-03T22:00:00.000Z",
        ),
        completedSets: 3,
        rpe: 8,
        discomfortLevel: 0,
      },
    ],
    now,
  );

const chest =
  analysis.muscleSignals.chest;

if (!chest) {
  throw new Error(
    "Chest fatigue signal was not created.",
  );
}

if (
  chest.fatigueLevel !==
    "overworked" &&
  chest.fatigueLevel !== "fatigued"
) {
  throw new Error(
    "Repeated high-effort chest work should create meaningful fatigue.",
  );
}

if (
  !analysis.rotateAwayExerciseIds.includes(
    "machine-chest-press",
  )
) {
  throw new Error(
    "A repeatedly performed exercise should be marked for rotation.",
  );
}

if (
  analysis.preferredMuscles.includes(
    "chest",
  )
) {
  throw new Error(
    "A fatigued muscle must not appear as a fresh preference.",
  );
}

const emptyAnalysis =
  analyseExerciseRotation([], now);

if (
  emptyAnalysis.rotateAwayExerciseIds
    .length !== 0
) {
  throw new Error(
    "Empty history must not rotate exercises away.",
  );
}

console.log(
  "Exercise Rotation Intelligence test passed.",
);
