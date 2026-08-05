export type TrainingBehaviourWorkout = {
  date: string;
  status:
    | "ready"
    | "in-progress"
    | "paused"
    | "ready-to-complete"
    | "completed"
    | "skipped";
  intensity: string;
  plannedDurationMinutes: number | null;
  actualDurationMinutes: number | null;
  sessionRpe: number | null;
  startedAt: Date | null;
  completedAt: Date | null;
};

export type PreferredTrainingWindow =
  | "morning"
  | "afternoon"
  | "evening"
  | "unknown";

export type TrainingBehaviourProfile = {
  totalPlannedSessions: number;
  completedSessions: number;
  skippedSessions: number;
  completionRate: number;

  averageActualDurationMinutes: number | null;
  averageSessionRpe: number | null;

  preferredIntensity: string | null;
  preferredTrainingWindow:
    PreferredTrainingWindow;

  confidence: number;
  summary: string;
};

export type AnalyseTrainingBehaviourInput = {
  workouts: TrainingBehaviourWorkout[];
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

function getMostCommonValue(
  values: string[],
): string | null {
  if (values.length === 0) {
    return null;
  }

  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(
      value,
      (counts.get(value) ?? 0) + 1,
    );
  }

  return (
    [...counts.entries()]
      .sort(
        ([labelA, countA], [labelB, countB]) =>
          countB - countA ||
          labelA.localeCompare(labelB),
      )[0]?.[0] ?? null
  );
}

function getTrainingWindow(
  date: Date,
): Exclude<
  PreferredTrainingWindow,
  "unknown"
> {
  const hour = date.getHours();

  if (hour < 12) {
    return "morning";
  }

  if (hour < 18) {
    return "afternoon";
  }

  return "evening";
}

export function analyseTrainingBehaviour({
  workouts,
}: AnalyseTrainingBehaviourInput): TrainingBehaviourProfile {
  const relevantWorkouts =
    workouts.filter(
      (workout) =>
        workout.status !== "in-progress",
    );

  const completed =
    relevantWorkouts.filter(
      (workout) =>
        workout.status === "completed",
    );

  const skipped =
    relevantWorkouts.filter(
      (workout) =>
        workout.status === "skipped",
    );

  const totalPlannedSessions =
    relevantWorkouts.length;

  const completionRate =
    totalPlannedSessions === 0
      ? 0
      : Math.round(
          clamp(
            (
              completed.length /
              totalPlannedSessions
            ) * 100,
          ),
        );

  const durationValues =
    completed.flatMap(
      (workout) =>
        workout.actualDurationMinutes === null
          ? []
          : [
              workout.actualDurationMinutes,
            ],
    );

  const rpeValues =
    completed.flatMap(
      (workout) =>
        workout.sessionRpe === null
          ? []
          : [workout.sessionRpe],
    );

  const preferredIntensity =
    getMostCommonValue(
      completed
        .map(
          (workout) =>
            workout.intensity.trim(),
        )
        .filter(Boolean),
    );

  const trainingWindows =
    completed.flatMap(
      (workout) => {
        const timestamp =
          workout.startedAt ??
          workout.completedAt;

        return timestamp
          ? [getTrainingWindow(timestamp)]
          : [];
      },
    );

  const preferredTrainingWindow =
    (
      getMostCommonValue(
        trainingWindows,
      ) as PreferredTrainingWindow | null
    ) ?? "unknown";

  const evidencePoints =
    completed.length * 7 +
    skipped.length * 3 +
    durationValues.length * 2 +
    rpeValues.length * 2 +
    trainingWindows.length * 2;

  const confidence = Math.round(
    clamp(evidencePoints),
  );

  const summary =
    relevantWorkouts.length === 0
      ? "Apex needs workout history before it can learn reliable training behaviour."
      : confidence < 50
        ? "Apex is beginning to learn how this athlete naturally trains."
        : "Apex has enough workout history to personalise session timing, duration and intensity guidance.";

  return {
    totalPlannedSessions,
    completedSessions:
      completed.length,
    skippedSessions:
      skipped.length,
    completionRate,
    averageActualDurationMinutes:
      average(durationValues),
    averageSessionRpe:
      average(rpeValues),
    preferredIntensity,
    preferredTrainingWindow,
    confidence,
    summary,
  };
}
