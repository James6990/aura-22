"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  CirclePause,
  Clock3,
  Dumbbell,
  Gauge,
  ListChecks,
  Sparkles,
  Trophy,
} from "lucide-react";

import {
  completeWorkoutSession,
  type WorkoutDebrief,
} from "@/app/actions/workout-session";
import type {
  WorkoutCompletionMode,
  WorkoutSessionStatus,
} from "@/lib/workout/workout-session-lifecycle";

type FinishWorkoutPanelProps = {
  sessionId: string;

  sessionStatus:
    WorkoutSessionStatus;

  alreadyCompleted: boolean;
  canFinishNormally: boolean;

  completedExercises: number;
  skippedExercises: number;
  unresolvedExercises: number;
  totalExercises: number;

  onCompleted?: () => void;
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

export default function FinishWorkoutPanel({
  sessionId,
  sessionStatus,
  alreadyCompleted,
  canFinishNormally,
  completedExercises,
  skippedExercises,
  unresolvedExercises,
  totalExercises,
  onCompleted,
}: FinishWorkoutPanelProps) {
  const router =
    useRouter();

  const [
    completionMode,
    setCompletionMode,
  ] = useState<
    WorkoutCompletionMode
  >("normal");

  const [
    earlyFinishExpanded,
    setEarlyFinishExpanded,
  ] = useState(false);

  const [
    finishReason,
    setFinishReason,
  ] = useState("");

  const [
    sessionRpe,
    setSessionRpe,
  ] = useState("");

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    finishing,
    setFinishing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    debrief,
    setDebrief,
  ] = useState<
    WorkoutDebrief | null
  >(null);

  const workoutStarted =
    sessionStatus !== "ready";

  const canFinishEarly =
    workoutStarted &&
    sessionStatus !==
      "completed" &&
    (
      completedExercises > 0 ||
      unresolvedExercises > 0 ||
      skippedExercises > 0
    );

  useEffect(() => {
    if (!debrief) {
      return;
    }

    const redirectTimer =
      window.setTimeout(
        () => {
          router.replace(
            "/dashboard",
          );

          router.refresh();
        },
        4000,
      );

    return () => {
      window.clearTimeout(
        redirectTimer,
      );
    };
  }, [
    debrief,
    router,
  ]);

  async function handleFinish(
    requestedMode:
      WorkoutCompletionMode,
  ) {
    if (
      finishing ||
      alreadyCompleted ||
      debrief
    ) {
      return;
    }

    if (
      requestedMode ===
        "normal" &&
      !canFinishNormally
    ) {
      setError(
        `${unresolvedExercises} exercise${
          unresolvedExercises === 1
            ? ""
            : "s"
        } still ${
          unresolvedExercises === 1
            ? "needs"
            : "need"
        } to be completed or skipped.`,
      );

      return;
    }

    const resolvedFinishReason =
      finishReason.trim();

    if (
      requestedMode ===
        "early" &&
      !resolvedFinishReason
    ) {
      setError(
        "Add a brief reason before ending the workout early.",
      );

      return;
    }

    setCompletionMode(
      requestedMode,
    );

    setFinishing(true);
    setError("");

    try {
      const result =
        await completeWorkoutSession({
          sessionId,

          sessionRpe:
            sessionRpe.trim() ===
            ""
              ? null
              : Number(
                  sessionRpe,
                ),

          notes,

          completionMode:
            requestedMode,

          finishReason:
            requestedMode ===
            "early"
              ? resolvedFinishReason
              : undefined,
        });

      if (!result.success) {
        setError(
          result.error,
        );

        return;
      }

      setDebrief(
        result.debrief,
      );

      onCompleted?.();
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
              {debrief.completionMode ===
              "early"
                ? "Workout saved safely"
                : "Workout complete"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {debrief.completionMode ===
              "early"
                ? "Apex recorded the completed work and preserved the remaining session context without treating the adaptation as failure."
                : "Apex saved the resolved session and prepared its initial progression decisions."}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DebriefStat
            icon={
              <Clock3 className="h-4 w-4" />
            }
            label="Active time"
            value={formatDuration(
              debrief.activeDurationSeconds,
            )}
          />

          <DebriefStat
            icon={
              <CirclePause className="h-4 w-4" />
            }
            label="Paused time"
            value={formatDuration(
              debrief.pausedDurationSeconds,
            )}
          />

          <DebriefStat
            icon={
              <Dumbbell className="h-4 w-4" />
            }
            label="Completed sets"
            value={String(
              debrief.completedSets,
            )}
          />

          <DebriefStat
            icon={
              <Gauge className="h-4 w-4" />
            }
            label="Training volume"
            value={`${debrief.totalTrainingVolumeKg} kg`}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DebriefStat
            icon={
              <CheckCircle2 className="h-4 w-4" />
            }
            label="Completed"
            value={String(
              debrief.completedExercises,
            )}
          />

          <DebriefStat
            icon={
              <ListChecks className="h-4 w-4" />
            }
            label="Skipped"
            value={String(
              debrief.skippedExercises,
            )}
          />

          <DebriefStat
            icon={
              <AlertTriangle className="h-4 w-4" />
            }
            label="Unresolved"
            value={String(
              debrief.unresolvedExercises,
            )}
          />

          <DebriefStat
            icon={
              <CirclePause className="h-4 w-4" />
            }
            label="Pauses"
            value={String(
              debrief.pauseCount,
            )}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <ProgressionStat
            label="Ready to increase"
            value={
              debrief.progressionReady
            }
          />

          <ProgressionStat
            label="Maintain"
            value={
              debrief.maintainCount
            }
          />

          <ProgressionStat
            label="Needs review"
            value={
              debrief.reviewCount
            }
          />
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

          <p className="text-sm leading-6 text-slate-300">
            Progression decisions use completed exercises only. Skipped,
            partial and unresolved movements remain contextual evidence
            rather than automatic negative evidence.
          </p>
        </div>

        <p className="mt-5 text-center text-sm font-bold text-emerald-200">
          Returning to your dashboard...
        </p>
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

  if (!workoutStarted) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Finish workout
        </p>

        <h2 className="mt-2 text-xl font-black text-white">
          Start the session first
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Final effort, notes and debrief controls become available after
          the workout begins.
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
        Save this session
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        Complete the workout normally after every exercise is resolved,
        or save it early with context when the session needs to end.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <ProgressionStat
          label="Completed"
          value={
            completedExercises
          }
        />

        <ProgressionStat
          label="Skipped"
          value={
            skippedExercises
          }
        />

        <ProgressionStat
          label="Unresolved"
          value={
            unresolvedExercises
          }
        />
      </div>

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
          value={
            sessionRpe
          }
          onChange={(
            event,
          ) => {
            setSessionRpe(
              event.target.value,
            );

            setError("");
          }}
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
          value={
            notes
          }
          maxLength={2000}
          rows={4}
          onChange={(
            event,
          ) => {
            setNotes(
              event.target.value,
            );

            setError("");
          }}
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
        onClick={() =>
          handleFinish(
            "normal",
          )
        }
        disabled={
          finishing ||
          !canFinishNormally
        }
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircle2 className="h-5 w-5" />

        {finishing &&
        completionMode ===
          "normal"
          ? "Completing workout..."
          : canFinishNormally
            ? "Complete workout"
            : `Resolve ${unresolvedExercises} remaining`}
      </button>

      <button
        type="button"
        onClick={() => {
          setEarlyFinishExpanded(
            (current) =>
              !current,
          );

          setError("");
        }}
        disabled={
          finishing ||
          !canFinishEarly
        }
        aria-expanded={
          earlyFinishExpanded
        }
        className="mt-3 min-h-12 w-full rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 font-black text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        End workout early
      </button>

      {earlyFinishExpanded && (
        <section className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />

            <div>
              <p className="font-black text-amber-100">
                Save an adapted session
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Ending early preserves completed work. Apex records the
                context without automatically treating the session as poor
                adherence or reduced ability.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label
              htmlFor="early-finish-reason"
              className="text-sm font-bold text-slate-200"
            >
              Why are you ending early?
            </label>

            <textarea
              id="early-finish-reason"
              value={
                finishReason
              }
              maxLength={500}
              rows={3}
              onChange={(
                event,
              ) => {
                setFinishReason(
                  event.target.value,
                );

                setError("");
              }}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white"
              placeholder="Example: limited time, fatigue, equipment issue or discomfort"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setEarlyFinishExpanded(
                  false,
                );

                setError("");
              }}
              disabled={
                finishing
              }
              className="min-h-12 rounded-xl border border-slate-700 bg-slate-950 px-5 font-black text-slate-300 disabled:opacity-50"
            >
              Continue workout
            </button>

            <button
              type="button"
              onClick={() =>
                handleFinish(
                  "early",
                )
              }
              disabled={
                finishing ||
                !finishReason.trim()
              }
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AlertTriangle className="h-5 w-5" />

              {finishing &&
              completionMode ===
                "early"
                ? "Saving workout..."
                : "Confirm early finish"}
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

function DebriefStat({
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
      <div className="flex items-center gap-2 text-emerald-300">
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

function ProgressionStat({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
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
