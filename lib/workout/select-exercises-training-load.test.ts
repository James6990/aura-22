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
  preferredPatterns: [
    "squat",
    "hinge",
  ],
  deprioritisedPatterns: [
    "horizontal-push",
  ],
  limit: 3,
});

if (result.exercises.length === 0) {
  throw new Error(
    "Training-load preferences must not prevent exercise selection.",
  );
}

const firstPattern =
  result.exercises[0]?.movementPattern;

if (firstPattern === "horizontal-push") {
  throw new Error(
    "A recently overloaded push pattern should not lead the ranked result when suitable alternatives exist.",
  );
}

console.log(
  "Exercise selection training-load test passed.",
);
