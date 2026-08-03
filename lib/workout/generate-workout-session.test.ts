import { generateWorkoutSession } from "@/lib/workout/generate-workout-session";

const session = generateWorkoutSession({
  recommendation: {
    intensity: "Moderate",
    durationMinutes: 45,
    focus: "Balanced strength",
    volumeMultiplier: 1,
    environment: "Full gym",
    explanation: "Test recommendation.",
  },
  primaryGoal: "recomposition",
  experienceLevel: "beginner",
  equipment: ["full-gym", "bodyweight"],
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
});

if (session.exercises.length === 0) {
  throw new Error(
    "Expected the generator to create a suitable session.",
  );
}

if (
  session.exercises.some(
    (exercise) =>
      exercise.movementPattern === "vertical-push",
  )
) {
  throw new Error(
    "Session included a blocked movement pattern.",
  );
}

if (!session.requiresProfessionalReview) {
  throw new Error(
    "Expected an unassessed constraint to require review.",
  );
}
