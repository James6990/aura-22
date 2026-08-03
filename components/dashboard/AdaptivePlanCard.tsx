import {
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Gauge,
  HeartPulse,
  Sparkles,
} from "lucide-react";

import type {
  AdaptivePlan,
  AdaptivePlanDay,
} from "@/lib/planning/generate-adaptive-plan";

type AdaptivePlanCardProps = {
  plan: AdaptivePlan;
};

function DayIcon({
  type,
}: {
  type: AdaptivePlanDay["type"];
}) {
  if (type === "train") {
    return <Dumbbell className="h-4 w-4" />;
  }

  if (type === "recovery") {
    return <HeartPulse className="h-4 w-4" />;
  }

  if (type === "light") {
    return <Gauge className="h-4 w-4" />;
  }

  if (type === "conditioning") {
    return <Sparkles className="h-4 w-4" />;
  }

  return <CalendarDays className="h-4 w-4" />;
}

function getDayStyle(
  type: AdaptivePlanDay["type"],
) {
  if (type === "train") {
    return "border-emerald-500/20 bg-emerald-500/5 text-emerald-300";
  }

  if (type === "recovery") {
    return "border-cyan-500/20 bg-cyan-500/5 text-cyan-300";
  }

  if (type === "light") {
    return "border-amber-500/20 bg-amber-500/5 text-amber-300";
  }

  return "border-slate-800 bg-slate-950/70 text-slate-300";
}

export default function AdaptivePlanCard({
  plan,
}: AdaptivePlanCardProps) {
  return (
    <section className="rounded-3xl border border-violet-500/20 bg-slate-900/70 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
            This week with Apex
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {plan.headline}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            {plan.summary}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
            Planning confidence
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="text-xl font-black text-white">
              {plan.confidence.label}
            </span>

            <span className="pb-0.5 text-sm font-bold text-violet-300">
              {plan.confidence.score}%
            </span>
          </div>
        </div>
      </div>

      {plan.missedSessionsRedistributed && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

          <p className="text-sm leading-6 text-slate-300">
            Missed sessions were redistributed rather than stacked together. Nothing needs to be “caught up”.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plan.days.map((day) => (
          <article
            key={day.dayOffset}
            className={`rounded-2xl border p-4 ${getDayStyle(
              day.type,
            )}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <DayIcon type={day.type} />

                <p className="text-xs font-black uppercase tracking-wider">
                  {day.label}
                </p>
              </div>

              {day.optional && (
                <span className="rounded-full border border-current/20 px-2 py-1 text-[10px] font-bold uppercase">
                  Flexible
                </span>
              )}
            </div>

            <h3 className="mt-3 font-black text-white">
              {day.title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {day.reason}
            </p>
          </article>
        ))}
      </div>

      <details className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <summary className="cursor-pointer font-bold text-slate-200">
          How confident is Apex, and why?
        </summary>

        <div className="mt-3 space-y-2">
          {plan.confidence.reasons.map((reason) => (
            <p
              key={reason}
              className="text-sm leading-6 text-slate-400"
            >
              • {reason}
            </p>
          ))}
        </div>
      </details>
    </section>
  );
}
