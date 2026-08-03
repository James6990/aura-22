"use client";

import { useState } from "react";
import { Play } from "lucide-react";

import { startWorkoutSession } from "@/app/actions/workout-session";

type StartWorkoutButtonProps = {
  title: string;
  intensity: string;
  plannedDurationMinutes: number;
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    reps: string;
  }>;
};

export default function StartWorkoutButton({
  title,
  intensity,
  plannedDurationMinutes,
  exercises,
}: StartWorkoutButtonProps) {
  const [starting, setStarting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");

  async function handleStart() {
    if (starting || sessionId) return;

    setStarting(true);
    setError("");

    try {
      const result = await startWorkoutSession({
        title,
        intensity,
        plannedDurationMinutes,
        exercises,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSessionId(result.sessionId);
    } catch (caughtError) {
      console.error("Failed to start workout:", caughtError);

      setError(
        "Apex could not start this workout. Please try again.",
      );
    } finally {
      setStarting(false);
    }
  }

  if (sessionId) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4"
      >
        <p className="font-black text-emerald-200">
          Workout started
        </p>

        <p className="mt-1 text-sm text-emerald-100/70">
          Your planned session and exercises are now saved.
        </p>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div
          role="alert"
          className="mb-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleStart}
        disabled={starting || exercises.length === 0}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Play className="h-5 w-5" />

        {starting ? "Starting workout..." : "Start workout"}
      </button>
    </div>
  );
}
