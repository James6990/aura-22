"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Dumbbell,
  Gauge,
  Sparkles,
  Trophy,
} from "lucide-react";

import {
  completeWorkoutSession,
  type WorkoutDebrief,
} from "@/app/actions/workout-session";

type FinishWorkoutPanelProps = {
  sessionId: string;
  alreadyCompleted: boolean;
  canFinish: boolean;
  completedExercises: number;
  totalExercises: number;
};

export default function FinishWorkoutPanel({
  sessionId,
  alreadyCompleted,
  canFinish,
  completedExercises,
  totalExercises,
}: FinishWorkoutPanelProps) {
  const [sessionRpe, setSessionRpe] = useState("");
  const [notes, setNotes] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState("");
  const [debrief, setDebrief] =
    useState<WorkoutDebrief | null>(null);

  async function handleFinish() {
    if (finishing || alreadyCompleted || debrief) {
      return;
    }

    if (!canFinish) {
      setError(
        `Complete all exercises before finishing. ${completedExercises} of ${totalExercises} are complete.`,
      );
      return;
    }

    setFinishing(true);
    setError("");

    try {
      const result = await completeWorkoutSession({
        sessionId,
        sessionRpe:
          sessionRpe.trim() === ""
            ? null
            : Number(sessionRpe),
        notes,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setDebrief(result.debrief);
    } catch (caughtError) {
      console.error(
        "Failed to finish workout:",
        caughtError,
      );

      setError(
        "Apex could not finish this workout. Please try again.",
      );
    } finally {
      setFinishing(false);
    }
  }

  if (debrief) {
    return (
      <section
        aria-live="polite"
        className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            <Trophy className="h-7 w-7" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Apex workout debrief
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              Workout complete
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Apex has saved your session and prepared your
              initial progression decisions.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DebriefStat
            icon={<Clock3 className="h-4 w-4" />}
            label="Duration"
            value={`${debrief.durationMinutes} min`}
          />

          <DebriefStat
            icon={<Dumbbell className="h-4 w-4" />}
            label="Completed sets"
            value={String(debrief.completedSets)}
          />

          <DebriefStat
            icon={<Gauge className="h-4 w-4" />}
            label="Training volume"
            value={`${debrief.totalTrainingVolumeKg} kg`}
          />

          <DebriefStat
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Exercises"
            value={`${debrief.completedExercises}/${debrief.totalExercises}`}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ProgressionStat
            label="Ready to increase"
            value={debrief.progressionReady}
          />

          <ProgressionStat
            label="Maintain"
            value={debrief.maintainCount}
          />

          <ProgressionStat
            label="Needs review"
            value={debrief.reviewCount}
          />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

          <p className="text-sm leading-6 text-slate-300">
            These progression decisions are an initial coaching
            estimate based on completion, effort, discomfort and
            technique confidence.
          </p>
        </div>
      </section>
    );
  }

  if (alreadyCompleted) {
    return (
      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <p className="font-black text-emerald-200">
          This workout is already complete.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
        Finish workout
      </p>

      <h2 className="mt-2 text-2xl font-black text-white">
        Ready to complete this session?
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Save your final effort rating and any notes before Apex
        creates your debrief.
      </p>

      <div className="mt-6">
        <label
          htmlFor="session-rpe"
          className="text-sm font-bold text-slate-200"
        >
          Overall session effort (RPE 1–10)
        </label>

        <input
          id="session-rpe"
          type="number"
          min="1"
          max="10"
          step="1"
          inputMode="numeric"
          value={sessionRpe}
          onChange={(event) =>
            setSessionRpe(event.target.value)
          }
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-base text-white"
          placeholder="Optional"
        />
      </div>

      <div className="mt-5">
        <label
          htmlFor="session-notes"
          className="text-sm font-bold text-slate-200"
        >
          Workout notes
        </label>

        <textarea
          id="session-notes"
          value={notes}
          maxLength={2000}
          rows={4}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white"
          placeholder="Optional notes about the overall session"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleFinish}
        disabled={finishing}
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircle2 className="h-5 w-5" />

        {finishing
          ? "Completing workout..."
          : "Complete workout"}
      </button>
    </section>
  );
}

function DebriefStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-emerald-300">
        {icon}

        <p className="text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 text-xl font-black text-white">
        {value}
      </p>
    </article>
  );
}

function ProgressionStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-center">
      <p className="text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
    </article>
  );
}
