"use client";

import { useState } from "react";

import ReadinessCard from "@/components/dashboard/ReadinessCard";
import { calculateReadiness } from "@/lib/readiness/calculate-readiness";

export default function CheckInReadinessPanel() {
  const [energy, setEnergy] = useState(7);
  const [workout, setWorkout] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [water, setWater] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const readiness = calculateReadiness({
    energy,
    workout,
    recovery,
    water,
  });

  const explanation =
    readiness.level === "Peak"
      ? "Your check-in suggests you are ready for a demanding session."
      : readiness.level === "High"
        ? "Your check-in suggests good readiness for your planned training."
        : readiness.level === "Moderate"
          ? "Consider a controlled session and avoid unnecessary fatigue."
          : "Prioritise recovery and consider reducing today's training load.";

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Daily check-in
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          How are you feeling today?
        </h2>

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
              setSubmitted(false);
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
              setSubmitted(false);
            }}
          />

          <CheckInToggle
            label="Recovery completed"
            checked={recovery}
            onChange={() => {
              setRecovery((current) => !current);
              setSubmitted(false);
            }}
          />

          <CheckInToggle
            label="Hydration target reached"
            checked={water}
            onChange={() => {
              setWater((current) => !current);
              setSubmitted(false);
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="mt-7 min-h-12 w-full rounded-xl bg-emerald-500 px-5 font-black text-slate-950 transition hover:bg-emerald-400"
        >
          Calculate readiness
        </button>
      </article>

      {submitted ? (
        <ReadinessCard
          result={readiness}
          explanation={explanation}
        />
      ) : (
        <article className="flex min-h-72 items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/30 p-6 text-center">
          <div>
            <p className="font-bold text-white">
              Your readiness result will appear here
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Complete today&apos;s check-in to receive your planning estimate.
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
