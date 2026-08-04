import type {
  ExerciseProgressionHistory,
} from "@/lib/workout/get-exercise-progression-history";
import type {
  RecentExercisePerformance,
} from "@/lib/workout/analyse-recent-training-load";

export type ExercisePreferenceSignal = {
  exerciseId: string;
  completedAppearances: number;
  averageRpe: number | null;
  averageDiscomfort: number | null;
};

export type ExercisePersonalisationProfile = {
  frequentlyCompletedExerciseIds: string[];
  progressionReadyExerciseIds: string[];
  reviewExerciseIds: string[];
  discomfortExerciseIds: string[];
  exerciseSignals: ExercisePreferenceSignal[];
  confidence: number;
  summary: string;
};

export type AnalyseExercisePreferencesInput = {
  recentPerformances: RecentExercisePerformance[];
  progressionHistory: Record<
    string,
    ExerciseProgressionHistory
  >;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function average(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  return (
    values.reduce(
      (total, value) => total + value,
      0,
    ) / values.length
  );
}

export function analyseExercisePreferences({
  recentPerformances,
  progressionHistory,
}: AnalyseExercisePreferencesInput): ExercisePersonalisationProfile {
  const grouped = new Map<
    string,
    RecentExercisePerformance[]
  >();

  for (const performance of recentPerformances) {
    const existing =
      grouped.get(performance.exerciseId) ?? [];

    existing.push(performance);
    grouped.set(
      performance.exerciseId,
      existing,
    );
  }

  const exerciseSignals =
    [...grouped.entries()]
      .map(([exerciseId, performances]) => {
        const rpeValues =
          performances.flatMap(
            (performance) =>
              performance.rpe === null
                ? []
                : [performance.rpe],
          );

        const discomfortValues =
          performances.flatMap(
            (performance) =>
              performance.discomfortLevel === null
                ? []
                : [
                    performance
                      .discomfortLevel,
                  ],
          );

        return {
          exerciseId,
          completedAppearances:
            performances.length,
          averageRpe:
            average(rpeValues),
          averageDiscomfort:
            average(discomfortValues),
        };
      })
      .sort(
        (a, b) =>
          b.completedAppearances -
          a.completedAppearances,
      );

  const frequentlyCompletedExerciseIds =
    exerciseSignals
      .filter(
        (signal) =>
          signal.completedAppearances >= 2,
      )
      .slice(0, 5)
      .map(
        (signal) => signal.exerciseId,
      );

  const progressionReadyExerciseIds =
    Object.values(progressionHistory)
      .filter(
        (history) =>
          history.progressionDecision ===
          "increase",
      )
      .map(
        (history) => history.exerciseId,
      );

  const reviewExerciseIds =
    Object.values(progressionHistory)
      .filter(
        (history) =>
          history.progressionDecision ===
            "review" ||
          history.progressionDecision ===
            "reduce",
      )
      .map(
        (history) => history.exerciseId,
      );

  const discomfortExerciseIds =
    exerciseSignals
      .filter(
        (signal) =>
          signal.averageDiscomfort !== null &&
          signal.averageDiscomfort >= 4,
      )
      .map(
        (signal) => signal.exerciseId,
      );

  const confidence = Math.round(
    clamp(
      recentPerformances.length * 2 +
        Object.keys(
          progressionHistory,
        ).length * 3,
    ),
  );

  const summary =
    recentPerformances.length === 0
      ? "Apex needs completed exercise history before it can learn reliable movement preferences."
      : confidence < 50
        ? "Apex is beginning to learn which exercises appear most repeatable and appropriate."
        : "Apex has enough recent exercise history to begin personalising selection and progression decisions.";

  return {
    frequentlyCompletedExerciseIds,
    progressionReadyExerciseIds,
    reviewExerciseIds,
    discomfortExerciseIds,
    exerciseSignals,
    confidence,
    summary,
  };
}
