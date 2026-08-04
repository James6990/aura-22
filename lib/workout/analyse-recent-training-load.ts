import {
  exerciseLibrary,
  type MovementPattern,
} from "@/lib/workout/exercise-library";

export type RecentExercisePerformance = {
  exerciseId: string;
  completedAt: Date;
  completedSets: number;
  rpe: number | null;
  discomfortLevel: number | null;
};

export type MovementLoadSignal = {
  movementPattern: MovementPattern;
  recentSets: number;
  lastTrainedAt: Date | null;
  hoursSinceLastTrained: number | null;
  highEffortCount: number;
  discomfortCount: number;
  recoveryPressure: number;
};

export type RecentTrainingLoad = {
  movementSignals: Record<
    MovementPattern,
    MovementLoadSignal
  >;
  preferredPatterns: MovementPattern[];
  deprioritisedPatterns: MovementPattern[];
  explanation: string;
};

const movementPatterns: MovementPattern[] = [
  "horizontal-push",
  "horizontal-pull",
  "vertical-push",
  "vertical-pull",
  "squat",
  "hinge",
  "single-leg",
  "core",
  "cardio",
  "mobility",
];

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

function createEmptySignal(
  movementPattern: MovementPattern,
): MovementLoadSignal {
  return {
    movementPattern,
    recentSets: 0,
    lastTrainedAt: null,
    hoursSinceLastTrained: null,
    highEffortCount: 0,
    discomfortCount: 0,
    recoveryPressure: 0,
  };
}

export function analyseRecentTrainingLoad(
  performances: RecentExercisePerformance[],
  now = new Date(),
): RecentTrainingLoad {
  const signals = Object.fromEntries(
    movementPatterns.map((movementPattern) => [
      movementPattern,
      createEmptySignal(movementPattern),
    ]),
  ) as Record<
    MovementPattern,
    MovementLoadSignal
  >;

  const exercisesById = new Map(
    exerciseLibrary.map((exercise) => [
      exercise.id,
      exercise,
    ]),
  );

  for (const performance of performances) {
    const exercise = exercisesById.get(
      performance.exerciseId,
    );

    if (!exercise) {
      continue;
    }

    const signal =
      signals[exercise.movementPattern];

    signal.recentSets += Math.max(
      0,
      performance.completedSets,
    );

    if (
      !signal.lastTrainedAt ||
      performance.completedAt >
        signal.lastTrainedAt
    ) {
      signal.lastTrainedAt =
        performance.completedAt;
    }

    if (
      performance.rpe !== null &&
      performance.rpe >= 8
    ) {
      signal.highEffortCount += 1;
    }

    if (
      performance.discomfortLevel !== null &&
      performance.discomfortLevel >= 4
    ) {
      signal.discomfortCount += 1;
    }
  }

  for (const signal of Object.values(signals)) {
    if (signal.lastTrainedAt) {
      signal.hoursSinceLastTrained =
        hoursBetween(
          now,
          signal.lastTrainedAt,
        );
    }

    let recoveryPressure = 0;

    if (
      signal.hoursSinceLastTrained !== null
    ) {
      if (signal.hoursSinceLastTrained < 24) {
        recoveryPressure += 45;
      } else if (
        signal.hoursSinceLastTrained < 48
      ) {
        recoveryPressure += 25;
      } else if (
        signal.hoursSinceLastTrained < 72
      ) {
        recoveryPressure += 10;
      }
    }

    recoveryPressure += Math.min(
      25,
      signal.recentSets * 2,
    );

    recoveryPressure += Math.min(
      20,
      signal.highEffortCount * 7,
    );

    recoveryPressure += Math.min(
      30,
      signal.discomfortCount * 15,
    );

    signal.recoveryPressure = Math.min(
      100,
      recoveryPressure,
    );
  }

  const strengthPatterns =
    movementPatterns.filter(
      (movementPattern) =>
        movementPattern !== "mobility" &&
        movementPattern !== "cardio",
    );

  const preferredPatterns = [
    ...strengthPatterns,
  ]
    .sort((a, b) => {
      const aSignal = signals[a];
      const bSignal = signals[b];

      const aNeverTrained =
        aSignal.lastTrainedAt === null;
      const bNeverTrained =
        bSignal.lastTrainedAt === null;

      if (aNeverTrained !== bNeverTrained) {
        return aNeverTrained ? -1 : 1;
      }

      const recoveryDifference =
        aSignal.recoveryPressure -
        bSignal.recoveryPressure;

      if (recoveryDifference !== 0) {
        return recoveryDifference;
      }

      return (
        (bSignal.hoursSinceLastTrained ??
          Number.MAX_SAFE_INTEGER) -
        (aSignal.hoursSinceLastTrained ??
          Number.MAX_SAFE_INTEGER)
      );
    })
    .slice(0, 4);

  const deprioritisedPatterns =
    strengthPatterns.filter(
      (movementPattern) =>
        signals[movementPattern]
          .recoveryPressure >= 55,
    );

  const explanation =
    performances.length === 0
      ? "Apex has limited recent exercise history, so the normal goal and readiness plan remains the main guide."
      : deprioritisedPatterns.length > 0
        ? "Apex identified recently trained or higher-pressure movement patterns and can reduce unnecessary repetition while preserving the programme goal."
        : "Recent training appears sufficiently balanced for the normal programme structure.";

  return {
    movementSignals: signals,
    preferredPatterns,
    deprioritisedPatterns,
    explanation,
  };
}
