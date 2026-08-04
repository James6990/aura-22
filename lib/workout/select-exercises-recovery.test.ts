import { selectExercises } from "./select-exercises";

const result = selectExercises({
  movementPatterns: [
    "horizontal-push",
    "horizontal-pull",
    "squat",
    "hinge",
  ],
  equipment: [
    "full-gym",
    "bodyweight",
  ],
  experienceLevel: "beginner",
  primaryGoal: "recomposition",
  decisionPriority: "train",
  trainingEnvironment:
    "commercial-gym",
  recoveryReadyPatterns: [
    "horizontal-pull",
    "squat",
    "hinge",
  ],
  recoveryCautionPatterns: [],
  recoveryRecoveringPatterns: [],
  recoveryAvoidPatterns: [
    "horizontal-push",
  ],
  limit: 3,
});

if (result.exercises.length === 0) {
  throw new Error(
    "Recovery signals must not prevent workout generation.",
  );
}

if (
  result.exercises[0]?.movementPattern ===
  "horizontal-push"
) {
  throw new Error(
    "An avoid-today pattern should not lead when ready alternatives exist.",
  );
}

if (
  !result.exercises.some(
    (exercise) =>
      exercise.movementPattern ===
        "horizontal-pull" ||
      exercise.movementPattern === "squat" ||
      exercise.movementPattern === "hinge",
  )
) {
  throw new Error(
    "Ready patterns should influence selection.",
  );
}

console.log(
  "Recovery Selection Integration test passed.",
);
