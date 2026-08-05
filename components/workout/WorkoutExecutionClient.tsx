"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  CirclePause,
  Clock3,
  ListChecks,
  Play,
  RotateCcw,
} from "lucide-react";

import {
  beginPreparedWorkoutSession,
  pauseWorkoutSession,
  resumeWorkoutSession,
  resolveWorkoutSessionWhenReady,
} from "@/app/actions/workout-lifecycle";
import ExerciseLogger from "@/components/workout/ExerciseLogger";
import FinishWorkoutPanel from "@/components/workout/FinishWorkoutPanel";
import RestTimer from "@/components/workout/RestTimer";
import type {
  WorkoutExerciseResolutionStatus,
  WorkoutSessionStatus,
} from "@/lib/workout/workout-session-lifecycle";

type WorkoutExercise = {
  id: string;
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  plannedSets: number;
  completedSets: number;
  targetReps: string;
  loadKg: number | null;
  completedReps: number[];
  rpe: number | null;
  discomfortLevel: number | null;
  techniqueConfidence: number | null;
  completionStatus:
    WorkoutExerciseResolutionStatus;
  notes: string;
};

type WorkoutExecutionClientProps = {
  sessionId: string;
  exercises: WorkoutExercise[];

  initialStatus:
    WorkoutSessionStatus;

  initialActiveStartedAt:
    string | null;

  initialAccumulatedActiveSeconds:
    number;

  initialTotalPausedSeconds:
    number;

  initialPauseCount:
    number;

  initialLongestPauseSeconds:
    number;
};

function formatElapsed(
  seconds: number,
) {
  const safeSeconds =
    Math.max(
      0,
      Math.floor(seconds),
    );

  const hours =
    Math.floor(
      safeSeconds / 3600,
    );

  const minutes =
    Math.floor(
      (
        safeSeconds % 3600
      ) / 60,
    );

  const remainder =
    safeSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(
      minutes,
    ).padStart(
      2,
      "0",
    )}:${String(
      remainder,
    ).padStart(
      2,
      "0",
    )}`;
  }

  return `${minutes}:${String(
    remainder,
  ).padStart(
    2,
    "0",
  )}`;
}

function getStatusLabel(
  status:
    WorkoutSessionStatus,
) {
  switch (status) {
    case "ready":
      return "Ready to begin";

    case "in-progress":
      return "Workout active";

    case "paused":
      return "Workout paused";

    case "ready-to-complete":
      return "Ready to complete";

    case "completed":
      return "Workout completed";

    case "skipped":
      return "Workout skipped";
  }
}

function calculateDisplayedActiveSeconds({
  status,
  activeStartedAt,
  accumulatedActiveSeconds,
}: {
  status:
    WorkoutSessionStatus;

  activeStartedAt:
    string | null;

  accumulatedActiveSeconds:
    number;
}) {
  if (
    status !== "in-progress" ||
    !activeStartedAt
  ) {
    return Math.max(
      0,
      accumulatedActiveSeconds,
    );
  }

  const activeStartedAtMs =
    new Date(
      activeStartedAt,
    ).getTime();

  if (
    !Number.isFinite(
      activeStartedAtMs,
    )
  ) {
    return Math.max(
      0,
      accumulatedActiveSeconds,
    );
  }

  return Math.max(
    0,
    accumulatedActiveSeconds +
      Math.floor(
        (
          Date.now() -
          activeStartedAtMs
        ) / 1000,
      ),
  );
}

export default function WorkoutExecutionClient({
  sessionId,
  exercises,
  initialStatus,
  initialActiveStartedAt,
  initialAccumulatedActiveSeconds,
  initialTotalPausedSeconds,
  initialPauseCount,
  initialLongestPauseSeconds,
}: WorkoutExecutionClientProps) {
  const firstUnresolvedIndex =
    exercises.findIndex(
      (exercise) =>
        exercise.completionStatus !==
          "completed" &&
        exercise.completionStatus !==
          "skipped",
    );

  const [activeIndex, setActiveIndex] =
    useState(
      firstUnresolvedIndex >= 0
        ? firstUnresolvedIndex
        : Math.max(
            0,
            exercises.length - 1,
          ),
    );

  const [sessionStatus, setSessionStatus] =
    useState<WorkoutSessionStatus>(
      initialStatus,
    );

  const [
    activeStartedAt,
    setActiveStartedAt,
  ] = useState(
    initialActiveStartedAt,
  );

  const [
    accumulatedActiveSeconds,
    setAccumulatedActiveSeconds,
  ] = useState(
    initialAccumulatedActiveSeconds,
  );

  const [
    displayedActiveSeconds,
    setDisplayedActiveSeconds,
  ] = useState(
    initialAccumulatedActiveSeconds,
  );

  const [
    totalPausedSeconds,
    setTotalPausedSeconds,
  ] = useState(
    initialTotalPausedSeconds,
  );

  const [
    pauseCount,
    setPauseCount,
  ] = useState(
    initialPauseCount,
  );

  const [
    longestPauseSeconds,
    setLongestPauseSeconds,
  ] = useState(
    initialLongestPauseSeconds,
  );

  const [
    lifecyclePending,
    setLifecyclePending,
  ] = useState(false);

  const [
    lifecycleError,
    setLifecycleError,
  ] = useState("");

  const [restSignal, setRestSignal] =
    useState(0);

  const [
    exerciseStatuses,
    setExerciseStatuses,
  ] = useState<
    Record<
      string,
      WorkoutExerciseResolutionStatus
    >
  >(
    Object.fromEntries(
      exercises.map(
        (exercise) => [
          exercise.id,
          exercise.completionStatus,
        ],
      ),
    ),
  );

  useEffect(() => {
    function updateTimer() {
      setDisplayedActiveSeconds(
        calculateDisplayedActiveSeconds({
          status:
            sessionStatus,

          activeStartedAt,

          accumulatedActiveSeconds,
        }),
      );
    }

    updateTimer();

    if (
      sessionStatus !==
      "in-progress"
    ) {
      return;
    }

    const timer =
      window.setInterval(
        updateTimer,
        1000,
      );

    return () => {
      window.clearInterval(
        timer,
      );
    };
  }, [
    activeStartedAt,
    accumulatedActiveSeconds,
    sessionStatus,
  ]);

  const completedCount =
    exercises.filter(
      (exercise) =>
        exerciseStatuses[
          exercise.id
        ] === "completed",
    ).length;

  const skippedCount =
    exercises.filter(
      (exercise) =>
        exerciseStatuses[
          exercise.id
        ] === "skipped",
    ).length;

  const resolvedCount =
    completedCount +
    skippedCount;

  const unresolvedCount =
    Math.max(
      0,
      exercises.length -
        resolvedCount,
    );

  const allExercisesResolved =
    exercises.length > 0 &&
    resolvedCount ===
      exercises.length;

  const workoutStarted =
    sessionStatus !== "ready";

  const exerciseLoggingEnabled =
    sessionStatus ===
      "in-progress" ||
    sessionStatus ===
      "paused";

  async function handleBegin() {
    if (
      lifecyclePending ||
      sessionStatus !== "ready"
    ) {
      return;
    }

    setLifecyclePending(true);
    setLifecycleError("");

    try {
      const result =
        await beginPreparedWorkoutSession(
          sessionId,
        );

      if (!result.success) {
        setLifecycleError(
          result.error,
        );
        return;
      }

      setSessionStatus(
        result.status,
      );

      setAccumulatedActiveSeconds(
        result.accumulatedActiveSeconds,
      );

      setTotalPausedSeconds(
        result.totalPausedSeconds,
      );

      setPauseCount(
        result.pauseCount,
      );

      setLongestPauseSeconds(
        result.longestPauseSeconds,
      );

      setActiveStartedAt(
        new Date().toISOString(),
      );
    } catch (error) {
      console.error(
        "Failed to begin workout:",
        error,
      );

      setLifecycleError(
        "Apex could not start this workout. Please try again.",
      );
    } finally {
      setLifecyclePending(false);
    }
  }

  async function handlePause() {
    if (
      lifecyclePending ||
      sessionStatus !==
        "in-progress"
    ) {
      return;
    }

    setLifecyclePending(true);
    setLifecycleError("");

    try {
      const result =
        await pauseWorkoutSession({
          sessionId,
        });

      if (!result.success) {
        setLifecycleError(
          result.error,
        );
        return;
      }

      setSessionStatus(
        result.status,
      );

      setAccumulatedActiveSeconds(
        result.accumulatedActiveSeconds,
      );

      setDisplayedActiveSeconds(
        result.accumulatedActiveSeconds,
      );

      setTotalPausedSeconds(
        result.totalPausedSeconds,
      );

      setPauseCount(
        result.pauseCount,
      );

      setLongestPauseSeconds(
        result.longestPauseSeconds,
      );

      setActiveStartedAt(null);
    } catch (error) {
      console.error(
        "Failed to pause workout:",
        error,
      );

      setLifecycleError(
        "Apex could not pause this workout. Please try again.",
      );
    } finally {
      setLifecyclePending(false);
    }
  }

  async function handleResume() {
    if (
      lifecyclePending ||
      sessionStatus !== "paused"
    ) {
      return;
    }

    setLifecyclePending(true);
    setLifecycleError("");

    try {
      const result =
        await resumeWorkoutSession({
          sessionId,
        });

      if (!result.success) {
        setLifecycleError(
          result.error,
        );
        return;
      }

      setSessionStatus(
        result.status,
      );

      setAccumulatedActiveSeconds(
        result.accumulatedActiveSeconds,
      );

      setTotalPausedSeconds(
        result.totalPausedSeconds,
      );

      setPauseCount(
        result.pauseCount,
      );

      setLongestPauseSeconds(
        result.longestPauseSeconds,
      );

      setActiveStartedAt(
        new Date().toISOString(),
      );
    } catch (error) {
      console.error(
        "Failed to resume workout:",
        error,
      );

      setLifecycleError(
        "Apex could not resume this workout. Please try again.",
      );
    } finally {
      setLifecyclePending(false);
    }
  }

  function movePrevious() {
    setActiveIndex(
      (current) =>
        Math.max(
          0,
          current - 1,
        ),
    );
  }

  function moveNext() {
    setActiveIndex(
      (current) =>
        Math.min(
          exercises.length - 1,
          current + 1,
        ),
    );
  }

  async function handleExerciseSaved(
    completionStatus:
      WorkoutExerciseResolutionStatus,
  ) {
    const currentExercise =
      exercises[activeIndex];

    if (!currentExercise) {
      return;
    }

    const nextExerciseStatuses = {
      ...exerciseStatuses,

      [currentExercise.id]:
        completionStatus,
    };

    setExerciseStatuses(
      nextExerciseStatuses,
    );

    if (
      completionStatus ===
      "completed"
    ) {
      setRestSignal(
        (current) =>
          current + 1,
      );
    }

    try {
      const resolution =
        await resolveWorkoutSessionWhenReady(
          sessionId,
        );

      if (!resolution.success) {
        setLifecycleError(
          resolution.error,
        );
        return;
      }

      setSessionStatus(
        resolution.status,
      );

      setAccumulatedActiveSeconds(
        resolution.accumulatedActiveSeconds,
      );

      setDisplayedActiveSeconds(
        resolution.accumulatedActiveSeconds,
      );

      setTotalPausedSeconds(
        resolution.totalPausedSeconds,
      );

      setPauseCount(
        resolution.pauseCount,
      );

      setLongestPauseSeconds(
        resolution.longestPauseSeconds,
      );

      if (
        resolution.status ===
        "ready-to-complete"
      ) {
        setActiveStartedAt(null);
        return;
      }

      const nextUnresolvedIndex =
        exercises.findIndex(
          (
            exercise,
            index,
          ) =>
            index >
              activeIndex &&
            nextExerciseStatuses[
              exercise.id
            ] !== "completed" &&
            nextExerciseStatuses[
              exercise.id
            ] !== "skipped",
        );

      if (
        nextUnresolvedIndex >= 0
      ) {
        setActiveIndex(
          nextUnresolvedIndex,
        );
      } else {
        moveNext();
      }
    } catch (error) {
      console.error(
        "Failed to resolve workout progress:",
        error,
      );

      setLifecycleError(
        "Apex saved the exercise but could not update the workout lifecycle.",
      );
    }
  }

  return (
    <>
      <section className="mt-6 rounded-3xl border border-violet-500/20 bg-slate-900/70 p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
              Session lifecycle
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {getStatusLabel(
                sessionStatus,
              )}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Active time excludes pauses so Apex records the workout more accurately.
            </p>
          </div>

          <span className="w-fit rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-violet-200">
            {sessionStatus.replaceAll(
              "-",
              " ",
            )}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SessionMetric
            icon={
              <Clock3 className="h-4 w-4" />
            }
            label="Active time"
            value={formatElapsed(
              displayedActiveSeconds,
            )}
          />

          <SessionMetric
            icon={
              <ListChecks className="h-4 w-4" />
            }
            label="Resolved"
            value={`${resolvedCount}/${exercises.length}`}
          />

          <SessionMetric
            icon={
              <CirclePause className="h-4 w-4" />
            }
            label="Paused time"
            value={formatElapsed(
              totalPausedSeconds,
            )}
          />

          <SessionMetric
            icon={
              <RotateCcw className="h-4 w-4" />
            }
            label="Pauses"
            value={String(
              pauseCount,
            )}
          />
        </div>

        {longestPauseSeconds > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Longest recorded pause:{" "}
            {formatElapsed(
              longestPauseSeconds,
            )}
          </p>
        )}

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all"
            style={{
              width: `${
                exercises.length > 0
                  ? Math.round(
                      (
                        resolvedCount /
                        exercises.length
                      ) * 100,
                    )
                  : 0
              }%`,
            }}
          />
        </div>

        {lifecycleError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {lifecycleError}
          </div>
        )}

        <div className="mt-5">
          {sessionStatus ===
            "ready" && (
            <button
              type="button"
              onClick={
                handleBegin
              }
              disabled={
                lifecyclePending
              }
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-5 w-5" />

              {lifecyclePending
                ? "Starting workout..."
                : "Start workout"}
            </button>
          )}

          {sessionStatus ===
            "in-progress" && (
            <button
              type="button"
              onClick={
                handlePause
              }
              disabled={
                lifecyclePending
              }
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 font-black text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CirclePause className="h-5 w-5" />

              {lifecyclePending
                ? "Pausing workout..."
                : "Pause workout"}
            </button>
          )}

          {sessionStatus ===
            "paused" && (
            <button
              type="button"
              onClick={
                handleResume
              }
              disabled={
                lifecyclePending
              }
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Play className="h-5 w-5" />

              {lifecyclePending
                ? "Resuming workout..."
                : "Resume workout"}
            </button>
          )}

          {sessionStatus ===
            "ready-to-complete" && (
            <div
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm font-bold text-emerald-200"
            >
              Every exercise has been resolved. Active timing has stopped and your debrief is ready.
            </div>
          )}
        </div>
      </section>

      {workoutStarted &&
        sessionStatus !==
          "completed" && (
          <div className="mt-4">
            <RestTimer
              initialSeconds={90}
              startSignal={
                restSignal
              }
            />
          </div>
        )}

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={
              movePrevious
            }
            disabled={
              activeIndex === 0
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 font-bold text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <p className="text-sm font-bold text-slate-400">
            Exercise{" "}
            {exercises.length > 0
              ? activeIndex + 1
              : 0}{" "}
            of {exercises.length}
          </p>

          <button
            type="button"
            onClick={
              moveNext
            }
            disabled={
              activeIndex >=
              exercises.length - 1
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 font-bold text-slate-300 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {!exerciseLoggingEnabled &&
          sessionStatus ===
            "ready" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="font-black text-white">
                Start the workout when you are ready.
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Opening this page does not start active timing. The timer begins only when you press Start workout.
              </p>
            </div>
          )}

        {exercises.length > 0 &&
          exerciseLoggingEnabled && (
            <ExerciseLogger
              key={
                exercises[
                  activeIndex
                ].id
              }
              sessionId={
                sessionId
              }
              exercise={
                exercises[
                  activeIndex
                ]
              }
              exerciseNumber={
                activeIndex + 1
              }
              totalExercises={
                exercises.length
              }
              active
              onSaved={
                handleExerciseSaved
              }
            />
          )}

        {sessionStatus ===
          "ready-to-complete" && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="font-black text-emerald-200">
              Exercise logging is complete.
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Review your final effort and notes below before saving the workout.
            </p>
          </div>
        )}
      </section>

      <div className="mt-6">
        <FinishWorkoutPanel
          sessionId={
            sessionId
          }
          sessionStatus={
            sessionStatus
          }
          alreadyCompleted={
            sessionStatus ===
            "completed"
          }
          canFinishNormally={
            sessionStatus ===
              "ready-to-complete" &&
            allExercisesResolved
          }
          completedExercises={
            completedCount
          }
          skippedExercises={
            skippedCount
          }
          unresolvedExercises={
            unresolvedCount
          }
          totalExercises={
            exercises.length
          }
          onCompleted={() => {
            setSessionStatus(
              "completed",
            );

            setActiveStartedAt(
              null,
            );
          }}
        />
      </div>
    </>
  );
}

function SessionMetric({
  icon,
  label,
  value,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-violet-300">
        {icon}

        <p className="text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 text-xl font-black tabular-nums text-white">
        {value}
      </p>
    </article>
  );
}
