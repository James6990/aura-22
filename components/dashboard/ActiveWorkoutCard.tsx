import Link from "next/link";
import {
  CheckCircle2,
  CirclePause,
  Clock3,
  Dumbbell,
  ListChecks,
  Play,
} from "lucide-react";

import type {
  WorkoutSessionStatus,
} from "@/lib/workout/workout-session-lifecycle";

type ActiveWorkoutCardProps = {
  workout: {
    id: string;
    title: string;
    intensity: string;

    status:
      WorkoutSessionStatus;

    activeStartedAt:
      Date | null;

    accumulatedActiveSeconds:
      number;

    totalPausedSeconds:
      number;

    pauseCount:
      number;

    plannedDurationMinutes:
      number | null;

    completedExercises:
      number;

    skippedExercises:
      number;

    totalExercises:
      number;
  };
};

function formatDuration(
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

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }

  return `${minutes} min`;
}

function getCurrentActiveSeconds({
  status,
  activeStartedAt,
  accumulatedActiveSeconds,
}: {
  status:
    WorkoutSessionStatus;

  activeStartedAt:
    Date | null;

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

  return Math.max(
    0,
    accumulatedActiveSeconds +
      Math.floor(
        (
          Date.now() -
          activeStartedAt.getTime()
        ) / 1000,
      ),
  );
}

function getCardCopy(
  status:
    WorkoutSessionStatus,
) {
  switch (status) {
    case "ready":
      return {
        eyebrow:
          "Workout prepared",
        action:
          "Open workout",
        description:
          "Your session is ready. Active timing has not started.",
      };

    case "in-progress":
      return {
        eyebrow:
          "Workout active",
        action:
          "Continue workout",
        description:
          "Active timing is running.",
      };

    case "paused":
      return {
        eyebrow:
          "Workout paused",
        action:
          "Resume workout",
        description:
          "Active timing is safely paused.",
      };

    case "ready-to-complete":
      return {
        eyebrow:
          "Ready to complete",
        action:
          "Finish workout",
        description:
          "Every exercise is resolved and active timing has stopped.",
      };

    case "completed":
      return {
        eyebrow:
          "Workout completed",
        action:
          "View workout",
        description:
          "This session has been completed.",
      };

    case "skipped":
      return {
        eyebrow:
          "Workout skipped",
        action:
          "View workout",
        description:
          "This session was skipped.",
      };
  }
}

export default function ActiveWorkoutCard({
  workout,
}: ActiveWorkoutCardProps) {
  const resolvedExercises =
    workout.completedExercises +
    workout.skippedExercises;

  const progress =
    workout.totalExercises > 0
      ? Math.round(
          (
            resolvedExercises /
            workout.totalExercises
          ) * 100,
        )
      : 0;

  const activeSeconds =
    getCurrentActiveSeconds({
      status:
        workout.status,

      activeStartedAt:
        workout.activeStartedAt,

      accumulatedActiveSeconds:
        workout.accumulatedActiveSeconds,
    });

  const copy =
    getCardCopy(
      workout.status,
    );

  return (
    <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-cyan-950/30 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
          {workout.status ===
          "paused" ? (
            <CirclePause className="h-7 w-7" />
          ) : workout.status ===
            "ready-to-complete" ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : (
            <Dumbbell className="h-7 w-7" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            {copy.eyebrow}
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {workout.title}
          </h2>

          <p className="mt-2 text-sm capitalize text-slate-400">
            {workout.intensity} intensity
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {copy.description}
          </p>
        </div>

        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-black uppercase tracking-wider text-cyan-200">
          {workout.status.replaceAll(
            "-",
            " ",
          )}
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetric
          icon={
            <Clock3 className="h-4 w-4" />
          }
          label="Active time"
          value={formatDuration(
            activeSeconds,
          )}
        />

        <DashboardMetric
          icon={
            <CirclePause className="h-4 w-4" />
          }
          label="Paused time"
          value={formatDuration(
            workout.totalPausedSeconds,
          )}
        />

        <DashboardMetric
          icon={
            <ListChecks className="h-4 w-4" />
          }
          label="Resolved"
          value={`${resolvedExercises}/${workout.totalExercises}`}
        />

        <DashboardMetric
          icon={
            <CirclePause className="h-4 w-4" />
          }
          label="Pauses"
          value={String(
            workout.pauseCount,
          )}
        />
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
          style={{
            width:
              `${progress}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {workout.completedExercises} completed ·{" "}
        {workout.skippedExercises} skipped ·{" "}
        {workout.totalExercises} total
      </p>

      <Link
        href={`/workout/${workout.id}`}
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 font-black text-slate-950 transition hover:bg-cyan-300"
      >
        {workout.status ===
        "ready-to-complete" ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}

        {copy.action}
      </Link>
    </section>
  );
}

function DashboardMetric({
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
      <div className="flex items-center gap-2 text-cyan-300">
        {icon}

        <p className="text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 font-black tabular-nums text-white">
        {value}
      </p>
    </article>
  );
}
