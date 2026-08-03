import type {
  ExerciseAccessibility,
  ExerciseDifficulty,
  ExerciseEquipment,
  MovementPattern,
} from "@/lib/workout/exercise-library";
import type { MovementConstraint } from "@/lib/workout/apply-movement-constraints";
import { selectExercises } from "@/lib/workout/select-exercises";
import type { WorkoutRecommendation } from "@/lib/workout/generate-workout-recommendation";

export type WorkoutSessionExercise = {
  id: string;
  name: string;
  movementPattern: MovementPattern;
  sets: number;
  reps: string;
  restSeconds: number;
  fatigueScore: number;
  substitutions: string[];
};

export type WorkoutSession = {
  title: string;
  intensity: WorkoutRecommendation["intensity"];
  estimatedDurationMinutes: number;
  exercises: WorkoutSessionExercise[];
  requiresProfessionalReview: boolean;
  safetyMessage: string | null;
};

export type GenerateWorkoutSessionInput = {
  recommendation: WorkoutRecommendation;
  primaryGoal: string;
  experienceLevel: ExerciseDifficulty;
  equipment: ExerciseEquipment[];
  accessibilityNeeds?: ExerciseAccessibility[];
  movementConstraints?: MovementConstraint[];
};

function getMovementPatterns(
  primaryGoal: string,
  intensity: WorkoutRecommendation["intensity"],
): MovementPattern[] {
  if (intensity === "Recovery") {
    return ["mobility", "cardio", "core"];
  }

  switch (primaryGoal) {
    case "muscle":
      return [
        "horizontal-push",
        "horizontal-pull",
        "vertical-push",
        "vertical-pull",
        "squat",
        "hinge",
      ];

    case "fat-loss":
      return [
        "squat",
        "hinge",
        "horizontal-push",
        "horizontal-pull",
        "cardio",
        "core",
      ];

    case "performance":
      return [
        "squat",
        "hinge",
        "single-leg",
        "horizontal-push",
        "horizontal-pull",
        "core",
      ];

    case "recomposition":
      return [
        "horizontal-push",
        "horizontal-pull",
        "squat",
        "hinge",
        "core",
      ];

    default:
      return [
        "horizontal-push",
        "horizontal-pull",
        "squat",
        "hinge",
        "core",
        "cardio",
      ];
  }
}

function getMaximumFatigue(
  intensity: WorkoutRecommendation["intensity"],
) {
  if (intensity === "Recovery") return 3;
  if (intensity === "Light") return 4;
  if (intensity === "High") return 8;
  return 6;
}

function getExerciseLimit(
  intensity: WorkoutRecommendation["intensity"],
) {
  if (intensity === "Recovery") return 4;
  if (intensity === "Light") return 5;
  if (intensity === "High") return 7;
  return 6;
}

function getPrescription(
  intensity: WorkoutRecommendation["intensity"],
  difficulty: ExerciseDifficulty,
) {
  if (intensity === "Recovery") {
    return {
      sets: 2,
      reps: "8–12 comfortable reps",
      restSeconds: 60,
    };
  }

  if (intensity === "Light") {
    return {
      sets: 2,
      reps: "10–12 reps",
      restSeconds: 75,
    };
  }

  if (intensity === "High") {
    return {
      sets: difficulty === "beginner" ? 3 : 4,
      reps: "6–10 reps",
      restSeconds: 120,
    };
  }

  return {
    sets: difficulty === "beginner" ? 3 : 3,
    reps: "8–12 reps",
    restSeconds: 90,
  };
}

export function generateWorkoutSession({
  recommendation,
  primaryGoal,
  experienceLevel,
  equipment,
  accessibilityNeeds = [],
  movementConstraints = [],
}: GenerateWorkoutSessionInput): WorkoutSession {
  const movementPatterns = getMovementPatterns(
    primaryGoal,
    recommendation.intensity,
  );

  const selection = selectExercises({
    movementPatterns,
    equipment,
    experienceLevel,
    accessibilityNeeds,
    movementConstraints,
    maximumFatigueScore: getMaximumFatigue(
      recommendation.intensity,
    ),
    limit: getExerciseLimit(recommendation.intensity),
  });

  const prescription = getPrescription(
    recommendation.intensity,
    experienceLevel,
  );

  const exercises = selection.exercises.map((exercise) => ({
    id: exercise.id,
    name: exercise.name,
    movementPattern: exercise.movementPattern,
    sets: Math.max(
      1,
      Math.round(
        prescription.sets *
          recommendation.volumeMultiplier,
      ),
    ),
    reps: prescription.reps,
    restSeconds: prescription.restSeconds,
    fatigueScore: exercise.fatigueScore,
    substitutions: exercise.substitutions,
  }));

  let safetyMessage = selection.message;

  if (exercises.length === 0) {
    safetyMessage =
      "Apex could not construct a suitable session with the current equipment, accessibility needs and movement constraints.";
  }

  return {
    title: recommendation.focus,
    intensity: recommendation.intensity,
    estimatedDurationMinutes:
      recommendation.durationMinutes,
    exercises,
    requiresProfessionalReview:
      selection.requiresProfessionalReview,
    safetyMessage,
  };
}
