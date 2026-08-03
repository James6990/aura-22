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
import type { CoachPriority } from "@/lib/companion/generate-coach-decision";
import type {
  EquipmentInventoryItem,
  TrainingEnvironment,
} from "@/lib/workout/equipment-capabilities";
import { getTrainingGoalProfile } from "@/lib/workout/training-goal-profile";

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
  trainingEnvironment?: TrainingEnvironment;
  equipmentInventory?: EquipmentInventoryItem[];
  accessibilityNeeds?: ExerciseAccessibility[];
  movementConstraints?: MovementConstraint[];
  progressionHistory?: Record<
    string,
    ExerciseProgressionHistory
  >;
};

type SessionPrescription = {
  sets: number;
  reps: string;
  restSeconds: number;
};

function getMovementPatterns({
  primaryGoal,
  intensity,
  priority,
}: {
  primaryGoal: string;
  intensity: WorkoutRecommendation["intensity"];
  priority: CoachPriority | null;
}): MovementPattern[] {
  if (priority === "recover") {
    return ["mobility", "cardio", "core"];
  }

  if (priority === "technique") {
    return [
      "horizontal-push",
      "horizontal-pull",
      "squat",
      "hinge",
      "core",
      "mobility",
    ];
  }

  if (priority === "build-consistency") {
    return [
      "squat",
      "horizontal-push",
      "horizontal-pull",
      "core",
      "cardio",
    ];
  }

  if (priority === "hydrate") {
    return [
      "mobility",
      "core",
      "cardio",
      "horizontal-pull",
    ];
  }

  if (priority === "collect-data") {
    return [
      "squat",
      "horizontal-push",
      "horizontal-pull",
      "core",
    ];
  }

  if (priority === "celebrate") {
    return ["mobility", "cardio", "core"];
  }

  if (intensity === "Recovery") {
    return ["mobility", "cardio", "core"];
  }

  return getTrainingGoalProfile(
    primaryGoal,
  ).movementPatterns;
}

function getMaximumFatigue({
  intensity,
  priority,
}: {
  intensity: WorkoutRecommendation["intensity"];
  priority: CoachPriority | null;
}) {
  if (
    priority === "recover" ||
    priority === "hydrate" ||
    priority === "celebrate"
  ) {
    return 3;
  }

  if (
    priority === "technique" ||
    priority === "build-consistency" ||
    priority === "collect-data"
  ) {
    return 4;
  }

  if (intensity === "Recovery") return 3;
  if (intensity === "Light") return 4;
  if (intensity === "High") return 8;

  return 6;
}

function getExerciseLimit({
  intensity,
  priority,
}: {
  intensity: WorkoutRecommendation["intensity"];
  priority: CoachPriority | null;
}) {
  if (priority === "recover") return 4;
  if (priority === "technique") return 5;
  if (priority === "build-consistency") return 4;
  if (priority === "hydrate") return 3;
  if (priority === "collect-data") return 4;
  if (priority === "celebrate") return 3;

  if (intensity === "Recovery") return 4;
  if (intensity === "Light") return 5;
  if (intensity === "High") return 7;

  return 6;
}

function getPrescription({
  intensity,
  difficulty,
  priority,
  primaryGoal,
}: {
  intensity: WorkoutRecommendation["intensity"];
  difficulty: ExerciseDifficulty;
  priority: CoachPriority | null;
  primaryGoal: string;
}): SessionPrescription {
  if (priority === "recover") {
    return {
      sets: 2,
      reps: "8–12 comfortable reps",
      restSeconds: 60,
    };
  }

  if (priority === "technique") {
    return {
      sets: 2,
      reps: "6–10 slow, controlled reps",
      restSeconds: 105,
    };
  }

  if (priority === "build-consistency") {
    return {
      sets: 2,
      reps: "8–12 confident reps",
      restSeconds: 75,
    };
  }

  if (priority === "hydrate") {
    return {
      sets: 2,
      reps: "8–10 comfortable reps",
      restSeconds: 90,
    };
  }

  if (priority === "collect-data") {
    return {
      sets: 2,
      reps: "8–10 controlled baseline reps",
      restSeconds: 90,
    };
  }

  if (priority === "celebrate") {
    return {
      sets: 2,
      reps: "8–12 relaxed reps",
      restSeconds: 75,
    };
  }

  if (intensity === "Recovery") {
    return {
      sets: 2,
      reps: "8–12 comfortable reps",
      restSeconds: 60,
    };
  }

  const goalProfile =
    getTrainingGoalProfile(primaryGoal);

  if (intensity === "Light") {
    return {
      sets: Math.max(
        1,
        goalProfile.standardPrescription.sets - 1,
      ),
      reps:
        goalProfile.standardPrescription.reps,
      restSeconds: Math.max(
        60,
        goalProfile.standardPrescription
          .restSeconds - 15,
      ),
    };
  }

  if (intensity === "High") {
    const highPrescription =
      goalProfile.highReadinessPrescription;

    return {
      sets:
        difficulty === "beginner"
          ? Math.min(
              3,
              highPrescription.sets,
            )
          : highPrescription.sets,
      reps: highPrescription.reps,
      restSeconds:
        highPrescription.restSeconds,
    };
  }

  return {
    ...goalProfile.standardPrescription,
  };
}

function getProgressionExplanation(
  history: ExerciseProgressionHistory | undefined,
  priority: CoachPriority | null,
) {
  if (!history?.progressionDecision) {
    return null;
  }

  if (
    priority === "recover" ||
    priority === "technique" ||
    priority === "hydrate" ||
    priority === "celebrate"
  ) {
    return (
      "Apex has preserved your previous progression data, " +
      "but today’s priority does not require increasing the challenge."
    );
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
  priority: CoachPriority | null,
) {
  if (!history) {
    return null;
  }

  if (history.progressionDecision === "review") {
    return history.previousLoadKg;
  }

  if (
    priority === "recover" ||
    priority === "technique" ||
    priority === "hydrate" ||
    priority === "celebrate"
  ) {
    return history.previousLoadKg;
  }

  return (
    history.recommendedNextLoadKg ??
    history.previousLoadKg
  );
}

function getPrioritySafetyMessage(
  priority: CoachPriority | null,
) {
  switch (priority) {
    case "recover":
      return "Keep every movement comfortable. Stop or reduce the session if fatigue, pain or discomfort begins to increase.";

    case "technique":
      return "Use conservative loads and controlled movement. Technique and comfort matter more than completing every prescribed set.";

    case "build-consistency":
      return "Completing a smaller session is the goal today. You do not need to add extra exercises or intensity.";

    case "hydrate":
      return "Address hydration before beginning. Delay or reduce the session if you feel unwell, dizzy or unusually fatigued.";

    case "collect-data":
      return "Treat this as a baseline session. Record honest effort, comfort and technique rather than testing your limits.";

    case "celebrate":
      return "Recent progress does not need to be followed immediately by another demanding session. Recover and enjoy the achievement.";

    default:
      return null;
  }
}

export function generateWorkoutSession({
  recommendation,
  primaryGoal,
  experienceLevel,
  equipment,
  trainingEnvironment = "commercial-gym",
  equipmentInventory = [],
  accessibilityNeeds = [],
  movementConstraints = [],
  progressionHistory = {},
}: GenerateWorkoutSessionInput): WorkoutSession {
  const priority =
    recommendation.decisionPriority;

  const movementPatterns = getMovementPatterns({
    primaryGoal,
    intensity: recommendation.intensity,
    priority,
  });

  const selection = selectExercises({
    movementPatterns,
    equipment,
    experienceLevel,
    accessibilityNeeds,
    movementConstraints,
    maximumFatigueScore: getMaximumFatigue({
      intensity: recommendation.intensity,
      priority,
    }),
    limit: getExerciseLimit({
      intensity: recommendation.intensity,
      priority,
    }),
    primaryGoal,
    decisionPriority: priority,
    trainingEnvironment,
    equipmentInventory,
    progressionHistory,
  });

  const prescription = getPrescription({
    intensity: recommendation.intensity,
    difficulty: experienceLevel,
    priority,
    primaryGoal,
  });

  const exercises = selection.exercises.map(
    (exercise) => {
      const history =
        progressionHistory[exercise.id];

      return {
        id: exercise.id,
        name: exercise.name,
        movementPattern:
          exercise.movementPattern,
        sets: Math.max(
          1,
          Math.round(
            prescription.sets *
              recommendation.volumeMultiplier *
              getTrainingGoalProfile(
                primaryGoal,
              ).volumeBias,
          ),
        ),
        reps: prescription.reps,
        restSeconds:
          prescription.restSeconds,
        fatigueScore:
          exercise.fatigueScore,
        substitutions:
          exercise.substitutions,

        suggestedLoadKg: getSuggestedLoad(
          history,
          priority,
        ),
        previousLoadKg:
          history?.previousLoadKg ?? null,
        progressionDecision:
          history?.progressionDecision ?? null,
        progressionExplanation:
          getProgressionExplanation(
            history,
            priority,
          ),
      };
    },
  );

  const prioritySafetyMessage =
    getPrioritySafetyMessage(priority);

  let safetyMessage =
    selection.message ??
    prioritySafetyMessage;

  if (
    selection.message &&
    prioritySafetyMessage
  ) {
    safetyMessage =
      `${selection.message} ${prioritySafetyMessage}`;
  }

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
