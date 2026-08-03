import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";

import type { ReadinessResult } from "@/lib/readiness/calculate-readiness";

type ReadinessCardProps = {
  result: ReadinessResult;
  explanation: string;
};

export default function ReadinessCard({
  result,
  explanation,
}: ReadinessCardProps) {
  const Icon =
    result.level === "Low" || result.level === "Moderate"
      ? AlertCircle
      : CheckCircle2;

  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400">
            <Activity className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">
              Daily readiness
            </p>
          </div>

          <h2 className="mt-3 text-3xl font-black text-white">
            {result.score}%
          </h2>

          <p className="mt-1 text-sm font-bold text-slate-300">
            {result.level} readiness
          </p>
        </div>

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
          <Icon className="h-6 w-6 text-emerald-400" />
        </div>
      </div>

      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-label="Daily readiness score"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={result.score}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
          style={{ width: `${result.score}%` }}
        />
      </div>

      <p className="mt-5 text-sm leading-6 text-slate-400">
        {explanation}
      </p>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        Readiness is a personalised planning estimate, not a medical
        assessment.
      </p>
    </article>
  );
}
