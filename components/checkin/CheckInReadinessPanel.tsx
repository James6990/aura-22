"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { saveDailyCheckIn } from "@/app/actions/daily-check-in";
import ReadinessCard from "@/components/dashboard/ReadinessCard";
import {
  calculateReadiness,
  type ReadinessResult,
} from "@/lib/readiness/calculate-readiness";

type SavedCheckIn = {
  energy: number;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
  readinessScore: number;
  readinessLevel: string;
};

type CheckInReadinessPanelProps = {
  initialCheckIn?: SavedCheckIn | null;
};

function isReadinessLevel(
  value: string,
): value is ReadinessResult["level"] {
  return ["Low", "Moderate", "High", "Peak"].includes(value);
}

function getExplanation(level: ReadinessResult["level"]) {
  if (level === "Peak") {
    return "Your check-in suggests you are ready for a demanding session.";
  }

  if (level === "High") {
    return "Your check-in suggests good readiness for your planned training.";
  }

  if (level === "Moderate") {
    return "Consider a controlled session and avoid unnecessary fatigue.";
  }

  return "Prioritise recovery and consider reducing today's training load.";
}

export default function CheckInReadinessPanel({
  initialCheckIn = null,
}: CheckInReadinessPanelProps) {
  const router = useRouter();

  const [energy, setEnergy] = useState(
    initialCheckIn?.energy ?? 7,
  );

  const [workout, setWorkout] = useState(
    initialCheckIn?.workoutCompleted ?? false,
  );

  const [recovery, setRecovery] = useState(
    initialCheckIn?.recoveryCompleted ?? false,
  );

  const [water, setWater] = useState(
    initialCheckIn?.hydrationTargetReached ?? false,
  );

  const [submitted, setSubmitted] = useState(
    initialCheckIn !== null,
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const calculatedReadiness = calculateReadiness({
    energy,
    workout,
    recovery,
    water,
  });

  const savedLevel =
    initialCheckIn &&
    isReadinessLevel(initialCheckIn.readinessLevel)
      ? initialCheckIn.readinessLevel
      : calculatedReadiness.level;

  const readiness: ReadinessResult =
    submitted && initialCheckIn
      ? {
          score: initialCheckIn.readinessScore,
          level: savedLevel,
        }
      : calculatedReadiness;

  async function handleCalculate() {
    if (saving) return;

    setSaving(true);
    setSaveError("");

    try {
      const result = await saveDailyCheckIn({
        energy,
        workoutCompleted: workout,
        recoveryCompleted: recovery,
        hydrationTargetReached: water,
        readinessScore: calculatedReadiness.score,
        readinessLevel: calculatedReadiness.level,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setSubmitted(true);
      router.refresh();
    } catch (error) {
      console.error("Failed to save daily check-in:", error);

      setSaveError(
        "Apex could not save today's check-in. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  function markChanged() {
    setSubmitted(false);
    setSaveError("");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Daily check-in
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          How are you feeling today?
        </h2>

        {initialCheckIn && (
          <p className="mt-2 text-sm text-emerald-300">
            Today&apos;s saved check-in has been restored.
          </p>
        )}

        <div className="mt-7">
          <label
            htmlFor="energy"
            className="text-sm font-bold text-slate-200"
          >
            Energy: {energy}/10
          </label>

          <input
            id="energy"
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(event) => {
              setEnergy(Number(event.target.value));
              markChanged();
            }}
            className="mt-3 w-full"
          />
        </div>

        <div className="mt-7 space-y-3">
          <CheckInToggle
            label="Workout completed"
            checked={workout}
            onChange={() => {
              setWorkout((current) => !current);
              markChanged();
            }}
          />

          <CheckInToggle
            label="Recovery completed"
            checked={recovery}
            onChange={() => {
              setRecovery((current) => !current);
              markChanged();
            }}
          />

          <CheckInToggle
            label="Hydration target reached"
            checked={water}
            onChange={() => {
              setWater((current) => !current);
              markChanged();
            }}
          />
        </div>

        {saveError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          >
            {saveError}
          </div>
        )}

        <button
          type="button"
          onClick={handleCalculate}
          disabled={saving}
          className="mt-7 min-h-12 w-full rounded-xl bg-emerald-500 px-5 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving check-in..."
            : initialCheckIn
              ? "Update today's readiness"
              : "Calculate readiness"}
        </button>
      </article>

      {submitted ? (
        <ReadinessCard
          result={readiness}
          explanation={getExplanation(readiness.level)}
        />
      ) : (
        <article className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
          <div>
            <p className="font-bold text-white">
              Your updated readiness will appear here
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Save today&apos;s check-in to update your planning estimate.
            </p>
          </div>
        </article>
      )}
    </section>
  );
}

function CheckInToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-4 text-left text-sm font-bold transition ${
        checked
          ? "border-emerald-400 bg-emerald-500/10 text-white"
          : "border-slate-700 bg-slate-950 text-slate-300"
      }`}
    >
      {label}

      <span
        className={`h-5 w-5 rounded-md border ${
          checked
            ? "border-emerald-400 bg-emerald-400"
            : "border-slate-600"
        }`}
      />
    </button>
  );
}
