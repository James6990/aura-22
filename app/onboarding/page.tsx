"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

type Goal =
  | "muscle"
  | "fat-loss"
  | "recomposition"
  | "performance"
  | "health";

const goals: Array<{
  value: Goal;
  title: string;
  description: string;
}> = [
  {
    value: "muscle",
    title: "Build muscle",
    description: "Increase strength and lean mass.",
  },
  {
    value: "fat-loss",
    title: "Lose body fat",
    description: "Create sustainable nutrition and activity habits.",
  },
  {
    value: "recomposition",
    title: "Body recomposition",
    description: "Build muscle while gradually reducing body fat.",
  },
  {
    value: "performance",
    title: "Improve performance",
    description: "Develop strength, speed or endurance.",
  },
  {
    value: "health",
    title: "Health and vitality",
    description: "Improve movement, energy and consistency.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<Goal | null>(null);

  const totalSteps = 3;
  const progress = Math.round((step / totalSteps) * 100);

  const canContinue =
    step === 1 ||
    (step === 2 && name.trim().length > 0) ||
    (step === 3 && goal !== null);

  function nextStep() {
    if (!canContinue) return;
    setStep((current) => Math.min(current + 1, totalSteps));
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 1));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 font-black text-slate-950">
                AX
              </div>

              <div>
                <p className="font-black text-white">APEX OS</p>
                <p className="text-xs text-slate-400">
                  Performance Genome setup
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-400">
              Step {step} of {totalSteps}
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-slate-800"
            aria-label={`Onboarding progress: ${progress}%`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 sm:p-9">
          {step === 1 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10">
                <Sparkles className="h-9 w-9 text-emerald-400" />
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Welcome to Apex
              </p>

              <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                Build your
                <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Performance Genome
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-300">
                Apex will adapt fitness, nutrition and recovery guidance around
                your goals, preferences and daily feedback.
              </p>

              <div className="mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
                {[
                  "Personalised guidance",
                  "Accessible by default",
                  "Adapts over time",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-left text-xs font-semibold"
                  >
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                About you
              </p>

              <h1 className="mt-2 text-3xl font-black text-white">
                What should Apex call you?
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                This will personalise your dashboard and coaching experience.
              </p>

              <label
                htmlFor="preferred-name"
                className="mt-8 block text-sm font-semibold"
              >
                Preferred name
              </label>

              <input
                id="preferred-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your name"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />

              <p className="mt-4 text-xs leading-6 text-slate-400">
                Apex only uses personal information you choose to provide.
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Your primary goal
              </p>

              <h1 className="mt-2 text-3xl font-black text-white">
                What would you most like to achieve?
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                You can update this whenever your priorities change.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {goals.map((option) => {
                  const selected = goal === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGoal(option.value)}
                      aria-pressed={selected}
                      className={`min-h-24 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-emerald-400 bg-emerald-500/10"
                          : "border-slate-800 bg-slate-950/70 hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-bold text-white">
                            {option.title}
                          </h2>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {option.description}
                          </p>
                        </div>

                        {selected && (
                          <Check className="h-5 w-5 shrink-0 text-emerald-400" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {goal && (
                <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs leading-6 text-slate-300">
                  Apex will use this as the starting point for your first
                  personalised plan.
                </div>
              )}
            </div>
          )}

          <footer className="mt-9 flex items-center justify-between border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={previousStep}
              disabled={step === 1}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-bold disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={nextStep}
              disabled={!canContinue || step === totalSteps}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-black text-slate-950 disabled:opacity-40"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}
