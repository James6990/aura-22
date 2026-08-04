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
  preferredMuscles: [
    "upper-back",
    "lats",
    "quadriceps",
    "hamstrings",
  ],
  fatiguedMuscles: ["chest"],
  overworkedMuscles: [
    "front-deltoids",
  ],
  rotateAwayExerciseIds: [
    "machine-chest-press",
  ],
  limit: 4,
});

if (result.exercises.length === 0) {
  throw new Error(
    "Rotation intelligence must not prevent workout generation.",
  );
}

if (
  result.exercises[0]?.id ===
  "machine-chest-press"
) {
  throw new Error(
    "A repeated exercise targeting fatigued muscles should not lead when alternatives exist.",
  );
}

const containsFreshTarget =
  result.exercises.some((exercise) =>
    exercise.primaryMuscles.some(
      (muscle) =>
        [
          "upper-back",
          "lats",
          "quadriceps",
          "hamstrings",
        ].includes(muscle),
    ),
  );

if (!containsFreshTarget) {
  throw new Error(
    "Fresh preferred muscles should influence exercise selection.",
  );
}

console.log(
  "Exercise Rotation Integration test passed.",
);
