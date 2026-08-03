import {
  exerciseLibrary,
  type ExerciseAccessibility,
  type ExerciseDefinition,
  type ExerciseDifficulty,
  type ExerciseEquipment,
  type MovementPattern,
} from "@/lib/workout/exercise-library";
import {
  applyMovementConstraints,
  type MovementConstraint,
} from "@/lib/workout/apply-movement-constraints";
import type { CoachPriority } from "@/lib/companion/generate-coach-decision";

export type SelectExercisesInput = {
  movementPatterns: MovementPattern[];
  equipment: ExerciseEquipment[];
  experienceLevel: ExerciseDifficulty;
  accessibilityNeeds?: ExerciseAccessibility[];
  movementConstraints?: MovementConstraint[];
  maximumFatigueScore?: number;
  limit?: number;

  primaryGoal?: string;
  decisionPriority?: CoachPriority | null;
};

export type SelectExercisesResult = {
  exercises: ExerciseDefinition[];
  blockedExerciseIds: string[];
  requiresProfessionalReview: boolean;
  message: string | null;
};

function difficultyRank(
  value: ExerciseDifficulty,
) {
  if (value === "advanced") return 3;
  if (value === "intermediate") return 2;
  return 1;
}

function matchesEquipment(
  exercise: ExerciseDefinition,
  equipment: ExerciseEquipment[],
) {
  return exercise.equipment.some((item) =>
    equipment.includes(item),
  );
}

function matchesAccessibility(
  exercise: ExerciseDefinition,
  needs: ExerciseAccessibility[],
) {
  if (needs.length === 0) {
    return true;
  }

  return needs.every((need) =>
    exercise.accessibility.includes(need),
  );
}

function getGoalScore(
  exercise: ExerciseDefinition,
  primaryGoal: string,
) {
  let score = 0;

  switch (primaryGoal) {
    case "muscle":
      if (
        exercise.movementPattern ===
          "horizontal-push" ||
        exercise.movementPattern ===
          "horizontal-pull" ||
        exercise.movementPattern ===
          "vertical-push" ||
        exercise.movementPattern ===
          "vertical-pull" ||
        exercise.movementPattern === "squat" ||
        exercise.movementPattern === "hinge"
      ) {
        score += 6;
      }

      if (
        exercise.fatigueScore >= 4 &&
        exercise.fatigueScore <= 7
      ) {
        score += 2;
      }

      break;

    case "fat-loss":
      if (
        exercise.movementPattern === "cardio" ||
        exercise.movementPattern === "squat" ||
        exercise.movementPattern === "hinge" ||
        exercise.movementPattern === "core"
      ) {
        score += 5;
      }

      if (exercise.fatigueScore <= 5) {
        score += 2;
      }

      break;

    case "recomposition":
    case "lean-athletic":
      if (
        exercise.movementPattern ===
          "horizontal-push" ||
        exercise.movementPattern ===
          "horizontal-pull" ||
        exercise.movementPattern === "squat" ||
        exercise.movementPattern === "hinge" ||
        exercise.movementPattern === "core" ||
        exercise.movementPattern === "cardio"
      ) {
        score += 5;
      }

      if (
        exercise.fatigueScore >= 3 &&
        exercise.fatigueScore <= 6
      ) {
        score += 2;
      }

      break;

    case "performance":
      if (
        exercise.movementPattern === "squat" ||
        exercise.movementPattern === "hinge" ||
        exercise.movementPattern ===
          "single-leg" ||
        exercise.movementPattern === "core"
      ) {
        score += 6;
      }

      break;

    case "health":
    default:
      if (
        exercise.accessibility.includes(
          "low-impact",
        )
      ) {
        score += 3;
      }

      if (exercise.fatigueScore <= 5) {
        score += 2;
      }

      break;
  }

  return score;
}

function getPriorityScore(
  exercise: ExerciseDefinition,
  priority: CoachPriority | null,
) {
  if (!priority) {
    return 0;
  }

  switch (priority) {
    case "recover":
      return (
        (exercise.movementPattern === "mobility"
          ? 8
          : 0) +
        (exercise.movementPattern === "cardio"
          ? 5
          : 0) +
        (exercise.movementPattern === "core"
          ? 3
          : 0) +
        (exercise.fatigueScore <= 3 ? 5 : 0)
      );

    case "technique":
      return (
        (exercise.difficulty === "beginner"
          ? 4
          : 0) +
        (exercise.fatigueScore <= 4 ? 4 : 0) +
        (exercise.accessibility.includes(
          "limited-balance",
        )
          ? 2
          : 0)
      );

    case "build-consistency":
      return (
        (exercise.difficulty === "beginner"
          ? 5
          : 0) +
        (exercise.fatigueScore <= 4 ? 4 : 0) +
        (exercise.estimatedSecondsPerSet <= 60
          ? 2
          : 0)
      );

    case "hydrate":
      return (
        (exercise.fatigueScore <= 3 ? 5 : 0) +
        (exercise.movementPattern === "mobility"
          ? 4
          : 0) +
        (exercise.movementPattern === "core"
          ? 2
          : 0)
      );

    case "collect-data":
      return (
        (exercise.difficulty === "beginner"
          ? 4
          : 0) +
        (exercise.fatigueScore <= 5 ? 3 : 0)
      );

    case "celebrate":
      return (
        (exercise.fatigueScore <= 3 ? 5 : 0) +
        (exercise.movementPattern === "mobility"
          ? 4
          : 0) +
        (exercise.movementPattern === "cardio"
          ? 3
          : 0)
      );

    case "train":
    default:
      return 0;
  }
}

function scoreExercise({
  exercise,
  primaryGoal,
  decisionPriority,
  patternOrder,
}: {
  exercise: ExerciseDefinition;
  primaryGoal: string;
  decisionPriority: CoachPriority | null;
  patternOrder: Map<MovementPattern, number>;
}) {
  const goalScore = getGoalScore(
    exercise,
    primaryGoal,
  );

  const priorityScore = getPriorityScore(
    exercise,
    decisionPriority,
  );

  const requestedPatternScore =
    10 -
    Math.min(
      patternOrder.get(
        exercise.movementPattern,
      ) ?? 9,
      9,
    );

  const lowerFatigueTieBreaker =
    Math.max(0, 10 - exercise.fatigueScore);

  return (
    goalScore * 10 +
    priorityScore * 10 +
    requestedPatternScore * 2 +
    lowerFatigueTieBreaker
  );
}

function chooseWithMovementVariety({
  exercises,
  limit,
}: {
  exercises: ExerciseDefinition[];
  limit: number;
}) {
  const chosen: ExerciseDefinition[] = [];
  const usedPatterns =
    new Set<MovementPattern>();

  for (const exercise of exercises) {
    if (chosen.length >= limit) {
      break;
    }

    if (
      !usedPatterns.has(
        exercise.movementPattern,
      )
    ) {
      chosen.push(exercise);
      usedPatterns.add(
        exercise.movementPattern,
      );
    }
  }

  if (chosen.length < limit) {
    for (const exercise of exercises) {
      if (chosen.length >= limit) {
        break;
      }

      if (
        !chosen.some(
          (item) => item.id === exercise.id,
        )
      ) {
        chosen.push(exercise);
      }
    }
  }

  return chosen;
}

export function selectExercises({
  movementPatterns,
  equipment,
  experienceLevel,
  accessibilityNeeds = [],
  movementConstraints = [],
  maximumFatigueScore = 10,
  limit = 6,
  primaryGoal = "health",
  decisionPriority = null,
}: SelectExercisesInput): SelectExercisesResult {
  const userDifficulty = difficultyRank(
    experienceLevel,
  );

  const patternOrder = new Map(
    movementPatterns.map(
      (pattern, index) =>
        [pattern, index] as const,
    ),
  );

  const safeCandidates = exerciseLibrary
    .filter((exercise) =>
      movementPatterns.includes(
        exercise.movementPattern,
      ),
    )
    .filter((exercise) =>
      matchesEquipment(exercise, equipment),
    )
    .filter((exercise) =>
      matchesAccessibility(
        exercise,
        accessibilityNeeds,
      ),
    )
    .filter(
      (exercise) =>
        difficultyRank(exercise.difficulty) <=
        userDifficulty,
    )
    .filter(
      (exercise) =>
        exercise.fatigueScore <=
        maximumFatigueScore,
    );

  /*
   * Movement constraints remain a safety gate.
   * Only exercises that pass this step are ranked.
   */
  const constrained = applyMovementConstraints(
    safeCandidates,
    movementConstraints,
  );

  const ranked = [...constrained.exercises].sort(
    (a, b) => {
      const scoreDifference =
        scoreExercise({
          exercise: b,
          primaryGoal,
          decisionPriority,
          patternOrder,
        }) -
        scoreExercise({
          exercise: a,
          primaryGoal,
          decisionPriority,
          patternOrder,
        });

      if (scoreDifference !== 0) {
        return scoreDifference;
      }

      const fatigueDifference =
        a.fatigueScore - b.fatigueScore;

      if (fatigueDifference !== 0) {
        return fatigueDifference;
      }

      return a.name.localeCompare(b.name);
    },
  );

  return {
    ...constrained,
    exercises: chooseWithMovementVariety({
      exercises: ranked,
      limit,
    }),
  };
}
