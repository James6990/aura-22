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

export type SelectExercisesInput = {
  movementPatterns: MovementPattern[];
  equipment: ExerciseEquipment[];
  experienceLevel: ExerciseDifficulty;
  accessibilityNeeds?: ExerciseAccessibility[];
  movementConstraints?: MovementConstraint[];
  maximumFatigueScore?: number;
  limit?: number;
};

export type SelectExercisesResult = {
  exercises: ExerciseDefinition[];
  blockedExerciseIds: string[];
  requiresProfessionalReview: boolean;
  message: string | null;
};

function difficultyRank(value: ExerciseDifficulty) {
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
  if (needs.length === 0) return true;

  return needs.every((need) =>
    exercise.accessibility.includes(need),
  );
}

export function selectExercises({
  movementPatterns,
  equipment,
  experienceLevel,
  accessibilityNeeds = [],
  movementConstraints = [],
  maximumFatigueScore = 10,
  limit = 6,
}: SelectExercisesInput): SelectExercisesResult {
  const userDifficulty = difficultyRank(experienceLevel);

  const candidates = exerciseLibrary
    .filter((exercise) =>
      movementPatterns.includes(exercise.movementPattern),
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
        exercise.fatigueScore <= maximumFatigueScore,
    )
    .sort((a, b) => {
      const fatigueDifference =
        a.fatigueScore - b.fatigueScore;

      if (fatigueDifference !== 0) {
        return fatigueDifference;
      }

      return a.name.localeCompare(b.name);
    });

  const constrained = applyMovementConstraints(
    candidates,
    movementConstraints,
  );

  return {
    ...constrained,
    exercises: constrained.exercises.slice(0, limit),
  };
}
