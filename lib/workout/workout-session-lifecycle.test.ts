import {
  calculateCurrentActiveSeconds,
  createReadyWorkoutTiming,
  isWorkoutPauseReason,
  isWorkoutSessionStatus,
  isWorkoutSkipReason,
  pauseWorkoutTiming,
  resolveWorkoutTiming,
  resumeWorkoutTiming,
  startWorkoutTiming,
  summariseWorkoutResolution,
} from "./workout-session-lifecycle";

const ready =
  createReadyWorkoutTiming();

if (
  ready.status !== "ready" ||
  ready.startedAt !== null ||
  ready.accumulatedActiveSeconds !== 0
) {
  throw new Error(
    "A prepared workout should begin ready with a stopped timer.",
  );
}

const started =
  startWorkoutTiming({
    timing: ready,
    now:
      new Date(
        "2026-08-05T17:00:00Z",
      ),
  });

if (
  started.status !== "in-progress" ||
  started.startedAt?.toISOString() !==
    "2026-08-05T17:00:00.000Z" ||
  started.activeStartedAt?.toISOString() !==
    "2026-08-05T17:00:00.000Z"
) {
  throw new Error(
    "Starting should begin the first active interval.",
  );
}

const activeSeconds =
  calculateCurrentActiveSeconds({
    timing: started,
    now:
      new Date(
        "2026-08-05T17:10:00Z",
      ),
  });

if (activeSeconds !== 600) {
  throw new Error(
    "Active duration should include the current running interval.",
  );
}

const paused =
  pauseWorkoutTiming({
    timing: started,
    now:
      new Date(
        "2026-08-05T17:10:00Z",
      ),
  });

if (
  paused.status !== "paused" ||
  paused.accumulatedActiveSeconds !==
    600 ||
  paused.activeStartedAt !== null ||
  paused.pausedAt?.toISOString() !==
    "2026-08-05T17:10:00.000Z"
) {
  throw new Error(
    "Pausing should freeze accumulated active time.",
  );
}

const pausedActiveSeconds =
  calculateCurrentActiveSeconds({
    timing: paused,
    now:
      new Date(
        "2026-08-05T17:20:00Z",
      ),
  });

if (pausedActiveSeconds !== 600) {
  throw new Error(
    "Paused time must not increase active workout duration.",
  );
}

const resumed =
  resumeWorkoutTiming({
    timing: paused,
    now:
      new Date(
        "2026-08-05T17:15:00Z",
      ),
  });

if (
  resumed.status !==
    "in-progress" ||
  resumed.totalPausedSeconds !==
    300 ||
  resumed.pauseCount !== 1 ||
  resumed.longestPauseSeconds !==
    300
) {
  throw new Error(
    "Resuming should record pause duration and restart active timing.",
  );
}

const readyToComplete =
  resolveWorkoutTiming({
    timing: resumed,
    now:
      new Date(
        "2026-08-05T17:25:00Z",
      ),
  });

if (
  readyToComplete.status !==
    "ready-to-complete" ||
  readyToComplete
    .accumulatedActiveSeconds !==
    1200 ||
  readyToComplete
    .totalPausedSeconds !== 300 ||
  readyToComplete.activeStartedAt !==
    null
) {
  throw new Error(
    "Resolving a workout should stop active timing accurately.",
  );
}

const resolution =
  summariseWorkoutResolution([
    "completed",
    "skipped",
    "completed",
  ]);

if (
  !resolution.allResolved ||
  resolution.completedExercises !== 2 ||
  resolution.skippedExercises !== 1 ||
  resolution.unresolvedExercises !== 0
) {
  throw new Error(
    "Completed and skipped exercises should count as resolved.",
  );
}

const unresolved =
  summariseWorkoutResolution([
    "completed",
    "partial",
    "not-started",
  ]);

if (
  unresolved.allResolved ||
  unresolved.unresolvedExercises !== 2
) {
  throw new Error(
    "Partial and not-started exercises should remain unresolved.",
  );
}

for (const status of [
  "ready",
  "in-progress",
  "paused",
  "ready-to-complete",
  "completed",
  "skipped",
]) {
  if (
    !isWorkoutSessionStatus(
      status,
    )
  ) {
    throw new Error(
      `${status} should be a valid workout status.`,
    );
  }
}

if (
  isWorkoutSessionStatus(
    "unknown",
  )
) {
  throw new Error(
    "Unknown workout statuses must be rejected.",
  );
}

if (
  !isWorkoutPauseReason(
    "accessibility",
  ) ||
  !isWorkoutSkipReason(
    "discomfort",
  )
) {
  throw new Error(
    "Canonical pause and skip reasons should be recognised.",
  );
}

let invalidTransitionRejected =
  false;

try {
  pauseWorkoutTiming({
    timing: ready,
  });
} catch (error) {
  invalidTransitionRejected =
    error instanceof Error &&
    error.message.includes(
      "active workout",
    );
}

if (
  !invalidTransitionRejected
) {
  throw new Error(
    "Invalid lifecycle transitions must be rejected clearly.",
  );
}

console.log(
  "Workout Session Lifecycle test passed.",
);
