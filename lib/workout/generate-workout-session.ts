import type {
  ExerciseAccessibility,
  ExerciseDifficulty,
  ExerciseEquipment,
  MovementPattern,
} from "@/lib/workout/exercise-library";
import type { MovementConstraint } from "@/lib/workout/apply-movement-constraints";
import { selectExercises } from "@/lib/workout/select-exercises";
import type { WorkoutRecommendation } from "@/lib/workout/generate-workout-recommendation";
import type { ExerciseProgressionHistory } from "@/lib/workout/get-exercise-progression-history";

export type WorkoutSessionExercise = {
  id: string;
  name: string;
  movementPattern: MovementPattern;
  sets: number;
  reps: string;
  restSeconds: number;
  fatigueScore: number;
  substitutions: string[];

  suggestedLoadKg: number | null;
  previousLoadKg: number | null;
  progressionDecision:
    | "increase"
    | "maintain"
    | "reduce"
    | "review"
    | null;
  progressionExplanation: string | null;
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
  progressionHistory?: Record<
    string,
    ExerciseProgressionHistory
  >;
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
    sets: 3,
    reps: "8–12 reps",
    restSeconds: 90,
  };
}

function getProgressionExplanation(
  history: ExerciseProgressionHistory | undefined,
) {
  if (!history?.progressionDecision) {
    return null;
  }

  if (history.progressionDecision === "increase") {
    return history.recommendedNextLoadKg !== null
      ? `Your previous result supports trying ${history.recommendedNextLoadKg} kg. You can keep the previous load if preferred.`
      : "Your previous result showed progression potential.";
  }

  if (history.progressionDecision === "maintain") {
    return history.previousLoadKg !== null
      ? `Apex recommends maintaining ${history.previousLoadKg} kg while building confident, repeatable performance.`
      : "Apex recommends maintaining the previous difficulty.";
  }

  if (history.progressionDecision === "reduce") {
    return history.recommendedNextLoadKg !== null
      ? `Apex recommends reducing the load to approximately ${history.recommendedNextLoadKg} kg.`
      : "Apex recommends reducing this exercise’s difficulty.";
  }

  return "Previous discomfort, technique feedback or performance data means this exercise should be reviewed before progression.";
}

function getSuggestedLoad(
  history: ExerciseProgressionHistory | undefined,
) {
  if (!history) {
    return null;
  }

  if (history.progressionDecision === "review") {
    return history.previousLoadKg;
  }

  return (
    history.recommendedNextLoadKg ??
    history.previousLoadKg
  );
}

export function generateWorkoutSession({
  recommendation,
  primaryGoal,
  experienceLevel,
  equipment,
  accessibilityNeeds = [],
  movementConstraints = [],
  progressionHistory = {},
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

  const exercises = selection.exercises.map((exercise) => {
    const history =
      progressionHistory[exercise.id];

    return {
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

      suggestedLoadKg: getSuggestedLoad(history),
      previousLoadKg:
        history?.previousLoadKg ?? null,
      progressionDecision:
        history?.progressionDecision ?? null,
      progressionExplanation:
        getProgressionExplanation(history),
    };
  });

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
