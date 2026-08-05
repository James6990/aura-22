export const workoutSessionStatuses = [
  "ready",
  "in-progress",
  "paused",
  "ready-to-complete",
  "completed",
  "skipped",
] as const;

export type WorkoutSessionStatus =
  typeof workoutSessionStatuses[number];

export const workoutCompletionModes = [
  "normal",
  "early",
] as const;

export type WorkoutCompletionMode =
  typeof workoutCompletionModes[number];

export const workoutPauseReasons = [
  "rest",
  "interruption",
  "equipment-wait",
  "discomfort-check",
  "accessibility",
  "other",
] as const;

export type WorkoutPauseReason =
  typeof workoutPauseReasons[number];

export const workoutSkipReasons = [
  "equipment-unavailable",
  "discomfort",
  "time-limit",
  "accessibility",
  "substituted",
  "personal-choice",
  "other",
] as const;

export type WorkoutSkipReason =
  typeof workoutSkipReasons[number];

export const workoutExerciseResolutionStatuses = [
  "not-started",
  "partial",
  "completed",
  "skipped",
] as const;

export type WorkoutExerciseResolutionStatus =
  typeof workoutExerciseResolutionStatuses[number];

export type WorkoutTimingState = {
  status: WorkoutSessionStatus;

  startedAt: Date | null;
  activeStartedAt: Date | null;
  pausedAt: Date | null;

  accumulatedActiveSeconds: number;
  totalPausedSeconds: number;
  pauseCount: number;
  longestPauseSeconds: number;
};

export type WorkoutResolutionSummary = {
  completedExercises: number;
  partialExercises: number;
  skippedExercises: number;
  unresolvedExercises: number;
  resolvedExercises: number;
  totalExercises: number;
  allResolved: boolean;
};

function requireValidDate(
  value: Date,
  label: string,
) {
  if (
    !(value instanceof Date) ||
    Number.isNaN(value.getTime())
  ) {
    throw new Error(
      `${label} must be a valid date.`,
    );
  }
}

function requireNonNegativeInteger(
  value: number,
  label: string,
) {
  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${label} must be a non-negative integer.`,
    );
  }

  return value;
}

export function isWorkoutSessionStatus(
  value: string,
): value is WorkoutSessionStatus {
  return (
    workoutSessionStatuses as readonly string[]
  ).includes(value);
}

export function isWorkoutPauseReason(
  value: string,
): value is WorkoutPauseReason {
  return (
    workoutPauseReasons as readonly string[]
  ).includes(value);
}

export function isWorkoutSkipReason(
  value: string,
): value is WorkoutSkipReason {
  return (
    workoutSkipReasons as readonly string[]
  ).includes(value);
}

export function calculateDurationSeconds({
  from,
  to,
}: {
  from: Date;
  to: Date;
}) {
  requireValidDate(from, "Duration start");
  requireValidDate(to, "Duration end");

  return Math.max(
    0,
    Math.floor(
      (
        to.getTime() -
        from.getTime()
      ) / 1000,
    ),
  );
}

export function calculateCurrentActiveSeconds({
  timing,
  now = new Date(),
}: {
  timing: WorkoutTimingState;
  now?: Date;
}) {
  requireValidDate(
    now,
    "Current time",
  );

  const accumulated =
    requireNonNegativeInteger(
      timing.accumulatedActiveSeconds,
      "Accumulated active seconds",
    );

  if (
    timing.status !== "in-progress" ||
    timing.activeStartedAt === null
  ) {
    return accumulated;
  }

  return (
    accumulated +
    calculateDurationSeconds({
      from:
        timing.activeStartedAt,
      to: now,
    })
  );
}

export function startWorkoutTiming({
  timing,
  now = new Date(),
}: {
  timing: WorkoutTimingState;
  now?: Date;
}): WorkoutTimingState {
  requireValidDate(
    now,
    "Workout start time",
  );

  if (
    timing.status !== "ready"
  ) {
    throw new Error(
      "Only a ready workout can be started.",
    );
  }

  return {
    ...timing,

    status:
      "in-progress",

    startedAt:
      timing.startedAt ?? now,

    activeStartedAt:
      now,

    pausedAt:
      null,
  };
}

export function pauseWorkoutTiming({
  timing,
  now = new Date(),
}: {
  timing: WorkoutTimingState;
  now?: Date;
}): WorkoutTimingState {
  requireValidDate(
    now,
    "Workout pause time",
  );

  if (
    timing.status !== "in-progress" ||
    timing.activeStartedAt === null
  ) {
    throw new Error(
      "Only an active workout can be paused.",
    );
  }

  const activeIntervalSeconds =
    calculateDurationSeconds({
      from:
        timing.activeStartedAt,
      to: now,
    });

  return {
    ...timing,

    status:
      "paused",

    accumulatedActiveSeconds:
      timing.accumulatedActiveSeconds +
      activeIntervalSeconds,

    activeStartedAt:
      null,

    pausedAt:
      now,
  };
}

export function resumeWorkoutTiming({
  timing,
  now = new Date(),
}: {
  timing: WorkoutTimingState;
  now?: Date;
}): WorkoutTimingState {
  requireValidDate(
    now,
    "Workout resume time",
  );

  if (
    timing.status !== "paused" ||
    timing.pausedAt === null
  ) {
    throw new Error(
      "Only a paused workout can be resumed.",
    );
  }

  const pauseDurationSeconds =
    calculateDurationSeconds({
      from:
        timing.pausedAt,
      to: now,
    });

  return {
    ...timing,

    status:
      "in-progress",

    activeStartedAt:
      now,

    pausedAt:
      null,

    totalPausedSeconds:
      timing.totalPausedSeconds +
      pauseDurationSeconds,

    pauseCount:
      timing.pauseCount + 1,

    longestPauseSeconds:
      Math.max(
        timing.longestPauseSeconds,
        pauseDurationSeconds,
      ),
  };
}

export function resolveWorkoutTiming({
  timing,
  now = new Date(),
}: {
  timing: WorkoutTimingState;
  now?: Date;
}): WorkoutTimingState {
  requireValidDate(
    now,
    "Workout resolution time",
  );

  if (
    timing.status !== "in-progress" &&
    timing.status !== "paused"
  ) {
    throw new Error(
      "Only an active or paused workout can become ready to complete.",
    );
  }

  let next = timing;

  if (
    timing.status === "in-progress"
  ) {
    if (
      timing.activeStartedAt === null
    ) {
      throw new Error(
        "An active workout requires an active start time.",
      );
    }

    next = {
      ...timing,

      accumulatedActiveSeconds:
        timing.accumulatedActiveSeconds +
        calculateDurationSeconds({
          from:
            timing.activeStartedAt,
          to: now,
        }),

      activeStartedAt:
        null,
    };
  } else if (
    timing.pausedAt !== null
  ) {
    const pauseDurationSeconds =
      calculateDurationSeconds({
        from:
          timing.pausedAt,
        to: now,
      });

    next = {
      ...timing,

      totalPausedSeconds:
        timing.totalPausedSeconds +
        pauseDurationSeconds,

      pauseCount:
        timing.pauseCount + 1,

      longestPauseSeconds:
        Math.max(
          timing.longestPauseSeconds,
          pauseDurationSeconds,
        ),

      pausedAt:
        null,
    };
  }

  return {
    ...next,

    status:
      "ready-to-complete",

    activeStartedAt:
      null,

    pausedAt:
      null,
  };
}

export function summariseWorkoutResolution(
  statuses:
    readonly WorkoutExerciseResolutionStatus[],
): WorkoutResolutionSummary {
  const completedExercises =
    statuses.filter(
      (status) =>
        status === "completed",
    ).length;

  const partialExercises =
    statuses.filter(
      (status) =>
        status === "partial",
    ).length;

  const skippedExercises =
    statuses.filter(
      (status) =>
        status === "skipped",
    ).length;

  const unresolvedExercises =
    statuses.filter(
      (status) =>
        status === "not-started" ||
        status === "partial",
    ).length;

  const resolvedExercises =
    completedExercises +
    skippedExercises;

  return {
    completedExercises,
    partialExercises,
    skippedExercises,
    unresolvedExercises,
    resolvedExercises,
    totalExercises:
      statuses.length,

    allResolved:
      statuses.length > 0 &&
      unresolvedExercises === 0,
  };
}

export function createReadyWorkoutTiming():
  WorkoutTimingState {
  return {
    status: "ready",

    startedAt: null,
    activeStartedAt: null,
    pausedAt: null,

    accumulatedActiveSeconds: 0,
    totalPausedSeconds: 0,
    pauseCount: 0,
    longestPauseSeconds: 0,
  };
}
