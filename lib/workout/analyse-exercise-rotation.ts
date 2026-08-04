import {
  exerciseLibrary,
  type MovementPattern,
} from "@/lib/workout/exercise-library";

export type RotationPerformance = {
  exerciseId: string;
  completedAt: Date;
  completedSets: number;
  rpe: number | null;
  discomfortLevel: number | null;
};

export type MuscleFatigueLevel =
  | "fresh"
  | "normal"
  | "fatigued"
  | "overworked";

export type MuscleRotationSignal = {
  muscle: string;
  recentSets: number;
  exerciseCount: number;
  highEffortCount: number;
  discomfortCount: number;
  lastTrainedAt: Date | null;
  hoursSinceLastTrained: number | null;
  fatigueScore: number;
  fatigueLevel: MuscleFatigueLevel;
};

export type ExerciseRotationSignal = {
  exerciseId: string;
  exerciseName: string;
  movementPattern: MovementPattern;
  recentAppearances: number;
  recentSets: number;
  lastPerformedAt: Date | null;
  hoursSinceLastPerformed: number | null;
  rotationPenalty: number;
};

export type ExerciseRotationAnalysis = {
  muscleSignals: Record<
    string,
    MuscleRotationSignal
  >;
  exerciseSignals: Record<
    string,
    ExerciseRotationSignal
  >;
  preferredMuscles: string[];
  fatiguedMuscles: string[];
  overworkedMuscles: string[];
  rotateAwayExerciseIds: string[];
  explanation: string;
};

function hoursBetween(
  later: Date,
  earlier: Date,
) {
  return Math.max(
    0,
    (
      later.getTime() -
      earlier.getTime()
    ) / 3_600_000,
  );
}

function getFatigueLevel(
  score: number,
): MuscleFatigueLevel {
  if (score >= 75) return "overworked";
  if (score >= 50) return "fatigued";
  if (score >= 20) return "normal";

  return "fresh";
}

export function analyseExerciseRotation(
  performances: RotationPerformance[],
  now = new Date(),
): ExerciseRotationAnalysis {
  const exercisesById = new Map(
    exerciseLibrary.map((exercise) => [
      exercise.id,
      exercise,
    ]),
  );

  const muscleSignals: Record<
    string,
    MuscleRotationSignal
  > = {};

  const exerciseSignals: Record<
    string,
    ExerciseRotationSignal
  > = {};

  for (const performance of performances) {
    const exercise = exercisesById.get(
      performance.exerciseId,
    );

    if (!exercise) {
      continue;
    }

    const exerciseSignal =
      exerciseSignals[exercise.id] ?? {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        movementPattern:
          exercise.movementPattern,
        recentAppearances: 0,
        recentSets: 0,
        lastPerformedAt: null,
        hoursSinceLastPerformed: null,
        rotationPenalty: 0,
      };

    exerciseSignal.recentAppearances += 1;
    exerciseSignal.recentSets += Math.max(
      0,
      performance.completedSets,
    );

    if (
      !exerciseSignal.lastPerformedAt ||
      performance.completedAt >
        exerciseSignal.lastPerformedAt
    ) {
      exerciseSignal.lastPerformedAt =
        performance.completedAt;
    }

    exerciseSignals[exercise.id] =
      exerciseSignal;

    const affectedMuscles = [
      ...exercise.primaryMuscles.map(
        (muscle) => ({
          muscle,
          contribution: 1,
        }),
      ),
      ...exercise.secondaryMuscles.map(
        (muscle) => ({
          muscle,
          contribution: 0.4,
        }),
      ),
    ];

    for (const {
      muscle,
      contribution,
    } of affectedMuscles) {
      const signal =
        muscleSignals[muscle] ?? {
          muscle,
          recentSets: 0,
          exerciseCount: 0,
          highEffortCount: 0,
          discomfortCount: 0,
          lastTrainedAt: null,
          hoursSinceLastTrained: null,
          fatigueScore: 0,
          fatigueLevel: "fresh" as const,
        };

      signal.recentSets +=
        Math.max(
          0,
          performance.completedSets,
        ) * contribution;

      signal.exerciseCount += contribution;

      if (
        performance.rpe !== null &&
        performance.rpe >= 8
      ) {
        signal.highEffortCount +=
          contribution;
      }

      if (
        performance.discomfortLevel !== null &&
        performance.discomfortLevel >= 4
      ) {
        signal.discomfortCount +=
          contribution;
      }

      if (
        !signal.lastTrainedAt ||
        performance.completedAt >
          signal.lastTrainedAt
      ) {
        signal.lastTrainedAt =
          performance.completedAt;
      }

      muscleSignals[muscle] = signal;
    }
  }

  for (const signal of Object.values(
    muscleSignals,
  )) {
    if (signal.lastTrainedAt) {
      signal.hoursSinceLastTrained =
        hoursBetween(
          now,
          signal.lastTrainedAt,
        );
    }

    let fatigueScore = 0;

    if (
      signal.hoursSinceLastTrained !== null
    ) {
      if (
        signal.hoursSinceLastTrained < 18
      ) {
        fatigueScore += 45;
      } else if (
        signal.hoursSinceLastTrained < 36
      ) {
        fatigueScore += 30;
      } else if (
        signal.hoursSinceLastTrained < 60
      ) {
        fatigueScore += 15;
      } else if (
        signal.hoursSinceLastTrained < 84
      ) {
        fatigueScore += 5;
      }
    }

    fatigueScore += Math.min(
      30,
      signal.recentSets * 2.5,
    );

    fatigueScore += Math.min(
      20,
      signal.highEffortCount * 7,
    );

    fatigueScore += Math.min(
      35,
      signal.discomfortCount * 18,
    );

    signal.fatigueScore = Math.min(
      100,
      Math.round(fatigueScore),
    );

    signal.fatigueLevel =
      getFatigueLevel(
        signal.fatigueScore,
      );
  }

  for (const signal of Object.values(
    exerciseSignals,
  )) {
    if (signal.lastPerformedAt) {
      signal.hoursSinceLastPerformed =
        hoursBetween(
          now,
          signal.lastPerformedAt,
        );
    }

    let penalty =
      Math.max(
        0,
        signal.recentAppearances - 1,
      ) * 12;

    penalty += Math.min(
      25,
      signal.recentSets * 2,
    );

    if (
      signal.hoursSinceLastPerformed !== null
    ) {
      if (
        signal.hoursSinceLastPerformed < 24
      ) {
        penalty += 35;
      } else if (
        signal.hoursSinceLastPerformed < 48
      ) {
        penalty += 20;
      } else if (
        signal.hoursSinceLastPerformed < 72
      ) {
        penalty += 8;
      }
    }

    signal.rotationPenalty = Math.min(
      100,
      Math.round(penalty),
    );
  }

  const allKnownMuscles = [
    ...new Set(
      exerciseLibrary.flatMap(
        (exercise) => [
          ...exercise.primaryMuscles,
          ...exercise.secondaryMuscles,
        ],
      ),
    ),
  ];

  const preferredMuscles =
    allKnownMuscles
      .filter((muscle) => {
        const signal =
          muscleSignals[muscle];

        return (
          !signal ||
          signal.fatigueLevel === "fresh"
        );
      })
      .sort((a, b) => {
        const aHours =
          muscleSignals[a]
            ?.hoursSinceLastTrained ??
          Number.MAX_SAFE_INTEGER;

        const bHours =
          muscleSignals[b]
            ?.hoursSinceLastTrained ??
          Number.MAX_SAFE_INTEGER;

        return bHours - aHours;
      })
      .slice(0, 8);

  const fatiguedMuscles =
    Object.values(muscleSignals)
      .filter(
        (signal) =>
          signal.fatigueLevel ===
          "fatigued",
      )
      .sort(
        (a, b) =>
          b.fatigueScore -
          a.fatigueScore,
      )
      .map((signal) => signal.muscle);

  const overworkedMuscles =
    Object.values(muscleSignals)
      .filter(
        (signal) =>
          signal.fatigueLevel ===
          "overworked",
      )
      .sort(
        (a, b) =>
          b.fatigueScore -
          a.fatigueScore,
      )
      .map((signal) => signal.muscle);

  const rotateAwayExerciseIds =
    Object.values(exerciseSignals)
      .filter(
        (signal) =>
          signal.rotationPenalty >= 55,
      )
      .sort(
        (a, b) =>
          b.rotationPenalty -
          a.rotationPenalty,
      )
      .map(
        (signal) =>
          signal.exerciseId,
      );

  let explanation =
    "Recent exercise rotation appears balanced.";

  if (performances.length === 0) {
    explanation =
      "Apex has limited workout history, so it will prioritise goal, readiness and programme structure while learning exercise preferences.";
  } else if (
    overworkedMuscles.length > 0
  ) {
    explanation =
      "Apex identified muscle groups carrying high recent fatigue and can rotate today's emphasis toward fresher areas.";
  } else if (
    rotateAwayExerciseIds.length > 0
  ) {
    explanation =
      "Apex identified repeated exercises and can introduce suitable variation without changing the programme goal.";
  }

  return {
    muscleSignals,
    exerciseSignals,
    preferredMuscles,
    fatiguedMuscles,
    overworkedMuscles,
    rotateAwayExerciseIds,
    explanation,
  };
}
