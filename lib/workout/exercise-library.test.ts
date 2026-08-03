import { selectExercises } from "@/lib/workout/select-exercises";

const result = selectExercises({
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
  movementConstraints: [
    {
      bodyArea: "shoulder",
      avoidPatterns: ["vertical-push"],
      avoidExercises: ["machine-shoulder-press"],
      allowedExercises: [],
      clinicianGuidance: "",
      status: "unassessed",
    },
  ],
  maximumFatigueScore: 5,
  limit: 10,
});

if (result.exercises.length === 0) {
  throw new Error(
    "Expected at least one suitable seated exercise.",
  );
}

if (
  result.exercises.some(
    (exercise) =>
      !exercise.accessibility.includes("seated"),
  )
) {
  throw new Error(
    "Exercise selector returned a non-seated exercise.",
  );
}

if (!result.requiresProfessionalReview) {
  throw new Error(
    "Expected unassessed constraint to require professional review.",
  );
}
