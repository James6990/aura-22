import {
  exerciseLibrary,
  type ExerciseAccessibility,
  type ExerciseDefinition,
  type ExerciseDifficulty,
  type ExerciseEquipment,
  type MovementPattern,
} from "@/lib/workout/exercise-library";

export type SelectExercisesInput = {
  movementPatterns: MovementPattern[];
  equipment: ExerciseEquipment[];
  experienceLevel: ExerciseDifficulty;
  accessibilityNeeds?: ExerciseAccessibility[];
  maximumFatigueScore?: number;
  limit?: number;
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
  maximumFatigueScore = 10,
  limit = 6,
}: SelectExercisesInput) {
  const userDifficulty = difficultyRank(experienceLevel);

  return exerciseLibrary
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
    })
    .slice(0, limit);
}
