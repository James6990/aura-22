import { selectExercises } from "@/lib/workout/select-exercises";

const seatedExercises = selectExercises({
  movementPatterns: [
    "horizontal-push",
    "horizontal-pull",
    "core",
  ],
  equipment: [
    "full-gym",
    "home-gym",
    "bodyweight",
  ],
  experienceLevel: "beginner",
  accessibilityNeeds: ["seated"],
  maximumFatigueScore: 5,
  limit: 10,
});

if (seatedExercises.length === 0) {
  throw new Error(
    "Expected at least one seated exercise.",
  );
}

if (
  seatedExercises.some(
    (exercise) =>
      !exercise.accessibility.includes("seated"),
  )
) {
  throw new Error(
    "Exercise selector returned a non-seated exercise.",
  );
}
