"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  ListChecks,
} from "lucide-react";

import ExerciseLogger from "@/components/workout/ExerciseLogger";
import FinishWorkoutPanel from "@/components/workout/FinishWorkoutPanel";
import RestTimer from "@/components/workout/RestTimer";

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
  completionStatus: string;
  notes: string;
};

type WorkoutExecutionClientProps = {
  sessionId: string;
  exercises: WorkoutExercise[];
  startedAt: string | null;
  alreadyCompleted: boolean;
};

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${String(remainder).padStart(
    2,
    "0",
  )}`;
}

export default function WorkoutExecutionClient({
  sessionId,
  exercises,
  startedAt,
  alreadyCompleted,
}: WorkoutExecutionClientProps) {
  const firstIncompleteIndex = Math.max(
    0,
    exercises.findIndex(
      (exercise) =>
        exercise.completionStatus !== "completed",
    ),
  );

  const [activeIndex, setActiveIndex] =
    useState(firstIncompleteIndex);

  const [elapsedSeconds, setElapsedSeconds] =
    useState(0);

  const [timerReady, setTimerReady] =
    useState(false);

  const [restSignal, setRestSignal] =
    useState(0);

  const [exerciseStatuses, setExerciseStatuses] =
    useState<Record<string, string>>(
      Object.fromEntries(
        exercises.map((exercise) => [
          exercise.id,
          exercise.completionStatus,
        ]),
      ),
    );

  useEffect(() => {
    function calculateElapsed() {
      if (!startedAt) {
        return 0;
      }

      const startedAtMs =
        new Date(startedAt).getTime();

      if (!Number.isFinite(startedAtMs)) {
        return 0;
      }

      return Math.max(
        0,
        Math.floor(
          (Date.now() - startedAtMs) / 1000,
        ),
      );
    }

    setElapsedSeconds(calculateElapsed());
    setTimerReady(true);

    if (alreadyCompleted) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds(calculateElapsed());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [alreadyCompleted, startedAt]);

  const completedCount = exercises.filter(
    (exercise) =>
      exerciseStatuses[exercise.id] ===
      "completed",
  ).length;

  const allExercisesCompleted =
    exercises.length > 0 &&
    completedCount === exercises.length;

  function movePrevious() {
    setActiveIndex((current) =>
      Math.max(0, current - 1),
    );
  }

  function moveNext() {
    setActiveIndex((current) =>
      Math.min(
        exercises.length - 1,
        current + 1,
      ),
    );
  }

  function handleExerciseSaved(
    completionStatus: string,
  ) {
    const currentExercise =
      exercises[activeIndex];

    if (currentExercise) {
      setExerciseStatuses((current) => ({
        ...current,
        [currentExercise.id]:
          completionStatus,
      }));
    }

    if (completionStatus === "completed") {
      setRestSignal((current) => current + 1);

      setActiveIndex((current) =>
        Math.min(
          exercises.length - 1,
          current + 1,
        ),
      );
    }
  }

  return (
    <>
      <section className="mt-6 rounded-3xl border border-violet-500/20 bg-slate-900/70 p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-2 text-violet-300">
              <Clock3 className="h-4 w-4" />

              <p className="text-xs font-bold uppercase tracking-wider">
                Elapsed time
              </p>
            </div>

            <p className="mt-3 text-2xl font-black tabular-nums text-white">
              {timerReady
                ? formatElapsed(elapsedSeconds)
                : "0:00"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-2 text-violet-300">
              <ListChecks className="h-4 w-4" />

              <p className="text-xs font-bold uppercase tracking-wider">
                Exercise progress
              </p>
            </div>

            <p className="mt-3 text-2xl font-black text-white">
              {completedCount} / {exercises.length}
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all"
            style={{
              width: `${
                exercises.length > 0
                  ? Math.round(
                      (completedCount /
                        exercises.length) *
                        100,
                    )
                  : 0
              }%`,
            }}
          />
        </div>
      </section>

      <div className="mt-4">
        <RestTimer
          initialSeconds={90}
          startSignal={restSignal}
        />
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={movePrevious}
            disabled={activeIndex === 0}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 font-bold text-slate-300 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <p className="text-sm font-bold text-slate-400">
            Exercise {activeIndex + 1} of{" "}
            {exercises.length}
          </p>

          <button
            type="button"
            onClick={moveNext}
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

        {exercises.length > 0 && (
          <ExerciseLogger
            key={exercises[activeIndex].id}
            sessionId={sessionId}
            exercise={exercises[activeIndex]}
            exerciseNumber={activeIndex + 1}
            totalExercises={exercises.length}
            active
            onSaved={handleExerciseSaved}
          />
        )}
      </section>

      <div className="mt-6">
        <FinishWorkoutPanel
          sessionId={sessionId}
          alreadyCompleted={alreadyCompleted}
          canFinish={allExercisesCompleted}
          completedExercises={completedCount}
          totalExercises={exercises.length}
        />
      </div>
    </>
  );
}
