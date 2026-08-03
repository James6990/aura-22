import type {
  ExerciseDefinition,
  MovementPattern,
} from "@/lib/workout/exercise-library";

export type ConstraintStatus =
  | "unassessed"
  | "clinician-guided"
  | "recovering"
  | "resolved";

export type MovementConstraint = {
  bodyArea: string;
  avoidPatterns: MovementPattern[];
  avoidExercises: string[];
  allowedExercises: string[];
  clinicianGuidance: string;
  status: ConstraintStatus;
};

export type ConstraintFilterResult = {
  exercises: ExerciseDefinition[];
  blockedExerciseIds: string[];
  requiresProfessionalReview: boolean;
  message: string | null;
};

export function applyMovementConstraints(
  exercises: ExerciseDefinition[],
  constraints: MovementConstraint[],
): ConstraintFilterResult {
  const activeConstraints = constraints.filter(
    (constraint) => constraint.status !== "resolved",
  );

  if (activeConstraints.length === 0) {
    return {
      exercises,
      blockedExerciseIds: [],
      requiresProfessionalReview: false,
      message: null,
    };
  }

  const blockedExerciseIds = new Set<string>();

  const filteredExercises = exercises.filter((exercise) => {
    for (const constraint of activeConstraints) {
      const isExplicitlyAllowed =
        constraint.allowedExercises.includes(exercise.id);

      if (isExplicitlyAllowed) {
        continue;
      }

      const patternBlocked = constraint.avoidPatterns.includes(
        exercise.movementPattern,
      );

      const exerciseBlocked =
        constraint.avoidExercises.includes(exercise.id);

      if (patternBlocked || exerciseBlocked) {
        blockedExerciseIds.add(exercise.id);
        return false;
      }
    }

    return true;
  });

  const requiresProfessionalReview = activeConstraints.some(
    (constraint) => constraint.status === "unassessed",
  );

  let message: string | null = null;

  if (filteredExercises.length === 0) {
    message =
      "Apex could not find a suitable exercise within the current movement constraints.";
  } else if (requiresProfessionalReview) {
    message =
      "Apex has applied conservative restrictions because at least one limitation is unassessed.";
  }

  return {
    exercises: filteredExercises,
    blockedExerciseIds: [...blockedExerciseIds],
    requiresProfessionalReview,
    message,
  };
}
